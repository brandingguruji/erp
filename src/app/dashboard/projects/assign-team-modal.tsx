"use client";

import { useState } from "react";
import { Users, X } from "lucide-react";
import { assignTeamMember, removeTeamAssignment } from "./actions";
import { Button } from "@/components/ui/button";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

type ProjectAssignment = {
  id: string;
  userId: string;
  allocatedDays: number;
  user: User;
}

export default function AssignTeamModal({ 
  projectId, 
  projectName,
  users, 
  assignments 
}: { 
  projectId: string, 
  projectName: string,
  users: User[],
  assignments: ProjectAssignment[]
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (formData: FormData) => {
    setIsSubmitting(true);
    formData.append("projectId", projectId);
    
    try {
      await assignTeamMember(formData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRemove = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to remove this assignment?")) return;
    setIsSubmitting(true);
    try {
      await removeTeamAssignment(assignmentId, projectId);
    } catch (e: any) {
      alert(e.message || "Failed to remove assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
        title="Assign Team"
      >
        <Users className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl border border-zinc-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Assign Team to {projectName}</h2>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List of currently assigned users */}
            {assignments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-700 mb-2">Currently Assigned:</h3>
                <ul className="space-y-2 max-h-32 overflow-y-auto">
                  {assignments.map(a => (
                    <li key={a.id} className="flex justify-between items-center text-sm p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                      <div>
                        <span className="font-medium text-zinc-900">{a.user.name || a.user.email}</span>
                        <span className="text-xs text-zinc-500 block">{a.user.role}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-600 font-medium">{a.allocatedDays} Days</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemove(a.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form action={handleAction} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Select Member</label>
                <select name="userId" required className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none">
                  <option value="">Select a Developer or Designer</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Allocated Days</label>
                <input 
                  type="number" 
                  name="allocatedDays" 
                  min="1"
                  required 
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none" 
                  placeholder="e.g. 5" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-zinc-900 text-white hover:bg-zinc-800">
                  {isSubmitting ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
