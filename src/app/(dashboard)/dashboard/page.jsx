import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card className="relative aspect-video py-0">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[repeating-linear-gradient(135deg,var(--border)_0px,var(--border)_1px,transparent_1px,transparent_10px)] opacity-60"
          />
        </Card>
        <Card className="relative aspect-video py-0">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[repeating-linear-gradient(135deg,var(--border)_0px,var(--border)_1px,transparent_1px,transparent_10px)] opacity-60"
          />
        </Card>
        <Card className="relative aspect-video py-0">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[repeating-linear-gradient(135deg,var(--border)_0px,var(--border)_1px,transparent_1px,transparent_10px)] opacity-60"
          />
        </Card>
      </div>

      <Card className="relative min-h-[360px] flex-1 py-0">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-linear-gradient(135deg,var(--border)_0px,var(--border)_1px,transparent_1px,transparent_10px)] opacity-60"
        />
      </Card>
    </div>
  );
}
