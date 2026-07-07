import { signIn } from "@/auth";

export default function MerchantSignInPage() {
    return (
        <div className="flex min-h-screen flex-1 items-center justify-center bg-white px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF0052] text-lg font-bold text-white shadow-sm">
                        M
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Merchant Portal
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Sign in to manage your mymoney business account
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <form
                        action={async () => {
                            "use server";
                            await signIn("google", { redirectTo: "/dashboard" });
                        }}
                    >
                        <button
                            type="submit"
                            className="flex w-full items-center cursor-pointer justify-center gap-3 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0052]/40"
                        >
                            <GoogleLogo />
                            Continue with Google
                        </button>
                    </form>

                    <div className="mt-6 flex items-center gap-3">
                        <span className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Secure sign in
                        </span>
                        <span className="h-px flex-1 bg-gray-200" />
                    </div>

                    <p className="mt-4 text-center text-xs leading-relaxed text-gray-400">
                        By continuing, you agree to our Terms of Service and
                        Privacy Policy.
                    </p>
                </div>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Accept payments. Track settlements. Grow your business.
                </p>
            </div>
        </div>
    );
}

function GoogleLogo() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.97h3.88c2.27-2.09 3.57-5.17 3.57-8.79z"
            />
            <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-2.97c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
            />
            <path
                fill="#FBBC05"
                d="M5.27 14.32c-.24-.72-.38-1.49-.38-2.32s.14-1.6.38-2.32V6.59H1.29C.47 8.23 0 10.06 0 12s.47 3.77 1.29 5.41l3.98-3.09z"
            />
            <path
                fill="#EA4335"
                d="M12 4.74c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.98 3.09C6.22 6.85 8.87 4.74 12 4.74z"
            />
        </svg>
    );
}
