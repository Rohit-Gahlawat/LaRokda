"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Center } from "@repo/ui/center";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { p2pMoney, sendMerchant } from "@/app/actions"

export function SendCard() {
    const router = useRouter();
    const [number, setNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [mode, setMode] = useState<"friend" | "merchant">("friend");
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const tabBase = "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200";
    const tabActive = "bg-white text-[#FF0052] shadow-sm";
    const tabInactive = "text-stone-500 hover:text-stone-700";

    async function handleSend() {
        if (loading) return;
        if (!(Number(amount) > 0)) {
            setFeedback({ type: "error", message: "Please enter an amount greater than zero" });
            return;
        }
        setFeedback(null);
        setLoading(true);
        try {
            if (mode === "friend") {
                await p2pMoney(number, Number(amount));
            } else {
                await sendMerchant(Number(number), Number(amount));
            }
            setFeedback({ type: "success", message: "Payment successful" });
            setTimeout(() => router.refresh(), 1200);
        } catch (e) {
            setFeedback({ type: "error", message: e instanceof Error ? e.message : "something went wrong" });
        } finally {
            setLoading(false);
        }
    }

    return <div className="h-[90vh]">
        <Center>
            <Card title="Send Money">
                <div className="w-80 max-w-full pt-1">
                    {feedback && (
                        <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                            {feedback.message}
                        </div>
                    )}
                    <div className="mb-5 flex w-full rounded-xl border border-gray-200 bg-gray-100 p-1">
                        <button
                            type="button"
                            onClick={() => setMode("friend")}
                            className={`${tabBase} ${mode === "friend" ? tabActive : tabInactive}`}
                        >
                            Pay
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("merchant")}
                            className={`${tabBase} ${mode === "merchant" ? tabActive : tabInactive}`}
                        >
                            Pay to merchant
                        </button>
                    </div>

                    <TextInput placeholder={mode === "friend" ? "Enter Mobile Number" : "Enter Merchant ID"} label={"Pay To"} onChange={(value) => {
                        setNumber(value)
                    }} />
                    <TextInput placeholder={"Enter amount"} label="Amount" onChange={(value) => {
                        setAmount(value)
                    }} />
                    <div className="pt-6">
                        <Button onClick={handleSend}>
                            {loading ? <span className="inline-flex items-center gap-2"><Spinner />Processing…</span> : "Send"}
                        </Button>
                    </div>
                </div>
            </Card>
        </Center>
    </div>
}

function Spinner() {
    return (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
    );
}
