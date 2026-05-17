import type { InputHTMLAttributes } from "react";

import { cn } from "../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, className, ...props }: InputProps) => (
  <label className="block space-y-1.5 text-sm">
    <span className="font-medium text-slate-700">{label}</span>
    <input
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
        error && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
        className
      )}
      {...props}
    />
    {error ? <p className="text-xs text-rose-600">{error}</p> : null}
  </label>
);