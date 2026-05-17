import type { SelectHTMLAttributes } from "react";

import { cn } from "../../utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = ({ label, error, className, children, ...props }: SelectProps) => (
  <label className="block space-y-1.5 text-sm">
    <span className="font-medium text-slate-700">{label}</span>
    <select
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
        error && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error ? <p className="text-xs text-rose-600">{error}</p> : null}
  </label>
);