import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { ComponentNode } from './types';

const ComponentNode = memo(({ data, selected }: NodeProps<ComponentNode>) => {
  const getComponentStyles = (componentType: string) => {
    switch (componentType) {
      case 'api':
        return {
          backgroundColor: '#ffffff',
          borderColor: '#d1d5db',
          color: '#374151',
          textColor: '#1f2937'
        };
      case 'service':
        return {
          backgroundColor: '#fef3c7',
          borderColor: '#f59e0b',
          color: '#92400e',
          textColor: '#92400e'
        };
      case 'database':
        return {
          backgroundColor: '#ede9fe',
          borderColor: '#8b5cf6',
          color: '#5b21b6',
          textColor: '#5b21b6'
        };
      default:
        return {
          backgroundColor: '#f9fafb',
          borderColor: '#9ca3af',
          color: '#374151',
          textColor: '#374151'
        };
    }
  };

  const styles = getComponentStyles(data.componentType);

  return (
    <div
      style={{
        backgroundColor: styles.backgroundColor,
        border: `1px solid ${styles.borderColor}`,
        borderRadius: '4px',
        padding: '6px 8px',
        minWidth: '80px',
        minHeight: '30px',
        position: 'relative',
        boxShadow: selected 
          ? '0 0 0 2px #ff6b6b, 0 2px 4px rgba(0,0,0,0.1)' 
          : '0 1px 3px rgba(0,0,0,0.08)',
        fontSize: '10px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: styles.textColor,
        lineHeight: '1.2',
        whiteSpace: 'pre-line', // Permet les sauts de ligne avec \n
      }}
    >
      {data.label}
      
      {/* Handles pour les connexions - plus petits */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: '5px',
          height: '5px',
          backgroundColor: '#6b7280',
          border: '1px solid white',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: '5px',
          height: '5px',
          backgroundColor: '#6b7280',
          border: '1px solid white',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: '5px',
          height: '5px',
          backgroundColor: '#6b7280',
          border: '1px solid white',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: '5px',
          height: '5px',
          backgroundColor: '#6b7280',
          border: '1px solid white',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      />
    </div>
  );
});

ComponentNode.displayName = 'ComponentNode';

export default ComponentNode;
