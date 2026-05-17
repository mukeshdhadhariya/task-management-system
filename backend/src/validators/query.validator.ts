import { z } from "zod";

export const taskQuerySchema = z.object({

    page: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().optional()
    ),

    limit: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().optional()
    ),

    status: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.enum([
        "TODO",
        "IN_PROGRESS",
        "DONE",
        ]).optional()
    ),

    priority: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.enum([
        "LOW",
        "MEDIUM",
        "HIGH",
        ]).optional()
    ),

    sortBy: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.enum([
        "createdAt",
        "dueDate",
        "priority",
        ]).optional()
    ),

    sortOrder: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.enum([
        "asc",
        "desc",
        ]).optional()
    ),
        
});