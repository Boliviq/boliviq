import React from "react";
import { Bot, ShieldAlert, Gauge } from "lucide-react";
import { agents, agentControls } from "@/data/blueprint";

export default function AgentGallery() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-xs text-accent">08</span>
        <span className="h-px w-10 bg-accent/30" />
        <span className="text-xs tracking-[0.3em] uppercase text-white/40">AI Agents</span>
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
        AI Agents
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
        {agentControls.defaultState} Bounded AI workers — each with explicit tools, cost controls,
        and human escalation.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent/20 bg-accent/[0.03] p-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-4 w-4 text-accent" />
            <h3 className="font-display font-semibold text-accent">Standard controls</h3>
          </div>
          <ul className="space-y-2">
            {agentControls.standard.map((s) => (
              <li key={s} className="flex gap-2.5 text-sm text-white/70">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-4 w-4 text-accent" />
            <h3 className="font-display font-semibold text-foreground">Required metrics</h3>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">{agentControls.metrics}</p>
          <p className="mt-4 text-xs text-white/40">
            Every agent ships disabled and is enabled only after its permissions and server
            execution are proven.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => (
          <div key={a.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/15 bg-accent/[0.04]">
                <Bot className="h-4 w-4 text-accent/80" />
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground leading-tight">
                {a.name}
              </h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed mb-3">{a.mission}</p>
            <p className="text-xs text-white/45 leading-relaxed border-t border-white/[0.06] pt-3">
              <span className="text-red-300/70 font-semibold">Limit · </span>
              {a.prohibited}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}