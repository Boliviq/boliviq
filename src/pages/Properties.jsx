import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import PropertyForm from "@/components/crm/PropertyForm";
import PipelineBoard from "@/components/crm/PipelineBoard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Loader2, MapPin, Pencil, Trash2, DollarSign } from "lucide-react";

export default function Properties() {
  const { activeWorkspaceId, loading: wsLoading } = useWorkspace();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    if (!activeWorkspaceId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await base44.entities.Property.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 200);
      setItems(data);
    } catch {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeWorkspaceId]);

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (p) => { setEditing(p); setDialogOpen(true); };

  const save = async (vals) => {
    try {
      if (editing) await base44.entities.Property.update(editing.id, vals);
      else await base44.entities.Property.create({ ...vals, workspace_id: activeWorkspaceId });
      setDialogOpen(false); setEditing(null);
      toast({ title: editing ? "Property updated" : "Property added" });
      load();
    } catch (err) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.address}"?`)) return;
    try { await base44.entities.Property.delete(p.id); toast({ title: "Deleted" }); load(); }
    catch (err) { toast({ title: "Delete failed", description: err.message, variant: "destructive" }); }
  };

  const move = async (id, status) => {
    try { await base44.entities.Property.update(id, { status }); load(); }
    catch (err) { toast({ title: "Move failed", description: err.message, variant: "destructive" }); }
  };

  if (wsLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!activeWorkspaceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Select a workspace first.</p>
          <Link to="/workspaces" className="text-accent font-semibold">Go to Workspaces →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">Properties & Pipeline</h1>
            <p className="text-sm text-muted-foreground">Track deals from lead to sold.</p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add property</Button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No properties yet.</p>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add your first property</Button>
          </div>
        ) : (
          <Tabs defaultValue="pipeline">
            <TabsList className="mb-4">
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
            <TabsContent value="pipeline">
              <PipelineBoard properties={items} onMove={move} onEdit={openEdit} />
            </TabsContent>
            <TabsContent value="list">
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="divide-y divide-border">
                  {items.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-card/50">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{p.address}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {(p.deal_strategy || "—").replace(/_/g, " ")} · {(p.status || "").replace(/_/g, " ")}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground hidden sm:flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />{p.valuation ? Number(p.valuation).toLocaleString() : "—"}
                      </div>
                      <button onClick={() => openEdit(p)} className="p-2 text-muted-foreground hover:text-accent"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(p)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit property" : "New property"}</DialogTitle></DialogHeader>
          <PropertyForm initial={editing} onSubmit={save} onCancel={() => { setDialogOpen(false); setEditing(null); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}