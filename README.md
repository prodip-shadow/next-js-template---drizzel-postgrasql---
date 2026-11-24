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
- [Getting Started](#-getting-started)
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

## Getting Started

Follow these steps to run the template locally:

### 1. Create Your Project & Install Dependencies

#### Option A: Use this Template (Recommended)

1. Click **"Use this template"** → **"Create a new repository"** at the top of this GitHub repository.
2. Enter your **Repository name** and click **Create repository** — GitHub will automatically generate your new repo with this entire template.
3. Open your project locally and install dependencies:

```bash
bun install
```

#### Option B: Clone Directly

```bash
git clone <your-repo-url> template
cd template
bun install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your **Neon PostgreSQL** connection strings (`DATABASE_URL` and `DATABASE_URL_POOLED`) along with `NEXT_PUBLIC_APP_NAME` and `NEXT_PUBLIC_APP_URL`.

### 3. Push Database Schema & Seed Demo User

```bash
# Push Drizzle schema to PostgreSQL
bun run db:push

# (Optional) Seed a demo user: test1@gmail.com / password
bun run db:seed
```

### 4. Start the Development Server

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
| `EMAIL_FROM` | No | Sender address (e.g. `Template <noreply@yourdomain.com>`). |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name. If omitted, uploads save locally to `public/uploads/`. |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret. |
| `CLOUDINARY_FOLDER` | No | Folder prefix in Cloudinary (e.g. `template`). |

---

## Project Structure



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



---

## Built-in Functionalities & How to Use Them

Expand any feature below to see how it works and how to use it in your code.

<details>
<summary><strong>1. Authentication & Session Guard</strong></summary>

<br />

- **What it does:** Handles registration, login, logout, password reset, and `HttpOnly` cookie sessions (`7 days` by default).
- **Files:** `src/modules/auth/`, `src/lib/auth-guard.js`, `src/app/(auth)/`.

**Example — Protect a Server Component page:**

```jsx
// src/app/(dashboard)/dashboard/profile/page.jsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-guard";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <h1>Welcome, {user.name}</h1>;
}
```

**Example — Protect a Server Action:**

```js
// src/modules/posts/posts.actions.js
"use server";

import { requireAuth } from "@/lib/auth-guard";
import { errorResponse, successResponse } from "@/lib/response";
import { createPostService } from "./posts.service";

export async function createPostAction(input) {
  try {
    const user = await requireAuth();
    const data = await createPostService(user.id, input);
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
```

</details>

<br />

<details>
<summary><strong>2. Two-Factor Authentication (TOTP 2FA) & Recovery Codes</strong></summary>

<br />

- **What it does:** Uses RFC 6238 **TOTP** (`src/lib/crypto.js`) compatible with Google Authenticator, Authy, Microsoft Authenticator, and 1Password. Works completely offline on the user's phone once added.
- **Files:** `src/lib/crypto.js`, `src/modules/auth/auth.service.js`, `src/components/settings/security-settings-form.jsx`.

**How to use it in the UI:**
1. Go to **Dashboard → Settings → Security** (`/dashboard/settings/security`).
2. Confirm your password in the security dialog.
3. Click **Enable 2FA** to generate your **Authenticator setup key**.
4. Copy the key into your authenticator app, enter the 6-digit code, and click **Verify & Enable**.
5. Save the **8 backup recovery codes** shown on screen.

**Example — Verify a TOTP code in backend code:**

```js
// src/modules/auth/auth.service.js
import { generateTwoFactorSecret, verifyTotpCode } from "@/lib/crypto";

// Generate a new Base32 secret key
const secret = generateTwoFactorSecret();

// Verify a 6-digit code from an Authenticator app
const isValid = verifyTotpCode(secret, "123456");
```

</details>

<br />

<details>
<summary><strong>3. Email Verification & Resend Integration</strong></summary>

<br />

- **What it does:** Sends transactional emails via **Resend**. If `RESEND_API_KEY` is omitted, emails are safely skipped without crashing.
- **Files:** `src/services/email/email.js`, `src/lib/config.js`.

**Example — Enable email verification in `src/lib/config.js`:**

```js
// src/lib/config.js
export const AUTH_CONFIG = {
  requireEmailVerification: true, // Set to false to skip verification
  // ...
};
```

**Example — Send a custom email from any Service:**

```js
// src/modules/orders/orders.service.js
import { sendEmail } from "@/services/email/email";

await sendEmail({
  to: user.email,
  subject: "Order Confirmed",
  text: "Your order has been confirmed.",
  html: "<p>Your order has been confirmed.</p>",
});
```

</details>

<br />

<details>
<summary><strong>4. Image Upload & Storage (Cloudinary + Local Fallback)</strong></summary>

<br />

- **What it does:** Validates image type (`JPG`, `PNG`, `WebP`) and size (`max 2MB`), then uploads to **Cloudinary** if configured, or saves locally to `public/uploads/` if Cloudinary keys are empty.
- **Files:** `src/services/storage/storage.js`, `src/lib/config.js`.

**Example — Upload and delete images inside a Service:**

```js
// src/modules/posts/posts.service.js
import { deleteStoredFile, uploadImageFile } from "@/services/storage/storage";

// Upload an image File from FormData
const uploaded = await uploadImageFile(file, "posts");
// Returns: { url: "...", publicId: "..." }

// Delete an existing uploaded image by URL or publicId
await deleteStoredFile(existingPost.imageUrl);
```

</details>

<br />

<details>
<summary><strong>5. Rate Limiting, Safe Errors & Redacted Logging</strong></summary>

<br />

- **What it does:** Protects login endpoints against brute-force attempts, sanitizes errors before sending to the client, and automatically redacts sensitive fields (`password`, `token`, `secret`, `email`, `apiKey`, etc.) from logs.
- **Files:** `src/lib/config.js`, `src/lib/errors.js`, `src/lib/logger.js`.

**Example — Throw safe errors and log safely:**

```js
// src/modules/posts/posts.service.js
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { logger } from "@/lib/logger";

if (!post) {
  throw new NotFoundError("Post not found.");
}

if (post.userId !== userId) {
  throw new ForbiddenError("You do not have permission to edit this post.");
}

// Sensitive keys like password/token/secret are automatically replaced with [REDACTED]
logger.info("Post updated", { userId, postId: post.id });
```

</details>

<br />

<details>
<summary><strong>6. Notifications Module (Ready-to-Use Example)</strong></summary>

<br />

- **What it does:** A complete 4-layer module with Drizzle schema ready for creating, fetching, and marking user notifications as read.
- **Files:** `src/db/schema/notifications.js`, `src/modules/notifications/`.

**Example — Create a notification from any Service:**

```js
// src/modules/orders/orders.service.js
import { createNotification } from "@/modules/notifications/notifications.repository";

await createNotification({
  userId: user.id,
  type: "system",
  title: "Welcome!",
  message: "Your account is ready to use.",
});
```

</details>

---

## How to Start Coding (Developer Guide)

Expand each step below to see exactly where to edit and how to build new features cleanly.

<details>
<summary><strong>Step 1: Customize Branding, Homepage & Sidebar Links</strong></summary>

<br />

1. **App Name:** Update `NEXT_PUBLIC_APP_NAME` in `.env`.
2. **Logo:** Replace `public/logo/nextjs-icon.png` (light mode) and `public/logo/nextjs-icon-white.png` (dark mode).
3. **Add a Sidebar Link in `src/components/dashboard/dashboard-shell.jsx`:**

```jsx
// src/components/dashboard/dashboard-shell.jsx
import { FileText, LayoutGrid } from "lucide-react";

const PLATFORM_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Posts", href: "/dashboard/posts", icon: FileText },
];
```

</details>

<br />

<details>
<summary><strong>Step 2: Create a Database Schema with Drizzle ORM</strong></summary>

<br />

Create a new table file inside `src/db/schema/` and re-export it from `src/db/schema/index.js`.

```js
// src/db/schema/posts.js
import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

```js
// src/db/schema/index.js
export * from "./users";
export * from "./notifications";
export * from "./posts";
```

Push the new table to Neon PostgreSQL:

```bash
bun run db:push
```

</details>

<br />

<details>
<summary><strong>Step 3: Build a 4-Layer Feature Module</strong></summary>

<br />

Every feature in `src/modules/<feature>/` follows this flow:
`Client Component -> Server Action -> Service -> Validation (Zod) + Repository (Drizzle) -> Database`

**A. Validation (`src/modules/posts/posts.validation.js`):**

```js
// src/modules/posts/posts.validation.js
import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
});
```

**B. Repository (`src/modules/posts/posts.repository.js`):**

```js
// src/modules/posts/posts.repository.js
import { db } from "@/db/drizzle";
import { posts } from "@/db/schema";

export async function createPost(data) {
  const [post] = await db.insert(posts).values(data).returning();
  return post;
}
```

**C. Service (`src/modules/posts/posts.service.js`):**

```js
// src/modules/posts/posts.service.js
import * as repository from "./posts.repository";
import { createPostSchema } from "./posts.validation";

export async function createPostService(userId, input) {
  const data = createPostSchema.parse(input);
  return repository.createPost({ ...data, userId });
}
```

**D. Server Action (`src/modules/posts/posts.actions.js`):**

```js
// src/modules/posts/posts.actions.js
"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { errorResponse, successResponse } from "@/lib/response";
import { createPostService } from "./posts.service";

export async function createPostAction(input) {
  try {
    const user = await requireAuth();
    const post = await createPostService(user.id, input);
    revalidatePath("/dashboard/posts");
    return successResponse(post);
  } catch (error) {
    return errorResponse(error);
  }
}
```

</details>

<br />

<details>
<summary><strong>Step 4: Build the UI Page with shadcn/ui & Loading States</strong></summary>

<br />

Install any extra shadcn/ui component you need:

```bash
bunx shadcn@latest add table select
```

**Example — Client Form with `<Spinner />` and `toast`:**

```jsx
// src/components/posts/create-post-form.jsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { createPostAction } from "@/modules/posts/posts.actions";

export function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createPostAction({ title });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      setTitle("");
      toast.success("Post created!");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="post-title">Title</Label>
        <Input
          id="post-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
          required
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? <Spinner /> : null}
        Create post
      </Button>
    </form>
  );
}
```

**Example — Route Loading Page with `<Skeleton />`:**

```jsx
// src/app/(dashboard)/dashboard/posts/loading.jsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostsLoading() {
  return (
    <Card className="p-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-28" />
      </div>
    </Card>
  );
}
```

</details>

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

1. Add your environment variables (`NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, `DATABASE_URL_POOLED`, and optional `RESEND_API_KEY` / `CLOUDINARY_*`) in your hosting provider (e.g., **Vercel**).
2. Push your schema to your production Neon database:
   ```bash
   bun run db:push
   ```
3. Build and start:
   ```bash
   bun run build && bun run start
   ```
