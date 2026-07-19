"use client";

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { addProjectPayment } from "./actions";

export default function LogPaymentModal({ projectId, projectName }: { projectId: string, projectName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await addProjectPayment(projectId, Number(fd.get("amount")), fd.get("mode") as string, fd.get("remarks") as string, fd.get("paymentDate") as string);
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to log payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-1.5 px-3 rounded-lg border border-emerald-200 transition-colors text-xs uppercase tracking-wider"
      >
        <Plus className="w-3.5 h-3.5" /> Payment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-zinc-100">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Log Payment</h2>
                <p className="text-sm text-zinc-500 font-medium mt-1">For {projectName}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-100 hover:bg-zinc-200 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">Amount (₹)</label>
                <input type="number" name="amount" required className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">Date</label>
                <input type="date" name="paymentDate" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none text-zinc-700" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">Payment Mode</label>
                <select name="mode" required className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white">
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">Remarks (Optional)</label>
                <input type="text" name="remarks" className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                  {loading ? 'Saving...' : <><Check size={16} /> Log Payment</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
