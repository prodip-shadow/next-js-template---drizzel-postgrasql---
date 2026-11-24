import Image from "next/image";
import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

export function BrandLogo({
  size = 32,
  alt = APP_CONFIG.name,
  className,
  priority = false,
}) {
  const fixedStyle = { width: `${size}px`, height: `${size}px` };

  return (
    <>
      <Image
        src="/logo/nextjs-icon.png"
        alt={alt}
        width={size}
        height={size}
        style={fixedStyle}
        className={cn("block shrink-0 object-contain dark:hidden", className)}
        priority={priority}
      />
      <Image
        src="/logo/nextjs-icon-white.png"
        alt={alt}
        width={size}
        height={size}
        style={fixedStyle}
        className={cn("hidden shrink-0 object-contain dark:block", className)}
        priority={priority}
      />
    </>
  );
}
