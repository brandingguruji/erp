"use client";

import { useState } from "react";
import { updateProjectDetails, updateProjectTimeline, updateProjectFinancials } from "../actions";
import { Edit2, Check, X, FileText, Briefcase, Calendar, Lock } from "lucide-react";

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

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateProjectFinancials(project.id, {
        budget: fd.get("budget") ? parseFloat(fd.get("budget") as string) : null,
        quoteValue: fd.get("quoteValue") ? parseFloat(fd.get("quoteValue") as string) : null,
        finalizeValue: fd.get("finalizeValue") ? parseFloat(fd.get("finalizeValue") as string) : null,
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
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
          <Briefcase className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900">Financials</h2>
      </div>

      {!isEditing ? (
        <div className="space-y-5 text-sm">
          <div>
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block mb-1">Budget</span>
            <p className="font-medium text-zinc-900 text-lg">{project.budget ? `$${project.budget.toString()}` : "Not set"}</p>
          </div>
          <div>
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block mb-1">Quote Value</span>
            <p className="font-medium text-zinc-900">{project.quoteValue ? `$${project.quoteValue.toString()}` : "Not set"}</p>
          </div>
          <div>
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block mb-1">Finalize Value</span>
            <p className="font-medium text-zinc-900">{project.finalizeValue ? `$${project.finalizeValue.toString()}` : "Not set"}</p>
          </div>
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
            <p className="font-medium text-zinc-900">{project.startDate ? new Date(project.startDate).toLocaleDateString(undefined, {dateStyle: 'medium'}) : "Not set"}</p>
          </div>
          <div>
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block mb-1">Deadline</span>
            <p className="font-medium text-zinc-900">{project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, {dateStyle: 'medium'}) : "Not set"}</p>
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
