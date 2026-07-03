"use client"
import { useState } from "react";
import type { ReactNode } from "react";

export function TransactionsToggle({
    bank,
    p2p,
    merchant
}: {
    bank: ReactNode;
    p2p: ReactNode;
    merchant: ReactNode;
}) {
    const [tab, setTab] = useState<"bank" | "p2p" | "merchant">("bank");
    const base = "rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200";
    const active = "bg-white text-[#FF0052] shadow-sm";
    const inactive = "text-stone-500 hover:text-stone-700";

    return <div>
        <div className="mb-5 inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1">
            <button
                type="button"
                onClick={() => setTab("bank")}
                className={`${base} ${tab === "bank" ? active : inactive}`}
            >
                Bank
            </button>
            <button
                type="button"
                onClick={() => setTab("p2p")}
                className={`${base} ${tab === "p2p" ? active : inactive}`}
            >
                Personal
            </button>
            <button
                type="button"
                onClick={() => setTab("merchant")}
                className={`${base} ${tab === "merchant" ? active : inactive}`}
            >
                Merchant
            </button>
        </div>
        <div>{tab === "bank" ? bank : tab === "p2p" ? p2p : merchant}</div>
    </div>
}
