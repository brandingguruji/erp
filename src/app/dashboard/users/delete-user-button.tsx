"use client"

import { useState } from "react"
import { Trash2, RefreshCw } from "lucide-react"
import { toggleUserStatus } from "./actions"

export default function DeleteUserButton({ userId, isActive, isSuperAdmin }: { userId: string, isActive: boolean, isSuperAdmin: boolean }) {
  const [loading, setLoading] = useState(false)

  if (!isSuperAdmin) return null;

  async function handleToggle() {
    if (!confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'reactivate'} this user?`)) return;
    setLoading(true);
    try {
      await toggleUserStatus(userId, !isActive);
    } catch (err: any) {
      alert(err.message || "Failed to update user status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`font-medium text-sm transition-colors flex items-center gap-1 ${
        isActive 
          ? 'text-red-400 hover:text-red-600' 
          : 'text-green-500 hover:text-green-700'
      }`}
      title={isActive ? "Deactivate User" : "Reactivate User"}
    >
      {isActive ? <Trash2 className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
      {isActive ? "Delete" : "Reactivate"}
    </button>
  )
}
