import { WIDTH, GROUND } from './world.js';

const H = 590;

function rect(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

function glow(c, x, y, radius, color) {
  c.save();
  c.shadowColor = color;
  c.shadowBlur = radius;
  c.fillStyle = color;
  c.fillRect(x, y, 1, 1);
  c.restore();
}

function storefront(c, x, name, color) {
  const y = 165;
  const w = 260;
  const h = 285;

  // Shop exterior
  rect(c, x, y, w, h, '#171a24');

  // Neon shop sign
  c.save();
  c.shadowColor = color;
  c.shadowBlur = 18;
  c.fillStyle = color;
  c.font = 'bold 23px Georgia';
  c.textAlign = 'center';
  c.fillText(name, x + w / 2, y + 35);
  c.restore();

  // Glass storefront
  rect(c, x + 15, y + 55, w - 30, 205, '#28313d');

  // Dark interior
  rect(c, x + 22, y + 62, w - 44, 191, '#0b1019');

  // Display shelves
  for (let i = 0; i < 3; i++) {
    rect(c, x + 35, y + 100 + i * 45, w - 70, 5, '#48404b');
  }

  // Broken glass reflections
  c.strokeStyle = '#8ab4c466';
  c.lineWidth = 2;

  c.beginPath();
  c.moveTo(x + 80, y + 60);
  c.lineTo(x + 115, y + 140);
  c.lineTo(x + 95, y + 190);
  c.lineTo(x + 145, y + 255);
  c.stroke();

  // Glass frame
  rect(c, x + w / 2, y + 55, 5, 205, '#555766');
  rect(c, x + 15, y + 55, w - 30, 5, '#555766');
}

function escalator(c, x) {
  c.save();
  c.translate(x, GROUND);

  // Escalator structure
  c.fillStyle = '#303441';
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(230, -180);
  c.lineTo(275, -180);
  c.lineTo(55, 0);
  c.closePath();
  c.fill();

  // Steps
  c.strokeStyle = '#81818b';
  c.lineWidth = 3;

  for (let i = 0; i < 12; i++) {
    const sx = 15 + i * 19;
    const sy = -i * 15;

    c.beginPath();
    c.moveTo(sx, sy);
    c.lineTo(sx + 45, sy);
    c.stroke();
  }

  // Handrail
  c.strokeStyle = '#8b283d';
  c.lineWidth = 8;

  c.beginPath();
  c.moveTo(0, -20);
  c.lineTo(235, -200);
  c.stroke();

  c.restore();
}

function emergencyLight(c, x) {
  rect(c, x - 20, 60, 40, 12, '#531622');

  glow(c, x, 70, 45, '#ff243c');

  const gradient = c.createRadialGradient(x, 75, 0, x, 75, 140);
  gradient.addColorStop(0, '#ff203344');
  gradient.addColorStop(1, '#ff203300');

  rect(c, x - 140, 0, 280, 280, gradient);
}

function abandonedBench(c, x) {
  rect(c, x, GROUND - 55, 110, 12, '#5a4c53');
  rect(c, x + 8, GROUND - 43, 8, 43, '#34303a');
  rect(c, x + 94, GROUND - 43, 8, 43, '#34303a');
  rect(c, x, GROUND - 85, 110, 10, '#51444c');
}

export function mallLayer() {
  const canvas = document.createElement('canvas');

  canvas.width = WIDTH;
  canvas.height = H;

  const c = canvas.getContext('2d');

  // Dark mall interior
  const wall = c.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, '#080b15');
  wall.addColorStop(1, '#24202e');

  rect(c, 0, 0, WIDTH, H, wall);

  // Ceiling
  rect(c, 0, 0, WIDTH, 45, '#0b0d15');

  // Ceiling support beams
  for (let x = 0; x < WIDTH; x += 420) {
    rect(c, x, 0, 15, GROUND, '#22232e');
  }

  // Upper-level balcony
  rect(c, 0, 125, WIDTH, 14, '#42404d');
  rect(c, 0, 140, WIDTH, 8, '#151821');

  // Storefronts
  const shops = [
    ['NOCTURNE', '#ff365c'],
    ['VELVET', '#b56aff'],
    ['ECLIPSE', '#64d9ff'],
    ['OBSIDIAN', '#ffae57']
  ];

  for (let x = 100, i = 0; x < WIDTH; x += 420, i++) {
    const shop = shops[i % shops.length];
    storefront(c, x, shop[0], shop[1]);
  }

  // Escalators
  for (let x = 650; x < WIDTH; x += 1800) {
    escalator(c, x);
  }

  // Emergency lights
  for (let x = 300; x < WIDTH; x += 750) {
    emergencyLight(c, x);
  }

  // Benches
  for (let x = 450; x < WIDTH; x += 1100) {
    abandonedBench(c, x);
  }

  // Marble floor
  rect(c, 0, GROUND, WIDTH, H - GROUND, '#292b38');

  for (let x = 0; x < WIDTH; x += 100) {
    rect(c, x, GROUND, 2, H - GROUND, '#454653');
  }

  for (let y = GROUND; y < H; y += 45) {
    rect(c, 0, y, WIDTH, 2, '#454653');
  }

  // Atmospheric red fog
  const fog = c.createLinearGradient(0, GROUND - 100, 0, H);
  fog.addColorStop(0, '#8b152000');
  fog.addColorStop(1, '#8b152044');

  rect(c, 0, GROUND - 100, WIDTH, H - GROUND + 100, fog);

  return canvas;
}