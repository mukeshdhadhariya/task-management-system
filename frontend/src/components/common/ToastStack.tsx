import { Button } from "./Button";

export interface ToastItem {
  id: number;
  title: string;
  message: string;
  tone?: "info" | "success";
}

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (toastId: number) => void;
}

const toneStyles: Record<NonNullable<ToastItem["tone"]>, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

export const ToastStack = ({ toasts, onDismiss }: ToastStackProps) => (
  <div className="pointer-events-none fixed right-4 top-4 z-[70] space-y-3 sm:right-6 sm:top-6">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`pointer-events-auto w-[min(92vw,360px)] rounded-2xl border p-4 shadow-soft ${toneStyles[toast.tone ?? "info"]}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{toast.title}</p>
            <p className="mt-1 text-sm opacity-90">{toast.message}</p>
          </div>
          <Button variant="ghost" className="h-7 px-2 py-1 text-xs" type="button" onClick={() => onDismiss(toast.id)}>
            Close
          </Button>
        </div>
      </div>
    ))}
  </div>
);