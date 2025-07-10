import { memo } from 'react';
import {
  NodeProps,
  Handle,
  Position
} from '@xyflow/react';
import { KafkaTopicNode as KafkaTopicNodeType } from './types';

const KafkaTopicNode = ({ data, isConnectable, selected }: NodeProps<KafkaTopicNodeType>) => {
  return (
    <div style={{ 
      border: '2px solid #000', 
      padding: '8px 12px', 
      background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
      color: 'white',
      borderRadius: 6,
      minWidth: 120,
      minHeight: 40,
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '10px',
      boxShadow: selected 
        ? '0 0 0 2px rgba(255, 107, 107, 0.5), 0 4px 12px rgba(0,0,0,0.4)' 
        : '0 2px 8px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable}
        style={{ 
          background: '#4a5568',
          border: '1px solid white',
          width: '8px',
          height: '8px',
          top: '-4px',
        }}
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable}
        style={{ 
          background: '#4a5568',
          border: '1px solid white',
          width: '8px',
          height: '8px',
          left: '-4px',
        }}
      />
      <div style={{ lineHeight: '1.2' }}>
        {data?.label ? data.label : 'Kafka Topic'}
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable}
        style={{ 
          background: '#4a5568',
          border: '1px solid white',
          width: '8px',
          height: '8px',
          bottom: '-4px',
        }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        isConnectable={isConnectable}
        style={{ 
          background: '#4a5568',
          border: '1px solid white',
          width: '8px',
          height: '8px',
          right: '-4px',
        }}
      />
    </div>
  );
};

KafkaTopicNode.displayName = 'KafkaTopicNode';

const MemoizedKafkaTopicNode = memo(KafkaTopicNode);
export default MemoizedKafkaTopicNode;
