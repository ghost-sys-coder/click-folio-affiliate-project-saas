import { CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const complianceItems = [
  "Disclosure included",
  "No fake scarcity",
  "No guaranteed result",
  "No unsupported claims",
  "No fake testimonial",
] as const;

export function ComplianceChecklist() {
  return (
    <Card className="border-border/70 bg-card" size="sm">
      <CardHeader>
        <CardTitle>Compliance checklist</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {complianceItems.map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 text-primary" />
            <span>{item}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
