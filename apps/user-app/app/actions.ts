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

export async function handleAppBarSignIn() {
    "use server";
    await signIn();
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
        throw e
    }
    return { success: true };

};

export async function addMoney(amount: number, provider: string) {
    if (!(amount > 0)) {
        throw new Error("Please enter an amount greater than zero")
    }
    const amountInPaise = Math.round(amount * 100);
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
                amount: amountInPaise,
                provider: provider,
                userId: session?.user?.id

            }
        })

        try {
            await fetch(`${process.env.BANK_SERVER_URL || "http://localhost:3004"}/onramp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: token,
                    user_identifier: session.user.id,
                    amount: amountInPaise
                })
            })
        } catch (e) {
            console.log(e);
        }

        return token;
    }
}

export async function p2pMoney(number: string, amount: number) {
    if (!(amount > 0)) {
        throw new Error("Please enter an amount greater than zero")
    }
    const amountInPaise = Math.round(amount * 100);

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
        if (!fromBalance || fromBalance?.amount < amountInPaise) {
            throw new Error("Insufficient Balance")
        }

        await tx.balance.update({
            where: {
                userId: fromUser
            },
            data: {
                amount: {
                    decrement: amountInPaise
                }
            }
        })

        await tx.balance.update({
            where: {
                userId: toUser.id
            },
            data: {
                amount: {
                    increment: amountInPaise
                }
            }
        });

        await tx.p2P.create({
            data: {
                amount: amountInPaise,
                timestamp: new Date(),
                fromUserId: fromUser,
                toUserId: toUser.id
            }
        });



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

        await db.user.create({
            data: {
                number: parsed.data.phone,
                password: hashedpassword,
                Balance: {
                    create: {
                        amount: 0,
                        locked: 0
                    }
                }
            }
        })

    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: "Account already exists"
        }
    };

    try {
        await signIn("credentials", {
            phone: parsed.data?.phone,
            password: parsed.data?.password,
            redirect: false
        })
    } catch (e) {
        if (e instanceof AuthError) {
            return {
                success: false, message: "Account created but auto-login failed. Please sign in."
            }
        }
        throw e
    }
    return {
        success: true
    }

}


export async function sendMerchant(id: number, amount: number) {
    if (!(amount > 0)) {
        throw new Error("Please enter an amount greater than zero")
    }
    const amountInPaise = Math.round(amount * 100);

    const session = await auth();
    const fromUser = session?.user?.id;

    if (!fromUser) {
        throw new Error("you are not logged in")
    }

    const toUser = await db.merchant.findFirst({
        where: {
            id: id
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
        });
        if (!fromBalance || fromBalance?.amount < amountInPaise) {
            throw new Error("Insufficient Balance")
        };

        await tx.balance.update({
            where: {
                userId: fromUser
            },
            data: {
                amount: {
                    decrement: amountInPaise
                }
            }
        });

        await tx.merchantBalance.update({
            where: {
                merchantId: id
            },
            data: {
                amount: {
                    increment: amountInPaise
                }
            }
        });
        await tx.merchantTransaction.create({
            data: {
                amount: amountInPaise,
                timestamp: new Date(),
                fromUserId: fromUser,
                toUserId: toUser.id
            }
        })

    })


}


export async function handleWithdrawals(amount: number, provider: string) {
    if (!(amount > 0)) {
        throw new Error("Please enter an amount greater than zero")
    }
    const amountInPaise = Math.round(amount * 100);
    const session = await auth();
    const userId = session?.user?.id
    if (!userId) {
        throw new Error("you are not logged in")
    };
    const randomID = randomUUID();
    const token = `ID_${Date.now()}_${randomID}`;


    try {
        const result = await db.balance.updateMany({
            where: {
                userId: userId,
                amount: {
                    gte: amountInPaise
                }
            },
            data: {
                amount: {
                    decrement: amountInPaise
                },
                locked: {
                    increment: amountInPaise
                }

            }

        })
        if (result.count === 0) {
            throw new Error("Insufficient Balance")
        }

    } catch (e) {
        throw new Error(e instanceof Error ? e.message : "something went wrong")
    }

    await db.userWithdrawal.create({
        data: {
            status: "Processing",
            startTime: new Date(),
            token: token,
            userId: userId,
            provider: provider,
            amount: amountInPaise
        }
    });
    return token
}