"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FileText, ArrowLeft, X } from "lucide-react";
import { sendInvoiceEmail } from "./actions";

export default function InvoiceModal({ project }: { project: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate financials
  const totalAmount = Number(project.finalizeValue || project.quoteValue || 0);
  const totalPaid = project.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
  const balanceDue = totalAmount - totalPaid;

  const invoiceNumber = `INV-${project.projectCode}-${new Date().getFullYear()}`;

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      const res = await sendInvoiceEmail(project.id);
      if (res.simulated) {
        alert("Email sent successfully! (Simulated mode: check terminal logs since SMTP is not configured in .env)");
      } else {
        alert("Invoice emailed to client successfully!");
      }
    } catch (err: any) {
      alert("Failed to send email: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 bg-[#d82483]/10 hover:bg-[#d82483]/20 text-[#d82483] font-semibold py-1.5 px-3 rounded-lg transition-colors text-xs uppercase tracking-wider"
      >
        <FileText className="w-3.5 h-3.5" /> Invoice
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:bg-white print:p-0 print:block">
          
          <div className="absolute top-4 right-4 flex gap-3 print:hidden z-[60]">
             <button 
                onClick={() => window.print()}
                className="bg-white text-zinc-900 px-5 py-2 rounded-full shadow-lg font-bold hover:bg-zinc-50 border border-zinc-200 transition-colors whitespace-nowrap text-sm"
              >
                Download PDF
              </button>
              <button 
                onClick={handleSendEmail}
                disabled={loading}
                className="bg-[#d82483] text-white px-5 py-2 rounded-full shadow-lg font-bold hover:bg-[#b01e6a] transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap text-sm"
              >
                <span>✉️</span> {loading ? "Sending..." : "Send to Client"}
              </button>
              <button onClick={() => setIsOpen(false)} className="bg-white text-zinc-600 p-2 rounded-full shadow-lg hover:bg-zinc-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
          </div>
          <div className="my-auto print:m-0 invoice-print-container">
             <style>{`
               @media print {
                 body * {
                   visibility: hidden;
                 }
                 .invoice-print-container, .invoice-print-container * {
                   visibility: visible;
                 }
                 .invoice-print-container {
                   position: absolute !important;
                   left: 0 !important;
                   top: 0 !important;
                   width: 210mm !important;
                   height: 297mm !important;
                   transform: none !important;
                   margin: 0 !important;
                   padding: 0 !important;
                 }
                 @page {
                   size: A4 portrait;
                   margin: 0;
                 }
               }
             `}</style>
             {/* A4 Paper Container */}
             <div 
                className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-2xl relative overflow-hidden print:shadow-none print:w-[210mm] print:h-[297mm] mx-auto transform origin-top sm:scale-100 scale-75"
                style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
              >
                
                {/* Background Letterhead Image */}
                <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none print:w-[210mm] print:h-[297mm]">
                  <img src="/letterhead.jpeg" alt="Letterhead" className="w-full h-full object-cover print:object-fill" />
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

                  {project.payments && project.payments.length > 0 && (
                    <div className="mb-12">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Payment History</p>
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-zinc-100 space-y-3 shadow-sm">
                        {project.payments.map((payment: any, idx: number) => (
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
          </div>
        </div>
      )}
    </>
  );
}
