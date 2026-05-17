import { NavLink } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

interface SidebarProps {
  onNavigate?: () => void;
}

const baseLink = "block rounded-xl px-3 py-2 text-sm font-medium transition";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? `${baseLink} bg-slate-900 text-white`
    : `${baseLink} text-slate-600 hover:bg-slate-100 hover:text-slate-900`;

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const { user } = useAuth();

  return (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white p-4">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Penscience</p>
        <h1 className="mt-1 text-xl font-bold text-slate-900">Task Manager</h1>
      </div>

      <nav className="space-y-1">
        <NavLink to="/dashboard" className={linkClass} onClick={onNavigate}>
          Dashboard
        </NavLink>
        <NavLink to="/tasks" className={linkClass} onClick={onNavigate}>
          Tasks
        </NavLink>
        {user?.role === "ADMIN" ? (
          <>
            <NavLink to="/admin" className={linkClass} onClick={onNavigate}>
              Admin
            </NavLink>
            <NavLink to="/users" className={linkClass} onClick={onNavigate}>
              Users
            </NavLink>
          </>
        ) : null}
      </nav>

      <div className="mt-auto rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-900">{user?.email}</p>
        <p>{user?.role}</p>
      </div>
    </aside>
  );
};