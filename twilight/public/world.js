export const WIDTH = 9000;
export const GROUND = 475;
export const CARS = [
  {x: 424, w: 132, h: 47}, {x: 997, w: 140, h: 53},
  {x: 1550, w: 132, h: 47}, {x: 2210, w: 143, h: 55},
  {x: 2985, w: 132, h: 47}, {x: 3770, w: 143, h: 55},
  {x: 4850, w: 140, h: 49}, {x: 5630, w: 132, h: 47},
  {x: 6750, w: 143, h: 55}, {x: 7840, w: 132, h: 47}
];
export const LEVELS = {
  easy: {label: 'Easy', title: 'Gaslight Lane', goal: 6, time: 150, guards: 1, speed: 0.8, damage: 12, health: 100},
  hard: {label: 'Hard', title: 'Hollow District', goal: 9, time: 120, guards: 4, speed: 1.1, damage: 19, health: 100},
  disaster: {label: 'Disaster', title: 'The Last Midnight', goal: 12, time: 95, guards: 8, speed: 1.4, damage: 25, health: 90}
};
// ========================================
// TWILIGHT — PLAYABLE LOCATIONS
// ========================================

export const LOCATIONS = {
  college: {
    id: 'college',
    name: 'Blackthorn College',
    description: 'An ancient university hiding dark secrets.',
    environment: 'gothic-campus',
    sky: '#171122',
    fog: '#634276',
    lighting: '#c6a16a',
    humanType: 'students'
  },

  streets: {
    id: 'streets',
    name: 'Hollow Streets',
    description: 'Abandoned roads beneath the eternal moon.',
    environment: 'vintage-streets',
    sky: '#130f1e',
    fog: '#51315f',
    lighting: '#e6a36a',
    humanType: 'civilians'
  },

  cafe: {
    id: 'cafe',
    name: 'Midnight Café',
    description: 'A Victorian café where no visitor feels safe.',
    environment: 'victorian-cafe',
    sky: '#24131d',
    fog: '#6b354d',
    lighting: '#f0b46b',
    humanType: 'customers'
  },

  mall: {
    id: 'mall',
    name: 'Ravencrest Mall',
    description: 'A deserted shopping complex after midnight.',
    environment: 'dark-mall',
    sky: '#101522',
    fog: '#35456b',
    lighting: '#a3b4e6',
    humanType: 'shoppers'
  }
};

export const DEFAULT_LOCATION = 'streets';