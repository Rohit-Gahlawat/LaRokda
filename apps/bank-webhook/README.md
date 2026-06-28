# bank-webhook

A small **Express** service that handles **money coming in** (the on‑ramp). When a user adds money, the bank calls this service to confirm the payment, and the service credits the user's wallet.

This is the "**bank → us**" direction. (The opposite direction, "us → bank", is handled by `bank-sweeper`.)

Runs on **port 3003**.

---

## What it does

- Exposes `POST /hdfcwebhook`.
- On a request it runs a single Prisma **`$transaction`** that:
  1. increases the user's `Balance`, and
  2. marks the matching `OnRampTransaction` as `Success`.

Doing both in one transaction means the balance and the transaction status always stay in sync — you never credit money without recording it, or vice‑versa.

Example request:

```bash
curl -X POST http://localhost:3003/hdfcwebhook \
  -H "Content-Type: application/json" \
  -d '{ "token": "<onramp-token>", "user_identifier": "<userId>", "amount": 10000 }'
```

> Amounts are in **paise** (₹100 = `10000`) to match how the rest of the system stores money.

---

## How it's built

- Written in TypeScript and bundled with **esbuild** into `dist/index.js` (see `esbuild.config.js`), then run with plain Node.
- Loads its `.env` via `dotenv` and talks to the database through the shared `@repo/db` package.

## Project structure

```
src/index.ts        # Express app + /hdfcwebhook handler
esbuild.config.js   # bundles src → dist
dist/index.js       # built output (generated)
```

## Running it

```bash
# from the repo root
npm run dev
# or just this service
cd apps/bank-webhook && npm run dev   # builds, then runs on :3003
```

If you see `Port 3003 is already in use`, an old instance is still running — stop it with `lsof -ti tcp:3003 | xargs kill -9` and start again.

## Environment variables

Create `apps/bank-webhook/.env` with:

- `DATABASE_URL` — pooled Postgres (Neon) connection
- `DIRECT_DATABASE_URL` — direct Postgres connection
