import { z } from "zod";

export const userSigninSchema = z.object({
    phone: z.string().max(10).min(10),
    password: z.string().min(8).max(50)
})
export type UserSigninType = z.infer<typeof userSigninSchema>



export const userWebhookSchema = z.object({
    token: z.string(),
    userId: z.string(),
    amount: z.string(),
    status: z.enum(["Success", "Failed"])
});
export const merchantWebhookSchema = z.object({
    token: z.string(),
    userId: z.string(),
    amount: z.string(),
    status: z.enum(["Success", "Failed"])
});