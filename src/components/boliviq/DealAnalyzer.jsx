import React from "react";
import { BarChart3 } from "lucide-react";

const bars = [38, 52, 44, 64, 76, 88, 100];

export default function DealAnalyzer() {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-6 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-4 w-4 text-accent" />
        <span className="font-semibold text-sm text-white/90">AI Deal Analyzer</span>
      </div>

      <p className="text-xs text-muted-foreground mb-1">Estimated Project Profit</p>
      <p className="font-display text-4xl font-bold text-accent">$68,500</p>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-muted-foreground mb-1">ROI</p>
          <p className="font-display text-2xl font-bold text-accent">28.4%</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-muted-foreground mb-1">Deal Score</p>
          <p className="font-display text-2xl font-bold text-accent">91<span className="text-base text-muted-foreground">/100</span></p>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-2 h-24">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-accent/80"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}