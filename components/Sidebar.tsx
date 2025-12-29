
import React from 'react';
import { NodeType } from '../types';
import { NODE_CONFIG } from '../constants';
import { Layers, Grab, Info, FileJson } from 'lucide-react';

interface SidebarProps {
  onAddNode: (type: NodeType) => void;
  onExport: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddNode, onExport }) => {
  const onDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('nodeType', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const groups = [
    { name: 'Core', types: [NodeType.START, NodeType.END] },
    { name: 'Integration', types: [NodeType.HTTP_REQUEST, NodeType.SCRIPT] },
    { name: 'Workflow', types: [NodeType.APPROVAL, NodeType.CONDITION, NodeType.SWITCH, NodeType.DELAY] }
  ];

  return (
    <div className="w-72 h-full bg-slate-900 text-slate-300 flex flex-col z-50">
      <div className="p-5 border-b border-slate-800">
        <h2 className="text-white font-bold flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          Designer <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded ml-auto">PRO</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {groups.map((group) => (
          <div key={group.name}>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 block">
              {group.name} Components
            </label>
            <div className="space-y-2">
              {group.types.map((type) => {
                const config = NODE_CONFIG[type];
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => onDragStart(e, type)}
                    onClick={() => onAddNode(type)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <div className={`p-2 rounded-md ${config.color} shadow-lg`}>
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-200">{config.label}</div>
                    </div>
                    <Grab className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-800/50 border-t border-slate-800">
        <button 
          onClick={onExport}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <FileJson className="w-4 h-4" />
          View JSON Definition
        </button>
        <div className="mt-4 flex items-center gap-2 px-2 text-[10px] text-slate-500 font-medium">
          <Info className="w-3 h-3" />
          <span>Compatible with .NET Backend</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
