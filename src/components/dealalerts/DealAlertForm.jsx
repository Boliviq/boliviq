import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const DEAL_TYPES = ["buy_hold", "fix_flip", "wholesale", "wholetail", "brrrr", "new_construction", "land", "multifamily", "creative"];
const CATEGORIES = ["contracting", "renovation", "roofing", "plumbing", "electrical", "hvac", "landscaping", "cleaning", "photography", "staging", "legal", "financing", "insurance", "marketing", "materials", "equipment", "other"];

const pretty = (s) => s.replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase());

export default function DealAlertForm({ initial, onSubmit, onCancel }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    location: "", deal_types: [], categories: [], min_price: "", max_price: "",
    status: "active", ...(initial || {}),
  });

  const toggle = (key, val) => {
    setForm((f) => {
      const arr = f[key] || [];
      return { ...f, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.location.trim()) { toast({ title: "Enter an area to watch", variant: "destructive" }); return; }
    onSubmit({
      ...form,
      min_price: form.min_price ? Number(form.min_price) : undefined,
      max_price: form.max_price ? Number(form.max_price) : undefined,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="location">Area to watch *</Label>
        <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, ZIP, or keyword (e.g. Austin, 78701, Dallas TX)" required />
        <p className="text-xs text-muted-foreground">Matched against address, location, and service area of new deals and listings.</p>
      </div>

      <div className="space-y-1.5">
        <Label>Deal types (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {DEAL_TYPES.map((d) => (
            <button type="button" key={d} onClick={() => toggle("deal_types", d)} className={`rounded-full border px-3 py-1 text-xs capitalize ${form.deal_types?.includes(d) ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground"}`}>{pretty(d)}</button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Leave empty to match all deal types.</p>
      </div>

      <div className="space-y-1.5">
        <Label>Listing categories (optional)</Label>
        <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
          {CATEGORIES.map((c) => (
            <button type="button" key={c} onClick={() => toggle("categories", c)} className={`rounded-full border px-3 py-1 text-xs ${form.categories?.includes(c) ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground"}`}>{pretty(c)}</button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Leave empty to match all categories.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="min">Min price</Label>
          <Input id="min" type="number" value={form.min_price ?? ""} onChange={(e) => setForm({ ...form, min_price: e.target.value })} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="max">Max price</Label>
          <Input id="max" type="number" value={form.max_price ?? ""} onChange={(e) => setForm({ ...form, max_price: e.target.value })} placeholder="No limit" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Save changes" : "Create alert"}</Button>
      </div>
    </form>
  );
}