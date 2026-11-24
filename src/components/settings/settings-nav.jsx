"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SETTINGS_ITEMS = [
  { label: "Profile", href: "/dashboard/settings/profile" },
  { label: "Security", href: "/dashboard/settings/security" },
  { label: "Appearance", href: "/dashboard/settings/appearance" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-48">
      <nav aria-label="Settings" className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
        {SETTINGS_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({
                  variant: active ? "secondary" : "ghost",
                  size: "default",
                }),
                "justify-start",
                !active && "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
