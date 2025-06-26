import React from 'react';
import { EdgeProps } from '@xyflow/react';
import { BaseCustomEdge } from './BaseCustomEdge';
import type { CustomEdgeData } from './types';

export const ExternalEdge: React.FC<EdgeProps> = (props) => {
  const data = props.data as CustomEdgeData;
  
  return (
    <BaseCustomEdge
      {...props}
      data={data}
      height="default"
      color="green"
      hasStartMarker={false}
      hasEndMarker={true}
      hasCenterLabel={true}
      edgeType="external"
    />
  );
};
