import { Suspense } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth-guard";
import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Docs", href: "https://nextjs.org/docs" },
  { label: "Learn", href: "https://nextjs.org/learn" },
  {
    label: "Templates",
    href: "https://vercel.com/templates?framework=next.js",
  },
];

async function NavbarAuthActions() {
  const user = await getCurrentUser().catch(() => null);

  if (user) {
    return (
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ variant: "outline", size: "default" }), "px-4")}
      >
        Dashboard
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost", size: "default" }),
          "text-muted-foreground hover:text-foreground"
        )}
      >
        Log in
      </Link>
      <Link
        href="/sign-up"
        className={cn(buttonVariants({ variant: "default", size: "default" }), "px-4")}
      >
        Register
      </Link>
    </>
  );
}

function NavbarAuthFallback() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-9 w-16" />
      <Skeleton className="h-9 w-22" />
    </div>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-[960px] items-center justify-between px-6 sm:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-sm font-medium text-foreground transition-opacity hover:opacity-85"
          >
            <BrandLogo size={24} alt={APP_CONFIG.name} priority />
            <span>{APP_CONFIG.name}</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-5 sm:flex">
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <nav aria-label="Account" className="flex items-center gap-2">
          <ThemeToggle />
          <Suspense fallback={<NavbarAuthFallback />}>
            <NavbarAuthActions />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
