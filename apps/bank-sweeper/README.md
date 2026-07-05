# bank-sweeper

A background **worker** that handles **money going out** (the off‑ramp / withdrawals). It runs in a loop, looks for pending withdrawals, and (in production) tells the bank to pay them out.

This is the "**us → bank**" direction. (The opposite direction, "bank → us", is handled by `bank-webhook`.)

---

## What it does

Every 5 seconds it:
1. Finds `UserWithdrawal` rows with status `Processing` (`sweepUser`).
2. Finds `MerchantWithdrawal` rows with status `Processing` (`sweepMerchant`).
3. (In production) calls the bank's payout API for each, then marks the row `Success` and clears the reserved `locked` amount — or `Failed` and refunds it.

The call to the real bank API is currently a placeholder (commented out), so the worker is ready to plug a real bank in without changing the rest of the system.

> The withdrawal record already carries a unique `token`, which is meant to be sent to the bank as an **idempotency key** so a retry can never pay the same withdrawal twice.

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
