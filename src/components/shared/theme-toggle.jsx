"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  function handleToggle() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleToggle}
              aria-label="Toggle theme"
              className="relative border-border bg-card text-foreground shadow-xs hover:bg-muted"
            />
          }
        >
          <Sun className="size-[18px] stroke-[1.5] scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-[18px] stroke-[1.5] scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
        </TooltipTrigger>
        <TooltipContent>Toggle theme</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
