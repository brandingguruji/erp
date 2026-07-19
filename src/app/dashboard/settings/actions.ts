"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcryptjs from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  
  if (!oldPassword || !newPassword) throw new Error("Please fill in all fields.");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.password) throw new Error("User not found or no password set.");

  const isMatch = await bcryptjs.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Incorrect current password.");

  const hashedNewPassword = await bcryptjs.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedNewPassword }
  });

  return { success: true };
}

export async function updateRolePermissions(data: { role: string, module: string, canView: boolean }[]) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string)) {
    throw new Error("Unauthorized");
  }

  // Iterate and upsert all permutations
  for (const item of data) {
    await prisma.rolePermission.upsert({
      where: {
        role_module: {
          role: item.role as any,
          module: item.module
        }
      },
      update: { canView: item.canView },
      create: {
        role: item.role as any,
        module: item.module,
        canView: item.canView
      }
    });
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}
