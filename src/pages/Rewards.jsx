import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Coins, Gift, Copy, Plus, Loader2, Ticket, Users } from "lucide-react";
import CouponForm from "@/components/rewards/CouponForm";

export default function Rewards() {
  const { activeWorkspaceId, role, loading: wsLoading } = useWorkspace();
  const [balance, setBalance] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemCode, setRedeemCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const referralCode = activeWorkspaceId ? `BOLIVIQ-${activeWorkspaceId.slice(-6).toUpperCase()}` : "";

  const load = async () => {
    if (!activeWorkspaceId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [wallets, cps, refs] = await Promise.all([
        base44.entities.CreditWallet.filter({ workspace_id: activeWorkspaceId }).catch(() => []),
        base44.entities.Coupon.filter({ workspace_id: activeWorkspaceId }, "-created_date", 50).catch(() => []),
        base44.entities.Referral.filter({ workspace_id: activeWorkspaceId }, "-created_date", 50).catch(() => []),
      ]);
      setBalance(wallets?.[0]?.balance || 0);
      setCoupons(cps || []);
      setReferrals(refs || []);
    } catch { toast({ title: "Could not load rewards", variant: "destructive" }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeWorkspaceId]);

  const redeem = async () => {
    if (!redeemCode.trim()) return;
    setBusy(true);
    try {
      const res = await base44.functions.invoke("redeemCoupon", { workspace_id: activeWorkspaceId, code: redeemCode.trim() });
      const data = res.data || res;
      setBalance(data.balance);
      setRedeemCode("");
      toast({ title: `Redeemed ${data.credits} credits`, description: `New balance: ${data.balance}` });
      load();
    } catch (err) {
      toast({ title: "Redemption failed", description: err.message || err.error, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    toast({ title: "Referral code copied" });
  };

  const createCoupon = async (form) => {
    try {
      await base44.entities.Coupon.create({ ...form, workspace_id: activeWorkspaceId });
      toast({ title: "Coupon created" });
      setDialogOpen(false);
      load();
    } catch (err) { toast({ title: "Create failed", description: err.message, variant: "destructive" }); }
  };

  if (wsLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  }
  if (!activeWorkspaceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center"><p className="mb-4 text-muted-foreground">Select a workspace first.</p><Link to="/workspaces" className="text-accent font-semibold">Go to Workspaces →</Link></div>
      </div>
    );
  }
  const isAdmin = role === "owner" || role === "admin";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/10"><Gift className="h-4 w-4 text-accent" /></span>
          <div>
            <h1 className="font-display text-2xl font-bold">Rewards</h1>
            <p className="text-sm text-muted-foreground">Credits, referrals, and coupons.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Credit balance</div>
            <div className="mt-1 text-2xl font-bold flex items-center gap-2"><Coins className="h-5 w-5 text-accent" /> {balance.toLocaleString()}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Your referral code</div>
            <div className="mt-1 flex items-center gap-2">
              <code className="text-lg font-bold tracking-wide">{referralCode}</code>
              <button onClick={copyCode} className="p-1.5 rounded-md hover:bg-background"><Copy className="h-4 w-4 text-muted-foreground" /></button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 mb-8">
          <h2 className="font-semibold flex items-center gap-2 mb-3"><Ticket className="h-4 w-4 text-accent" /> Redeem a coupon</h2>
          <div className="flex gap-2">
            <input
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring uppercase tracking-wide"
            />
            <Button onClick={redeem} disabled={busy || !redeemCode.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redeem"}</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-3"><Users className="h-4 w-4 text-accent" /> Referrals</h2>
            {referrals.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No referrals yet. Share your code to earn credits.</div>
            ) : (
              <div className="space-y-2">
                {referrals.map((r) => (
                  <div key={r.id} className="rounded-md border border-border bg-card p-3 flex items-center justify-between">
                    <div className="text-sm">{r.referred_email || "—"}</div>
                    <Badge variant="outline" className="capitalize">{r.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Ticket className="h-4 w-4 text-accent" /> Coupons</h2>
              {isAdmin && <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New</Button>}
            </div>
            {coupons.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{isAdmin ? "No coupons yet. Create one to reward users." : "No coupons available."}</div>
            ) : (
              <div className="space-y-2">
                {coupons.map((c) => (
                  <div key={c.id} className="rounded-md border border-border bg-card p-3 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-semibold text-sm">{c.code}</div>
                      <div className="text-xs text-muted-foreground">{c.discount_type === "credits" ? `${c.value} credits` : `${c.value}% off`} · {c.usage_count || 0}/{c.max_uses || "∞"} used</div>
                    </div>
                    <Badge variant="outline" className="capitalize">{c.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New coupon</DialogTitle></DialogHeader>
          <CouponForm onSubmit={createCoupon} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}