# @repo/store

Shared **client‑side state** built on **Jotai**. It holds small pieces of UI state (atoms) and convenience hooks that any app can reuse.

---

## How apps use it

```tsx
import { useBalance } from "@repo/store";

const balance = useBalance();
```

The package also re‑exports Jotai itself, so apps can `import { atom, useAtom } from "@repo/store"` without adding Jotai separately. Apps wrap their tree in the Jotai `Provider` (see each app's `provider.tsx`).

## What's inside

- `balanceAtom` — an atom holding a balance value.
- `useBalance` — a hook to read it.

## Project structure

```
src/
├── index.ts            # re-exports jotai + atoms + hooks
├── atoms/balance.ts    # balanceAtom
└── hooks/useBalance.ts # useBalance()
```

## Tech

- [Jotai](https://jotai.org)
