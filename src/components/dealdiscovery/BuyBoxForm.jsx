import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const STRATEGIES = [
  ["fix_flip", "Fix & Flip"], ["brrrr", "BRRRR"], ["rental", "Rental"],
  ["wholesale", "Wholesale"], ["buy_hold", "Buy & Hold"], ["development", "Development"],
  ["land", "Land"], ["value_add", "Value-add"],
];

export default function BuyBoxForm({ initial, onSubmit, onCancel }) {
  const [f, setF] = useState({
    name: initial?.name || "",
    markets: (initial?.markets || []).join(", "),
    max_price: initial?.max_price ?? "",
    min_profit: initial?.min_profit ?? "",
    min_roi_pct: initial?.min_roi_pct ?? "",
    strategies: initial?.strategies || [],
    monitor: initial?.monitor ?? false,
    auto_add_to_pipeline: initial?.auto_add_to_pipeline ?? false,
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const toggleStrategy = (s) => setF((prev) => ({
    ...prev,
    strategies: prev.strategies.includes(s) ? prev.strategies.filter((x) => x !== s) : [...prev.strategies, s],
  }));

  const submit = (e) => {
    e.preventDefault();
    if (!f.name.trim()) return;
    onSubmit({
      ...f,
      markets: f.markets.split(",").map((m) => m.trim()).filter(Boolean),
      max_price: f.max_price === "" ? null : Number(f.max_price),
      min_profit: f.min_profit === "" ? null : Number(f.min_profit),
      min_roi_pct: f.min_roi_pct === "" ? null : Number(f.min_roi_pct),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label>Buy Box name *</Label>
        <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Nashville flips under $350K" required />
      </div>
      <div>
        <Label>Markets (comma-separated cities, ZIPs, or keywords)</Label>
        <Input value={f.markets} onChange={(e) => set("markets", e.target.value)} placeholder="Nashville, 37013, East Nashville" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Max price ($)</Label>
          <Input type="number" value={f.max_price} onChange={(e) => set("max_price", e.target.value)} placeholder="350000" />
        </div>
        <div>
          <Label>Min profit ($)</Label>
          <Input type="number" value={f.min_profit} onChange={(e) => set("min_profit", e.target.value)} placeholder="75000" />
        </div>
        <div>
          <Label>Min ROI (%)</Label>
          <Input type="number" value={f.min_roi_pct} onChange={(e) => set("min_roi_pct", e.target.value)} placeholder="20" />
        </div>
      </div>
      <div>
        <Label className="mb-2 block">Strategies</Label>
        <div className="flex flex-wrap gap-2">
          {STRATEGIES.map(([v, l]) => (
            <button
              type="button"
              key={v}
              onClick={() => toggleStrategy(v)}
              className={`text-xs`}
            >
              <Badge variant={f.strategies.includes(v) ? "default" : "outline"} className="cursor-pointer">{l}</Badge>
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-md border border-input px-3 py-2.5">
        <div>
          <Label className="text-sm">Monitor this Buy Box</Label>
          <p className="text-xs text-muted-foreground">Boliviq checks connected sources daily and notifies you of new matches.</p>
        </div>
        <Switch checked={f.monitor} onCheckedChange={(v) => set("monitor", v)} />
      </div>
      {f.monitor && (
        <div className="flex items-center justify-between rounded-md border border-input px-3 py-2.5">
          <div>
            <Label className="text-sm">Auto-add strong matches to pipeline</Label>
            <p className="text-xs text-muted-foreground">Matches scoring 65+ are created as new leads automatically. Boliviq never contacts sellers or agents on your behalf.</p>
          </div>
          <Switch checked={f.auto_add_to_pipeline} onCheckedChange={(v) => set("auto_add_to_pipeline", v)} />
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm rounded-md bg-accent text-accent-foreground font-semibold hover:opacity-90">Save Buy Box</button>
      </div>
    </form>
  );
}
