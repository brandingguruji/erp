"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { sendEmail } from "@/lib/mail"

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
  const pocIds = formData.getAll("pocIds") as string[]; 
  const credentialsStr = formData.get("credentials") as string;
  const quoteValueStr = formData.get("quoteValue") as string;
  const finalizeValueStr = formData.get("finalizeValue") as string;
  const budgetStr = formData.get("budget") as string;
  
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
      quoteValue: (session.user?.role === "SUPER_ADMIN" || session.user?.role === "ADMIN") && quoteValueStr ? parseFloat(quoteValueStr) : null,
      finalizeValue: (session.user?.role === "SUPER_ADMIN" || session.user?.role === "ADMIN") && finalizeValueStr ? parseFloat(finalizeValueStr) : null,
      budget: budgetStr ? parseFloat(budgetStr) : null,
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

export async function updateProjectDetails(projectId: string, data: { clientId: string, technology: string, description: string }) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { pocs: true } });
  const isSuperAdmin = session.user?.role === "SUPER_ADMIN";
  const isPoc = project?.pocs.some(p => p.id === session.user?.id);
  
  if (!isSuperAdmin && !isPoc) throw new Error("Unauthorized");
  
  await prisma.project.update({
    where: { id: projectId },
    data: { ...data, lastUpdatedById: session.user.id }
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function updateProjectTimeline(projectId: string, data: { startDate: Date | null, deadline: Date | null }) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { pocs: true } });
  const isSuperAdmin = session.user?.role === "SUPER_ADMIN";
  const isPoc = project?.pocs.some(p => p.id === session.user?.id);
  
  if (!isSuperAdmin && !isPoc) throw new Error("Unauthorized");
  
  await prisma.project.update({
    where: { id: projectId },
    data: { ...data, lastUpdatedById: session.user.id }
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function updateProjectFinancials(projectId: string, data: { budget: number | null, quoteValue: number | null, finalizeValue: number | null }) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string)) {
    throw new Error("Unauthorized");
  }
  
  await prisma.project.update({
    where: { id: projectId },
    data: { ...data, lastUpdatedById: session.user.id }
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function updateProjectCredentials(projectId: string, credentials: { name: string, value: string }[]) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { pocs: true } });
  const isSuperAdmin = session.user?.role === "SUPER_ADMIN";
  const isPoc = project?.pocs.some(p => p.id === session.user?.id);
  
  if (!isSuperAdmin && !isPoc) throw new Error("Unauthorized");
  
  await prisma.project.update({
    where: { id: projectId },
    data: { credentials, lastUpdatedById: session.user.id }
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function removeTeamAssignment(assignmentId: string, projectId: string) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string)) {
    throw new Error("Unauthorized");
  }
  
  await prisma.projectAssignment.delete({
    where: { id: assignmentId }
  });
  
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/projects");
}

export async function addProjectPayment(projectId: string, amount: number, paymentMode: string, remarks?: string, paymentDate?: string) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN", "FINANCE"].includes(session.user?.role as string)) {
    throw new Error("Unauthorized to add payments");
  }

  await prisma.payment.create({
    data: {
      projectId,
      amount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMode,
      remarks,
      receivedById: session.user.id
    }
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function sendInvoiceEmail(projectId: string) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN", "FINANCE"].includes(session.user?.role as string)) {
    throw new Error("Unauthorized");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true, payments: true }
  });

  if (!project) throw new Error("Project not found");

  const totalAmount = Number(project.finalizeValue || project.quoteValue || 0);
  const totalPaid = project.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const balanceDue = totalAmount - totalPaid;

  const invoiceNumber = `INV-${project.projectCode}-${new Date().getFullYear()}`;
  const htmlContent = `
    <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d82483;">Brandingguruji LLP - Invoice #${invoiceNumber}</h2>
      <p>Dear ${project.client.clientName},</p>
      <p>Please find the invoice details for the project <strong>${project.name}</strong> below:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr style="background: #f9f9f9; border-bottom: 1px solid #ddd;">
          <th style="padding: 10px; text-align: left;">Total Amount</th>
          <td style="padding: 10px; text-align: right;">₹${totalAmount.toLocaleString('en-IN')}</td>
        </tr>
        <tr style="background: #f9f9f9; border-bottom: 1px solid #ddd;">
          <th style="padding: 10px; text-align: left;">Total Paid</th>
          <td style="padding: 10px; text-align: right; color: green;">- ₹${totalPaid.toLocaleString('en-IN')}</td>
        </tr>
        <tr style="border-bottom: 2px solid #333;">
          <th style="padding: 10px; text-align: left; font-size: 1.2em;">Balance Due</th>
          <td style="padding: 10px; text-align: right; font-size: 1.2em; color: #d82483; font-weight: bold;">₹${balanceDue.toLocaleString('en-IN')}</td>
        </tr>
      </table>

      <p style="margin-top: 30px;">You can view the full detailed invoice or make a payment by contacting us.</p>
      <p>Thank you for your business!</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">
        Brandingguruji LLP<br/>
        18, Gour Mohan Roy, Bhatpara<br/>
        North 24 pgs, West Bengal, India 743123<br/>
        GSTIN: 19ABGFB7809M1Z5
      </p>
    </div>
  `;

  return await sendEmail({
    to: project.client.email,
    subject: `Invoice for ${project.name} - Brandingguruji LLP`,
    html: htmlContent
  });
}
