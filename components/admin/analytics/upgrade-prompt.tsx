import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function UpgradePrompt({ 
  title, 
  description, 
  plan = "Pro" 
}: { 
  title: string; 
  description: string;
  plan?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
        <Lock className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 mb-6 max-w-[250px] text-sm text-muted-foreground">
        {description}
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/admin/billing">Upgrade to {plan}</Link>
      </Button>
    </div>
  );
}
