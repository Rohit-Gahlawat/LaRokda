import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/signin");
    }
    const name = session.user?.name ?? "";

    return <div className="mx-auto w-full max-w-5xl">
        <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-[#F891BB]/20 p-6 sm:p-10">
            <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
                <div className="max-w-md text-center md:text-left">
                    <span className="inline-flex items-center rounded-full bg-[#FF0052]/10 px-3 py-1 text-xs font-medium text-[#FF0052]">
                        PayPilot wallet
                    </span>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
                        Dashboard
                    </h1>
                    <p className="mt-3 text-sm text-stone-500 sm:text-base">
                        Send money to anyone, top up your wallet, and track every
                        transaction — all in one place.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                        <Link
                            href="/send"
                            className="rounded-xl bg-[#FF0052] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 active:brightness-90"
                        >
                            Send Money
                        </Link>
                        <Link
                            href="/transfer"
                            className="rounded-xl border border-[#FF0052] bg-white px-5 py-2.5 text-sm font-semibold text-[#FF0052] shadow-sm transition hover:bg-[#FF0052]/10"
                        >
                            Add Money
                        </Link>
                    </div>
                </div>

                <div className="shrink-0">
                    <HeroArt />
                </div>
            </div>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <ActionCard
                href="/send"
                title="Send Money"
                description="Transfer instantly to any mobile number."
                icon={<SendIcon />}
            />
            <ActionCard
                href="/transfer"
                title="Add More Money"
                description="Top up your wallet from your bank."
                icon={<AddIcon />}
            />
            <ActionCard
                href="/transactions"
                title="Transactions"
                description="Review your bank and peer-to-peer activity."
                icon={<HistoryIcon />}
            />
        </div>
    </div>
}

function ActionCard({
    href,
    title,
    description,
    icon
}: {
    href: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6"
        >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF0052]/10 text-[#FF0052] transition-colors group-hover:bg-[#FF0052]/20">
                {icon}
            </div>
            <div>
                <div className="flex items-center gap-1.5 text-base font-semibold text-stone-800">
                    {title}
                    <span className="translate-x-0 text-[#FF0052] transition-transform duration-200 group-hover:translate-x-1">
                        →
                    </span>
                </div>
                <p className="mt-1 text-sm text-stone-500">{description}</p>
            </div>
        </Link>
    );
}

function HeroArt() {
    return (
        <svg
            viewBox="0 0 280 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-44 w-60 sm:h-52 sm:w-72"
            role="img"
            aria-label="Wallet illustration"
        >
            <circle cx="205" cy="78" r="72" fill="#F891BB" opacity="0.35" />
            <ellipse cx="120" cy="196" rx="96" ry="14" fill="#F891BB" opacity="0.35" />

            <g transform="rotate(-8 130 110)">
                <rect x="44" y="58" width="186" height="114" rx="18" fill="#FF0052" />
                <rect x="44" y="58" width="186" height="114" rx="18" fill="#FFFFFF" opacity="0.08" />
                <rect x="66" y="84" width="36" height="27" rx="6" fill="#FFFFFF" opacity="0.9" />
                <rect x="72" y="92" width="24" height="3" rx="1.5" fill="#FF0052" opacity="0.6" />
                <rect x="72" y="100" width="24" height="3" rx="1.5" fill="#FF0052" opacity="0.6" />
                <rect x="66" y="132" width="108" height="9" rx="4.5" fill="#FFFFFF" opacity="0.8" />
                <rect x="66" y="148" width="64" height="7" rx="3.5" fill="#FFFFFF" opacity="0.55" />
                <circle cx="198" cy="150" r="13" fill="#FFFFFF" opacity="0.9" />
                <circle cx="182" cy="150" r="13" fill="#FFFFFF" opacity="0.5" />
            </g>

            <g>
                <ellipse cx="64" cy="178" rx="28" ry="10" fill="#F891BB" />
                <ellipse cx="64" cy="170" rx="28" ry="10" fill="#F13E93" />
                <ellipse cx="64" cy="162" rx="28" ry="10" fill="#F891BB" />
                <ellipse cx="64" cy="154" rx="28" ry="10" fill="#399918" />
                <text
                    x="64"
                    y="159"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill="#FFFFFF"
                >
                    ₹
                </text>
            </g>
        </svg>
    );
}

function SendIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.27 3.27a.5.5 0 0 1 .68-.63l16.5 7.5a.5.5 0 0 1 0 .92l-16.5 7.5a.5.5 0 0 1-.68-.63L6 12Zm0 0h7.5" />
        </svg>
    );
}

function AddIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v9m4.5-4.5h-9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    );
}

function HistoryIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    );
}
