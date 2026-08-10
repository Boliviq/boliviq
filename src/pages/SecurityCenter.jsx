import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { ShieldAlert, ShieldCheck, Loader2, RefreshCw, AlertTriangle, Activity, Lock, Eye, Bug } from "lucide-react";

const SEVERITY_STYLES = {
  critical: { badge: "bg-red-500/20 text-red-400 border-red-500/30", label: "CRITICAL" },
  high: { badge: "bg-orange-500/20 text-orange-400 border-orange-500/30", label: "HIGH" },
  medium: { badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "MEDIUM" },
  low: { badge: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "LOW" },
  info: { badge: "bg-slate-500/20 text-slate-400 border-slate-500/30", label: "INFO" },
};

export default function SecurityCenter() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("securitySentinel", {});
      setData(res.data);
    } catch (err) {
      toast({ title: "Failed to load security data", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const resolveEvent = async (id) => {
    setResolving(id);
    try {
      await base44.asServiceRole.entities.SecurityEvent.update(id, { resolved: true });
      toast({ title: "Event resolved" });
      load();
    } catch (err) {
      toast({ title: "Failed to resolve", description: err.message, variant: "destructive" });
    }
    setResolving(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const overall = data?.overall || "unknown";
  const sevCounts = summary.severityCounts || {};
  const eventTypes = summary.eventTypeCounts || {};

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg border ${overall === 'secure' ? 'border-accent/40 bg-accent/10' : 'border-red-500/40 bg-red-500/10'}`}>
              {overall === 'secure' ? <ShieldCheck className="h-5 w-5 text-accent" /> : <ShieldAlert className="h-5 w-5 text-red-400" />}
            </span>
            <div>
              <h1 className="font-display text-xl font-bold">Security Center</h1>
              <p className="text-xs text-muted-foreground">Boliviq Security Sentinel — defensive monitoring & threat detection</p>
            </div>
          </div>
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent/10 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {/* Status banner */}
        <div className={`rounded-lg border p-4 flex items-center gap-3 ${overall === 'secure' ? 'border-accent/30 bg-accent/5' : 'border-red-500/30 bg-red-500/5'}`}>
          {overall === 'secure' ? (
            <><ShieldCheck className="h-5 w-5 text-accent shrink-0" /><div><div className="font-semibold">All systems secure</div><div className="text-xs text-muted-foreground">No unresolved high or critical threats detected.</div></div></>
          ) : (
            <><ShieldAlert className="h-5 w-5 text-red-400 shrink-0" /><div><div className="font-semibold text-red-400">Threats detected</div><div className="text-xs text-muted-foreground">{summary.unresolvedHighCritical || 0} unresolved high/critical security event(s) require attention.</div></div></>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Critical (24h)", value: sevCounts.critical || 0, icon: AlertTriangle, color: "text-red-400" },
            { label: "High (24h)", value: sevCounts.high || 0, icon: AlertTriangle, color: "text-orange-400" },
            { label: "Medium (24h)", value: sevCounts.medium || 0, icon: Activity, color: "text-yellow-400" },
            { label: "Low (24h)", value: sevCounts.low || 0, icon: Activity, color: "text-blue-400" },
            { label: "Unresolved RLS", value: summary.unresolvedRlsEvents || 0, icon: Lock, color: "text-purple-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-1">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Event type breakdown */}
        {Object.keys(eventTypes).length > 0 && (
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><Bug className="h-4 w-4 text-accent" /> Event types (24h)</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(eventTypes).map(([type, count]) => (
                <span key={type} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs">
                  <span className="font-mono text-muted-foreground">{type}</span>
                  <span className="font-semibold text-accent">{String(count)}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent high/critical events */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-400" /> Recent High & Critical Events</h2>
          </div>
          <div className="divide-y divide-border">
            {(data?.recentHighCritical || []).length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No high or critical events detected.</div>
            ) : (
              (data.recentHighCritical || []).map((e) => {
                const style = SEVERITY_STYLES[e.severity] || SEVERITY_STYLES.info;
                return (
                  <div key={e.id} className="p-4 flex items-start gap-3">
                    <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold ${style.badge}`}>{style.label}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{e.event_type}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{e.reason}</div>
                      <div className="text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-2 flex-wrap">
                        {e.user_id && <span>user: {e.user_id.slice(0, 8)}…</span>}
                        {e.workspace_id && <span>ws: {e.workspace_id.slice(0, 8)}…</span>}
                        <span>{new Date(e.created_date).toLocaleString()}</span>
                      </div>
                    </div>
                    {!e.resolved && (
                      <button onClick={() => resolveEvent(e.id)} disabled={resolving === e.id} className="shrink-0 text-xs rounded-md border border-border px-2 py-1 hover:bg-accent/10 transition-colors disabled:opacity-50">
                        {resolving === e.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Resolve"}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RLS events */}
        {(data?.rlsEvents || []).length > 0 && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold flex items-center gap-2"><Lock className="h-4 w-4 text-purple-400" /> Unresolved RLS Denials</h2>
            </div>
            <div className="divide-y divide-border">
              {(data.rlsEvents || []).map((e) => (
                <div key={e.id} className="p-4 flex items-center gap-3">
                  <span className="shrink-0 rounded border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-mono text-purple-400">{e.operation || 'unknown'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium font-mono">{e.entity_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{e.error_message || 'No error message'}</div>
                  </div>
                  {e.status_code && <span className="shrink-0 text-xs text-muted-foreground">{e.status_code}</span>}
                  <span className="shrink-0 text-[10px] text-muted-foreground/60">{new Date(e.created_date).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info note */}
        <div className="rounded-lg border border-border bg-card p-4 flex items-start gap-3 text-xs text-muted-foreground">
          <Eye className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground mb-1">Boliviq Security Sentinel</p>
            <p>Defensive intrusion detection, abuse monitoring, and automated response. Continuously analyzes authentication failures, RLS denials, Stripe webhook signatures, credit operations, and coupon abuse patterns. Security events are retained as immutable records. This system is defensive only — it does not perform offensive actions or counter-attack.</p>
          </div>
        </div>
      </div>
    </div>
  );
}