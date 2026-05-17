import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignedToId: z.string().min(1, "Assign this task to a user"),
});

export type TaskSchemaValues = z.infer<typeof taskSchema>;