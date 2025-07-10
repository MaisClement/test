import type { Node, BuiltInNode } from '@xyflow/react';

export type PositionLoggerNode = Node<{ label: string }, 'position-logger'>;
export type GroupNode = Node<{ label?: string }, 'group'>;
export type DefaultNode = Node<{ label?: string }, 'default'>;
export type KafkaTopicNode = Node<{ label?: string }, 'kafka-topic'>;

// Nouveau type pour les applications
export type ApplicationNode = Node<{
  label: string;
  appType: 'blue' | 'green' | 'other';
}, 'app'>;

// Nouveau type pour les composants à l'intérieur des applications
export type ComponentNode = Node<{
  label: string;
  componentType: 'api' | 'service' | 'database' | 'other';
}, 'component'>;

export type AppNode = BuiltInNode | PositionLoggerNode | GroupNode | DefaultNode | KafkaTopicNode | ApplicationNode | ComponentNode;
