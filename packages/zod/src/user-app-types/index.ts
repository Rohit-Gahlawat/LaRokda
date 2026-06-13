import { z } from "zod";

export const userSigninSchema = z.object({
    phone: z.string(),
    password: z.string()
})
export type UserSigninType = z.infer<typeof userSigninSchema>