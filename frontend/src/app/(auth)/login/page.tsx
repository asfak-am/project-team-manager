import type { Metadata } from "next";
import {
  CheckCircle2,
  FolderKanban,
  ShieldCheck,
  Users,
} from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | TeamFlow",
  description:
    "Sign in to TeamFlow to manage projects, teams, and tasks.",
};

const features = [
  {
    icon: FolderKanban,
    label: "Manage projects",
  },
  {
    icon: Users,
    label: "Organize teams",
  },
  {
    icon: CheckCircle2,
    label: "Track assigned tasks",
  },
];

export default function LoginPage() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      {/* Right-side background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_30%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:32px_32px]"
      />

      <div className="relative grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
        {/* Branding panel */}
        <section className="relative hidden min-h-svh overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.28),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.2),transparent_38%)]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:36px_36px]"
          />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-950 shadow-xl shadow-black/20">
              TF
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">
                TeamFlow
              </p>

              <p className="text-xs text-slate-400">
                Project Management Platform
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">
              <ShieldCheck className="size-3.5 text-violet-300" />
              Secure role-based workspace
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.06] tracking-tight xl:text-5xl">
              Plan projects.
              <span className="block bg-gradient-to-r from-violet-300 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                Organize teams.
              </span>
              Deliver work.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              Manage projects, responsibilities, deadlines, and team
              progress from one focused workspace.
            </p>

            <div className="mt-8 space-y-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.label}
                    className="flex items-center gap-3"
                  >
                    <div className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07]">
                      <Icon className="size-4 text-sky-200" />
                    </div>

                    <p className="text-sm font-medium text-slate-200">
                      {feature.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
            <span>© 2026 TeamFlow</span>
            <span>Next.js · Laravel · MySQL</span>
          </div>
        </section>

        {/* Login panel */}
        <section className="relative flex min-h-svh items-center justify-center px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 size-72 rounded-full bg-violet-500/10 blur-3xl"
          />

          <div className="relative w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-lg">
                TF
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight">
                  TeamFlow
                </p>

                <p className="text-xs text-muted-foreground">
                  Project Management Platform
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card/90 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl sm:p-8">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-primary" />
                  Secure account access
                </div>

                <h2 className="mt-4 text-3xl font-bold tracking-tight">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Sign in to continue to your TeamFlow workspace.
                </p>
              </div>

              <LoginForm />
            </div>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Project and Team Task Management Platform
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}