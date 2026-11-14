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
