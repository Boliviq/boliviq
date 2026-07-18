import React from "react";
import AgentGallery from "./AgentGallery";
import CompanyGallery from "./CompanyGallery";
import PricingView from "./PricingView";
import RoadmapView from "./RoadmapView";

function Block({ block }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-3">{block.heading}</h3>
      {block.body && <p className="text-sm text-muted-foreground leading-relaxed mb-3">{block.body}</p>}
      {block.items && (
        <ul className="space-y-2">
          {block.items.map((it, i) => {
            const [term, ...rest] = it.split(" — ");
            const isDef = rest.length > 0;
            return (
              <li key={i} className="text-sm text-white/70 leading-relaxed">
                {isDef ? (
                  <>
                    <span className="font-semibold text-accent">{term}</span>
                    <span className="text-white/45"> — {rest.join(" — ")}</span>
                  </>
                ) : (
                  <span className="flex gap-2.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                    {it}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function SectionView({ section }) {
  if (section.kind === "agents") return <AgentGallery />;
  if (section.kind === "companies") return <CompanyGallery />;
  if (section.kind === "pricing") return <PricingView />;
  if (section.kind === "roadmap") return <RoadmapView />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-xs text-accent">{section.code}</span>
        <span className="h-px w-10 bg-accent/30" />
        <span className="text-xs tracking-[0.3em] uppercase text-white/40">{section.title}</span>
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
        {section.title}
      </h1>
      {section.intro && <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{section.intro}</p>}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {section.blocks.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </div>
    </div>
  );
}