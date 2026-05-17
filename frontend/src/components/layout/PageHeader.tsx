import { Button } from "../common/Button";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const PageHeader = ({ title, description, actionLabel, onAction }: PageHeaderProps) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
    {actionLabel && onAction ? <Button className="w-full sm:w-auto" onClick={onAction}>{actionLabel}</Button> : null}
  </div>
);