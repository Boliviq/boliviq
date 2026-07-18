import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "contracting", "renovation", "roofing", "plumbing", "electrical", "hvac",
  "landscaping", "cleaning", "photography", "staging", "legal", "financing",
  "insurance", "marketing", "materials", "equipment", "other",
];
const TYPES = ["service", "material", "equipment", "labor", "other"];
const PRICING = ["fixed", "hourly", "per_project", "quote", "monthly"];
const AVAIL = ["available", "limited", "booked", "unavailable"];

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
  >
    {options.map((o) => (
      <option key={o} value={o}>{o.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
    ))}
  </select>
);

export default function ListingForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    title: "", description: "", category: "contracting", listing_type: "service",
    provider_name: "", provider_contact: "", location: "", service_area: "",
    pricing_model: "quote", price: "", availability: "available", tags: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      price: form.price ? Number(form.price) : undefined,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title *">
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="e.g. Full-home renovation crew" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category"><Select value={form.category} onChange={(v) => set("category", v)} options={CATEGORIES} /></Field>
        <Field label="Type"><Select value={form.listing_type} onChange={(v) => set("listing_type", v)} options={TYPES} /></Field>
      </div>
      <Field label="Description">
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="What's offered, scope, specialties…" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Provider name"><Input value={form.provider_name} onChange={(e) => set("provider_name", e.target.value)} /></Field>
        <Field label="Provider contact"><Input value={form.provider_contact} onChange={(e) => set("provider_contact", e.target.value)} placeholder="phone or email" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Location"><Input value={form.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Service area"><Input value={form.service_area} onChange={(e) => set("service_area", e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Pricing"><Select value={form.pricing_model} onChange={(v) => set("pricing_model", v)} options={PRICING} /></Field>
        <Field label="Price"><Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0" /></Field>
        <Field label="Availability"><Select value={form.availability} onChange={(v) => set("availability", v)} options={AVAIL} /></Field>
      </div>
      <Field label="Tags (comma-separated)"><Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="licensed, insured, emergency" /></Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save listing</Button>
      </div>
    </form>
  );
}