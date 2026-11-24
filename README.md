<div align="center">

<a href="https://nextjs.org">
  <img src="https://i.ibb.co.com/ynNr6Zph/2026-11-24-191308-hyprshot.png" alt="Next.js Template Logo" height="72" />
</a>

# Next.js Template

A clean, production-ready **Next.js 16 (App Router)** full-stack starter template built with **JavaScript (ES6+/JSX)**, **shadcn/ui**, **Tailwind CSS v4**, **Drizzle ORM**, **Neon PostgreSQL**, and **Zod** — featuring a strict 4-layer modular backend architecture, authentication, TOTP Two-Factor Authentication (2FA), and user settings out of the box.

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.3-149eca?style=flat-square&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-c5f74f?style=flat-square)](https://orm.drizzle.team)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-base--mira-18181b?style=flat-square)](https://ui.shadcn.com)

</div>

---

## Table of Contents

- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Getting Started (Step-by-Step)](#-getting-started-step-by-step)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Built-in Functionalities & How to Use Them](#-built-in-functionalities--how-to-use-them)
- [How to Start Coding (Developer Guide)](#-how-to-start-coding-developer-guide)
- [Available Scripts](#-available-scripts)
- [Deployment](#-deployment)

---

## Screenshots

### 1. Homepage
Public landing page with sticky navbar, theme toggle, hero section, and ecosystem resource cards.

![Homepage](https://i.ibb.co.com/ns50wDBS/2026-11-24-185927-hyprshot.png)

### 2. Dashboard Page
Authenticated dashboard with collapsible sidebar, user dropdown menu, and theme switcher.

![Dashboard Page](https://i.ibb.co.com/hJtT5VwT/2026-11-24-190120-hyprshot.png)

### 3. User Settings Page
Profile management, avatar upload, password confirmation gate, 2FA setup, appearance preferences, and account deletion.

![User Settings Page](https://i.ibb.co.com/Z6SGHqQL/2026-11-24-190135-hyprshot.png)

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack, React Compiler, `cacheComponents`) |
| **Language** | JavaScript (ES6+) & JSX (`.js`, `.jsx` — no TypeScript) |
| **UI & Styling** | React 19, Tailwind CSS v4, shadcn/ui (`base-mira` / `@base-ui/react`), `lucide-react` |
| **Database** | Neon PostgreSQL + Drizzle ORM |
| **Validation** | Zod |
| **Email** | Resend HTTP API (safe console fallback when API key is omitted) |
| **Media Storage** | Cloudinary (automatic local `public/uploads/` fallback when keys are omitted) |
| **Package Manager** | Bun (compatible with npm/pnpm/yarn) |

---

## Getting Started (Step-by-Step)

Click each step below to expand and follow along:

<details>
<summary><strong>Step 1: Clone the repository & install dependencies</strong></summary>

```bash
git clone <your-repo-url> template
cd template
bun install
```

</details>

<details>
<summary><strong>Step 2: Configure your environment variables (.env)</strong></summary>

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in at least `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, and `DATABASE_URL_POOLED` (from your Neon PostgreSQL dashboard).

</details>

<details>
<summary><strong>Step 3: Push database schema & seed demo user</strong></summary>

Push the Drizzle schema to your PostgreSQL database:

```bash
bun run db:push
```

*(Optional)* Seed a demo account (`test1@gmail.com` / `password`) to test login immediately:

```bash
bun run db:seed
```

</details>

<details>
<summary><strong>Step 4: Run the development server</strong></summary>

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

</details>

---

## Environment Variables

<details>
<summary><strong>Click to view all .env variables and what they do</strong></summary>

| Variable | Required | Description |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_APP_NAME` | No | App name displayed in Navbar, Sidebar, and Authenticator apps (2FA issuer). |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL of your app (e.g. `http://localhost:3000`). |
| `DATABASE_URL` | Yes | Direct Neon PostgreSQL connection string (used by Drizzle Kit). |
| `DATABASE_URL_POOLED` | Yes | Pooled Neon PostgreSQL connection string (used by Drizzle ORM at runtime). |
| `RESEND_API_KEY` | No | Resend API key for sending emails. If omitted, emails are skipped safely. |
| `EMAIL_FROM` | No | Sender address (e.g. `Template <noreply@yourdomain.com>`). |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name. If omitted, uploads save locally to `public/uploads/`. |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret. |
| `CLOUDINARY_FOLDER` | No | Folder prefix in Cloudinary (e.g. `template`). |

</details>

---

## Project Structure

<details>
<summary><strong>Click to expand full directory structure</strong></summary>

```text
├── components.json              # shadcn/ui config (base-mira, rtl: true, tsx: false)
├── drizzle.config.js            # Drizzle Kit configuration
├── next.config.mjs              # Next.js config (cacheComponents, reactCompiler, Turbopack)
├── .env.example                 # Environment variable template
└── src/
    ├── app/                     # Next.js App Router (routes, layouts, loading boundaries)
    │   ├── (auth)/              # /login, /sign-up + auth layout & loading
    │   ├── (common)/            # Public landing page (/) + common layout & loading
    │   ├── (dashboard)/         # Protected /dashboard & /dashboard/settings/*
    │   ├── globals.css          # Tailwind v4 theme tokens & CSS variables
    │   └── layout.jsx           # Root layout (fonts, ThemeProvider, Toaster)
    ├── components/
    │   ├── ui/                  # shadcn/ui primitives (Button, Card, Dialog, Sidebar, etc.)
    │   ├── shared/              # Navbar, Footer, BrandLogo, ThemeToggle, ThemeProvider
    │   ├── auth/                # AuthShell, LoginForm, SignUpForm, PasswordInput
    │   ├── dashboard/           # DashboardShell, DashboardUserMenu
    │   └── settings/            # SettingsNav, Profile/Security/Appearance forms
    ├── db/
    │   ├── drizzle.js           # Centralized Neon + Drizzle client
    │   ├── seed.js              # Database seeder
    │   ├── test.js              # Database connection test
    │   └── schema/              # Drizzle table schemas (users, notifications, index)
    ├── hooks/
    │   └── use-mobile.js        # Responsive mobile breakpoint hook (< 768px)
    ├── lib/
    │   ├── auth-guard.js        # Server-side session & password-confirmation guards
    │   ├── config.js            # Central app, auth, rate-limit, and storage config
    │   ├── crypto.js            # Password hashing, TOTP 2FA, and recovery code helpers
    │   ├── errors.js            # Safe error classes & client-facing error mapper
    │   ├── logger.js            # Structured logger with automatic secret redaction
    │   ├── response.js          # Standardized { success, data, message } helpers
    │   └── utils.js             # cn() class-merging utility
    ├── modules/                 # 4-layer feature modules
    │   ├── auth/
    │   ├── notifications/
    │   └── users/
    └── services/                # Third-party integrations
        ├── email/               # Resend email helper
        └── storage/             # Cloudinary & local file storage helper
```

</details>

---

## Built-in Functionalities & How to Use Them

Expand any section below to understand what is already built and how to use or customize it:

<details>
<summary><strong>1. Authentication & Session Guard</strong></summary>

- **What it does:** Handles registration, login, logout, password reset, and `HttpOnly` cookie sessions (`7 days` by default).
- **Where it lives:** `src/modules/auth/`, `src/lib/auth-guard.js`, `src/app/(auth)/`.
- **How to use it in your own pages/actions:**
  - In a **Server Component**, call `const user = await getCurrentUser()` or `await getCurrentSession()` from `@/lib/auth-guard`.
  - In a **Server Action**, call `const user = await requireAuth()` from `@/lib/auth-guard` to get the authenticated user's ID safely (never trust client-sent `userId`).

</details>

<details>
<summary><strong>2. Two-Factor Authentication (TOTP 2FA) & Recovery Codes</strong></summary>

- **What it does:** Uses RFC 6238 TOTP (`src/lib/crypto.js`) so users can enable 2FA with Google Authenticator, Authy, Microsoft Authenticator, etc. Works completely offline on the phone once the setup key is added.
- **Where it lives:** `src/lib/crypto.js`, `src/modules/auth/auth.service.js`, `src/components/settings/security-settings-form.jsx`.
- **How to use it:**
  - Go to **Dashboard → Settings → Security** (`/dashboard/settings/security`).
  - Confirm your password in the security dialog.
  - Click **Enable 2FA**, copy the setup key into your authenticator app, enter the 6-digit code, and save the 8 backup recovery codes.
  - Disabling and re-enabling 2FA automatically generates a fresh secret key.

</details>

<details>
<summary><strong>3. Email Verification & Resend Integration</strong></summary>

- **What it does:** Sends transactional emails (verification, password reset) via Resend. If `RESEND_API_KEY` is not set, it safely skips delivery without crashing.
- **Where it lives:** `src/services/email/email.js`, `src/lib/config.js`.
- **How to configure:**
  - Toggle `AUTH_CONFIG.requireEmailVerification` (`true` / `false`) in `src/lib/config.js`.
  - Add `RESEND_API_KEY` and `EMAIL_FROM` in `.env` when ready to send real emails.
  - Call `sendEmail({ to, subject, html, text })` from `@/services/email/email` in any service.

</details>

<details>
<summary><strong>4. Profile Photo & File Storage (Cloudinary + Local Fallback)</strong></summary>

- **What it does:** Validates file type/size (`JPG`, `PNG`, `WebP`, max `2MB`) and uploads images to Cloudinary when credentials exist, or falls back to `public/uploads/` locally.
- **Where it lives:** `src/services/storage/storage.js`, `src/lib/config.js` (`STORAGE_CONFIG`).
- **How to use:**
  - Configure `CLOUDINARY_*` in `.env` for cloud storage, or leave empty for local uploads during development.
  - Use `uploadImageFile(file, folder)` and `deleteStoredFile(url)` from `@/services/storage/storage` inside your service layer.

</details>

<details>
<summary><strong>5. User Settings (Profile, Security, Appearance, Delete Account)</strong></summary>

- **What it does:** Complete account management — update name/email, upload/remove avatar, change password, manage 2FA, switch theme (`Light` / `Dark` / `System`), and permanently delete account.
- **Where it lives:** `src/app/(dashboard)/dashboard/settings/`, `src/components/settings/`, `src/modules/users/`.

</details>

<details>
<summary><strong>6. Rate Limiting, Safe Errors & Redacted Logging</strong></summary>

- **Rate Limiting:** Configured in `RATE_LIMIT_CONFIG` (`src/lib/config.js` — `5` login attempts per `15 minutes`).
- **Safe Error Handling:** `getSafeErrorMessage(error)` in `src/lib/errors.js` converts Zod and App errors into safe client messages without leaking SQL or stack traces.
- **Logger:** `logger` in `src/lib/logger.js` automatically redacts sensitive fields (`password`, `token`, `secret`, `email`, `apiKey`, etc.) before printing JSON logs.

</details>

<details>
<summary><strong>7. Notifications Module (Ready-to-Use Example)</strong></summary>

- **What it does:** A complete 4-layer module (`src/modules/notifications/`) + Drizzle schema (`src/db/schema/notifications.js`) ready for creating, listing, and marking user notifications as read.

</details>

---

## How to Start Coding (Developer Guide)

Follow these expandable guides to start building your own features cleanly inside this template:

<details>
<summary><strong>Where to start customizing first</strong></summary>

1. **App Name & Branding:** Set `NEXT_PUBLIC_APP_NAME` in `.env`, and replace the logo images in `public/logo/` (`nextjs-icon.png` and `nextjs-icon-white.png`).
2. **Homepage:** Edit `src/app/(common)/page.jsx` for your landing page, and `src/components/shared/navbar.jsx` / `footer.jsx` for navigation links.
3. **Dashboard Home:** Edit `src/app/(dashboard)/dashboard/page.jsx` to replace the placeholder cards with your real widgets.
4. **Sidebar Links:** Add your new dashboard routes to `PLATFORM_NAV` in `src/components/dashboard/dashboard-shell.jsx`.

</details>

<details>
<summary><strong>How to add a new feature (Step-by-Step 4-Layer Guide)</strong></summary>

This template uses a **4-layer function-call architecture** (no REST API routes needed for internal app features):

`Client Component -> Server Action -> Service -> Validation (Zod) + Repository (Drizzle) -> Database`

1. **Database Schema (`src/db/schema/<feature>.js`):**
   - Define your Drizzle table and export it from `src/db/schema/index.js`.
   - Run `bun run db:push` to sync with Neon PostgreSQL.
2. **Validation (`src/modules/<feature>/<feature>.validation.js`):**
   - Write pure Zod schemas (e.g., `createPostSchema`, `postIdSchema`).
3. **Repository (`src/modules/<feature>/<feature>.repository.js`):**
   - Write pure Drizzle queries using `db` from `@/db/drizzle`. Never put auth or business rules here.
4. **Service (`src/modules/<feature>/<feature>.service.js`):**
   - Parse inputs with Zod, enforce ownership/permission checks, and call the repository.
5. **Server Actions (`src/modules/<feature>/<feature>.actions.js`):**
   - Start with `"use server";`, resolve the user with `await requireAuth()`, call the service, run `revalidatePath(...)`, and return `successResponse(data)` / `errorResponse(error)`.
6. **UI Page (`src/app/(dashboard)/dashboard/<feature>/page.jsx`):**
   - Read data in a Server Component via the Service, and handle mutations from Client Components via Server Actions.

</details>

<details>
<summary><strong>How to add shadcn/ui components & loading states</strong></summary>

- **Install any shadcn/ui component:**
  ```bash
  bunx shadcn@latest add <component-name>
  ```
- **Loading States Convention:**
  - Inside buttons and action triggers, use `<Spinner />` (`@/components/ui/spinner`) instead of plain `"Loading..."` text.
  - For page/card placeholders (`loading.jsx` or `<Suspense>` fallbacks), use `<Skeleton />` (`@/components/ui/skeleton`).
- **Forms:** Wrap auth/multi-step forms cleanly so inputs and state reset on submission and navigation.
- **RTL Support:** `components.json` has `rtl: true` — use Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`) instead of `pl-`, `pr-`, `ml-`, `mr-`.

</details>

---

## Available Scripts

<details>
<summary><strong>Click to view all npm/bun scripts</strong></summary>

| Command | Description |
| :--- | :--- |
| `bun run dev` | Start the Next.js development server |
| `bun run build` | Create an optimized production build |
| `bun run start` | Start the production server |
| `bun run lint` | Run ESLint across the codebase |
| `bun run db:push` | Push Drizzle schema directly to PostgreSQL |
| `bun run db:generate` | Generate SQL migration files in `drizzle/migrations/` |
| `bun run db:migrate` | Run pending SQL migrations |
| `bun run db:studio` | Open Drizzle Studio to inspect database tables |
| `bun run db:seed` | Seed a demo user (`test1@gmail.com`) |
| `bun run db:test` | Test the PostgreSQL database connection |

</details>

---

## Deployment

<details>
<summary><strong>Click to view deployment steps (Vercel / Node.js)</strong></summary>

1. Add your environment variables (`NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, `DATABASE_URL_POOLED`, and optional `RESEND_API_KEY` / `CLOUDINARY_*`) in your hosting provider (e.g., **Vercel**).
2. Push your schema to your production Neon database:
   ```bash
   bun run db:push
   ```
3. Build and start:
   ```bash
   bun run build && bun run start
   ```

</details>
