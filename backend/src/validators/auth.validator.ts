import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string({
      error: "email is required",
    })
    .trim()
    .email("invaild email address"),

  password: z
    .string({
      error: "password is required",
    })
    .min(
      8,
      "at least 8 characters in password"
    )
    .max(
      32,
      "Password not more then 32 characters"
    ),
});

export const loginSchema = z.object({
  email: z
    .string({
      error: "Email is required",
    })
    .trim()
    .email("Invalid email address"),

  password: z
    .string({
      error: "Password is required",
    })
    .min(1, "Password is required"),
});