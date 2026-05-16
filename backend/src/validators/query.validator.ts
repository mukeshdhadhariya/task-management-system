import { z } from "zod";

export const taskQuerySchema = z.object({

    page: z
        .string()
        .optional(),

    limit: z
        .string()
        .optional(),

    status: z
        .enum([
        "TODO",
        "IN_PROGRESS",
        "DONE",
        ])
        .optional(),

    priority: z
        .enum([
        "LOW",
        "MEDIUM",
        "HIGH",
        ])
        .optional(),

    sortBy: z
        .enum([
        "createdAt",
        "dueDate",
        "priority",
        ])
        .optional(),

    sortOrder: z
        .enum([
        "asc",
        "desc",
        ])
        .optional(),
        
});