const endpointInput = document.getElementById('endpoint');
const btnConnect = document.getElementById('btnConnect');
const btnDisconnect = document.getElementById('btnDisconnect');
const statusEl = document.getElementById('status');
const frontBackEl = document.getElementById('frontBack');
const rearBackEl = document.getElementById('rearBack');
const frontEl = document.getElementById('front');
const rearEl = document.getElementById('rear');
const frontVals = document.getElementById('frontVals');
const rearVals = document.getElementById('rearVals');

let es = null;
let state = {
  front: [null, null, null, null],
  rear: [null, null, null, null],
  lastMessageAt: 0,
};

// Persistir endpoint
endpointInput.value = localStorage.getItem('endpoint') || 'http://localhost:8182/stream';
endpointInput.addEventListener('change', () =>
  localStorage.setItem('endpoint', endpointInput.value)
);

btnConnect.addEventListener('click', connect);
btnDisconnect.addEventListener('click', disconnect);

function connect() {
  disconnect();
  const url = endpointInput.value.trim();
  if (!url) {
    alert('Informe o endpoint /stream');
    return;
  }
  es = new EventSource(url);
  statusEl.textContent = 'conectando…';

  es.onopen = () => {
    statusEl.textContent = 'conectado';
  };
  es.onerror = () => {
    statusEl.textContent = 'erro / reconectando…';
  };

  es.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      const side = msg.side === 'front' || msg.side === 1 ? 'front' : 'rear';
      const arr = msg.cm || [];
      for (let i = 0; i < 4; i++) {
        if (typeof arr[i] === 'number') state[side][i] = arr[i];
      }
      state.lastMessageAt = Date.now();
      updateTiles();
      updateSensors(state.front, state.rear);
    } catch (err) {
      console.warn('JSON inválido:', e.data, err);
    }
  };
}

function disconnect() {
  if (es) {
    es.close();
    es = null;
  }
  statusEl.textContent = 'desconectado';
}

// 0° aponta para CIMA (frente do carro)
function polar(cx, cy, r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function sectorPath(cx, cy, r0, r1, a0, a1) {
  const p0 = polar(cx, cy, r1, a0),
    p1 = polar(cx, cy, r1, a1);
  const p2 = polar(cx, cy, r0, a1),
    p3 = polar(cx, cy, r0, a0);
  const sweep = (((a1 - a0) % 360) + 360) % 360;
  const large = sweep > 180 ? 1 : 0;
  return [
    `M ${p0.x} ${p0.y}`,
    `A ${r1} ${r1} 0 ${large} 1 ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${r0} ${r0} 0 ${large} 0 ${p3.x} ${p3.y}`,
    'Z',
  ].join(' ');
}

function colorForDistance(distance) {
  if (distance == null) return { color: '#2a2f36', thickness: 60 };
  if (distance <= 20) return { color: '#ff2d20', thickness: 16 };
  if (distance <= 35) return { color: '#ff9f0a', thickness: 24 };
  if (distance <= 60) return { color: '#ffd60a', thickness: 36 };
  return { color: '#19c37d', thickness: 60 };
}

// constrói semicírculo entre startDeg e endDeg
function buildSemiRing(container, opts) {
  const { startDeg, endDeg, segments = 4, rInner = 80, thickness = 24, gapDeg = 6 } = opts;
  const rOuter = rInner + thickness;
  const sweep = endDeg - startDeg;
  const step = sweep / segments;
  const nodes = [];
  for (let i = 0; i < segments; i++) {
    const a0 = startDeg + i * step + gapDeg / 2;
    const a1 = startDeg + (i + 1) * step - gapDeg / 2;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.dataset.a0 = a0; // guardando ângulos
    path.dataset.a1 = a1;
    path.dataset.rInner = rInner;
    path.setAttribute('d', sectorPath(0, 0, rInner, rOuter, a0, a1));
    path.setAttribute('fill', '#2a2f36');
    container.appendChild(path);
    nodes.push(path);
  }

  // função para atualizar depois
  nodes.updateThickness = function (nodeId, newThickness) {
    const path = nodes[nodeId];
    if (path) {
      const a0 = +path.dataset.a0,
        a1 = +path.dataset.a1;
      const rInner = +path.dataset.rInner;
      const rOuter = rInner + newThickness;
      path.setAttribute('d', sectorPath(0, 0, rInner, rOuter, a0, a1));
    }
  };

  return nodes;
}

// Frente (TOP): 0°→180° ; Traseira (BASE): 180°→360°
buildSemiRing(frontBackEl, { startDeg: 300, endDeg: 420, segments: 4, thickness: 60 });
buildSemiRing(rearBackEl, { startDeg: 120, endDeg: 240, segments: 4, thickness: 60 });
const frontSectors = buildSemiRing(frontEl, { startDeg: 300, endDeg: 420, segments: 4 });
const rearSectors = buildSemiRing(rearEl, { startDeg: 120, endDeg: 240, segments: 4 });

function paint(nodes, distances, sensorType) {
  let sensorDistances = [...distances];

  if (sensorType === 'rear') {
    sensorDistances = sensorDistances.reverse();
  }

  nodes.forEach((n, i) => {
    n.setAttribute('fill', colorForDistance(sensorDistances?.[i]).color);
    nodes.updateThickness(i, colorForDistance(sensorDistances?.[i]).thickness);
  });
}

function updateTiles() {
  const mk = (arr) =>
    arr
      .map((v, i) => {
        const col = colorForDistance(v).color;
        const val = v == null ? '—' : `${v} cm`;
        return `
          <div class="tile">
            <div class="cm" style="color:${col}">${val}</div>
            <div class="lbl">S${i + 1}</div>
          </div>`;
      })
      .join('');
  frontVals.innerHTML = mk(state.front);
  rearVals.innerHTML = mk(state.rear);
}

updateTiles();

// API pública para integrar com seus sensores
window.updateSensors = function (front, rear) {
  paint(frontSectors, front, 'front');
  paint(rearSectors, rear, 'rear');
};
