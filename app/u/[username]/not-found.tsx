import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { appThemes } from "@/lib/themes";

export default function PublicProfileNotFound() {
  return (
    <main
      data-theme={appThemes.growthMint}
      className="grid min-h-svh place-items-center bg-background px-4 py-10 text-foreground"
    >
      <Card className="w-full max-w-md border-border/70 bg-card">
        <CardContent className="grid gap-5 p-6 text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">
              Profile unavailable
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              This affiliate page is not available.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              The profile may not exist, may be private, or may not be published
              yet.
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
