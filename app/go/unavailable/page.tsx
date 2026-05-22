import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { appThemes } from "@/lib/themes";

export default function AffiliateLinkUnavailablePage() {
  return (
    <main
      data-theme={appThemes.growthMint}
      className="grid min-h-svh place-items-center bg-background px-4 py-10 text-foreground"
    >
      <Card className="w-full max-w-md border-border/70 bg-card">
        <CardContent className="grid gap-5 p-6 text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">
              Link unavailable
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              This affiliate link is not available.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              The offer may have been removed, paused, or archived by the
              creator.
            </p>
          </div>
          <Button asChild>
            <Link href="/">Go to Clickfolio</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
