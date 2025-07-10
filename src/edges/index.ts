import type { Edge, EdgeTypes } from '@xyflow/react';
import { CftEdge } from './CftEdge';
import { MqEdge } from './MqEdge';
import { ApiEdge } from './ApiEdge';
import { KafkaPublisherEdge } from './KafkaPublisherEdge';
import { KafkaSubscriberEdge } from './KafkaSubscriberEdge';
import { ManualEdge } from './ManualEdge';
import { ExternalEdge } from './ExternalEdge';

export const initialEdges: Edge[] = [
  // Connexions API (bleu/turquoise) entre les composants
  {
    id: 'api-1',
    source: 'comp-1-1',
    target: 'comp-2-1',
    type: 'api',
    reconnectable: true,
    data: {
      usedEndpoints: ['GET /api/credit', 'POST /api/validate'],
      centerLabel: '1c→10c'
    }
  },
  {
    id: 'api-2',
    source: 'comp-2-1',
    target: 'comp-3-1',
    type: 'api',
    reconnectable: true,
    data: {
      usedEndpoints: ['GET /api/ini'],
      centerLabel: '2c→9c'
    }
  },
  {
    id: 'api-3',
    source: 'comp-3-1',
    target: 'comp-4-1',
    type: 'api',
    reconnectable: true,
    data: {
      usedEndpoints: ['POST /api/webservice'],
      centerLabel: '3c→8c'
    }
  },
  {
    id: 'api-4',
    source: 'comp-1-2',
    target: 'comp-2-2',
    type: 'api',
    reconnectable: true,
    data: {
      usedEndpoints: ['GET /api/funds'],
      centerLabel: '11c→18c'
    }
  },
  {
    id: 'api-5',
    source: 'comp-2-2',
    target: 'comp-3-2',
    type: 'api',
    reconnectable: true,
    data: {
      centerLabel: '12c→17c'
    }
  },
  {
    id: 'api-6',
    source: 'comp-3-2',
    target: 'comp-4-2',
    type: 'api',
    reconnectable: true,
    data: {
      centerLabel: '13c→16c'
    }
  },
  {
    id: 'api-7',
    source: 'comp-4-1',
    target: 'comp-4-2',
    type: 'api',
    reconnectable: true,
    data: {
      centerLabel: '5c→6c'
    }
  },
  {
    id: 'api-8',
    source: 'comp-4-2',
    target: 'comp-4-3',
    type: 'api',
    reconnectable: true,
    data: {
      centerLabel: '4c→7c'
    }
  },
  {
    id: 'api-9',
    source: 'comp-4-2',
    target: 'comp-5-1',
    type: 'api',
    reconnectable: true,
    data: {
      centerLabel: '14c→15c'
    }
  },

  // Connexions CFT (jaune)
  {
    id: 'cft-1',
    source: 'external-1',
    target: 'kafka-topic-1',
    type: 'cft',
    reconnectable: true,
    data: {
      fromControlMJob: 'BATCH_001',
      toControlM: 'KAFKA_PROD',
      fromPath: '/data/input',
      toPath: '/kafka/topic',
      centerLabel: '1d'
    }
  },
  {
    id: 'cft-2',
    source: 'kafka-topic-1',
    target: 'kafka-topic-2',
    type: 'cft',
    reconnectable: true,
    data: {
      fromControlMJob: 'KAFKA_001',
      toControlM: 'KAFKA_002',
      centerLabel: '2d'
    }
  },
  {
    id: 'cft-3',
    source: 'kafka-topic-2',
    target: 'external-2',
    type: 'cft',
    reconnectable: true,
    data: {
      fromControlMJob: 'KAFKA_002',
      toControlM: 'EXT_SYS',
      centerLabel: '3d'
    }
  },

  // Quelques connexions MQ pour l'exemple
  {
    id: 'mq-1',
    source: 'comp-2-3',
    target: 'kafka-topic-1',
    type: 'mq',
    reconnectable: true,
    data: {
      centerLabel: 'Queue Message'
    }
  },
];

export const edgeTypes = {
  cft: CftEdge,
  mq: MqEdge,
  api: ApiEdge,
  kafka_pub: KafkaPublisherEdge,
  kafka_sub: KafkaSubscriberEdge,
  manual: ManualEdge,
  external: ExternalEdge,
} satisfies EdgeTypes;

// Export all edge components
export { CftEdge, MqEdge, ApiEdge, KafkaPublisherEdge, KafkaSubscriberEdge, ManualEdge, ExternalEdge };

// Export types
export type { CustomEdgeData, CftEdgeData, ApiEdgeData, EdgeHeight, EdgeColor } from './types';
