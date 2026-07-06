import "dotenv/config";
import db from "@repo/db";
async function sweepUser() {

    const pending = await db.userWithdrawal.findMany({
        where: {
            status: "Processing",
        },
    });

    // for (const txn of pending) {
    //     await fetch("bank-api", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //             token: txn.token,
    //             amount: txn.amount,
    //         }),
    //     });
    // }

}
async function sweepMerchant() {

    const pending = await db.merchantWithdrawal.findMany({
        where: {
            status: "Processing",
        },
    });

    // for (const txn of pending) {
    //     await fetch("bank-api", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //             token: txn.token,
    //             amount: txn.amount,
    //         }),
    //     });
    // }

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