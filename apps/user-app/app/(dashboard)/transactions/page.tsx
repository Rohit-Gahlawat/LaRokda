import db from "@repo/db";
import { auth } from "@/auth";
import { OnRampTransactions } from "../../../components/OnRampTransaction";
import { P2PTransactions } from "../../../components/P2PTransactions";
import { TransactionsToggle } from "../../../components/TransactionsToggle";

async function getOnRampTransactions() {
    const session = await auth();
    const txns = await db.onRampTransaction.findMany({
        where: {
            userId: session?.user?.id
        },
        orderBy: {
            startTime: "desc"
        }
    });
    return txns.map(t => ({
        time: t.startTime,
        amount: t.amount,
        status: t.status,
        provider: t.provider
    }))
}

async function getP2PTransactions() {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return [];
    const txns = await db.p2P.findMany({
        where: {
            OR: [
                { fromUserId: userId },
                { toUserId: userId }
            ]
        },
        include: {
            fromUser: true,
            toUser: true
        },
        orderBy: {
            timestamp: "desc"
        }
    });
    return txns.map(t => {
        const sent = t.fromUserId === userId;
        const other = sent ? t.toUser : t.fromUser;
        return {
            time: t.timestamp,
            amount: t.amount,
            type: sent ? ("sent" as const) : ("received" as const),
            name: other?.name ?? null,
            number: other?.number ?? ""
        }
    })
}

export default async function TransactionsPage() {
    const bankTransactions = await getOnRampTransactions();
    const p2pTransactions = await getP2PTransactions();

    return <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-stone-800 sm:text-3xl">
                Transactions
            </h1>
            <p className="mt-1 text-sm text-stone-500">
                Your recent bank top-ups and peer-to-peer transfers.
            </p>
        </header>
        <TransactionsToggle
            bank={<OnRampTransactions transactions={bankTransactions} />}
            p2p={<P2PTransactions transactions={p2pTransactions} />}
        />
    </div>
}
