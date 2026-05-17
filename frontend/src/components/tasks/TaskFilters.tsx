import { Select } from "../common/Select";
import type { TaskPriority, TaskStatus } from "../../types";

interface TaskFiltersProps {
  status: TaskStatus | "";
  priority: TaskPriority | "";
  sortBy: "createdAt" | "dueDate" | "priority";
  sortOrder: "asc" | "desc";
  onChange: (field: string, value: string) => void;
}

export const TaskFilters = ({ status, priority, sortBy, sortOrder, onChange }: TaskFiltersProps) => (
  <div className="grid gap-3 lg:grid-cols-4">
    <Select label="Status" value={status} onChange={(event) => onChange("status", event.target.value)}>
      <option value="">All statuses</option>
      <option value="TODO">Todo</option>
      <option value="IN_PROGRESS">In progress</option>
      <option value="DONE">Done</option>
    </Select>
    <Select label="Priority" value={priority} onChange={(event) => onChange("priority", event.target.value)}>
      <option value="">All priorities</option>
      <option value="LOW">Low</option>
      <option value="MEDIUM">Medium</option>
      <option value="HIGH">High</option>
    </Select>
    <Select label="Sort by" value={sortBy} onChange={(event) => onChange("sortBy", event.target.value)}>
      <option value="createdAt">Created date</option>
      <option value="dueDate">Due date</option>
      <option value="priority">Priority</option>
    </Select>
    <Select label="Order" value={sortOrder} onChange={(event) => onChange("sortOrder", event.target.value)}>
      <option value="desc">Newest first</option>
      <option value="asc">Oldest first</option>
    </Select>
  </div>
);