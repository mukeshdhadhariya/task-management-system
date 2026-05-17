import { Button } from "../common/Button";
import { useAuth } from "../../hooks/useAuth";

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="md:hidden" onClick={onMenuClick} type="button">
          Menu
        </Button>
        <div>
          <p className="text-sm font-semibold text-slate-900">Task Management System</p>
          <p className="text-xs text-slate-500">Minimal, role-aware dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">{user?.email}</p>
          <p className="text-xs text-slate-500">{user?.role}</p>
        </div>
        <Button variant="secondary" onClick={logout} type="button">
          Logout
        </Button>
      </div>
    </header>
  );
};