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

  if (!name || !clientId) {
    throw new Error("Missing required fields");
  }

  await prisma.project.create({
    data: {
      name,
      projectCode,
      description,
      clientId,
      adminId: session.user.id,
      status: "INQUIRY",
    }
  });

  revalidatePath("/dashboard/projects");
}
