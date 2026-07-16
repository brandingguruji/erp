"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string)) {
    throw new Error("Unauthorized to create users");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const passwordRaw = formData.get("password") as string;
  const role = formData.get("role") as Role;

  if (!name || !email || !passwordRaw || !role) {
    throw new Error("Missing required fields");
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const password = await bcrypt.hash(passwordRaw, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password,
      role,
    }
  });

  revalidatePath("/dashboard/users");
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN"].includes(session.user?.role as string)) {
    throw new Error("Unauthorized to delete users");
  }

  // Prevent deleting oneself
  if (session.user?.id === id) {
    throw new Error("Cannot delete your own account");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/dashboard/users");
}
