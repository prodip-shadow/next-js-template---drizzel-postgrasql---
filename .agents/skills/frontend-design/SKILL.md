---
name: frontend-design
description: Frontend UI and component implementation skill for scout-website. Use whenever building or editing pages, layouts, forms, or UI components in src/app/ or src/components/. Enforces backend-first inspection, shadcn/ui usage, reusable components, simple design, minimal required fields, and asking the user when in doubt or blocked.
---

# Frontend Design & Implementation Skill

Follow these rules whenever designing or implementing frontend pages, layouts, or components in `scout-website`.

## 1. Inspect Backend Functionality First

Before writing any UI or page code, inspect the relevant backend files to understand what data, fields, validation rules, and actions actually exist:

- **`src/modules/<feature>/<feature>.validation.js`** — Check exact Zod field names, types, optionality, and constraints so form inputs match backend validation.
- **`src/modules/<feature>/<feature>.service.js`** — Check read functions (for Server Components), business rules, and returned data shapes.
- **`src/modules/<feature>/<feature>.actions.js`** — Check available `"use server"` Server Actions (for Client Component mutations) and their `{ success, data, message }` response shape.
- **`src/db/schema/`** — Check table columns and relations when needed to understand entity structure.

Never invent frontend fields, states, or actions that do not exist in or align with the backend.

## 2. Check & Reuse Existing Components

- Always inspect `src/components/ui/`, `src/components/shared/`, and `src/components/<feature>/` before creating a new component.
- Reuse existing `shadcn/ui` primitives (e.g., `src/components/ui/button.jsx`) and shared components instead of duplicating UI code.
- Always use **shadcn/ui** components (`base-mira` style on `@base-ui/react`, `lucide-react` icons, configured in `components.json` with `tsx: false` and `rtl: true`).
- Use `cn()` from `@/lib/utils` for class merging, and prefer Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) to respect `rtl: true`.

## 3. Keep Design Simple & Minimal

- **Simple design:** Keep the UI clean, straightforward, and easy to use—avoid over-styled layouts, unnecessary animations, or visual clutter.
- **Only what is required:** Render only the exact fields, buttons, and design elements needed for the specific feature or view. Never add unrequested fields, extra sections, or filler content.
- **Server Components by default:** Use Server Components in `src/app/` and call Service functions directly for reads. Add `"use client"` only when client interactivity or React hooks are required.
- **JavaScript/JSX only:** Write `.jsx` for components (`.js` for logic); never use TypeScript.
- **Preserve routing:** Keep `(auth)`, `(common)`, and `(dashboard)` route groups intact (`src/app/(common)/page.jsx` serves `/`).
- **Component-based loading states:** Never use plain text like `"Loading..."`, `"Saving..."`, or `"Uploading..."` for loading states. Always use shadcn/ui components:
  - Use `<Spinner />` (`@/components/ui/spinner`) for circular loading indicators inside buttons, menu items, and inline actions.
  - Use `<Skeleton />` (`@/components/ui/skeleton`) for card, list, and page-level loading placeholders (`loading.jsx` and `<Suspense>` fallbacks).

## 4. Ask When Uncertain or Blocked

- **When in doubt, ask:** If requirements, fields, layout, or user flows are unclear, ask the user (using `ask_question` for choices or direct questions) instead of guessing.
- **Report codebase problems first:** If a missing backend service/action, schema mismatch, or codebase issue prevents clean implementation, stop and explain the problem to the user before implementing workarounds.
