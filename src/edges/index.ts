import type { Edge, EdgeTypes } from '@xyflow/react';
import { CftEdge } from './CftEdge';
import { MqEdge } from './MqEdge';
import { ApiEdge } from './ApiEdge';
import { KafkaPublisherEdge } from './KafkaPublisherEdge';
import { KafkaSubscriberEdge } from './KafkaSubscriberEdge';
import { ManualEdge } from './ManualEdge';
import { ExternalEdge } from './ExternalEdge';

export const initialEdges: Edge[] = [
  {
    id: 'demo-cft',
    source: 'source',
    target: 'cft-target',
    type: 'cft',
    reconnectable: true,
    data: {
      fromControlMJob: 'BATCH_JOB_001',
      toControlM: 'CTRL_M_PROD',
      fromPath: '/source/data',
      toPath: '/target/processed',
      centerLabel: 'CFT Transfer'
    }
  },
  {
    id: 'demo-mq',
    source: 'cft-target',
    target: 'mq-target',
    type: 'mq',
    reconnectable: true,
    data: {
      centerLabel: 'MQ Message Queue'
    }
  },
  {
    id: 'demo-api',
    source: 'mq-target',
    target: 'api-target',
    type: 'api',
    reconnectable: true,
    data: {
      usedEndpoints: ['GET /api/data', 'POST /api/process'],
      centerLabel: 'API Integration'
    }
  },
  {
    id: 'demo-kafka-pub',
    source: 'kafka-source',
    target: 'kafka-topic',
    type: 'kafka_pub',
    reconnectable: true,
    data: {
      centerLabel: 'Kafka Publisher'
    }
  },
  {
    id: 'demo-kafka-sub',
    source: 'kafka-topic',
    target: 'kafka-sub-target',
    type: 'kafka_sub',
    reconnectable: true,
    data: {
      centerLabel: 'Kafka Subscriber'
    }
  },
  {
    id: 'demo-manual',
    source: 'manual-source',
    target: 'external-source',
    type: 'manual',
    reconnectable: true,
    data: {
      centerLabel: 'Manual Entry'
    }
  },
  {
    id: 'demo-external',
    source: 'external-source',
    target: 'final-output',
    type: 'external',
    reconnectable: true,
    data: {
      centerLabel: 'External Entry'
    }
  }
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
