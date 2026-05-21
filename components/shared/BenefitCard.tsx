import React from "react";
import { Check } from "lucide-react";


function BenefitCard({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/0.04 p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/10">
        <Check className="h-4 w-4 text-emerald-300" />
      </div>
      <p className="font-medium">{title}</p>
    </div>
  );
}

export default BenefitCard;