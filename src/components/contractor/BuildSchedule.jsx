import React from "react";
import { Plus, Trash2 } from "lucide-react";

export default function BuildSchedule({ items, onChange }) {
  const update = (i, field, val) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: field === "phase" ? val : Number(val) || 0 };
    onChange(next);
  };
  const add = () => onChange([...items, { phase: "", days: 1 }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const rawDays = items.reduce((s, it) => s + (Number(it.days) || 0), 0);
  const buffered = Math.ceil(rawDays * 1.2);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Build Schedule</h3>
        <button onClick={add} className="inline-flex items-center gap-1 text-sm text-accent"><Plus className="h-4 w-4" /> Add phase</button>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input className="col-span-9 rounded-md border border-input bg-background px-2 py-1.5 text-sm" placeholder="Phase / task (e.g. Demo, Framing, Drywall)" value={it.phase} onChange={(e) => update(i, "phase", e.target.value)} />
            <input type="number" min="0" className="col-span-2 rounded-md border border-input bg-background px-2 py-1.5 text-sm" placeholder="Days" value={it.days} onChange={(e) => update(i, "days", e.target.value)} />
            <button onClick={() => remove(i)} className="col-span-1 flex justify-center text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">No phases yet.</p>}
      </div>
      <div className="mt-3 flex items-center justify-end gap-3 text-sm">
        <span>Estimated: <span className="font-semibold">{rawDays} days</span></span>
        <span className="rounded-full bg-accent/10 border border-accent/30 px-2.5 py-1 text-accent font-semibold">+20% → {buffered} days</span>
      </div>
    </div>
  );
}