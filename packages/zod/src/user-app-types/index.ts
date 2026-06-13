import { z } from "zod";

export const userSigninSchema = z.object({
    phone: z.string().max(10),
    password: z.string().min(8)
})
export type UserSigninType = z.infer<typeof userSigninSchema>