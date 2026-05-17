import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
    {actionLabel && onAction ? (
      <Button className="mt-5" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </div>
);