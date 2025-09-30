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
  type ReactFlowInstance,
  type Edge,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import { getStroke } from 'perfect-freehand';

import '@xyflow/react/dist/style.css';

import { initialNodes, nodeTypes, AppNode } from './nodes';
import { initialEdges, edgeTypes } from './edges';
import { EdgeTypeSelector } from './components/EdgeTypeSelector';
import type { DrawingNode } from './nodes/DrawingNode';

interface HelperLine {
  id: string;
  type: 'vertical' | 'horizontal';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const SNAP_THRESHOLD = 5; // Tolérance en pixels pour afficher les lignes

// Fonction utilitaire pour convertir un stroke en chemin SVG
function getSvgPathFromStroke(stroke: number[][], bounds?: { x: number; y: number; width: number; height: number }): string {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i) => {
      // Si des bounds sont fournis, faire les coordonnées relatives à la boîte englobante
      const x = bounds ? x0 - bounds.x : x0;
      const y = bounds ? y0 - bounds.y : y0;
      return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    },
    ''
  );

  return d + ' Z';
}

// Fonction utilitaire pour calculer les dimensions d'un dessin
function getDrawingBounds(points: number[][]): { x: number; y: number; width: number; height: number } {
  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 10), // Minimum 10px de largeur
    height: Math.max(maxY - minY, 10), // Minimum 10px de hauteur
  };
}

export default function App() {
  const edgeReconnectSuccessful = useRef(true);
  const reactFlowInstanceRef = useRef<ReactFlowInstance<AppNode, Edge> | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesState] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null); // État pour l'ID du nœud sélectionné
  const [helperLines, setHelperLines] = useState<HelperLine[]>([]);
  const [isEdgeTypeSelectorOpen, setIsEdgeTypeSelectorOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{ source: string; target: string } | null>(null);
  
  // États pour le mode dessin
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<number[][]>([]);
  const [currentDrawingScreen, setCurrentDrawingScreen] = useState<number[][]>([]); // Pour l'affichage temporaire
  const [isDrawing, setIsDrawing] = useState(false);


  const onConnect: OnConnect = useCallback(
    (connection) => {
      // Au lieu de créer directement l'edge, on stocke la connection et on ouvre le sélecteur
      setPendingConnection({
        source: connection.source || '',
        target: connection.target || ''
      });
      setIsEdgeTypeSelectorOpen(true);
    },
    [setPendingConnection, setIsEdgeTypeSelectorOpen]
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

          const draggingNodeWidth = typeof draggingNode.width === 'number' ? draggingNode.width : 150;
          const draggingNodeHeight = typeof draggingNode.height === 'number' ? draggingNode.height : 40;

          let snappedAbsoluteX = initialAbsoluteX;
          let snappedAbsoluteY = initialAbsoluteY;
          let didSnapX = false;
          let didSnapY = false;

          currentNodesSnapshot.forEach(node => {
            if (node.id === draggingNodeId || (node.type === 'group' || node.type === 'app')) return;

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
              if (node.id === draggingNodeId || (node.type === 'group' || node.type === 'app')) return;

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
                  { drag: draggingNodeTop, target: targetBottom, snapTo: targetBottom, label: 'top-bottom' },
                  { drag: draggingNodeBottom, target: targetTop, snapTo: targetTop - draggingNodeHeight, label: 'bottom-top' },
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
            if ((n.type !== 'group' && n.type !== 'app') || nodeId === n.id) return false;
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
        ...updatedProcessedNodes.filter((n) => n.type === 'group' || n.type === 'app'),
        ...updatedProcessedNodes.filter((n) => n.type !== 'group' && n.type !== 'app'),
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

  // Reorganize nodes handler
  const handleReorganizeNodes = useCallback(() => {
    setNodes((currentNodes) => {
      const updatedNodes = [...currentNodes];
      
      // Find all group and app nodes
      const containerNodes = updatedNodes.filter(node => node.type === 'group' || node.type === 'app');
      
      containerNodes.forEach(container => {
        // Find all nodes that belong to this container
        const containerChildren = updatedNodes.filter(node => node.parentId === container.id);
        
        if (containerChildren.length === 0) return;
        
        // Get container dimensions
        const containerWidth = typeof container.width === 'number' ? container.width : 200;
        const containerHeight = typeof container.height === 'number' ? container.height : 200;
        
        // Determine orientation based on container aspect ratio
        const isHorizontalLayout = containerWidth > containerHeight;
        
        // Calculate dimensions for each child node and sort them to preserve order
        const childrenWithDimensions = containerChildren.map(child => {
          const childWidth = typeof child.width === 'number' ? child.width : 
                            typeof child.style?.width === 'number' ? child.style.width : 150;
          const childHeight = typeof child.height === 'number' ? child.height : 
                             typeof child.style?.height === 'number' ? child.style.height : 40;
          return { ...child, calculatedWidth: childWidth, calculatedHeight: childHeight };
        });
        
        // Sort children based on the layout orientation to preserve order
        if (isHorizontalLayout) {
          // For horizontal layout, sort by current X position (left to right)
          childrenWithDimensions.sort((a, b) => a.position.x - b.position.x);
        } else {
          // For vertical layout, sort by current Y position (top to bottom)
          childrenWithDimensions.sort((a, b) => a.position.y - b.position.y);
        }
        
        // Marges: 30px pour le premier nœud, 10px pour les autres côtés
        const topMargin = 40;
        const sideMargin = 10;
        const bottomMargin = 10;
        const uniformSpacing = 10; // Espacement uniforme entre tous les nœuds
        
        // Calculer les dimensions nécessaires pour le conteneur
        const maxNodeWidth = Math.max(...childrenWithDimensions.map(child => child.calculatedWidth));
        const maxNodeHeight = Math.max(...childrenWithDimensions.map(child => child.calculatedHeight));
        const totalNodeWidth = childrenWithDimensions.reduce((sum, child) => sum + child.calculatedWidth, 0);
        const totalNodeHeight = childrenWithDimensions.reduce((sum, child) => sum + child.calculatedHeight, 0);
        const totalSpacingNeeded = (childrenWithDimensions.length - 1) * uniformSpacing;
        
        let newContainerWidth: number;
        let newContainerHeight: number;
        
        if (isHorizontalLayout) {
          // Pour un layout horizontal: largeur = somme des largeurs + espacement + marges
          newContainerWidth = totalNodeWidth + totalSpacingNeeded + (2 * sideMargin);
          // Hauteur = hauteur du plus grand nœud + marges
          newContainerHeight = maxNodeHeight + topMargin + bottomMargin;
          
          // Position nodes horizontally
          let currentX = sideMargin;
          childrenWithDimensions.forEach(child => {
            const nodeIndex = updatedNodes.findIndex(n => n.id === child.id);
            if (nodeIndex !== -1) {
              // Centrer chaque nœud verticalement par rapport au plus grand nœud
              const nodeY = topMargin + (maxNodeHeight - child.calculatedHeight) / 2;
              updatedNodes[nodeIndex] = {
                ...updatedNodes[nodeIndex],
                position: {
                  x: currentX,
                  y: nodeY
                }
              };
            }
            currentX += child.calculatedWidth + uniformSpacing;
          });
          
        } else {
          // Pour un layout vertical: largeur = largeur du plus grand nœud + marges
          newContainerWidth = maxNodeWidth + (2 * sideMargin);
          // Hauteur = somme des hauteurs + espacement + marges
          newContainerHeight = totalNodeHeight + totalSpacingNeeded + topMargin + bottomMargin;
          
          // Position nodes vertically
          let currentY = topMargin;
          childrenWithDimensions.forEach(child => {
            const nodeIndex = updatedNodes.findIndex(n => n.id === child.id);
            if (nodeIndex !== -1) {
              // Centrer chaque nœud horizontalement par rapport au plus grand nœud
              const nodeX = sideMargin + (maxNodeWidth - child.calculatedWidth) / 2;
              updatedNodes[nodeIndex] = {
                ...updatedNodes[nodeIndex],
                position: {
                  x: nodeX,
                  y: currentY
                }
              };
            }
            currentY += child.calculatedHeight + uniformSpacing;
          });
        }
        
        // Redimensionner le conteneur aux nouvelles dimensions calculées
        const containerIndex = updatedNodes.findIndex(n => n.id === container.id);
        if (containerIndex !== -1) {
          updatedNodes[containerIndex] = {
            ...updatedNodes[containerIndex],
            width: newContainerWidth,
            height: newContainerHeight
          };
        }
      });
      
      return updatedNodes;
    });
  }, [setNodes]);

  // Reorganize all nodes and groups handler using dagre layout
  const handleReorganizeAll = useCallback(() => {
    setNodes((currentNodes) => {
      const updatedNodes = [...currentNodes];
      
      // 1. D'abord, réorganiser tous les groupes et applications avec la même logique que handleReorganizeNodes
      const containerNodes = updatedNodes.filter(node => node.type === 'group' || node.type === 'app');
      
      containerNodes.forEach(container => {
        const containerChildren = updatedNodes.filter(node => node.parentId === container.id);
        
        if (containerChildren.length === 0) return;
        
        const containerWidth = typeof container.width === 'number' ? container.width : 200;
        const containerHeight = typeof container.height === 'number' ? container.height : 200;
        const isHorizontalLayout = containerWidth > containerHeight;
        
        const childrenWithDimensions = containerChildren.map(child => {
          const childWidth = typeof child.width === 'number' ? child.width : 
                            typeof child.style?.width === 'number' ? child.style.width : 150;
          const childHeight = typeof child.height === 'number' ? child.height : 
                             typeof child.style?.height === 'number' ? child.style.height : 40;
          return { ...child, calculatedWidth: childWidth, calculatedHeight: childHeight };
        });
        
        if (isHorizontalLayout) {
          childrenWithDimensions.sort((a, b) => a.position.x - b.position.x);
        } else {
          childrenWithDimensions.sort((a, b) => a.position.y - b.position.y);
        }
        
        const topMargin = 40;
        const sideMargin = 10;
        const bottomMargin = 10;
        const uniformSpacing = 10;
        
        const maxNodeWidth = Math.max(...childrenWithDimensions.map(child => child.calculatedWidth));
        const maxNodeHeight = Math.max(...childrenWithDimensions.map(child => child.calculatedHeight));
        const totalNodeWidth = childrenWithDimensions.reduce((sum, child) => sum + child.calculatedWidth, 0);
        const totalNodeHeight = childrenWithDimensions.reduce((sum, child) => sum + child.calculatedHeight, 0);
        const totalSpacingNeeded = (childrenWithDimensions.length - 1) * uniformSpacing;
        
        let newContainerWidth: number;
        let newContainerHeight: number;
        
        if (isHorizontalLayout) {
          newContainerWidth = totalNodeWidth + totalSpacingNeeded + (2 * sideMargin);
          newContainerHeight = maxNodeHeight + topMargin + bottomMargin;
          
          let currentX = sideMargin;
          childrenWithDimensions.forEach(child => {
            const nodeIndex = updatedNodes.findIndex(n => n.id === child.id);
            if (nodeIndex !== -1) {
              const nodeY = topMargin + (maxNodeHeight - child.calculatedHeight) / 2;
              updatedNodes[nodeIndex] = {
                ...updatedNodes[nodeIndex],
                position: { x: currentX, y: nodeY }
              };
            }
            currentX += child.calculatedWidth + uniformSpacing;
          });
        } else {
          newContainerWidth = maxNodeWidth + (2 * sideMargin);
          newContainerHeight = totalNodeHeight + totalSpacingNeeded + topMargin + bottomMargin;
          
          let currentY = topMargin;
          childrenWithDimensions.forEach(child => {
            const nodeIndex = updatedNodes.findIndex(n => n.id === child.id);
            if (nodeIndex !== -1) {
              const nodeX = sideMargin + (maxNodeWidth - child.calculatedWidth) / 2;
              updatedNodes[nodeIndex] = {
                ...updatedNodes[nodeIndex],
                position: { x: nodeX, y: currentY }
              };
            }
            currentY += child.calculatedHeight + uniformSpacing;
          });
        }
        
        const containerIndex = updatedNodes.findIndex(n => n.id === container.id);
        if (containerIndex !== -1) {
          updatedNodes[containerIndex] = {
            ...updatedNodes[containerIndex],
            width: newContainerWidth,
            height: newContainerHeight
          };
        }
      });

      // 2. Utiliser dagre pour organiser les nœuds de niveau supérieur (sans parentId)
      const topLevelNodes = updatedNodes.filter(node => !node.parentId);
      
      if (topLevelNodes.length > 0) {
        // Créer un graphe dagre
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        
        // Configuration du layout
        dagreGraph.setGraph({
          rankdir: 'TB', // Top to Bottom (hiérarchie verticale)
          align: 'UL',   // Alignement en haut à gauche
          nodesep: 150,  // Espacement horizontal entre nœuds
          ranksep: 200,  // Espacement vertical entre niveaux
          marginx: 50,   // Marge horizontale
          marginy: 50    // Marge verticale
        });
        
        // Ajouter tous les nœuds de niveau supérieur au graphe
        topLevelNodes.forEach(node => {
          const nodeWidth = typeof node.width === 'number' ? node.width : 
                           typeof node.style?.width === 'number' ? node.style.width : 150;
          const nodeHeight = typeof node.height === 'number' ? node.height : 
                            typeof node.style?.height === 'number' ? node.style.height : 40;
          
          dagreGraph.setNode(node.id, {
            width: nodeWidth,
            height: nodeHeight
          });
        });
        
        // Ajouter les edges qui connectent les nœuds de niveau supérieur
        edges.forEach(edge => {
          const sourceNode = topLevelNodes.find(n => n.id === edge.source);
          const targetNode = topLevelNodes.find(n => n.id === edge.target);
          
          if (sourceNode && targetNode) {
            dagreGraph.setEdge(edge.source, edge.target);
          }
        });
        
        // Calculer le layout
        dagre.layout(dagreGraph);
        
        // Appliquer les nouvelles positions
        topLevelNodes.forEach(node => {
          const nodeWithPosition = dagreGraph.node(node.id);
          const nodeIndex = updatedNodes.findIndex(n => n.id === node.id);
          
          if (nodeIndex !== -1 && nodeWithPosition) {
            // dagre donne les coordonnées du centre du nœud, 
            // il faut les convertir en coordonnées du coin supérieur gauche
            const nodeWidth = typeof node.width === 'number' ? node.width : 
                             typeof node.style?.width === 'number' ? node.style.width : 150;
            const nodeHeight = typeof node.height === 'number' ? node.height : 
                              typeof node.style?.height === 'number' ? node.style.height : 40;
            
            updatedNodes[nodeIndex] = {
              ...updatedNodes[nodeIndex],
              position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2
              }
            };
          }
        });
      }
      
      // S'assurer que les groupes et applications sont en arrière-plan
      return [
        ...updatedNodes.filter((n) => n.type === 'group' || n.type === 'app'),
        ...updatedNodes.filter((n) => n.type !== 'group' && n.type !== 'app'),
      ];
    });
  }, [setNodes, edges]);

  // Fit view handler
  const handleFitView = useCallback(() => {
    if (reactFlowInstanceRef.current) {
      reactFlowInstanceRef.current.fitView();
    }
  }, []);

  // Handler for ReactFlow instance initialization
  const onInit = useCallback((reactFlowInstance: ReactFlowInstance<AppNode, Edge>) => {
    reactFlowInstanceRef.current = reactFlowInstance;
  }, []);

  const handleEdgeTypeSelect = useCallback((edgeType: string) => {
    if (pendingConnection) {
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: pendingConnection.source,
        target: pendingConnection.target,
        type: edgeType,
        reconnectable: true,
        data: {
          centerLabel: getDefaultLabel(edgeType)
        }
      };
      
      setEdges((edges) => addEdge(newEdge, edges));
    }
    
    // Nettoyer les états
    setPendingConnection(null);
    setIsEdgeTypeSelectorOpen(false);
  }, [pendingConnection, setEdges]);

  const handleEdgeTypeSelectorCancel = useCallback(() => {
    setPendingConnection(null);
    setIsEdgeTypeSelectorOpen(false);
  }, []);

  // Fonction pour basculer le mode dessin
  const toggleDrawingMode = useCallback(() => {
    setIsDrawingMode(prev => !prev);
    setIsEraserMode(false); // Désactiver le mode gomme si activé
    setCurrentDrawing([]);
    setCurrentDrawingScreen([]);
    setIsDrawing(false);
  }, []);

  // Fonction pour basculer le mode gomme
  const toggleEraserMode = useCallback(() => {
    setIsEraserMode(prev => !prev);
    setIsDrawingMode(false); // Désactiver le mode dessin si activé
    setCurrentDrawing([]);
    setCurrentDrawingScreen([]);
    setIsDrawing(false);
  }, []);

  // Fonction pour convertir les coordonnées écran en coordonnées ReactFlow
  const getFlowCoordinates = useCallback((clientX: number, clientY: number) => {
    const reactFlowInstance = reactFlowInstanceRef.current;
    console.log({ x: clientX, y: clientY });
    if (!reactFlowInstance) return { x: clientX, y: clientY };
    
    const bounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (!bounds) return { x: clientX, y: clientY };
    
    const position = reactFlowInstance.screenToFlowPosition({
      x: clientX - bounds.left,
      y: clientY - bounds.top,
    });
    
    return position;
  }, []);

  // Fonction pour convertir les coordonnées écran en coordonnées relatives au container
  const getScreenCoordinates = useCallback((clientX: number, clientY: number) => {
    const bounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (!bounds) return { x: clientX, y: clientY };
    
    return {
      x: clientX - bounds.left,
      y: clientY - bounds.top,
    };
  }, []);

  // Fonction pour trouver le DrawingNode sous les coordonnées données
  const getDrawingNodeUnderPoint = useCallback((flowX: number, flowY: number) => {
    return nodes.find(node => {
      if (node.type !== 'drawing') return false;
      
      const nodeX = node.position.x;
      const nodeY = node.position.y;
      const nodeWidth = node.width || 150;
      const nodeHeight = node.height || 40;
      
      return (
        flowX >= nodeX &&
        flowX <= nodeX + nodeWidth &&
        flowY >= nodeY &&
        flowY <= nodeY + nodeHeight
      );
    });
  }, [nodes]);

  // Gestionnaires d'événements de dessin et gomme
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!isDrawingMode && !isEraserMode) return;
    
    event.preventDefault();
    
    if (isEraserMode) {
      // Mode gomme : supprimer le DrawingNode sous le curseur
      const flowCoords = getFlowCoordinates(event.clientX, event.clientY);
      const nodeToErase = getDrawingNodeUnderPoint(flowCoords.x, flowCoords.y);
      
      if (nodeToErase) {
        setNodes(nodes => nodes.filter(node => node.id !== nodeToErase.id));
        setEdges(edges => edges.filter(edge => 
          edge.source !== nodeToErase.id && edge.target !== nodeToErase.id
        ));
      }
      
      setIsDrawing(true); // Pour permettre l'effacement continu
    } else {
      // Mode dessin normal
      setIsDrawing(true);
      
      // Capturer à la fois les coordonnées flow et screen
      const flowCoords = getFlowCoordinates(event.clientX, event.clientY);
      const screenCoords = getScreenCoordinates(event.clientX, event.clientY);
      
      setCurrentDrawing([[flowCoords.x, flowCoords.y, 0.5]]);
      setCurrentDrawingScreen([[screenCoords.x, screenCoords.y, 0.5]]);
    }
  }, [isDrawingMode, isEraserMode, getFlowCoordinates, getScreenCoordinates, getDrawingNodeUnderPoint, setNodes, setEdges]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if ((!isDrawingMode && !isEraserMode) || !isDrawing) return;
    
    event.preventDefault();
    
    if (isEraserMode) {
      // Mode gomme : supprimer les DrawingNode sous le curseur pendant le mouvement
      const flowCoords = getFlowCoordinates(event.clientX, event.clientY);
      const nodeToErase = getDrawingNodeUnderPoint(flowCoords.x, flowCoords.y);
      
      if (nodeToErase) {
        setNodes(nodes => nodes.filter(node => node.id !== nodeToErase.id));
        setEdges(edges => edges.filter(edge => 
          edge.source !== nodeToErase.id && edge.target !== nodeToErase.id
        ));
      }
    } else {
      // Mode dessin normal
      // Capturer à la fois les coordonnées flow et screen
      const flowCoords = getFlowCoordinates(event.clientX, event.clientY);
      const screenCoords = getScreenCoordinates(event.clientX, event.clientY);
      
      setCurrentDrawing(prev => [...prev, [flowCoords.x, flowCoords.y, 0.5]]);
      setCurrentDrawingScreen(prev => [...prev, [screenCoords.x, screenCoords.y, 0.5]]);
    }
  }, [isDrawingMode, isEraserMode, isDrawing, getFlowCoordinates, getScreenCoordinates, getDrawingNodeUnderPoint, setNodes, setEdges]);

  const handleMouseUp = useCallback(() => {
    if ((!isDrawingMode && !isEraserMode) || !isDrawing) return;
    
    setIsDrawing(false);
    
    // En mode gomme, pas besoin de créer un dessin
    if (isEraserMode) {
      setCurrentDrawing([]);
      setCurrentDrawingScreen([]);
      return;
    }
    
    if (currentDrawing.length > 1) {
      // Générer le chemin SVG avec perfect-freehand
      const stroke = getStroke(currentDrawing, {
        size: 4,
        thinning: 0.5,
        smoothing: 0.6,
        streamline: 0.6,
        easing: (t: number) => t, // Linear easing
      });

      // Calculer les dimensions du dessin d'abord
      const bounds = getDrawingBounds(currentDrawing);
      
      // Créer un chemin SVG relatif à la boîte englobante
      const pathData = stroke.length ? getSvgPathFromStroke(stroke, bounds) : '';
      
      if (pathData) {
        // Créer un nouveau node de dessin
        const newNode: DrawingNode = {
          id: `drawing-${Date.now()}`,
          type: 'drawing',
          position: { x: bounds.x, y: bounds.y },
          data: {
            svgPath: pathData,
            originalWidth: bounds.width,
            originalHeight: bounds.height,
            strokeColor: '#000000',
            fillColor: '#000000', // Remplissage noir
          },
          width: bounds.width,
          height: bounds.height,
        };
        
        setNodes(nodes => [...nodes, newNode]);
      }
    }
    
    setCurrentDrawing([]);
    setCurrentDrawingScreen([]);
  }, [isDrawingMode, isEraserMode, isDrawing, currentDrawing, setNodes]);

  const getDefaultLabel = (edgeType: string): string => {
    const labelMap: { [key: string]: string } = {
      cft: 'CFT Transfer',
      mq: 'MQ Message Queue',
      api: 'API Integration',
      kafka_pub: 'Kafka Publisher',
      kafka_sub: 'Kafka Subscriber',
      manual: 'Manual Entry',
      external: 'External Entry'
    };
    return labelMap[edgeType] || 'Custom Edge';
  };

  return (
    <>
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        zIndex: 10,
        backgroundColor: 'white',
        padding: '5px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={handleFitView} 
          style={{ 
            backgroundColor: '#0066cc', 
            color: 'white', 
            border: 'none', 
            padding: '8px 12px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            marginRight: '8px'
          }}
        >
          Fit View
        </button>
        <button 
          onClick={toggleDrawingMode} 
          style={{ 
            backgroundColor: isDrawingMode ? '#ff6b6b' : '#4ecdc4', 
            color: 'white', 
            border: 'none', 
            padding: '8px 12px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            marginRight: '8px'
          }}
        >
          {isDrawingMode ? '✏️ Drawing ON' : '✏️ Drawing OFF'}
        </button>
        <button 
          onClick={toggleEraserMode} 
          style={{ 
            backgroundColor: isEraserMode ? '#ff6b6b' : '#f39c12', 
            color: 'white', 
            border: 'none', 
            padding: '8px 12px', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          {isEraserMode ? '🧹 Eraser ON' : '🧹 Eraser OFF'}
        </button>
      </div>
      
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
        onInit={onInit}
        reconnectRadius={20}
        defaultEdgeOptions={{ reconnectable: true }}
        fitView
        // Désactiver les interactions de pan en mode dessin ou gomme
        panOnDrag={!isDrawingMode && !isEraserMode}
        // Ajouter les gestionnaires d'événements de dessin et gomme
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        // Changer le curseur selon le mode actif
        style={{ cursor: isDrawingMode ? 'crosshair' : isEraserMode ? 'pointer' : 'default' }}
      >
        <Panel position="top-right">
          <button onClick={handleDebug} style={{ zIndex: 10, marginRight: '10px' }}>
            Debug Nodes & Edges
          </button>
          <button onClick={handleReorganizeNodes} style={{ zIndex: 10, marginRight: '10px', backgroundColor: '#0066cc', color: 'white' }}>
            Reorganize Groups
          </button>
          <button onClick={handleReorganizeAll} style={{ zIndex: 10, marginRight: '10px', backgroundColor: '#00cc66', color: 'white' }}>
            Reorganize All
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
        
        {/* Affichage du dessin en cours */}
        {isDrawing && currentDrawingScreen.length > 1 && (
          <path
            d={currentDrawingScreen.reduce((acc, [x, y], i) => {
              return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
            }, '')}
            fill="none"
            stroke="#000000"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      
      <EdgeTypeSelector
        isOpen={isEdgeTypeSelectorOpen}
        onSelect={handleEdgeTypeSelect}
        onCancel={handleEdgeTypeSelectorCancel}
        sourceNodeType={pendingConnection ? nodes.find(n => n.id === pendingConnection.source)?.type : undefined}
        targetNodeType={pendingConnection ? nodes.find(n => n.id === pendingConnection.target)?.type : undefined}
      />
    </>
  );
}
