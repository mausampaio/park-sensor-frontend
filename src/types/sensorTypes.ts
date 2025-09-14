export interface SensorMessage {
  seq: number;
  side: 'front' | 'rear';
  age: number;
  cm: (number | null)[];
}

export interface SemiCiclesProps {
  startDeg: number;
  endDeg: number;
  segments: number;
  rInner?: number;
  gapDeg?: number;
}

export interface SvgPathProps {
  d: string;
  fill: string;
}

export interface SensorNode {
  path: SvgPathProps;
  distance?: number | null;
}

export interface SensorNodes {
  frontSectors: SensorNode[];
  rearSectors: SensorNode[];
}
