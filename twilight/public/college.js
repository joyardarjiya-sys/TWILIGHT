import { WIDTH, GROUND } from './world.js';

const H = 590;

function rect(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

function polygon(c, points, fill, stroke = '#100d18') {
  c.beginPath();
  c.moveTo(points[0][0], points[0][1]);

  for (let i = 1; i < points.length; i++) {
    c.lineTo(points[i][0], points[i][1]);
  }

  c.closePath();
  c.fillStyle = fill;
  c.fill();

  c.strokeStyle = stroke;
  c.lineWidth = 2;
  c.stroke();
}

function collegeWindow(c, x, y, lit = true) {
  c.save();
  c.translate(x, y);

  c.fillStyle = lit ? '#bd835d' : '#211a30';

  c.beginPath();
  c.moveTo(0, 38);
  c.lineTo(0, 12);
  c.quadraticCurveTo(12, -8, 24, 12);
  c.lineTo(24, 38);
  c.closePath();
  c.fill();

  c.strokeStyle = '#110d19';
  c.lineWidth = 3;
  c.stroke();

  rect(c, 11, 3, 2, 35, '#231726');
  rect(c, 0, 22, 24, 2, '#231726');

  if (lit) {
    c.fillStyle = '#e6b57b22';
    c.beginPath();
    c.arc(12, 18, 34, 0, Math.PI * 2);
    c.fill();
  }

  c.restore();
}

function collegeBuilding(c, x, width, height) {
  const y = GROUND - height;

  c.save();
  c.translate(x, y);

  const wall = c.createLinearGradient(0, 0, 0, height);
  wall.addColorStop(0, '#48364f');
  wall.addColorStop(1, '#211925');

  rect(c, 0, 0, width, height, wall);

  // Gothic roof
  polygon(c, [
    [-15, 0],
    [width / 2, -65],
    [width + 15, 0]
  ], '#211827');

  // Stone columns
  for (let i = 0; i < width; i += 65) {
    rect(c, i, 0, 8, height, '#66506a');
    rect(c, i + 9, 0, 2, height, '#17111f');
  }

  // Windows
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < Math.floor(width / 65); col++) {
      collegeWindow(
        c,
        22 + col * 65,
        30 + row * 85,
        (row + col) % 3 !== 0
      );
    }
  }

  // Main entrance
  rect(c, width / 2 - 30, height - 90, 60, 90, '#130f1a');

  polygon(c, [
    [width / 2 - 35, height - 90],
    [width / 2, height - 125],
    [width / 2 + 35, height - 90]
  ], '#17111f');

  rect(c, width / 2 - 2, height - 85, 4, 85, '#62465a');

  c.restore();
}

function clockTower(c, x) {
  const y = GROUND - 365;

  c.save();
  c.translate(x, y);

  rect(c, 0, 0, 110, 365, '#35283d');

  polygon(c, [
    [-12, 0],
    [55, -95],
    [122, 0]
  ], '#191321');

  rect(c, 15, 65, 80, 85, '#1d1727');

  // Clock face
  c.beginPath();
  c.arc(55, 105, 31, 0, Math.PI * 2);
  c.fillStyle = '#d4b18c';
  c.fill();

  c.strokeStyle = '#342434';
  c.lineWidth = 4;
  c.stroke();

  // Clock hands
  c.beginPath();
  c.moveTo(55, 105);
  c.lineTo(55, 85);
  c.moveTo(55, 105);
  c.lineTo(72, 111);
  c.stroke();

  for (let i = 0; i < 3; i++) {
    collegeWindow(c, 43, 180 + i * 55, i !== 1);
  }

  c.restore();
}

function ironGate(c, x) {
  c.save();
  c.translate(x, GROUND);

  rect(c, -15, -120, 14, 120, '#211a25');
  rect(c, 160, -120, 14, 120, '#211a25');

  for (let i = 0; i < 11; i++) {
    const gx = i * 15;

    rect(c, gx, -100, 4, 100, '#443746');

    polygon(c, [
      [gx - 3, -100],
      [gx + 2, -114],
      [gx + 7, -100]
    ], '#756071');
  }

  rect(c, 0, -70, 160, 5, '#57465b');
  rect(c, 0, -20, 160, 5, '#57465b');

  c.restore();
}

function courtyardTree(c, x) {
  c.save();
  c.translate(x, GROUND);

  c.strokeStyle = '#211722';
  c.lineWidth = 11;

  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(0, -125);
  c.stroke();

  c.lineWidth = 5;

  for (let i = 0; i < 6; i++) {
    const direction = i % 2 === 0 ? -1 : 1;
    const branchY = -55 - i * 13;

    c.beginPath();
    c.moveTo(0, branchY);
    c.lineTo(direction * (35 + i * 6), branchY - 40);
    c.stroke();
  }

  c.restore();
}

export function collegeLayer() {
  const canvas = document.createElement('canvas');

  canvas.width = WIDTH;
  canvas.height = H;

  const c = canvas.getContext('2d');

  // Night sky
  const sky = c.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#100d1b');
  sky.addColorStop(0.65, '#392641');
  sky.addColorStop(1, '#63415a');

  rect(c, 0, 0, WIDTH, H, sky);

  // Distant moon
  c.beginPath();
  c.arc(350, 110, 55, 0, Math.PI * 2);
  c.fillStyle = '#d8c1b2';
  c.fill();

  // Repeating campus buildings
  for (let x = 0; x < WIDTH; x += 850) {
    collegeBuilding(c, x + 80, 390, 290);
    clockTower(c, x + 510);
    collegeBuilding(c, x + 640, 190, 240);

    courtyardTree(c, x + 45);
    courtyardTree(c, x + 605);

    ironGate(c, x + 300);
  }

  // Ground
  rect(c, 0, GROUND, WIDTH, H - GROUND, '#29202e');

  // Stone pathways
  for (let x = 0; x < WIDTH; x += 45) {
    rect(c, x, GROUND + 12, 43, 2, '#5b4658');
    rect(c, x + 15, GROUND + 35, 2, 35, '#17121f');
  }

  // Purple fog
  const fog = c.createLinearGradient(0, GROUND - 80, 0, H);
  fog.addColorStop(0, '#68457600');
  fog.addColorStop(1, '#68457655');

  rect(c, 0, GROUND - 80, WIDTH, H - GROUND + 80, fog);

  return canvas;
}