
import React from 'react';
import { X, Code2, Terminal, Cpu, BookOpen, Zap, Database, ArrowRightCircle, Mail, Tag } from 'lucide-react';

interface IntegrationGuideProps {
  onClose: () => void;
}

const IntegrationGuide: React.FC<IntegrationGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Database & Status Sync Guide</h3>
              <p className="text-xs text-slate-500">Mapping Workflow Nodes to Persistent DB Statuses</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-slate-800">1. Define your Status Dictionary</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In the global settings, define every possible state your business record can be in. This acts as a <strong>Contract</strong> between the designer and your code.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {['SUBMITTED', 'PENDING', 'REJECTED', 'APPROVED'].map(code => (
                <div key={code} className="p-2 bg-slate-50 border border-slate-200 rounded font-mono text-[9px] text-center font-bold text-indigo-600">
                  {code}
                </div>
              ))}
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-slate-800">2. Implementation: The Status Controller</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Create a generic endpoint in your C# application. This endpoint will receive the status update whenever a node is activated.
            </p>
            <pre className="p-4 bg-slate-900 text-indigo-300 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto">
{`// Your .NET StatusController.cs
[HttpPost("api/workflow/sync")]
public async Task<IActionResult> SyncStatus([FromBody] WorkflowSyncRequest req) {
    // 1. Get your domain object (e.g. Permit) from the DB
    var permit = await _db.Permits.FindAsync(req.Context.PermitId);
    
    // 2. Map the incoming status string to your enum or column
    permit.Status = Enum.Parse<PermitStatus>(req.Status);
    permit.StatusLabel = req.Label;
    
    await _db.SaveChangesAsync();
    return Ok();
}

public class WorkflowSyncRequest {
    public string Status { get; set; } // e.g. "PENDING_REVIEW"
    public string Label { get; set; }  // e.g. "Under Review"
}`}
            </pre>
          </section>

          {/* Section 3 */}
          <section className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
            <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Why this works
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Single Source of Truth</span>
                <p className="text-[11px] text-indigo-800">Your UI (Dashboard) reads from your DB. Your DB is updated by the Workflow. Changing the flow automatically changes the UI progress bar.</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase">No Manual Code</span>
                <p className="text-[11px] text-indigo-800">You don't need IF/ELSE blocks in your backend to decide when to set a status. The designer handles that orchestration visually.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl"
          >
            I'm ready to sync my Database
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationGuide;
