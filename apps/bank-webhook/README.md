# bank-webhook

A small **Express** service that plays the "bank calling us back" side of every money movement. It has three endpoints, one for add‑money and one each for the two kinds of withdrawal, and it's the only place that actually updates balances based on what a bank says happened.

This is the "**bank → us**" direction. In development, the calls come from our own dummy bank, `bank-server` — in production, a real bank would call these same endpoints. (The opposite direction, "us → bank", is handled by `bank-sweeper`.)

Runs on **port 3003**.

---

## What it does

**`POST /hdfcwebhook`** — confirms an add‑money (on‑ramp) request.
- Runs a single Prisma **`$transaction`**: if the bank says `Success`, it increases the user's `Balance` and marks the `OnRampTransaction` as `Success`; if `Failed`, it just marks the transaction `Failed` (no money moves).

**`POST /user/withdrawal`** and **`POST /merchant/withdrawal`** — confirm a withdrawal.
- On `Success`, it clears the reserved `locked` amount (the money has left the wallet for good).
- On `Failed`, it **refunds** the withdrawal — `locked` goes down and `amount` goes back up, as if the withdrawal never happened.
- Both validate the incoming payload with a Zod schema (`userWebhookSchema` / `merchantWebhookSchema`) before touching the database.

All three routes only act on a row that's still `Processing` — if it's already been settled, the request is rejected as "already completed." This stops the same confirmation from being applied twice.

Example request:

```bash
curl -X POST http://localhost:3003/hdfcwebhook \
  -H "Content-Type: application/json" \
  -d '{ "token": "<onramp-token>", "user_identifier": "<userId>", "amount": 10000, "status": "Success" }'
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
