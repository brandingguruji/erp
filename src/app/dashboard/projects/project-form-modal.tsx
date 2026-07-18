"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

type Client = {
  id: string;
  companyName: string;
};

export default function ProjectFormModal({ clients }: { clients: Client[] }) {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl border border-zinc-200">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <p className="text-zinc-500 mb-6 text-sm">
              We need to add the actual form fields here. For now, this is a placeholder modal so your app doesn't crash!
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800">
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
