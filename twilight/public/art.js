import { WIDTH, GROUND, CARS } from './world.js';
import { collegeLayer } from './college.js';
import { cafeLayer } from './cafe.js';
import { mallLayer } from './mall.js';

const H = 590;
const palette = ['#862e36','#56406c','#235c62','#925223'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const fract = n => n - Math.floor(n);
const noise = n => fract(Math.sin(n * 131.179 + 8.779) * 43758.5453);
const path = (c, d, fill, stroke, width = 1) => {
  const p = new Path2D(d);
  if (fill) { c.fillStyle = fill; c.fill(p); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.stroke(p); }
};
const rect = (c,x,y,w,h,color) => { c.fillStyle=color; c.fillRect(x,y,w,h); };
function ellipse(c,x,y,rx,ry,color) {
  c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.fillStyle=color; c.fill();
}
function gradient(c,x,y,rx,inner,outer) {
  const g=c.createRadialGradient(x,y,0,x,y,rx);
  g.addColorStop(0,inner);g.addColorStop(1,outer);return g;
}
function vertical(c,y1,y2,stops) {
  const g=c.createLinearGradient(0,y1,0,y2);
  stops.forEach(([at,color])=>g.addColorStop(at,color));
  return g;
}

function windowFrame(c,x,y,w,h,lit,kind) {
  c.save(); c.translate(x,y);
  const outline = kind === 1
    ? `M0 ${h}V${w*.6}Q0 ${w*.22} ${w/2} 0Q${w} ${w*.22} ${w} ${w*.6}V${h}Z`
    : `M0 ${h}V${w*.5}Q0 0 ${w/2} 0Q${w} 0 ${w} ${w*.5}V${h}Z`;
  if(lit) {
    ellipse(c,w/2,h/2,h*.68,h*.68,gradient(c,w/2,h/2,h*.68,'#f2a14c22','#e28a4300'));
  }
  const glass=lit?vertical(c,0,h,[[0,'#553331'],[.5,'#c17841'],[1,'#f2b76f']]):'#221d23';
  path(c,outline,glass,'#100f15',5);
  path(c,outline,null,'#8f685156',1);
  rect(c,w/2-.7,w*.3,1.4,h-w*.3,'#211920');
  rect(c,0,h*.48,w,1.4,'#211920');
  if(lit) {
    path(c,`M0 ${w*.5}Q${w*.2} ${h*.55} 2 ${h-1}L0 ${h}ZM${w} ${w*.5}Q${w*.8} ${h*.55} ${w-2} ${h-1}L${w} ${h}Z`,'#5e3035');
    rect(c,3,h*.63,w*.22,1,'#ffe5af68');
  }
  rect(c,-3,h+1,w+6,3,'#6c5347');
  rect(c,-1,h+4,w+2,2,'#131016');
  c.restore();
}

function house(c,x,w,h,seed,light) {
  const base=GROUND-12;
  const y=base-h;
  const tone=light?['#583e3b','#63483f','#4f3e43']:['#30262c','#392a2a','#2c252d'];
  const roof=light?'#392d35':'#1e1921';
  const trim=light?'#896953':'#594740';
  c.save(); c.translate(x,y);
  const type=seed%4;
  const peak=type===1?-87:type===3?-116:-64;
  const body=vertical(c,0,h,[[0,tone[seed%3]],[1,light?'#38292e':'#171419']]);
  rect(c,0,0,w,h,body);
  c.save();
  c.beginPath(); c.rect(0,0,w,h); c.clip();
  for(let row=0;row<h/9;row++) {
    const rowY=row*9;
    rect(c,0,rowY,w,.6,'#e4ae8b1e');
    for(let col=0;col<w/23+1;col++){
      const bx=col*23-(row%2)*11;
      const r=noise(seed*330+row*21+col);
      rect(c,bx,rowY+1,22,7,r>.64?'#c3917113':r<.2?'#100b1829':'#0e0a1200');
      rect(c,bx,rowY,.65,9,'#100c166b');
    }
  }
  c.restore();
  rect(c,0,0,8,h,'#1b161c79'); rect(c,w-7,0,7,h,'#120e167a');
  const roofShape=type===0||type===2
    ? `M-12 5L${w*.2} ${peak}H${w*.8}L${w+12} 5Z`
    : `M-10 5L${w*.48} ${peak}L${w+10} 5Z`;
  const chimney=w*(seed%2?.78:.17);
  const gable=type===1||type===3;
  const slope=chimney<w*.48?(chimney+10)/(w*.48+10):(w+10-chimney)/(w*.52+10);
  const chimneyBase=gable?5+(peak-5)*slope:peak+10;
  rect(c,chimney,chimneyBase-29,11,39,roof);
  rect(c,chimney-3,chimneyBase-31,17,4,trim);
  path(c,roofShape,roof,trim,2);
  c.save();c.clip(new Path2D(roofShape));
  for(let row=0;row<19;row++){
    const yy=peak+row*7;
    for(let i=0;i<w/12+2;i++){
      const xx=i*12+(row%2)*6;
      path(c,`M${xx} ${yy-3}v3q3 4 6 0q3 4 6 0v-3`,null,'#ab7b681e');
    }
  }
  c.restore();
  if(type===1||type===3){
    path(c,`M${w*.48} ${peak-14}v17m-5 -9h10`,null,trim,2);
    windowFrame(c,w*.48-10,peak*.55,20,31,seed%3===0,1);
  } else {
    for(const dx of [w*.33,w*.62]){
      path(c,`M${dx-15} -10v-21l15 -16 15 16v21Z`,tone[0],trim);
      windowFrame(c,dx-8,-32,16,20,seed%2===1,0);
    }
  }
  rect(c,-4,2,w+8,5,trim);rect(c,-2,9,w+4,3,'#100e14');
  for(let f=0;f<2;f++){
    const wy=28+f*(h*.32);
    rect(c,0,wy+47,w,3,trim);
    rect(c,0,wy+51,w,2,'#1a141c');
    const count=w>155?3:2;
    for(let k=0;k<count;k++){
      const wx=(w/count)*(k+.5)-12;
      windowFrame(c,wx,wy,24,39,noise(seed*50+f*5+k)>.33,seed%2);
      if(type===2&&f===1){
        rect(c,wx-9,wy+30,42,12,'#13101580');
        for(let j=0;j<8;j++)rect(c,wx-8+j*5.5,wy+29,1,15,'#17131a');
        rect(c,wx-10,wy+28,44,2,trim);
      }
    }
  }
  const door=w*.47;
  windowFrame(c,door-15,h-53,30,52,false,1);
  rect(c,door-13,h-36,26,34,'#221918');
  rect(c,door-10,h-32,20,23,'#422d2a');
  rect(c,door+5,h-19,3,3,'#b98251');
  rect(c,door-19,h-3,38,3,trim);
  rect(c,door-24,h,48,3,'#30232a');
  if(seed%5===1){
    rect(c,17,h-78,w-34,15,'#211a22');
    c.font='7px Georgia';c.textAlign='center';c.fillStyle='#e3b38a';
    c.fillText(seed%2?'BLACKTHORN APOTHECARY':'THE HOLLOW HOTEL',w/2,h-68,w-42);
  }
  c.restore();
}

function lamp(c,x,light) {
  c.save();c.translate(x,GROUND-6);
  const halo=gradient(c,0,-119,105,'#ffbc6e59','#f7923b00');
  ellipse(c,0,-119,105,105,halo);
  ellipse(c,0,2,76,11,gradient(c,0,0,75,light?'#e9956580':'#e9956560','#e9956500'));
  path(c,'M-11 0h22v-4H6v-9H4v-91H2v-9h-4v9h-2v91h-2v9h-5Z','#171319','#795347',1.1);
  path(c,'M-11 -139H11L7 -116H-7Z',vertical(c,-139,-116,[[0,'#ffd599'],[1,'#e98246']]),'#38242a',2);
  path(c,'M-13 -140L-3 -148H3L13 -140ZM-7 -114H7L3 -110H-3Z','#211823','#765349');
  path(c,'M0 -151v-4M0 -138v21',null,'#7c5143',1.3);
  ellipse(c,0,-129,4,7,'#fff1bd');
  c.restore();
}

function tree(c,x,y,seed) {
  c.save();c.translate(x,y);
  function branch(px,py,len,angle,width,depth,id){
    const ex=px+Math.sin(angle)*len;
    const ey=py-Math.cos(angle)*len;
    path(c,`M${px} ${py}Q${px+Math.sin(angle+.32)*len*.6} ${py-len*.48} ${ex} ${ey}`,null,'#221a21',width);
    if(depth>0){
      branch(ex,ey,len*.7,angle-.48-noise(id)*.24,width*.58,depth-1,id+2);
      branch(ex,ey,len*.66,angle+.41+noise(id+1)*.47,width*.57,depth-1,id+6);
    }
  }
  branch(0,0,63,seed%2?.12:-.14,7,4,seed);
  branch(1,-32,46,-.84,3.6,3,seed+10);
  c.restore();
}

function car(c,{x,w,h},index) {
  c.save();c.translate(x,GROUND);c.scale(w/140,h/50);
  const paint=['#5f3335','#2f4442','#5e432f'][index%3];
  ellipse(c,70,1,77,6,'#100d14ac');
  for(const xx of [27,112]){
    ellipse(c,xx,-9,13,13,'#141119');
    ellipse(c,xx,-9,6,6,'#987c6a');
    ellipse(c,xx,-9,3,3,'#34282d');
  }
  const shape='M0 -9V-18Q0 -28 15 -31L38 -34L54 -46Q58 -50 67 -50H94Q104 -49 111 -40L120 -30Q136 -28 139 -20V-9H126Q124 -22 112 -22Q100 -22 98 -9H41Q39 -22 27 -22Q15 -22 13 -9Z';
  path(c,shape,vertical(c,-50,-7,[[0,paint],[.57,'#342a30'],[1,paint]]),'#100e14',1.3);
  path(c,'M44 -34L57 -45H75V-34ZM79 -45H95Q102 -42 111 -33H79Z','#695a62','#221e29');
  path(c,'M56 -43L67 -43L60 -35H49ZM82 -43H88L84 -35H81Z','#b0937d62');
  path(c,'M2 -24Q30 -30 45 -29H112L135 -24M44 -32v18h45l4 -18',null,'#bf927473');
  rect(c,78,-26,8,1.6,'#c39676');
  rect(c,0,-12,13,3,'#9f8173');rect(c,127,-12,13,3,'#9f8173');
  ellipse(c,5,-22,5,3,'#e4b780');ellipse(c,135,-22,4,2.4,'#c87962');
  c.restore();
}

function townLayer(light) {
  const layer=document.createElement('canvas');layer.width=WIDTH;layer.height=H;
  const c=layer.getContext('2d');
  for(let i=0,x=-55;x<WIDTH;i++){
    const w=133+Math.floor(noise(i+5)*79);
    house(c,x,w,139+Math.floor(noise(i+7)*112),i+1,light);
    x+=w+12+noise(i+15)*28;
  }
  rect(c,0,GROUND-11,WIDTH,11,light?'#4d3a3e':'#28212a');
  rect(c,0,GROUND-9,WIDTH,2,'#aa826c');
  rect(c,0,GROUND-2,WIDTH,H-GROUND+2,vertical(c,GROUND,H,[[0,light?'#553d3c':'#33272e'],[1,light?'#37282e':'#18141c']]));
  for(let row=0;row<13;row++){
    const yy=GROUND+row*9;
    rect(c,0,yy,WIDTH,.65,'#120e177e');
    for(let i=0;i<WIDTH/27+1;i++){
      const x=i*27-(row%2)*13;
      const n=noise(i+row*223);
      rect(c,x,yy+1,25,7,n>.8?'#b5886f25':n>.38?'#a3817312':'#14101c38');
      rect(c,x,yy,1,9,'#140f1877');
      if(n>.77)rect(c,x+3,yy+1,10,1,'#e6b68a32');
    }
  }
  for(let i=0;i<Math.ceil(WIDTH/305);i++){
    const x=125+i*305+noise(i+22)*25;
    if(i%3===1)tree(c,x+76,GROUND-12,i+30);
    lamp(c,x,light);
    for(let j=0;j<14;j++){
      const dx=(noise(i*40+j)*2-1)*45;
      const dy=noise(i*66+j+17)*62;
      rect(c,x+dx,GROUND+dy,7+noise(j+2)*17,1.1,'#ed9f6344');
    }
  }
  CARS.forEach((item,i)=>car(c,item,i));
  return layer;
}

function face(c) {
  path(c,'M-11 -83Q-14 -98 -4 -101Q11 -104 14 -91L13 -80L9 -68L1 -63L-8 -68Z','#d7aaa0','#382834',1);
  path(c,'M-11 -77Q-18 -81 -13 -87L-12 -94Q-10 -104 2 -105Q17 -105 16 -93L15 -87L11 -91Q8 -91 8 -97Q1 -91 -8 -92L-10 -81Z','#201a25','#856370',.7);
  path(c,'M-11 -89Q-10 -99 1 -102Q10 -103 14 -97M-7 -92Q2 -93 7 -99',null,'#655064',.8);
  path(c,'M-10 -80l7 1M3 -79l8 -3M2 -79l3 6 -3 1',null,'#73535d',1.2);
  rect(c,-6,-79.8,2.3,1.5,'#f59170');rect(c,7,-81.2,2.4,1.5,'#fa9c75');
  path(c,'M-6 -71Q1 -68 9 -73L7 -67Q0 -66 -5 -68Z','#512a38');
  path(c,'M-5 -70l3 1 -1 3ZM5 -70l3 -1 -2 4Z','#fff3d9');
  path(c,'M-8 -75l3 2m13 -4 3 -2',null,'#f1c5ad',.75);
}
// ========================================
// TWILIGHT — WEAPON VISUAL EFFECTS
// ========================================

function drawWeapon(c, weaponId, attacking, t) {
  const weapon = weaponId || 'claws';

  c.save();

  c.lineCap = 'round';
  c.lineJoin = 'round';

  if (attacking) {
    c.shadowBlur = 18;
  }

  switch (weapon) {

    case 'claws': {
      c.strokeStyle = '#d92345';
      c.shadowColor = '#ff244d';
      c.lineWidth = 2.5;

      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.moveTo(i * 4, 0);
        c.quadraticCurveTo(
          i * 4 + 9,
          -8,
          i * 4 + 17,
          -20
        );
        c.stroke();
      }
      break;
    }

    case 'dagger': {
      c.shadowColor = '#ff2348';

      c.fillStyle = '#65313b';
      c.fillRect(-3, -3, 6, 15);

      c.fillStyle = '#e33b54';
      c.beginPath();
      c.moveTo(-5, -3);
      c.lineTo(0, -38);
      c.lineTo(5, -3);
      c.closePath();
      c.fill();

      break;
    }

    case 'shadow': {
      c.shadowColor = '#a34dff';

      c.fillStyle = '#3c245e';
      c.fillRect(-4, -3, 8, 16);

      c.fillStyle = '#9855ef';
      c.beginPath();
      c.moveTo(-6, -4);
      c.lineTo(0, -52);
      c.lineTo(6, -4);
      c.closePath();
      c.fill();

      break;
    }

    case 'crimson': {
      c.shadowColor = '#ff304f';

      c.fillStyle = '#532a36';
      c.fillRect(-4, -2, 8, 17);

      c.fillStyle = '#dc2443';
      c.beginPath();
      c.moveTo(-8, -3);
      c.lineTo(0, -65);
      c.lineTo(8, -3);
      c.closePath();
      c.fill();

      break;
    }

    case 'scythe': {
      c.shadowColor = '#b56cff';

      c.strokeStyle = '#6f527b';
      c.lineWidth = 5;

      c.beginPath();
      c.moveTo(0, 12);
      c.lineTo(0, -67);
      c.stroke();

      c.fillStyle = '#a965e8';
      c.beginPath();
      c.moveTo(0, -67);
      c.quadraticCurveTo(44, -84, 51, -35);
      c.quadraticCurveTo(35, -57, 0, -55);
      c.closePath();
      c.fill();

      break;
    }

    case 'fang': {
      c.shadowColor = '#ffd36d';
      c.shadowBlur = 20;

      c.fillStyle = '#75582b';
      c.fillRect(-4, -2, 8, 17);

      c.fillStyle = '#ffd66e';
      c.beginPath();
      c.moveTo(-8, -4);
      c.lineTo(0, -72);
      c.lineTo(8, -4);
      c.closePath();
      c.fill();

      break;
    }
  }

  c.restore();
}
function vampire(c,p,t,portrait=false) {
  const dir=p.dir||1;
  const gait=p.pace?Math.sin(t*(p.pace>250?17:12)):0;
  const cape=p.pace>250?12:0;
  const color=palette[p.tint||0];
  c.save();c.translate(p.x,p.y);c.scale(dir,1);
  if(p.hurt>0&&Math.floor(p.hurt*18)%2===1)c.globalAlpha=.55;
  if(p.hp<=0)c.globalAlpha=.36;
  path(c,`M-15 -77L-25 -66L${-31-cape} -7Q-12 -2 1 -8Q10 -2 23 -9L18 -65L11 -77Z`,color,'#181219',2);
  path(c,`M-19 -62L${-28-cape} -11L-15 -10L-6 -59M15 -61L21 -11L13 -10L6 -55`,'#1e1523');
  for(const sign of [-1,1]){
    const x=sign*8+gait*sign*9;
    path(c,`M${sign*9-5} -40H${sign*9+5}L${x+5} -5L${x+9} -2V0H${x-5}V-6Z`,'#25222c','#100f15',1);
    path(c,`M${sign*9+2} -37L${x+2} -9`,null,'#5e4e56',.9);
  }
  path(c,'M-20 -66Q-13 -73 -8 -72L12 -72L21 -66L15 -39Q10 -34 0 -35Q-11 -36 -15 -40Z','#33252f','#161019',1.4);
  path(c,'M-9 -73L0 -68L10 -74L8 -48L0 -41L-7 -49Z','#b29885');
  path(c,'M-15 -78L-5 -68L-2 -52L-13 -60L-9 -63L-19 -69ZM15 -78L6 -68L2 -52L14 -60L10 -64L20 -70Z',color,'#d0786866');
  path(c,'M-5 -70L1 -67L6 -70L5 -64L0 -65L-5 -65Z','#632f3e');
  path(c,'M-14 -41Q-1 -37 14 -41',null,'#76564c',2);
  rect(c,-2,-41,5,3,'#b69469');
  path(c,'M-20 -66L-26 -49L-25 -36L-19 -36L-17 -49L-13 -60Z','#392a36','#171219');
  const swing=p.swing>0;
  path(c,swing?'M15 -65L27 -57L43 -64L46 -58L28 -48L15 -55Z':'M16 -67L24 -63L26 -47L24 -37L17 -36L18 -48L13 -59Z','#44313e','#1c141e',1);
  const handX=swing?44:21,handY=swing?-60:-34;
  ellipse(c,handX,handY,4.4,5,'#c39487');
  // Draw the currently equipped weapon
if (!portrait) {
  c.save();

  c.translate(handX + 3, handY);

  // Rotate the weapon during attacks
  if (swing) {
    c.rotate(Math.PI / 3);
  } else {
    c.rotate(Math.PI / 8);
  }

  drawWeapon(
    c,
    p.equippedWeapon || 'claws',
    swing,
    t
  );

  c.restore();
}
  const ring=gradient(c,handX+1,handY,portrait?13:6,'#fff1bbba','#f19f4100');
  ellipse(c,handX+1,handY,portrait?13:6,portrait?13:6,ring);
  rect(c,handX,handY-1,3.8,2.2,'#d69a58');
  rect(c,handX+1,handY-1.6,2.3,2.3,'#ffe1a0');
  ellipse(c,-22,-34,3.5,4,'#ab8078');
  face(c);
 if (swing && !portrait) {

  const effects = {
    claws: '#ff3559',
    dagger: '#d92445',
    shadow: '#a45cff',
    crimson: '#ff243e',
    scythe: '#b96cff',
    fang: '#ffd76e'
  };

  const weapon = p.equippedWeapon || 'claws';
  const color = effects[weapon] || effects.claws;

  c.save();

  c.strokeStyle = color;
  c.shadowColor = color;
  c.shadowBlur = 22;
  c.lineWidth = weapon === 'scythe' ? 6 : 3;

  c.beginPath();

  if (weapon === 'scythe') {
    c.arc(35, -55, 58, -1.5, 0.9);
  } else {
    c.arc(35, -55, 42, -1.3, 0.6);
  }

  c.stroke();

  // Additional supernatural energy particles
  if (!reducedMotion.matches) {
    for (let i = 0; i < 6; i++) {
      const angle = t * 4 + i * Math.PI / 3;

      const x = 35 + Math.cos(angle) * 35;
      const y = -55 + Math.sin(angle) * 25;

      ellipse(c, x, y, 2.5, 2.5, color);
    }
  }

  c.restore();
}
  c.restore();
}

function human(c,n,t) {
  if(!n.alive && n.hit<=0)return;
  c.save();c.translate(n.x,GROUND);c.scale(n.dir||1,1);
  if(!n.alive){c.globalAlpha=n.hit/.24;c.rotate(Math.PI/2*(1-n.hit/.24));}
  const step=Math.sin(t*(n.pace>70?14:8))*6;
  const shirt=n.hit>0?'#bd695c':n.guard?'#55505c':['#7a5548','#6e6555','#545967'][n.id%3];
  for(const sign of [-1,1]){
    const x=sign*(5+step);
    path(c,`M${sign*6-4} -31h8L${x+4} -3L${x+8} -1H${x-5}Z`,'#29242e','#1b151e');
  }
  path(c,'M-13 -58L-6 -62H8L15 -56L13 -32Q0 -27 -13 -32Z',shirt,'#211720');
  path(c,'M-9 -56L-13 -46L-17 -39M10 -55L15 -45L18 -39',null,shirt,6);
  ellipse(c,2,-67,9,11,'#bc8d78');
  path(c,'M-8 -67V-73Q0 -81 10 -74L12 -69L2 -71L-7 -65Z','#342631');
  if(n.guard){
    path(c,'M-13 -72H16V-75H9L7 -83H-5L-8 -75H-13Z','#252230','#968078');
    rect(c,13,-44,14,3,'#b1a096');rect(c,17,-42,4,6,'#674a39');
    ellipse(c,22,-37,13,13,gradient(c,22,-37,13,'#f7aa5c69','#f7aa5c00'));
    rect(c,19,-40,6,8,'#efb879');
  }else{
    path(c,'M-8 -60L3 -56L10 -60L8 -54L4 -54L7 -44L3 -44L0 -54L-8 -56Z','#ae795e');
  }
  c.restore();
}

let cachedTheme;
let cachedLocation;
let town;
function backdrop(c,w,camera,t,light) {
  rect(c,0,0,w,H,vertical(c,0,H,light?[[0,'#6a4b58'],[.52,'#c78769'],[1,'#dea17c']]:[[0,'#231929'],[.52,'#63404a'],[1,'#ba7759']]));
  const mx=w*.57-camera*.027,my=132,r=68;
  ellipse(c,mx,my,175,175,gradient(c,mx,my,175,light?'#ffddad92':'#ffc38e86','#f9a37a00'));
  ellipse(c,mx,my,r,r,vertical(c,my-r,my+r,[[0,'#ffe6bf'],[.6,'#edaf89'],[1,'#cf7f62']]));
  c.save();c.beginPath();c.arc(mx,my,r,0,Math.PI*2);c.clip();
  for(let i=0;i<44;i++){
    const x=mx+(noise(i+50)*2-1)*r,y=my+(noise(i+111)*2-1)*r;
    ellipse(c,x,y,4+noise(i+6)*18,2+noise(i+2)*7,'#985d641d');
  }
  c.restore();
  for(let i=0;i<13;i++){
    const x=((i*173-camera*.12+(reducedMotion.matches?0:t*3))%(w+420)+w+420)%(w+420)-170;
    const y=67+noise(i+3)*225;
    ellipse(c,x,y,148,8+noise(i)*8,gradient(c,x,y,148,light?'#69465852':'#20172360','#47304d00'));
  }
  const parallax=camera*.28;
  const first=Math.floor(parallax/67);
  for(let i=first;i<first+w/67+3;i++){
    const x=i*67-parallax;
    const y=280+noise(i+89)*81;
    const roof=24+noise(i+13)*53;
    path(c,`M${x-3} 430V${y}L${x+28} ${y-roof}L${x+64} ${y}V430Z`,light?'#553945':'#342536');
    if(i%4===2)rect(c,x+41,y-roof*.8,8,29,light?'#553945':'#342536');
    for(let j=0;j<3;j++)rect(c,x+11+j*17,y+12,5,9,noise(i*5+j)>.68?'#d2996b92':'#271b2b80');
  }
}

export function paint(canvas,view,playerId,light,t) {
  const width=canvas.clientWidth,height=canvas.clientHeight;
  if(!width||!height)return;
  const ratio=Math.min(devicePixelRatio||1,2);
  if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
  }
  const location = view.location || 'streets';
 if (window.lastDebugLocation !== location) {
  console.log('ACTUAL GAME LOCATION:', location);
  window.lastDebugLocation = location;
}
if (
  cachedTheme !== light ||
  cachedLocation !== location
) {
switch (location) {
  case 'college':
    town = collegeLayer();
    break;

  case 'cafe':
    town = cafeLayer();
    break;

  case 'mall':
    town = mallLayer();
    break;

  case 'streets':
  default:
    town = townLayer(light);
    break;
}

  cachedTheme = light;
  cachedLocation = location;
}
  const c=canvas.getContext('2d');
  const zoom=height/H;
  const w=width/zoom;
  const focus=view.players.find(p=>p.id===playerId);
  const camera=Math.max(0,Math.min(WIDTH-w,(focus?.x||350)-w*.37));
  c.setTransform(ratio*zoom,0,0,ratio*zoom,0,0);
  if (location === 'college' || location === 'cafe' || location === 'mall') {
  // These environments include their own backgrounds.
  c.fillStyle =
  location === 'college' ? '#100d1b' :
  location === 'cafe' ? '#21131f' :
  '#080b15';

  c.fillRect(0, 0, w, H);
} else {
  backdrop(c, w, camera, t, light);
}

c.drawImage(town, -camera, 0);
  c.save();c.translate(-camera,0);
  for(const n of view.npcs) if(n.x>camera-80&&n.x<camera+w+80)human(c,n,t);
  for(const p of view.players) {
    if(p.x<camera-80||p.x>camera+w+80)continue;
    ellipse(c,p.x,GROUND+2,24,4,'#0d090d85');
    vampire(c,p,t);
    if(playerId){
      c.font='bold 12px system-ui'; c.textAlign='center';
      const tag=p.name+(p.id===playerId?' · YOU':'');
      const tagW=c.measureText(tag).width+14;
      rect(c,p.x-tagW/2,p.y-127,tagW,20,'#181015e8');
      rect(c,p.x-tagW/2,p.y-107,tagW,1,p.id===playerId?'#ec9560':'#b59282');
      c.fillStyle='#fbe0c9';c.fillText(tag,p.x,p.y-113);
    }
  }
  c.restore();
  rect(c,0,471,w,42,vertical(c,471,513,[[0,'#d7957a00'],[.46,light?'#e8aa8540':'#c6857533'],[1,'#d7957a00']]));
  if(!reducedMotion.matches)for(let i=0;i<68;i++){
    const x=((noise(i+211)*(w+35)+t*36)%(w+35))-18;
    const y=(noise(i+337)*H+t*(123+noise(i+77)*150))%H;
    path(c,`M${x} ${y}l-2.5 9`,null,i%5===0?'#f1c4ad56':'#f1c4ad24',.65);
  }
}

export function paintPortrait(canvas) {
  const c=canvas.getContext('2d');
  rect(c,0,0,140,200,vertical(c,0,200,[[0,'#482e39'],[1,'#20151e']]));
  ellipse(c,70,64,55,55,gradient(c,70,64,55,'#f6ac7980','#f6ac7900'));
  path(c,'M10 192V69Q10 35 70 11Q130 35 130 69V192Z',null,'#ca91654f',2);
  c.save();c.scale(1.9,1.9);
  vampire(c,{x:35,y:116,dir:1,tint:0,hp:100},0,true);
  c.restore();
}
