import React from 'react';
import { EdgeProps } from '@xyflow/react';
import { BaseCustomEdge } from './BaseCustomEdge';
import type { CustomEdgeData } from './types';

export const MqEdge: React.FC<EdgeProps> = (props) => {
  const data = props.data as CustomEdgeData;
  
  return (
    <BaseCustomEdge
      {...props}
      data={data}
      height="wide"
      color="grey"
      hasStartMarker={false}
      hasEndMarker={true}
      hasCenterLabel={true}
      edgeType="mq"
    />
  );
};
