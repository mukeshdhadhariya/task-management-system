import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["ADMIN", "USER"]),
});

export type UserSchemaValues = z.infer<typeof userSchema>;