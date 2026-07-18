"use client";

import { useState } from "react";
import { updateProjectStatus } from "./actions";
import { Check, X, Clock, UserIcon, Activity } from "lucide-react";

const PHASES = [
  { name: 'Inquiry', statuses: ['INQUIRY', 'REQUIREMENT_GATHERING'] },
  { name: 'Proposal', statuses: ['PROPOSAL_SENT', 'QUOTATION_APPROVED'] },
  { name: 'Finance', statuses: ['ADVANCE_PENDING', 'ADVANCE_RECEIVED'] },
  { name: 'Design', statuses: ['UI_UX_DESIGN'] },
  { name: 'Development', statuses: ['DEVELOPMENT_STARTED', 'API_DEVELOPMENT', 'FRONTEND_DEVELOPMENT', 'BACKEND_DEVELOPMENT'] },
  { name: 'Testing', statuses: ['INTERNAL_TESTING', 'CLIENT_REVIEW', 'BUG_FIXING', 'UAT'] },
  { name: 'Deploy', statuses: ['DEPLOYMENT', 'TRAINING'] },
  { name: 'Done', statuses: ['MAINTENANCE', 'COMPLETED'] },
];

const ALL_STATUSES = [
  "INQUIRY", "REQUIREMENT_GATHERING", "PROPOSAL_SENT", "QUOTATION_APPROVED", "ADVANCE_PENDING", 
  "ADVANCE_RECEIVED", "UI_UX_DESIGN", "DEVELOPMENT_STARTED", "API_DEVELOPMENT", "FRONTEND_DEVELOPMENT", 
  "BACKEND_DEVELOPMENT", "INTERNAL_TESTING", "CLIENT_REVIEW", "BUG_FIXING", "UAT", "DEPLOYMENT", 
  "TRAINING", "MAINTENANCE", "COMPLETED", "ON_HOLD", "CANCELLED"
];

type StatusHistory = {
  id: string;
  status: string;
  createdAt: Date;
  changedBy: { name: string | null, email: string };
};

export default function StatusProgressBar({ 
  projectId, 
  currentStatus, 
  canEdit,
  history = []
}: { 
  projectId: string, 
  currentStatus: string, 
  canEdit: boolean,
  history?: StatusHistory[]
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentPhaseIndex = PHASES.findIndex(p => p.statuses.includes(currentStatus));
  const isErrorState = currentStatus === 'ON_HOLD' || currentStatus === 'CANCELLED';

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus || newStatus === "") return;
    
    setIsUpdating(true);
    try {
      await updateProjectStatus(projectId, newStatus);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getCircleClass = (idx: number) => {
    const isCompleted = currentPhaseIndex > idx && !isErrorState;
    const isActive = currentPhaseIndex === idx && !isErrorState;

    if (isErrorState && isActive) return "border-red-500 bg-red-500 text-white";
    if (isCompleted) return "border-green-500 bg-green-500 text-white";
    if (isActive) return "border-blue-500 bg-blue-500 text-white ring-4 ring-blue-50";
    return "border-zinc-300 bg-white text-zinc-400";
  };

  const getLineClass = (idx: number) => {
    return (currentPhaseIndex > idx && !isErrorState) ? "bg-green-500" : "bg-zinc-200";
  };

  return (
    <>
      {/* Table Cell Badge */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-colors border
          ${isErrorState ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}
        `}
      >
        <Activity className="h-3 w-3 mr-1.5 opacity-70" />
        {currentStatus.replace(/_/g, ' ')}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900">Project Status & Timeline</h2>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-900 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              
              {/* Stepper Visual */}
              <div className="mb-12">
                <div className="flex items-start w-full relative">
                  {PHASES.map((phase, idx) => (
                    <div key={phase.name} className="flex flex-col items-center flex-1 relative group">
                      
                      {/* Circle */}
                      <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-all duration-500 z-10 shadow-sm ${getCircleClass(idx)}`}>
                        {(currentPhaseIndex > idx && !isErrorState) ? <Check className="w-4 h-4 stroke-[3]" /> : (idx + 1)}
                      </div>

                      {/* Connecting Line */}
                      {idx < PHASES.length - 1 && (
                        <div className={`absolute top-4 left-1/2 w-full h-[2px] transition-colors duration-700 ${getLineClass(idx)} z-0`} />
                      )}

                      {/* Label under circle */}
                      <div className="mt-3 text-center">
                        <span className={`text-[11px] font-bold uppercase tracking-wider block ${currentPhaseIndex === idx && !isErrorState ? 'text-zinc-900' : 'text-zinc-500'}`}>
                          {phase.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Side: Update Status */}
                <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100">
                  <h3 className="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wider">Update Current Status</h3>
                  
                  {canEdit ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-zinc-500 block mb-1">Select new status</label>
                        <select 
                          value={currentStatus} 
                          onChange={handleStatusChange} 
                          disabled={isUpdating}
                          className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                        >
                          {PHASES.map(phase => (
                            <optgroup key={phase.name} label={`--- ${phase.name} ---`}>
                              {phase.statuses.map(s => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                              ))}
                            </optgroup>
                          ))}
                          <optgroup label="--- Other ---">
                            {['ON_HOLD', 'CANCELLED'].map(s => (
                              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                      
                      {isUpdating && <div className="text-xs text-blue-600 font-medium animate-pulse flex items-center"><Activity className="h-3 w-3 mr-1" /> Updating database...</div>}
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800 font-medium">You do not have permission to change this project's status.</p>
                      <p className="text-xs text-yellow-600 mt-1">Only assigned Admins and Developers can update the timeline.</p>
                    </div>
                  )}
                </div>

                {/* Right Side: History Logs */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wider">Status History Log</h3>
                  
                  {history.length === 0 ? (
                    <div className="text-sm text-zinc-500 italic">No history available for this project yet.</div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {history.map((log) => (
                        <div key={log.id} className="flex gap-3 text-sm p-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
                          <div className="mt-0.5 bg-blue-100 text-blue-600 p-1.5 rounded-full flex-shrink-0">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                              Status changed to <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs border border-blue-100">{log.status.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                              <span className="flex items-center"><UserIcon className="h-3 w-3 mr-1" /> {log.changedBy.name || log.changedBy.email}</span>
                              <span>•</span>
                              <span>{new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
