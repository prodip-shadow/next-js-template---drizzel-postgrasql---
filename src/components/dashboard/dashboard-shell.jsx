"use client";

import { createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FolderGit2, LayoutGrid } from "lucide-react";
import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { APP_CONFIG } from "@/lib/config";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const DashboardContext = createContext(null);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardShell.");
  }
  return context;
}

const PLATFORM_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
];

const EXTERNAL_LINKS = [
  {
    label: "Repository",
    href: "https://github.com/vercel/next.js",
    icon: FolderGit2,
  },
  {
    label: "Documentation",
    href: "https://nextjs.org/docs",
    icon: BookOpen,
  },
];

function getPageTitle(pathname) {
  if (pathname?.startsWith("/dashboard/settings/security")) return "Security settings";
  if (pathname?.startsWith("/dashboard/settings/appearance")) return "Appearance settings";
  if (pathname?.startsWith("/dashboard/settings")) return "Profile settings";
  return "Dashboard";
}

export function DashboardShell({
  user,
  settings,
  isPasswordConfirmed,
  children,
}) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <DashboardContext.Provider
      value={{ user, settings, isPasswordConfirmed }}
    >
      <TooltipProvider delay={0}>
        <SidebarProvider>
          <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={APP_CONFIG.name}
                    render={<Link href="/" />}
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg border border-sidebar-border bg-card">
                      <BrandLogo size={20} alt={APP_CONFIG.name} priority />
                    </div>
                    <div className="grid flex-1 text-start text-sm leading-tight">
                      <span className="truncate font-medium">{APP_CONFIG.name}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                  {PLATFORM_NAV.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={pathname === item.href}
                          tooltip={item.label}
                          render={<Link href={item.href} />}
                          className="text-sm [&_svg]:size-[18px]"
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <SidebarMenu>
                {EXTERNAL_LINKS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        className="text-sm [&_svg]:size-[18px]"
                        render={
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>

              <DashboardUserMenu user={user} />
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="md:border md:border-border">
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="size-8 [&_svg]:size-[18px]" />
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm font-medium text-foreground">
                  {pageTitle}
                </span>
              </div>

              <ThemeToggle />
            </header>

            <div className="flex flex-1 flex-col p-4 sm:p-6">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </DashboardContext.Provider>
  );
}
