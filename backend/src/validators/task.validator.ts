import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string() 
    .min(3, "at least 3 character"),

  description: z
    .string()
    .min(5, "at least 5 character"),

  status: z.enum([
    "TODO",
    "IN_PROGRESS", 
    "DONE", 
  ]),

  priority: z.enum([
    "LOW",
    "MEDIUM",
    "HIGH",
  ]),

  dueDate: z.string(),

  assignedToId: z.string(),
});

export const updateTaskSchema = createTaskSchema.partial();