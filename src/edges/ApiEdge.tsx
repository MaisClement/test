import React from 'react';
import { EdgeProps } from '@xyflow/react';
import { BaseCustomEdge } from './BaseCustomEdge';
import type { ApiEdgeData } from './types';

export const ApiEdge: React.FC<EdgeProps> = (props) => {
  const data = props.data as ApiEdgeData;
  
  return (
    <BaseCustomEdge
      {...props}
      data={data}
      height="default"
      color="turquoise"
      hasStartMarker={false}
      hasEndMarker={true}
      hasCenterLabel={true}
      edgeType="api"
    />
  );
};
