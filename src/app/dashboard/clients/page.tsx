import prisma from "@/lib/prisma";
import { PlusCircle, Search, Mail, Phone, Building } from "lucide-react";
import ClientFormModal from "./client-form-modal";
import Pagination from "@/components/pagination";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === 'string' ? Number(resolvedParams.page) : 1;
  const PAGE_SIZE = 10;
  const skip = (page - 1) * PAGE_SIZE;

  const [clients, totalCount] = await Promise.all([
    prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE
    }),
    prisma.client.count()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Clients</h1>
          <p className="text-zinc-500 mt-1">Manage your CRM and client relationships.</p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <ClientFormModal />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-medium">
              <tr>
                <th className="px-6 py-4">Company & Client</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Industry</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No clients found. Add a new client to get started.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-semibold uppercase">
                          {client.companyName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900">{client.companyName}</div>
                          <div className="text-zinc-500">{client.clientName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client.industry ? (
                        <div className="flex items-center gap-1.5 text-zinc-600">
                          <Building className="h-4 w-4" />
                          {client.industry}
                        </div>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-800'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-zinc-400 hover:text-zinc-900 font-medium text-sm transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination totalPages={Math.ceil(totalCount / PAGE_SIZE)} />
        </div>
      </div>
    </div>
  );
}
