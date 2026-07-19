"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendInvoiceEmail } from "../../actions";
import { ArrowLeft } from "lucide-react";

export function InvoiceActions({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      const res = await sendInvoiceEmail(projectId);
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
    <div className="fixed top-8 right-8 flex flex-row items-center gap-3 print:hidden z-50">
      <button 
        onClick={() => router.back()}
        className="bg-white text-zinc-600 px-5 py-3 rounded-full shadow-lg font-bold hover:bg-zinc-50 border border-zinc-200 transition-colors flex items-center gap-2 whitespace-nowrap"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <button 
        onClick={() => window.print()}
        className="bg-white text-zinc-900 px-5 py-3 rounded-full shadow-lg font-bold hover:bg-zinc-50 border border-zinc-200 transition-colors whitespace-nowrap"
      >
        Download PDF
      </button>
      <button 
        onClick={handleSendEmail}
        disabled={loading}
        className="bg-[#d82483] text-white px-6 py-3 rounded-full shadow-lg font-bold hover:bg-[#b01e6a] transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
      >
        <span>✉️</span> {loading ? "Sending..." : "Send to Client"}
      </button>
    </div>
  );
}
