import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Receipt, Search } from "lucide-react";
import Pagination from "@/components/pagination";
import LogPaymentModal from "./log-payment-modal";
import { auth } from "@/auth";

export default async function FreelancerPaymentsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === 'string' ? Number(resolvedParams.page) : 1;
  const PAGE_SIZE = 10;
  const skip = (page - 1) * PAGE_SIZE;

  // Verify access (Only Admins/Super Admins should probably see all freelancer payments)
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  // Fetch freelancers (Users with DEVELOPER role)
  const freelancers = await prisma.user.findMany({
    where: { role: 'DEVELOPER', isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  // Fetch projects and their tasks
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      projectCode: true,
      tasks: { select: { id: true, title: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch payments
  const [payments, totalCount] = await Promise.all([
    prisma.freelancerPayment.findMany({
      include: {
        freelancer: { select: { name: true } },
        project: { select: { name: true, projectCode: true } },
        task: { select: { title: true } }
      },
      orderBy: { paymentDate: 'desc' },
      skip,
      take: PAGE_SIZE
    }),
    prisma.freelancerPayment.count()
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#d82483]" /> Freelancer Payments
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Track outgoing payments to developers and freelancers.</p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <LogPaymentModal freelancers={freelancers} projects={projects} />
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Freelancer</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project / Task</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Mode</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    No freelancer payments recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-zinc-700">
                      {format(new Date(payment.paymentDate), "dd MMM yyyy")}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-zinc-900">{payment.freelancer?.name || 'Unknown'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-zinc-800">{payment.project?.name}</p>
                      {payment.task && (
                        <p className="text-xs text-zinc-500 mt-0.5">Task: {payment.task.title}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 text-xs font-medium text-zinc-600">
                        {payment.paymentMode}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <p className="text-sm font-bold text-[#d82483]">
                        ₹{Number(payment.amount).toLocaleString('en-IN')}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-100">
            <Pagination totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}
