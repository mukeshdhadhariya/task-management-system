import type { ReactNode } from "react";

export const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8">
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center overflow-hidden rounded-3xl bg-white shadow-soft p-6 md:p-10">
      <div className="w-full max-w-md">{children}</div>
    </div>
  </div>
);