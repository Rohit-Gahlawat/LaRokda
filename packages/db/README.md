# @repo/db

The single source of truth for the database. It holds the **Prisma schema**, the generated **Prisma client**, the **migrations**, and the **seed** script. Every app imports the database through this one package, so there's only one place that knows about tables and connections.

Uses **Prisma 7** with the **Neon serverless driver adapter** (`@prisma/adapter-neon`), so it works well on serverless/edge runtimes.

---

## How apps use it

```ts
import db from "@repo/db";          // the Prisma client (default export)
import { OnRampStatusType } from "@repo/db";  // enums/types are re-exported too

const balance = await db.balance.findFirst({ where: { userId } });
```

The client is created once (with the Neon adapter) in `index.ts` and reused everywhere.

---

## Data model (tables)

| Model | What it stores |
|-------|----------------|
| `User` | end users (phone, name, hashed password) |
| `Balance` | a user's wallet: `amount` (available) + `locked` (reserved) |
| `Merchant` | merchants (email, name, auth type) |
| `MerchantBalance` | a merchant's wallet: `amount` + `locked` |
| `OnRampTransaction` | add‑money (top‑up) records |
| `P2P` | user → user transfers |
| `MerchantTransaction` | user → merchant payments |
| `UserWithdrawal` | user → bank withdrawals |
| `MerchantWithdrawal` | merchant → bank withdrawals |

Enums: `AuthType` (`google`, `github`), `OnRampStatusType` and `UserWithdrawalEnum` (`Success`, `Failed`, `Processing`).

> All money columns are stored as **integers in paise** (₹1 = `100`).

---

## Project structure

```
index.ts                 # creates & exports the Prisma client (+ re-exports types)
prisma/
├── schema.prisma        # models, enums, generator, datasource
├── migrations/          # migration history
└── seed.ts              # sample users + merchants
src/generated/prisma/    # generated Prisma client (do not edit)
prisma.config.ts         # config (seed runner, datasource)
```

---

## Scripts

```bash
npm run db:generate   # regenerate the Prisma client after schema changes
npm run db:migrate    # create/apply a migration in dev
npm run db:push       # push schema without a migration
npm run db:studio     # open Prisma Studio (visual DB browser)
npx prisma db seed    # run the seed script
```

## Environment variables

Create `packages/db/.env` with:

- `DATABASE_URL` — pooled Postgres (Neon) connection (used by the app at runtime)
- `DIRECT_DATABASE_URL` — direct connection (used for migrations and seeding)
