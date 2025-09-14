import {useMantineTheme} from '@mantine/core';
import type {SensorNode, SensorNodes} from '../types/sensorTypes';
import Car from './Car';

export default function SensorDraw({
  sensorNodes,
  buildSemiRingFrontBack,
  buildSemiRingRearBack,
}: {
  sensorNodes: SensorNodes;
  buildSemiRingFrontBack: () => SensorNode[];
  buildSemiRingRearBack: () => SensorNode[];
}) {
  const theme = useMantineTheme();

  return (
    <svg className="csvgCar" viewBox="-200 -140 400 280" aria-label="Parking aid">
      {/* <image href={car} transform="scale(0.35) translate(-90, -200)" /> */}
      <Car style={{translate: '-32px -70px', scale: '0.35', fill: theme.colors.dark[7]}} />
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
