import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const STATUSES = ["todo", "in_progress", "done", "blocked"];
const Field = ({ label, children }) => (
  <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>
);

export default function TaskForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    title: "", description: "", status: "todo", assignee: "", due_date: "", cost_estimate: "", actual_cost: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      cost_estimate: form.cost_estimate ? Number(form.cost_estimate) : 0,
      actual_cost: form.actual_cost ? Number(form.actual_cost) : 0,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Task *"><Input value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="e.g. Demolition" /></Field>
      <Field label="Description"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Status">
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
          </select>
        </Field>
        <Field label="Assignee"><Input value={form.assignee} onChange={(e) => set("assignee", e.target.value)} placeholder="name / crew" /></Field>
      </div>
      <Field label="Due date"><Input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Est. cost"><Input type="number" value={form.cost_estimate} onChange={(e) => set("cost_estimate", e.target.value)} placeholder="0" /></Field>
        <Field label="Actual cost"><Input type="number" value={form.actual_cost} onChange={(e) => set("actual_cost", e.target.value)} placeholder="0" /></Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save task</Button>
      </div>
    </form>
  );
}