import {Box} from '@mantine/core';
import type {CSSProperties} from 'react';

const dotStyle: CSSProperties = {
  display: 'inline-block',
  width: '12px',
  height: '12px',
  borderRadius: '12px',
  marginRight: '4px',
};

export default function DotLegend({label, bgColor}: {label: string; bgColor: string}) {
  return (
    <Box>
      <span style={{...dotStyle, backgroundColor: bgColor}}></span>
      <span>{label}</span>
    </Box>
  );
}
