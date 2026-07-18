import React from "react";
import { Search, TrendingUp, HardHat, ClipboardList } from "lucide-react";

const badges = [
  { icon: Search, label: "Find", sub: "Off-market properties" },
  { icon: TrendingUp, label: "Analyze", sub: "Deals instantly" },
  { icon: HardHat, label: "Plan", sub: "Construction and costs" },
  { icon: ClipboardList, label: "Manage", sub: "Your entire pipeline" },
];

export default function FeatureBadges() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
      {badges.map((b) => (
        <div key={b.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
            <b.icon className="h-4 w-4 text-accent" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-foreground">{b.label}</span>
            <span className="block text-[11px] text-muted-foreground">{b.sub}</span>
          </span>
        </div>
      ))}
    </div>
  );
}