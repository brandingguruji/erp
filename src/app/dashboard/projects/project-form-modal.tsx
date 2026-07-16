"use client"

import { useState } from "react"
import { PlusCircle, X } from "lucide-react"
import { createProject } from "./actions"
import { Button } from "@/components/ui/button"

type Client = { id: string; companyName: string }

export default function ProjectFormModal({ clients }: { clients: Client[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      await createProject(formData)
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to create project", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
      >
        <PlusCircle className="h-4 w-4" />
        <span className="hidden sm:inline">New Project</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Start a New Project</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-zinc-100 transition-colors"
              >
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>
            
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Project Name *</label>
                <input required name="name" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900" placeholder="E-commerce Redesign" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Client *</label>
                <select required name="clientId" defaultValue="" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white">
                  <option value="" disabled>Select a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Description</label>
                <textarea name="description" rows={3} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900" placeholder="Brief details about the project..."></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-zinc-900 text-white hover:bg-zinc-800">
                  {isSubmitting ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
