"use client";

import { useState, useTransition } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useDashboard } from "@/components/dashboard/dashboard-shell";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { updateUserSettingsAction } from "@/modules/users/users.actions";

const APPEARANCE_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function AppearanceSettingsForm() {
  const { settings } = useDashboard();
  const { theme, setTheme } = useTheme();
  const [selected, setSelected] = useState(theme || settings?.theme || "system");
  const [isPending, startTransition] = useTransition();

  function handleSelect(values) {
    const nextTheme = values?.[0];
    if (!nextTheme || nextTheme === selected) return;

    setSelected(nextTheme);
    setTheme(nextTheme);

    startTransition(async () => {
      const res = await updateUserSettingsAction({ theme: nextTheme });
      if (res.success) {
        toast.success("Appearance updated.");
      } else {
        toast.error(res.message || "Unable to update appearance.");
      }
    });
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-medium text-foreground">
          Appearance settings
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the appearance settings for your account
        </p>
      </div>

      <ToggleGroup
        value={[selected]}
        onValueChange={handleSelect}
        spacing={1}
        aria-label="Appearance theme"
        className="rounded-lg border border-border bg-muted p-1"
      >
        {APPEARANCE_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              disabled={isPending}
              className="gap-2 rounded-md px-3.5 text-sm text-muted-foreground hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-xs"
            >
              <Icon className="size-4 stroke-[1.5]" />
              <span>{option.label}</span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </section>
  );
}
