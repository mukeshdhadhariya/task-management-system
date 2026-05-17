import { useEffect, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";

import { ToastStack, type ToastItem } from "../components/common/ToastStack";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { subscribeToTaskEvents, type TaskSocketEventName, type TaskSocketEventPayload } from "../socket";

export const AppLayout = ({ children }: { children?: ReactNode }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = (toastId: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  };

  useEffect(() => {
    if (!user) {
      setToasts([]);
      return;
    }

    const createToast = (eventName: TaskSocketEventName, payload: TaskSocketEventPayload) => {
      if (payload.actorUserId === user.id) {
        return;
      }

      if (payload.task.assignedToId !== user.id) {
        return;
      }

      const taskTitle = payload.task.title ?? "a task";

      const contentByEvent: Record<TaskSocketEventName, Pick<ToastItem, "title" | "message" | "tone">> = {
        "task:created": {
          title: "New task assigned",
          message: `You received ${taskTitle}.`,
          tone: "success",
        },
        "task:updated": {
          title: "Task updated",
          message: `${taskTitle} has new updates.`,
          tone: "info",
        },
        "task:deleted": {
          title: "Task removed",
          message: `${taskTitle} was removed from your queue.`,
          tone: "info",
        },
      };

      const toast: ToastItem = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        ...contentByEvent[eventName],
      };

      setToasts((current) => [...current, toast].slice(-4));

      window.setTimeout(() => {
        dismissToast(toast.id);
      }, 5500);
    };

    return subscribeToTaskEvents(createToast);
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>

        <div className="flex min-h-screen flex-col">
          <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 md:p-6">{children ?? <Outlet />}</main>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="h-full w-80 max-w-[85vw] bg-white" onClick={(event) => event.stopPropagation()}>
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
};