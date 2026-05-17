import {z} from "zod"

export const userschemavalid=z.object({
    email:z
    .string()
    .email("invaild email")
    .optional(),

    role:z
    .enum(["ADMIN","USER"])
    .optional()
})

export const createUserSchema = z.object({
    email: z.string().email("invalid email"),
    password: z.string().min(8, "password must be at least 8 characters"),
    role: z.enum(["ADMIN", "USER"]).optional(),
});