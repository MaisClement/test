import Test, {
  NodeProps,
  Handle,
  Position
} from '@xyflow/react';
import { memo } from 'react';
import { DefaultNode as DefaultNodeType } from './types';

const DefaultNode = ({ data, isConnectable }: NodeProps<DefaultNodeType>) => {
  return (
    <div style={{ border: '1px solid #777', padding: 10, background: 'white' }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>
        {data?.label ? data.label : 'Nœud Classique'}
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

export default memo(DefaultNode);
