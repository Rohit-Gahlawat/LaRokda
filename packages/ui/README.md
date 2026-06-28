# @repo/ui

Shared **React UI components** used by both the user app and the merchant app, styled with **Tailwind CSS v4**. Keeping them here means both apps look consistent and a fix in one place updates everywhere.

---

## How apps use it

Each component is imported by its own path:

```tsx
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { Select } from "@repo/ui/select";
import { Appbar } from "@repo/ui/appbar";
```

(The `package.json` `exports` maps `./*` to `src/*.tsx`.)

For Tailwind to see these classes, the apps include this package in their CSS source scan:

```css
@import "tailwindcss";
@source "../../../packages/ui/src";
```

---

## Components

| Component | Use |
|-----------|-----|
| `Button` | primary action button (full width, brand color) |
| `Card` | titled container card |
| `TextInput` | labelled text input |
| `Select` | dropdown select |
| `Appbar` | top bar with brand + login/logout |
| `SidebarItem` | nav item used in the dashboard sidebar |
| `Center` | simple centering wrapper |

## Project structure

```
src/
├── button.tsx
├── card.tsx
├── textinput.tsx
├── select.tsx
├── appbar.tsx
├── sidebaritem.tsx
└── center.tsx
```

## Scripts

```bash
npm run lint
npm run check-types
```
