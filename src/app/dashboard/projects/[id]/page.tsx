import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Lock, Users, Clock } from "lucide-react";
import Link from "next/link";
import StatusProgressBar from "../status-progress-bar";
import { DetailsCard, FinancialsCard, TimelineCard, CredentialsCard } from "./project-edit-cards";
import AssignTeamModal from "../assign-team-modal";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const resolvedParams = await params;

  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.id },
    include: {
      client: true,
      pocs: true,
      assignments: { include: { user: true } },
      statusHistory: { include: { changedBy: true }, orderBy: { createdAt: 'desc' } },
      lastUpdatedBy: true
    }
  });

  if (!project) notFound();

  const isSuperAdmin = session.user?.role === "SUPER_ADMIN";
  const isAdmin = session.user?.role === "ADMIN";
  const isPoc = project.pocs.some(p => p.id === session.user?.id);
  const isTeamMember = project.assignments.some(a => a.userId === session.user?.id) || isPoc;

  if (!isSuperAdmin && !isAdmin && !isTeamMember) {
    redirect("/dashboard/projects"); // Unauthorized for this specific project
  }

  const showFinancials = isSuperAdmin || isAdmin;
  const canEditGeneral = isSuperAdmin || isPoc;
  const canEditFinancials = isSuperAdmin || isAdmin;

  const clients = await prisma.client.findMany({ select: { id: true, companyName: true, clientName: true } });
  
  const teamUsers = await prisma.user.findMany({
    where: { role: { in: ['DEVELOPER', 'ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' }
  });

  const serializedProject = {
    ...project,
    budget: project.budget ? project.budget.toString() : null,
    quoteValue: project.quoteValue ? project.quoteValue.toString() : null,
    finalizeValue: project.finalizeValue ? project.finalizeValue.toString() : null,
  };

  let credentials = [];
  try {
    if (project.credentials) {
      credentials = typeof project.credentials === 'string' ? JSON.parse(project.credentials) : project.credentials;
    }
  } catch (e) {
    console.error("Failed to parse credentials", e);
  }

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-8 overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
          <div className="space-y-4">
            <Link href="/dashboard/projects" className="inline-flex items-center justify-center p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">{project.name}</h1>
              <div className="flex items-center gap-3 text-zinc-300 text-sm font-medium">
                <span className="px-2.5 py-1 bg-white/10 rounded-md backdrop-blur-sm">Code: {project.projectCode}</span>
                {project.lastUpdatedBy && (
                  <span className="flex items-center gap-1.5 opacity-80">
                    <Clock className="w-4 h-4" />
                    Last updated by {project.lastUpdatedBy.name} on {project.updatedAt.toLocaleDateString('en-US', {dateStyle: 'medium'})}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
        <StatusProgressBar 
          projectId={project.id} 
          currentStatus={project.status} 
          canEdit={canEditGeneral} 
          history={project.statusHistory as any}
          inline={true} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <DetailsCard project={serializedProject} canEdit={canEditGeneral} clients={clients} />

        {showFinancials && (
          <FinancialsCard project={serializedProject} canEdit={canEditFinancials} />
        )}

        <TimelineCard project={serializedProject} canEdit={canEditGeneral} />

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-zinc-200/60 p-6 relative group transition-all hover:shadow-md">
          {canEditGeneral && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <AssignTeamModal 
                projectId={project.id} 
                projectName={project.name} 
                users={teamUsers as any} 
                assignments={project.assignments as any} 
              />
            </div>
          )}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">Team</h2>
          </div>
          <div className="space-y-5 text-sm">
            <div>
              <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block mb-2">Points of Contact</span>
              {project.pocs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.pocs.map(p => (
                    <span key={p.id} className="bg-zinc-100/80 text-zinc-800 px-2.5 py-1 rounded-md text-xs font-medium border border-zinc-200">
                      {p.name}
                    </span>
                  ))}
                </div>
              ) : <p className="text-zinc-400 italic">None assigned</p>}
            </div>
            <div>
              <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block mb-2">Assigned Members</span>
              {project.assignments.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.assignments.map(a => (
                    <span key={a.id} className="bg-zinc-100/80 text-zinc-800 px-2.5 py-1 rounded-md text-xs font-medium border border-zinc-200">
                      {a.user.name} <span className="text-zinc-400 ml-1">({a.allocatedDays}d)</span>
                    </span>
                  ))}
                </div>
              ) : <p className="text-zinc-400 italic">None assigned</p>}
            </div>
          </div>
        </div>

        <CredentialsCard project={serializedProject} canEdit={canEditGeneral} />
      </div>
    </div>
  );
}
