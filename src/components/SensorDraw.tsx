import car from '../assets/car.svg';
import type {SensorNode, SensorNodes} from '../types/sensorTypes';

export default function SensorDraw({
  sensorNodes,
  buildSemiRingFrontBack,
  buildSemiRingRearBack,
}: {
  sensorNodes: SensorNodes;
  buildSemiRingFrontBack: () => SensorNode[];
  buildSemiRingRearBack: () => SensorNode[];
}) {
  // transform = 'scale(0.046) rotate(90) translate(-1500, -700)';
  return (
    <svg className="csvgCar" viewBox="-200 -140 400 280" aria-label="Parking aid">
      <image href={car} transform="scale(0.35) translate(-90, -200)" />
      <g id="frontBack" className="ring">
        {buildSemiRingFrontBack().map((node, index) => (
          <path key={index} d={node.path.d} fill={node.path.fill} />
        ))}
      </g>
      <g id="front" className="ring">
        {sensorNodes.frontSectors.map((node, index) => (
          <path key={index} d={node.path.d} fill={node.path.fill} />
        ))}
      </g>
      <g id="rearBack" className="ring">
        {buildSemiRingRearBack().map((node, index) => (
          <path key={index} d={node.path.d} fill={node.path.fill} />
        ))}
      </g>
      <g id="rear" className="ring">
        {sensorNodes.rearSectors.map((node, index) => (
          <path key={index} d={node.path.d} fill={node.path.fill} />
        ))}
      </g>
    </svg>
  );
}
