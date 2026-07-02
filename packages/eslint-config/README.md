# @repo/eslint-config

Shared **ESLint configurations** used across the monorepo, so every app and package follows the same linting rules.

## What's inside

| Export | Use it for |
|--------|------------|
| `@repo/eslint-config/base` | base rules for any TypeScript package |
| `@repo/eslint-config/next-js` | Next.js apps |
| `@repo/eslint-config/react-internal` | internal React component packages |

## How to use

In a workspace's `eslint.config.js`:

```js
import { nextJsConfig } from "@repo/eslint-config/next-js";
export default nextJsConfig;
```

Built on flat ESLint config with `typescript-eslint`, the Next.js plugin, React/React‑Hooks plugins, Prettier, and Turbo.
