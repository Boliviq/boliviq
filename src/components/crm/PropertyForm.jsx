import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = [
  ["lead", "Lead"], ["prospect", "Prospect"], ["under_contract", "Under Contract"],
  ["owned", "Owned"], ["listed", "Listed"], ["sold", "Sold"], ["archived", "Archived"],
];
const STRATEGIES = [
  ["buy_hold", "Buy & Hold"], ["fix_flip", "Fix & Flip"], ["wholesale", "Wholesale"],
  ["wholetail", "Wholetail"], ["brrrr", "BRRRR"], ["new_construction", "New Build"],
  ["land", "Land"], ["multifamily", "Multifamily"], ["creative", "Creative"],
];
const OCCUPANCY = [
  ["vacant", "Vacant"], ["owner_occupied", "Owner Occupied"],
  ["tenant_occupied", "Tenant Occupied"], ["unknown", "Unknown"],
];

export default function PropertyForm({ initial, onSubmit, onCancel }) {
  const [f, setF] = useState({
    address: initial?.address || "",
    street_address: initial?.street_address || "",
    city: initial?.city || "",
    state: initial?.state || "",
    zip_code: initial?.zip_code || "",
    status: initial?.status || "lead",
    deal_strategy: initial?.deal_strategy || "",
    property_type: initial?.property_type || "",
    occupancy: initial?.occupancy || "unknown",
    valuation: initial?.valuation ?? "",
    arv: initial?.arv ?? "",
    notes: initial?.notes || "",
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!f.address.trim()) return;
    onSubmit({
      ...f,
      valuation: f.valuation === "" ? null : Number(f.valuation),
      arv: f.arv === "" ? null : Number(f.arv),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="address">Address *</Label>
        <Input id="address" value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main St, Austin, TX" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>City</Label>
          <Input value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="Austin" />
        </div>
        <div>
          <Label>State</Label>
          <Input value={f.state} onChange={(e) => set("state", e.target.value)} placeholder="TX" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Street address</Label>
          <Input value={f.street_address} onChange={(e) => set("street_address", e.target.value)} placeholder="123 Main St" />
        </div>
        <div>
          <Label>ZIP code</Label>
          <Input value={f.zip_code} onChange={(e) => set("zip_code", e.target.value)} placeholder="78701" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Status</Label>
          <Select value={f.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Deal strategy</Label>
          <Select value={f.deal_strategy || "_none"} onValueChange={(v) => set("deal_strategy", v === "_none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">None</SelectItem>
              {STRATEGIES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Property type</Label>
          <Input value={f.property_type} onChange={(e) => set("property_type", e.target.value)} placeholder="Single family" />
        </div>
        <div>
          <Label>Occupancy</Label>
          <Select value={f.occupancy} onValueChange={(v) => set("occupancy", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{OCCUPANCY.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Valuation ($)</Label>
          <Input type="number" value={f.valuation} onChange={(e) => set("valuation", e.target.value)} placeholder="0" />
        </div>
        <div>
          <Label>ARV ($)</Label>
          <Input type="number" value={f.arv} onChange={(e) => set("arv", e.target.value)} placeholder="0" />
        </div>
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm rounded-md bg-accent text-accent-foreground font-semibold hover:opacity-90">Save</button>
      </div>
    </form>
  );
}