# PayPilot — a digital wallet & payments platform

PayPilot is a Paytm‑style digital wallet built as a **Turborepo monorepo**. People can add money from their bank, send money to friends by phone number, pay merchants, and withdraw money back to their bank. Merchants get their own portal to accept payments and settle them to their bank account.

It is a full money‑movement system: money comes **in** from a bank, moves **around** between users and merchants, and goes back **out** to a bank — and the whole thing is built so two people can never spend the same balance twice.

---

## What's inside (the big picture)

```
                ┌──────────────┐        ┌──────────────┐
   user  ─────► │  user-app    │        │ merchant-app │ ◄───── merchant (Google login)
                │ (Next.js)    │        │ (Next.js)    │
                └──────┬───────┘        └──────┬───────┘
                       │                       │
                       ▼                       ▼
                 ┌───────────────────────────────────┐
                 │        PostgreSQL (Neon)           │
                 │     accessed via @repo/db (Prisma) │
                 └───────┬───────────────────┬────────┘
                         ▲                    │
            money IN     │                    │   money OUT
        ┌────────────────┴───┐        ┌───────▼─────────────┐
        │  bank-webhook       │        │  bank-sweeper        │
        │  (Express service)  │        │  (Node worker loop)  │
        │  bank → us          │        │  us → bank           │
        └─────────────────────┘        └──────────────────────┘
                   ▲                              │
                   └──────────  Bank APIs  ───────┘
                        (HDFC / Axis / SBI …)
```

- **Money in (on‑ramp):** the user starts an "Add Money", and the bank later calls our **bank-webhook** to confirm and credit the wallet.
- **Money out (withdrawal / off‑ramp):** the user/merchant requests a withdrawal, the amount is reserved, and the **bank-sweeper** worker pushes it to the bank.
- **Money around:** user → user and user → merchant transfers happen instantly inside the database.

---

## Features

**User app**
- Sign up / sign in with phone number + password (passwords hashed with bcrypt).
- Add money to the wallet from a bank.
- Send money to another user by mobile number (P2P).
- Pay a merchant by merchant id.
- Withdraw money back to a bank account.
- Transaction history with toggles: **Bank** (top‑ups + withdrawals), **Personal** (P2P), and **Merchant** payments.
- Live success/error messages, button loaders, and page‑navigation loaders.

**Merchant app**
- Sign in with **Google** (OAuth).
- Dashboard with balance, **Payments Received**, and a **Withdrawals** toggle.
- Withdraw collected money to a bank account.

**Behind the scenes**
- **bank-webhook** — receives confirmations from the bank and credits wallets.
- **bank-sweeper** — a background worker that picks up pending withdrawals and sends them to the bank.

---

## What makes it interesting

- **Race‑condition safe money:** P2P transfers run inside a Prisma `$transaction` with a row‑level lock (`SELECT … FOR UPDATE`), and withdrawals use a single atomic conditional update (`UPDATE … WHERE amount >= x`). So if someone with ₹100 fires two ₹60 requests at the same time, only one can succeed — no double‑spend.
- **Two‑phase withdrawals:** money is first *reserved* (moved from `amount` into a `locked` balance), then settled to the bank asynchronously by the sweeper, and refunded if the bank call fails.
- **Money stored as integers (paise):** amounts are multiplied by 100 on the way in and divided by 100 on display, so there are no floating‑point rounding bugs with rupees and paise.
- **Type‑safe everywhere:** the database client, validation schemas, and UI components are shared internal packages, so types flow from the database all the way to the screen.
- **Edge‑ready data layer:** Prisma 7 with the Neon serverless driver adapter.
- **Modern stack:** Next.js 16 (App Router) + React 19, NextAuth v5, Tailwind CSS v4.

---

## Tech stack

| Area | Tech |
|------|------|
| Monorepo | Turborepo, npm workspaces |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4 |
| Auth | NextAuth v5 — credentials (users), Google OAuth (merchants) |
| Backend services | Express 5 (bank-webhook), Node + tsx worker (bank-sweeper) |
| Database | PostgreSQL (Neon) via Prisma 7 + `@prisma/adapter-neon` |
| Validation | Zod |
| Client state | Jotai |
| Language | TypeScript |

---

## Repository structure

```
PayPilot/
├── apps/
│   ├── user-app/        # Next.js wallet app for end users (port 3001)
│   ├── merchant-app/    # Next.js portal for merchants (port 3000)
│   ├── bank-webhook/    # Express service: bank → us (money in)
│   └── bank-sweeper/    # Node worker: us → bank (money out)
└── packages/
    ├── db/              # Prisma schema, client, migrations, seed
    ├── ui/              # Shared React UI components (Tailwind)
    ├── zod/             # Shared Zod validation schemas
    ├── store/           # Shared Jotai state (atoms/hooks)
    ├── eslint-config/   # Shared ESLint config
    └── typescript-config/ # Shared tsconfig presets
```

Each app and package has its own `README.md` with more detail.

---

## How the money flows

**1. Add money (on‑ramp)**
1. User enters an amount → `addMoney` creates an `OnRampTransaction` with status `Processing`.
2. The bank later calls **bank-webhook** (`POST /hdfcwebhook`) which, in one atomic `$transaction`, credits the user's `Balance` and marks the transaction `Success`.

**2. Send money (P2P) / pay a merchant**
- Inside a `$transaction`: lock the sender's balance, check funds, decrement sender, increment receiver, and write a `P2P` (or `MerchantTransaction`) record — all or nothing.

**3. Withdraw money (off‑ramp)**
1. Request reserves the funds atomically (`amount -= x`, `locked += x`) and creates a `UserWithdrawal` / `MerchantWithdrawal` with status `Processing`.
2. **bank-sweeper** runs on a loop, finds `Processing` withdrawals, and (in production) calls the bank to pay out — then clears the locked amount on success or refunds on failure.

---

## Getting started

**Prerequisites**
- Node.js >= 18
- npm 11+
- A PostgreSQL database (a free [Neon](https://neon.tech) database works great)

**1. Install**
```bash
npm install
```

**2. Set up environment variables**

Create a `.env` in each workspace that needs one. The variable **names** are:

- `packages/db/.env` — `DATABASE_URL`, `DIRECT_DATABASE_URL`
- `apps/user-app/.env` — `DATABASE_URL`, `DIRECT_DATABASE_URL`, `JWT_SECRET`, `NEXTAUTH_URL`
- `apps/merchant-app/.env` — `DATABASE_URL`, `DIRECT_DATABASE_URL`, `AUTH_SECRET`, `NEXT_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_SECRET`
- `apps/bank-webhook/.env` — `DATABASE_URL`, `DIRECT_DATABASE_URL`
- `apps/bank-sweeper/.env` — `DATABASE_URL`, `DIRECT_DATABASE_URL`

(`DATABASE_URL` is the pooled Neon connection; `DIRECT_DATABASE_URL` is the direct one used for migrations and seeding.)

**3. Set up the database**
```bash
cd packages/db
npx prisma migrate dev     # create tables
npx prisma db seed         # add sample users + merchants
```

**4. Run everything**
```bash
# from the repo root
npm run dev
```
This starts every app via Turborepo. The webhook and sweeper can also be started on their own from their folders.

Default URLs:
- User app → http://localhost:3001
- Merchant app → http://localhost:3000
- bank-webhook → http://localhost:3003

---

## Useful scripts (run from the root)

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start all apps in dev mode |
| `npm run build` | Build all apps |
| `npm run lint` | Lint everything |
| `npm run check-types` | Type‑check everything |
| `npm run format` | Format with Prettier |

Database scripts live in `packages/db` (`db:generate`, `db:push`, `db:migrate`, `db:studio`).

---

## Sample login

After seeding, you can log into the user app with the seeded users (see `packages/db/prisma/seed.ts` for the current phone numbers and passwords).
