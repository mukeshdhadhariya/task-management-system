import { useCallback, useEffect, useState } from "react";

import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { Spinner } from "../components/common/Spinner";
import { PageHeader } from "../components/layout/PageHeader";
import { UserForm } from "../components/forms/UserForm";
import { usersApi } from "../api/users";
import { formatDate } from "../utils/format";
import type { User } from "../types";
import type { UserSchemaValues } from "../validators/user";

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await usersApi.list();
      setUsers(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const saveUser = async (values: UserSchemaValues) => {
    if (!selectedUser) {
      return;
    }

    setSaving(true);

    try {
      await usersApi.update(selectedUser.id, values);
      setSelectedUser(null);
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
      await loadUsers();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Admin only control panel for managing user roles and accounts." />

      {loading ? <Spinner /> : users.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
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

      <Modal title="Edit user" open={Boolean(selectedUser)} onClose={() => setSelectedUser(null)}>
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