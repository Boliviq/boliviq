import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Lock, FlaskConical, Save, Eye, EyeOff, ShieldCheck, AlertTriangle, XCircle, ExternalLink } from "lucide-react";

const MODE_KEY = "boliviq.stripe.mode";
const MODEL_KEY = "boliviq.openai.model";

// Each row: status light, description, masked input, Save + Test.
const ROWS = [
  { id: "stripe_live_secret", service: "stripe_account", mode: "live", label: "Stripe Live Secret Key", help: "Used for real charges. Stored as STRIPE_SECRET_KEY.", placeholder: "sk_live_…" },
  { id: "stripe_live_webhook", service: "stripe_webhook", mode: "live", label: "Stripe Live Webhook Secret", help: "Verifies signed webhook events. Stored as STRIPE_WEBHOOK_SECRET.", placeholder: "whsec_…" },
  { id: "stripe_test_secret", service: "stripe_account", mode: "test", label: "Stripe Sandbox Secret Key", help: "Used for test charges. Stored as STRIPE_TEST_SECRET_KEY.", placeholder: "sk_test_…" },
  { id: "stripe_test_webhook", service: "stripe_webhook", mode: "test", label: "Stripe Sandbox Webhook Secret", help: "Verifies test webhook events. Stored as STRIPE_TEST_WEBHOOK_SECRET.", placeholder: "whsec_…" },
  { id: "openai_key", service: "openai", mode: "live", label: "OpenAI API Key", help: "Powers AI features. Stored as OPENAI_API_KEY.", placeholder: "sk-…" },
];

function Light({ state }) {
  if (state === "ok") return <span className="flex items-center gap-1.5 text-emerald-400 text-xs"><ShieldCheck className="h-4 w-4" /> OK</span>;
  if (state === "missing") return <span className="flex items-center gap-1.5 text-amber-400 text-xs"><AlertTriangle className="h-4 w-4" /> Not set</span>;
  if (state === "error") return <span className="flex items-center gap-1.5 text-red-400 text-xs"><XCircle className="h-4 w-4" /> Failed</span>;
  return <span className="flex items-center gap-1.5 text-muted-foreground text-xs"><span className="h-3 w-3 rounded-full bg-muted-foreground/40" /> Unknown</span>;
}

export default function SetupHealth() {
  const { role, loading: wsLoading } = useWorkspace();
  const { toast } = useToast();
  const [mode, setMode] = useState(() => localStorage.getItem(MODE_KEY) === "test" ? "test" : "live");
  const [model, setModel] = useState(() => localStorage.getItem(MODEL_KEY) || "gpt-4o-mini");
  const [values, setValues] = useState({});
  const [reveal, setReveal] = useState({});
  const [states, setStates] = useState({});
  const [testing, setTesting] = useState({});
  const [rejectMsg, setRejectMsg] = useState({});

  const isAdmin = role === "owner" || role === "admin";

  const runTest = useCallback(async (row, usePasted) => {
    setTesting((s) => ({ ...s, [row.id]: true }));
    try {
      const payload = { service: row.service, mode: row.mode };
      if (usePasted && values[row.id]) payload.value = values[row.id];
      if (row.service === "openai") payload.model = model;
      const res = await base44.functions.invoke("setupHealth", payload);
      const data = res.data || res;
      setStates((s) => ({ ...s, [row.id]: data.status || "error" }));
      toast({
        title: data.status === "ok" ? "Test passed" : data.status === "missing" ? "Not configured" : "Test failed",
        description: data.detail || data.error,
        variant: data.status === "ok" ? "default" : "destructive",
      });
    } catch (err) {
      setStates((s) => ({ ...s, [row.id]: "error" }));
      toast({ title: "Test failed", description: err.message, variant: "destructive" });
    } finally {
      setTesting((s) => ({ ...s, [row.id]: false }));
    }
  }, [values, model]);

  // On mount, test every stored secret (no pasted values) so lights reflect reality.
  useEffect(() => {
    if (!isAdmin) return;
    ROWS.forEach((row) => runTest(row, false));
  }, [isAdmin]);

  const onInputChange = (row, val) => {
    setValues((v) => ({ ...v, [row.id]: val }));
    // Refuse any value that looks like a VITE_-prefixed env var name/value.
    if (/^VITE_/.test(val.trim())) {
      setRejectMsg((m) => ({ ...m, [row.id]: "Secret keys must not use a VITE_ prefix — that would expose them to the client." }));
    } else {
      setRejectMsg((m) => ({ ...m, [row.id]: null }));
    }
  };

  const save = (row) => {
    if (row.id === "openai_model") {
      localStorage.setItem(MODEL_KEY, model);
      toast({ title: "Saved", description: "OpenAI chat model saved for this browser." });
      return;
    }
    // Secret values cannot be written from app code — route to the dashboard.
    toast({
      title: "Manage secrets in the dashboard",
      description: "Base44 secrets are set under Settings → Environment Variables. Use Test to verify a pasted value first.",
    });
  };

  if (wsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppTopBar />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h1 className="font-display text-xl font-semibold mb-1">Admins only</h1>
          <p className="text-sm text-muted-foreground">Setup & Health is only visible to workspace owners and admins.</p>
        </div>
      </div>
    );
  }

  const activeRows = ROWS.filter((r) => r.service !== "openai" || true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/10"><ShieldCheck className="h-4 w-4 text-accent" /></span>
          <div>
            <h1 className="font-display text-2xl font-bold">Setup & Health</h1>
            <p className="text-sm text-muted-foreground">Verify every integration live. Secrets are managed in the Base44 dashboard.</p>
          </div>
        </div>

        {/* Stripe mode toggle */}
        <div className="rounded-lg border border-border bg-card p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-sm">Stripe mode</div>
            <div className="text-xs text-muted-foreground">Switch between live and sandbox keys. Applies to the rows below.</div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={mode === "live" ? "default" : "outline"}>{mode === "live" ? "Live" : "Sandbox"}</Badge>
            <Switch
              checked={mode === "live"}
              onCheckedChange={(checked) => {
                const m = checked ? "live" : "test";
                setMode(m);
                localStorage.setItem(MODE_KEY, m);
              }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {activeRows.map((row) => {
            const active = (row.service === "openai") || (row.mode === mode);
            return (
              <div key={row.id} className={`p-4 ${active ? "" : "opacity-50"}`}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm flex items-center gap-2">{row.label} <Light state={states[row.id]} /></div>
                    <div className="text-xs text-muted-foreground">{row.help}</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type={reveal[row.id] ? "text" : "password"}
                      value={values[row.id] || ""}
                      onChange={(e) => onInputChange(row, e.target.value)}
                      placeholder={row.placeholder}
                      className="w-full rounded-md border border-input bg-background pl-3 pr-9 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button type="button" onClick={() => setReveal((r) => ({ ...r, [row.id]: !r[row.id] }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {reveal[row.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => save(row)} className="gap-1.5"><Save className="h-4 w-4" /> Save</Button>
                  <Button size="sm" onClick={() => runTest(row, !!values[row.id])} disabled={testing[row.id]} className="gap-1.5">
                    {testing[row.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />} Test
                  </Button>
                </div>
                {rejectMsg[row.id] && <div className="text-xs text-red-400 mt-1.5">{rejectMsg[row.id]}</div>}
              </div>
            );
          })}

          {/* OpenAI model (non-secret, browser-saved) */}
          <div className="p-4">
            <div className="font-medium text-sm mb-1">OpenAI Chat Model</div>
            <div className="text-xs text-muted-foreground mb-2">Model used by the OpenAI test above and stored per-browser.</div>
            <div className="flex gap-2">
              <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-4o-mini"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              <Button variant="outline" size="sm" onClick={() => save({ id: "openai_model" })} className="gap-1.5"><Save className="h-4 w-4" /> Save</Button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-card p-4 text-sm">
          <div className="font-medium mb-1">Where do I set secrets?</div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Base44 secrets live in the dashboard under <span className="text-foreground font-medium">Settings → Environment Variables</span> — they cannot be written from app code.
            Paste a value above and press <span className="text-foreground font-medium">Test</span> to verify it before saving it there. Secret keys are never exposed to the client and must not use a <code className="font-mono">VITE_</code> prefix.
          </p>
          <a href="https://app.base44.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent text-xs mt-2 hover:underline">
            Open Base44 dashboard <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="mt-4 text-center">
          <Link to="/admin/permissions-monitor" className="text-xs text-muted-foreground hover:text-accent">View the Permissions Monitor →</Link>
        </div>
      </div>
    </div>
  );
}