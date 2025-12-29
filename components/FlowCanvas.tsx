
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WorkflowNode, WorkflowEdge, NodeType, NodePosition, ConnectionState } from '../types';
import { NODE_CONFIG } from '../constants';
import { Trash2, Plus } from 'lucide-react';

interface FlowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: WorkflowEdge[]) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  selectedEdgeId: string | null;
  setSelectedEdgeId: (id: string | null) => void;
  onDropNode: (type: NodeType, x: number, y: number) => void;
}

const FlowCanvas: React.FC<FlowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  selectedNodeId,
  setSelectedNodeId,
  selectedEdgeId,
  setSelectedEdgeId,
  onDropNode
}) => {
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [connection, setConnection] = useState<ConnectionState | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const getCanvasCoords = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left - pan.x,
      y: clientY - rect.top - pan.y
    };
  };

  const handleMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation();
    if (e.button !== 0) return; 
    setDraggingNodeId(node.id);
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
  };

  const startConnection = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setConnection({
      sourceId: nodeId,
      mouseX: coords.x,
      mouseY: coords.y
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
    } else if (e.button === 0) {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      if (connection) setConnection(null);
    }
  };

  // Fix: Added deleteNode function to remove a node and all its incoming/outgoing edges.
  const deleteNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    onNodesChange(nodes.filter(n => n.id !== nodeId));
    onEdgesChange(edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingNodeId) {
      const updatedNodes = nodes.map(n => {
        if (n.id === draggingNodeId) {
          return {
            ...n,
            position: {
              x: e.clientX - dragOffset.x,
              y: e.clientY - dragOffset.y
            }
          };
        }
        return n;
      });
      onNodesChange(updatedNodes);
    } else if (isPanning) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    } else if (connection) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setConnection(prev => prev ? { ...prev, mouseX: coords.x, mouseY: coords.y } : null);
    }
  }, [draggingNodeId, isPanning, connection, nodes, dragOffset, onNodesChange]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    setDraggingNodeId(null);
    setIsPanning(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const onNodeClick = (e: React.MouseEvent, targetId: string) => {
    if (connection && connection.sourceId !== targetId) {
      e.stopPropagation();
      const newEdge: WorkflowEdge = {
        id: `e-${connection.sourceId}-${targetId}-${Date.now()}`,
        source: connection.sourceId,
        target: targetId,
        label: nodes.find(n => n.id === connection.sourceId)?.type === NodeType.CONDITION ? 'True' : ''
      };
      onEdgesChange([...edges, newEdge]);
      setConnection(null);
    }
  };

  const handleEdgeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedEdgeId(id);
    setSelectedNodeId(null);
  };

  const getEdgePoints = (edge: WorkflowEdge | { source: string, targetX: number, targetY: number }) => {
    const sourceNode = nodes.find(n => n.id === ('source' in edge ? edge.source : ''));
    if (!sourceNode) return null;

    const startX = sourceNode.position.x + 200; 
    const startY = sourceNode.position.y + 45;

    let endX, endY;
    if ('target' in edge) {
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!targetNode) return null;
      endX = targetNode.position.x; 
      endY = targetNode.position.y + 45;
    } else {
      endX = (edge as any).targetX;
      endY = (edge as any).targetY;
    }

    return { startX, startY, endX, endY };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('nodeType') as NodeType;
    if (type) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      onDropNode(type, coords.x, coords.y);
    }
  };

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-slate-50 flow-grid"
      onMouseDown={handleCanvasMouseDown}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div 
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
        className="absolute inset-0 pointer-events-none"
      >
        <svg className="absolute inset-0 w-[5000px] h-[5000px]">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
            <marker id="arrowhead-selected" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
          </defs>
          
          {edges.map(edge => {
            const points = getEdgePoints(edge);
            if (!points) return null;
            const { startX, startY, endX, endY } = points;
            const dx = Math.abs(endX - startX) * 0.4;
            const dPath = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
            const isSelected = selectedEdgeId === edge.id;

            return (
              <g key={edge.id} className="pointer-events-auto cursor-pointer" onClick={(e) => handleEdgeClick(e, edge.id)}>
                <path 
                  d={dPath} 
                  className={`fill-none transition-all ${isSelected ? 'stroke-blue-500 stroke-[3px]' : 'stroke-slate-300 stroke-2 hover:stroke-slate-400'}`}
                  markerEnd={`url(#${isSelected ? 'arrowhead-selected' : 'arrowhead'})`}
                />
                {edge.label && (
                  <g transform={`translate(${(startX + endX) / 2}, ${(startY + endY) / 2})`}>
                    <rect x="-30" y="-10" width="60" height="20" rx="10" fill="white" stroke={isSelected ? '#3b82f6' : '#e2e8f0'} strokeWidth="1" />
                    <text textAnchor="middle" dy="5" className={`text-[10px] font-bold ${isSelected ? 'fill-blue-600' : 'fill-slate-500'}`}>
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {connection && (
            <path
              d={`M ${getEdgePoints({ source: connection.sourceId, targetX: 0, targetY: 0 })?.startX} ${getEdgePoints({ source: connection.sourceId, targetX: 0, targetY: 0 })?.startY} L ${connection.mouseX} ${connection.mouseY}`}
              className="stroke-blue-400 stroke-2 fill-none stroke-dasharray-4"
            />
          )}
        </svg>

        {nodes.map(node => (
          <div
            key={node.id}
            style={{ left: node.position.x, top: node.position.y, width: '200px' }}
            className={`absolute z-10 pointer-events-auto transition-all ${
              selectedNodeId === node.id ? 'node-selected scale-[1.02]' : 'hover:shadow-lg'
            }`}
            onMouseDown={(e) => handleMouseDown(e, node)}
            onClick={(e) => onNodeClick(e, node.id)}
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group">
              <div className={`${NODE_CONFIG[node.type].color} h-1.5 w-full`} />
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${NODE_CONFIG[node.type].color} shadow-sm`}>
                      {NODE_CONFIG[node.type].icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {NODE_CONFIG[node.type].label}
                    </span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteNode(e, node.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-sm font-bold text-slate-700 truncate mb-1">
                  {node.label}
                </div>
                {node.data.condition && (
                  <div className="text-[9px] font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded truncate">
                    {node.data.condition}
                  </div>
                )}
              </div>
              
              <div className="absolute left-[-6px] top-[45px] -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-300 rounded-full z-20" />
              
              <button 
                onMouseDown={(e) => startConnection(e, node.id)}
                className="absolute right-[-6px] top-[45px] -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-400 rounded-full z-20 hover:scale-125 transition-transform flex items-center justify-center cursor-crosshair group/handle shadow-sm"
              >
                <Plus className="w-2.5 h-2.5 text-blue-500 opacity-0 group-hover/handle:opacity-100" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowCanvas;
