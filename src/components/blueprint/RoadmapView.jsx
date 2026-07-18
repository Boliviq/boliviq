import React from "react";
import { roadmap } from "@/data/blueprint";

export default function RoadmapView() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-xs text-accent">14</span>
        <span className="h-px w-10 bg-accent/30" />
        <span className="text-xs tracking-[0.3em] uppercase text-white/40">Roadmap & Execution</span>
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
        Roadmap & Execution
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
        Phased delivery from product definition through scale & enterprise, with launch-readiness
        gates before public release.
      </p>

      <div className="mt-8 relative border-l border-white/10 pl-6 space-y-5">
        {roadmap.map((r) => (
          <div key={r.phase} className="relative">
            <span className="absolute -left-[1.65rem] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-background" />
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-mono text-xs text-accent">{r.phase}</span>
              <h3 className="font-display text-base font-semibold text-foreground">{r.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}