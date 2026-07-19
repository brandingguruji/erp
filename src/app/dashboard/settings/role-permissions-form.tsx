"use client";

import { useState } from "react";
import { updateRolePermissions } from "./actions";
import { Check, Activity } from "lucide-react";

type RolePermission = {
  role: string;
  module: string;
  canView: boolean;
};

const ROLES = ["SUPER_ADMIN", "ADMIN", "DEVELOPER", "FINANCE", "CLIENT"];
const MODULES = ["Dashboard", "Projects", "Clients", "Users", "Tasks", "Invoices", "Settings"];

export default function RolePermissionsForm({ initialPermissions }: { initialPermissions: RolePermission[] }) {
  // state represents the currently configured permissions
  const [permissions, setPermissions] = useState<RolePermission[]>(initialPermissions);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: "success"|"error", text: string} | null>(null);

  const togglePermission = (role: string, module: string) => {
    // Super admins always have access to everything, don't allow toggling
    if (role === "SUPER_ADMIN") return;

    setPermissions(prev => {
      const existing = prev.find(p => p.role === role && p.module === module);
      if (existing) {
        return prev.map(p => p.role === role && p.module === module ? { ...p, canView: !p.canView } : p);
      } else {
        return [...prev, { role, module, canView: true }]; // default was false, toggling to true
      }
    });
  };

  const hasAccess = (role: string, module: string) => {
    if (role === "SUPER_ADMIN") return true;
    const p = permissions.find(p => p.role === role && p.module === module);
    return p ? p.canView : false;
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateRolePermissions(permissions);
      setMessage({ type: "success", text: "Role permissions updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update permissions." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-zinc-900">Module Visibility Permissions</h3>
          <p className="text-sm text-zinc-500">Configure which roles have access to specific dashboard modules.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Activity className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-3 rounded-lg text-sm border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-50 text-zinc-600 uppercase font-semibold text-xs border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4">Module</th>
              {ROLES.map(role => (
                <th key={role} className="px-6 py-4 text-center">{role.replace("_", " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-zinc-900 font-medium bg-white">
            {MODULES.map(module => (
              <tr key={module} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4">{module}</td>
                {ROLES.map(role => (
                  <td key={`${module}-${role}`} className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      disabled={role === "SUPER_ADMIN"}
                      checked={hasAccess(role, module)}
                      onChange={() => togglePermission(role, module)}
                      className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
