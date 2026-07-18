import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import ContactForm from "@/components/crm/ContactForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Loader2, Users, Pencil, Trash2 } from "lucide-react";

export default function Contacts() {
  const { activeWorkspaceId, loading: wsLoading } = useWorkspace();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    if (!activeWorkspaceId) { setLoading(false); return; }
    setLoading(true);
    try {
      setItems(await base44.entities.Contact.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 200));
    } catch {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeWorkspaceId]);

  const save = async (vals) => {
    try {
      if (editing) await base44.entities.Contact.update(editing.id, vals);
      else await base44.entities.Contact.create({ ...vals, workspace_id: activeWorkspaceId });
      setOpen(false); setEditing(null);
      toast({ title: editing ? "Contact updated" : "Contact added" });
      load();
    } catch (err) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete ${c.full_name}?`)) return;
    try { await base44.entities.Contact.delete(c.id); toast({ title: "Deleted" }); load(); }
    catch (err) { toast({ title: "Delete failed", description: err.message, variant: "destructive" }); }
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
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">Contacts</h1>
            <p className="text-sm text-muted-foreground">Investors, contractors, vendors, and more.</p>
          </div>
          <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add contact</Button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No contacts yet.</p>
            <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add your first contact</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{c.full_name}</div>
                    {c.company && <div className="text-xs text-muted-foreground truncate">{c.company}</div>}
                  </div>
                  <Badge variant="secondary" className="capitalize text-[10px]">{c.type}</Badge>
                </div>
                <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  {c.email && <div className="truncate">{c.email}</div>}
                  {c.phone && <div>{c.phone}</div>}
                </div>
                <div className="mt-3 flex justify-end gap-1">
                  <button onClick={() => { setEditing(c); setOpen(true); }} className="p-1.5 text-muted-foreground hover:text-accent"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => remove(c)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit contact" : "New contact"}</DialogTitle></DialogHeader>
          <ContactForm initial={editing} onSubmit={save} onCancel={() => { setOpen(false); setEditing(null); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}