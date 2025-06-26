import type { NodeTypes } from '@xyflow/react';

import { PositionLoggerNode } from './PositionLoggerNode';
import ResizableGroupNode from './GroupNode';
import DefaultNode from './DefaultNode';
import KafkaTopicNode from './KafkaTopicNode';
export type { AppNode, DefaultNode, KafkaTopicNode } from './types';
import type { AppNode } from './types';

export const initialNodes: AppNode[] = [
  { id: 'source', type: 'input', position: { x: 50, y: 50 }, data: { label: 'Source' } },
  { id: 'cft-target', type: 'default', position: { x: 300, y: 50 }, data: { label: 'CFT Target' } },
  { id: 'mq-target', type: 'default', position: { x: 550, y: 50 }, data: { label: 'MQ Target' } },
  { id: 'api-target', type: 'default', position: { x: 800, y: 50 }, data: { label: 'API Target' } },
  
  { id: 'kafka-source', type: 'default', position: { x: 50, y: 200 }, data: { label: 'Kafka Source' } },
  { id: 'kafka-topic', type: 'kafka-topic', position: { x: 300, y: 200 }, data: { label: 'Kafka Topic' } },
  { id: 'kafka-pub-target', type: 'default', position: { x: 450, y: 150 }, data: { label: 'Publisher' } },
  { id: 'kafka-sub-target', type: 'default', position: { x: 450, y: 250 }, data: { label: 'Subscriber' } },
  
  { id: 'manual-source', type: 'default', position: { x: 50, y: 350 }, data: { label: 'Manual Source' } },
  { id: 'external-source', type: 'default', position: { x: 300, y: 350 }, data: { label: 'External Source' } },
  { id: 'final-output', type: 'output', position: { x: 550, y: 350 }, data: { label: 'Final Output' } },
];

export const nodeTypes = {
  'position-logger': PositionLoggerNode,
  'group': ResizableGroupNode,
  'default': DefaultNode,
  'kafka-topic': KafkaTopicNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
