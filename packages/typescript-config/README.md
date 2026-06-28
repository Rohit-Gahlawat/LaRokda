# @repo/typescript-config

Shared **TypeScript config presets** (`tsconfig`) for the monorepo, so every app and package compiles with the same settings.

## What's inside

| File | Use it for |
|------|------------|
| `base.json` | base settings for any TypeScript package |
| `nextjs.json` | Next.js apps |
| `react-library.json` | React component libraries |

## How to use

In a workspace's `tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": { /* per-app overrides */ }
}
```
