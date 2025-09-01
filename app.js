const endpointInput = document.getElementById('endpoint');
const btnConnect = document.getElementById('btnConnect');
const btnDisconnect = document.getElementById('btnDisconnect');
const statusEl = document.getElementById('status');
const canvas = document.getElementById('radar');
const ctx = canvas.getContext('2d');
const frontValsEl = document.getElementById('frontVals');
const rearValsEl  = document.getElementById('rearVals');

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

  // Carro
  const carW = 260, carH = 460, carX = (w-carW)/2, carY = (h-carH)/2;
  ctx.fillStyle = '#101827';
  roundRect(ctx, carX, carY, carW, carH, 24);
  ctx.fillStyle = '#0b1323'; roundRect(ctx, carX+16, carY+40, carW-32, carH-80, 18); // “vidro”
  ctx.fillStyle = '#0e1526'; roundRect(ctx, carX+30, carY+360, carW-60, 30, 10); // parachoque traseiro
  ctx.fillStyle = '#0e1526'; roundRect(ctx, carX+30, carY+30,  carW-60, 30, 10); // parachoque dianteiro

  // Desenhar sensores (4 frente, 4 traseira)
  drawSensors('front', state.front, carX, carY, carW, carH);
  drawSensors('rear',  state.rear,  carX, carY, carW, carH);

  requestAnimationFrame(draw);
}

function drawSensors(side, values, carX, carY, carW, carH){
  const segments = 4;
  const half = carW/2;
  const segW = half / segments;
  const centerX = carX + carW/2;
  const frontY = carY - 6;
  const rearY  = carY + carH + 6;

  for (let i=0; i<segments; i++){
    const cm = values[i];
    const col = colorForCm(cm);
    const alpha = alphaForCm(cm);

    // Quanto maior a proximidade, mais comprida a barra
    const maxLen = 180; // comprimento máximo da barra/“arco”
    const len = Math.max(20, maxLen * (1 - Math.min(1, (cm ?? 100)/100)));

    // X base de cada segmento (esquerda -> direita)
    const leftX = (centerX - half) + segW*i;
    const rightX = leftX + segW;

    ctx.save();
    ctx.globalAlpha = 0.25 + 0.75*alpha;
    ctx.fillStyle = col;

    // Frente: desenha fora do parachoque superior
    if (side === 'front'){
      // retângulo arredondado representando o "arco"
      roundRect(ctx, leftX+6, frontY - len, segW-12, len, 10, true);
      // luz vermelha contínua se muito perto
      if (cm != null && cm <= 20){
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#ff3b30';
        roundRect(ctx, leftX+6, frontY-18, segW-12, 12, 6, true);
      }
    } else {
      // Traseira: fora do parachoque inferior
      roundRect(ctx, leftX+6, rearY, segW-12, len, 10, true);
      if (cm != null && cm <= 20){
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#ff3b30';
        roundRect(ctx, leftX+6, rearY+6, segW-12, 12, 6, true);
      }
    }
    ctx.restore();
  }
}

function roundRect(ctx, x, y, w, h, r, fill=true){
  if (typeof r === 'number') r = {tl:r,tr:r,br:r,bl:r};
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
  if (fill) ctx.fill(); else ctx.stroke();
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
