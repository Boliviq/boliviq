import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import ProjectForm from "@/components/construction/ProjectForm";
import ProjectCard from "@/components/construction/ProjectCard";

export default function Construction() {
  const { activeWorkspaceId, loading: wsLoading } = useWorkspace();
  const [projects, setProjects] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    if (!activeWorkspaceId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [p, props] = await Promise.all([
        base44.entities.ConstructionProject.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 200),
        base44.entities.Property.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 200),
      ]);
      setProjects(p || []);
      setProperties(props || []);
    } catch {
      toast({ title: "Could not load projects", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeWorkspaceId]);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (p) => { setEditing(p); setDialogOpen(true); };

  const save = async (form) => {
    try {
      if (editing) {
        await base44.entities.ConstructionProject.update(editing.id, form);
        toast({ title: "Project updated" });
      } else {
        await base44.entities.ConstructionProject.create({ ...form, workspace_id: activeWorkspaceId });
        toast({ title: "Project created" });
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">Construction</h1>
            <p className="text-sm text-muted-foreground">Projects, budgets, and task tracking.</p>
          </div>
          <Button onClick={openCreate} className="gap-1.5"><Plus className="h-4 w-4" /> New project</Button>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
            No projects yet. Create your first construction project.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit project" : "New project"}</DialogTitle></DialogHeader>
          <ProjectForm initial={editing} properties={properties} onSubmit={save} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}