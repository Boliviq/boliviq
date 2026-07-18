import React from "react";
import { Plug, FileCheck2 } from "lucide-react";
import { companies, companyFileRequirements } from "@/data/blueprint";

export default function CompanyGallery() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-xs text-accent">09</span>
        <span className="h-px w-10 bg-accent/30" />
        <span className="text-xs tracking-[0.3em] uppercase text-white/40">Companies & Integrations</span>
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
        Companies & Integrations
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
        Vendors and providers evaluated for the Boliviq stack. Core platform logic stays portable and
        never becomes dependent on a single vendor.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => (
          <div key={c.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/15 bg-accent/[0.04]">
                <Plug className="h-4 w-4 text-accent/80" />
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground">{c.name}</h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed mb-3">
              <span className="text-accent font-semibold">Purpose · </span>
              {c.purpose}
            </p>
            <p className="text-xs text-white/45 leading-relaxed border-t border-white/[0.06] pt-3">
              <span className="text-white/60 font-semibold">Controls · </span>
              {c.controls}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck2 className="h-4 w-4 text-accent" />
          <h3 className="font-display font-semibold text-foreground">File requirements before production</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {companyFileRequirements.map((f) => (
            <div key={f} className="flex gap-2.5 text-xs text-white/65">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}