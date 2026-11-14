import http from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { WIDTH, GROUND, CARS, LEVELS } from './public/world.js';

const rooms = new Map();
const membership = new Map();
const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/landing.css', ['landing.css', 'text/css; charset=utf-8']],
  ['/landing.js', ['landing.js', 'text/javascript; charset=utf-8']],
  ['/castle.svg', ['castle.svg', 'image/svg+xml']],
  ['/web.svg', ['web.svg', 'image/svg+xml']],
  ['/game.js', ['game.js', 'text/javascript; charset=utf-8']],
  ['/art.js', ['art.js', 'text/javascript; charset=utf-8']],
  ['/world.js', ['world.js', 'text/javascript; charset=utf-8']],
]);
const emptyInput = () => ({left: false, right: false, run: false, attack: false});
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const own = (object, key) => Object.hasOwn(object, key);

function newRoom(level) {
  let code;
  do { code = randomBytes(3).toString('hex').toUpperCase(); } while (rooms.has(code));
  const room = {code, level, players: new Map(), connections: new Map(), round: 0};
  reset(room);
  rooms.set(code, room);
  return room;
}

function reset(room) {
  const config = LEVELS[room.level];
  room.round++;
  room.status = 'playing';
  room.remaining = config.time;
  room.score = 0;
  room.npcs = Array.from({length: config.goal + config.guards}, (_, id) => {
    const guard = id >= config.goal;
    return {
      id, guard, alive: true, x: guard ? 655 + (id - config.goal) * (7600 / config.guards) : 315 + id * (8100 / (config.goal - 1)),
      dir: id % 2 ? -1 : 1, turn: 1 + Math.random() * 2, hp: guard ? 2 : 1, hit: 0, pace: 0
    };
  });
  let slot = 0;
  for (const p of room.players.values()) resetPlayer(p, slot++, config);
}

function resetPlayer(p, slot, config) {
  Object.assign(p, {
    coins: p.coins || 0, rank: p.rank || 1, totalHunts: p.totalHunts || 0,
    x: 160 + slot * 28, y: GROUND, vy: 0, dir: 1, hp: config.health, ground: true,
    score: 0, swing: 0, cooldown: 0, hurt: 0, pace: 0, jump: false, attackTap: false, input: emptyInput()
  });
}

function removePlayer(token) {
  const room = membership.get(token);
  if (!room) return;
  const stream = room.connections.get(token);
  room.connections.delete(token);
  room.players.delete(token);
  membership.delete(token);
  stream?.end();
  if (!room.players.size) rooms.delete(room.code);
  else if ([...room.players.values()].every(p => p.hp <= 0)) room.status = 'lost';
}

function step(room, dt, now) {
  for (const p of room.players.values()) {
    if (now - p.seen > 12000) removePlayer(p.token);
  }
  if (room.status !== 'playing' || !room.players.size || !room.connections.size) return;
  const config = LEVELS[room.level];
  room.remaining = Math.max(0, room.remaining - dt);
  for (const p of room.players.values()) {
    if (p.hp <= 0) continue;
    if (now - p.seen > 1000) p.input = emptyInput();
    const input = p.input;
    p.swing = Math.max(0, p.swing - dt);
    p.cooldown = Math.max(0, p.cooldown - dt);
    p.hurt = Math.max(0, p.hurt - dt);
    const direction = Number(input.right) - Number(input.left);
    p.pace = direction ? (input.run ? 370 : 226) : 0;
    if (direction) p.dir = direction;
    const oldY = p.y;
    let nextX = clamp(p.x + direction * p.pace * dt, 24, WIDTH - 24);
    for (const car of CARS) {
      if (oldY <= GROUND - car.h + 1 || nextX + 10 <= car.x || nextX - 10 >= car.x + car.w) continue;
      if (p.x <= car.x) nextX = car.x - 10;
      else if (p.x >= car.x + car.w) nextX = car.x + car.w + 10;
    }
    p.x = nextX;
    if (p.jump && p.ground) p.vy = -485;
    p.jump = false;
    p.vy += 1100 * dt;
    p.y += p.vy * dt;
    p.ground = false;
    let floor = GROUND;
    for (const car of CARS) {
      const top = GROUND - car.h;
      if (p.x + 9 > car.x && p.x - 9 < car.x + car.w && oldY <= top + 1) floor = Math.min(floor, top);
    }
    if (p.vy >= 0 && p.y >= floor) {
      p.y = floor;
      p.vy = 0;
      p.ground = true;
    }
    const attack = input.attack || p.attackTap;
    p.attackTap = false;
    if (attack && p.cooldown === 0) {
      p.cooldown = .46;
      p.swing = .28;
      for (const npc of room.npcs) {
        const distance = (npc.x - p.x) * p.dir;
        if (!npc.alive || distance < -15 || distance > 76 || GROUND - p.y > 68) continue;
        npc.hit = .24;
        if (--npc.hp === 0) {
          npc.alive = false;
          if (!npc.guard) {
            p.score++;
            p.totalHunts = (p.totalHunts || 0) + 1;
            p.coins = (p.coins || 0) + 10 + Math.floor(Math.random() * 21);
            p.rank = 1 + Math.floor(p.totalHunts / 10);
            room.score++;
          }
        }
      }
    }
  }
  for (const npc of room.npcs) {
    npc.hit = Math.max(0, npc.hit - dt);
    if (!npc.alive) continue;
    let nearest = null;
    for (const p of room.players.values()) {
      if (p.hp > 0 && (!nearest || Math.abs(p.x - npc.x) < Math.abs(nearest.x - npc.x))) nearest = p;
    }
    npc.turn -= dt;
    if (npc.turn < 0) { npc.dir *= -1; npc.turn = 2 + Math.random() * 4; }
    const diff = nearest ? nearest.x - npc.x : Infinity;
    npc.pace = npc.guard ? 47 : 28;
    if (Math.abs(diff) < (npc.guard ? 275 : 145)) {
      npc.dir = (Math.sign(diff) || 1) * (npc.guard ? 1 : -1);
      npc.pace = (npc.guard ? 146 : 104) * config.speed;
    }
    npc.x = clamp(npc.x + npc.dir * npc.pace * dt, 80, WIDTH - 80);
    if (npc.x === 80 || npc.x === WIDTH - 80) npc.dir = npc.x === 80 ? 1 : -1;
    if (npc.guard && nearest && Math.abs(nearest.x - npc.x) < 31 && GROUND - nearest.y < 33 && nearest.hurt === 0) {
      nearest.hp = Math.max(0, nearest.hp - config.damage);
      nearest.hurt = .85;
    }
  }
  if (room.score >= config.goal) room.status = 'won';
  else if (!room.remaining || [...room.players.values()].every(p => p.hp <= 0)) room.status = 'lost';
}

function state(room) {
  const {code, level, score, remaining, status, round, npcs} = room;
  const players = [...room.players.values()].map(({id,name,tint,x,y,dir,hp,score,swing,hurt,pace,ground,coins,rank,totalHunts}) =>
    ({id,name,tint,x,y,dir,hp,score,swing,hurt,pace,ground,coins,rank,totalHunts}));
  return {code, level, score, remaining, status, round, players, npcs};
}

let last = performance.now();
let broadcast = 0;
setInterval(() => {
  const now = performance.now();
  const dt = Math.min(.05, (now - last) / 1000);
  last = now;
  broadcast += dt;
  const send = broadcast >= .049;
  if (send) broadcast = 0;
  for (const room of rooms.values()) {
    step(room, dt, now);
    if (!send || !room.connections.size) continue;
    const data = 'data: ' + JSON.stringify(state(room)) + '\n\n';
    for (const stream of room.connections.values()) {
      if (stream.writableLength < 32000) stream.write(data);
    }
  }
}, 1000 / 60).unref();

function json(res, status, payload) {
  res.writeHead(status, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
  res.end(JSON.stringify(payload));
}

async function body(req) {
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 2048) throw new Error('Request is too large.');
  }
  const value = JSON.parse(data || '{}');
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid request.');
  return value;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    if (req.method === 'GET' && assets.has(path)) {
      const [file, type] = assets.get(path);
      const data = await readFile(new URL('./public/' + file, import.meta.url));
      res.writeHead(200, {'Content-Type': type, 'Cache-Control': 'no-cache'});
      return res.end(data);
    }
    if (path === '/api/join' && req.method === 'POST') {
      const data = await body(req);
      const name = String(data.name ?? '').trim().replace(/[\p{Cc}\p{Cf}]/gu, '').slice(0, 20).trim();
      const code = String(data.code ?? '').trim().toUpperCase();
      if (!name) return json(res, 400, {error: 'Give your vampire a name first.'});
      if (code && !rooms.has(code)) return json(res, 404, {error: 'That room has closed or the code is incorrect.'});
      const level = own(LEVELS, data.level) ? data.level : 'easy';
      const room = code ? rooms.get(code) : newRoom(level);
      if (room.players.size >= 4) return json(res, 409, {error: 'This coven already has four vampires.'});
      const tint = [0, 1, 2, 3].find(value => ![...room.players.values()].some(p => p.tint === value));
      const p = {id: randomUUID(), token: randomUUID(), name, tint, seen: performance.now(), seq: -1};
      resetPlayer(p, room.players.size, LEVELS[room.level]);
      room.players.set(p.token, p);
      membership.set(p.token, room);
      return json(res, 200, {id: p.id, token: p.token, state: state(room)});
    }
    if (path === '/api/events' && req.method === 'GET') {
      const token = url.searchParams.get('token');
      const room = membership.get(token);
      if (!room) return json(res, 404, {error: 'Room expired.'});
      room.connections.get(token)?.end();
      res.writeHead(200, {'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no'});
      room.connections.set(token, res);
      res.write('data: ' + JSON.stringify(state(room)) + '\n\n');
      res.on('close', () => {
        if (room.connections.get(token) === res) room.connections.delete(token);
      });
      return;
    }
    if (req.method === 'POST' && ['/api/input','/api/leave','/api/restart'].includes(path)) {
      const data = await body(req);
      const room = membership.get(data.token);
      if (!room) return json(res, 404, {error: 'Room expired.'});
      const p = room.players.get(data.token);
      if (path === '/api/leave') removePlayer(p.token);
      else if (path === '/api/restart') {
        if (room.status !== 'playing') reset(room);
      } else {
        p.seen = performance.now();
        if (Number.isSafeInteger(data.seq) && data.seq > p.seq) {
          p.seq = data.seq;
          if (data.round === room.round) {
            for (const key of Object.keys(p.input)) p.input[key] = data[key] === true;
            if (data.jump === true) p.jump = true;
            if (data.attackTap === true) p.attackTap = true;
          }
        }
      }
      res.writeHead(204);
      return res.end();
    }
    return json(res, 404, {error: 'Page not found.'});
  } catch {
    if (!res.headersSent) json(res, 400, {error: 'Invalid request.'});
    else res.end();
  }
});

const {values: options} = parseArgs({
  options: {host: {type: 'string'}, port: {type: 'string'}, strictPort: {type: 'boolean'}}
});
server.listen(Number(options.port ?? process.env.PORT ?? 3000), options.host ?? process.env.HOST ?? '0.0.0.0', () => {
  console.log('Twilight is running at http://localhost:' + server.address().port);
});
