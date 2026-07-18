"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only Super Admin can add users");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string; // in real app, hash this

  if (!name || !email || !role) {
    throw new Error("Missing required fields");
  }

  // Generate EMP ID (e.g., BG001)
  const lastUser = await prisma.user.findFirst({
    where: { empId: { not: null } },
    orderBy: { empId: 'desc' }
  });

  let nextEmpId = "BG001";
  if (lastUser && lastUser.empId && lastUser.empId.startsWith("BG")) {
    const numPart = parseInt(lastUser.empId.substring(2), 10);
    if (!isNaN(numPart)) {
      nextEmpId = `BG${String(numPart + 1).padStart(3, '0')}`;
    }
  }

  await prisma.user.create({
    data: {
      empId: nextEmpId,
      name,
      email,
      role: role as any,
      password: password || "123456", // default password if not provided
    }
  });

  revalidatePath("/dashboard/users");
}

export async function updateUser(userId: string, formData: FormData) {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only Super Admin can edit users");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !role) {
    throw new Error("Missing required fields");
  }

  const updateData: any = { name, email, role };
  if (password) {
    updateData.password = password; // hash in real app
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  revalidatePath("/dashboard/users");
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only Super Admin can manage user status");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });

  revalidatePath("/dashboard/users");
}
