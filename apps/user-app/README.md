# user-app

The customer‑facing wallet. This is where a person signs in, adds money, sends money, pays merchants, withdraws to their bank, and views their transaction history.

Built with **Next.js 16 (App Router)**, **React 19**, **NextAuth v5**, and **Tailwind CSS v4**. Runs on **port 3001**.

---

## Features

- **Auth** — sign up / sign in with a phone number and password. Passwords are hashed with bcrypt and sessions use NextAuth v5 (JWT).
- **Add money** — start a top‑up from a bank; the request is shown as "processing" right away and the wallet updates a little later once the bank (in development, the dummy `bank-server`) confirms it through `bank-webhook`.
- **Send money (P2P)** — pay another user by their mobile number.
- **Pay a merchant** — pay a merchant by their id.
- **Withdraw** — move money from the wallet back to a bank account.
- **Transactions** — history with a toggle for **Bank** (top‑ups + withdrawals), **Personal** (P2P), and **Merchant** payments.
- **Good UX** — button spinners while requests run, success/error banners, and a page‑level loader while navigating.

---

## How money logic works here

- Amounts are handled in **paise**: user input is multiplied by 100 before saving, and divided by 100 when shown. This avoids decimal rounding bugs.
- Transfers run inside a Prisma `$transaction` with a row lock (`SELECT … FOR UPDATE`) so balances can't be double‑spent.
- Withdrawals reserve money into a `locked` balance first, then the `bank-sweeper` settles them.

The actual business logic lives in [`app/actions.ts`](app/actions.ts) (`addMoney`, `p2pMoney`, `sendMerchant`, `handleWithdrawals`, auth helpers).

---

## Project structure

```
app/
├── (dashboard)/            # signed-in area (shares a sidebar layout + loading spinner)
│   ├── dashboard/          # home: balance, quick actions
│   ├── transfer/           # add money / withdraw + recent bank activity
│   ├── send/               # send money / pay a merchant
│   ├── transactions/       # history with Bank / Personal / Merchant toggle
│   ├── p2p/                # peer-to-peer send
│   ├── layout.tsx          # sidebar + appbar layout
│   └── loading.tsx         # shown while navigating between pages
├── signin/ , signup/       # auth pages (outside the dashboard shell)
├── api/auth/[...nextauth]/ # NextAuth route handler
├── actions.ts              # server actions (all money + auth logic)
├── layout.tsx              # root layout (appbar)
└── provider.tsx            # client providers

components/                 # AddMoneyCard, sendcard, BalanceCard,
                            # OnRampTransaction, P2PTransactions,
                            # MerchantTransactions, TransactionsToggle …
lib/auth.ts                 # NextAuth credentials config
auth.ts                     # exports handlers, signIn, signOut, auth
```

---

## Running it

```bash
# from the repo root
npm run dev
# or just this app
cd apps/user-app && npm run dev
```
Open http://localhost:3001.

## Environment variables

Create `apps/user-app/.env` with:

- `DATABASE_URL` — pooled Postgres (Neon) connection
- `DIRECT_DATABASE_URL` — direct Postgres connection
- `JWT_SECRET` — secret for NextAuth JWT sessions
- `NEXTAUTH_URL` — base URL of the app (e.g. `http://localhost:3001`)
