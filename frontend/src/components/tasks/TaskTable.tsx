import { Link } from "react-router-dom";

import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { formatDate } from "../../utils/format";
import type { Task } from "../../types";

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskTable = ({ tasks, onEdit, onDelete }: TaskTableProps) => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
    <div className="divide-y divide-slate-100 md:hidden">
      {tasks.map((task) => (
        <div key={task.id} className="space-y-4 p-4">
          <div className="space-y-2">
            <Link to={`/tasks/${task.id}`} className="block text-base font-semibold text-slate-900 hover:underline">
              {task.title}
            </Link>
            <p className="text-sm text-slate-500 line-clamp-3">{task.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Status</p>
              <div className="mt-1"><Badge tone={task.status}>{task.status.replace("_", " ")}</Badge></div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Priority</p>
              <div className="mt-1"><Badge tone={task.priority}>{task.priority}</Badge></div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Due</p>
              <p className="mt-1 text-slate-700">{formatDate(task.dueDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Assigned</p>
              <p className="mt-1 break-words text-slate-700">{task.assignedTo?.email ?? task.assignedToId}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto" variant="secondary" onClick={() => onEdit(task)} type="button">
              Edit
            </Button>
            <Button className="w-full sm:w-auto" variant="danger" onClick={() => onDelete(task)} type="button">
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>

    <table className="hidden min-w-full divide-y divide-slate-200 md:table">
      <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.15em] text-slate-500">
        <tr>
          <th className="px-4 py-3">Task</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Priority</th>
          <th className="px-4 py-3">Due</th>
          <th className="px-4 py-3">Assigned to</th>
          <th className="px-4 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {tasks.map((task) => (
          <tr key={task.id} className="align-top">
            <td className="px-4 py-4">
              <div className="space-y-1">
                <Link to={`/tasks/${task.id}`} className="font-semibold text-slate-900 hover:underline">
                  {task.title}
                </Link>
                <p className="text-slate-500">{task.description}</p>
              </div>
            </td>
            <td className="px-4 py-4"><Badge tone={task.status}>{task.status.replace("_", " ")}</Badge></td>
            <td className="px-4 py-4"><Badge tone={task.priority}>{task.priority}</Badge></td>
            <td className="px-4 py-4 text-slate-600">{formatDate(task.dueDate)}</td>
            <td className="px-4 py-4 text-slate-600">{task.assignedTo?.email ?? task.assignedToId}</td>
            <td className="px-4 py-4 text-right">
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => onEdit(task)} type="button">Edit</Button>
                <Button variant="danger" onClick={() => onDelete(task)} type="button">Delete</Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);