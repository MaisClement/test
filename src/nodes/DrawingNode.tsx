import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';

export interface DrawingNodeData extends Record<string, unknown> {
  svgPath: string;
  originalWidth: number;
  originalHeight: number;
  strokeColor?: string;
  fillColor?: string;
}

export type DrawingNode = Node<DrawingNodeData, 'drawing'>;

export default function DrawingNode({ data, selected }: NodeProps<DrawingNode>) {
  const { svgPath, originalWidth, originalHeight, strokeColor = '#000000', fillColor = '#000000' } = data;
  
  return (
    <>
      <NodeResizer 
        isVisible={selected} 
        minWidth={50} 
        minHeight={50}
        keepAspectRatio={false}
      />
      
      <div
        style={{
          width: '100%',
          height: '100%',
          border: selected ? '2px solid #0066cc' : '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${originalWidth} ${originalHeight}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          <path
            d={svgPath}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        
        {/* Handles pour connecter le node */}
        <Handle
          type="source"
          position={Position.Right}
          style={{ right: '-8px', background: '#0066cc' }}
        />
        <Handle
          type="target"
          position={Position.Left}
          style={{ left: '-8px', background: '#0066cc' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ bottom: '-8px', background: '#0066cc' }}
        />
        <Handle
          type="target"
          position={Position.Top}
          style={{ top: '-8px', background: '#0066cc' }}
        />
      </div>
    </>
  );
}