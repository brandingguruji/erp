import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FileText, ArrowRight, DollarSign } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function InvoicesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const projects = await prisma.project.findMany({
    include: {
      client: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" }
  });

  // Calculate totals across all projects
  let grandTotal = 0;
  let grandPaid = 0;
  
  const formattedProjects = projects.map(p => {
    const totalAmount = Number(p.finalizeValue || p.quoteValue || 0);
    const totalPaid = p.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const balanceDue = totalAmount - totalPaid;
    
    grandTotal += totalAmount;
    grandPaid += totalPaid;

    return {
      ...p,
      totalAmount,
      totalPaid,
      balanceDue,
      invoiceNumber: `INV-${p.projectCode}-${new Date().getFullYear()}`
    };
  });

  const grandDue = grandTotal - grandPaid;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#d82483]/10 p-3 rounded-xl text-[#d82483]">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Invoices & Billing</h1>
            <p className="text-sm font-medium text-zinc-500 mt-1">Manage project invoices, payments, and balances.</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Total Billed</p>
          <h3 className="text-3xl font-black text-zinc-900">₹{grandTotal.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/30 p-6 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Total Received</p>
          <h3 className="text-3xl font-black text-emerald-700">₹{grandPaid.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-white rounded-2xl border border-[#d82483]/20 bg-[#d82483]/5 p-6 shadow-sm">
          <p className="text-xs font-bold text-[#d82483] uppercase tracking-wider mb-2">Outstanding Balance</p>
          <h3 className="text-3xl font-black text-[#d82483]">₹{grandDue.toLocaleString('en-IN')}</h3>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 text-zinc-600 uppercase font-semibold text-xs border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4">Invoice / Project</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Paid</th>
                <th className="px-6 py-4">Balance Due</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-900 font-medium bg-white">
              {formattedProjects.map((project) => (
                <tr key={project.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900">{project.invoiceNumber}</div>
                    <div className="text-zinc-500 font-medium text-xs mt-0.5">{project.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900">{project.client.companyName}</div>
                    <div className="text-zinc-500 font-medium text-xs mt-0.5">{project.client.clientName}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900">
                    ₹{project.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">
                    ₹{project.totalPaid.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#d82483]">
                    ₹{project.balanceDue.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/dashboard/projects/${project.id}/invoice`}
                      className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2 px-4 rounded-lg transition-colors text-xs"
                    >
                      View Invoice <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
