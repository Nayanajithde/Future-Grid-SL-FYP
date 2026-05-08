from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import sys

import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Start MATLAB Engine Globally
try:
    import matlab.engine
    logger.info("Starting MATLAB engine... this might take a few seconds.")
    eng = matlab.engine.start_matlab()
    model_dir = r"d:\7Sem\fyp\finalized\SLGrid\Final"
    eng.cd(model_dir, nargout=0)
    
    logger.info("Loading Simulink Model...")
    eng.load_system('Sri_Lanka_S_FINAL_set_points', nargout=0)
    
    # Configure scopes to log to workspace gracefully (ignoring errors if block parameters differ)
    try:
        eng.set_param('Sri_Lanka_S_FINAL_set_points/Frequecy Response', 'SaveToWorkspace', 'on', nargout=0)
        eng.set_param('Sri_Lanka_S_FINAL_set_points/Frequecy Response', 'SaveName', 'freq_out', nargout=0)
        eng.set_param('Sri_Lanka_S_FINAL_set_points/Frequecy Response', 'DataFormat', 'Array', nargout=0)
    except Exception as e:
        logger.warning(f"Could not set Frequency Response scope parameters: {e}")

    try:
        eng.set_param('Sri_Lanka_S_FINAL_set_points/ROCOF', 'SaveToWorkspace', 'on', nargout=0)
        eng.set_param('Sri_Lanka_S_FINAL_set_points/ROCOF', 'SaveName', 'rocof_out', nargout=0)
        eng.set_param('Sri_Lanka_S_FINAL_set_points/ROCOF', 'DataFormat', 'Array', nargout=0)
    except Exception as e:
        logger.warning(f"Could not set ROCOF scope parameters: {e}")
    
    logger.info("MATLAB engine ready.")
    MATLAB_AVAILABLE = True
except Exception as e:
    logger.error(f"Failed to start MATLAB engine: {e}")
    MATLAB_AVAILABLE = False


class SimulationRequest(BaseModel):
    solar_pct: int
    wind_pct: int
    ev_load_mw: int
    disturbance_type: str
    plants_status: dict
    plants_setpoints: dict={}


@app.post("/api/simulate")
async def simulate(req: SimulationRequest):
    if not MATLAB_AVAILABLE:
        return {"error": "MATLAB engine is not available. Please check the backend console."}

    try:
        # 1. Run parameter script gracefully so variables exist
        try:
            eng.eval("Sri_Lanka_FINAL_Set_point", nargout=0)
        except Exception as e:
            logger.warning(f"Could not run init script: {e}")
        
        # 2. Map UI Toggles to Status Variables (1.0 = ON, 0.0 = OFF)
        for plant_id, is_online in req.plants_status.items():
            status_var_name = f"status_{plant_id}"
            try:
                eng.workspace[status_var_name] = 1.0 if is_online else 0.0
            except Exception:
                pass

        # 3. Map UI Sliders to MATLAB Set Points
        for plant_id, mw_value in req.plants_setpoints.items():
            setpoint_var_name = f"setpoint_{plant_id}"
            try:
                eng.workspace[setpoint_var_name] = float(mw_value)
            except Exception:
                pass
                
        # 4. Set the Disturbance
        p_dist_pu = float(req.ev_load_mw) / 1000.0
        disturbance_set = False
        for block_name in ['LOad Disturbance', 'Load Disturbance', 'Step']:
            try:
                eng.set_param(f'Sri_Lanka_S_FINAL_set_points/{block_name}', 'After', str(p_dist_pu), nargout=0)
                disturbance_set = True
                break
            except Exception:
                continue
        
        if not disturbance_set:
            logger.warning("Could not find the disturbance step block.")
        
        # 5. Run the Simulation
        eng.eval("out = sim('Sri_Lanka_S_FINAL_set_points');", nargout=0)

        # 6. Extract the Data
        extraction_script = """
        try, t = out.tout; catch, try, t = tout; catch, t = []; end, end
        try, f = out.freq_response; catch, try, f = freq_response; catch, try, f = out.Frequency_Response; catch, try, f = Frequency_Response; catch, try, f = out.freq_out; catch, try, f = out.ScopeData1; catch, f = []; end, end, end, end, end, end
        try, r = out.rocof; catch, try, r = rocof; catch, try, r = out.ROCOF; catch, try, r = ROCOF; catch, try, r = out.rocof_out; catch, try, r = out.ScopeData2; catch, r = []; end, end, end, end, end, end
        
        if isa(f, 'timeseries'), f = f.Data; end
        if isa(f, 'Simulink.SimulationData.Signal'), f = f.Values.Data; end
        if isstruct(f) && isfield(f, 'signals'), f = f.signals(1).values; end
        if isa(f, 'Simulink.SimulationData.Dataset'), f = f.getElement(1).Values.Data; end
        
        if isa(r, 'timeseries'), r = r.Data; end
        if isa(r, 'Simulink.SimulationData.Signal'), r = r.Values.Data; end
        if isstruct(r) && isfield(r, 'signals'), r = r.signals(1).values; end
        if isa(r, 'Simulink.SimulationData.Dataset'), r = r.getElement(1).Values.Data; end

        if isnumeric(f) && size(f, 2) > 1
            f = f(:, end);
        end
        if isnumeric(r) && size(r, 2) > 1
            r = r(:, end);
        end
        
        t = double(t);
        f = double(f);
        r = double(r);
        """
        eng.eval(extraction_script, nargout=0)
        
        t_data = eng.workspace['t']
        f_data = eng.workspace['f']
        r_data = eng.workspace['r']
        
        def robust_flatten(mat_data):
            if not mat_data: return []
            flat_list = []
            for item in mat_data:
                if isinstance(item, list) or type(item).__name__ == 'double':
                    flat_list.extend([float(x) for x in item])
                else:
                    flat_list.append(float(item))
            return flat_list
        
        time_vals = robust_flatten(t_data)
        freq_vals = robust_flatten(f_data)
        rocof_vals = robust_flatten(r_data)
        
        if not freq_vals:
            return {"error": "No simulation data returned."}
            
        nadir = min(freq_vals)
        max_rocof_val = min(rocof_vals) if rocof_vals else 0.0
        
        min_len = min(len(time_vals), len(freq_vals))
        if rocof_vals:
            min_len = min(min_len, len(rocof_vals))
            
        time_vals = time_vals[:min_len]
        freq_vals = freq_vals[:min_len]
        if rocof_vals:
            rocof_vals = rocof_vals[:min_len]

        step = max(1, len(time_vals) // 200) if len(time_vals) > 0 else 1
        
        time_series = {
            "time": time_vals[::step],
            "frequency": freq_vals[::step],
            "rocof": rocof_vals[::step] if rocof_vals else []
        }
        
        # 7. Post-process to find metrics & Spinning Reserves
        status = "NORMAL"
        settling_time = 0.0
        suggested_reserves = []
        
        if nadir <= 49.5:
            status = "COLLAPSE"
            hydro_peakers = ['SAM', 'RAN', 'RTB', 'BWT', 'UKU', 'VIC', 'KOT']
            for plant in hydro_peakers:
                if req.plants_setpoints.get(plant, 0) == 0:
                    suggested_reserves.append(plant)
                    
        elif nadir < 49.8 or abs(max_rocof_val) > 0.85:
            status = "WARNING"
            hydro_peakers = ['SAM', 'RAN', 'RTB', 'BWT', 'UKU', 'VIC', 'KOT']
            for plant in hydro_peakers:
                if req.plants_setpoints.get(plant, 0) == 0:
                    suggested_reserves.append(plant)
            
        final_freq = freq_vals[-1]
        for i in range(len(freq_vals)-1, -1, -1):
            if abs(freq_vals[i] - 50.0) > 0.05:
                settling_time = time_vals[i]
                break
                
        return {
            "time_series": time_series,
            "metrics": {
                "systemFrequency": round(final_freq, 2),
                "rocof": round(max_rocof_val, 2),
                "nadir": round(nadir, 2),
                "settlingTime": "N/A" if status == "COLLAPSE" else round(settling_time, 1),
                "status": status,
                "suggested_reserves": suggested_reserves
            }
        }
        
    except Exception as e:
        logger.error(f"Simulation failed: {e}")
        return {"error": str(e)}
        
if __name__ == "__main__":
    import uvicorn
    # This loop keeps the server awake and listening to React
    uvicorn.run(app, host="0.0.0.0", port=8000)