"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createClient(formData: FormData) {
  const session = await auth();
  // if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string)) {
  //   throw new Error("Unauthorized to create clients");
  // }

  const companyName = formData.get("companyName") as string;
  const clientName = formData.get("clientName") as string;
  const gst = formData.get("gst") as string;
  const pan = formData.get("pan") as string;
  const contactPerson = formData.get("contactPerson") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const address = formData.get("address") as string;
  const country = formData.get("country") as string;
  const industry = formData.get("industry") as string;
  const website = formData.get("website") as string;
  const source = formData.get("source") as string;
  const status = formData.get("status") as string || "Active";

  if (!companyName || !clientName || !email) {
    throw new Error("Missing required fields");
  }

  await prisma.client.create({
    data: {
      companyName,
      clientName,
      gst,
      pan,
      contactPerson,
      email,
      phone,
      whatsapp,
      address,
      country,
      industry,
      website,
      source,
      status,
    }
  });

  revalidatePath("/dashboard/clients");
}

export async function deleteClient(id: string) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN"].includes(session.user?.role as string)) {
    throw new Error("Unauthorized to delete clients");
  }

  await prisma.client.delete({ where: { id } });
  revalidatePath("/dashboard/clients");
}
