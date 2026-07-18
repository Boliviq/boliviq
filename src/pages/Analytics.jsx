import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MapPin, Building2, Wrench, Users, TrendingUp } from "lucide-react";
import CategoryPie from "@/components/analytics/CategoryPie";
import BudgetBar from "@/components/analytics/BudgetBar";

const STATUSES = ["lead", "prospect", "under_contract", "owned", "listed", "sold"];
const STRATEGIES = ["buy_hold", "fix_flip", "wholesale", "wholetail", "brrrr", "new_construction", "land", "multifamily", "creative"];
const CONTACT_TYPES = ["investor", "contractor", "homeowner", "vendor", "agent", "buyer", "seller", "other"];
const money = (n) => (n ? "$" + Number(n).toLocaleString() : "$0");

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4 text-accent" /><span className="text-xs uppercase tracking-wide">{label}</span></div>
      <div className="mt-2 text-xl font-bold">{value}</div>
    </div>
  );
}

export default function Analytics() {
  const { activeWorkspaceId, loading: wsLoading } = useWorkspace();
  const [data, setData] = useState({ properties: [], projects: [], contacts: [], listings: [] });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!activeWorkspaceId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      base44.entities.Property.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 300).catch(() => []),
      base44.entities.ConstructionProject.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 100).catch(() => []),
      base44.entities.Contact.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 300).catch(() => []),
      base44.entities.MarketplaceListing.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 100).catch(() => []),
    ]).then(([p, pr, c, l]) => setData({ properties: p || [], projects: pr || [], contacts: c || [], listings: l || [] }))
      .catch(() => toast({ title: "Could not load analytics", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [activeWorkspaceId]);

  const charts = useMemo(() => {
    const { properties, projects, contacts, listings } = data;
    const byStatus = STATUSES.map((s) => ({ name: s.replace(/_/g, " "), value: properties.filter((p) => (p.status || "lead") === s).length }));
    const byStrategy = STRATEGIES.map((s) => ({ name: s.replace(/_/g, " "), value: properties.filter((p) => p.deal_strategy === s).length }));
    const byType = CONTACT_TYPES.map((t) => ({ name: t, value: contacts.filter((c) => (c.type || "other") === t).length }));
    const byListingCat = ["contracting", "renovation", "roofing", "plumbing", "electrical", "hvac", "materials", "equipment", "other"].map((c) => ({ name: c, value: listings.filter((l) => l.category === c).length }));
    const projectBudget = projects.slice(0, 8).map((p) => ({ name: p.name.length > 14 ? p.name.slice(0, 12) + "…" : p.name, budget: Number(p.budget) || 0, spent: Number(p.spent) || 0 }));
    return { byStatus, byStrategy, byType, byListingCat, projectBudget };
  }, [data]);

  const kpis = useMemo(() => {
    const pipelineValue = data.properties.reduce((s, p) => s + (Number(p.valuation) || 0), 0);
    const arvTotal = data.properties.reduce((s, p) => s + (Number(p.arv) || 0), 0);
    const overBudget = data.projects.filter((p) => p.budget && (p.spent || 0) > p.budget).length;
    return { pipelineValue, arvTotal, overBudget };
  }, [data]);

  if (wsLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  if (!activeWorkspaceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center"><p className="mb-4 text-muted-foreground">Select a workspace first.</p><Link to="/workspaces" className="text-accent font-semibold">Go to Workspaces →</Link></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <h1 className="font-display text-2xl font-bold mb-1">Analytics</h1>
        <p className="text-sm text-muted-foreground mb-6">Portfolio, construction, contacts, and marketplace insights.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Stat icon={MapPin} label="Properties" value={data.properties.length} />
          <Stat icon={TrendingUp} label="Pipeline value" value={money(kpis.pipelineValue)} />
          <Stat icon={Building2} label="Total ARV" value={money(kpis.arvTotal)} />
          <Stat icon={Wrench} label="Over budget" value={kpis.overBudget} />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <CategoryPie data={charts.byStatus} title="Deals by stage" />
          <CategoryPie data={charts.byStrategy} title="Deals by strategy" />
          <CategoryPie data={charts.byType} title="Contacts by type" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <BudgetBar data={charts.projectBudget} title="Project budget vs spent" />
          <CategoryPie data={charts.byListingCat} title="Marketplace by category" />
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <Stat icon={Building2} label="Projects" value={data.projects.length} />
          <Stat icon={Users} label="Contacts" value={data.contacts.length} />
          <Stat icon={Wrench} label="Listings" value={data.listings.length} />
        </div>
      </div>
    </div>
  );
}