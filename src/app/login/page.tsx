import LoginForm from './login-form';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-zinc-900 p-3 md:h-36 shadow-lg">
          <div className="w-32 text-white flex flex-row items-center gap-2">
            <ShieldCheck size={32} />
            <span className="font-semibold text-xl tracking-wide">ERP</span>
          </div>
        </div>
        <div className="bg-white px-6 pb-6 pt-8 rounded-lg border shadow-sm">
            <h1 className="mb-6 text-2xl font-semibold">
              Please log in to continue.
            </h1>
            <LoginForm />
        </div>
      </div>
    </main>
  );
}
