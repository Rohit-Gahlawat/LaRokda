# bank-sweeper

A background **worker** that handles **money going out** (the off‑ramp / withdrawals). It runs in a loop, looks for pending withdrawals, and (in production) tells the bank to pay them out.

This is the "**us → bank**" direction. (The opposite direction, "bank → us", is handled by `bank-webhook`.)

---

## What it does

Every 5 seconds it:
1. Finds `UserWithdrawal` rows with status `Processing` (`sweepUser`).
2. Finds `MerchantWithdrawal` rows with status `Processing` (`sweepMerchant`).
3. Sends each one to the bank's payout API (`bank-server` in development, a real bank in production) and moves on — it doesn't wait around for the money to actually settle.

The bank doesn't reply straight away. It confirms later, in the background, by calling `bank-webhook` — which is what actually marks the row `Success` (and clears the `locked` amount) or `Failed` (and refunds it). So this worker's job is only to **hand off** pending withdrawals, not to wait for the outcome.

Because the loop runs every 5 seconds but a payout can take longer than that to get a reply, the sweeper keeps a small in‑memory set of tokens it has already sent — so the same withdrawal isn't handed to the bank twice while it's still waiting on a reply.

> The withdrawal record already carries a unique `token`, which is sent to the bank as an **idempotency key** so a retry can never pay the same withdrawal twice.

---

## Why a separate worker?

Paying a bank is slow and can fail, so it shouldn't happen during the user's click. Instead the app **reserves** the money instantly (moves it into a `locked` balance) and this worker **settles** it in the background. That keeps the UI fast and the money safe.

## Project structure

```
src/index.ts   # the loop: sweepUser(), sweepMerchant(), sleep()
```

## Running it

```bash
cd apps/bank-sweeper
npm run dev     # tsx watch (auto-reloads)
# or
npm run start   # tsx (one-off run)
```

## Environment variables

Create `apps/bank-sweeper/.env` with:

- `DATABASE_URL` — pooled Postgres (Neon) connection
- `DIRECT_DATABASE_URL` — direct Postgres connection
- `BANK_SERVER_URL` — where the dummy bank is running (defaults to `http://localhost:3004`)
