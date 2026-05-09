import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import { PLANTS_DATA } from './plantsData';

// Custom icons based on status and type
const createCustomIcon = (status, type) => {
  let iconContent = '';
  switch(type) {
    case 'Hydro': iconContent = '💧'; break;
    case 'Solar': iconContent = '☀️'; break;
    case 'Wind': iconContent = '💨'; break;
    case 'Coal':
    case 'Gas':
    case 'Diesel': iconContent = '🔥'; break;
    default: iconContent = '⚡';
  }

  return L.divIcon({
    className: 'plant-marker-icon',
    html: `<div class="pin-marker ${status ? 'operating' : 'disconnected'} type-${type}"><i>${iconContent}</i></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

const Map = ({ plantStatuses, onConfigClick }) => {
  // Center of Sri Lanka
  const center = [7.8731, 80.7718];

  return (
    <MapContainer center={center} zoom={7} zoomControl={false} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 1 }}>
      {/* Topographic green theme map tiles */}
      <TileLayer
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
      />
      
      {PLANTS_DATA.map((plant) => {
        const isOperating = plantStatuses[plant.id];
        return (
          <Marker 
            key={plant.id} 
            position={[plant.lat, plant.lng]} 
            icon={createCustomIcon(isOperating, plant.type)}
          >
            <Popup>
              <div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--accent-blue)' }}>{plant.name}</strong>
                <br />
                <span style={{ color: 'var(--text-secondary)' }}>Type: {plant.type}</span>
                <br />
                <strong style={{ color: isOperating ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  Status: {isOperating ? 'OPERATING' : 'DISCONNECTED'}
                </strong>
                {isOperating && onConfigClick && (
                  <div style={{ marginTop: '10px' }}>
                    <button 
                      onClick={() => onConfigClick(plant.id)}
                      style={{ 
                        width: '100%', padding: '6px', fontSize: '0.8rem', 
                        background: 'var(--accent-blue)', color: '#fff', 
                        border: 'none', borderRadius: '4px', cursor: 'pointer' 
                      }}
                    >
                      Configure Set Point
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default Map;
