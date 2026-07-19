import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { InvoiceActions } from "./invoice-actions";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.id },
    include: {
      client: true,
      payments: { orderBy: { paymentDate: 'asc' } },
    }
  });

  if (!project) return notFound();

  // Calculate financials
  const totalAmount = Number(project.finalizeValue || project.quoteValue || 0);
  const totalPaid = project.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const balanceDue = totalAmount - totalPaid;

  const invoiceNumber = `INV-${project.projectCode}-${new Date().getFullYear()}`;

  return (
    <div className="min-h-screen bg-zinc-100 py-8 flex justify-center print:bg-white print:py-0">
      
      {/* A4 Paper Container */}
      <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl relative overflow-hidden print:shadow-none print:w-[210mm] print:h-[297mm]">
        
        {/* Background Letterhead Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Ensure you save your letterhead design as 'letterhead.jpg' inside the 'public' folder! */}
          <img src="/letterhead.jpeg" alt="Letterhead" className="w-full h-full object-cover" />
        </div>

        {/* Dynamic Content Overlay */}
        <div className="relative z-10 pt-[220px] px-[60px] pb-[120px]">
          
          <div className="flex justify-between items-end border-b border-zinc-200 pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-black text-zinc-900 tracking-tight">INVOICE</h1>
              <p className="text-sm font-medium text-zinc-500 mt-1">#{invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-zinc-900">Date: {format(new Date(), "dd MMM yyyy")}</p>
            </div>
          </div>

          <div className="flex justify-between mb-12">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Billed To</p>
              <p className="text-lg font-bold text-zinc-900">{project.client.companyName}</p>
              <p className="text-sm text-zinc-600 font-medium">{project.client.clientName}</p>
              {project.client.address && <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">{project.client.address}</p>}
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Project Details</p>
              <p className="text-lg font-bold text-zinc-900">{project.name}</p>
              <p className="text-sm text-zinc-600 font-medium">Code: {project.projectCode}</p>
            </div>
          </div>

          <table className="w-full text-left mb-12">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="py-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">Description</th>
                <th className="py-3 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-zinc-100">
                <td className="py-5 font-bold text-zinc-800">{project.name} - Project Development</td>
                <td className="py-5 font-bold text-zinc-900 text-right">₹{totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          {project.payments.length > 0 && (
            <div className="mb-12">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Payment History</p>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-zinc-100 space-y-3 shadow-sm">
                {project.payments.map((payment, idx) => (
                  <div key={payment.id} className="flex justify-between text-sm">
                    <span className="text-zinc-600">
                      Payment {idx + 1} ({format(new Date(payment.paymentDate), "dd MMM yyyy")} - {payment.paymentMode})
                    </span>
                    <span className="font-bold text-zinc-900">- ₹{Number(payment.amount).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <div className="w-1/2 space-y-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-zinc-100 shadow-sm">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 font-medium">Subtotal</span>
                <span className="text-zinc-900 font-bold">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 font-medium">Total Paid</span>
                <span className="text-emerald-600 font-bold">- ₹{totalPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-lg pt-4 border-t border-zinc-200 mt-2">
                <span className="font-black text-[#d82483]">Balance Due</span>
                <span className="font-black text-[#d82483]">₹{balanceDue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Print & Email Actions Overlay */}
      <InvoiceActions projectId={project.id} />
    </div>
  );
}
