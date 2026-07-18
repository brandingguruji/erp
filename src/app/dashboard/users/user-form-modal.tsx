"use client"

import { useState } from "react"
import { PlusCircle, X, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createUser, updateUser } from "./actions"

type User = {
  id: string
  name: string | null
  email: string
  role: string
}

export default function UserFormModal({ isSuperAdmin, user }: { isSuperAdmin: boolean, user?: User }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!isSuperAdmin) {
    return null; // Only Super Admin can see the add/edit user button
  }

  const isEdit = !!user;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      if (isEdit) {
        await updateUser(user.id, formData);
      } else {
        await createUser(formData);
      }
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || `Failed to ${isEdit ? "update" : "create"} user`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!isEdit ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">New User</span>
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="text-zinc-400 hover:text-zinc-900 font-medium text-sm transition-colors flex items-center gap-1"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{isEdit ? "Edit User" : "Add New User"}</h2>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-zinc-100 transition-colors"
              >
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>
            
            <form onSubmit={onSubmit} className="space-y-4 text-left">
              {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input required name="name" defaultValue={user?.name || ""} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="John Doe" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input required type="email" name="email" defaultValue={user?.email || ""} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="john@example.com" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password {isEdit && <span className="text-zinc-400 font-normal">(Leave blank to keep unchanged)</span>}</label>
                <input name="password" type="password" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder={isEdit ? "New password..." : "Leave blank for default (123456)"} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select name="role" required defaultValue={user?.role || "CLIENT"} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="FINANCE">Finance</option>
                  <option value="CLIENT">Client</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-zinc-900 text-white hover:bg-zinc-800">
                  {loading ? "Saving..." : (isEdit ? "Update User" : "Save User")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
