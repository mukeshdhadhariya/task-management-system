import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["ADMIN", "USER"]),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export type UserFormValues = z.input<typeof userSchema>;
export type UserSchemaValues = z.output<typeof userSchema>;