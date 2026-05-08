export const PLANTS_DATA = [
  { id: 'LAK', name: 'Lakvijaya (Coal)', lat: 8.016, lng: 79.723, type: 'Coal' },
  { id: 'SAM', name: 'Samanalawewa', lat: 6.687, lng: 80.811, type: 'Hydro' },
  { id: 'KEL', name: 'Kelanitissa', lat: 6.948, lng: 79.880, type: 'Gas' },
  { id: 'UTH', name: 'Uthuru Janani', lat: 9.742, lng: 80.021, type: 'Diesel' },
  { id: 'RAN', name: 'Randenigala', lat: 7.199, lng: 80.956, type: 'Hydro' },
  { id: 'RTB', name: 'Rantambe', lat: 7.202, lng: 80.970, type: 'Hydro' },
  { id: 'BWT', name: 'Bowatenna', lat: 7.653, lng: 80.686, type: 'Hydro' },
  { id: 'UKU', name: 'Ukuwela', lat: 7.411, lng: 80.638, type: 'Hydro' },
  { id: 'MAN', name: 'Mannar (Thambapavani)', lat: 8.981, lng: 79.913, type: 'Wind' },
  { id: 'MAD', name: 'Maduru Oya Solar', lat: 7.643, lng: 81.168, type: 'Solar' },
  { id: 'LAU', name: 'LAUGFS Hambantota', lat: 6.136, lng: 81.042, type: 'Solar' },
  { id: 'SOC', name: 'Solar One Ceylon', lat: 7.915, lng: 81.082, type: 'Solar' },
  { id: 'SOBA', name: 'Sobadhanavi', lat: 7.009, lng: 79.873, type: 'Gas' },
  { id: 'YUGA', name: 'Yugadhanavi', lat: 7.011, lng: 79.875, type: 'Gas' },
  { id: 'NLX', name: 'New Laxapana', lat: 6.901, lng: 80.490, type: 'Hydro' },
  { id: 'POL', name: 'Polpitiya', lat: 6.980, lng: 80.435, type: 'Hydro' },
  { id: 'UPP', name: 'Uppudaluwa', lat: 8.041, lng: 79.745, type: 'Wind' },
  { id: 'CAN', name: 'Canyon', lat: 6.840, lng: 80.528, type: 'Hydro' },
  { id: 'WIM', name: 'Wimalasurendra', lat: 6.902, lng: 80.505, type: 'Hydro' },
  { id: 'OLX', name: 'Old Laxapana', lat: 6.899, lng: 80.492, type: 'Hydro' },
  { id: 'BRO', name: 'Broadlands', lat: 6.984, lng: 80.407, type: 'Hydro' },
  { id: 'UMA', name: 'Uma Oya', lat: 6.863, lng: 81.026, type: 'Hydro' },
  { id: 'KUK', name: 'Kukuleganga', lat: 6.586, lng: 80.320, type: 'Hydro' },
  { id: 'VIC', name: 'Victoria', lat: 7.240, lng: 80.785, type: 'Hydro' },
  { id: 'KOT', name: 'Kotmale', lat: 7.059, lng: 80.597, type: 'Hydro' },
  { id: 'UKT', name: 'Upper Kotmale', lat: 6.942, lng: 80.648, type: 'Hydro' },
  { id: 'SAP', name: 'Sapugaskanda', lat: 6.958, lng: 79.940, type: 'Diesel' },
  { id: 'BAR', name: 'Colombo Port Barge', lat: 6.949, lng: 79.845, type: 'Diesel' }
];

// Provide initial default active state (e.g. all active)
export const getInitialPlantStatuses = () => {
  const status = {};
  PLANTS_DATA.forEach(p => {
    status[p.id] = true; // true = operating, false = disconnected
  });
  return status;
};