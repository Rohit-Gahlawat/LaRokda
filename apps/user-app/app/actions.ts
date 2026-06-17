"use server"
import { signIn, signOut } from "@/auth";
import { randomUUID } from "crypto";
import db from "@repo/db";
import { auth } from "@/auth";
import { error } from "console";


export async function handleSignIn() {
    "use server";
    await signIn();
};

export async function handleSignOut() {
    "use server";
    await signOut();
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

    })

}