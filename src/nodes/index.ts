import type { NodeTypes } from '@xyflow/react';

import { PositionLoggerNode } from './PositionLoggerNode';
import ResizableGroupNode from './GroupNode';
import DefaultNode from './DefaultNode';
export type { AppNode, DefaultNode } from './types';

export const initialNodes: AppNode[] = [
  { id: 'a', type: 'input', position: { x: 0, y: 0 }, data: { label: 'wire' } },
  {
    id: 'b',
    type: 'group',
    position: { x: -100, y: 100 },
    style: { width: 200, height: 200 },
    data: { label: 'Groupe redimensionnable' },
  },
  { id: 'c', position: { x: 100, y: 100 }, data: { label: 'your ideas' } },
  {
    id: 'd',
    type: 'output',
    position: { x: 0, y: 200 },
    data: { label: 'with React Flow' },
  },
];

export const nodeTypes = {
  'position-logger': PositionLoggerNode,
  'group': ResizableGroupNode,
  'default': DefaultNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
