import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export const SECTIONS = [
  { id: "governance", label: "Governance & Constitution" },
  { id: "vision", label: "Vision, Brand & Strategy" },
  { id: "product", label: "Product & UX" },
  { id: "realestate", label: "Real Estate Intelligence" },
  { id: "construction", label: "Construction Intelligence" },
  { id: "crm", label: "CRM, Pipelines & Comms" },
  { id: "marketplace", label: "Marketplace & Ecosystem" },
  { id: "billing", label: "Plans, Billing & Revenue" },
  { id: "ai_agents", label: "AI Agents" },
  { id: "companies", label: "Companies & Integrations" },
  { id: "architecture", label: "Technical Architecture" },
  { id: "security", label: "Security, Privacy & Compliance" },
  { id: "operations", label: "Administration & Operations" },
  { id: "legal", label: "Legal, IP & Corporate" },
  { id: "roadmap", label: "Roadmap & Execution" },
  { id: "templates", label: "Reusable Templates" },
];

const sectionLabel = (id) => SECTIONS.find((s) => s.id === id)?.label || id;

export default function KnowledgeArticleForm({ initial, onSubmit, onCancel }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    section: "governance", title: "", subtitle: "", category: "", content: "",
    tags: "", sort_order: 0, status: "published", source: "manual", ...(initial || {}),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.section) {
      toast({ title: "Section, title, and content are required", variant: "destructive" });
      return;
    }
    onSubmit({
      ...form,
      sort_order: Number(form.sort_order) || 0,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="section">Section *</Label>
          <select id="section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {SECTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Deal Analysis Agent" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input id="subtitle" value={form.subtitle || ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Short one-line summary" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Agent / Company / Doc type" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">Content (Markdown) *</Label>
        <textarea id="content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={12} required
          placeholder="# Heading&#10;&#10;Write the article body in Markdown…"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" value={form.tags || ""} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="agent, valuation, v1" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sort">Sort order</Label>
          <Input id="sort" type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Save changes" : "Create article"}</Button>
      </div>
    </form>
  );
}