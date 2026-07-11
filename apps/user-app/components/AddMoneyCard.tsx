
"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput } from "@repo/ui/textinput";
import { addMoney, handleWithdrawals } from "@/app/actions";




const SUPPORTED_BANKS = [{
    name: "HDFC Bank",
    redirectUrl: "https://netbanking.hdfcbank.com"
}, {

    name: "Axis Bank",
    redirectUrl: "https://www.axisbank.com"
}];



export const AddMoney = () => {
    const router = useRouter();
    const [provider, setProvider] = useState("");
    const [amount, setAmount] = useState(0);
    const [mode, setMode] = useState<"add" | "withdraw">("add");
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const tabBase = "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200";
    const tabActive = "bg-white text-[#FF0052] shadow-sm";
    const tabInactive = "text-stone-500 hover:text-stone-700";

    async function handleClick() {
        if (loading) return;
        if (!(amount > 0)) {
            setFeedback({ type: "error", message: "Please enter an amount greater than zero" });
            return;
        }
        setFeedback(null);
        setLoading(true);
        try {
            if (mode === "add") {
                await addMoney(amount, provider);
                setFeedback({ type: "success", message: "Payment request created. Your wallet will be updated shortly after bank confirmation." });
            } else {
                await handleWithdrawals(amount, provider);
                setFeedback({ type: "success", message: "Withdrawal requested — it will be settled to your bank shortly." });
            }
            setTimeout(() => router.refresh(), 1500);
        } catch (e) {
            setFeedback({ type: "error", message: e instanceof Error ? e.message : "something went wrong" });
        } finally {
            setLoading(false);
        }
    }

    return <Card title={mode === "add" ? "Add Money" : "Withdraw"}>
        <div className="w-full">
            <div className="mb-4 flex w-full rounded-xl border border-gray-200 bg-gray-100 p-1">
                <button
                    type="button"
                    onClick={() => setMode("add")}
                    className={`${tabBase} ${mode === "add" ? tabActive : tabInactive}`}
                >
                    Add money to wallet
                </button>
                <button
                    type="button"
                    onClick={() => setMode("withdraw")}
                    className={`${tabBase} ${mode === "withdraw" ? tabActive : tabInactive}`}
                >
                    Withdraw to bank
                </button>
            </div>

            {loading ? (
                <div className="mb-4 inline-flex w-full items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    <Spinner />Processing your request…
                </div>
            ) : feedback && (
                <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                    {feedback.message}
                </div>
            )}

            <TextInput label={"Amount"} placeholder={"Amount"} onChange={(t) => {
                setAmount(Number(t));

            }} />
            <div className="pb-1.5 pt-4 text-sm font-medium text-stone-700">
                Bank
            </div>
            <Select onSelect={(value) => {
                setProvider(value)
            }} options={SUPPORTED_BANKS.map(x => ({
                key: x.name,
                value: x.name
            }))} />
            <div className="pt-6">
                <Button onClick={handleClick}>
                    {loading ? <span className="inline-flex items-center gap-2"><Spinner />Processing…</span> : (mode === "add" ? "Add Money" : "Withdraw")}
                </Button>
            </div>
        </div>
    </Card>
}

function Spinner() {
    return (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
    );
}
