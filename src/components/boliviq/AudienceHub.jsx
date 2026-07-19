import React from "react";
import { Link } from "react-router-dom";
import { Home, HardHat, Building2, TrendingUp, ArrowRight } from "lucide-react";

const ROLES = [
  { icon: Home, title: "Homeowners", desc: "Post repair, improvement, and project requests — free.", to: "/marketplace", cta: "Enter Marketplace" },
  { icon: HardHat, title: "Contractors", desc: "Find work, post services, and use the estimator & scheduler.", to: "/contractor-tools", cta: "Contractor Tools", alt: { label: "Marketplace", to: "/marketplace" } },
  { icon: Building2, title: "Real Estate Agents", desc: "List properties on/off MLS and reach the community.", to: "/marketplace", cta: "Enter Marketplace" },
  { icon: TrendingUp, title: "Investors", desc: "Post off-market deals and find funding partners.", to: "/marketplace", cta: "Post a Deal" },
];

export default function AudienceHub() {
  return (
    <section id="audience" className="border-t border-border bg-card/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center">One marketplace. Free access for everyone.</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">Choose your path — every role gets free, unlimited access to the Boliviq Marketplace.</p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLES.map((r) => (
            <div key={r.title} className="rounded-xl border border-border bg-card p-5 flex flex-col hover:border-accent/50 transition-colors">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 border border-accent/30"><r.icon className="h-5 w-5 text-accent" /></span>
              <h3 className="mt-3 font-semibold">{r.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground flex-1">{r.desc}</p>
              <Link to={r.to} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:gap-2 transition-all">{r.cta} <ArrowRight className="h-3.5 w-3.5" /></Link>
              {r.alt && <Link to={r.alt.to} className="mt-2 text-xs text-muted-foreground hover:text-foreground">{r.alt.label} →</Link>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}