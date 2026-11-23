# AGENTS.md

Architectural and development guide for **scout-website**. Follow this structure and workflow consistently across all features and edits.

---

## 1. Tech Stack & Language

- **Framework:** Next.js (App Router)
- **Language:** JavaScript (ES6+) and JSX only (`.js`, `.jsx`)
- **UI:** React, Tailwind CSS, **shadcn/ui**
- **Database:** Drizzle ORM + Neon PostgreSQL
- **Validation:** Zod
- **Path Alias:** `@/*` maps to `./src/*`

Do not introduce TypeScript (`.ts`, `.tsx`, `interface`, or `type` declarations) unless explicitly requested.

---

## 2. Project Directory Structure

```text
scout-website/
├── drizzle/
│   └── migrations/              # Drizzle Kit generated SQL migrations
├── public/                      # Static assets
└── src/
    ├── app/                     # Next.js App Router (routes, layouts, boundaries)
    │   ├── (auth)/              # Authentication pages (login, sign-up)
    │   ├── (common)/            # Public/common pages & layout (page.jsx serves /)
    │   ├── (dashboard)/         # Dashboard pages and layout
    │   ├── globals.css
    │   └── layout.jsx           # Root layout (no root app/page.jsx)
    ├── components/              # Reusable & feature UI components
    │   ├── ui/                  # shadcn/ui components & base UI primitives
    │   ├── shared/              # Components shared across multiple features
    │   └── <feature>/           # Feature-specific components (when needed)
    ├── db/                      # Database connection & Drizzle schemas
    │   ├── drizzle.js           # Centralized Neon + Drizzle client
    │   └── schema/
    │       ├── index.js         # Re-exports all table schemas and relations
    │       └── <entity>.js      # Individual table definitions
    ├── lib/                     # Shared utilities, constants, generic helpers
    ├── modules/                 # Feature-based business logic (4-layer architecture)
    │   └── <feature>/
    │       ├── <feature>.validation.js
    │       ├── <feature>.repository.js
    │       ├── <feature>.service.js
    │       └── <feature>.actions.js
    └── services/                # External/third-party service integrations
        └── <provider>/
            └── <provider>.js
```

---

## 3. Folder & File Responsibilities

### `src/app/` (Routing & Page Rendering)
- Holds pages (`page.jsx`), layouts (`layout.jsx`), route groups, loading states, and error boundaries.
- **Root route:** `src/app/(common)/page.jsx` serves as `/`. Keep `src/app/layout.jsx`, and do **not** create or use `src/app/page.jsx`.
- **Preserve existing route groups:** `(auth)`, `(common)`, and `(dashboard)` must not be renamed, removed, or reorganized without explicit permission.
- Keep page components focused on rendering and reading data via Service functions.
- Never place business logic or direct Drizzle queries inside `app/` files.
- Do not add API route handlers unless an external webhook or HTTP consumer explicitly requires an HTTP endpoint.

### `src/components/` (UI Components)
- `ui/` — **shadcn/ui** components and base reusable UI primitives (use these by default for UI building blocks).
- `shared/` — Components shared across multiple features or layouts.
- `<feature>/` — Components specific to a single feature.
- Use **Server Components by default**. Add `"use client"` only when client interactivity, browser APIs, or React client hooks are required.
- Never import database modules, repositories, or server-only integrations into Client Components.

### `src/db/` (Database & Schema)
- `src/db/drizzle.js` — Single centralized Drizzle ORM + Neon PostgreSQL connection. Never create separate DB connections elsewhere.
- `src/db/schema/<entity>.js` — Drizzle table definitions, foreign keys, and relations.
- `src/db/schema/index.js` — Central export point for all schemas.
- `drizzle/migrations/` — Migration history; never manually edit an already-applied migration.

### `src/modules/<feature>/` (4-Layer Feature Modules)
1. **`<feature>.validation.js`** — Pure Zod schemas (create, update, ID, filters). Keep separate from business logic and database operations.
2. **`<feature>.repository.js`** — Pure Drizzle ORM data access via `@/db/drizzle` (inserts, reads, updates, deletes, `.returning()`, transactions). Never implement business rules or authorization here.
3. **`<feature>.service.js`** — Core business logic, Zod validation, ownership checks, authorization, missing-record handling, and coordination between repositories and `src/services/`. Independent of React, UI, and Next.js request/response objects.
4. **`<feature>.actions.js`** — Begins with `"use server";` and exports only `async` Server Actions. Resolves server-side session identity, invokes Service functions, returns `{ success: true, data }` or `{ success: false, message }`, and revalidates affected paths when necessary.

### `src/services/` (External Integrations)
- Houses third-party SDKs and external providers (e.g., email, storage, payments, auth providers), one folder per provider.
- Contains provider configuration and reusable helpers only—keep feature business logic in `src/modules/`.
- Use `import "server-only";` in modules containing private keys or server-only SDKs.

### `src/lib/` (Shared Utilities)
- General-purpose helpers, constants, formatters, and shared utilities used across the app.
- Do not put feature-specific business logic or database queries here.

---

## 4. Data & Request Flow

The Service layer executes Zod validation and coordinates Repository operations:

- **Write:** `Client Component -> Server Action -> Service -> Validation + Repository -> Database`
- **Read:** `Server Component -> Service -> Validation (when needed) + Repository -> Database`

---

## 5. Reference Code Patterns (4-Layer Module)

Use these JavaScript patterns as the standard style and layer separation for modules:

**A. Validation — `todos.validation.js`**

```js
import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().optional(),
});

export const todoIdSchema = z.number().int().positive();
```

**B. Repository — `todos.repository.js`**

```js
import { db } from "@/db/drizzle";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createTodo(data) {
  const [todo] = await db.insert(todos).values(data).returning();
  return todo;
}

export async function getTodoById(id) {
  const [todo] = await db.select().from(todos).where(eq(todos.id, id));
  return todo;
}
```

**C. Service — `todos.service.js`**

```js
import * as repository from "./todos.repository";
import { createTodoSchema, todoIdSchema } from "./todos.validation";

export async function createTodoService(input) {
  const data = createTodoSchema.parse(input);
  return repository.createTodo(data);
}

export async function getTodoByIdService(id) {
  const validId = todoIdSchema.parse(id);
  const todo = await repository.getTodoById(validId);
  if (!todo) throw new Error("Todo not found");
  return todo;
}
```

**D. Server Actions — `todos.actions.js`**

```js
"use server";

import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { createTodoService } from "./todos.service";

export async function createTodoAction(input) {
  try {
    const data = await createTodoService(input);
    revalidatePath("/");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError)
      return { success: false, message: error.issues[0]?.message };
    return { success: false, message: "Something went wrong." };
  }
}
```

---

## 6. Authentication, Authorization & Error Handling

- **Server-side identity only:** Obtain the authenticated user's identity from the server-side authentication provider or session. Never trust client-provided user IDs, roles, permissions, or ownership flags.
- **Layer boundaries:**
  - **Server Actions** resolve the server-side user identity and safely invoke Services.
  - **Services** enforce ownership checks, role permissions, and business-level authorization so all entry points share consistent security rules.
  - **Repositories** contain zero authentication or authorization logic.
- **Safe error handling:** Validate all external inputs with Zod. Return validation errors safely (`ZodError` first issue message) and use generic client-facing messages for unexpected errors. Never expose internal errors, raw SQL errors, stack traces, or secrets to clients.

---

## 7. Naming, UI & Code Conventions

- **Minimal & Focused UI:** Render only the exact fields and design elements required for the specific feature or view—never add unrequested fields or unnecessary UI clutter.
- **Extensions:** `.js` for logic/modules/schemas, `.jsx` for React components.
- **Identifiers:** `camelCase` for variables and functions; `PascalCase` for React components.
- **Files:** `<feature>.validation.js`, `<feature>.repository.js`, `<feature>.service.js`, `<feature>.actions.js`; kebab-case for component files (e.g., `login-form.jsx`).
- **Exports:** Prefer named exports for module functions.
- **Imports:** Always use the `@/` alias for `src/` imports.

---

## 8. AI Workflow, Efficiency & Verification

### Inspection & Minimal Changes
- **Targeted inspection:** Do not scan the entire project for every task. Inspect only the files relevant to the request and their direct dependencies, and avoid re-reading files whose contents are already known.
- **Search before creating:** Search for existing components, helpers, or module functions before writing new ones. Reuse what exists (e.g., `shadcn/ui` primitives, shared forms/buttons, `src/lib/` helpers) instead of duplicating code in the frontend or backend.
- **Plan scope first:** Briefly identify which files need to be created or modified before implementing.
- **Minimal footprint:** Make the smallest changes required to complete the task. Only create files a feature actually needs, and avoid unnecessary abstractions, extra dependencies, or unrelated refactoring.

### Verification (Lint, Test & Build)
- **Verify after changes:** Run relevant lint, test, and build checks after making changes whenever available.
- **Scope checks appropriately:** Prefer targeted checks for small changes, and run a production build when changes affect critical functionality, routing, configuration, or application structure.
- **Fix only what you broke:** Fix all errors introduced by your changes, but do not modify unrelated code to fix pre-existing errors.
- **Honest reporting:** Never claim that code works or has been tested without actually running the checks. Report exact verification results and any remaining issues honestly.
