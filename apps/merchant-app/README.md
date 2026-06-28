# merchant-app

The merchant portal. A business signs in with Google, sees the money it has collected from users, and withdraws it to a bank account.

Built with **Next.js 16 (App Router)**, **React 19**, **NextAuth v5 (Google OAuth)**, and **Tailwind CSS v4**. Runs on **port 3000**.

---

## Features

- **Sign in with Google** — first sign‑in automatically creates the merchant record (with a zero balance).
- **Dashboard** — current balance, a **Payments Received** list, and a **Withdrawals** toggle.
- **Withdraw to bank** — request a payout of collected funds (processed by the `bank-sweeper`).
- **Good UX** — button spinner, success/error banner, and a page‑level loader while navigating.

---

## How it works

- On Google sign‑in, the `signIn` callback creates a `Merchant` row if one doesn't exist; the `jwt` callback stores the merchant id on the token; the `session` callback exposes it as `session.user.id`. (See [`lib/auth.ts`](lib/auth.ts) and [`types/next-auth.d.ts`](types/next-auth.d.ts).)
- The dashboard reads the merchant's `MerchantBalance` and the `MerchantTransaction` / `MerchantWithdrawal` rows for that merchant.
- Withdrawals reserve funds into a `locked` balance and create a `MerchantWithdrawal` (status `Processing`) that the sweeper settles. Amounts are handled in paise (×100 in, ÷100 on display).

---

## Project structure

```
app/
├── (dashboard)/dashboard/  # merchant dashboard (balance, received, withdrawals)
├── (dashboard)/loading.tsx # navigation loader
├── signin/                 # Google sign-in page
├── api/auth/[...nextauth]/ # NextAuth route handler
├── layout.tsx              # root layout (appbar)
└── provider.tsx            # client providers

components/                 # WithdrawCard, PaymentsToggle,
                            # MerchantReceived, MerchantWithdrawals
actions.ts                 # server actions (sign in/out, handleWithdrawals)
lib/auth.ts                # NextAuth Google config + callbacks
types/next-auth.d.ts       # session/jwt type augmentation
auth.ts                    # exports handlers, signIn, signOut, auth
```

---

## Running it

```bash
# from the repo root
npm run dev
# or just this app
cd apps/merchant-app && npm run dev
```
Open http://localhost:3000.

## Environment variables

Create `apps/merchant-app/.env` with:

- `DATABASE_URL` — pooled Postgres (Neon) connection
- `DIRECT_DATABASE_URL` — direct Postgres connection
- `AUTH_SECRET` — NextAuth secret
- `NEXT_AUTH_URL` — base URL of the app (e.g. `http://localhost:3000`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_SECRET` — Google OAuth credentials

> For Google login to work, add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI in the Google Cloud console.
