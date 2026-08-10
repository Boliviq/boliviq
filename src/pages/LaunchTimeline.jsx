import React from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

// Timeline data: current blockers + future risks, sequenced for a secure launch.
const PHASES = [
  {
    phase: "Phase 1 — Immediate Blockers",
    window: "Days 1–3",
    tone: "critical",
    items: [
      "Permissions banner leaking to public visitors (URGENT — first thing a reviewer sees)",
      "Anonymous queries to private tables (token_ledger + 7 unknown table names to capture)",
      "Supabase this-binding bug breaking onboarding & settings form submission",
    ],
  },
  {
    phase: "Phase 2 — Foundation Hardening",
    window: "Days 4–6",
    tone: "high",
    items: [
      "Reconcile env variable names (pick one scheme, old names as fallbacks)",
      "Verify all integrations live via Setup & Health page",
      "Confirm Stripe live webhook endpoint with a real signed event",
    ],
  },
  {
    phase: "Phase 3 — Code Quality Gate",
    window: "Days 7–10",
    tone: "high",
    items: [
      "Run format pass first (cosmetic, own commit)",
      "Type ~151 anys in batches of ≤5, typecheck after each",
      "Drive lint to zero errors/warnings without weakening rules",
    ],
  },
  {
    phase: "Phase 4 — Pre-Launch Security Audit",
    window: "Days 10–12",
    tone: "medium",
    items: [
      "Full RLS audit on every Supabase table (read/write/delete per role)",
      "Rotate any secrets that touched client bundles",
      "Verify no service-role key is ever used in client code",
    ],
  },
  {
    phase: "Phase 5 — Launch & Monitoring",
    window: "Days 13–14",
    tone: "medium",
    items: [
      "Smoke-test checkout, onboarding, and AI flows end-to-end",
      "Confirm Permissions Monitor captures denials silently for admins",
      "Publish with version checkpoint + rollback plan documented",
    ],
  },
];

const FUTURE_RISKS = [
  { risk: "RLS policy drift", detail: "As the schema evolves, new tables may ship without RLS — default to owner-scoped rules on every new table." },
  { risk: "Secret leakage via client bundles", detail: "Any VITE_-prefixed var is public; keep all keys server-side and refuse VITE_ prefixes in Setup & Health." },
  { risk: "Stripe webhook signature tolerance", detail: "Replay/tolerance windows can be abused; log every event and alert on unexpected types." },
  { risk: "AI token metering bypass", detail: "Unlimited plans skip deduction server-side — ensure the bypass is role/plan-gated and audited." },
  { risk: "Rate limiting & abuse", detail: "Public endpoints (marketplace, deal alerts) need rate limits before broad traffic." },
  { risk: "PWA offline gaps", detail: "App is online-only today; document this so users aren't surprised mid-transaction." },
];

function toneColor(tone) {
  return tone === "critical" ? [239, 68, 68] : tone === "high" ? [245, 158, 11] : [184, 242, 0];
}

function downloadPdf() {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const M = 48;
  let y = 56;

  // Header bar
  doc.setFillColor(12, 18, 33);
  doc.rect(0, 0, W, 84, "F");
  doc.setTextColor(184, 242, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("BOLIVIQ", M, 40);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.text("Launch Readiness Timeline", M, 60);
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(9);
  doc.text("Current problems → secure public launch", M, 74);
  y = 108;

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.text("Generated " + new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), M, y);
  y += 26;

  // Phases
  PHASES.forEach((p) => {
    const [r, g, b] = toneColor(p.tone);
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(3);
    doc.line(M, y, M, y + p.items.length * 34 + 8);
    doc.setFillColor(r, g, b);
    doc.circle(M, y, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(p.phase, M + 16, y + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(p.window, W - M, y + 2, { align: "right" });
    y += 18;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    p.items.forEach((it) => {
      const lines = doc.splitTextToSize("•  " + it, W - M * 2 - 16);
      doc.text(lines, M + 16, y);
      y += lines.length * 14;
    });
    y += 16;
  });

  // Future risks
  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(1);
  doc.line(M, y, W - M, y);
  y += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text("Future Risks to Watch", M, y);
  y += 18;
  doc.setFontSize(10);
  FUTURE_RISKS.forEach((f) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 60, 20);
    doc.text(f.risk, M, y);
    y += 13;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(f.detail, W - M * 2);
    doc.text(lines, M, y);
    y += lines.length * 13 + 10;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Confidential — Boliviq internal launch planning", M, doc.internal.pageSize.getHeight() - 28);

  doc.save("boliviq-launch-timeline.pdf");
}

export default function LaunchTimeline() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold">Launch Readiness Timeline</h1>
            <p className="text-sm text-muted-foreground mt-1">Current problems → secure public launch, sequenced by priority.</p>
          </div>
          <Button onClick={downloadPdf} className="gap-1.5 shrink-0">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>

        {/* Timeline */}
        <div className="relative pl-6 border-l-2 border-border space-y-8">
          {PHASES.map((p) => {
            const [r, g, b] = toneColor(p.tone);
            const dot = `rgb(${r} ${g} ${b})`;
            return (
              <div key={p.phase} className="relative">
                <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-background" style={{ background: dot }} />
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <h2 className="font-display font-semibold text-base">{p.phase}</h2>
                  <span className="text-xs text-muted-foreground shrink-0">{p.window}</span>
                </div>
                <ul className="space-y-1.5">
                  {p.items.map((it) => (
                    <li key={it} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Future risks */}
        <div className="mt-10 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-accent" />
            <h2 className="font-display font-semibold text-base">Future Risks to Watch</h2>
          </div>
          <div className="space-y-3">
            {FUTURE_RISKS.map((f) => (
              <div key={f.risk}>
                <div className="text-sm font-medium text-amber-400">{f.risk}</div>
                <div className="text-xs text-muted-foreground">{f.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Confidential — Boliviq internal launch planning
        </p>
      </div>
    </div>
  );
}