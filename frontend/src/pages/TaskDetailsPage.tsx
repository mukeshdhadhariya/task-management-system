import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { API_ORIGIN } from "../api/http";
import { tasksApi } from "../api/tasks";
import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { Spinner } from "../components/common/Spinner";
import { Badge } from "../components/common/Badge";
import { formatDate, formatDateTime } from "../utils/format";
import { useSocketRefresh } from "../hooks/useSocketRefresh";
import type { Attachment, Task } from "../types";

export const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const loadTask = useCallback(async () => {
    if (!taskId) {
      return;
    }

    setLoading(true);

    try {
      const result = await tasksApi.getById(taskId);
      setTask(result);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void loadTask();
  }, [loadTask]);

  useSocketRefresh(loadTask);

  const attachments = useMemo(() => task?.attachments ?? [], [task]);

  const uploadDocuments = async () => {
    if (!taskId || files.length === 0) {
      return;
    }

    setSaving(true);

    try {
      await tasksApi.uploadDocuments(taskId, files);
      setFiles([]);
      setUploadOpen(false);
      await loadTask();
    } finally {
      setSaving(false);
    }
  };

  const renderAttachment = (attachment: Attachment) => (
    <a
      key={attachment.id}
      href={`${API_ORIGIN}${attachment.downloadUrl}`}
      download={attachment.originalName}
      className="block rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-slate-900">{attachment.originalName}</p>
          <p className="text-xs text-slate-500">
            {attachment.mimeType} · {(attachment.size / 1024 / 1024).toFixed(2)} MB · {formatDateTime(attachment.createdAt)}
          </p>
        </div>
        <span className="text-sm font-medium text-slate-600">Download</span>
      </div>
    </a>
  );

  if (loading) {
    return <Spinner />;
  }

  if (!task) {
    return <EmptyState title="Task not found" description="The task may have been removed or you do not have access." actionLabel="Back to tasks" onAction={() => navigate("/tasks")} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone={task.status}>{task.status.replace("_", " ")}</Badge>
              <Badge tone={task.priority}>{task.priority}</Badge>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">{task.title}</h2>
            <p className="mt-3 max-w-3xl text-slate-600">{task.description}</p>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate("/tasks")} type="button">Back</Button>
            <Button onClick={() => setUploadOpen(true)} type="button">Upload PDFs</Button>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Assigned to</dt>
            <dd className="mt-2 font-medium text-slate-900">{task.assignedTo?.email ?? task.assignedToId}</dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Due date</dt>
            <dd className="mt-2 font-medium text-slate-900">{formatDate(task.dueDate)}</dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Task ID</dt>
            <dd className="mt-2 font-medium text-slate-900 break-all">{task.id}</dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Documents</dt>
            <dd className="mt-2 font-medium text-slate-900">{attachments.length}/3 attached</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Uploaded documents</h3>
        </div>
        <div className="mt-4 space-y-3">
          {attachments.length ? attachments.map(renderAttachment) : <EmptyState title="No documents yet" description="Upload up to 3 PDFs for this task." />}
        </div>
      </div>

      <Modal title="Upload PDFs" open={uploadOpen} onClose={() => setUploadOpen(false)} footer={(
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setUploadOpen(false)} type="button">Cancel</Button>
          <Button disabled={saving || files.length === 0} onClick={uploadDocuments} type="button">{saving ? "Uploading..." : "Upload"}</Button>
        </div>
      )}>
        <label className="block space-y-2 text-sm">
          <span className="font-medium text-slate-700">PDF files</span>
          <input
            className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            type="file"
            accept="application/pdf"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 3))}
          />
        </label>
        <p className="mt-3 text-xs text-slate-500">Select up to 3 PDF files. Existing uploads count toward the backend limit.</p>
      </Modal>
    </div>
  );
};