import { useCallback, useEffect, useState } from "react";

import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { Spinner } from "../components/common/Spinner";
import { PageHeader } from "../components/layout/PageHeader";
import { UserForm } from "../components/forms/UserForm";
import { usersApi } from "../api/users";
import { useDataCache } from "../context/DataCacheContext";
import { formatDate } from "../utils/format";
import type { User } from "../types";
import type { UserSchemaValues } from "../validators/user";

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageMeta, setPageMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const { getCache, setCache, invalidateCache } = useDataCache();

  const loadUsers = useCallback(async (page = 1) => {
    const cacheKey = `users:list:page=${page}&limit=10`;
    const cached = getCache<{ data: User[]; meta: typeof pageMeta }>(cacheKey);
    if (cached) {
      setUsers(cached.value.data);
      setPageMeta(cached.value.meta);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await usersApi.list({ page, limit: 10 });
      setUsers(response.data);
      setPageMeta(response.meta);
      setCache(cacheKey, response);
    } finally {
      setLoading(false);
    }
  }, [getCache, pageMeta, setCache]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const saveUser = async (values: UserSchemaValues) => {
    setSaving(true);

    try {
      if (selectedUser) {
        await usersApi.update(selectedUser.id, values);
        setSelectedUser(null);
      } else {
        await usersApi.create(values);
        setCreateOpen(false);
      }
      invalidateCache("users:list:");
      await loadUsers();
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!deleteTarget) {
      return;
    }

    setSaving(true);

    try {
      await usersApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      invalidateCache("users:list:");
      await loadUsers();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Admin only control panel for managing user roles and accounts."
        actionLabel="Create user"
        onAction={() => {
          setSelectedUser(null);
          setCreateOpen(true);
        }}
      />

      {loading ? <Spinner /> : users.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="divide-y divide-slate-100 md:hidden">
            {users.map((item) => (
              <div key={item.id} className="space-y-4 p-4">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-slate-900 break-words">{item.email}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </div>

                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-500">Created: </span>
                  {item.createdAt ? formatDate(item.createdAt) : "-"}
                </p>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button className="w-full sm:w-auto" variant="secondary" type="button" onClick={() => setSelectedUser(item)}>
                    Edit
                  </Button>
                  <Button className="w-full sm:w-auto" variant="danger" type="button" onClick={() => setDeleteTarget(item)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <table className="hidden min-w-full divide-y divide-slate-200 text-sm md:table">
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
                      <Button variant="secondary" type="button" onClick={() => setSelectedUser(item)}>Edit</Button>
                      <Button variant="danger" type="button" onClick={() => setDeleteTarget(item)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No users found" description="There are no accounts to manage yet." />
      )}

      {pageMeta.totalPages > 1 ? (
        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-soft">
          <p>
            Page {pageMeta.page} of {pageMeta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pageMeta.page <= 1}
              type="button"
              onClick={() => void loadUsers(pageMeta.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={pageMeta.page >= pageMeta.totalPages}
              type="button"
              onClick={() => void loadUsers(pageMeta.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Modal title={selectedUser ? "Edit user" : "Create user"} open={Boolean(selectedUser) || createOpen} onClose={() => {
        setSelectedUser(null);
        setCreateOpen(false);
      }}>
        <UserForm initialUser={selectedUser} isSaving={saving} onSubmit={saveUser} />
      </Modal>

      <Modal
        title="Delete user"
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        footer={(
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} type="button">Cancel</Button>
            <Button variant="danger" disabled={saving} onClick={deleteUser} type="button">Delete</Button>
          </div>
        )}
      >
        <p className="text-sm text-slate-600">Deleting a user is permanent and will remove access immediately.</p>
      </Modal>
    </div>
  );
};