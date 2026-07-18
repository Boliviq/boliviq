import React from "react";
import { MapPin, DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STRATEGY_LABELS = {
  buy_hold: "Buy & Hold", fix_flip: "Fix & Flip", wholesale: "Wholesale",
  wholetail: "Wholetail", brrrr: "BRRRR", new_construction: "New Build",
  land: "Land", multifamily: "Multifamily", creative: "Creative",
};

export default function PropertyCard({ property, onClick, dragging }) {
  const p = property;
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border border-border bg-background p-3 hover:border-accent/50 transition-colors ${dragging ? "shadow-lg ring-1 ring-accent/40" : ""}`}
    >
      <div className="flex items-start gap-1.5 text-sm font-semibold">
        <MapPin className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
        <span className="line-clamp-2">{p.address || "Untitled"}</span>
      </div>
      {p.deal_strategy && (
        <div className="mt-2">
          <Badge variant="secondary" className="text-[10px]">{STRATEGY_LABELS[p.deal_strategy] || p.deal_strategy}</Badge>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{p.valuation ? Number(p.valuation).toLocaleString() : "—"}</span>
        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{p.arv ? Number(p.arv).toLocaleString() : "—"}</span>
      </div>
    </div>
  );
}