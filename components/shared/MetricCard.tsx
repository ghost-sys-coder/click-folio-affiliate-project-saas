import React from 'react'

function MetricCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/0.04 p-4">
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-emerald-300">{change}</p>
    </div>
  );
}

export default MetricCard