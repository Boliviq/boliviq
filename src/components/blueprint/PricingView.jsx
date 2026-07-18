import React from "react";
import { Check } from "lucide-react";
import { plans, creditPacks, coupons } from "@/data/blueprint";

export default function PricingView() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-xs text-accent">07</span>
        <span className="h-px w-10 bg-accent/30" />
        <span className="text-xs tracking-[0.3em] uppercase text-white/40">Plans, Billing, Credits & Revenue</span>
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
        Plans, Billing, Credits & Revenue
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
        Subscriptions unlock platform features; credits pay for AI-intensive tasks. One authoritative
        wallet per workspace, with an immutable ledger and idempotent server operations.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`rounded-2xl border p-6 ${
              p.featured
                ? "border-accent/40 bg-accent/[0.04] shadow-lg shadow-accent/10"
                : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-lg font-semibold text-foreground">{p.name}</h3>
              {p.badge && (
                <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[10px] tracking-[0.15em] uppercase text-accent">
                  {p.badge}
                </span>
              )}
              {p.featured && !p.badge && (
                <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[10px] tracking-[0.15em] uppercase text-accent">
                  Popular
                </span>
              )}
            </div>
            <p className="font-display text-2xl font-bold text-accent">
              {p.price}
              <span className="text-sm font-normal text-muted-foreground"> {p.period}</span>
            </p>
            <ul className="mt-4 space-y-2">
              {p.highlights.map((h) => (
                <li key={h} className="flex gap-2.5 text-sm text-white/70">
                  <Check className="h-4 w-4 shrink-0 text-accent/70 mt-0.5" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Credit packs</h3>
          <div className="grid grid-cols-2 gap-2">
            {creditPacks.map((c) => (
              <div key={c} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/70">
                {c}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Coupons, referrals & rewards</h3>
          <ul className="space-y-2">
            {coupons.map((c) => (
              <li key={c} className="flex gap-2.5 text-sm text-white/65">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}