
import React from 'react';
import { WorkflowNode, WorkflowEdge, NodeType, Workflow, WorkflowStatus } from '../types';
import { 
  Settings, Globe, Shield, Braces, 
  User, Clock, GitMerge, GitBranch, 
  ArrowRight, Plus, Trash2, CheckCircle2,
  Zap, Info, Link2, Database, Mail, MessageSquare,
  Hash, Tag
} from 'lucide-react';

interface PropertyPanelProps {
  node: WorkflowNode | null;
  edge: WorkflowEdge | null;
  workflow: Workflow;
  onUpdateNode: (updatedNode: WorkflowNode) => void;
  onUpdateEdge: (updatedEdge: WorkflowEdge) => void;
  onUpdateWorkflow: (name: string, trigger: string, statuses: WorkflowStatus[]) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ node, edge, workflow, onUpdateNode, onUpdateEdge, onUpdateWorkflow }) => {
  const handleWorkflowChange = (name: string, trigger: string, statuses?: WorkflowStatus[]) => {
    onUpdateWorkflow(name, trigger, statuses || workflow.statusRegistry);
  };

  const handleAddStatus = () => {
    const newStatus: WorkflowStatus = {
      id: `s-${Date.now()}`,
      code: 'NEW_STATUS',
      label: 'New Status',
      color: '#cbd5e1'
    };
    handleWorkflowChange(workflow.name, workflow.triggerEvent, [...workflow.statusRegistry, newStatus]);
  };

  const handleUpdateStatus = (idx: number, updates: Partial<WorkflowStatus>) => {
    const next = [...workflow.statusRegistry];
    next[idx] = { ...next[idx], ...updates };
    handleWorkflowChange(workflow.name, workflow.triggerEvent, next);
  };

  const handleRemoveStatus = (idx: number) => {
    const next = workflow.statusRegistry.filter((_, i) => i !== idx);
    handleWorkflowChange(workflow.name, workflow.triggerEvent, next);
  };

  if (!node && !edge) {
    return (
      <div className="w-80 h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl overflow-y-auto">
        <div className="p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Global Process Config</h3>
        </div>
        <div className="p-6 space-y-8">
          <section>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-tight">Process Title</label>
            <input
              type="text"
              value={workflow.name}
              onChange={(e) => handleWorkflowChange(e.target.value, workflow.triggerEvent)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </section>
          
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Trigger Event</label>
            </div>
            <input
              type="text"
              value={workflow.triggerEvent}
              onChange={(e) => handleWorkflowChange(workflow.name, e.target.value)}
              className="w-full px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-sm font-mono font-bold text-amber-700"
            />
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Status Registry</label>
              </div>
              <button onClick={handleAddStatus} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              {workflow.statusRegistry.map((s, i) => (
                <div key={s.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 group">
                  <div className="flex items-center justify-between">
                    <input 
                      type="text" 
                      value={s.code} 
                      onChange={(e) => handleUpdateStatus(i, { code: e.target.value })}
                      className="bg-transparent border-none text-[10px] font-mono font-bold text-indigo-600 focus:ring-0 w-2/3"
                    />
                    <button onClick={() => handleRemoveStatus(i)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={s.label} 
                    onChange={(e) => handleUpdateStatus(i, { label: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-slate-100 rounded text-[10px] font-medium"
                    placeholder="UI Label"
                  />
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={s.color} 
                      onChange={(e) => handleUpdateStatus(i, { color: e.target.value })}
                      className="w-6 h-4 rounded cursor-pointer border-none bg-transparent"
                    />
                    <span className="text-[9px] text-slate-400">UI Color</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  const handleChange = (field: string, value: any) => {
    if (node) {
      if (field === 'label') {
        onUpdateNode({ ...node, label: value });
      } else {
        onUpdateNode({ ...node, data: { ...node.data, [field]: value } });
      }
    }
  };

  const handleHookChange = (field: string, value: any) => {
    if (node) {
      const currentHooks = node.data.lifecycleHooks || {};
      const nextHooks = { ...currentHooks, [field]: value };
      
      // Auto-update payload if status is selected
      if (field === 'targetStatus') {
        const selectedStatus = workflow.statusRegistry.find(s => s.code === value);
        if (selectedStatus) {
          nextHooks.syncPayload = JSON.stringify({ status: selectedStatus.code, label: selectedStatus.label });
        }
      }

      onUpdateNode({
        ...node,
        data: {
          ...node.data,
          lifecycleHooks: nextHooks
        }
      });
    }
  };

  const handleNotifyChange = (field: string, value: any) => {
    if (node) {
      const current = node.data.notificationConfig || { enableEmail: false, enableSms: false };
      onUpdateNode({
        ...node,
        data: {
          ...node.data,
          notificationConfig: { ...current, [field]: value }
        }
      });
    }
  };

  if (edge) {
    return (
      <div className="w-80 h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-100 bg-blue-50">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Transition Path</h3>
        </div>
        <div className="p-5">
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Action Label</label>
          <input
            type="text"
            value={edge.label || ''}
            onChange={(e) => onUpdateEdge({ ...edge, label: e.target.value })}
            placeholder="e.g. Approved"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl overflow-y-auto">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Step: {node!.label}</h3>
        <span className="text-[10px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{node!.type}</span>
      </div>

      <div className="p-5 space-y-8 pb-24">
        <section>
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Node Label</label>
          <input
            type="text"
            value={node!.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
          />
        </section>

        {/* STATUS SYNC SECTION */}
        <section className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <label className="text-[10px] font-bold text-indigo-700 uppercase tracking-tight">Database Status Tag</label>
          </div>
          <p className="text-[9px] text-indigo-600 -mt-2">Which DB status should be set when entering this step?</p>
          
          <select 
            value={node!.data.lifecycleHooks?.targetStatus || ''}
            onChange={(e) => handleHookChange('targetStatus', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700"
          >
            <option value="">No Status Change</option>
            {workflow.statusRegistry.map(s => (
              <option key={s.id} value={s.code}>{s.label} ({s.code})</option>
            ))}
          </select>
          
          <div className="space-y-3 mt-4 opacity-80">
            <input 
              type="text"
              placeholder="Sync Endpoint URL"
              value={node!.data.lifecycleHooks?.onEnterUrl || ''}
              onChange={(e) => handleHookChange('onEnterUrl', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[9px]"
            />
            {node!.data.lifecycleHooks?.syncPayload && (
              <div className="p-2 bg-slate-900 rounded font-mono text-[9px] text-indigo-300 overflow-hidden text-ellipsis">
                {node!.data.lifecycleHooks.syncPayload}
              </div>
            )}
          </div>
        </section>

        {node!.type === NodeType.APPROVAL && (
          <div className="space-y-6">
            <section className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <label className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1 mb-3">
                <User className="w-3 h-3" /> Assignments
              </label>
              <input 
                type="text"
                placeholder="Approver Group ID"
                value={node!.data.assignee || ''}
                onChange={(e) => handleChange('assignee', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs"
              />
            </section>

            <section className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Mail className="w-3 h-3" /> Auto-Notifications
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={node!.data.notificationConfig?.enableEmail} 
                    onChange={(e) => handleNotifyChange('enableEmail', e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-[10px] font-bold text-slate-600">Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={node!.data.notificationConfig?.enableSms} 
                    onChange={(e) => handleNotifyChange('enableSms', e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-[10px] font-bold text-slate-600">SMS</span>
                </label>
              </div>
              {node!.data.notificationConfig?.enableEmail && (
                <textarea 
                  placeholder="Email Message Template..."
                  value={node!.data.notificationConfig?.customMessage || ''}
                  onChange={(e) => handleNotifyChange('customMessage', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-[10px] h-16 bg-slate-50"
                />
              )}
            </section>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 absolute bottom-0 left-0 right-0">
        <button className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
          Save Component Config
        </button>
      </div>
    </div>
  );
};

export default PropertyPanel;
