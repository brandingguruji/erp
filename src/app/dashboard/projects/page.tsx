import prisma from "@/lib/prisma";
import { Search, FolderKanban, UserCircle, Calendar, FileText } from "lucide-react";
import ProjectFormModal from "./project-form-modal";
import AssignTeamModal from "./assign-team-modal";
import StatusProgressBar from "./status-progress-bar";
import LogPaymentModal from "./log-payment-modal";
import Pagination from "@/components/pagination";
import InvoiceModal from "./invoice-modal";
import { auth } from "@/auth";
import Link from "next/link";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === 'string' ? Number(resolvedParams.page) : 1;
  const PAGE_SIZE = 10;
  const skip = (page - 1) * PAGE_SIZE;
  const session = await auth();
  const currentUserId = session?.user?.id;
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const isAdmin = session?.user?.role === 'ADMIN';

  const whereClause = (isSuperAdmin || isAdmin) ? {} : {
    OR: [
      { assignments: { some: { userId: currentUserId } } },
      { pocs: { some: { id: currentUserId } } }
    ]
  };

  const [projects, totalCount] = await Promise.all([
    prisma.project.findMany({
      where: whereClause,
      include: {
        client: true,
        pocs: true,
        payments: { orderBy: { paymentDate: 'asc' } },
        assignments: { include: { user: true } },
        statusHistory: { include: { changedBy: true }, orderBy: { createdAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE
    }),
    prisma.project.count({ where: whereClause })
  ]);

  const clients = await prisma.client.findMany({
    select: { id: true, companyName: true, clientName: true },
    orderBy: { companyName: 'asc' }
  });

  const teamUsers = await prisma.user.findMany({
    where: { role: { in: ['DEVELOPER', 'ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' }
  });

  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'] } },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Projects</h1>
          <p className="text-zinc-500 mt-1">Manage ongoing work and delivery timelines.</p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <ProjectFormModal clients={clients} admins={admins} isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-medium">
              <tr>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">POCs</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No active projects found. Start by creating a new project.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                          <FolderKanban className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900">{project.name}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">{project.projectCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900">
                        {project.client.clientName} {project.client.companyName ? <span className="text-zinc-500 font-normal text-sm">({project.client.companyName})</span> : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2 text-zinc-600">
                        {project.pocs.length > 0 ? (
                          project.pocs.map((poc, idx) => (
                            <span key={poc.id || idx} className="flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded text-xs">
                              <UserCircle className="h-3 w-3" />
                              {poc.name || poc.email}
                            </span>
                          ))
                        ) : (
                          <span className="text-zinc-400 text-xs">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusProgressBar 
                        projectId={project.id}
                        currentStatus={project.status}
                        canEdit={isSuperAdmin || project.pocs.some(p => p.id === currentUserId)}
                        history={project.statusHistory}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/dashboard/projects/${project.id}`}
                            className="text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors"
                          >
                            View
                          </Link>
                          {isSuperAdmin || isAdmin ? (
                            <>
                              <LogPaymentModal projectId={project.id} projectName={project.name} />
                              <InvoiceModal project={JSON.parse(JSON.stringify(project))} />
                            </>
                          ) : null}
                        </div>
                        <AssignTeamModal 
                          projectId={project.id} 
                          projectName={project.name} 
                          users={teamUsers} 
                          assignments={project.assignments} 
                        />
                      </div>
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
