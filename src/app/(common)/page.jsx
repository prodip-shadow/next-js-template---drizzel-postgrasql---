import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  Newspaper,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const RESOURCE_CARDS = [
  {
    title: "Documentation",
    description:
      "Explore comprehensive guides covering the App Router, Server Actions, data fetching, and rendering.",
    href: "https://nextjs.org/docs",
    icon: BookOpen,
  },
  {
    title: "Next.js Learn",
    description:
      "Follow interactive tutorials to master full-stack React patterns, routing, and performance.",
    href: "https://nextjs.org/learn",
    icon: GraduationCap,
  },
  {
    title: "Templates",
    description:
      "Start faster with curated starter kits and reference architectures built for Next.js.",
    href: "https://vercel.com/templates?framework=next.js",
    icon: LayoutGrid,
  },
  {
    title: "Next.js Blog",
    description:
      "Read official release notes, framework updates, and engineering deep-dives from the team.",
    href: "https://nextjs.org/blog",
    icon: Newspaper,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 sm:px-8 lg:py-12">
      <div className="w-full max-w-[960px]">
        <Card className="grid grid-cols-1 gap-0 py-0 shadow-xs lg:grid-cols-12">
          <div className="flex flex-col justify-between p-8 sm:p-10 lg:col-span-7 lg:p-12">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-card-foreground sm:text-3xl">
                Let&apos;s get started
              </h1>
              <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                This application is powered by Next.js App Router, React Server
                Actions, and Drizzle ORM. Explore the ecosystem resources below
                to start building.
              </p>

              <ul className="mt-6 space-y-3 border-s border-border ps-4">
                <li className="text-sm leading-relaxed text-card-foreground">
                  <span className="text-muted-foreground">Read the </span>
                  <a
                    href="https://nextjs.org/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                  >
                    Documentation
                    <ArrowUpRight className="size-4 stroke-[1.5]" />
                  </a>
                </li>
                <li className="text-sm leading-relaxed text-card-foreground">
                  <span className="text-muted-foreground">Watch tutorials at </span>
                  <a
                    href="https://nextjs.org/learn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                  >
                    Next.js Learn
                    <ArrowUpRight className="size-4 stroke-[1.5]" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "px-4"
                )}
              >
                Deploy now
              </a>
              <a
                href="https://github.com/vercel/next.js"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "default" }),
                  "text-muted-foreground hover:text-foreground"
                )}
              >
                GitHub
                <ArrowUpRight className="size-4 stroke-[1.5]" />
              </a>
            </div>
          </div>

          <div className="relative flex min-h-[260px] flex-col items-center justify-center border-t border-border bg-muted/40 p-10 lg:col-span-5 lg:border-s lg:border-t-0">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"
            />
            <div className="relative flex flex-col items-center text-center">
              <div className="flex size-24 items-center justify-center rounded-2xl border border-border bg-card p-4 shadow-xs">
                <BrandLogo
                  size={56}
                  alt="Next.js official mark"
                  className="h-14 w-14"
                  priority
                />
              </div>
              <span className="mt-4 text-lg font-medium tracking-tight text-foreground">
                Next.js
              </span>
              <Badge variant="outline" className="mt-1.5 font-mono">
                App Router
              </Badge>
            </div>
          </div>
        </Card>

        <section
          aria-label="Next.js ecosystem resources"
          className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {RESOURCE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.title}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full py-0 transition-colors group-hover:bg-muted/30 group-hover:ring-foreground/25">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-foreground transition-colors group-hover:bg-card">
                      <Icon className="size-5 stroke-[1.5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-base font-medium text-card-foreground">
                          {card.title}
                        </h2>
                        <ArrowUpRight className="size-4 shrink-0 stroke-[1.5] text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </section>
      </div>
    </div>
  );
}
