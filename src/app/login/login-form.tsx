"use client";

import { authenticate } from "./actions";
import { useActionState } from "react";
import { LogIn } from "lucide-react";

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-900" htmlFor="email">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="admin@brandingguruji.com"
          required
          className="w-full border border-zinc-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-900" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter password"
          required
          className="w-full border border-zinc-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="rememberMe" 
          name="rememberMe" 
          className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 w-4 h-4 cursor-pointer"
        />
        <label htmlFor="rememberMe" className="text-sm font-medium text-zinc-700 cursor-pointer select-none">
          Remember me
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white font-semibold py-2.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 mt-4"
      >
        {isPending ? "Logging in..." : (
          <>
            <LogIn className="w-5 h-5" />
            Sign in
          </>
        )}
      </button>

      {errorMessage && (
        <p className="text-sm text-red-500 font-medium text-center bg-red-50 p-2 rounded-lg border border-red-100">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
