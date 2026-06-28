# @repo/zod

Shared **Zod validation schemas**. Putting them here means the same rules are used everywhere — for example, the client, the server action, and the webhook all agree on what a valid input looks like.

---

## How apps use it

```ts
import { userSigninSchema, UserSigninType } from "@repo/zod";

const parsed = userSigninSchema.safeParse(input);
if (!parsed.success) { /* reject */ }
```

## What's inside

- `userSigninSchema` — phone (exactly 10 chars) + password (8–50 chars), plus the inferred `UserSigninType`.
- Webhook schemas (e.g. `userWebhookSchema`, `merchantWebhookSchema`) for validating incoming bank webhook payloads.

## Project structure

```
src/
├── index.ts                 # entry point (re-exports)
└── user-app-types/index.ts  # user + webhook schemas
```

## Tech

- [Zod](https://zod.dev) v4
