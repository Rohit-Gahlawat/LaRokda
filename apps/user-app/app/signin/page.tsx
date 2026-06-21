"use client"
import Link from "next/link";
import { useState } from "react";
import { handleSignIn } from "../actions";
import { useRouter } from "next/navigation";


export default function SignInPage() {
    const router = useRouter();
    const [number, setNumber] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    async function handleSignInErr() {
        const res = await handleSignIn(number, password);
        if (!res.success) {
            setErr(res.message ?? "Login failed please try again")
            return;
        }
        router.push("/dashboard");
        router.refresh();
    }


    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#EFE9E3] px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9B59C] text-lg font-bold text-stone-900 shadow-sm">
                        P
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-stone-800">
                        Welcome back
                    </h1>
                    <p className="mt-1 text-sm text-stone-500">
                        Sign in to your mymoney wallet
                    </p>
                </div>

                <div className="rounded-2xl border border-[#D9CFC7] bg-[#F9F8F6] p-6 shadow-sm sm:p-8">
                    {err && (
                        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                            {err}
                        </p>
                    )}
                    <form className="flex flex-col gap-4">
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-stone-700">
                                Mobile Number
                            </span>
                            <input
                                name="phone"
                                type="tel"
                                placeholder="Enter your mobile number"
                                className="w-full rounded-xl border border-[#D9CFC7] bg-[#F9F8F6] px-4 py-2.5 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-[#C9B59C] focus:ring-2 focus:ring-[#C9B59C]/30"
                                onChange={(e) => {
                                    setNumber(e.target.value)
                                }}
                                value={number}
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-stone-700">
                                Password
                            </span>
                            <input
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                className="w-full rounded-xl border border-[#D9CFC7] bg-[#F9F8F6] px-4 py-2.5 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-[#C9B59C] focus:ring-2 focus:ring-[#C9B59C]/30"
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                }}
                                value={password}
                            />
                        </label>

                        <button
                            type="button"
                            className="mt-2 w-full rounded-xl bg-[#C9B59C] px-4 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:brightness-95 active:brightness-90"
                            onClick={handleSignInErr}
                        >
                            Sign In
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-stone-500">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="font-semibold text-stone-800 underline-offset-2 hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
