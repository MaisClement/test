import React from 'react';
import { EdgeProps } from '@xyflow/react';
import { BaseCustomEdge } from './BaseCustomEdge';
import type { CftEdgeData } from './types';

export const CftEdge: React.FC<EdgeProps> = (props) => {
  const data = props.data as CftEdgeData;
  
  return (
    <BaseCustomEdge
      {...props}
      data={data}
      height="default"
      color="yellow"
      hasStartMarker={false}
      hasEndMarker={true}
      hasCenterLabel={true}
      edgeType="cft"
    />
  );
};
