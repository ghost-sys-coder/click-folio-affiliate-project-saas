import { Database } from "lucide-react";

type DatabaseSetupRequiredProps = {
  title?: string;
  description?: string;
};

export function DatabaseSetupRequired({
  title = "Database setup required",
  description = "Run your migrations and confirm DATABASE_URL is configured before continuing.",
}: DatabaseSetupRequiredProps) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-600">
            <Database className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-amber-700">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            <code className="mt-4 inline-block rounded bg-background px-2 py-1 text-xs font-mono text-foreground">
              npx drizzle-kit migrate
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
