import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card className="aspect-video p-0">
          <Skeleton className="h-full w-full rounded-none" />
        </Card>
        <Card className="aspect-video p-0">
          <Skeleton className="h-full w-full rounded-none" />
        </Card>
        <Card className="aspect-video p-0">
          <Skeleton className="h-full w-full rounded-none" />
        </Card>
      </div>

      <Card className="min-h-[360px] flex-1 p-0">
        <Skeleton className="h-full min-h-[360px] w-full rounded-none" />
      </Card>
    </div>
  );
}
