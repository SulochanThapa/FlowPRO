
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FlowCanvas from './components/FlowCanvas';
import PropertyPanel from './components/PropertyPanel';
import IntegrationGuide from './components/IntegrationGuide';
import { WorkflowNode, WorkflowEdge, NodeType, Workflow, WorkflowStatus } from './types';
import { 
  Save, 
  Play, 
  Terminal, 
  ChevronRight, 
  Database, 
  Download,
  X,
  Copy,
  ChevronDown,
  BookOpen,
  FileText,
  Zap,
  Plus
} from 'lucide-react';

const DEFAULT_STATUSES: WorkflowStatus[] = [
  { id: 's1', code: 'SUBMITTED', label: 'Submitted', color: '#10b981' },
  { id: 's2', code: 'PENDING_REVIEW', label: 'Under Review', color: '#f59e0b' },
  { id: 's3', code: 'REVISIONS_REQUIRED', label: 'Revisions Required', color: '#ef4444' },
  { id: 's4', code: 'APPROVED', label: 'Approved', color: '#3b82f6' }
];

const PERMIT_FLOW: Workflow = {
  id: 'wf-permit',
  name: 'Citizen Permit Application',
  triggerEvent: 'CITIZEN_FORM_SUBMITTED',
  statusRegistry: DEFAULT_STATUSES,
  nodes: [
    { id: 'n1', type: NodeType.START, label: 'Citizen Submits Permit', position: { x: 50, y: 250 }, data: { description: 'Form #A42' } },
    { id: 'n2', type: NodeType.APPROVAL, label: 'Tier 1 Verification', position: { x: 300, y: 250 }, data: { assignee: 'Agents', outcomes: ['Approve', 'Request Info'] } },
    { id: 'n3', type: NodeType.APPROVAL, label: 'Citizen Correction', position: { x: 300, y: 50 }, data: { assignee: 'User', outcomes: ['Submit'] } },
    { id: 'n4', type: NodeType.END, label: 'Complete', position: { x: 600, y: 250 }, data: {} }
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' },
    { id: 'e2', source: 'n2', target: 'n4', label: 'Approve' },
    { id: 'e3', source: 'n2', target: 'n3', label: 'Request Info' },
    { id: 'e4', source: 'n3', target: 'n2', label: 'Submit' }
  ]
};

const PAYMENT_FLOW: Workflow = {
  id: 'wf-payment',
  name: 'Payment Exception Handling',
  triggerEvent: 'PAYMENT_FAILED',
  statusRegistry: [
    { id: 'p-s1', code: 'FAILED', label: 'Failed', color: '#ef4444' },
    { id: 'p-s2', code: 'RETRYING', label: 'Retrying', color: '#3b82f6' }
  ],
  nodes: [
    { id: 'p1', type: NodeType.START, label: 'Failure Detected', position: { x: 100, y: 250 }, data: {} },
    { id: 'p2', type: NodeType.HTTP_REQUEST, label: 'Query Stripe Status', position: { x: 350, y: 250 }, data: { method: 'GET', url: 'https://api.stripe.com/v1/...' } },
    { id: 'p3', type: NodeType.END, label: 'Retry Logged', position: { x: 600, y: 250 }, data: {} }
  ],
  edges: [
    { id: 'pe1', source: 'p1', target: 'p2' },
    { id: 'pe2', source: 'p2', target: 'p3' }
  ]
};

const App: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([PERMIT_FLOW, PAYMENT_FLOW]);
  const [activeWorkflowId, setActiveWorkflowId] = useState('wf-permit');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  const activeWorkflow = workflows.find(w => w.id === activeWorkflowId) || workflows[0];

  const updateActiveWorkflow = (updates: Partial<Workflow>) => {
    setWorkflows(prev => prev.map(w => w.id === activeWorkflowId ? { ...w, ...updates } : w));
  };

  const handleUpdateNode = (updatedNode: WorkflowNode) => {
    updateActiveWorkflow({
      nodes: activeWorkflow.nodes.map(n => n.id === updatedNode.id ? updatedNode : n)
    });
  };

  const handleUpdateEdge = (updatedEdge: WorkflowEdge) => {
    updateActiveWorkflow({
      edges: activeWorkflow.edges.map(e => e.id === updatedEdge.id ? updatedEdge : e)
    });
  };

  const handleAddNodeAt = (type: NodeType, x: number, y: number) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      label: `new_${type.toLowerCase()}`,
      position: { x, y },
      data: {}
    };
    updateActiveWorkflow({ nodes: [...activeWorkflow.nodes, newNode] });
    setSelectedNodeId(newNode.id);
  };

  const createNewWorkflow = () => {
    const id = `wf-${Date.now()}`;
    const newWf: Workflow = {
      id,
      name: 'New Workflow Process',
      triggerEvent: 'NEW_EVENT_KEY',
      statusRegistry: DEFAULT_STATUSES,
      nodes: [{ id: 'start', type: NodeType.START, label: 'Trigger Event', position: { x: 100, y: 250 }, data: {} }],
      edges: []
    };
    setWorkflows([...workflows, newWf]);
    setActiveWorkflowId(id);
    setShowSwitcher(false);
  };

  const selectedNode = activeWorkflow.nodes.find(n => n.id === selectedNodeId) || null;
  const selectedEdge = activeWorkflow.edges.find(e => e.id === selectedEdgeId) || null;

  return (
    <div className="flex flex-col h-screen w-screen text-slate-800 bg-[#f4f7fa] overflow-hidden select-none">
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-[100]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="relative">
              <button 
                onClick={() => setShowSwitcher(!showSwitcher)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-lg transition-all group"
              >
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter leading-none mb-1">Active Flow</span>
                  <span className="text-sm font-bold text-slate-700">{activeWorkflow.name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showSwitcher ? 'rotate-180' : ''}`} />
              </button>

              {showSwitcher && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-[200]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase p-2 tracking-widest">Available Definitions</div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {workflows.map(wf => (
                      <button
                        key={wf.id}
                        onClick={() => { setActiveWorkflowId(wf.id); setShowSwitcher(false); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${activeWorkflowId === wf.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${activeWorkflowId === wf.id ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${activeWorkflowId === wf.id ? 'text-indigo-700' : 'text-slate-600'}`}>{wf.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono uppercase">{wf.triggerEvent}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={createNewWorkflow}
                      className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create New Flow
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowGuide(true)} className="flex items-center gap-2 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold transition-all">
            <BookOpen className="w-3.5 h-3.5" /> Integration Guide
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
            <Play className="w-3.5 h-3.5 fill-white" /> Publish to Engine
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          onAddNode={(type) => handleAddNodeAt(type, 100, 100)} 
          onExport={() => setShowExport(true)} 
        />
        <div className="flex-1 relative bg-[#f4f7fa]">
          <div className="absolute top-4 left-4 z-40 flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full pl-3 pr-4 py-1.5 shadow-sm">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Listening:</span>
            <span className="text-[10px] font-mono font-bold text-amber-600">{activeWorkflow.triggerEvent}</span>
          </div>

          <FlowCanvas 
            nodes={activeWorkflow.nodes} 
            edges={activeWorkflow.edges} 
            onNodesChange={(nodes) => updateActiveWorkflow({ nodes })} 
            onEdgesChange={(edges) => updateActiveWorkflow({ edges })} 
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            selectedEdgeId={selectedEdgeId}
            setSelectedEdgeId={setSelectedEdgeId}
            onDropNode={handleAddNodeAt}
          />
        </div>
        <PropertyPanel 
          node={selectedNode} 
          edge={selectedEdge}
          workflow={activeWorkflow}
          onUpdateNode={handleUpdateNode} 
          onUpdateEdge={handleUpdateEdge}
          onUpdateWorkflow={(name, event, statuses) => updateActiveWorkflow({ name, triggerEvent: event, statusRegistry: statuses })}
        />
      </main>
      
      {showExport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800">JSON Schema: {activeWorkflow.name}</h3>
              </div>
              <button onClick={() => setShowExport(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="flex-1 bg-slate-900 p-6 overflow-y-auto">
              <pre className="text-indigo-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(activeWorkflow, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => { navigator.clipboard.writeText(JSON.stringify(activeWorkflow, null, 2)); alert("Copied!"); }}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50"
              >
                <Copy className="w-4 h-4" /> Copy JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {showGuide && <IntegrationGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default App;
