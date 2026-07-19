"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFreelancerPayment(data: {
  freelancerId: string;
  projectId: string;
  taskId?: string;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  remarks?: string;
}) {
  try {
    const payment = await prisma.freelancerPayment.create({
      data: {
        freelancerId: data.freelancerId,
        projectId: data.projectId,
        taskId: data.taskId || null,
        amount: data.amount,
        paymentDate: new Date(data.paymentDate),
        paymentMode: data.paymentMode,
        remarks: data.remarks,
      }
    });

    revalidatePath("/dashboard/freelancer-payments");
    return { success: true, id: payment.id };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
