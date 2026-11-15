import { WIDTH, GROUND } from './world.js';

const H = 590;

function rect(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

function ellipse(c, x, y, rx, ry, color) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = color;
  c.fill();
}

function gothicWindow(c, x, y) {
  c.save();
  c.translate(x, y);

  // Window frame
  c.fillStyle = '#1b101b';
  c.beginPath();
  c.moveTo(0, 130);
  c.lineTo(0, 35);
  c.quadraticCurveTo(45, -25, 90, 35);
  c.lineTo(90, 130);
  c.closePath();
  c.fill();

  // Moonlit glass
  const glass = c.createLinearGradient(0, 0, 0, 130);
  glass.addColorStop(0, '#55416a');
  glass.addColorStop(1, '#9b6170');

  c.fillStyle = glass;
  c.beginPath();
  c.moveTo(8, 122);
  c.lineTo(8, 38);
  c.quadraticCurveTo(45, -12, 82, 38);
  c.lineTo(82, 122);
  c.closePath();
  c.fill();

  rect(c, 43, 10, 4, 120, '#281826');
  rect(c, 5, 70, 80, 4, '#281826');

  c.restore();
}

function chandelier(c, x) {
  c.save();
  c.translate(x, 0);

  // Ceiling chain
  rect(c, -2, 0, 4, 80, '#a27a52');

  c.strokeStyle = '#9a704c';
  c.lineWidth = 5;

  c.beginPath();
  c.arc(0, 80, 65, 0, Math.PI);
  c.stroke();

  // Candles
  for (const dx of [-65, -32, 0, 32, 65]) {
    const y = 100 + (65 - Math.abs(dx)) * 0.25;

    rect(c, dx - 3, y - 17, 6, 18, '#e7c99b');

    ellipse(c, dx, y - 21, 4, 7, '#ffcf77');

    ellipse(c, dx, y - 21, 19, 19, '#ffb65a22');
  }

  c.restore();
}

function cafeTable(c, x) {
  c.save();
  c.translate(x, GROUND);

  // Table legs
  rect(c, -30, -43, 6, 43, '#3c2527');
  rect(c, 24, -43, 6, 43, '#3c2527');

  // Tabletop
  rect(c, -50, -50, 100, 9, '#704536');
  rect(c, -50, -50, 100, 3, '#bd8055');

  // Candle
  rect(c, -3, -68, 6, 18, '#e5c8a0');
  ellipse(c, 0, -73, 4, 7, '#ffbd61');

  // Candlelight
  ellipse(c, 0, -73, 35, 35, '#ffb75a16');

  // Chairs
  rect(c, -70, -45, 7, 45, '#39242a');
  rect(c, 63, -45, 7, 45, '#39242a');

  rect(c, -78, -50, 20, 5, '#634038');
  rect(c, 58, -50, 20, 5, '#634038');

  c.restore();
}

function cafeCounter(c, x) {
  c.save();
  c.translate(x, GROUND);

  // Counter body
  rect(c, 0, -100, 300, 100, '#3a2428');
  rect(c, 0, -105, 300, 12, '#89583f');

  // Wooden panels
  for (let i = 0; i < 5; i++) {
    rect(c, 15 + i * 58, -85, 45, 70, '#4d3030');
    rect(c, 18 + i * 58, -82, 39, 64, '#5c3832');
  }

  // Shelves
  rect(c, 20, -205, 260, 8, '#704632');
  rect(c, 20, -155, 260, 8, '#704632');

  // Bottles
  for (let i = 0; i < 12; i++) {
    const bx = 30 + i * 21;
    const by = i % 2 === 0 ? -230 : -180;

    rect(c, bx, by, 12, 25, i % 3 === 0 ? '#854e55' : '#52665d');
    rect(c, bx + 4, by - 7, 4, 7, '#b79a76');
  }

  c.restore();
}

function wallLamp(c, x, y) {
  c.save();
  c.translate(x, y);

  rect(c, -4, -12, 8, 24, '#4a3032');

  c.strokeStyle = '#a67a55';
  c.lineWidth = 4;

  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(20, -12);
  c.stroke();

  ellipse(c, 20, -20, 7, 11, '#ffcf80');
  ellipse(c, 20, -20, 35, 35, '#ffba6322');

  c.restore();
}

export function cafeLayer() {
  const canvas = document.createElement('canvas');

  canvas.width = WIDTH;
  canvas.height = H;

  const c = canvas.getContext('2d');

  // Victorian interior wall
  const wall = c.createLinearGradient(0, 0, 0, GROUND);
  wall.addColorStop(0, '#21131f');
  wall.addColorStop(1, '#59313b');

  rect(c, 0, 0, WIDTH, GROUND, wall);

  // Decorative ceiling
  rect(c, 0, 0, WIDTH, 22, '#120d16');
  rect(c, 0, 22, WIDTH, 8, '#825a49');

  // Wooden wall panels
  for (let x = 0; x < WIDTH; x += 130) {
    rect(c, x, 260, 120, GROUND - 260, '#43292e');
    rect(c, x + 5, 265, 110, GROUND - 275, '#503037');
  }

  // Gothic windows
  for (let x = 120; x < WIDTH; x += 650) {
    gothicWindow(c, x, 100);
  }

  // Chandeliers
  for (let x = 350; x < WIDTH; x += 850) {
    chandelier(c, x);
  }

  // Wall lamps
  for (let x = 200; x < WIDTH; x += 400) {
    wallLamp(c, x, 230);
  }

  // Café counters
  for (let x = 550; x < WIDTH; x += 1600) {
    cafeCounter(c, x);
  }

  // Café tables
  for (let x = 150; x < WIDTH; x += 350) {
    cafeTable(c, x);
  }

  // Wooden floor
  rect(c, 0, GROUND, WIDTH, H - GROUND, '#342127');

  for (let y = GROUND; y < H; y += 24) {
    rect(c, 0, y, WIDTH, 2, '#70463d');

    for (let x = 0; x < WIDTH; x += 120) {
      rect(c, x + (y % 48 ? 60 : 0), y, 2, 24, '#1c1319');
    }
  }

  // Warm atmospheric lighting
  const atmosphere = c.createLinearGradient(0, 0, 0, H);
  atmosphere.addColorStop(0, '#d58b4800');
  atmosphere.addColorStop(1, '#d58b4815');

  rect(c, 0, 0, WIDTH, H, atmosphere);

  return canvas;
}