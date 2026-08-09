import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/lib/workspaceContext";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PLANS, TOKEN_PACKS, AI_MODE, planById, BILLING_CYCLE } from "@/data/billingCatalog";
import { CreditCard, Loader2, Coins, Check, Crown, Sparkles, Infinity as InfinityIcon, X } from "lucide-react";

const inIframe = () => {
  try { return window.self !== window.top; } catch { return true; }
};

const fmtPrice = (n) => (Number(n) % 1 === 0 ? `$${Number(n)}` : `$${Number(n).toFixed(2)}`);

export default function Billing() {
  const { activeWorkspaceId, role, loading: wsLoading } = useWorkspace();
  const [state, setState] = useState(null);
  const [loadingState, setLoadingState] = useState(true);
  const [busy, setBusy] = useState(null);
  const [cycle, setCycle] = useState(BILLING_CYCLE.MONTHLY);
  const [onboardingPlan, setOnboardingPlan] = useState(null);
  const { toast } = useToast();

  const loadState = async () => {
    if (!activeWorkspaceId) { setLoadingState(false); return; }
    setLoadingState(true);
    try {
      const res = await base44.functions.invoke("getBillingState", { workspace_id: activeWorkspaceId });
      setState(res.data);
    } catch {
      setState(null);
    }
    setLoadingState(false);
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("boliviq_onboarding_plan");
    if (stored) { setOnboardingPlan(stored); sessionStorage.removeItem("boliviq_onboarding_plan"); }
  }, []);
  useEffect(() => { loadState(); }, [activeWorkspaceId]);

  const startCheckout = async (priceId, label) => {
    if (!priceId) return;
    if (inIframe()) {
      toast({ title: "Open in published app", description: "Checkout only works outside the builder preview.", variant: "destructive" });
      return;
    }
    setBusy(label);
    try {
      const res = await base44.functions.invoke("createCheckoutSession", { workspace_id: activeWorkspaceId, price_id: priceId });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (err) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    } finally { setBusy(null); }
  };

  const openPortal = async () => {
    if (inIframe()) {
      toast({ title: "Open in published app", description: "Portal only works outside the builder preview.", variant: "destructive" });
      return;
    }
    setBusy("portal");
    try {
      const res = await base44.functions.invoke("createBillingPortalSession", { workspace_id: activeWorkspaceId });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (err) {
      toast({ title: "Could not open portal", description: err.message, variant: "destructive" });
    } finally { setBusy(null); }
  };

  if (wsLoading || loadingState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!activeWorkspaceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Select a workspace to manage billing.</p>
          <Link to="/workspaces" className="text-accent font-semibold">Go to Workspaces →</Link>
        </div>
      </div>
    );
  }

  const canManage = role === "owner" || role === "admin";
  const currentPlan = state?.subscription?.plan || "free";
  const current = planById(currentPlan);
  const balance = state?.wallet?.balance || 0;
  const isUnlimited = current?.ai === "unlimited";
  const hasTokens = current?.ai === "tokens";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/10">
            <CreditCard className="h-4 w-4 text-accent" />
          </span>
          <h1 className="font-display text-2xl font-bold">Billing & Plans</h1>
        </div>
        <p className="text-muted-foreground mb-8">Choose your membership, manage AI credits, and sync with Stripe.</p>

        {onboardingPlan && (
          <div className="mb-6 rounded-lg border border-accent/40 bg-accent/5 p-4 flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-accent shrink-0" />
            You selected <span className="font-semibold capitalize">{onboardingPlan.replace(/_/g, " ")}</span>. Complete checkout below to activate it.
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Current plan</div>
            <div className="mt-1 text-xl font-semibold flex items-center gap-2">
              {current ? current.name : "Free"}
              {currentPlan !== "free" && <Crown className="h-4 w-4 text-accent" />}
            </div>
            {current && <div className="mt-1 text-xs text-muted-foreground">{current.tagline}</div>}
            {state?.subscription?.current_period_end && (
              <div className="mt-1 text-xs text-muted-foreground">Renews {state.subscription.current_period_end}</div>
            )}
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">AI credits</div>
            <div className="mt-1 text-xl font-semibold flex items-center gap-2">
              <Coins className="h-4 w-4 text-accent" /> {balance.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {isUnlimited ? "Unlimited AI — credits not used" : hasTokens ? "Credit-metered AI plan" : "Buy credits with an AI plan"}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Seats</div>
            <div className="mt-1 text-xl font-semibold">{current?.seats || 1}</div>
            <div className="mt-1 text-xs text-muted-foreground">{current?.seats > 1 ? "Team workspace" : "Solo workspace"}</div>
          </div>
        </div>

        {/* Billing cycle toggle */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-display text-lg font-semibold">Membership plans</h2>
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            <button onClick={() => setCycle(BILLING_CYCLE.MONTHLY)} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${cycle === BILLING_CYCLE.MONTHLY ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"}`}>Monthly</button>
            <button onClick={() => setCycle(BILLING_CYCLE.ANNUAL)} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${cycle === BILLING_CYCLE.ANNUAL ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"}`}>Annual <span className="text-xs opacity-70">save 20%</span></button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {PLANS.map((p) => {
            const isCurrent = p.id === currentPlan;
            const price = cycle === BILLING_CYCLE.ANNUAL ? p.priceAnnual : p.priceMonthly;
            const priceId = cycle === BILLING_CYCLE.ANNUAL ? p.annualPriceId : p.monthlyPriceId;
            const mode = AI_MODE[p.ai];
            return (
              <div key={p.id} className={`rounded-lg border p-5 flex flex-col ${isCurrent ? "border-accent bg-accent/5" : p.featured ? "border-accent/50 bg-accent/[0.03]" : "border-border bg-card"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold">{p.name}</div>
                  <span className={`text-[10px] tracking-wide uppercase rounded px-2 py-0.5 ${mode.badge}`}>{mode.label}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{p.tagline}</div>
                <div className="text-2xl font-bold">
                  {price === 0 ? "Free" : fmtPrice(price)}
                  {price !== 0 && <span className="text-sm font-normal text-muted-foreground">/{cycle === BILLING_CYCLE.ANNUAL ? "yr" : "mo"}</span>}
                </div>
                {p.id === "free" && <div className="text-xs text-muted-foreground mt-0.5">Free forever</div>}
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-accent shrink-0" />{f}</li>
                  ))}
                  {p.restrictions.map((f) => (
                    <li key={f} className="flex gap-2 text-muted-foreground/70"><X className="h-4 w-4 shrink-0 opacity-60" />{f}</li>
                  ))}
                </ul>
                <Button
                  className="mt-4"
                  variant={isCurrent ? "secondary" : p.featured ? "default" : "outline"}
                  disabled={isCurrent || !canManage || !priceId || busy === p.id}
                  onClick={() => startCheckout(priceId, p.id)}
                >
                  {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : isCurrent ? "Current plan" : price === 0 ? "Included" : "Upgrade"}
                </Button>
              </div>
            );
          })}
        </div>

        {/* AI Tokens */}
        <h2 className="font-display text-lg font-semibold mb-1">AI credits</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {isUnlimited
            ? "Your plan includes unlimited AI — no credits are deducted."
            : hasTokens
              ? "Top up credits anytime. Every AI request consumes credits from your shared workspace wallet."
              : "Credit packs are available on AI plans. Upgrade to Professional + AI or higher to use AI."}
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {TOKEN_PACKS.map((pack) => (
            <div key={pack.id} className={`rounded-lg border p-5 flex flex-col ${pack.popular ? "border-accent/50 bg-accent/[0.03]" : "border-border bg-card"}`}>
              <div className="flex items-center justify-between">
                <div className="font-semibold">{pack.name}</div>
                {pack.popular && <span className="text-[10px] uppercase tracking-wide rounded px-2 py-0.5 bg-accent/15 text-accent">Popular</span>}
              </div>
              <div className="mt-1 text-2xl font-bold">{fmtPrice(pack.price)}</div>
              <div className="text-sm text-muted-foreground">{pack.tokens.toLocaleString()} credits</div>
              <Button
                className="mt-4"
                variant={pack.popular ? "default" : "outline"}
                disabled={!canManage || !hasTokens || busy === pack.id}
                onClick={() => startCheckout(pack.priceId, pack.id)}
              >
                {busy === pack.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy credits"}
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {canManage && (
            <Button variant="outline" disabled={busy === "portal"} onClick={openPortal}>
              {busy === "portal" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Manage subscription"}
            </Button>
          )}
          {!canManage && <p className="text-xs text-muted-foreground">Only workspace owners and admins can manage billing.</p>}
          {isUnlimited && (
            <span className="inline-flex items-center gap-1.5 text-sm text-accent"><InfinityIcon className="h-4 w-4" /> Unlimited AI active — no credit deductions</span>
          )}
        </div>
      </div>
    </div>
  );
}