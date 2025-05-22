import type { Edge, EdgeTypes } from '@xyflow/react';

export const initialEdges: Edge[] = [
  // { id: 'a->c', source: 'a', target: 'c' },
  // { id: 'b->d', source: 'b', target: 'd' },
  { id: 'c->d', source: 'c', target: 'd' },
];

export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;
