import prisma from "@/lib/prisma";
import { Search, User, Shield, Mail, BadgeInfo, Filter } from "lucide-react";
import UserFormModal from "./user-form-modal";
import DeleteUserButton from "./delete-user-button";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Pagination from "@/components/pagination";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string)) {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const isSuperAdmin = session.user?.role === "SUPER_ADMIN";
  const filterStatus = typeof resolvedParams.status === 'string' ? resolvedParams.status : "active";
  
  const page = typeof resolvedParams.page === 'string' ? Number(resolvedParams.page) : 1;
  const PAGE_SIZE = 10;
  const skip = (page - 1) * PAGE_SIZE;

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: {
        isActive: filterStatus === "active",
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE
    }),
    prisma.user.count({
      where: {
        isActive: filterStatus === "active",
      }
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Users</h1>
          <p className="text-zinc-500 mt-1">Manage system access and team members.</p>
        </div>
        <div className="flex flex-wrap w-full sm:w-auto items-center gap-3">
          <div className="flex bg-zinc-100 p-1 rounded-lg">
            <Link
              href="/dashboard/users?status=active"
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterStatus === 'active' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Active
            </Link>
            <Link
              href="/dashboard/users?status=inactive"
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterStatus === 'inactive' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Inactive
            </Link>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <UserFormModal isSuperAdmin={isSuperAdmin} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-medium">
              <tr>
                <th className="px-6 py-4">EMP ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900">
                      {u.empId || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-semibold uppercase">
                          {u.name ? u.name.charAt(0) : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900">{u.name || "Unnamed"}</div>
                          <div className="flex items-center text-zinc-500 gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        u.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                        u.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isSuperAdmin && (
                        <div className="flex items-center justify-end gap-3">
                          <UserFormModal isSuperAdmin={isSuperAdmin} user={u as any} />
                          <DeleteUserButton userId={u.id} isActive={u.isActive} isSuperAdmin={isSuperAdmin} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination totalPages={Math.ceil(totalCount / PAGE_SIZE)} />
        </div>
      </div>
    </div>
  );
}
