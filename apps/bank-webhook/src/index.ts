import "dotenv/config";
import express from "express";
import db from "@repo/db"
const app = express();
app.use(express.json());


app.post("/hdfcwebhook", async (req, res) => {
    // zod
    //bank should send a secret so we know it is them 



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

            res.json({
                message: "Captured"
            })

        })

    } catch (e) {
        console.log(e);
        res.status(400).json({
            message: "Error while processing webhook"
        })
    }

})




app.listen(3003, () => console.log("bank-webhook server is ruinning on port 3003"));
