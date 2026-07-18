import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/lib/workspaceContext";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PLANS, CREDIT_PACKS } from "@/data/billingCatalog";
import { CreditCard, Loader2, Coins, Check, Crown } from "lucide-react";

const inIframe = () => {
  try { return window.self !== window.top; } catch { return true; }
};

export default function Billing() {
  const { activeWorkspaceId, role, loading: wsLoading } = useWorkspace();
  const [state, setState] = useState(null);
  const [loadingState, setLoadingState] = useState(true);
  const [busy, setBusy] = useState(null);
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

  useEffect(() => { loadState(); }, [activeWorkspaceId]);

  const startCheckout = async (priceId, label) => {
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
  const balance = state?.wallet?.balance || 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/10">
            <CreditCard className="h-4 w-4 text-accent" />
          </span>
          <h1 className="font-display text-2xl font-bold">Billing</h1>
        </div>
        <p className="text-muted-foreground mb-8">Manage your plan, credits, and subscription.</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Current plan</div>
            <div className="mt-1 text-xl font-semibold capitalize flex items-center gap-2">
              {currentPlan === "free" ? "Free" : currentPlan.replace(/_/g, " ")}
              {currentPlan !== "free" && <Crown className="h-4 w-4 text-accent" />}
            </div>
            {state?.subscription?.current_period_end && (
              <div className="mt-1 text-xs text-muted-foreground">Renews {state.subscription.current_period_end}</div>
            )}
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Credit balance</div>
            <div className="mt-1 text-xl font-semibold flex items-center gap-2">
              <Coins className="h-4 w-4 text-accent" /> {balance.toLocaleString()}
            </div>
          </div>
        </div>

        <h2 className="font-display text-lg font-semibold mb-4">Plans</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {PLANS.map((p) => {
            const isCurrent = p.id === currentPlan;
            return (
              <div key={p.id} className={`rounded-lg border p-5 flex flex-col ${isCurrent ? "border-accent bg-accent/5" : "border-border bg-card"}`}>
                <div className="font-semibold">{p.name}</div>
                <div className="mt-1 text-2xl font-bold">${p.price}<span className="text-sm font-normal text-muted-foreground">/{p.interval}</span></div>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-accent shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button
                  className="mt-4"
                  variant={isCurrent ? "secondary" : "default"}
                  disabled={isCurrent || !canManage || !p.priceId || busy === p.id}
                  onClick={() => startCheckout(p.priceId, p.id)}
                >
                  {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : isCurrent ? "Current" : p.price === 0 ? "Included" : "Upgrade"}
                </Button>
              </div>
            );
          })}
        </div>

        <h2 className="font-display text-lg font-semibold mb-4">Credit packs</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {CREDIT_PACKS.map((pack) => (
            <div key={pack.id} className="rounded-lg border border-border bg-card p-5 flex items-center justify-between">
              <div>
                <div className="font-semibold">{pack.name}</div>
                <div className="text-sm text-muted-foreground">${pack.price} · {pack.credits.toLocaleString()} credits</div>
              </div>
              <Button disabled={!canManage || busy === pack.id} onClick={() => startCheckout(pack.priceId, pack.id)}>
                {busy === pack.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy"}
              </Button>
            </div>
          ))}
        </div>

        {canManage && (
          <Button variant="outline" disabled={busy === "portal"} onClick={openPortal}>
            {busy === "portal" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Manage subscription"}
          </Button>
        )}
        {!canManage && <p className="text-xs text-muted-foreground">Only workspace owners and admins can manage billing.</p>}
      </div>
    </div>
  );
}