"use client"

import { useActionState } from "react"
import { authenticate } from "./actions"
import { Button } from "@/components/ui/button"

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  )

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          className="mb-2 block text-sm font-medium text-gray-900"
          htmlFor="email"
        >
          Email
        </label>
        <div className="relative">
          <input
            className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email address"
            required
          />
        </div>
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-medium text-gray-900"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <input
            className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
            id="password"
            type="password"
            name="password"
            placeholder="Enter password"
            required
            minLength={6}
          />
        </div>
      </div>
      <Button type="submit" className="w-full mt-6" aria-disabled={isPending} disabled={isPending}>
        Log in
      </Button>
      <div className="flex h-8 items-end space-x-1">
        {errorMessage && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    </form>
  )
}
