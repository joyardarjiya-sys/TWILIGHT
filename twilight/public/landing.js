const get = id => document.getElementById(id);
const panels = {home:get('welcomeHome'),mode:get('welcomeMode'),role:get('welcomeRole'),location:get('welcomeLocation'),ready:get('welcomeReady')};
let chosenMode = 'single';
let soundOn = false;
let audioContext;
function show(name){Object.entries(panels).forEach(([key,node])=>node.hidden=key!==name);}
function tone(freq,duration,volume=0.035){if(!soundOn)return;try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.type='triangle';oscillator.frequency.setValueAtTime(freq,audioContext.currentTime);oscillator.frequency.exponentialRampToValueAtTime(Math.max(30,freq/2),audioContext.currentTime+duration);gain.gain.setValueAtTime(volume,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+duration);oscillator.connect(gain).connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+duration);}catch{}}
get('toggleSound').addEventListener('click',()=>{soundOn=!soundOn;get('toggleSound').textContent=soundOn?'SOUND ON':'SOUND OFF';get('toggleSound').setAttribute('aria-pressed',String(soundOn));tone(100,.9)});
get('skipIntro').addEventListener('click',()=>{get('welcome').classList.add('skip-animation');get('skipIntro').hidden=true;});
get('homeMenu').addEventListener('click',()=>{get('homeDescription').hidden=!get('homeDescription').hidden;tone(130,.2)});
get('playMenu').addEventListener('click',()=>{show('mode');tone(165,.4)});
get('settingsMenu').addEventListener('click',()=>{get('preferences').showModal();tone(120,.2)});
// SINGLE PLAYER / MULTIPLAYER SELECTION
document.querySelectorAll('[data-mode]').forEach(button => {
  button.addEventListener('click', () => {
    chosenMode = button.dataset.mode;
    show('role');
    tone(180, 0.3);
  });
});
document.querySelectorAll('#welcomeLocation [data-location]').forEach(button => {
  button.addEventListener('click', () => {

    const selectedLocation = button.dataset.location;

    // Save the selected location
    sessionStorage.setItem('twilightLocation', selectedLocation);

    // Synchronize the game setup selection
    const radio = document.querySelector(
      `input[name="location"][value="${selectedLocation}"]`
    );

    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Update the welcome screen
    const locationNames = {
      streets: 'Hollow Streets',
      college: 'Blackthorn College',
      cafe: 'Midnight Café',
      mall: 'Ravencrest Mall'
    };

    const locationName = locationNames[selectedLocation] || 'Hollow Streets';

    const description = document.getElementById('readyDescription');

    if (description) {
      description.textContent =
        `Enter ${locationName}. Your vampire hunt begins here.`;
    }

    show('ready');
    tone(210, 0.3);
  });
});
document.querySelectorAll('[data-role]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.role==='human'){get('roleNotice').textContent='Human survival mode is planned, but not playable in this build. Choose Vampire to continue.';tone(90,.35);return;}show('location');tone(190,.3)}));

document.querySelectorAll('[data-back]').forEach(button=>button.addEventListener('click',()=>{show(button.dataset.back);tone(110,.2)}));
get('enterGame').addEventListener('click',()=>{get('welcome').hidden=true;get('gameShell').hidden=false;get('joinCode').closest('.join').hidden=chosenMode==='single';get('copy').hidden=chosenMode==='single';get('count').closest('.section-index').hidden=chosenMode==='single';get('welcome').classList.add('skip-animation');tone(70,.8);window.scrollTo({top:0,behavior:'instant'});});
const invite=new URL(location.href).searchParams.get('room');if(/^[0-9a-f]{6}$/i.test(invite||'')){chosenMode='multi';show('ready');get('readyDescription').textContent='You have a multiplayer invitation. Enter the night, then join using the prefilled room code.';}
