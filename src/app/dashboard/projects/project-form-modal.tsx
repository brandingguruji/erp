"use client";

import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { createProject } from "./actions";

type Client = {
  id: string;
  companyName: string | null;
  clientName: string;
};

type Admin = {
  id: string;
  name: string | null;
  email: string;
}

export default function ProjectFormModal({ clients, admins, isSuperAdmin, isAdmin }: { clients: Client[], admins: Admin[], isSuperAdmin?: boolean, isAdmin?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [credentials, setCredentials] = useState<{ name: string, value: string }[]>([]);
  const [selectedPocs, setSelectedPocs] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");

  const addCredential = () => setCredentials([...credentials, { name: '', value: '' }]);
  const removeCredential = (index: number) => setCredentials(credentials.filter((_, i) => i !== index));
  const updateCredential = (index: number, field: 'name' | 'value', val: string) => {
    const newCreds = [...credentials];
    newCreds[index][field] = val;
    setCredentials(newCreds);
  };

  const togglePoc = (id: string) => {
    setSelectedPocs(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = techInput.trim();
      if (val && !techStack.includes(val)) {
        setTechStack([...techStack, val]);
      }
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };

  const handleAction = async (formData: FormData) => {
    formData.append("credentials", JSON.stringify(credentials));
    formData.append("technology", techStack.join(', '));
    selectedPocs.forEach(id => formData.append("pocIds", id));

    await createProject(formData);
    setIsOpen(false);
    setCredentials([]);
    setSelectedPocs([]);
    setTechStack([]);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2 whitespace-nowrap"
      >
        <Plus className="h-4 w-4" />
        New Project
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-xl border border-zinc-200 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create New Project</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={handleAction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Project Name</label>
                  <input name="name" required className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Client</label>
                  <select name="clientId" required className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none">
                    <option value="">Select a Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.clientName} {c.companyName ? `(${c.companyName})` : ''}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Assigned POCs (Admins)</label>
                  <div className="border border-zinc-300 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                    {admins.map(a => (
                      <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedPocs.includes(a.id)}
                          onChange={() => togglePoc(a.id)}
                          className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 h-4 w-4"
                        />
                        <span className="text-sm text-zinc-700">{a.name || a.email}</span>
                      </label>
                    ))}
                    {admins.length === 0 && <span className="text-xs text-zinc-500">No admins available</span>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Tech Stack / Technology</label>
                  <div className="border border-zinc-300 rounded-lg p-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-zinc-900 focus-within:border-transparent">
                    {techStack.map(tech => (
                      <span key={tech} className="bg-zinc-100 px-2 py-1 rounded text-xs flex items-center gap-1">
                        {tech}
                        <button type="button" onClick={() => removeTech(tech)} className="text-zinc-500 hover:text-zinc-900"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                    <input 
                      value={techInput}
                      onChange={e => setTechInput(e.target.value)}
                      onKeyDown={handleTechKeyDown}
                      className="flex-1 min-w-[120px] text-sm focus:outline-none" 
                      placeholder={techStack.length === 0 ? "e.g. Next.js (Press Enter)" : ""} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Start Date</label>
                  <input type="date" name="startDate" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Budget</label>
                  <input name="budget" type="number" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none" placeholder="e.g. 5000" />
                </div>
              </div>

              {(isSuperAdmin || isAdmin) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Quote Value</label>
                    <input name="quoteValue" type="number" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none" placeholder="e.g. 10000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Finalize Value</label>
                    <input name="finalizeValue" type="number" className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none" placeholder="e.g. 9500" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-zinc-700">Credentials</label>
                  <button type="button" onClick={addCredential} className="text-xs font-medium bg-zinc-100 px-2 py-1 rounded hover:bg-zinc-200">
                    + Add Credential
                  </button>
                </div>
                {credentials.length === 0 && <p className="text-xs text-zinc-500">No credentials added.</p>}
                {credentials.map((cred, idx) => (
                  <div key={idx} className="flex items-center gap-2 mt-2">
                    <input
                      placeholder="Name (e.g. AWS Key)"
                      value={cred.name}
                      onChange={e => updateCredential(idx, 'name', e.target.value)}
                      className="flex-1 border border-zinc-300 rounded-lg px-3 py-1.5 text-sm"
                    />
                    <input
                      placeholder="Value"
                      value={cred.value}
                      onChange={e => updateCredential(idx, 'value', e.target.value)}
                      className="flex-1 border border-zinc-300 rounded-lg px-3 py-1.5 text-sm"
                    />
                    <button type="button" onClick={() => removeCredential(idx)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
