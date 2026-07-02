import "dotenv/config";
import express from "express";
import db from "@repo/db";
import { userWebhookSchema, merchantWebhookSchema } from "@repo/zod"

const app = express();
app.use(express.json());



app.post("/hdfcwebhook", async (req, res) => {



    const paymentInfo = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    }


    try {
        await db.$transaction(async (txn) => {
            const claim = await txn.onRampTransaction.updateMany({
                where: {
                    token: paymentInfo.token,
                    status: "Processing"
                },
                data: {
                    status: "Success",
                }
            });
            if (claim.count === 0) {
                throw new Error("transaction already completed")
            }

            await txn.$transaction([
                txn.balance.update({
                    where: {
                        userId: (paymentInfo.userId)
                    },
                    data: {
                        amount: {

                            increment: Number(paymentInfo.amount)
                        }
                    }
                })
            ]);

        })
        res.json({
            message: "Captured"
        })

    } catch (e) {
        console.log(e);
        res.status(400).json({
            message: "Error while processing webhook"
        })
    }

})



app.post("/user/withdrawal", async (req, res) => {
    const paymentInfo = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount,
        status: req.body.status
    }

    const parsed = userWebhookSchema.safeParse(paymentInfo);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid payload"
        })
    }
    try {
        await db.$transaction(async (txn) => {
            const claim = await txn.userWithdrawal.updateMany({
                where: {
                    token: parsed.data.token,
                    status: "Processing"
                },
                data: {
                    status: parsed.data.status
                }
            })
            if (claim.count === 0) {
                throw new Error("Transaction already completed");
            }


            if (parsed.data.status === "Failed") {
                await txn.balance.updateMany({
                    where: {
                        userId: parsed.data.userId
                    },
                    data: {
                        locked: {
                            decrement: Number(parsed.data.amount)
                        },
                        amount: {
                            increment: Number(parsed.data.amount)
                        }
                    }
                })
            } else {
                await txn.balance.updateMany({
                    where: {
                        userId: parsed.data.userId
                    },
                    data: {
                        locked: {
                            decrement: Number(parsed.data.amount)
                        }
                    }
                });
            }

        })
        return res.json({
            message: "captured"
        })
    } catch (e) {
        return res.status(400).json({
            message: (e instanceof Error ? e.message : "Something went wrong")
        })
    }


})


app.post("/merchant/withdrawal", async (req, res) => {
    const paymentInfo = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount,
        status: req.body.status
    }

    const parsed = merchantWebhookSchema.safeParse(paymentInfo);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid payload"
        })
    }
    try {
        await db.$transaction(async (txn) => {
            const claim = await txn.merchantWithdrawal.updateMany({
                where: {
                    token: parsed.data.token,
                    status: "Processing"
                },
                data: {
                    status: parsed.data.status
                }
            })
            if (claim.count === 0) {
                throw new Error("Transaction already completed");
            }


            if (parsed.data.status === "Failed") {
                await txn.merchantBalance.updateMany({
                    where: {
                        merchantId: Number(parsed.data.userId)
                    },
                    data: {
                        locked: {
                            decrement: Number(parsed.data.amount)
                        },
                        amount: {
                            increment: Number(parsed.data.amount)
                        }
                    }
                })
            } else {
                await txn.merchantBalance.updateMany({
                    where: {
                        merchantId: Number(parsed.data.userId)
                    },
                    data: {
                        locked: {
                            decrement: Number(parsed.data.amount)
                        }
                    }
                });
            }

        })
        return res.json({
            message: "captured"
        })
    } catch (e) {
        return res.status(400).json({
            message: (e instanceof Error ? e.message : "Something went wrong")
        })
    }


})

app.listen(3003, () => console.log("bank-webhook server is ruinning on port 3003"));
