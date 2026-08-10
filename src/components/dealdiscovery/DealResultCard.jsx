import React from "react";
import { MapPin, TrendingUp, Loader2, Bookmark, Calculator, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const money = (n) => (n == null ? "—" : "$" + Number(n).toLocaleString());
const scoreTone = (s) => (s >= 80 ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" : s >= 60 ? "text-accent border-accent/40 bg-accent/10" : "text-muted-foreground border-border bg-white/[0.02]");

export default function DealResultCard({ deal, busyAction, onView, onAnalyze, onSaveToCrm, onAddToPipeline }) {
  const isOwn = deal.source === "Your workspace";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-semibold text-sm">
            <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="truncate">{deal.address || "Address not disclosed"}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {[deal.city, deal.state].filter(Boolean).join(", ")}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">{deal.source}</Badge>
            <Badge variant="outline" className="text-[10px] capitalize">{(deal.source_type || "off_market").replace("_", " ")}</Badge>
            {deal.deal_strategy && <Badge variant="secondary" className="text-[10px] capitalize">{deal.deal_strategy.replace(/_/g, " ")}</Badge>}
            {deal.distress_indicators?.map((d) => (
              <Badge key={d} variant="outline" className="text-[10px] capitalize border-amber-500/40 text-amber-400">{d.replace(/_/g, " ")}</Badge>
            ))}
          </div>
        </div>
        <div className={`shrink-0 rounded-full border px-2.5 py-1 text-center text-xs font-bold ${scoreTone(deal.deal_score)}`}>
          {deal.deal_score}<span className="block text-[9px] font-normal opacity-70">/100</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div><span className="block text-[10px] uppercase tracking-wide">Asking</span><span className="text-foreground font-medium">{money(deal.asking_price ?? deal.valuation)}</span></div>
        <div><span className="block text-[10px] uppercase tracking-wide">ARV</span><span className="text-foreground font-medium">{money(deal.arv)}</span></div>
        <div><span className="block text-[10px] uppercase tracking-wide">Est. profit</span><span className="text-foreground font-medium">{money(deal.estimated_profit)}</span></div>
      </div>

      {deal.score_reasons?.length > 0 && (
        <ul className="mt-3 space-y-1">
          {deal.score_reasons.slice(0, 3).map((r, i) => (
            <li key={i} className="text-xs text-white/60 flex gap-1.5">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent/60" /> {r}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onView(deal)}>
          <Eye className="h-3 w-3" /> View
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAnalyze(deal)} disabled={busyAction === `analyze-${deal.id}`}>
          {busyAction === `analyze-${deal.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Calculator className="h-3 w-3" />} Run Analysis
        </Button>
        {!isOwn && (
          <>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onSaveToCrm(deal)} disabled={busyAction === `save-${deal.id}`}>
              {busyAction === `save-${deal.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bookmark className="h-3 w-3" />} Save to CRM
            </Button>
            <Button size="sm" className="h-7 text-xs gap-1" onClick={() => onAddToPipeline(deal)} disabled={busyAction === `pipeline-${deal.id}`}>
              {busyAction === `pipeline-${deal.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />} Add to Pipeline
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
