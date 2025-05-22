import { NodeProps, Handle, Position } from '@xyflow/react';
import { memo } from 'react';

// Vous devrez peut-être définir un type pour les données de votre nœud classique ici
// Par exemple :
// export interface ClassicNodeData {
//   label: string;
//   // Ajoutez d'autres propriétés de données ici
// }

// Remplacez 'any' par le type de données de votre nœud si vous en avez défini un
const DefaultNode = ({ data, selected, isConnectable }: NodeProps<any>) => {
  return (
    <div style={{ border: '1px solid #777', padding: 10, background: 'white' }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>
        {data?.label ? data.label : 'Nœud Classique'}
      </div>
      {/* Vous pouvez ajouter plus de contenu ici en fonction des données de votre nœud */}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

export default memo(DefaultNode);
