const endpointInput = document.getElementById('endpoint');
const btnConnect = document.getElementById('btnConnect');
const btnDisconnect = document.getElementById('btnDisconnect');
const statusEl = document.getElementById('status');
const canvas = document.getElementById('radar');
const ctx = canvas.getContext('2d');
const frontValsEl = document.getElementById('frontVals');
const rearValsEl  = document.getElementById('rearVals');
const carImg = new Image();
carImg.src = 'car.png';

let es = null;
let state = {
  front: [null, null, null, null],
  rear:  [null, null, null, null],
  lastMessageAt: 0
};

// Persistir endpoint
endpointInput.value = localStorage.getItem('endpoint') || 'http://localhost:8182/stream';
endpointInput.addEventListener('change', () => localStorage.setItem('endpoint', endpointInput.value));

btnConnect.addEventListener('click', connect);
btnDisconnect.addEventListener('click', disconnect);

function connect(){
  disconnect();
  const url = endpointInput.value.trim();
  if(!url){ alert('Informe o endpoint /stream'); return; }
  es = new EventSource(url);
  statusEl.textContent = 'conectando…';

  es.onopen = () => { statusEl.textContent = 'conectado'; };
  es.onerror = () => { statusEl.textContent = 'erro / reconectando…'; };

  es.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      const side = (msg.side === 'front' || msg.side === 1) ? 'front' : 'rear';
      const arr = msg.cm || [];
      for (let i=0; i<4; i++) {
        if (typeof arr[i] === 'number') state[side][i] = arr[i];
      }
      state.lastMessageAt = Date.now();
      updateTiles();
    } catch (err) {
      console.warn('JSON inválido:', e.data, err);
    }
  };
}
function disconnect(){
  if(es){ es.close(); es = null; }
  statusEl.textContent = 'desconectado';
}

// Utilidades visuais
function colorForCm(cm){
  if (cm == null) return 'rgba(255,255,255,0.08)';
  if (cm <= 20) return '#ff3b30';   // vermelho
  if (cm <= 50) return '#ffcc00';   // amarelo
  return '#34c759';                 // verde
}
function alphaForCm(cm){
  if (cm == null) return 0.15;
  const clamped = Math.max(0, Math.min(100, cm));
  return 1 - (clamped/100); // 0..1 (mais perto => mais opaco)
}

function draw(){
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);

  // Plano de fundo gradiente
  const g = ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'#0b1220'); g.addColorStop(1,'#0a0f1a');
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

  // Área do "estacionamento"
  ctx.strokeStyle = 'rgba(255,255,255,.06)';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, w-40, h-40);

  // Carro (imagem SVG)
  const carW = 260, carH = 460, carX = (w-carW)/2, carY = (h-carH)/2;
  if (carImg.complete) {
    ctx.save();
    ctx.translate(carX + carW/2, carY + carH/2);
    ctx.rotate(-Math.PI/2);
    ctx.drawImage(carImg, -carH/2, -carW/2, carH, carW);
    ctx.restore();
  }

  // Desenhar sensores (4 frente, 4 traseira)
  drawSensors('front', state.front, carX, carY, carW, carH);
  drawSensors('rear',  state.rear,  carX, carY, carW, carH);

  requestAnimationFrame(draw);
}

function drawSensors(side, values, carX, carY, carW, carH){
  const segments = values.length;
  const baseY = side === 'front' ? carY : carY + carH;
  const spacing = carW / (segments + 1);
  const maxLen = 160; // raio extra máximo
  const baseRadius = 40; // distância inicial do parachoque
  const halfAngle = Math.PI / 4; // 90° de abertura
  const baseAngle = side === 'front' ? 3 * Math.PI / 2 : Math.PI / 2;

  for (let i = 0; i < segments; i++){
    const cm = values[i];
    const col = colorForCm(cm);
    const alpha = alphaForCm(cm);
    const len = maxLen * (1 - Math.min(1, (cm ?? 100)/100));
    const outerR = baseRadius + len;
    const innerR = baseRadius;
    const cx = carX + spacing * (i + 1);

    let start, end, ccw;
    if (side === 'front') {
      start = baseAngle + halfAngle;
      end = baseAngle - halfAngle;
      ccw = true;
    } else {
      start = baseAngle - halfAngle;
      end = baseAngle + halfAngle;
      ccw = false;
    }

    ctx.save();
    ctx.globalAlpha = 0.25 + 0.75 * alpha;
    ctx.fillStyle = col;

    ctx.beginPath();
    ctx.arc(cx, baseY, outerR, start, end, ccw);
    ctx.arc(cx, baseY, innerR, end, start, !ccw);
    ctx.closePath();
    ctx.fill();

    if (cm != null && cm <= 20){
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#ff3b30';
      ctx.beginPath();
      ctx.arc(cx, baseY, innerR + 10, start, end, ccw);
      ctx.arc(cx, baseY, innerR, end, start, !ccw);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}


function updateTiles(){
  const mk = (arr)=>arr.map((v,i)=>{
    const col = colorForCm(v);
    const val = (v==null? '—' : `${v} cm`);
    return `<div class="tile"><div class="cm" style="color:${col}">${val}</div><div class="lbl">S${i+1}</div></div>`;
  }).join('');
  frontValsEl.innerHTML = mk(state.front);
  rearValsEl.innerHTML  = mk(state.rear);
}

// PWA: registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
}

// start anim loop
updateTiles();
draw();
