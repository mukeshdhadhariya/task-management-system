import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Textarea } from "../common/Textarea";
import { taskSchema, type TaskSchemaValues } from "../../validators/task";
import type { Task, User } from "../../types";

interface TaskFormProps {
  initialTask?: Task | null;
  users: User[];
  isSaving?: boolean;
  onSubmit: (values: TaskSchemaValues) => Promise<void>;
}

const toInputValue = (value?: string) => (value ? value.slice(0, 16) : "");

export const TaskForm = ({ initialTask, users, isSaving, onSubmit }: TaskFormProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskSchemaValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialTask?.title ?? "",
      description: initialTask?.description ?? "",
      status: initialTask?.status ?? "TODO",
      priority: initialTask?.priority ?? "MEDIUM",
      dueDate: toInputValue(initialTask?.dueDate),
      assignedToId: initialTask?.assignedToId ?? users[0]?.id ?? "",
    },
  });

  useEffect(() => {
    reset({
      title: initialTask?.title ?? "",
      description: initialTask?.description ?? "",
      status: initialTask?.status ?? "TODO",
      priority: initialTask?.priority ?? "MEDIUM",
      dueDate: toInputValue(initialTask?.dueDate),
      assignedToId: initialTask?.assignedToId ?? users[0]?.id ?? "",
    });
  }, [initialTask, reset, users]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Title" placeholder="Task title" error={errors.title?.message} {...register("title")} />
      <Textarea label="Description" placeholder="Task description" error={errors.description?.message} {...register("description")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Status" error={errors.status?.message} {...register("status")}>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
        </Select>
        <Select label="Priority" error={errors.priority?.message} {...register("priority")}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Due date" type="datetime-local" error={errors.dueDate?.message} {...register("dueDate")} />
        <Select label="Assign to" error={errors.assignedToId?.message} {...register("assignedToId")}>
          <option value="">Select user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email} ({user.role})
            </option>
          ))}
        </Select>
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : initialTask ? "Update task" : "Create task"}
      </Button>
    </form>
  );
};