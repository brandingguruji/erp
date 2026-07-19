"use client";

import { useState } from "react";
import { sendInvoiceEmail } from "../../actions";

export function InvoiceActions({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);

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
    <div className="fixed bottom-8 right-8 flex gap-4 print:hidden">
      <button 
        onClick={() => window.print()}
        className="bg-white text-zinc-900 px-6 py-3 rounded-full shadow-lg font-bold hover:bg-zinc-50 border border-zinc-200 transition-colors"
      >
        Download PDF
      </button>
      <button 
        onClick={handleSendEmail}
        disabled={loading}
        className="bg-[#d82483] text-white px-6 py-3 rounded-full shadow-lg font-bold hover:bg-[#b01e6a] transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <span>✉️</span> {loading ? "Sending..." : "Send to Client"}
      </button>
    </div>
  );
}
