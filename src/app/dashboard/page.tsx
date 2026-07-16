import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth();
  
  return (
    <main>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-500">
        Welcome back, {session?.user?.name || session?.user?.email}! Your role is: {session?.user?.role}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards for dashboard metrics */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex p-4">
            <h3 className="ml-2 text-sm font-medium">Active Projects</h3>
          </div>
          <p className="truncate rounded-xl bg-white px-4 py-8 text-center text-2xl font-semibold">
            12
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex p-4">
            <h3 className="ml-2 text-sm font-medium">Pending Tasks</h3>
          </div>
          <p className="truncate rounded-xl bg-white px-4 py-8 text-center text-2xl font-semibold">
            34
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex p-4">
            <h3 className="ml-2 text-sm font-medium">Total Clients</h3>
          </div>
          <p className="truncate rounded-xl bg-white px-4 py-8 text-center text-2xl font-semibold">
            128
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex p-4">
            <h3 className="ml-2 text-sm font-medium">Total Revenue</h3>
          </div>
          <p className="truncate rounded-xl bg-white px-4 py-8 text-center text-2xl font-semibold">
            $45,231
          </p>
        </div>
      </div>
    </main>
  );
}
