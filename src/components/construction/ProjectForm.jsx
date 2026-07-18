import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const STATUSES = ["planning", "in_progress", "on_hold", "completed", "cancelled"];
const sel = (value, onChange, options) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
    {options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
  </select>
);
const Field = ({ label, children }) => (
  <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>
);

export default function ProjectForm({ initial, properties, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    name: "", description: "", status: "planning", property_id: "",
    start_date: "", target_end_date: "", budget: "", spent: "", progress: 0,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      budget: form.budget ? Number(form.budget) : 0,
      spent: form.spent ? Number(form.spent) : 0,
      progress: Number(form.progress) || 0,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Project name *"><Input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="e.g. Kitchen remodel" /></Field>
      <Field label="Description"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Status">{sel(form.status, set.bind(null, "status"), STATUSES)}</Field>
        <Field label="Linked property">
          <select value={form.property_id} onChange={(e) => set("property_id", e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">None</option>
            {(properties || []).map((p) => <option key={p.id} value={p.id}>{p.address}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start date"><Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} /></Field>
        <Field label="Target end date"><Input type="date" value={form.target_end_date} onChange={(e) => set("target_end_date", e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Budget"><Input type="number" value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="0" /></Field>
        <Field label="Spent"><Input type="number" value={form.spent} onChange={(e) => set("spent", e.target.value)} placeholder="0" /></Field>
        <Field label="Progress %"><Input type="number" min="0" max="100" value={form.progress} onChange={(e) => set("progress", e.target.value)} /></Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save project</Button>
      </div>
    </form>
  );
}