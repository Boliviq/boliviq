import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Trash2, FileText } from "lucide-react";
import EstimateCalculator from "@/components/contractor/EstimateCalculator";
import SupplyList from "@/components/contractor/SupplyList";
import BuildSchedule from "@/components/contractor/BuildSchedule";

function Stat({ label, value, accent, hint }) {
  return (
    <div className={`rounded-lg border p-4 ${accent ? "border-accent/40 bg-accent/[0.06]" : "border-border bg-card"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-display text-lg font-bold ${accent ? "text-accent" : ""}`}>{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

const emptyLine = { description: "", quantity: 1, unit_cost: 0 };
const emptySupply = { name: "", quantity: 1, unit_cost: 0 };
const emptyPhase = { phase: "", days: 1 };

export default function ContractorTools() {
  const { activeWorkspaceId, loading: wsLoading } = useWorkspace();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [scope, setScope] = useState([emptyLine]);
  const [supplies, setSupplies] = useState([emptySupply]);
  const [schedule, setSchedule] = useState([emptyPhase]);
  const [estimates, setEstimates] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!activeWorkspaceId) return;
    try {
      const data = await base44.entities.JobEstimate.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 50);
      setEstimates(data || []);
    } catch { /* ignore */ }
  };
  useEffect(() => { load(); }, [activeWorkspaceId]);

  const laborCost = useMemo(() => scope.reduce((s, it) => s + (it.quantity || 0) * (it.unit_cost || 0), 0), [scope]);
  const materialsCost = useMemo(() => supplies.reduce((s, it) => s + (it.quantity || 0) * (it.unit_cost || 0), 0), [supplies]);
  const rawDays = useMemo(() => schedule.reduce((s, it) => s + (Number(it.days) || 0), 0), [schedule]);
  const bufferedDays = useMemo(() => Math.ceil(rawDays * 1.2), [rawDays]);
  const totalCost = laborCost + materialsCost;

  const reset = () => {
    setName(""); setScope([emptyLine]); setSupplies([emptySupply]); setSchedule([emptyPhase]);
  };

  const save = async () => {
    if (!name.trim()) { toast({ title: "Name the estimate first", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await base44.entities.JobEstimate.create({
        workspace_id: activeWorkspaceId, name,
        scope, supplies, schedule,
        labor_cost: laborCost, materials_cost: materialsCost, total_cost: totalCost,
        raw_days: rawDays, buffered_days: bufferedDays,
      });
      toast({ title: "Estimate saved" });
      reset();
      load();
    } catch (err) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const removeEstimate = async (id) => {
    if (!confirm("Delete this estimate?")) return;
    try { await base44.entities.JobEstimate.delete(id); load(); } catch { /* ignore */ }
  };

  if (wsLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  if (!activeWorkspaceId) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Select a workspace first. <a href="/workspaces" className="ml-2 text-accent">Workspaces →</a></div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <h1 className="font-display text-2xl font-bold">Contractor Tools</h1>
        <p className="text-sm text-muted-foreground mt-1">Estimate job cost, build a supplies list, and schedule phases. Job time always includes a +20% buffer.</p>

        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Estimate / job name" className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <Button onClick={save} disabled={saving} className="gap-1.5">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save estimate</Button>
        </div>

        <div className="mt-6 grid gap-6">
          <div className="rounded-xl border border-border bg-card p-4"><EstimateCalculator items={scope} onChange={setScope} /></div>
          <div className="rounded-xl border border-border bg-card p-4"><SupplyList items={supplies} onChange={setSupplies} /></div>
          <div className="rounded-xl border border-border bg-card p-4"><BuildSchedule items={schedule} onChange={setSchedule} /></div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Labor cost" value={`$${laborCost.toLocaleString()}`} />
          <Stat label="Materials cost" value={`$${materialsCost.toLocaleString()}`} />
          <Stat label="Total cost" value={`$${totalCost.toLocaleString()}`} accent />
          <Stat label="Job time" value={`${rawDays}d → ${bufferedDays}d`} hint="+20% buffer" />
        </div>

        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold mb-3">Saved estimates</h2>
          {estimates.length === 0 ? <p className="text-sm text-muted-foreground">No saved estimates yet.</p> : (
            <div className="grid sm:grid-cols-2 gap-3">
              {estimates.map((e) => (
                <div key={e.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0"><FileText className="h-4 w-4 text-accent shrink-0" /><span className="font-medium text-sm truncate">{e.name}</span></div>
                    <button onClick={() => removeEstimate(e.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">Total ${(e.total_cost || 0).toLocaleString()} · {e.raw_days || 0}d → {e.buffered_days || 0}d</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}