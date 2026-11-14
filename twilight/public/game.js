import {GROUND, LEVELS} from './world.js';
import {paint, paintPortrait} from './art.js';

const byId = id => document.getElementById(id);
const setup = byId('setup');
const lobby = byId('lobby');
const preferences = byId('preferences');
const controls = [...document.querySelectorAll('[data-control]')];
const levelInputs = [...setup.querySelectorAll('[name=level]')];
const world = byId('world');
const preview = {
  players: [{id:'preview',x:223,y:GROUND,dir:1,tint:0,hp:100,pace:0}],
  npcs: [{id:1,x:615,dir:-1,alive:true,hit:0,pace:18},{id:2,x:864,dir:1,alive:true,hit:0,pace:22}]
};
const keyboard = new Map([
  ['ArrowLeft','left'],['KeyA','left'],['ArrowRight','right'],['KeyD','right'],
  ['Space','jump'],['ArrowUp','jump'],['KeyW','jump'],['ShiftLeft','run'],
  ['ShiftRight','run'],['KeyF','attack'],['KeyX','attack']
]);
const held = new Map();
let id = null;
let token = null;
let state = null;
let stream = null;
let seq = 0;
let pendingJump = false;
let pendingAttack = false;
let sending = false;
let sendAgain = false;
let seenRound = 0;
let lobbySignature = '';
let actors = new Map();
let lastFrame = 0;

function storage(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key,value);
  } catch {
    // Play remains available if storage is restricted.
  }
}

function theme(mode) {
  document.documentElement.dataset.theme = mode;
  byId('dark').setAttribute('aria-pressed', String(mode === 'dark'));
  byId('light').setAttribute('aria-pressed', String(mode === 'light'));
  storage('twilight-theme',mode);
}

theme(storage('twilight-theme') === 'light' ? 'light' : 'dark');
byId('name').value = storage('twilight-name') || '';
const inviteCode = new URL(location.href).searchParams.get('room')?.toUpperCase();
if (/^[0-9A-F]{6}$/.test(inviteCode || '')) {
  byId('joinCode').value = inviteCode;
  byId('setupNotice').textContent = 'Invite ready. Enter your vampire’s name and choose Join room.';
}

function selected() {
  return setup.querySelector('[name=level]:checked').value;
}
function previewLevel() {
  const level = selected();
  byId('district').textContent = LEVELS[level].title;
  byId('sceneCaption').firstElementChild.textContent = 'CHAPTER ' + ['I','II','III'][Object.keys(LEVELS).indexOf(level)];
}

levelInputs.forEach(input => input.addEventListener('change',previewLevel));
byId('settings').addEventListener('click', () => {
  clearInput();
  preferences.showModal();
});
byId('dark').addEventListener('click', () => theme('dark'));
byId('light').addEventListener('click', () => theme('light'));
preferences.addEventListener('close', () => { if (id) world.focus({preventScroll:true}); });

async function post(path, payload) {
  const response = await fetch('/api/' + path, {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
  });
  if (!response.ok) {
    const result = await response.json();
    throw Object.assign(new Error(result.error), {status:response.status});
  }
  return response.status === 204 ? null : response.json();
}

async function join(code = '') {
  if (!byId('name').reportValidity()) return;
  const name = byId('name').value.trim();
  if (!name) {
    byId('setupNotice').textContent = 'Give your vampire a name first.';
    return;
  }
  if (code && !/^[0-9A-F]{6}$/.test(code)) {
    byId('setupNotice').textContent = 'Enter the six-character room code.';
    return;
  }
  byId('setupNotice').textContent = '';
  byId('start').disabled = byId('join').disabled = true;
  try {
    const result = await post('join',{name,code,level:selected()});
    id = result.id;
    token = result.token;
    seenRound = 0;
    lobbySignature = '';
    storage('twilight-name',name);
    setup.hidden = true;
    lobby.hidden = false;
    update(result.state);
    stream = new EventSource('/api/events?token=' + encodeURIComponent(token));
    stream.onmessage = event => update(JSON.parse(event.data));
    stream.onerror = () => { byId('lobbyNotice').textContent = 'Reconnecting to the hunt…'; };
    stream.onopen = () => { byId('lobbyNotice').textContent = ''; };
    world.focus({preventScroll:true});
    if (matchMedia('(max-width: 675px)').matches) world.scrollIntoView({block:'start'});
  } catch (error) {
    byId('setupNotice').textContent = error.status ? error.message : 'The hunt server could not be reached.';
  } finally {
    byId('start').disabled = byId('join').disabled = false;
  }
}

setup.addEventListener('submit',event => {
  event.preventDefault();
  const code = byId('joinCode').value.trim().toUpperCase();
  join(document.activeElement === byId('joinCode') ? code : '');
});
byId('join').addEventListener('click', () => {
  const code = byId('joinCode').value.trim().toUpperCase();
  if (!code) {
    byId('setupNotice').textContent = 'Enter a room code or use Begin the hunt to make one.';
    byId('joinCode').focus();
    return;
  }
  join(code);
});
byId('joinCode').addEventListener('keydown',event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    if (!byId('join').disabled) byId('join').click();
  }
});

function exit(message = '', notify = true) {
  const departing = token;
  id = token = null;
  stream?.close();
  stream = null;
  state = null;
  actors = new Map();
  clearInput();
  setup.hidden = false;
  lobby.hidden = true;
  byId('result').hidden = byId('health').hidden = byId('roundStats').hidden = true;
  byId('sceneCaption').hidden = false;
  byId('setupNotice').textContent = message;
  byId('lobbyNotice').textContent = '';
  previewLevel();
  if (notify && departing) post('leave',{token:departing}).catch(() => {});
}

byId('leave').addEventListener('click', () => exit());
window.addEventListener('pagehide', () => {
  if (id) navigator.sendBeacon('/api/leave',JSON.stringify({token}));
});

byId('copy').addEventListener('click', async () => {
  if (!state) return;
  const link = new URL(location.href);
  link.searchParams.set('room',state.code);
  try {
    await navigator.clipboard.writeText(link.href);
    byId('lobbyNotice').textContent = 'Invite copied.';
  } catch {
    byId('lobbyNotice').textContent = 'Share this game address and room code ' + state.code + '.';
  }
});

byId('restart').addEventListener('click', async () => {
  if (!id) return;
  try {
    await post('restart',{token});
    world.focus({preventScroll:true});
  } catch {
    byId('lobbyNotice').textContent = 'Could not restart the hunt. Try again.';
  }
});

function update(next) {
  const me = next.players.find(player => player.id === id);
  if (!me) return;
  state = next;
  const config = LEVELS[next.level];
  if (seenRound !== next.round) {
    seenRound = next.round;
    actors = new Map();
    clearInput();
  }
  byId('district').textContent = config.title;
  byId('roundStats').hidden = byId('health').hidden = false;
  byId('sceneCaption').hidden = true;
  byId('score').textContent = next.score + ' / ' + config.goal;
  const seconds = Math.ceil(next.remaining);
  byId('timer').textContent = String(Math.floor(seconds/60)).padStart(2,'0') + ':' + String(seconds%60).padStart(2,'0');
  byId('rank').textContent = me.rank || 1;
  byId('coins').textContent = me.coins || 0;
  byId('lifeName').textContent = me.name;
  byId('lifeValue').textContent = me.hp + ' HP';
  byId('lifeBar').max = config.health;
  byId('lifeBar').value = me.hp;
  byId('roomCode').textContent = next.code;
  byId('count').textContent = next.players.length + ' / 4';
  byId('objective').textContent = config.label + ' · Hunt ' + config.goal + ' humans before time runs out. Torchbearers fight back.';
  const signature = JSON.stringify(next.players.map(p => [p.id,p.name,p.score,p.hp > 0]));
  if (signature !== lobbySignature) {
    lobbySignature = signature;
    const entries = next.players.map(p => {
      const row = document.createElement('li');
      const name = document.createElement('span');
      const score = document.createElement('span');
      name.textContent = (p.id === id ? '◆ ' : '◇ ') + p.name + (p.id === id ? ' · you' : '');
      score.textContent = p.hp ? p.score + ' prey' : 'Fallen';
      row.append(name,score);
      return row;
    });
    byId('players').replaceChildren(...entries);
  }
  const ended = next.status !== 'playing';
  byId('result').hidden = !ended && me.hp > 0;
  byId('restart').hidden = !ended;
  if (ended) {
    byId('resultLabel').textContent = 'END OF HUNT';
    byId('resultTitle').textContent = next.status === 'won' ? 'The night is yours' : 'The hunt is over';
    byId('resultText').textContent = 'Your coven caught ' + next.score + ' of ' + config.goal + ' humans.';
  } else if (me.hp <= 0) {
    byId('resultLabel').textContent = 'VAMPIRE FALLEN';
    byId('resultTitle').textContent = 'Out of the hunt';
    byId('resultText').textContent = 'Your coven is still hunting. You can rejoin them when the round restarts.';
  }
}

function markControls() {
  const active = new Set(held.values());
  controls.forEach(button => button.classList.toggle('active',active.has(button.dataset.control)));
}

async function sendInput() {
  if (!id || !state) return;
  if (sending) { sendAgain = true; return; }
  sending = true;
  const player = id;
  const active = new Set(held.values());
  const payload = {
    token, seq:++seq, round:state.round, jump:pendingJump, attackTap:pendingAttack,
    left:active.has('left'),right:active.has('right'),run:active.has('run'),attack:active.has('attack')
  };
  pendingJump = pendingAttack = false;
  try {
    await post('input',payload);
  } catch (error) {
    if (id === player && error.status === 404) exit('Your room closed. Begin a new hunt or join another room.',false);
  } finally {
    sending = false;
    if (sendAgain) {
      sendAgain = false;
      sendInput();
    }
  }
}

function setInput(source, action, active) {
  if (active) {
    if (held.has(source)) return;
    held.set(source,action);
    if (action === 'jump') pendingJump = true;
    if (action === 'attack') pendingAttack = true;
  } else if (!held.delete(source)) return;
  markControls();
  sendInput();
}

function clearInput() {
  held.clear();
  pendingJump = pendingAttack = false;
  markControls();
  sendInput();
}

controls.forEach(button => {
  button.addEventListener('pointerdown', event => {
    if (!id || event.button !== 0) return;
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    setInput('pointer'+event.pointerId,button.dataset.control,true);
  });
  for (const eventName of ['pointerup','pointercancel','lostpointercapture']) {
    button.addEventListener(eventName,event => setInput('pointer'+event.pointerId,button.dataset.control,false));
  }
  button.addEventListener('click',event => {
    if (!id || event.detail !== 0) return;
    const action = button.dataset.control;
    setInput(button,action,true);
    setTimeout(() => setInput(button,action,false),180);
  });
});

window.addEventListener('keydown',event => {
  if (!id || preferences.open || event.target.closest('input,textarea,select') || (event.code === 'Space' && event.target.closest('button')) || event.altKey || event.metaKey || event.ctrlKey) return;
  const action = keyboard.get(event.code);
  if (!action) return;
  event.preventDefault();
  if (!event.repeat) setInput(event.code,action,true);
});
window.addEventListener('keyup',event => {
  if (keyboard.has(event.code)) setInput(event.code,keyboard.get(event.code),false);
});
window.addEventListener('blur',clearInput);
document.addEventListener('visibilitychange',() => {
  if (document.hidden) clearInput();
});
setInterval(sendInput,155);

function render(timestamp) {
  const delta = Math.min(60,timestamp-lastFrame);
  lastFrame = timestamp;
  const blend = 1-Math.exp(-delta/43);
  const soften = (actor,key) => {
    const previous = actors.get(key);
    const pos = {...actor};
    if (previous) {
      pos.x = previous.x+(actor.x-previous.x)*blend;
      if ('y' in actor) pos.y = previous.y+(actor.y-previous.y)*blend;
    }
    actors.set(key,pos);
    return pos;
  };
  const view = state ? {
    players:state.players.map(p => soften(p,p.id)),
    npcs:state.npcs.map(n => soften(n,n.id))
  } : preview;
  paint(world,view,id,document.documentElement.dataset.theme === 'light',timestamp/1000);
  requestAnimationFrame(render);
}

paintPortrait(byId('portrait'));
requestAnimationFrame(render);
