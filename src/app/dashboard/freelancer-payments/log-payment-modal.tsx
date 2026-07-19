"use client";

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { createFreelancerPayment } from "./actions";

type User = { id: string, name: string | null };
type Task = { id: string, title: string };
type Project = { id: string, name: string, projectCode: string, tasks: Task[] };

export default function LogPaymentModal({ 
  freelancers, 
  projects 
}: { 
  freelancers: User[], 
  projects: Project[] 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [freelancerId, setFreelancerId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState("Bank Transfer");
  const [remarks, setRemarks] = useState("");

  const selectedProject = projects.find(p => p.id === projectId);
  const availableTasks = selectedProject?.tasks || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createFreelancerPayment({
        freelancerId,
        projectId,
        taskId: taskId || undefined,
        amount: Number(amount),
        paymentDate,
        paymentMode,
        remarks
      });
      
      setIsOpen(false);
      // Reset form
      setFreelancerId("");
      setProjectId("");
      setTaskId("");
      setAmount("");
      setRemarks("");
      setPaymentMode("Bank Transfer");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-[#d82483] text-white px-4 py-2 rounded-xl hover:bg-[#b01e6a] transition-all font-semibold shadow-lg shadow-[#d82483]/30"
      >
        <Plus className="w-4 h-4" /> Log Payment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Log Freelancer Payment</h2>
                <p className="text-zinc-400 text-sm">Record a payment made to a freelancer</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Select Freelancer <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={freelancerId}
                  onChange={(e) => setFreelancerId(e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d82483]/50 focus:border-[#d82483] bg-zinc-50"
                >
                  <option value="">-- Choose Freelancer --</option>
                  {freelancers.map(f => (
                    <option key={f.id} value={f.id}>{f.name || 'Unnamed'}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Select Project <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={projectId}
                  onChange={(e) => {
                    setProjectId(e.target.value);
                    setTaskId(""); // Reset task when project changes
                  }}
                  className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d82483]/50 focus:border-[#d82483] bg-zinc-50"
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>[{p.projectCode}] {p.name}</option>
                  ))}
                </select>
              </div>

              {projectId && availableTasks.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">Link to Task (Optional)</label>
                  <select 
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d82483]/50 focus:border-[#d82483] bg-zinc-50"
                  >
                    <option value="">-- General Project Payment --</option>
                    {availableTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">Amount (₹) <span className="text-red-500">*</span></label>
                  <input 
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d82483]/50 focus:border-[#d82483]"
                    placeholder="e.g. 5000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">Date <span className="text-red-500">*</span></label>
                  <input 
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d82483]/50 focus:border-[#d82483]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Payment Mode</label>
                <select 
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d82483]/50 focus:border-[#d82483] bg-zinc-50"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Remarks</label>
                <input 
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d82483]/50 focus:border-[#d82483]"
                  placeholder="Optional notes"
                />
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 text-zinc-600 font-semibold hover:bg-zinc-100 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#d82483] text-white font-semibold rounded-lg hover:bg-[#b01e6a] transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-lg shadow-[#d82483]/30"
                >
                  {loading ? "Saving..." : <><Check className="w-4 h-4" /> Save Payment</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
