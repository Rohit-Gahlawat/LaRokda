"use server"
import { signIn, signOut } from "@/auth";
import { randomUUID } from "crypto";
import db from "@repo/db";
import { auth } from "@/auth";
import { UserSigninType } from "@repo/zod";
import { userSigninSchema } from "@repo/zod";
import bcrypt from "bcrypt"
import { AuthError } from "next-auth";


export async function handleSignOut() {
    "use server";
    await signOut();
};

export async function handleSignIn(
    number: string, password: string
) {
    "use server";
    try {
        await signIn("credentials", {
            phone: number,
            password: password,
            redirect: false
        })

    } catch (e) {
        if (e instanceof AuthError) {
            return { success: false, message: "Invalid number or password" }
        }
    }
    return { success: true };

};

export async function addMoney(amount: number, provider: string) {
    const randomID = randomUUID();
    const token = `ID_${Date.now()}_${randomID}`;
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("you are not logged in")
    } else {
        await db.onRampTransaction.create({
            data: {
                status: "Processing",
                startTime: new Date(),
                token: token,
                amount: amount,
                provider: provider,
                userId: session?.user?.id

            }
        })
        return token;
    }
}

export async function p2pMoney(number: string, amount: number) {

    const session = await auth();
    const fromUser = session?.user?.id
    if (!fromUser) {
        throw new Error("you are not logged in")
    }

    const toUser = await db.user.findFirst({
        where: {
            number
        }
    })
    if (!toUser) {
        throw new Error("user not found")
    }
    await db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${fromUser} FOR UPDATE`;
        const fromBalance = await tx.balance.findFirst({
            where: {
                userId: fromUser
            }
        })
        if (!fromBalance || fromBalance?.amount < amount) {
            throw new Error("Insufficient Balance")
        }

        await tx.balance.update({
            where: {
                userId: fromUser
            },
            data: {
                amount: {
                    decrement: amount
                }
            }
        })

        await tx.balance.update({
            where: {
                userId: toUser.id
            },
            data: {
                amount: {
                    increment: amount
                }
            }
        })

        await tx.p2P.create({
            data: {
                amount,
                timestamp: new Date(),
                fromUserId: fromUser,
                toUserId: toUser.id
            }
        })

    })

}




export async function SignUp({ phone, password }: UserSigninType) {
    const parsed = userSigninSchema.safeParse({ phone, password });
    if (!parsed.success) {
        return {
            success: false,
            message: "Invalid phone number or password"
        }
    }
    const existing = await db.user.findUnique({ where: { number: phone } });
    if (existing) {
        return { success: false, message: "Account already exists" };
    };
    const hashedpassword = await bcrypt.hash(parsed.data.password, 10);
    try {

        const newUser = await db.user.create({
            data: {
                number: parsed.data.phone,
                password: hashedpassword
            }
        })
        return {
            id: newUser.id,
            number: newUser.number
        }
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: "Account already exists"
        }
    };


}