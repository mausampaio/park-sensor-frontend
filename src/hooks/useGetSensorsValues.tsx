import {useState} from 'react';
import toast from 'react-hot-toast';
import type {SemiCiclesProps, SensorMessage, SensorNode, SensorNodes} from '../types/sensorTypes';

export default function useGetSensorsValues() {
  let eventSource: EventSource | null = null;
  const [endpoint, setEndpoint] = useState<string>('http://localhost:8182/stream');
  const [status, setStatus] = useState<string>('desconectado');
  const [sensorsState, setSensorsState] = useState<{
    front: (number | null)[];
    rear: (number | null)[];
    lastMessageAt: number;
  }>({
    front: [null, null, null, null],
    rear: [null, null, null, null],
    lastMessageAt: 0,
  });
  const [sensorNodes, setSensorNodes] = useState<SensorNodes>({
    frontSectors: [],
    rearSectors: [],
  });

  localStorage.setItem('endpoint', endpoint);

  function connect() {
    const url = endpoint.trim();
    disconnect();

    if (!url) {
      return toast.error('Informe o endpoint do servidor');
    }

    eventSource = new EventSource(url);
    setStatus('conectando…');

    eventSource.onopen = () => {
      setStatus('conectado');
    };

    eventSource.onerror = () => {
      setStatus('erro / reconectando…');
    };

    eventSource.onmessage = (event: MessageEvent<string>) => {
      try {
        const message: SensorMessage = JSON.parse(event.data);
        message.cm.forEach((value) => {
          if (typeof value === 'number')
            setSensorsState((prevState) => ({
              ...prevState,
              [message.side]: value,
              lastMessageAt: Date.now(),
            }));
        });
        let distances = [...message.cm];

        if (message.side === 'rear') distances = distances.reverse();

        setSensorNodes((prevNodes) => {
          return message.side === 'front'
            ? {...prevNodes, frontSectors: buildSemiRingFront(distances)}
            : {...prevNodes, rearSectors: buildSemiRingRear(distances)};
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        toast.error('Erro ao processar dados do servidor');
      }
    };
  }

  function disconnect() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    setStatus('desconectado');
  }

  function polar(cx: number, cy: number, r: number, deg: number) {
    const a = ((deg - 90) * Math.PI) / 180;
    return {x: cx + r * Math.cos(a), y: cy + r * Math.sin(a)};
  }

  function sectorPath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
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

  function colorForDistance(distance: number | null) {
    if (distance == null) return {color: '#2a2f36', thickness: 60};
    if (distance <= 20) return {color: '#ff2d20', thickness: 16};
    if (distance <= 35) return {color: '#ff9f0a', thickness: 24};
    if (distance <= 60) return {color: '#ffd60a', thickness: 36};
    return {color: '#19c37d', thickness: 60};
  }

  function buildSemiRing(opts: SemiCiclesProps, distanceValues?: (number | null)[]): SensorNode[] {
    const {startDeg, endDeg, segments = 4, rInner = 80, gapDeg = 6} = opts;
    const sweep = endDeg - startDeg;
    const step = sweep / segments;
    const nodes: SensorNode[] = [];

    for (let i = 0; i < segments; i++) {
      const distance = distanceValues?.[i] ?? null;
      const {color, thickness} = colorForDistance(distance);
      const rOuter = rInner + thickness;
      const a0 = startDeg + i * step + gapDeg / 2;
      const a1 = startDeg + (i + 1) * step - gapDeg / 2;
      nodes[i] = {
        path: {
          d: sectorPath(0, 0, rInner, rOuter, a0, a1),
          fill: color,
        },
        distance: distanceValues?.[i] || null,
      };
    }

    return nodes;
  }

  function buildSemiRingFront(distanceValues: (number | null)[]) {
    return buildSemiRing({startDeg: 300, endDeg: 420, segments: 4}, distanceValues);
  }

  function buildSemiRingRear(distanceValues: (number | null)[]) {
    return buildSemiRing({startDeg: 120, endDeg: 240, segments: 4}, distanceValues);
  }

  function buildSemiRingFrontBack() {
    return buildSemiRing({startDeg: 300, endDeg: 420, segments: 4});
  }
  function buildSemiRingRearBack() {
    return buildSemiRing({startDeg: 120, endDeg: 240, segments: 4});
  }

  return {
    connect,
    disconnect,
    status,
    sensorsState,
    endpoint: {value: endpoint, setValue: setEndpoint},
    buildSemiRing,
    colorForDistance,
    sensorNodes,
    buildSemiRingFrontBack,
    buildSemiRingRearBack,
  };
}
