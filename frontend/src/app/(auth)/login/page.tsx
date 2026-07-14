import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="text-xl font-semibold">
          TeamFlow
        </div>

        <div className="max-w-lg space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Plan projects. Organize teams. Deliver work.
          </h1>

          <p className="text-slate-300">
            A centralized platform for managing projects,
            team members and assigned tasks.
          </p>
        </div>

        <p className="text-sm text-slate-400">
          Project and Team Task Management Platform
        </p>
      </section>

      <section className="flex items-center justify-center bg-muted/30 p-6">
        <LoginForm />
      </section>
    </main>
  );
}