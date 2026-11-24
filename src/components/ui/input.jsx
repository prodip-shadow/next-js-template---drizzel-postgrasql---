import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground shadow-xs transition-[color,box-shadow,border-color] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  );
}

export { Input };
