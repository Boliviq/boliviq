import React from "react";

const stats = [
  { value: "10K+", label: "Active investors" },
  { value: "5M+", label: "Properties analyzed" },
  { value: "$2B+", label: "Deals evaluated" },
  { value: "98%", label: "Customer satisfaction" },
];

export default function StatsBar() {
  return (
    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      {stats.map((s) => (
        <div key={s.label} className="bg-card/60 px-6 py-7 text-center">
          <p className="font-display text-2xl md:text-3xl font-bold text-accent">{s.value}</p>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}