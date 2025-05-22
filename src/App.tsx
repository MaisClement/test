import { useCallback, useRef, useState } from 'react'; // Ajout de useState
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type NodeChange,
  Panel,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { initialNodes, nodeTypes, AppNode } from './nodes';
import { initialEdges, edgeTypes } from './edges';

interface HelperLine {
  id: string;
  type: 'vertical' | 'horizontal';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const SNAP_THRESHOLD = 5; // Tolérance en pixels pour afficher les lignes

export default function App() {
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesState] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null); // État pour l'ID du nœud sélectionné
  const [helperLines, setHelperLines] = useState<HelperLine[]>([]);


  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(() => {
    edgeReconnectSuccessful.current = true;
  }, []);

  const onReconnectEnd = useCallback((_: unknown, edge: { id: string }) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }
    edgeReconnectSuccessful.current = true;
  }, [setEdges]);

  const customOnNodesChange = useCallback((changes: NodeChange<AppNode>[]) => {
    // Créez une copie des changements pour pouvoir les modifier si nécessaire pour le snapping.
    // React Flow s'attend à ce que les objets `change` puissent être modifiés.
    const processedChanges = changes.map(ch => ({ ...ch, position: ch.type === 'position' && ch.position ? { ...ch.position } : undefined }));

    const newHelperLinesAccumulator: HelperLine[] = [];
    let activeDraggingForHelperLines = false;

    processedChanges.forEach(change => {
      if (change.type === 'select') {
        if (change.selected) {
          setSelectedNodeId(change.id);
        } else if (selectedNodeId === change.id && !change.selected) {
          setSelectedNodeId(null);
        }
      }

      if (change.type === 'position' && change.id && change.position) {
        const draggingNodeId = change.id;
        const currentNodesSnapshot = nodes; // Utiliser l'état `nodes` actuel pour les positions des autres nœuds
        const draggingNode = currentNodesSnapshot.find(n => n.id === draggingNodeId);

        if (draggingNode) {
          // --- Début de la logique de Snapping (s'applique à dragging ET à la fin du drag) ---
          let initialAbsoluteX = change.position.x;
          let initialAbsoluteY = change.position.y;

          if (draggingNode.parentId) {
            const parentNode = currentNodesSnapshot.find(n => n.id === draggingNode.parentId);
            if (parentNode) {
              initialAbsoluteX = parentNode.position.x + change.position.x;
              initialAbsoluteY = parentNode.position.y + change.position.y;
            }
          }

          const draggingNodeWidth = typeof draggingNode.width === 'number' ? draggingNode.width : (typeof draggingNode.style?.width === 'number' ? draggingNode.style.width : 150);
          const draggingNodeHeight = typeof draggingNode.height === 'number' ? draggingNode.height : (typeof draggingNode.style?.height === 'number' ? draggingNode.style.height : 40);

          let snappedAbsoluteX = initialAbsoluteX;
          let snappedAbsoluteY = initialAbsoluteY;
          let didSnapX = false;
          let didSnapY = false;

          currentNodesSnapshot.forEach(node => {
            if (node.id === draggingNodeId || node.type === 'group') return;

            let targetNodeAbsoluteX = node.position.x;
            let targetNodeAbsoluteY = node.position.y;
            if (node.parentId) {
              const parent = currentNodesSnapshot.find(p => p.id === node.parentId);
              if (parent) {
                targetNodeAbsoluteX = parent.position.x + node.position.x;
                targetNodeAbsoluteY = parent.position.y + node.position.y;
              }
            }

            const targetNodeWidth = typeof node.width === 'number' ? node.width : (typeof node.style?.width === 'number' ? node.style.width : 150);
            const targetNodeHeight = typeof node.height === 'number' ? node.height : (typeof node.style?.height === 'number' ? node.style.height : 40);

            const targetLeft = targetNodeAbsoluteX;
            const targetRight = targetNodeAbsoluteX + targetNodeWidth;
            const targetCenterX = targetNodeAbsoluteX + targetNodeWidth / 2;
            const targetTop = targetNodeAbsoluteY;
            const targetBottom = targetNodeAbsoluteY + targetNodeHeight;
            const targetCenterY = targetNodeAbsoluteY + targetNodeHeight / 2;

            const currentDragLeft = initialAbsoluteX;
            const currentDragRight = initialAbsoluteX + draggingNodeWidth;
            const currentDragCenterX = initialAbsoluteX + draggingNodeWidth / 2;
            const currentDragTop = initialAbsoluteY;
            const currentDragBottom = initialAbsoluteY + draggingNodeHeight;
            const currentDragCenterY = initialAbsoluteY + draggingNodeHeight / 2;

            const verticalSnapChecks = [
              { dragOrigin: currentDragLeft, target: targetLeft, snapTo: targetLeft, label: 'left-left' },
              { dragOrigin: currentDragRight, target: targetRight, snapTo: targetRight - draggingNodeWidth, label: 'right-right' },
              { dragOrigin: currentDragCenterX, target: targetCenterX, snapTo: targetCenterX - draggingNodeWidth / 2, label: 'center-center-x' },
              { dragOrigin: currentDragLeft, target: targetRight, snapTo: targetRight, label: 'left-right' },
              { dragOrigin: currentDragRight, target: targetLeft, snapTo: targetLeft - draggingNodeWidth, label: 'right-left' },
            ];

            verticalSnapChecks.forEach(vCheck => {
              if (Math.abs(vCheck.dragOrigin - vCheck.target) < SNAP_THRESHOLD) {
                if (!didSnapX) {
                  snappedAbsoluteX = vCheck.snapTo;
                  didSnapX = true;
                }
              }
            });

            const horizontalSnapChecks = [
              { dragOrigin: currentDragTop, target: targetTop, snapTo: targetTop, label: 'top-top' },
              { dragOrigin: currentDragBottom, target: targetBottom, snapTo: targetBottom - draggingNodeHeight, label: 'bottom-bottom' },
              { dragOrigin: currentDragCenterY, target: targetCenterY, snapTo: targetCenterY - draggingNodeHeight / 2, label: 'center-center-y' },
              { dragOrigin: currentDragTop, target: targetBottom, snapTo: targetBottom, label: 'top-bottom' },
              { dragOrigin: currentDragBottom, target: targetTop, snapTo: targetTop - draggingNodeHeight, label: 'bottom-top' }, // Corrigé ici, c'était targetTop - draggingNodeHeight
            ];

            horizontalSnapChecks.forEach(hCheck => {
              if (Math.abs(hCheck.dragOrigin - hCheck.target) < SNAP_THRESHOLD) {
                if (!didSnapY) {
                  snappedAbsoluteY = hCheck.snapTo;
                  didSnapY = true;
                }
              }
            });
          });

          if (didSnapX || didSnapY) {
            const finalNewPosX = didSnapX ? snappedAbsoluteX : initialAbsoluteX;
            const finalNewPosY = didSnapY ? snappedAbsoluteY : initialAbsoluteY;

            if (draggingNode.parentId) {
              const parentNode = currentNodesSnapshot.find(n => n.id === draggingNode.parentId);
              if (parentNode && change.position) {
                change.position.x = finalNewPosX - parentNode.position.x;
                change.position.y = finalNewPosY - parentNode.position.y;
              } else if (change.position) {
                change.position.x = finalNewPosX;
                change.position.y = finalNewPosY;
              }
            } else if (change.position) {
              change.position.x = finalNewPosX;
              change.position.y = finalNewPosY;
            }
          }
          // --- Fin de la logique de Snapping ---

          if (change.dragging) { // Helper lines uniquement pendant le drag actif
            activeDraggingForHelperLines = true;
            // --- Début de la logique des Helper Lines (basée sur la position potentiellement snappée) ---
            let finalDraggingNodeAbsoluteX = change.position?.x ?? initialAbsoluteX;
            let finalDraggingNodeAbsoluteY = change.position?.y ?? initialAbsoluteY;

            if (draggingNode.parentId) {
              const parentNode = currentNodesSnapshot.find(n => n.id === draggingNode.parentId);
              if (parentNode) {
                // Recalculer la position absolue basée sur la position relative (potentiellement snappée) dans change.position
                finalDraggingNodeAbsoluteX = parentNode.position.x + (change.position?.x ?? initialAbsoluteX); 
                finalDraggingNodeAbsoluteY = parentNode.position.y + (change.position?.y ?? initialAbsoluteY);
              }
            } else {
                 // Si pas de parent, change.position est déjà absolu (et potentiellement snappé)
                 finalDraggingNodeAbsoluteX = change.position?.x ?? initialAbsoluteX;
                 finalDraggingNodeAbsoluteY = change.position?.y ?? initialAbsoluteY;
            }
            
            const draggingNodeLeft = finalDraggingNodeAbsoluteX;
            const draggingNodeRight = finalDraggingNodeAbsoluteX + draggingNodeWidth;
            const draggingNodeCenterX = finalDraggingNodeAbsoluteX + draggingNodeWidth / 2;
            const draggingNodeTop = finalDraggingNodeAbsoluteY;
            const draggingNodeBottom = finalDraggingNodeAbsoluteY + draggingNodeHeight;
            const draggingNodeCenterY = finalDraggingNodeAbsoluteY + draggingNodeHeight / 2;

            currentNodesSnapshot.forEach(node => {
              if (node.id === draggingNodeId || node.type === 'group') return;

              let targetNodeAbsoluteX = node.position.x;
              let targetNodeAbsoluteY = node.position.y;
              if (node.parentId) {
                  const parent = currentNodesSnapshot.find(p => p.id === node.parentId);
                  if (parent) {
                      targetNodeAbsoluteX = parent.position.x + node.position.x;
                      targetNodeAbsoluteY = parent.position.y + node.position.y;
                  }
              }

              const targetNodeWidth = typeof node.width === 'number' ? node.width : (typeof node.style?.width === 'number' ? node.style.width : 150);
              const targetNodeHeight = typeof node.height === 'number' ? node.height : (typeof node.style?.height === 'number' ? node.style.height : 40);

              const targetLeft = targetNodeAbsoluteX;
              const targetRight = targetNodeAbsoluteX + targetNodeWidth;
              const targetCenterX = targetNodeAbsoluteX + targetNodeWidth / 2;
              const targetTop = targetNodeAbsoluteY;
              const targetBottom = targetNodeAbsoluteY + targetNodeHeight;
              const targetCenterY = targetNodeAbsoluteY + targetNodeHeight / 2;
              
              const verticalChecks = [
                { drag: draggingNodeLeft, target: targetLeft, label: 'left-left' },
                { drag: draggingNodeRight, target: targetRight, label: 'right-right' },
                { drag: draggingNodeCenterX, target: targetCenterX, label: 'center-center-x' },
                { drag: draggingNodeLeft, target: targetRight, label: 'left-right' },
                { drag: draggingNodeRight, target: targetLeft, label: 'right-left' },
              ];

              verticalChecks.forEach(check => {
                if (Math.abs(check.drag - check.target) < SNAP_THRESHOLD) {
                  const y1 = Math.min(draggingNodeTop, targetTop, draggingNodeBottom, targetBottom);
                  const y2 = Math.max(draggingNodeTop, targetTop, draggingNodeBottom, targetBottom);
                  // S'assurer que la ligne est dessinée à la position de la cible (qui est aussi la position snappée)
                  newHelperLinesAccumulator.push({ id: `v-${draggingNodeId}-${node.id}-${check.label}`, type: 'vertical', x1: check.target, y1, x2: check.target, y2 });
                }
              });

              const horizontalChecks = [
                  { drag: draggingNodeTop, target: targetTop, label: 'top-top' },
                  { drag: draggingNodeBottom, target: targetBottom, label: 'bottom-bottom' },
                  { drag: draggingNodeCenterY, target: targetCenterY, label: 'center-center-y' },
                  { drag: draggingNodeTop, target: targetBottom, label: 'top-bottom' },
                  { drag: draggingNodeBottom, target: targetTop, label: 'bottom-top' },
              ];

              horizontalChecks.forEach(check => {
                  if (Math.abs(check.drag - check.target) < SNAP_THRESHOLD) {
                      const x1 = Math.min(draggingNodeLeft, targetLeft, draggingNodeRight, targetRight);
                      const x2 = Math.max(draggingNodeLeft, targetLeft, draggingNodeRight, targetRight);
                      // S'assurer que la ligne est dessinée à la position de la cible
                      newHelperLinesAccumulator.push({ id: `h-${draggingNodeId}-${node.id}-${check.label}`, type: 'horizontal', x1, y1: check.target, x2, y2: check.target });
                  }
              });
            });
            // --- Fin de la logique des Helper Lines ---
          }
        }
      }
    });
    
    onNodesChange(processedChanges); // Appliquer les changements standards (potentiellement avec positions snappées)

    if (activeDraggingForHelperLines) {
      const uniqueLines = Array.from(new Map(newHelperLinesAccumulator.map(line => [line.id, line])).values());
      setHelperLines(uniqueLines);
    } else {
      if (helperLines.length > 0) {
        setHelperLines([]);
      }
    }

    // Logique de groupe existante (utilise `processedChanges` via l'état `nodes` mis à jour par `onNodesChange`)
    setNodes((currentNodes) => {
      let updatedProcessedNodes = [...currentNodes]; // Travailler sur la version la plus à jour des nœuds

      // La logique de groupe s'applique lorsque dragging === false.
      // Les positions dans `processedChanges` pour `dragging === false` sont les positions finales après le drag.
      processedChanges.forEach((change) => {
        if (change.type === 'position' && change.dragging === false && change.id && change.position) {
          const nodeId = change.id;
          // Trouver le nœud dans l'état actuel des nœuds (updatedProcessedNodes)
          // car `change.position` est relatif à l'état AVANT ce batch de `setNodes`.
          // Il est plus sûr de se baser sur l'état `nodes` qui a été mis à jour par `onNodesChange(processedChanges)`.
          // Pour la logique de groupe, nous avons besoin de la position absolue finale.
          
          const nodeFromCurrentState = updatedProcessedNodes.find((n) => n.id === nodeId);

          if (!nodeFromCurrentState) {
            console.warn(`Node with id ${nodeId} not found in current state for group logic. Skipping.`);
            return;
          }
          
          // La position du nœud dans nodeFromCurrentState est déjà la position finale (absolue ou relative au parent)
          // après le onNodesChange.
          let finalNodeAbsoluteX: number;
          let finalNodeAbsoluteY: number;

          if (nodeFromCurrentState.parentId) {
            const parentNode = updatedProcessedNodes.find(n => n.id === nodeFromCurrentState.parentId);
            if (parentNode) {
              finalNodeAbsoluteX = parentNode.position.x + nodeFromCurrentState.position.x;
              finalNodeAbsoluteY = parentNode.position.y + nodeFromCurrentState.position.y;
            } else { // Devrait être rare si la structure est cohérente
              finalNodeAbsoluteX = nodeFromCurrentState.position.x;
              finalNodeAbsoluteY = nodeFromCurrentState.position.y;
            }
          } else {
            finalNodeAbsoluteX = nodeFromCurrentState.position.x;
            finalNodeAbsoluteY = nodeFromCurrentState.position.y;
          }

          const nodeWidth = typeof nodeFromCurrentState.width === 'number' ? nodeFromCurrentState.width : (typeof nodeFromCurrentState.style?.width === 'number' ? nodeFromCurrentState.style.width : 150);
          const nodeHeight = typeof nodeFromCurrentState.height === 'number' ? nodeFromCurrentState.height : (typeof nodeFromCurrentState.style?.height === 'number' ? nodeFromCurrentState.style.height : 40);
          const nodeCenterX = finalNodeAbsoluteX + (nodeWidth / 2);
          const nodeCenterY = finalNodeAbsoluteY + (nodeHeight / 2);

          const targetGroup = updatedProcessedNodes.find((n) => {
            if (n.type !== 'group' || nodeId === n.id) return false;
            const groupX = n.position.x;
            const groupY = n.position.y;
            const groupW = typeof n.width === 'number' ? n.width : typeof n.style?.width === 'number' ? n.style.width : 200;
            const groupH = typeof n.height === 'number' ? n.height : typeof n.style?.height === 'number' ? n.style.height : 200;

            return (
              nodeCenterX > groupX &&
              nodeCenterX < groupX + groupW &&
              nodeCenterY > groupY &&
              nodeCenterY < groupY + groupH
            );
          });

          if (targetGroup && nodeFromCurrentState.parentId !== targetGroup.id) {
            const groupX = targetGroup.position.x;
            const groupY = targetGroup.position.y;
            const newRelativePos = {
              x: finalNodeAbsoluteX - groupX,
              y: finalNodeAbsoluteY - groupY,
            };
            updatedProcessedNodes = updatedProcessedNodes.map((n) =>
              n.id === nodeId ? { ...n, parentId: targetGroup.id, position: newRelativePos } : n
            );
          } else if (!targetGroup && nodeFromCurrentState.parentId) {
            updatedProcessedNodes = updatedProcessedNodes.map((n) =>
              n.id === nodeId ? { ...n, parentId: undefined, position: { x: finalNodeAbsoluteX, y: finalNodeAbsoluteY } } : n
            );
          }
        }
      });

      updatedProcessedNodes = [
        ...updatedProcessedNodes.filter((n) => n.type === 'group'),
        ...updatedProcessedNodes.filter((n) => n.type !== 'group'),
      ];

      return updatedProcessedNodes;
    });
  }, [nodes, onNodesChange, selectedNodeId, setNodes, helperLines]); // Ajout de nodes et helperLines aux dépendances

  // Debug button handler
  const handleDebug = useCallback(() => {
    console.log('Nodes:', nodes);
    console.log('Edges:', edges);
  }, [nodes, edges]);

  // Delete node handler
  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId) return;

    setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
    setSelectedNodeId(null); // Désélectionner après la suppression
  }, [selectedNodeId, setNodes, setEdges]);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={customOnNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesState}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        onConnect={onConnect}
        fitView
      >
        <Panel position="top-right">
          <button onClick={handleDebug} style={{ zIndex: 10, marginRight: '10px' }}>
            Debug Nodes & Edges
          </button>
          {selectedNodeId && (
            <button onClick={handleDeleteNode} style={{ zIndex: 10, backgroundColor: 'red', color: 'white' }}>
              Delete Selected Node
            </button>
          )}
        </Panel>

        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
      {/* Helper Lines SVG */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
        {helperLines.map(line => (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(0, 150, 255, 0.7)" // Couleur bleue pour les lignes
            strokeWidth={1}
            strokeDasharray="4,4" // Ligne pointillée
          />
        ))}
      </svg>
    </>
  );
}
