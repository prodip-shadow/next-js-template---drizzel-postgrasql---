import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Card, CardContent } from "@/components/ui/card";

export function AuthShell({ title, description, children }) {
  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-6 flex flex-col items-center text-center">
        <Link
          href="/"
          aria-label="Home"
          className="mb-4 inline-flex items-center justify-center rounded-xl border border-border bg-card p-2.5 shadow-xs"
        >
          <BrandLogo size={36} className="h-9 w-9" priority />
        </Link>
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <Card className="py-0 shadow-xs">
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </div>
  );
}
