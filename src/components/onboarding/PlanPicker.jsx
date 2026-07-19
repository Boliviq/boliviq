import React from "react";
import { Link } from "react-router-dom";
import { PLANS, TOKEN_PACKS, AI_MODE } from "@/data/billingCatalog";
import { Check, X, Sparkles, Coins } from "lucide-react";

const fmtPrice = (n) => (Number(n) % 1 === 0 ? `$${Number(n)}` : `$${Number(n).toFixed(2)}`);

// Onboarding plan selection shown after signup. Choosing a paid plan routes to /billing
// to complete checkout; Homeowner (free) routes straight to the app.
export default function PlanPicker({ onChoose }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs tracking-wide uppercase text-accent mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Choose your plan
          </span>
          <h1 className="font-display text-3xl font-bold mb-2">Pick the Boliviq plan that fits you</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Marketplace is free for everyone. Professional plans unlock business tools. AI plans unlock AI. Choose carefully — you can upgrade or cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {PLANS.map((p) => {
            const mode = AI_MODE[p.ai];
            return (
              <div key={p.id} className={`rounded-xl border p-5 flex flex-col ${p.featured ? "border-accent/50 bg-accent/[0.04] shadow-lg shadow-accent/10" : "border-border bg-card"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-base">{p.name}</div>
                  <span className={`text-[10px] tracking-wide uppercase rounded px-2 py-0.5 ${mode.badge}`}>{mode.label}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{p.tagline}</div>
                <div className="text-2xl font-bold mb-1">
                  {p.priceMonthly === 0 ? "Free" : fmtPrice(p.priceMonthly)}
                  {p.priceMonthly !== 0 && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                </div>
                <div className="text-xs text-muted-foreground mb-3">{p.target}</div>
                <ul className="space-y-1.5 text-sm text-muted-foreground flex-1">
                  {p.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-accent shrink-0" />{f}</li>
                  ))}
                </ul>
                <button
                  onClick={() => onChoose(p.id)}
                  className={`mt-4 w-full rounded-md px-4 py-2 text-sm font-semibold transition-colors ${p.featured ? "bg-accent text-accent-foreground hover:opacity-90" : "border border-border hover:border-accent/50"}`}
                >
                  {p.priceMonthly === 0 ? "Start free" : "Choose " + p.name}
                </button>
              </div>
            );
          })}
        </div>

        {/* Token explainer */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2"><Coins className="h-4 w-4 text-accent" /><h3 className="font-semibold">AI Tokens (pay per use)</h3></div>
            <p className="text-sm text-muted-foreground mb-3">Professional + AI and Team Professional + AI include monthly tokens and let you buy more. Every AI request consumes tokens from your shared wallet.</p>
            <div className="space-y-1.5">
              {TOKEN_PACKS.map((t) => (
                <div key={t.id} className="flex justify-between text-sm"><span>{t.name}</span><span className="text-muted-foreground">{fmtPrice(t.price)}</span></div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-accent/30 bg-accent/[0.03] p-5">
            <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-accent" /><h3 className="font-semibold">Unlimited AI (no tokens)</h3></div>
            <p className="text-sm text-muted-foreground mb-3">Professional AI Unlimited and Team AI Unlimited bypass token deductions entirely. Unlimited reports, automation, assistants, voice and document AI — no metering.</p>
            <ul className="space-y-1.5 text-sm">
              <li className="flex gap-2"><Check className="h-4 w-4 text-accent shrink-0" />No token balance required</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-accent shrink-0" />Server-side secure bypass</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-accent shrink-0" />Unlimited every AI tool</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <button onClick={() => onChoose("free")} className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
            Skip — continue with the free Homeowner plan
          </button>
        </div>
      </div>
    </div>
  );
}