import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-foreground">
      <div className="absolute start-6 top-6">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "border-border bg-card px-3 text-xs font-medium text-foreground shadow-xs hover:bg-muted"
          )}
        >
          <ArrowLeft className="size-3.5 stroke-[1.5]" />
          <span>Home</span>
        </Link>
      </div>
      <div className="absolute end-6 top-6">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
