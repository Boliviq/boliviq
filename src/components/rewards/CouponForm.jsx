import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CouponForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    code: "", description: "", discount_type: "credits", value: "", max_uses: "1", expires_at: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      code: form.code.toUpperCase().trim(),
      value: Number(form.value) || 0,
      max_uses: Number(form.max_uses) || 1,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Code *</Label>
        <Input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} required placeholder="WELCOME100" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Description</Label>
        <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="New user bonus" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Type</Label>
          <select value={form.discount_type} onChange={(e) => set("discount_type", e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="credits">Credits (grant)</option>
            <option value="percent">Percent (checkout)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">{form.discount_type === "credits" ? "Credits *" : "Percent *"}</Label>
          <Input type="number" value={form.value} onChange={(e) => set("value", e.target.value)} required placeholder="100" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Max uses</Label>
          <Input type="number" value={form.max_uses} onChange={(e) => set("max_uses", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Expires</Label>
          <Input type="date" value={form.expires_at} onChange={(e) => set("expires_at", e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Create coupon</Button>
      </div>
    </form>
  );
}