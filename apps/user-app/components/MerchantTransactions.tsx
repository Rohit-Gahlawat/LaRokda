import { Card } from "@repo/ui/card"

export const MerchantTransactions = ({
    transactions
}: {
    transactions: {
        time: Date,
        amount: number,
        name: string | null,
        merchantId: number
    }[]
}) => {

    if (!transactions.length) {
        return <Card title="Recent Transactions">
            <div className="py-10 text-center text-sm text-stone-400">
                No Recent transactions
            </div>
        </Card>
    }
    return <Card title="Recent Transactions">
        <div className="flex flex-col divide-y divide-gray-200">
            {transactions.map((t, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF0052]/10 text-xs font-semibold text-[#FF0052]">
                            {(t.name || "M").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-stone-700">
                                Paid to {t.name || `Merchant #${t.merchantId}`}
                            </div>
                            <div className="text-xs text-stone-400">
                                {t.time.toDateString()}
                            </div>
                        </div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold tabular-nums text-[#FF0052]">
                        − Rs {t.amount / 100}
                    </div>
                </div>
            ))}
        </div>
    </Card>
}
