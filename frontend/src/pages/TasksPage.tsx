import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { Spinner } from "../components/common/Spinner";
import { PageHeader } from "../components/layout/PageHeader";
import { TaskForm } from "../components/forms/TaskForm";
import { TaskFilters } from "../components/tasks/TaskFilters";
import { TaskTable } from "../components/tasks/TaskTable";
import { tasksApi } from "../api/tasks";
import { usersApi } from "../api/users";
import { useAuth } from "../hooks/useAuth";
import { useSocketRefresh } from "../hooks/useSocketRefresh";
import type { Task, TaskPriority, TaskStatus, User } from "../types";
import type { TaskSchemaValues } from "../validators/task";

export const TasksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pageMeta, setPageMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const query = useMemo(() => ({
    page: Number(searchParams.get("page") ?? 1),
    limit: 10,
    status: (searchParams.get("status") ?? "") as TaskStatus | "",
    priority: (searchParams.get("priority") ?? "") as TaskPriority | "",
    sortBy: (searchParams.get("sortBy") ?? "createdAt") as "createdAt" | "dueDate" | "priority",
    sortOrder: (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc",
  }), [searchParams]);

  const loadTasks = useCallback(async () => {
    setLoading(true);

    try {
      const response = await tasksApi.list(query);
      setTasks(response.data);
      setPageMeta(response.meta);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const loadUsers = useCallback(async () => {
    if (user?.role !== "ADMIN") {
      setUsers(user ? [user] : []);
      return;
    }

    const response = await usersApi.list();
    setUsers(response.data);
  }, [user]);

  useEffect(() => {
    void loadTasks();
    void loadUsers();
  }, [loadTasks, loadUsers]);

  useSocketRefresh(loadTasks);

  const openCreate = () => {
    setSelectedTask(null);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setSelectedTask(task);
    setFormOpen(true);
  };

  const handleFilters = (field: string, value: string) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(field, value);
    } else {
      next.delete(field);
    }

    next.set("page", "1");
    setSearchParams(next);
  };

  const saveTask = async (values: TaskSchemaValues) => {
    setSaving(true);

    try {
      if (selectedTask) {
        await tasksApi.update(selectedTask.id, values);
      } else {
        await tasksApi.create(values);
      }

      setFormOpen(false);
      setSelectedTask(null);
      await loadTasks();
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async () => {
    if (!deleteTarget) {
      return;
    }

    setSaving(true);

    try {
      await tasksApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadTasks();
    } finally {
      setSaving(false);
    }
  };

  const totalTasks = pageMeta.total;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description={`Manage work across ${totalTasks} task${totalTasks === 1 ? "" : "s"}.`}
        actionLabel="Create task"
        onAction={openCreate}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <TaskFilters
          status={query.status}
          priority={query.priority}
          sortBy={query.sortBy}
          sortOrder={query.sortOrder}
          onChange={handleFilters}
        />
      </div>

      {loading ? <Spinner /> : tasks.length ? <TaskTable tasks={tasks} onEdit={openEdit} onDelete={setDeleteTarget} /> : <EmptyState title="No tasks found" description="Adjust filters or create a new task." actionLabel="Create task" onAction={openCreate} />}

      {pageMeta.totalPages > 1 ? (
        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
          <p>
            Page {pageMeta.page} of {pageMeta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={pageMeta.page <= 1} onClick={() => setSearchParams((current) => {
              current.set("page", String(pageMeta.page - 1));
              return current;
            })} type="button">
              Previous
            </Button>
            <Button variant="secondary" disabled={pageMeta.page >= pageMeta.totalPages} onClick={() => setSearchParams((current) => {
              current.set("page", String(pageMeta.page + 1));
              return current;
            })} type="button">
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Modal title={selectedTask ? "Edit task" : "Create task"} open={formOpen} onClose={() => setFormOpen(false)}>
        <TaskForm initialTask={selectedTask} users={users} isSaving={saving} onSubmit={saveTask} />
      </Modal>

      <Modal
        title="Delete task"
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        footer={(
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} type="button">Cancel</Button>
            <Button variant="danger" disabled={saving} onClick={deleteTask} type="button">Delete</Button>
          </div>
        )}
      >
        <p className="text-sm text-slate-600">This will permanently remove the selected task.</p>
      </Modal>
    </div>
  );
};