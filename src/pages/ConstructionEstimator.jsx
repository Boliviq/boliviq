import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Trash2, Plus, FileText, Clock } from "lucide-react";

export default function ConstructionEstimator() {
  const { activeWorkspaceId, loading: wsLoading } = useWorkspace();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [tasks, setTasks] = useState([{ name: "", days: 1 }]);
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

  const update = (i, field, val) => {
    const next = [...tasks];
    next[i] = { ...next[i], [field]: field === "name" ? val : Number(val) || 0 };
    setTasks(next);
  };
  const addTask = () => setTasks([...tasks, { name: "", days: 1 }]);
  const removeTask = (i) => setTasks(tasks.filter((_, idx) => idx !== i));

  const rawDays = useMemo(() => tasks.reduce((s, t) => s + (Number(t.days) || 0), 0), [tasks]);
  const bufferedDays = useMemo(() => Math.ceil(rawDays * 1.2), [rawDays]);
  const addedBuffer = bufferedDays - rawDays;

  const save = async () => {
    if (!name.trim()) { toast({ title: "Name the estimate first", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await base44.entities.JobEstimate.create({
        workspace_id: activeWorkspaceId,
        name,
        schedule: tasks.map((t) => ({ phase: t.name, days: Number(t.days) || 0 })),
        raw_days: rawDays,
        buffered_days: bufferedDays,
      });
      toast({ title: "Estimate saved", description: `${rawDays}d + 20% = ${bufferedDays}d` });
      setName("");
      setTasks([{ name: "", days: 1 }]);
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
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-accent" />
          <h1 className="font-display text-2xl font-bold">Construction Estimator</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Enter your project tasks — Boliviq automatically adds a +20% time buffer to every job estimate.</p>

        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Job / project name" className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <Button onClick={save} disabled={saving} className="gap-1.5">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save estimate</Button>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Project tasks</h3>
            <button onClick={addTask} className="inline-flex items-center gap-1 text-sm text-accent"><Plus className="h-4 w-4" /> Add task</button>
          </div>
          <div className="space-y-2">
            {tasks.map((t, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input className="col-span-9 rounded-md border border-input bg-background px-2 py-1.5 text-sm" placeholder="Task (e.g. Framing, Plumbing rough-in, Drywall)" value={t.name} onChange={(e) => update(i, "name", e.target.value)} />
                <input type="number" min="0" step="0.5" className="col-span-2 rounded-md border border-input bg-background px-2 py-1.5 text-sm" placeholder="Days" value={t.days} onChange={(e) => update(i, "days", e.target.value)} />
                <button onClick={() => removeTask(i)} className="col-span-1 flex justify-center text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-accent/40 bg-accent/[0.06] p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Estimated time</div>
              <div className="font-display text-2xl font-bold">{rawDays} days</div>
            </div>
            <div className="text-accent text-2xl">+</div>
            <div>
              <div className="text-xs text-muted-foreground">20% buffer</div>
              <div className="font-display text-2xl font-bold text-accent">{addedBuffer} days</div>
            </div>
            <div className="text-accent text-2xl">=</div>
            <div>
              <div className="text-xs text-muted-foreground">Total job time</div>
              <div className="font-display text-2xl font-bold text-accent">{bufferedDays} days</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">The 20% buffer is applied automatically to every estimate to cover overruns, weather, and material delays.</p>
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
                  <div className="mt-2 text-xs text-muted-foreground">{e.raw_days || 0}d + 20% = <span className="text-accent font-semibold">{e.buffered_days || 0}d</span></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}