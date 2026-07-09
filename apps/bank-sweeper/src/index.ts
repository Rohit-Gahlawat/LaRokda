import "dotenv/config";
import db from "@repo/db";

const BANK_SERVER_URL = process.env.BANK_SERVER_URL || "http://localhost:3004";
const dispatched = new Set<string>();

async function sweepUser() {

    const pending = await db.userWithdrawal.findMany({
        where: {
            status: "Processing",
        },
    });

    for (const txn of pending) {
        if (dispatched.has(txn.token)) {
            continue;
        }
        dispatched.add(txn.token);
        try {
            await fetch(`${BANK_SERVER_URL}/payout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: txn.token,
                    user_identifier: String(txn.userId),
                    amount: String(txn.amount),
                    kind: "user",
                }),
            });
        } catch (e) {
            console.log(e);
            dispatched.delete(txn.token);
        }
    }

}
async function sweepMerchant() {

    const pending = await db.merchantWithdrawal.findMany({
        where: {
            status: "Processing",
        },
    });

    for (const txn of pending) {
        if (dispatched.has(txn.token)) {
            continue;
        }
        dispatched.add(txn.token);
        try {
            await fetch(`${BANK_SERVER_URL}/payout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: txn.token,
                    user_identifier: String(txn.userId),
                    amount: String(txn.amount),
                    kind: "merchant",
                }),
            });
        } catch (e) {
            console.log(e);
            dispatched.delete(txn.token);
        }
    }

}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}



async function main() {
    while (true) {
        await sweepUser();
        await sweepMerchant();
        await sleep(5000);
    }
}

main();
