import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AppTopBar from "@/components/AppTopBar";
import { Rocket, CheckCircle2, XCircle, Loader2, RefreshCw, AlertTriangle, Activity, TrendingUp } from "lucide-react";

export default function LaunchMonitor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("launchMonitor", {});
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/40 bg-accent/10">
              <Rocket className="h-5 w-5 text-accent" />
            </span>
            <div>
              <h1 className="font-display text-xl font-bold">Launch Monitor</h1>
              <p className="text-sm text-muted-foreground">Phase 5 launch readiness & system monitoring</p>
            </div>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent/10 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {data && !loading && (
          <>
            {/* GO / NO-GO Banner */}
            <div className={`rounded-lg border p-6 mb-6 ${data.overall === "ready" ? "border-accent/40 bg-accent/5" : "border-destructive/40 bg-destructive/5"}`}>
              <div className="flex items-center gap-4">
                {data.overall === "ready" ? (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15">
                    <CheckCircle2 className="h-8 w-8 text-accent" />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                )}
                <div>
                  <div className="text-2xl font-bold">
                    {data.overall === "ready" ? "READY FOR LAUNCH" : "LAUNCH BLOCKED"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {data.passed} of {data.total} readiness checks passed · {new Date(data.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Readiness Checks */}
            <h2 className="font-display text-lg font-semibold mb-3">Readiness Checks</h2>
            <div className="space-y-3 mb-8">
              {data.checks.map((check, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-4 flex items-start gap-3 ${check.passed ? "border-border bg-card" : "border-destructive/30 bg-destructive/5"}`}
                >
                  {check.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-medium text-sm">{check.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{check.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Metrics */}
            {data.metrics && (
              <>
                <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  System Metrics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <MetricCard label="Workspaces" value={data.metrics.workspaces} sub={`${data.metrics.activeWorkspaces} active`} />
                  <MetricCard label="Active Subs" value={data.metrics.subscriptions?.active || 0} sub={`${data.metrics.subscriptions?.trialing || 0} trialing`} />
                  <MetricCard label="Credits in Circulation" value={(data.metrics.totalCredits || 0).toLocaleString()} sub={`${data.metrics.walletCount} wallets`} />
                  <MetricCard label="Properties" value={data.metrics.properties} sub={`${data.metrics.contacts} contacts`} />
                  <MetricCard label="Active Listings" value={data.metrics.activeListings} sub={`${data.metrics.projects} projects`} />
                  <MetricCard label="Audit Events (24h)" value={data.metrics.auditLast24h} sub="last 24 hours" />
                  <MetricCard label="Unresolved RLS" value={data.metrics.unresolvedRls} sub={data.metrics.unresolvedRls === 0 ? "all clear" : "needs attention"} />
                  <MetricCard label="Zero-Balance Wallets" value={data.metrics.zeroBalanceWallets} sub={`${data.metrics.walletCount} total`} />
                </div>

                {/* Plan Breakdown */}
                {data.metrics.planBreakdown && Object.keys(data.metrics.planBreakdown).length > 0 && (
                  <>
                    <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-accent" />
                      Active Plan Distribution
                    </h2>
                    <div className="rounded-lg border border-border bg-card p-4 mb-8">
                      <div className="space-y-2">
                        {Object.entries(data.metrics.planBreakdown).map(([plan, count]) => (
                          <div key={plan} className="flex items-center justify-between text-sm">
                            <span className="capitalize text-muted-foreground">{plan.replace(/_/g, " ")}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}