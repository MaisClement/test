import { NodeResizer, NodeProps } from '@xyflow/react';
import { memo } from 'react';
import { GroupNode } from './types';

/**
 * Un nœud personnalisé pour rendre les groupes redimensionnables.
 * Ce composant ajoute des contrôles de redimensionnement à un nœud de type groupe.
 */
const ResizableGroupNode = ({ selected, id, data }: NodeProps<GroupNode>) => {
  return (
    <>
      {/* NodeResizer ajoute des poignées de redimensionnement sur tous les côtés/coins */}
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={80}
        lineClassName="react-flow__resize-control line"
        handleClassName="react-flow__resize-control handle"
      />
      
      {/* Contenu du nœud groupe */}
      <div className="custom-group-node">
        {data?.label && <div className="group-label">{data.label}</div>}
      </div>
    </>
  );
};

export default memo(ResizableGroupNode);
