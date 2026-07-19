import React from "react";
import { PLANS, TOKEN_PACKS, AI_MODE } from "@/data/billingCatalog";
import { Check, X } from "lucide-react";

const fmtPrice = (n) => (Number(n) % 1 === 0 ? `$${Number(n)}` : `$${Number(n).toFixed(2)}`);

// Admin pricing matrix — reflects the live catalog. Prices are managed in Stripe +
// src/data/billingCatalog.js; feature toggles live in checkEntitlement plan defaults
// and per-workspace Entitlement overrides.
export default function AdminPricing() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-display font-semibold mb-1">Membership plans</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Prices, AI mode, and seat counts are defined in <code className="text-xs">src/data/billingCatalog.js</code> and mirrored in Stripe.
          Override per-workspace feature access via the Entitlement entity (owner_grant / promotion / manual).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-4 font-medium">Plan</th>
                <th className="py-2 pr-4 font-medium">Monthly</th>
                <th className="py-2 pr-4 font-medium">Annual</th>
                <th className="py-2 pr-4 font-medium">AI</th>
                <th className="py-2 pr-4 font-medium">Seats</th>
                <th className="py-2 pr-4 font-medium">Stripe price (mo)</th>
              </tr>
            </thead>
            <tbody>
              {PLANS.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-2 pr-4 font-medium">{p.name}</td>
                  <td className="py-2 pr-4">{p.priceMonthly === 0 ? "Free" : fmtPrice(p.priceMonthly)}</td>
                  <td className="py-2 pr-4">{p.priceAnnual === 0 ? "—" : fmtPrice(p.priceAnnual)}</td>
                  <td className="py-2 pr-4"><span className={`text-[10px] uppercase tracking-wide rounded px-2 py-0.5 ${AI_MODE[p.ai].badge}`}>{AI_MODE[p.ai].label}</span></td>
                  <td className="py-2 pr-4">{p.seats}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{p.monthlyPriceId || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-display font-semibold mb-3">AI token packs</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {TOKEN_PACKS.map((t) => (
            <div key={t.id} className="rounded-md border border-border p-3">
              <div className="font-medium text-sm">{t.name}</div>
              <div className="text-lg font-bold">{fmtPrice(t.price)}</div>
              <div className="text-xs text-muted-foreground font-mono">{t.priceId}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Token packs are one-time purchases. Monthly token grants for token-metered plans are added automatically on each renewal invoice (10k Professional + AI, 50k Team Professional + AI).
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-display font-semibold mb-3">Feature entitlement matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-4 font-medium">Feature</th>
                {PLANS.map((p) => <th key={p.id} className="py-2 px-2 font-medium text-center">{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["marketplace", ["free","professional","team_professional","professional_ai","team_professional_ai","professional_ai_unlimited","team_ai_unlimited"]],
                ["crm", ["professional","team_professional","professional_ai","team_professional_ai","professional_ai_unlimited","team_ai_unlimited"]],
                ["construction_intelligence", ["professional","team_professional","professional_ai","team_professional_ai","professional_ai_unlimited","team_ai_unlimited"]],
                ["deal_calculator", PLANS.map((p) => p.id)],
                ["ai_access", ["professional_ai","team_professional_ai","professional_ai_unlimited","team_ai_unlimited"]],
                ["ai_unlimited", ["professional_ai_unlimited","team_ai_unlimited"]],
              ].map(([feature, enabledPlans]) => (
                <tr key={feature} className="border-b border-border/60">
                  <td className="py-2 pr-4 font-mono text-xs">{feature}</td>
                  {PLANS.map((p) => (
                    <td key={p.id} className="py-2 px-2 text-center">
                      {enabledPlans.includes(p.id) ? <Check className="h-4 w-4 text-accent mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Server-side enforcement lives in <code className="text-xs">checkEntitlement</code> (feature flags) and <code className="text-xs">chargeCredits</code> (AI gating + unlimited bypass). No client-side bypass is possible.
        </p>
      </div>
    </div>
  );
}