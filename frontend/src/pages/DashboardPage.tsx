import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { EmptyState } from "../components/common/EmptyState";
import { Spinner } from "../components/common/Spinner";
import { PageHeader } from "../components/layout/PageHeader";
import { TaskTable } from "../components/tasks/TaskTable";
import { tasksApi } from "../api/tasks";
import { useAuth } from "../hooks/useAuth";
import { useSocketRefresh } from "../hooks/useSocketRefresh";
import type { Task } from "../types";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await tasksApi.list({ page: 1, limit: 8, sortBy: "createdAt", sortOrder: "desc" });
      setTasks(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useSocketRefresh(loadTasks);

  const completed = tasks.filter((task) => task.status === "DONE").length;
  const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS").length;
  const todo = tasks.filter((task) => task.status === "TODO").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back${user ? `, ${user.email}` : ""}`}
        description="A quick view of your current workload and recent activity."
        actionLabel="Create task"
        onAction={() => navigate("/tasks")}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Todo", value: todo },
          { label: "In progress", value: inProgress },
          { label: "Done", value: completed },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Recent tasks</h3>
        {loading ? <Spinner /> : tasks.length ? <TaskTable tasks={tasks} onEdit={(task) => navigate(`/tasks/${task.id}`)} onDelete={(task) => navigate(`/tasks/${task.id}`)} /> : <EmptyState title="No tasks yet" description="Create a task to get started." actionLabel="Open tasks" onAction={() => navigate("/tasks")} />}
      </section>
    </div>
  );
};