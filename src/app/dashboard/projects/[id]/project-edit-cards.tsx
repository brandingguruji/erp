"use client";

import { useState } from "react";
import { updateProjectDetails, updateProjectTimeline, updateProjectFinancials, addProjectPayment } from "../actions";
import { Edit2, Check, X, FileText, Briefcase, Calendar, Lock, Plus, ArrowRight } from "lucide-react";

export function DetailsCard({ project, canEdit, clients }: { project: any, canEdit: boolean, clients: any[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateProjectDetails(project.id, {
        clientId: fd.get("clientId") as string,
        technology: fd.get("technology") as string,
        description: fd.get("description") as string,
      });
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || "Failed to update");
    }
    setLoading(false);
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-zinc-200/60 p-6 relative group transition-all hover:shadow-md">
      {canEdit && !isEditing && (
        <button onClick={() => setIsEditing(true)} className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full text-zinc-500 hover:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit2 className="w-4 h-4" />
        </button>
      )}
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <FileText className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900">Details</h2>
      </div>

      {!isEditing ? (
        <div className="space-y-5 text-sm">
          <div>
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block mb-1">Client</span>
            <p className="font-medium text-zinc-900">{project.client.companyName || project.client.clientName}</p>
          </div>
          <div>
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block mb-1">Technology</span>
            <p className="font-medium text-zinc-900">{project.technology || "Not specified"}</p>
          </div>
          <div>
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block mb-1">Description</span>
            <p className="text-zinc-800 leading-relaxed">{project.description || "No description provided."}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Client</label>
            <select name="clientId" defaultValue={project.clientId} className="w-full text-sm border rounded-lg px-3 py-2 bg-zinc-50">
              {clients.map(c => <option key={c.id} value={c.id}>{c.companyName || c.clientName}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Technology</label>
            <input name="technology" defaultValue={project.technology || ""} className="w-full text-sm border rounded-lg px-3 py-2 bg-zinc-50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Description</label>
            <textarea name="description" defaultValue={project.description || ""} className="w-full text-sm border rounded-lg px-3 py-2 bg-zinc-50 min-h-[80px]" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setIsEditing(false)} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500"><X className="w-4 h-4" /></button>
            <button type="submit" disabled={loading} className="p-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"><Check className="w-4 h-4" /></button>
          </div>
        </form>
      )}
    </div>
  );
}

export function FinancialsCard({ project, canEdit }: { project: any, canEdit: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addingPayment, setAddingPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateProjectFinancials(project.id, {
        budget: fd.get("budget") ? Number(fd.get("budget")) : undefined,
        quoteValue: fd.get("quoteValue") ? Number(fd.get("quoteValue")) : undefined,
        finalizeValue: fd.get("finalizeValue") ? Number(fd.get("finalizeValue")) : undefined,
      });
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPaymentLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await addProjectPayment(project.id, Number(fd.get("amount")), fd.get("mode") as string, fd.get("remarks") as string, fd.get("paymentDate") as string);
      setAddingPayment(false);
    } catch (err: any) {
      alert(err.message || "Payment failed");
    } finally {
      setPaymentLoading(false);
    }
  }

  const totalAmount = Number(project.finalizeValue || project.quoteValue || 0);
  const totalPaid = (project.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const balanceDue = totalAmount - totalPaid;

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-zinc-200/60 p-6 relative group xl:col-span-1">
      {canEdit && !isEditing && !addingPayment && (
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute top-6 right-6 p-2 rounded-lg bg-white shadow-sm border border-zinc-100 text-zinc-400 opacity-0 group-hover:opacity-100 transition-all hover:text-blue-600 hover:border-blue-200 z-10"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
          <Briefcase className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900">Financials</h2>
      </div>

      {!isEditing ? (
        <div className="space-y-5 text-sm">
          <div>
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block mb-1">Budget</span>
            <p className="font-medium text-zinc-900 text-lg">{project.budget ? `₹${project.budget.toString()}` : "Not set"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block mb-1">Quote Value</span>
              <p className="font-medium text-zinc-900">{project.quoteValue ? `₹${project.quoteValue.toString()}` : "Not set"}</p>
            </div>
            <div>
              <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block mb-1">Finalize Value</span>
              <p className="font-medium text-zinc-900">{project.finalizeValue ? `₹${project.finalizeValue.toString()}` : "Not set"}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 grid grid-cols-2 gap-4">
             <div>
              <span className="text-emerald-600 text-xs uppercase tracking-wider font-bold block mb-1">Total Paid</span>
              <p className="font-bold text-emerald-700 text-lg">₹{totalPaid.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <span className="text-[#d82483] text-xs uppercase tracking-wider font-bold block mb-1">Balance Due</span>
              <p className="font-bold text-[#d82483] text-lg">₹{balanceDue.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {canEdit && (
            <div className="pt-2 flex flex-col gap-2 mt-4 border-t border-zinc-100">
              {addingPayment ? (
                <form onSubmit={handleAddPayment} className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Log Payment</h4>
                  <input type="number" name="amount" required placeholder="Amount (₹)" className="w-full text-sm border rounded-lg px-3 py-2 bg-white" />
                  <input type="date" name="paymentDate" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full text-sm border rounded-lg px-3 py-2 bg-white text-zinc-600" />
                  <select name="mode" required className="w-full text-sm border rounded-lg px-3 py-2 bg-white">
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                  <input type="text" name="remarks" placeholder="Remarks (optional)" className="w-full text-sm border rounded-lg px-3 py-2 bg-white" />
                  <div className="flex gap-2 justify-end pt-1">
                    <button type="button" onClick={() => setAddingPayment(false)} className="text-xs text-zinc-500 font-medium px-2 py-1">Cancel</button>
                    <button type="submit" disabled={paymentLoading} className="text-xs bg-emerald-600 text-white font-medium px-3 py-1.5 rounded-md hover:bg-emerald-700 disabled:opacity-50">Save</button>
                  </div>
                </form>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setAddingPayment(true)} className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Log Payment
                  </button>
                  <a href={`/dashboard/projects/${project.id}/invoice`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Invoice <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Budget</label>
            <input type="number" name="budget" defaultValue={project.budget || ""} className="w-full text-sm border rounded-lg px-3 py-2 bg-zinc-50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Quote Value</label>
            <input type="number" name="quoteValue" defaultValue={project.quoteValue || ""} className="w-full text-sm border rounded-lg px-3 py-2 bg-zinc-50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Finalize Value</label>
            <input type="number" name="finalizeValue" defaultValue={project.finalizeValue || ""} className="w-full text-sm border rounded-lg px-3 py-2 bg-zinc-50" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setIsEditing(false)} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500"><X className="w-4 h-4" /></button>
            <button type="submit" disabled={loading} className="p-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"><Check className="w-4 h-4" /></button>
          </div>
        </form>
      )}
    </div>
  );
}

export function TimelineCard({ project, canEdit }: { project: any, canEdit: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateProjectTimeline(project.id, {
        startDate: fd.get("startDate") ? new Date(fd.get("startDate") as string) : null,
        deadline: fd.get("deadline") ? new Date(fd.get("deadline") as string) : null,
      });
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || "Failed to update");
    }
    setLoading(false);
  }

  const fmtDate = (d: Date | string | null) => {
    if (!d) return "";
    return new Date(d).toISOString().split('T')[0];
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-zinc-200/60 p-6 relative group transition-all hover:shadow-md">
      {canEdit && !isEditing && (
        <button onClick={() => setIsEditing(true)} className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full text-zinc-500 hover:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit2 className="w-4 h-4" />
        </button>
      )}
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
          <Calendar className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900">Timeline</h2>
      </div>

      {!isEditing ? (
        <div className="space-y-5 text-sm">
          <div>
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block mb-1">Start Date</span>
            <p className="font-medium text-zinc-900">{project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', {dateStyle: 'medium'}) : "Not set"}</p>
          </div>
          <div>
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block mb-1">Deadline</span>
            <p className="font-medium text-zinc-900">{project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', {dateStyle: 'medium'}) : "Not set"}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Start Date</label>
            <input type="date" name="startDate" defaultValue={fmtDate(project.startDate)} className="w-full text-sm border rounded-lg px-3 py-2 bg-zinc-50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Deadline</label>
            <input type="date" name="deadline" defaultValue={fmtDate(project.deadline)} className="w-full text-sm border rounded-lg px-3 py-2 bg-zinc-50" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setIsEditing(false)} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500"><X className="w-4 h-4" /></button>
            <button type="submit" disabled={loading} className="p-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"><Check className="w-4 h-4" /></button>
          </div>
        </form>
      )}
    </div>
  );
}

export function CredentialsCard({ project, canEdit }: { project: any, canEdit: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ name: string, value: string }[]>(
    typeof project.credentials === 'string' ? JSON.parse(project.credentials) : project.credentials || []
  );

  const addCredential = () => setCredentials([...credentials, { name: '', value: '' }]);
  const removeCredential = (index: number) => setCredentials(credentials.filter((_, i) => i !== index));
  const updateCredential = (index: number, field: 'name' | 'value', val: string) => {
    const newCreds = [...credentials];
    newCreds[index][field] = val;
    setCredentials(newCreds);
  };

  async function handleSave() {
    setLoading(true);
    try {
      const { updateProjectCredentials } = await import("../actions");
      await updateProjectCredentials(project.id, credentials.filter(c => c.name && c.value));
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || "Failed to update");
    }
    setLoading(false);
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-zinc-200/60 p-6 relative group transition-all hover:shadow-md md:col-span-2 xl:col-span-1">
      {canEdit && !isEditing && (
        <button onClick={() => setIsEditing(true)} className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full text-zinc-500 hover:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit2 className="w-4 h-4" />
        </button>
      )}
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
          <Lock className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900">Credentials</h2>
      </div>

      {!isEditing ? (
        credentials.length > 0 ? (
          <div className="space-y-3">
            {credentials.map((cred: any, i: number) => (
              <div key={i} className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-100 shadow-inner">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">{cred.name}</span>
                <p className="font-mono text-sm text-zinc-800 break-all bg-white p-2 rounded border border-zinc-200">{cred.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400 italic">No credentials provided.</p>
        )
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {credentials.map((cred, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  placeholder="Name"
                  value={cred.name}
                  onChange={(e) => updateCredential(i, 'name', e.target.value)}
                  className="w-1/3 text-sm border rounded-lg px-2 py-1.5 bg-zinc-50"
                />
                <input
                  placeholder="Value"
                  value={cred.value}
                  onChange={(e) => updateCredential(i, 'value', e.target.value)}
                  className="w-2/3 text-sm border rounded-lg px-2 py-1.5 bg-zinc-50"
                />
                <button type="button" onClick={() => removeCredential(i)} className="text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addCredential} className="text-xs font-medium text-blue-600 hover:text-blue-800">
            + Add Credential
          </button>
          
          <div className="flex gap-2 justify-end pt-2 border-t mt-4">
            <button type="button" onClick={() => setIsEditing(false)} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500"><X className="w-4 h-4" /></button>
            <button type="button" onClick={handleSave} disabled={loading} className="p-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"><Check className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
