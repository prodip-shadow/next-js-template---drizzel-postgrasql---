import { SettingsNav } from "@/components/settings/settings-nav";

export default function SettingsLayout({ children }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile and account settings
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <SettingsNav />
        <div className="w-full max-w-xl flex-1">{children}</div>
      </div>
    </div>
  );
}
