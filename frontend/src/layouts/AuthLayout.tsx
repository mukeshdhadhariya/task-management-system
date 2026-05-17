import type { ReactNode } from "react";

export const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-3 py-3 sm:px-4 sm:py-6">
    <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-xl items-center justify-center overflow-hidden rounded-2xl bg-white p-4 shadow-soft sm:min-h-[calc(100dvh-3rem)] sm:rounded-3xl sm:p-6 md:max-w-3xl md:p-10">
      <div className="w-full max-w-sm sm:max-w-md">{children}</div>
    </div>
  </div>
);