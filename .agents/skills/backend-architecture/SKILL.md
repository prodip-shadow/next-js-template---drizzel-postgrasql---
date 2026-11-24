---
name: backend-architecture
description: Backend architecture and module implementation skill for scout-website. Use whenever designing or editing database schemas, validation, repositories, services, Server Actions, or external integrations. Enforces AGENTS.md 4-layer function-call architecture (non-REST), careful codebase inspection, and structured conflict resolution.
---

# Backend Architecture Skill

Work as a careful, professional web developer. Understand the full requirement, inspect the existing codebase thoroughly, and follow `AGENTS.md` strictly before writing any backend code.

## 1. Inspect the Codebase First

Before implementing or modifying backend logic, inspect the relevant existing files:

- **`AGENTS.md`** — Review the architectural rules, naming conventions, and 4-layer code patterns.
- **`src/db/schema/` & `src/db/drizzle.js`** — Check existing tables, foreign keys, relations, and the centralized Drizzle + Neon connection.
- **`src/modules/`** — Check existing feature modules to reuse shared patterns and avoid duplicate logic.
- **`src/services/` & `src/lib/`** — Reuse existing third-party integrations and shared utilities.

## 2. Function-Call Architecture (Not REST API-Based)

This project does **not** use REST API routes for application features. Like Laravel's direct controller/service calls, everything works through direct JavaScript function calls:

- **Reads (from Server Components):** Call `<feature>.service.js` functions directly (`Server Component -> Service -> Validation (when needed) + Repository -> Database`).
- **Writes (from Client Components):** Call `"use server"` functions in `<feature>.actions.js` directly (`Client Component -> Server Action -> Service -> Validation + Repository -> Database`).
- **No `/api` routes:** Do not create API route handlers unless an external webhook or third-party HTTP consumer explicitly requires an HTTP endpoint.

## 3. Strict 4-Layer Module Rules (`src/modules/<feature>/`)

1. **`<feature>.validation.js`** — Pure Zod schemas (`create`, `update`, `id`, filters). No DB queries or business logic.
2. **`<feature>.repository.js`** — Pure Drizzle ORM queries via `@/db/drizzle` (`.returning()`, transactions). Zero business rules, authentication, or authorization logic.
3. **`<feature>.service.js`** — Business logic, Zod parsing/validation, ownership checks, business-level authorization, missing-record handling, and coordination between repositories and `src/services/`. Independent of React and Next.js request objects.
4. **`<feature>.actions.js`** — Starts with `"use server";` and exports only `async` Server Actions. Resolves server-side session/user identity, safely invokes Service functions, revalidates paths when needed, and returns `{ success: true, data }` or `{ success: false, message }`.

- **Security & Errors:** Never trust client-provided user IDs, roles, permissions, or ownership flags. Return `ZodError` first issue messages safely and use generic messages for unexpected errors—never expose SQL errors, stack traces, or secrets.
- **External Services:** Put third-party integrations in `src/services/<provider>/` with `import "server-only";`.
- **Language:** JavaScript (`.js`) only, `@/*` import alias, named exports.

## 4. Handling Code Conflicts & Ambiguities

If you encounter a code conflict, breaking change risk, or multiple valid architectural approaches:

1. **Stop and inform the user** clearly about the conflict or decision point.
2. **Present concrete options** explaining what can be done, with one option marked `(Recommended)`.
3. **Include a custom input option** (when using `ask_question`, the UI automatically provides an `"Other"` custom text field so the user can specify their own approach if they prefer none of the listed options).
