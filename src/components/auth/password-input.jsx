"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordInput({ className, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pe-10", className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute top-1/2 end-1 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
      >
        {visible ? (
          <EyeOff className="size-4 stroke-[1.5]" />
        ) : (
          <Eye className="size-4 stroke-[1.5]" />
        )}
      </Button>
    </div>
  );
}
