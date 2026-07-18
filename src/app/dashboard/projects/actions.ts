"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string)) {
    throw new Error("Unauthorized to create projects");
  }

  const name = formData.get("name") as string;
  const clientId = formData.get("clientId") as string;
  const description = formData.get("description") as string;
  const projectCode = formData.get("projectCode") as string || `PRJ-${Math.floor(Math.random() * 10000)}`;
  
  const technology = formData.get("technology") as string;
  const startDateStr = formData.get("startDate") as string;
  const deadlineStr = formData.get("deadline") as string;
  const pocIds = formData.getAll("pocIds") as string[]; // Read multiple POCs
  const credentialsStr = formData.get("credentials") as string;
  
  let credentials = null;
  if (credentialsStr) {
    try {
      credentials = JSON.parse(credentialsStr);
    } catch (e) {
      console.error("Failed to parse credentials", e);
    }
  }

  if (!name || !clientId) {
    throw new Error("Missing required fields");
  }

  await prisma.project.create({
    data: {
      name,
      projectCode,
      description,
      clientId,
      technology,
      startDate: startDateStr ? new Date(startDateStr) : null,
      deadline: deadlineStr ? new Date(deadlineStr) : null,
      credentials,
      pocs: {
        connect: pocIds.length > 0 ? pocIds.map(id => ({ id })) : [{ id: session.user.id }]
      },
      status: "INQUIRY",
    }
  });

  revalidatePath("/dashboard/projects");
}

export async function assignProjectPoc(projectId: string, userIds: string[]) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string)) {
    throw new Error("Unauthorized to assign POCs");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      pocs: {
        set: userIds.map((id) => ({ id })) // This will completely replace the current POCs with the new selection
      }
    }
  });

  revalidatePath("/dashboard/projects");
}

export async function assignTeamMember(formData: FormData) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string)) {
    throw new Error("Unauthorized to assign team members");
  }
  
  const projectId = formData.get("projectId") as string;
  const userId = formData.get("userId") as string;
  const allocatedDays = parseInt(formData.get("allocatedDays") as string, 10);
  
  if (!projectId || !userId || isNaN(allocatedDays)) {
    throw new Error("Missing required fields");
  }

  await prisma.projectAssignment.upsert({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    },
    update: {
      allocatedDays
    },
    create: {
      projectId,
      userId,
      allocatedDays
    }
  });

  revalidatePath("/dashboard/projects");
}

export async function updateProjectStatus(projectId: string, newStatus: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // Check if user is POC or Super Admin
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { pocs: true }
  });

  if (!project) throw new Error("Project not found");

  const isSuperAdmin = session.user?.role === "SUPER_ADMIN";
  const isPoc = project.pocs.some(poc => poc.id === session.user?.id);

  if (!isSuperAdmin && !isPoc) {
    throw new Error("Unauthorized: Only assigned admins can update the status");
  }

  await prisma.$transaction([
    prisma.project.update({
      where: { id: projectId },
      data: { status: newStatus as any }
    }),
    prisma.projectStatusHistory.create({
      data: {
        projectId,
        changedById: session.user.id!,
        status: newStatus as any
      }
    })
  ]);

  revalidatePath("/dashboard/projects");
}
