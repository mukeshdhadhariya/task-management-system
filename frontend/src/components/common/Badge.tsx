import { cn } from "../../utils/cn";
import type { TaskPriority, TaskStatus } from "../../types";

interface BadgeProps {
  children: string;
  tone?: TaskStatus | TaskPriority | "neutral";
}

const toneMap: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  DONE: "bg-emerald-100 text-emerald-800",
  LOW: "bg-sky-100 text-sky-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HIGH: "bg-rose-100 text-rose-800",
  neutral: "bg-slate-100 text-slate-700",
};

export const Badge = ({ children, tone = "neutral" }: BadgeProps) => (
  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", toneMap[tone])}>
    {children}
  </span>
);