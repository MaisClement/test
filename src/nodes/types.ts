import type { Node, BuiltInNode } from '@xyflow/react';

export type PositionLoggerNode = Node<{ label: string }, 'position-logger'>;
export type GroupNode = Node<{ label?: string }, 'group'>;
export type DefaultNode = Node<{ label?: string }, 'default'>;
export type KafkaTopicNode = Node<{ label?: string }, 'kafka-topic'>;
export type AppNode = BuiltInNode | PositionLoggerNode | GroupNode | DefaultNode | KafkaTopicNode;
