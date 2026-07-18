import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TYPES = [
  ["investor", "Investor"], ["contractor", "Contractor"], ["homeowner", "Homeowner"],
  ["vendor", "Vendor"], ["agent", "Agent"], ["buyer", "Buyer"], ["seller", "Seller"], ["other", "Other"],
];
const STAGES = [
  ["new", "New"], ["contacted", "Contacted"], ["qualified", "Qualified"],
  ["proposal", "Proposal"], ["negotiation", "Negotiation"], ["won", "Won"], ["lost", "Lost"],
];

export default function ContactForm({ initial, onSubmit, onCancel }) {
  const [f, setF] = useState({
    full_name: initial?.full_name || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    company: initial?.company || "",
    role: initial?.role || "",
    type: initial?.type || "other",
    stage: initial?.stage || "new",
    notes: initial?.notes || "",
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!f.full_name.trim()) return;
    onSubmit(f);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label>Full name *</Label>
        <Input value={f.full_name} onChange={(e) => set("full_name", e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Email</Label><Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div><Label>Phone</Label><Input value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Company</Label><Input value={f.company} onChange={(e) => set("company", e.target.value)} /></div>
        <div><Label>Role</Label><Input value={f.role} onChange={(e) => set("role", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Type</Label>
          <Select value={f.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Stage</Label>
          <Select value={f.stage} onValueChange={(v) => set("stage", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STAGES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Notes</Label><Textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} rows={3} /></div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm rounded-md bg-accent text-accent-foreground font-semibold hover:opacity-90">Save</button>
      </div>
    </form>
  );
}