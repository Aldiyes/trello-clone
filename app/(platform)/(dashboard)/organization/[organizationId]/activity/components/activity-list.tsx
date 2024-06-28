import { TAuditLog } from "@/data/types";

import { GET } from "@/lib/actions";

import { ActivityItem } from "@/components/activity-item";
import { Skeleton } from "@/components/ui/skeleton";

export const ActivityList = () => {
  return GET("/audit-log", {
    cache: "no-store",
    next: { tags: ["logs"] },
  }).then((auditLogs: TAuditLog[]) => (
    <ol className="mt-4 space-y-4">
      <p className="hidden text-center text-xs text-muted-foreground last:block">
        No activity found inside this organization
      </p>
      {auditLogs.map((log: TAuditLog) => (
        <ActivityItem key={log.id} data={log} />
      ))}
    </ol>
  ));
};

ActivityList.Skeleton = function ActivityListSkeleton() {
  const skeletons = Array.from({ length: 5 });
  return (
    <>
      {skeletons.map((_, index) => (
        <div key={index} className="mt-4 space-y-4">
          <div className="flex items-center gap-x-2">
            <Skeleton className="h-10 w-10 rounded-full bg-neutral-200" />
            <div className="flex flex-col space-y-0.5">
              <Skeleton className="h-6 w-full bg-neutral-200" />
              <Skeleton className="h-4 w-full bg-neutral-200" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
