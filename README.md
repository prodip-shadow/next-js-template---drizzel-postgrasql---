<div align="center">

<a href="https://nextjs.org">
  <img src="https://i.ibb.co.com/cXpbr7vp/nextdotjs-wordmark-light.jpg" alt="Next.js Logo" height="64" />
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
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started (Step-by-Step)](#-getting-started-step-by-step)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [4-Layer Module Architecture](#-4-layer-module-architecture)
- [Authentication & 2FA Guide](#-authentication--2fa-guide)
- [UI & Component Conventions](#-ui--component-conventions)
- [Available Scripts](#-available-scripts)
- [Deployment](#-deployment)

---

## Screenshots

### 1. Homepage
Public landing page with sticky navbar, theme toggle, hero section, and ecosystem resource cards.

![Homepage](https://i.ibb.co.com/ns50wDBS/2026-11-24-185927-hyprshot.png)

### 2. Dashboard Page
Authenticated dashboard with collapsible sidebar (`SidebarProvider`), user dropdown menu, and theme switcher.

![Dashboard Page](https://i.ibb.co.com/hJtT5VwT/2026-11-24-190120-hyprshot.png)

### 3. User Settings Page
Profile management, avatar upload, password confirmation gate, 2FA setup, appearance preferences, and account deletion.

![User Settings Page](https://i.ibb.co.com/Z6SGHqQL/2026-11-24-190135-hyprshot.png)

---

## Key Features

- **Authentication & Sessions**
  - Sign up, login, logout, and secure `HttpOnly` session cookies (`7 days` default).
  - Built-in rate limiting on login attempts ([`src/lib/config.js`](src/lib/config.js)).
  - Optional email verification toggle (`AUTH_CONFIG.requireEmailVerification`).
- **Two-Factor Authentication (2FA)**
  - RFC 6238 **TOTP** implementation using Node.js `crypto` (works offline with Google Authenticator, Authy, Microsoft Authenticator, 1Password, etc.).
  - 8 one-time hashed recovery codes generated on enable.
  - Password confirmation gate before accessing sensitive security settings.
- **User & Account Settings**
  - Update name & email, upload/remove profile photo (Cloudinary or local `public/uploads` fallback).
  - Change password and delete account with confirmation dialog.
  - Persistent theme preference (`Light`, `Dark`, `System`) synced with `next-themes`.
- **Clean 4-Layer Architecture (Non-REST)**
  - Uses React Server Actions instead of boilerplate REST routes:
    `Validation (Zod) -> Repository (Drizzle) -> Service (Business Logic) -> Server Actions`.
- **Modern UI with shadcn/ui**
  - Built with `base-mira` style (`@base-ui/react`), `lucide-react` icons, `sonner` toasts, `<Spinner />` action loaders, `<Skeleton />` route placeholders, and `rtl: true` logical CSS properties.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack, React Compiler, `cacheComponents`) |
| **Language** | JavaScript (ES6+) & JSX (`.js`, `.jsx`) |
| **UI & Styling** | React 19, Tailwind CSS v4, shadcn/ui (`base-mira` / `@base-ui/react`), `lucide-react` |
| **Database** | Neon PostgreSQL + Drizzle ORM |
| **Validation** | Zod |
| **Email** | Resend HTTP API (falls back to console log in dev if key is omitted) |
| **Media Storage** | Cloudinary (falls back to local `public/uploads/` if keys are omitted) |
| **Package Manager** | Bun (compatible with npm/pnpm/yarn) |

---

## Getting Started (Step-by-Step)

Follow these steps to run the project locally:

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd scout-website
```

### Step 2: Install Dependencies
```bash
bun install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Neon PostgreSQL URLs and app name:
```bash
cp .env.example .env
```

### Step 4: Push Database Schema
Push the Drizzle schema (`users`, `notifications`, etc.) to your Neon PostgreSQL database:
```bash
bun run db:push
```

### Step 5: (Optional) Seed Demo Data
Create a demo user (`test1@gmail.com` / `password`) to test login right away:
```bash
bun run db:seed
```

### Step 6: Start the Development Server
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

All supported variables are listed in [`.env.example`](.env.example).

| Variable | Required | Description |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_APP_NAME` | No | App name displayed in Navbar, Sidebar, and Authenticator apps (2FA issuer). |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL of your app (e.g. `http://localhost:3000`). |
| `DATABASE_URL` | Yes | Direct Neon PostgreSQL connection string (used by Drizzle Kit). |
| `DATABASE_URL_POOLED` | Yes | Pooled Neon PostgreSQL connection string (used by Drizzle ORM at runtime). |
| `RESEND_API_KEY` | No | Resend API key for sending emails. If omitted, emails are skipped safely. |
| `EMAIL_FROM` | No | Sender address (e.g. `My App <noreply@yourdomain.com>`). |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name. If omitted, uploads save locally to `public/uploads/`. |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret. |
| `CLOUDINARY_FOLDER` | No | Folder prefix in Cloudinary (e.g. `my-app`). |

---

## Project Structure

<details>
<summary>Click to expand full directory structure</summary>

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

## 4-Layer Module Architecture

Every business feature in `src/modules/<feature>/` follows a strict 4-layer separation:

1. **`<feature>.validation.js`** — Pure Zod schemas for input validation.
2. **`<feature>.repository.js`** — Pure Drizzle ORM queries (`select`, `insert`, `update`, `delete`). No auth or business logic.
3. **`<feature>.service.js`** — Core business rules, Zod parsing, ownership/role checks, and coordination with `src/services/`.
4. **`<feature>.actions.js`** — `"use server";` entry points called by Client Components. Resolves server-side session identity, invokes the Service, revalidates paths, and returns `{ success, data }` or `{ success, message }`.

### Data Flow
- **Write:** `Client Component -> Server Action -> Service -> Validation + Repository -> Database`
- **Read:** `Server Component -> Service -> Repository -> Database`

<details>
<summary>How to add a new feature module (Example)</summary>

1. Create a schema in `src/db/schema/posts.js` and export it in `src/db/schema/index.js`.
2. Push schema changes with `bun run db:push`.
3. Create `src/modules/posts/`:
   - `posts.validation.js` (Zod schemas)
   - `posts.repository.js` (Drizzle queries)
   - `posts.service.js` (validation + ownership checks)
   - `posts.actions.js` (`"use server"` actions calling `requireAuth()` + service)
4. Build your UI in `src/app/(dashboard)/dashboard/posts/page.jsx` using shadcn/ui components.

</details>

---

## Authentication & 2FA Guide

- **Email Verification:** Controlled by `AUTH_CONFIG.requireEmailVerification` in [`src/lib/config.js`](src/lib/config.js). Set to `true` to require email verification before login (requires `RESEND_API_KEY` for real emails).
- **Enabling 2FA:**
  1. Go to **Dashboard → Settings → Security** (`/dashboard/settings/security`).
  2. Confirm your current password in the security dialog.
  3. Click **Enable 2FA** to generate your **Authenticator setup key**.
  4. Copy the key into any TOTP app (Google Authenticator, Authy, Microsoft Authenticator, etc.).
  5. Enter the 6-digit code shown in your app and click **Verify & Enable**.
  6. Save the **8 recovery codes** in a safe place.
- **Disabling & Re-enabling 2FA:** Disabling 2FA clears the old secret. Re-enabling later generates a fresh setup key.

---

## UI & Component Conventions

- **shadcn/ui (`base-mira`):** Add new components anytime using:
  ```bash
  bunx shadcn@latest add <component-name>
  ```
- **Loading States:**
  - Use `<Spinner />` ([`src/components/ui/spinner.jsx`](src/components/ui/spinner.jsx)) inside buttons and action triggers instead of plain `"Loading..."` text.
  - Use `<Skeleton />` ([`src/components/ui/skeleton.jsx`](src/components/ui/skeleton.jsx)) for card and page-level `loading.jsx` states.
- **RTL Ready:** Configured with `rtl: true` in `components.json` — prefer Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`).
- **Form Reset:** Auth and security forms automatically reset their state on successful submission and navigation.

---

## Available Scripts

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

---

## Deployment

1. Set all required environment variables (`NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, `DATABASE_URL_POOLED`, and optionally `RESEND_API_KEY` + `CLOUDINARY_*`) in your hosting provider (e.g., **Vercel**).
2. Run database migrations/push against your production Neon database:
   ```bash
   bun run db:push
   ```
3. Build and start:
   ```bash
   bun run build && bun run start
   ```
