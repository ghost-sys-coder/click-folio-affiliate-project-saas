import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLinksLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-xl border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
