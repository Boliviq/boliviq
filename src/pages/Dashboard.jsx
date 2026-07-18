import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, TrendingUp, MapPin, Coins, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const STATUS_COLORS = {
  lead: "hsl(var(--chart-2))",
  prospect: "hsl(var(--chart-3))",
  under_contract: "hsl(var(--chart-4))",
  owned: "hsl(var(--chart-1))",
  listed: "hsl(var(--chart-5))",
  sold: "#22c55e",
};
const STATUS_LABELS = {
  lead: "Leads", prospect: "Prospects", under_contract: "Under Contract",
  owned: "Owned", listed: "Listed", sold: "Sold",
};

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`h-4 w-4 ${accent ? "text-accent" : ""}`} />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { activeWorkspaceId, loading: wsLoading } = useWorkspace();
  const [properties, setProperties] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!activeWorkspaceId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      base44.entities.Property.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 200).catch(() => []),
      base44.entities.Contact.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 200).catch(() => []),
    ]).then(([p, c]) => { setProperties(p || []); setContacts(c || []); })
      .catch(() => toast({ title: "Could not load dashboard", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [activeWorkspaceId]);

  const stats = useMemo(() => {
    const pipelineValue = properties.reduce((s, p) => s + (Number(p.valuation) || 0), 0);
    const arvTotal = properties.reduce((s, p) => s + (Number(p.arv) || 0), 0);
    const profitPotential = properties.reduce((s, p) => s + ((Number(p.arv) || 0) - (Number(p.valuation) || 0)), 0);
    const byStatus = Object.keys(STATUS_LABELS).map((k) => ({ name: STATUS_LABELS[k], key: k, value: properties.filter((p) => (p.status || "lead") === k).length }));
    return { pipelineValue, arvTotal, profitPotential, byStatus };
  }, [properties]);

  if (wsLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  }
  if (!activeWorkspaceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center"><p className="mb-4 text-muted-foreground">Select a workspace first.</p><Link to="/workspaces" className="text-accent font-semibold">Go to Workspaces →</Link></div>
      </div>
    );
  }

  const money = (n) => n ? "$" + Number(n).toLocaleString() : "$0";
  const activeDeals = stats.byStatus.filter((s) => s.key !== "sold");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">Investor Dashboard</h1>
            <p className="text-sm text-muted-foreground">Portfolio overview and pipeline health.</p>
          </div>
          <Link to="/properties" className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Add property
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Stat icon={MapPin} label="Properties" value={properties.length} accent />
          <Stat icon={TrendingUp} label="Pipeline value" value={money(stats.pipelineValue)} />
          <Stat icon={BarChart3} label="Total ARV" value={money(stats.arvTotal)} />
          <Stat icon={Coins} label="Profit potential" value={money(stats.profitPotential)} />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-5 lg:col-span-1">
            <h2 className="font-semibold mb-4">Deals by stage</h2>
            {properties.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deals yet.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.byStatus.filter((s) => s.value > 0)} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {stats.byStatus.filter((s) => s.value > 0).map((s) => <Cell key={s.key} fill={STATUS_COLORS[s.key]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {stats.byStatus.map((s) => (
                <div key={s.key} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[s.key] }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="ml-auto font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
            <h2 className="font-semibold mb-4">Recent properties</h2>
            {properties.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add your first property to see it here.</p>
            ) : (
              <div className="divide-y divide-border">
                {properties.slice(0, 6).map((p) => (
                  <Link key={p.id} to="/properties" className="flex items-center gap-3 py-2.5 hover:bg-background/50 -mx-2 px-2 rounded-md">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{p.address}</div>
                      <div className="text-xs text-muted-foreground capitalize">{(p.deal_strategy || "—").replace(/_/g, " ")} · {(p.status || "").replace(/_/g, " ")}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{p.valuation ? money(p.valuation) : "—"}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}