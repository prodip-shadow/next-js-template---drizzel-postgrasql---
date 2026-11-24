import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommonLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 sm:px-8 lg:py-12">
      <div className="w-full max-w-[960px] space-y-4">
        <Card className="py-0">
          <CardContent className="grid grid-cols-1 gap-6 p-8 sm:p-10 lg:grid-cols-12 lg:p-12">
            <div className="space-y-4 lg:col-span-7">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-4 w-3/4 max-w-sm" />
              <div className="flex gap-3 pt-4">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
            <div className="flex items-center justify-center lg:col-span-5">
              <Skeleton className="size-24 rounded-2xl" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="py-0">
              <CardContent className="flex items-start gap-4 p-6">
                <Skeleton className="size-10 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
