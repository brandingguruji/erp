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
    <div className="min-h-screen bg-gray-100 py-8 flex justify-center print:bg-white print:py-0">
      
      {/* A4 Paper Container */}
      <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl relative overflow-hidden print:shadow-none print:w-[210mm] print:h-[297mm]">
        
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
           <h1 className="text-8xl font-black text-[#d82483] rotate-[-45deg] tracking-widest whitespace-nowrap">BRANDING GURUJI</h1>
        </div>

        {/* Top Header Wave */}
        <div className="absolute top-0 left-0 right-0 h-[220px] bg-[#d82483] z-10" 
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 60%)' }}>
        </div>

        {/* Header Content */}
        <div className="relative z-20 flex justify-between items-start pt-12 px-12">
          <div className="bg-white p-3 rounded shadow-md inline-block">
            <h1 className="text-xl font-black text-[#d82483] tracking-wider uppercase">Branding Guruji</h1>
          </div>
          <div className="text-right text-white space-y-0.5">
            <h2 className="text-lg font-bold">Brandingguruji LLP</h2>
            <p className="text-xs opacity-90">18, Gour Mohan Roy, Bhatpara</p>
            <p className="text-xs opacity-90">North 24 pgs, West Bengal, India 743123</p>
            <p className="text-xs font-semibold mt-1">LLPIN: ACX-5486</p>
            <p className="text-xs font-semibold">PAN: ABGFB7809M</p>
            {/* Replace with actual GST if provided later */}
            <p className="text-xs font-semibold">GSTIN: 19ABGFB7809M1Z5</p> 
          </div>
        </div>

        {/* Border Left/Right for letterhead style */}
        <div className="absolute left-8 top-64 bottom-32 w-1 bg-[#8c3a88] z-0"></div>
        <div className="absolute right-8 top-64 bottom-32 w-1 bg-[#8c3a88] z-0"></div>

        {/* Invoice Body */}
        <div className="relative z-10 mt-32 px-16 space-y-10">
          
          <div className="flex justify-between items-end border-b-2 border-zinc-200 pb-4">
            <div>
              <h1 className="text-4xl font-black text-zinc-900 tracking-tight">INVOICE</h1>
              <p className="text-zinc-500 font-medium mt-1">#{invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-zinc-800">Date: {format(new Date(), 'dd MMM yyyy')}</p>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Billed To</p>
              <h3 className="text-lg font-bold text-zinc-900">{project.client.companyName}</h3>
              <p className="text-sm text-zinc-600 font-medium">{project.client.clientName}</p>
              {project.client.address && <p className="text-sm text-zinc-500 max-w-xs">{project.client.address}</p>}
              {project.client.gst && <p className="text-sm font-semibold text-zinc-700 mt-2">GSTIN: {project.client.gst}</p>}
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Project Details</p>
              <h3 className="text-lg font-bold text-zinc-900">{project.name}</h3>
              <p className="text-sm text-zinc-600 font-medium">Code: {project.projectCode}</p>
            </div>
          </div>

          {/* Description */}
          <div className="border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-zinc-900">{project.name} - Project Development</p>
                    {project.description && <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{project.description}</p>}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-zinc-900">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payments Section */}
          {project.payments.length > 0 && (
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Payment History</p>
              <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 space-y-2">
                {project.payments.map((p, i) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-zinc-600">Payment {i + 1} ({format(new Date(p.paymentDate), 'dd MMM yyyy')} - {p.paymentMode})</span>
                    <span className="font-medium text-zinc-900">- ₹{Number(p.amount).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm font-medium text-zinc-600">
                <span>Subtotal</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-zinc-600">
                <span>Total Paid</span>
                <span className="text-green-600">- ₹{totalPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-[#d82483] border-t-2 border-zinc-200 pt-3 mt-3">
                <span>Balance Due</span>
                <span>₹{balanceDue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Bottom Footer Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-r from-[#d82483] to-[#8c3a88] z-10 flex items-center justify-around px-12 text-white"
             style={{ clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 100%)' }}>
          
          <div className="flex items-center gap-2 text-xs font-medium mt-6">
            <span>📞 +91 74396 82218</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium mt-6">
            <span>✉️ hello@brandingguruji.com</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium mt-6">
            <span>🌐 www.brandingguruji.com</span>
          </div>
        </div>

      </div>

      <InvoiceActions projectId={project.id} />
    </div>
  );
}
