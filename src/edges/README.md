# Custom Edges Documentation

Ce projet inclut plusieurs types d'edges personnalisés pour représenter différents types de connexions dans votre flow.

## Types d'Edges Disponibles

### 1. CFT Transfers (`cft`)
- **Couleur**: Rouge
- **Hauteur**: default
- **Marqueurs**: Flèche de fin uniquement
- **Label central**: Oui
- **Props spécifiques**:
  - `fromControlMJob`: Job Control-M source
  - `toControlM`: Control-M de destination
  - `fromPath`: Chemin source
  - `toPath`: Chemin de destination

### 2. MQ (`mq`)
- **Couleur**: Gris
- **Hauteur**: defaultr
- **Marqueurs**: Flèche de fin uniquement
- **Label central**: Oui

### 3. API Call / GRPC (`api`)
- **Couleur**: Turquoise
- **Hauteur**: default
- **Marqueurs**: Flèches de début et de fin
- **Label central**: Oui
- **Props spécifiques**:
  - `usedEndpoints`: Liste des endpoints utilisés

### 4. Kafka Publisher (`kafka_pub`)
- **Couleur**: Violet
- **Hauteur**: default
- **Marqueurs**: Flèche de fin uniquement
- **Label central**: Oui

### 5. Kafka Subscriber (`kafka_sub`)
- **Couleur**: Jaune
- **Hauteur**: default
- **Marqueurs**: Flèche de fin uniquement
- **Label central**: Oui

### 6. Manual Entry (`manual`)
- **Couleur**: Rouge
- **Hauteur**: Default
- **Marqueurs**: Flèche de fin uniquement
- **Label central**: Oui

### 7. External Entry (`external`)
- **Couleur**: Vert
- **Hauteur**: Default
- **Marqueurs**: Flèche de fin uniquement
- **Label central**: Oui

## Utilisation

```typescript
import { edgeTypes } from './edges';

// Exemple d'utilisation avec React Flow
const edges = [
  {
    id: 'cft-1',
    source: 'node1',
    target: 'node2',
    type: 'cft',
    data: {
      fromControlMJob: 'JOB_001',
      toControlM: 'CTRL_M_PROD',
      fromPath: '/data/input',
      toPath: '/data/output',
      centerLabel: 'CFT Transfer'
    }
  },
  {
    id: 'api-1',
    source: 'node2',
    target: 'node3',
    type: 'api',
    data: {
      usedEndpoints: ['GET /api/users', 'POST /api/orders'],
      centerLabel: 'API Calls'
    }
  }
];

<ReactFlow
  nodes={nodes}
  edges={edges}
  edgeTypes={edgeTypes}
/>
```

## Types de Données

### CustomEdgeData
Interface de base pour tous les edges personnalisés:
```typescript
interface CustomEdgeData {
  label?: string;
  requiredFields?: string[];
  centerLabel?: string;
  startLabel?: string;
  endLabel?: string;
}
```

### CftEdgeData
Interface spécifique aux edges CFT:
```typescript
interface CftEdgeData extends CustomEdgeData {
  fromControlMJob?: string;
  toControlM?: string;
  fromPath?: string;
  toPath?: string;
}
```

### ApiEdgeData
Interface spécifique aux edges API:
```typescript
interface ApiEdgeData extends CustomEdgeData {
  usedEndpoints?: string[];
}
```

## Personnalisation

Chaque edge peut être personnalisé en modifiant ses props dans le fichier correspondant. Les hauteurs disponibles sont:
- `default`: 2px
- `default`: 4px
- `defaultr`: 6px

Les couleurs disponibles sont définies dans le type `EdgeColor` et incluent toutes les couleurs utilisées par les différents types d'edges.
