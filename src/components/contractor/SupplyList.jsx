import React from "react";
import { Plus, Trash2 } from "lucide-react";

export default function SupplyList({ items, onChange }) {
  const update = (i, field, val) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: field === "name" ? val : Number(val) || 0 };
    onChange(next);
  };
  const add = () => onChange([...items, { name: "", quantity: 1, unit_cost: 0 }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const subtotal = items.reduce((s, it) => s + (it.quantity || 0) * (it.unit_cost || 0), 0);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Supplies / Materials List</h3>
        <button onClick={add} className="inline-flex items-center gap-1 text-sm text-accent"><Plus className="h-4 w-4" /> Add supply</button>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input className="col-span-6 rounded-md border border-input bg-background px-2 py-1.5 text-sm" placeholder="Material / supply name" value={it.name} onChange={(e) => update(i, "name", e.target.value)} />
            <input type="number" min="0" className="col-span-2 rounded-md border border-input bg-background px-2 py-1.5 text-sm" placeholder="Qty" value={it.quantity} onChange={(e) => update(i, "quantity", e.target.value)} />
            <input type="number" min="0" className="col-span-3 rounded-md border border-input bg-background px-2 py-1.5 text-sm" placeholder="Unit cost" value={it.unit_cost} onChange={(e) => update(i, "unit_cost", e.target.value)} />
            <button onClick={() => remove(i)} className="col-span-1 flex justify-center text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">No supplies yet.</p>}
      </div>
      <div className="mt-3 text-sm text-right">Materials subtotal: <span className="font-semibold text-accent">${subtotal.toLocaleString()}</span></div>
    </div>
  );
}