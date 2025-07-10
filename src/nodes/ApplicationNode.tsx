import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import type { ApplicationNode } from './types';

const ApplicationNode = memo(({ data, selected }: NodeProps<ApplicationNode>) => {
  const getAppStyles = (appType: string) => {
    switch (appType) {
      case 'blue':
        return {
          backgroundColor: '#4A90E2',
          borderColor: '#2B5B8F',
          color: 'white',
          headerColor: '#2B5B8F'
        };
      case 'green':
        return {
          backgroundColor: '#7ED321',
          borderColor: '#5A9A1A',
          color: 'white',
          headerColor: '#5A9A1A'
        };
      default:
        return {
          backgroundColor: '#6b7280',
          borderColor: '#374151',
          color: 'white',
          headerColor: '#374151'
        };
    }
  };

  const styles = getAppStyles(data.appType);

  return (
    <>
      {/* NodeResizer pour permettre le redimensionnement */}
      <NodeResizer
        color={styles.borderColor}
        isVisible={selected}
        minWidth={120}
        minHeight={80}
        lineStyle={{ strokeWidth: 2 }}
        handleStyle={{ 
          width: 8, 
          height: 8, 
          backgroundColor: styles.borderColor,
          border: '1px solid white'
        }}
      />
      
      <div
        style={{
          backgroundColor: styles.backgroundColor,
          border: `2px solid ${styles.borderColor}`,
          borderRadius: '8px',
          padding: '0',
          width: '100%',
          height: '100%',
          position: 'relative',
          boxShadow: selected 
            ? '0 0 0 2px rgba(255, 107, 107, 0.5), 0 4px 12px rgba(0,0,0,0.2)' 
            : '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Header avec le nom de l'application - plus compact */}
        <div
          style={{
            backgroundColor: styles.headerColor,
            color: 'white',
            padding: '6px 8px',
            fontWeight: 'bold',
            fontSize: '11px',
            textAlign: 'center',
            borderBottom: `1px solid ${styles.borderColor}`,
            marginBottom: '4px',
          }}
        >
          {data.label}
        </div>
        
        {/* Zone pour les composants enfants - réduite */}
        <div style={{
          padding: '4px',
          height: 'calc(100% - 30px)', // Ajuster selon la hauteur du header
          overflow: 'hidden',
        }}>
          {/* Les composants enfants seront automatiquement positionnés ici */}
        </div>
        
        {/* Handles invisibles car les connexions se font sur les composants */}
        <Handle
          type="target"
          position={Position.Top}
          style={{ opacity: 0, pointerEvents: 'none' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ opacity: 0, pointerEvents: 'none' }}
        />
      </div>
    </>
  );
});

ApplicationNode.displayName = 'ApplicationNode';

export default ApplicationNode;
