import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ChangePasswordForm from "./change-password-form";
import RolePermissionsForm from "./role-permissions-form";
import { Settings, Shield, Key } from "lucide-react";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string);

  // Fetch all existing permissions for the roles matrix
  const permissions = isAdmin ? await prisma.rolePermission.findMany() : [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 flex items-center gap-4">
        <div className="bg-zinc-100 p-3 rounded-xl text-zinc-900">
          <Settings className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Settings</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">Manage your account preferences and system configurations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left Column: Personal Settings */}
        <div className="xl:col-span-1 space-y-8">
          <ChangePasswordForm />
        </div>

        {/* Right Column: Admin Settings (Conditional) */}
        {isAdmin && (
          <div className="xl:col-span-2 space-y-8">
            <RolePermissionsForm initialPermissions={permissions} />
          </div>
        )}
      </div>
    </div>
  );
}
