import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Activity, Zap, Power, Play, Settings } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';
import Map from './Map';
import Gauge from './Gauge';
import { PLANTS_DATA, getInitialPlantStatuses } from './plantsData';

// Mock initial data
const initialChartData = Array.from({ length: 50 }, (_, i) => ({
  time: i * 0.1,
  frequency: 50.0,
  rocof: 0.0
}));

// Initial nominal generation values extracted from Sri_Lanka_FINAL_Set_point.m
const initialPlantGeneration = {
  LAK: 300, 
  SAM: 60, 
  UTH: 8, 
  RAN: 63, 
  RTB: 26, 
  BWT: 40, 
  UKU: 20,
  MAN: 100, 
  MAD: 100, 
  LAU: 20, 
  SOC: 12.6, 
  YUGA: 100, 
  NLX: 50, 
  POL: 45,
  UPP: 10, 
  CAN: 30, 
  WIM: 25, 
  BRO: 17.5, 
  UMA: 60, 
  KUK: 40, 
  VIC: 70,
  KOT: 67, 
  UKT: 83, 
  BAR: 15,
  // Multi-unit plants
  KEL_UNIT1: 20, KEL_UNIT2: 115, KEL_UNIT3: 165,
  SOBA_GT: 220, SOBA_ST: 130,
  OLX_1: 12.5, OLX_2: 8.33,
  SAP_A: 20, SAP_B: 10
};

const Dashboard = () => {
  const [solarPct, setSolarPct] = useState(15);
  const [windPct, setWindPct] = useState(10);
  const [evLoadMW, setEvLoadMW] = useState(50);
  const [plantStatuses, setPlantStatuses] = useState(getInitialPlantStatuses());
  const [plantSetpoints, setPlantSetpoints] = useState({ ...initialPlantGeneration });
  const [configPlantId, setConfigPlantId] = useState(null);
  
  const [chartData, setChartData] = useState(initialChartData);
  const [metrics, setMetrics] = useState({
    systemFrequency: 50.00,
    rocof: 0.00,
    nadir: 50.00,
    settlingTime: 0.00,
    status: 'NORMAL' // NORMAL, WARNING, CRITICAL, COLLAPSE
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Zooming state
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [xAxisDomain, setXAxisDomain] = useState(['dataMin', 'dataMax']);
  const [yAxisDomainFreq, setYAxisDomainFreq] = useState([(dataMin) => Math.min(dataMin, 49.4), (dataMax) => Math.max(dataMax, 50.1)]);
  const [yAxisDomainRocof, setYAxisDomainRocof] = useState(['auto', 'auto']);

  const getPlantGeneration = (plantId) => {
    if (!plantStatuses[plantId]) return 0;
    const plant = PLANTS_DATA.find(p => p.id === plantId);
    if (plant && plant.subUnits) {
      return parseFloat(plant.subUnits.reduce((sum, u) => sum + (plantSetpoints[u.id] || 0), 0).toFixed(2));
    }
    return plantSetpoints[plantId] ?? 0;
  };

  const handleSetpointChange = (id, value) => {
    setPlantSetpoints(prev => ({
      ...prev,
      [id]: parseFloat(value) || 0
    }));
  };

  const getAxisYDomain = (from, to, ref, offset) => {
    const refData = chartData.filter(d => d.time >= from && d.time <= to);
    if (refData.length === 0) return ['auto', 'auto'];
    let min = Math.min(...refData.map(d => d[ref]));
    let max = Math.max(...refData.map(d => d[ref]));
    return [min - offset, max + offset];
  };

  const zoom = () => {
    let left = refAreaLeft;
    let right = refAreaRight;
    
    if (left === right || right === '') {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }
    
    if (left > right) [left, right] = [right, left];

    const [freqBottom, freqTop] = getAxisYDomain(left, right, 'frequency', 0.05);
    const [rocofBottom, rocofTop] = getAxisYDomain(left, right, 'rocof', 0.1);

    setRefAreaLeft('');
    setRefAreaRight('');
    setXAxisDomain([left, right]);
    setYAxisDomainFreq([freqBottom, freqTop]);
    setYAxisDomainRocof([rocofBottom, rocofTop]);
  };

  const zoomOut = () => {
    setXAxisDomain(['dataMin', 'dataMax']);
    setYAxisDomainFreq([(dataMin) => Math.min(dataMin, 49.4), (dataMax) => Math.max(dataMax, 50.1)]);
    setYAxisDomainRocof(['auto', 'auto']);
  };

  const togglePlantStatus = (plantId) => {
    setPlantStatuses(prev => ({
      ...prev,
      [plantId]: !prev[plantId]
    }));
  };

  const resetDashboard = () => {
    setSolarPct(15);
    setWindPct(10);
    setEvLoadMW(50);
    setPlantStatuses(getInitialPlantStatuses());
    setPlantSetpoints({ ...initialPlantGeneration });
    setChartData(initialChartData);
    setMetrics({
      systemFrequency: 50.00,
      rocof: 0.00,
      nadir: 50.00,
      settlingTime: 0.00,
      status: 'NORMAL'
    });
    zoomOut();
  };

  const applyDisturbance = async () => {
    setIsLoading(true);
    try {
      // Call the FastAPI backend
      const response = await axios.post('http://localhost:8000/api/simulate', {
        solar_pct: solarPct,
        wind_pct: windPct,
        ev_load_mw: evLoadMW,
        disturbance_type: 'load_disturbance',
        plants_status: plantStatuses,
        plants_setpoints: plantSetpoints
      });
      
      const { time_series, metrics: newMetrics } = response.data;
      
      // Update chart
      const formattedData = time_series.time.map((t, idx) => {
        const f = time_series.frequency && time_series.frequency[idx] !== undefined ? time_series.frequency[idx] : 50.0;
        const r = time_series.rocof && time_series.rocof[idx] !== undefined ? time_series.rocof[idx] : 0.0;
        return {
          time: parseFloat(t.toFixed(2)),
          frequency: parseFloat(f.toFixed(4)),
          rocof: parseFloat(r.toFixed(4))
        };
      });
      setChartData(formattedData);
      
      // Update metrics
      setMetrics(newMetrics);
      zoomOut();
      
    } catch (error) {
      console.error("Simulation failed:", error);
      // Fallback/Mock behavior if backend fails/isn't ready
      simulateMockDisturbance();
    } finally {
      setIsLoading(false);
    }
  };

  const simulateMockDisturbance = () => {
    let currentFreq = 50.0;
    const newData = [];
    let nadir = 50.0;
    
    // Simulate drop based on inputs
    const disconnectedPlants = Object.values(plantStatuses).filter(s => !s).length;
    const severity = (evLoadMW / 500) + (solarPct / 100) * 0.5 + 0.8 + (disconnectedPlants * 0.1);
    
    for (let i = 0; i <= 100; i++) {
      const t = i * 0.1;
      let rocof_val = 0;
      if (t < 1) {
        newData.push({ time: t, frequency: 50.0, rocof: 0 });
      } else if (t < 4) {
        // Drop
        currentFreq -= (severity * 0.15);
        if (currentFreq < nadir) nadir = currentFreq;
        rocof_val = - (severity * 1.5);
        newData.push({ time: t, frequency: currentFreq, rocof: rocof_val });
      } else {
        // Recovery
        if (nadir <= 49.5) {
             // System collapses, no recovery
             currentFreq -= 0.1; 
             rocof_val = -0.5;
        } else {
             const rec = (50.0 - currentFreq) * 0.1;
             currentFreq += rec;
             rocof_val = rec;
        }
        newData.push({ time: t, frequency: currentFreq, rocof: rocof_val });
      }
    }
    
    let status = 'NORMAL';
    if (nadir <= 49.5) {
      status = 'COLLAPSE';
    } else if (nadir < 49.8) {
      status = 'WARNING';
    }
    
    setChartData(newData);
    setMetrics({
      systemFrequency: currentFreq.toFixed(4),
      rocof: (severity * 1.5).toFixed(4),
      nadir: nadir.toFixed(4),
      settlingTime: nadir <= 49.5 ? 'N/A' : (4 + severity * 2).toFixed(2),
      status: status
    });
    zoomOut();
  };

  return (
    <div className="dashboard-container">
      {/* LEFT PANEL - Controls */}
      <div className="glass-panel left-panel">
        <div className="header">
          <h1>FutureGrid-SL</h1>
          <p>System Operator Dashboard</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button 
            className={`action-btn ${isLoading ? 'loading' : ''}`}
            onClick={applyDisturbance}
            disabled={isLoading}
            style={{ flex: 2, margin: 0 }}
          >
            {isLoading ? 'Simulating...' : 'Apply Disturbance'}
          </button>
          
          <button 
            className="action-btn"
            onClick={resetDashboard}
            disabled={isLoading}
            style={{ flex: 1, margin: 0, background: 'linear-gradient(135deg, #475569, #334155)', color: '#f8fafc' }}
          >
            Reset
          </button>
        </div>

        <div className="control-group">
          <h3><Settings size={18} /> Grid Parameters</h3>
          
          <div className="slider-container">
            <div className="slider-header">
              <span>Solar PV Generation</span>
              <span className="slider-value">{solarPct}%</span>
            </div>
            <input 
              type="range" min="0" max="100" 
              value={solarPct} onChange={(e) => setSolarPct(parseInt(e.target.value))} 
            />
          </div>

          <div className="slider-container">
            <div className="slider-header">
              <span>Wind Generation</span>
              <span className="slider-value">{windPct}%</span>
            </div>
            <input 
              type="range" min="0" max="100" 
              value={windPct} onChange={(e) => setWindPct(parseInt(e.target.value))} 
            />
          </div>

          <div className="slider-container">
            <div className="slider-header">
              <span>EV Charging Load (MW)</span>
              <span className="slider-value">{evLoadMW} MW</span>
            </div>
            <input 
              type="range" min="0" max="500" step="10"
              value={evLoadMW} onChange={(e) => setEvLoadMW(parseInt(e.target.value))} 
            />
          </div>
        </div>



        <div className="control-group">
          <h3><Power size={18} /> Grid Assets (28 Plants)</h3>
          <div className="plants-list" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
            {PLANTS_DATA.map(plant => (
              <div key={plant.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                <div onClick={() => plantStatuses[plant.id] && setConfigPlantId(plant.id)} style={{ cursor: plantStatuses[plant.id] ? 'pointer' : 'default' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: plantStatuses[plant.id] ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {plant.name} <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{getPlantGeneration(plant.id)} MW</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{plant.type}</div>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={plantStatuses[plant.id]} 
                    onChange={() => togglePlantStatus(plant.id)} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CENTER PANEL - Map */}
      <div className="glass-panel center-panel" style={{ background: 'var(--bg-color)', padding: 0 }}>
        <div className="map-overlay glass-panel">
          <h2>Sri Lanka Grid Map</h2>
          <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>Live Generation Assets Status</p>
        </div>
        <Map plantStatuses={plantStatuses} onConfigClick={setConfigPlantId} />
      </div>

      {/* RIGHT PANEL - Metrics & Charts & Table */}
      <div className="glass-panel right-panel">
        <div className="gauges-container">
          <Gauge value={metrics.systemFrequency} label="System Frequency" unit="Hz" min={49.0} max={51.0} size="large" color={metrics.status === 'COLLAPSE' ? '#ef4444' : '#eab308'} />
          <div className="small-gauges">
            <Gauge value={metrics.rocof} label="RoCoF" unit="Hz/s" min={-2.0} max={2.0} size="small" color="#06b6d4" />
            <Gauge value={metrics.nadir} label="Frequency Nadir" unit="Hz" min={49.0} max={50.0} size="small" color={metrics.nadir <= 49.5 ? '#ef4444' : '#94a3b8'} />
            <Gauge value={metrics.settlingTime} label="Settling Time" unit="s" min={0} max={60} size="small" color="#94a3b8" />
          </div>
        </div>

        <div className="glass-panel chart-container" style={{ minHeight: '180px', userSelect: 'none' }}>
          <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3><Activity size={16} style={{verticalAlign: 'middle', marginRight: '5px'}}/> Frequency Response</h3>
            {xAxisDomain[0] !== 'dataMin' && (
              <button onClick={zoomOut} style={{ padding: '2px 8px', fontSize: '0.75rem', background: '#334155', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
                Zoom Out
              </button>
            )}
          </div>
          <p style={{fontSize: '0.7rem', color: '#94a3b8', marginTop: '-5px', marginBottom: '5px'}}>Click and drag on the chart to zoom in.</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart 
              data={chartData} 
              margin={{ top: 5, right: 5, left: -20, bottom: 5 }} 
              syncId="timeSync"
              onMouseDown={(e) => e && setRefAreaLeft(e.activeLabel)}
              onMouseMove={(e) => e && refAreaLeft && setRefAreaRight(e.activeLabel)}
              onMouseUp={zoom}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 10}} domain={xAxisDomain} type="number" allowDataOverflow />
              <YAxis domain={yAxisDomainFreq} stroke="#94a3b8" tick={{fontSize: 10}} allowDataOverflow />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#06b6d4' }}
              />
              {/* Total Collapse Zone <= 49.5 */}
              <ReferenceArea y1={0.0} y2={49.5} fill="rgba(239, 68, 68, 0.2)" />
              <Line type="monotone" dataKey="frequency" stroke="#eab308" strokeWidth={2} dot={false} isAnimationActive={false} />
              {refAreaLeft && refAreaRight ? (
                <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="rgba(6, 182, 212, 0.2)" />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel chart-container" style={{ minHeight: '180px', userSelect: 'none' }}>
          <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3><Activity size={16} style={{verticalAlign: 'middle', marginRight: '5px'}}/> RoCoF Over Time</h3>
            {xAxisDomain[0] !== 'dataMin' && (
              <button onClick={zoomOut} style={{ padding: '2px 8px', fontSize: '0.75rem', background: '#334155', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
                Zoom Out
              </button>
            )}
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart 
              data={chartData} 
              margin={{ top: 5, right: 5, left: -20, bottom: 5 }} 
              syncId="timeSync"
              onMouseDown={(e) => e && setRefAreaLeft(e.activeLabel)}
              onMouseMove={(e) => e && refAreaLeft && setRefAreaRight(e.activeLabel)}
              onMouseUp={zoom}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 10}} domain={xAxisDomain} type="number" allowDataOverflow />
              <YAxis domain={yAxisDomainRocof} stroke="#94a3b8" tick={{fontSize: 10}} allowDataOverflow />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#ef4444' }}
              />
              <Line type="monotone" dataKey="rocof" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
              {refAreaLeft && refAreaRight ? (
                <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="rgba(6, 182, 212, 0.2)" />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* BOTTOM PANEL - Status */}
      <div className={`glass-panel bottom-panel ${metrics.status === 'COLLAPSE' ? 'collapse-banner' : ''}`}>
        <div className={`alert-banner ${metrics.status.toLowerCase()}`} style={{ width: '100%', justifyContent: 'center' }}>
          <strong>
            {metrics.status === 'NORMAL' && "SYSTEM NORMAL: Frequency and Inertia within safe limits."}
            {metrics.status === 'WARNING' && "WARNING: High RoCoF Detected. Low System Inertia. Implement Fast Frequency Response Plan."}
            {metrics.status === 'COLLAPSE' && "CRITICAL ALERT: TOTAL SYSTEM COLLAPSE (Nadir < 49.5 Hz). Initiate Black Start Protocol."}
          </strong>
        </div>
        <div style={{color: metrics.status === 'COLLAPSE' ? '#fff' : 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px'}}>
          <Play size={14} /> Backend Connection: {isLoading ? 'SIMULATING' : 'IDLE'}
        </div>
      </div>

      {/* Asset Config Modal */}
      {configPlantId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '350px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: 0, color: 'var(--accent-blue)' }}>
              Configure {PLANTS_DATA.find(p => p.id === configPlantId)?.name}
            </h3>
            
            {PLANTS_DATA.find(p => p.id === configPlantId)?.subUnits ? (
              PLANTS_DATA.find(p => p.id === configPlantId).subUnits.map(unit => (
                <div key={unit.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.9rem' }}>{unit.name} (MW):</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="500" 
                      step="0.1"
                      value={plantSetpoints[unit.id] || 0} 
                      onChange={(e) => handleSetpointChange(unit.id, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && setConfigPlantId(null)}
                      style={{ width: '80px', padding: '5px', borderRadius: '4px', border: '1px solid #475569', background: 'rgba(15, 23, 42, 0.8)', color: '#fff' }}
                    />
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="500" 
                    step="0.1"
                    value={plantSetpoints[unit.id] || 0} 
                    onChange={(e) => handleSetpointChange(unit.id, e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              ))
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label>Set Point (MW):</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="500" 
                    step="0.1"
                    value={plantSetpoints[configPlantId] || 0} 
                    onChange={(e) => handleSetpointChange(configPlantId, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && setConfigPlantId(null)}
                    style={{ width: '80px', padding: '5px', borderRadius: '4px', border: '1px solid #475569', background: 'rgba(15, 23, 42, 0.8)', color: '#fff' }}
                  />
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  step="0.1"
                  value={plantSetpoints[configPlantId] || 0} 
                  onChange={(e) => handleSetpointChange(configPlantId, e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            )}
            
            <button 
              className="action-btn" 
              onClick={() => setConfigPlantId(null)}
              style={{ margin: 0, marginTop: '5px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
