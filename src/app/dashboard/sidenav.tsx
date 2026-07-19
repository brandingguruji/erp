import { signOut, auth } from "@/auth"
import Link from "next/link"
import { ShieldCheck, LayoutDashboard, Briefcase, Users, UserPlus, CheckSquare, FileText, Settings, LogOut, Receipt } from "lucide-react"
import prisma from "@/lib/prisma"

export default async function SideNav() {
  const session = await auth();
  const role = session?.user?.role as any;
  const isSuperAdmin = role === "SUPER_ADMIN";

  const permissions = isSuperAdmin ? [] : await prisma.rolePermission.findMany({
    where: { role }
  });

  const hasAccess = (moduleName: string) => {
    if (isSuperAdmin || moduleName === "Settings") return true;
    const perm = permissions.find(p => p.module === moduleName);
    return perm ? perm.canView : false;
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/dashboard/projects", icon: Briefcase },
    { name: "Clients", href: "/dashboard/clients", icon: Users },
    { name: "Users", href: "/dashboard/users", icon: UserPlus },
    { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
    { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
    { name: "Freelancer Payments", href: "/dashboard/freelancer-payments", icon: Receipt },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ].filter(link => hasAccess(link.name));

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2 bg-zinc-900 text-white">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-zinc-800 p-4 md:h-28"
        href="/dashboard"
      >
        <div className="w-32 text-white flex flex-row items-center gap-2">
          <ShieldCheck size={32} />
          <span className="font-semibold text-xl tracking-wide">ERP</span>
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        {navLinks.map((link) => {
          const LinkIcon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-zinc-800 p-3 text-sm font-medium hover:bg-zinc-700 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3"
            >
              <LinkIcon className="w-6" />
              <p className="hidden md:block">{link.name}</p>
            </Link>
          );
        })}
        <div className="hidden h-auto w-full grow rounded-md bg-zinc-900 md:block"></div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-zinc-800 p-3 text-sm font-medium hover:bg-red-700 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3">
            <LogOut className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
