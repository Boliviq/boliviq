import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AppTopBar from "@/components/AppTopBar";
import { ShieldCheck, CheckCircle2, XCircle, Loader2, RefreshCw, AlertTriangle, Lock } from "lucide-react";

export default function SecurityAudit() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("securityAudit", {});
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
              <ShieldCheck className="h-5 w-5 text-accent" />
            </span>
            <div>
              <h1 className="font-display text-xl font-bold">Security Audit</h1>
              <p className="text-sm text-muted-foreground">Phase 4 pre-launch security posture verification</p>
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
            <div className={`rounded-lg border p-5 mb-6 ${data.overall === "secure" ? "border-accent/40 bg-accent/5" : "border-destructive/40 bg-destructive/5"}`}>
              <div className="flex items-center gap-3">
                {data.overall === "secure" ? (
                  <Lock className="h-6 w-6 text-accent" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                )}
                <div>
                  <div className="text-lg font-semibold">
                    {data.overall === "secure" ? "All security checks passed" : "Security issues detected"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {data.passed} of {data.total} checks passed · Last checked {new Date(data.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
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
          </>
        )}
      </div>
    </div>
  );
}