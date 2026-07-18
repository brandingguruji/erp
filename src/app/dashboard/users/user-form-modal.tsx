"use client"

import { useState } from "react"
import { PlusCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UserFormModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
      >
        <PlusCircle className="h-4 w-4" />
        <span className="hidden sm:inline">New User</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add New User</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-zinc-100 transition-colors"
              >
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>
            
            <div className="py-4">
              <p className="text-sm text-zinc-500">User form content will go here.</p>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="button" className="bg-zinc-900 text-white hover:bg-zinc-800">
                Save User
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
