import type { ReactNode } from "react";

export const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8">
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col justify-between bg-slate-950 p-8 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Penscience</p>
          <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight">Task operations for teams that want a clean control center.</h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
            Manage tasks, users, uploads, and realtime updates from one focused dashboard.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-lg font-semibold text-white">RBAC</p>
            <p className="mt-1">Admin and user scopes</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-lg font-semibold text-white">Realtime</p>
            <p className="mt-1">Socket-driven refresh</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-lg font-semibold text-white">Documents</p>
            <p className="mt-1">PDF uploads and downloads</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">{children}</div>
    </div>
  </div>
);