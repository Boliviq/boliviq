import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Bell, Trash2, Pencil, Pause, Play } from "lucide-react";
import DealAlertForm from "@/components/dealalerts/DealAlertForm";

const pretty = (s) => s.replace(/_/g, " ");
const fmt = (n) => (n ? "$" + Number(n).toLocaleString() : "—");

export default function DealAlerts() {
  const { activeWorkspaceId, loading: wsLoading } = useWorkspace();
  const [me, setMe] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      setMe(user);
      const data = await base44.entities.DealAlert.filter(
        activeWorkspaceId ? { workspace_id: activeWorkspaceId } : { created_by_id: me?.id },
        "-created_date", 100
      );
      setAlerts(data || []);
    } catch { toast({ title: "Could not load alerts", variant: "destructive" }); }
    setLoading(false);
  };

  useEffect(() => { if (!wsLoading) load(); }, [wsLoading]);

  const save = async (form) => {
    try {
      if (editing) {
        await base44.entities.DealAlert.update(editing.id, form);
        toast({ title: "Alert updated" });
      } else {
        await base44.entities.DealAlert.create({
          ...form, user_id: me.id, email: me.email, full_name: me.full_name, workspace_id: activeWorkspaceId,
        });
        toast({ title: "Alert created", description: "You'll be emailed when matching deals appear in your area." });
      }
      setDialogOpen(false);
      load();
    } catch (err) { toast({ title: "Save failed", description: err.message, variant: "destructive" }); }
  };

  const toggleStatus = async (a) => {
    try { await base44.entities.DealAlert.update(a.id, { status: a.status === "active" ? "paused" : "active" }); load(); }
    catch (err) { toast({ title: "Update failed", description: err.message, variant: "destructive" }); }
  };

  const remove = async (a) => {
    if (!confirm("Delete this alert?")) return;
    try { await base44.entities.DealAlert.delete(a.id); load(); }
    catch (err) { toast({ title: "Delete failed", description: err.message, variant: "destructive" }); }
  };

  if (wsLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-2 gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Bell className="h-5 w-5 text-accent" /> Deal alerts</h1>
            <p className="text-sm text-muted-foreground">Get emailed when a new matching deal or opportunity appears in your area.</p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-1.5 shrink-0"><Plus className="h-4 w-4" /> New alert</Button>
        </div>

        <div className="mt-6 rounded-lg border border-accent/30 bg-accent/[0.03] p-4 text-sm text-muted-foreground">
          Alerts are sent to your account email <span className="text-foreground font-medium">{me?.email}</span>. Only registered Boliviq users can receive alert emails.
        </div>

        {alerts.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">No alerts yet. Create one to get notified about deals in your area.</div>
        ) : (
          <div className="mt-6 space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold capitalize truncate">{a.location}</span>
                      <Badge variant={a.status === "active" ? "default" : "secondary"} className="capitalize">{a.status}</Badge>
                    </div>
                    <div className="mt-1.5 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                      {a.deal_types?.length > 0 && <span>Deals: {a.deal_types.map((d) => pretty(d)).join(", ")}</span>}
                      {a.categories?.length > 0 && <span>Categories: {a.categories.map((c) => pretty(c)).join(", ")}</span>}
                      <span>Price: {fmt(a.min_price)} – {fmt(a.max_price)}</span>
                      {a.last_sent_date && <span>Last sent: {new Date(a.last_sent_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleStatus(a)} title={a.status === "active" ? "Pause" : "Resume"} className="p-1.5 rounded hover:bg-background">{a.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
                    <button onClick={() => { setEditing(a); setDialogOpen(true); }} title="Edit" className="p-1.5 rounded hover:bg-background"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(a)} title="Delete" className="p-1.5 rounded hover:bg-background"><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit alert" : "New deal alert"}</DialogTitle></DialogHeader>
          <DealAlertForm initial={editing} onSubmit={save} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}