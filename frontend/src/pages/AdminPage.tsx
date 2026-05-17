import { useCallback, useEffect, useMemo, useState } from "react";

import { tasksApi } from "../api/tasks";
import { usersApi } from "../api/users";
import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { Spinner } from "../components/common/Spinner";
import { PageHeader } from "../components/layout/PageHeader";
import { TaskForm } from "../components/forms/TaskForm";
import { UserForm } from "../components/forms/UserForm";
import { TaskTable } from "../components/tasks/TaskTable";
import { useSocketRefresh } from "../hooks/useSocketRefresh";
import { formatDate } from "../utils/format";
import type { Task, User } from "../types";
import type { TaskSchemaValues } from "../validators/task";
import type { UserSchemaValues } from "../validators/user";

export const AdminPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [taskPageMeta, setTaskPageMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [userPageMeta, setUserPageMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [userFormOpen, setUserFormOpen] = useState(false);

  const loadAdminData = useCallback(async (taskPage = 1, userPage = 1) => {
    setLoading(true);

    try {
      const [taskResponse, userResponse] = await Promise.all([
        tasksApi.list({ page: taskPage, limit: 10, sortBy: "createdAt", sortOrder: "desc" }),
        usersApi.list({ page: userPage, limit: 10 }),
      ]);

      setTasks(taskResponse.data);
      setTaskPageMeta(taskResponse.meta);
      setUsers(userResponse.data);
      setUserPageMeta(userResponse.meta);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  useSocketRefresh(() => {
    void tasksApi.list({ page: taskPageMeta.page, limit: taskPageMeta.limit, sortBy: "createdAt", sortOrder: "desc" }).then((response) => {
      setTasks(response.data);
      setTaskPageMeta(response.meta);
    });
  });

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const totalUsers = users.length;
    const openTasks = tasks.filter((task) => task.status !== "DONE").length;
    const completedTasks = tasks.filter((task) => task.status === "DONE").length;

    return [
      { label: "Users", value: totalUsers },
      { label: "Tasks", value: totalTasks },
      { label: "Open tasks", value: openTasks },
      { label: "Completed", value: completedTasks },
    ];
  }, [tasks, users]);

  const saveTask = async (values: TaskSchemaValues) => {
    setSaving(true);

    try {
      if (selectedTask) {
        await tasksApi.update(selectedTask.id, values);
      } else {
        await tasksApi.create(values);
      }

      setSelectedTask(null);
      setTaskFormOpen(false);
      await loadAdminData();
    } finally {
      setSaving(false);
    }
  };

  const saveUser = async (values: UserSchemaValues) => {
    setSaving(true);

    try {
      if (selectedUser) {
        await usersApi.update(selectedUser.id, values);
        setSelectedUser(null);
      } else {
        await usersApi.create(values);
        setCreateUserOpen(false);
      }
      setUserFormOpen(false);
      await loadAdminData();
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async () => {
    if (!deleteTaskTarget) {
      return;
    }

    setSaving(true);

    try {
      await tasksApi.remove(deleteTaskTarget.id);
      setDeleteTaskTarget(null);
      await loadAdminData();
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!deleteUserTarget) {
      return;
    }

    setSaving(true);

    try {
      await usersApi.remove(deleteUserTarget.id);
      setDeleteUserTarget(null);
      await loadAdminData();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin console"
        description="Manage every task and user from one place."
        actionLabel="New task"
        onAction={() => {
          setSelectedTask(null);
          setTaskFormOpen(true);
        }}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">All tasks</h2>
                <p className="text-sm text-slate-500">Admins can edit or delete any task in the system.</p>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setSelectedTask(null);
                  setTaskFormOpen(true);
                }}
              >
                Create task
              </Button>
            </div>

            {tasks.length ? (
              <>
                <TaskTable tasks={tasks} onEdit={(task) => {
                  setSelectedTask(task);
                  setTaskFormOpen(true);
                }} onDelete={setDeleteTaskTarget} />
                {taskPageMeta.totalPages > 1 ? (
                  <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
                    <p>
                      Page {taskPageMeta.page} of {taskPageMeta.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        disabled={taskPageMeta.page <= 1}
                        type="button"
                        onClick={() => void loadAdminData(taskPageMeta.page - 1, userPageMeta.page)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={taskPageMeta.page >= taskPageMeta.totalPages}
                        type="button"
                        onClick={() => void loadAdminData(taskPageMeta.page + 1, userPageMeta.page)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <EmptyState title="No tasks yet" description="Create the first task for your team." />
            )}
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">All users</h2>
                <p className="text-sm text-slate-500">Edit roles or remove inactive users.</p>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setCreateUserOpen(true);
                  setUserFormOpen(true);
                }}
              >
                Create user
              </Button>
            </div>

            {users.length ? (
              <>
                <div className="overflow-hidden rounded-3xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left uppercase tracking-[0.15em] text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-4 font-medium text-slate-900">{item.email}</td>
                          <td className="px-4 py-4 text-slate-600">{item.role}</td>
                          <td className="px-4 py-4 text-slate-600">{item.createdAt ? formatDate(item.createdAt) : "-"}</td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="secondary"
                                type="button"
                                onClick={() => {
                                  setSelectedUser(item);
                                  setUserFormOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button variant="danger" type="button" onClick={() => setDeleteUserTarget(item)}>
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {userPageMeta.totalPages > 1 ? (
                  <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
                    <p>
                      Page {userPageMeta.page} of {userPageMeta.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        disabled={userPageMeta.page <= 1}
                        type="button"
                        onClick={() => void loadAdminData(taskPageMeta.page, userPageMeta.page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={userPageMeta.page >= userPageMeta.totalPages}
                        type="button"
                        onClick={() => void loadAdminData(taskPageMeta.page, userPageMeta.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <EmptyState title="No users found" description="There are no accounts to manage yet." />
            )}
          </section>
        </div>
      )}

      <Modal title={selectedTask ? "Edit task" : "Create task"} open={taskFormOpen} onClose={() => setTaskFormOpen(false)}>
        <TaskForm initialTask={selectedTask} users={users} isSaving={saving} onSubmit={saveTask} />
      </Modal>

      <Modal title={selectedUser ? "Edit user" : "Create user"} open={userFormOpen} onClose={() => {
        setUserFormOpen(false);
        setSelectedUser(null);
        setCreateUserOpen(false);
      }}>
        <UserForm initialUser={selectedUser} isSaving={saving} onSubmit={saveUser} />
      </Modal>

      <Modal
        title="Delete task"
        open={Boolean(deleteTaskTarget)}
        onClose={() => setDeleteTaskTarget(null)}
        footer={(
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTaskTarget(null)} type="button">Cancel</Button>
            <Button variant="danger" disabled={saving} onClick={deleteTask} type="button">Delete</Button>
          </div>
        )}
      >
        <p className="text-sm text-slate-600">This task will be removed for everyone.</p>
      </Modal>

      <Modal
        title="Delete user"
        open={Boolean(deleteUserTarget)}
        onClose={() => setDeleteUserTarget(null)}
        footer={(
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteUserTarget(null)} type="button">Cancel</Button>
            <Button variant="danger" disabled={saving} onClick={deleteUser} type="button">Delete</Button>
          </div>
        )}
      >
        <p className="text-sm text-slate-600">Deleting a user removes access immediately.</p>
      </Modal>
    </div>
  );
};