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