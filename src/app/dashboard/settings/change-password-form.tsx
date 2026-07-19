"use client";

import { useState } from "react";
import { changePassword } from "./actions";

export default function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);
      await changePassword(formData);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
      <h3 className="text-lg font-bold text-zinc-900 mb-6">Change Password</h3>
      
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">Password successfully updated!</div>}
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1">Current Password</label>
          <input 
            type="password" 
            name="oldPassword" 
            required 
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1">New Password</label>
          <input 
            type="password" 
            name="newPassword" 
            required 
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm" 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
