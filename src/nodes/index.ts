import type { NodeTypes } from '@xyflow/react';

import { PositionLoggerNode } from './PositionLoggerNode';
import ResizableGroupNode from './GroupNode';
import DefaultNode from './DefaultNode';
import KafkaTopicNode from './KafkaTopicNode';
import ApplicationNode from './ApplicationNode';
import ComponentNode from './ComponentNode';

export type { AppNode, DefaultNode, KafkaTopicNode, ApplicationNode, ComponentNode } from './types';
import type { AppNode } from './types';

// Données d'exemple reproduisant le schéma avec des blocs plus compacts
export const initialNodes: AppNode[] = [
  // Application 1 (bleue) - côté gauche
  {
    id: 'app-1',
    type: 'app',
    position: { x: 50, y: 80 },
    data: { label: 'CRL PROFESSIONNAL', appType: 'blue' },
    style: { width: 160, height: 140 },
  },
  
  // Composants de l'application 1
  {
    id: 'comp-1-1',
    type: 'component',
    position: { x: 10, y: 40 },
    parentId: 'app-1',
    data: { label: 'API 5\nCredit control', componentType: 'api' },
    style: { width: 140, height: 35 },
  },
  {
    id: 'comp-1-2',
    type: 'component',
    position: { x: 10, y: 85 },
    parentId: 'app-1',
    data: { label: 'API 6\nFunds notification', componentType: 'api' },
    style: { width: 140, height: 35 },
  },

  // Application 2 (bleue) - centre gauche
  {
    id: 'app-2',
    type: 'app',
    position: { x: 250, y: 80 },
    data: { label: 'Application 2', appType: 'blue' },
    style: { width: 140, height: 140 },
  },
  
  // Composants de l'application 2
  {
    id: 'comp-2-1',
    type: 'component',
    position: { x: 10, y: 40 },
    parentId: 'app-2',
    data: { label: 'API 5\nINI Manager', componentType: 'api' },
    style: { width: 120, height: 35 },
  },
  {
    id: 'comp-2-2',
    type: 'component',
    position: { x: 10, y: 80 },
    parentId: 'app-2',
    data: { label: 'API 6', componentType: 'api' },
    style: { width: 120, height: 30 },
  },

  // Application 3 (bleue) - centre
  {
    id: 'app-3',
    type: 'app',
    position: { x: 430, y: 80 },
    data: { label: 'Application 3', appType: 'blue' },
    style: { width: 140, height: 140 },
  },
  
  // Composants de l'application 3
  {
    id: 'comp-3-1',
    type: 'component',
    position: { x: 10, y: 40 },
    parentId: 'app-3',
    data: { label: 'API 5', componentType: 'api' },
    style: { width: 120, height: 30 },
  },
  {
    id: 'comp-3-2',
    type: 'component',
    position: { x: 10, y: 80 },
    parentId: 'app-3',
    data: { label: 'API 6', componentType: 'api' },
    style: { width: 120, height: 30 },
  },

  // Application 4 (verte) - grande application au centre-droite
  {
    id: 'app-4',
    type: 'app',
    position: { x: 610, y: 50 },
    data: { label: 'Application Verte', appType: 'green' },
    style: { width: 180, height: 180 },
  },
  
  // Composants de l'application 4
  {
    id: 'comp-4-1',
    type: 'component',
    position: { x: 10, y: 40 },
    parentId: 'app-4',
    data: { label: 'API 5\nOH WebService', componentType: 'api' },
    style: { width: 160, height: 40 },
  },
  {
    id: 'comp-4-2',
    type: 'component',
    position: { x: 10, y: 90 },
    parentId: 'app-4',
    data: { label: 'API 6', componentType: 'api' },
    style: { width: 160, height: 30 },
  },
  {
    id: 'comp-4-3',
    type: 'component',
    position: { x: 50, y: 130 },
    parentId: 'app-4',
    data: { label: '4d', componentType: 'service' },
    style: { width: 80, height: 30 },
  },

  // Application 5 (verte) - droite
  {
    id: 'app-5',
    type: 'app',
    position: { x: 830, y: 80 },
    data: { label: 'CRL AUTHENTIC', appType: 'green' },
    style: { width: 140, height: 100 },
  },
  
  // Composants de l'application 5
  {
    id: 'comp-5-1',
    type: 'component',
    position: { x: 10, y: 50 },
    parentId: 'app-5',
    data: { label: 'CRE_CRUDE_P', componentType: 'service' },
    style: { width: 120, height: 35 },
  },

  // Topics Kafka (indépendants) - plus compacts
  {
    id: 'kafka-topic-1',
    type: 'kafka-topic',
    position: { x: 450, y: 350 },
    data: { label: 'KAFKA_QUEUE_MESSAGE' },
    style: { width: 140, height: 50 },
  },
  {
    id: 'kafka-topic-2',
    type: 'kafka-topic',
    position: { x: 620, y: 350 },
    data: { label: 'KAFKA_QUEUE_MESSAGE' },
    style: { width: 140, height: 50 },
  },

  // Composants isolés pour certaines connexions - plus compacts
  {
    id: 'external-1',
    type: 'component',
    position: { x: 350, y: 350 },
    data: { label: 'IDF-FIN01CTC', componentType: 'other' },
    style: { width: 90, height: 40 },
  },
  {
    id: 'external-2',
    type: 'component',
    position: { x: 780, y: 350 },
    data: { label: 'External Service', componentType: 'other' },
    style: { width: 100, height: 40 },
  },
];

export const nodeTypes = {
  'position-logger': PositionLoggerNode,
  'group': ResizableGroupNode,
  'default': DefaultNode,
  'kafka-topic': KafkaTopicNode,
  'app': ApplicationNode,
  'component': ComponentNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
