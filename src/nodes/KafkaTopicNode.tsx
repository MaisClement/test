import { memo } from 'react';
import {
  NodeProps,
  Handle,
  Position
} from '@xyflow/react';
import { KafkaTopicNode as KafkaTopicNodeType } from './types';

const KafkaTopicNode = ({ data, isConnectable }: NodeProps<KafkaTopicNodeType>) => {
  return (
    <div style={{ 
      border: '2px solid #444', 
      padding: 12, 
      background: '#4a4a4a',
      color: 'white',
      borderRadius: 8,
      minWidth: 120,
      textAlign: 'center',
      fontWeight: 'bold'
    }}>
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable}
        style={{ background: '#555' }}
      />
      <div>
        {data?.label ? data.label : 'Kafka Topic'}
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable}
        style={{ background: '#555' }}
      />
    </div>
  );
};

KafkaTopicNode.displayName = 'KafkaTopicNode';

const MemoizedKafkaTopicNode = memo(KafkaTopicNode);
export default MemoizedKafkaTopicNode;
