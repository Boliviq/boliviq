import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TaskForm from "@/components/construction/TaskForm";

const STATUS_TONE = {
  todo: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  in_progress: "bg-accent/15 text-accent border-accent/30",
  done: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  blocked: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};
const COLUMNS = ["todo", "in_progress", "done", "blocked"];
const money = (n) => (n ? "$" + Number(n).toLocaleString() : "$0");

export default function ProjectDetail() {
  const { id } = useParams();
  const { activeWorkspaceId, loading: wsLoading } = useWorkspace();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    if (!activeWorkspaceId || !id) { setLoading(false); return; }
    setLoading(true);
    try {
      const p = await base44.entities.ConstructionProject.get(id);
      setProject(p);
      const t = await base44.entities.ConstructionTask.filter({ project_id: id }, "status", 200);
      setTasks(t || []);
    } catch {
      toast({ title: "Project not found", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeWorkspaceId, id]);

  const saveTask = async (form) => {
    try {
      if (editing) {
        await base44.entities.ConstructionTask.update(editing.id, form);
        toast({ title: "Task updated" });
      } else {
        await base44.entities.ConstructionTask.create({ ...form, workspace_id: activeWorkspaceId, project_id: id });
        toast({ title: "Task added" });
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const removeTask = async (t) => {
    if (!confirm(`Delete "${t.title}"?`)) return;
    try {
      await base44.entities.ConstructionTask.delete(t.id);
      load();
    } catch (err) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  if (wsLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  }
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center"><p className="mb-4 text-muted-foreground">Project not found.</p><Link to="/construction" className="text-accent font-semibold">Back to Construction →</Link></div>
      </div>
    );
  }

  const spent = project.spent || 0;
  const budget = project.budget || 0;
  const remaining = budget - spent;
  const budgetPct = budget ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const overBudget = budget && spent > budget;
  const pct = Math.min(100, Math.max(0, project.progress || 0));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <Link to="/construction" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent mb-4">
          <ArrowLeft className="h-4 w-4" /> All projects
        </Link>

        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{project.name}</h1>
              <Badge variant="outline" className="capitalize">{project.status.replace(/_/g, " ")}</Badge>
            </div>
            {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-1.5"><Plus className="h-4 w-4" /> Add task</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border border-border bg-card p-4"><div className="text-xs uppercase text-muted-foreground">Progress</div><div className="mt-1 text-xl font-bold">{pct}%</div></div>
          <div className="rounded-lg border border-border bg-card p-4"><div className="text-xs uppercase text-muted-foreground">Budget</div><div className="mt-1 text-xl font-bold">{money(budget)}</div></div>
          <div className="rounded-lg border border-border bg-card p-4"><div className="text-xs uppercase text-muted-foreground">Spent</div><div className="mt-1 text-xl font-bold">{money(spent)}</div></div>
          <div className={`rounded-lg border border-border bg-card p-4 ${overBudget ? "border-rose-500/40" : ""}`}><div className="text-xs uppercase text-muted-foreground">Remaining</div><div className={`mt-1 text-xl font-bold ${overBudget ? "text-rose-400" : ""}`}>{money(remaining)}</div></div>
        </div>

        {budget > 0 && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Budget utilization</span><span className={overBudget ? "text-rose-400" : ""}>{budgetPct}%</span></div>
            <div className="h-2 rounded-full bg-background overflow-hidden"><div className={`h-full ${overBudget ? "bg-rose-500" : "bg-chart-2"}`} style={{ width: `${budgetPct}%` }} /></div>
          </div>
        )}

        <h2 className="font-display text-lg font-semibold mb-4">Tasks</h2>
        {tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">No tasks yet. Add the first one.</div>
        ) : (
          <div className="grid md:grid-cols-4 gap-4">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => (t.status || "todo") === col);
              return (
                <div key={col} className="rounded-lg border border-border bg-card/50 p-3">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className={`capitalize ${STATUS_TONE[col]}`}>{col.replace(/_/g, " ")}</Badge>
                    <span className="text-xs text-muted-foreground">{colTasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colTasks.map((t) => (
                      <div key={t.id} className="rounded-md border border-border bg-card p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-sm leading-tight">{t.title}</div>
                          <div className="flex gap-0.5">
                            <button onClick={() => { setEditing(t); setDialogOpen(true); }} className="p-1 rounded hover:bg-background"><Pencil className="h-3 w-3 text-muted-foreground" /></button>
                            <button onClick={() => removeTask(t)} className="p-1 rounded hover:bg-background"><Trash2 className="h-3 w-3 text-muted-foreground" /></button>
                          </div>
                        </div>
                        {t.assignee && <div className="text-xs text-muted-foreground mt-1">{t.assignee}</div>}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                          {t.due_date && <span>{t.due_date}</span>}
                          {t.actual_cost ? <span>{money(t.actual_cost)}</span> : t.cost_estimate ? <span>est {money(t.cost_estimate)}</span> : null}
                        </div>
                      </div>
                    ))}
                    {colTasks.length === 0 && <div className="text-xs text-muted-foreground py-2 text-center">—</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit task" : "New task"}</DialogTitle></DialogHeader>
          <TaskForm initial={editing} onSubmit={saveTask} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}