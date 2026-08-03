import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBufferedEvents, clearBufferedEvents } from "@/lib/rlsMonitor";
import { Loader2, ShieldAlert, Lock, Trash2, CheckCircle2, Database } from "lucide-react";

const pretty = (s) => (s || "").replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase());

export default function PermissionsMonitor() {
  const { activeWorkspaceId, role, loading: wsLoading } = useWorkspace();
  const [events, setEvents] = useState([]);
  const [buffered, setBuffered] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setBuffered(getBufferedEvents());
    if (!activeWorkspaceId) { setLoading(false); return; }
    try {
      const data = await base44.entities.RlsEvent.filter(
        { workspace_id: activeWorkspaceId },
        "-created_date",
        200
      );
      setEvents(data || []);
    } catch {
      toast({ title: "Could not load permission events", variant: "destructive" });
    }
    setLoading(false);
  }, [activeWorkspaceId]);

  useEffect(() => { load(); }, [load]);

  const resolve = async (e) => {
    try {
      await base44.entities.RlsEvent.update(e.id, { resolved: true });
      toast({ title: "Marked resolved" });
      load();
    } catch (err) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  const clearAll = async () => {
    if (!confirm("Delete all captured permission events for this workspace?")) return;
    try {
      await base44.entities.RlsEvent.deleteMany({ workspace_id: activeWorkspaceId, resolved: true });
      clearBufferedEvents();
      setBuffered([]);
      toast({ title: "Cleared resolved events" });
      load();
    } catch (err) {
      toast({ title: "Clear failed", description: err.message, variant: "destructive" });
    }
  };

  if (wsLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  const isAdmin = role === "owner" || role === "admin";
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppTopBar />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h1 className="font-display text-xl font-semibold mb-1">Admins only</h1>
          <p className="text-sm text-muted-foreground">
            The permissions monitor is only visible to workspace owners and admins — never to public visitors.
          </p>
        </div>
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
        <div className="flex items-center gap-3 mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/10">
            <ShieldAlert className="h-4 w-4 text-accent" />
          </span>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">Permissions Monitor</h1>
            <p className="text-sm text-muted-foreground">
              Row-level security denials captured for this workspace. Not visible to public visitors.
            </p>
          </div>
          <Button variant="outline" onClick={clearAll} className="gap-1.5">
            <Trash2 className="h-4 w-4" /> Clear resolved
          </Button>
        </div>

        {buffered.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Buffered (pre-session) · {buffered.length}
              </h2>
            </div>
            <div className="rounded-lg border border-dashed border-border bg-card divide-y divide-border">
              {buffered.map((e) => (
                <EventRow key={e.id} e={e} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Workspace events · {events.length}
          </h2>
          {events.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
              No permission denials captured for this workspace.
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              {events.map((e) => (
                <div key={e.id} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-sm truncate">{e.entity_name}</span>
                      <Badge variant="outline" className="capitalize">{e.operation}</Badge>
                      {e.status_code && (
                        <Badge variant={e.status_code === 403 ? "destructive" : "secondary"}>
                          {e.status_code}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {e.created_date ? new Date(e.created_date).toLocaleString() : ""}
                      </span>
                      {e.resolved ? (
                        <Badge variant="outline" className="gap-1 text-emerald-400 border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> Resolved
                        </Badge>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => resolve(e)} className="h-7 text-xs">
                          Mark resolved
                        </Button>
                      )}
                    </div>
                  </div>
                  {e.error_message && (
                    <div className="text-xs text-muted-foreground mt-1 font-mono break-all">{e.error_message}</div>
                  )}
                  {e.url && <div className="text-xs text-muted-foreground mt-0.5">{e.url}</div>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EventRow({ e }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{e.entity_name}</span>
        <Badge variant="outline" className="capitalize">{e.operation}</Badge>
        {e.status_code && <Badge variant="secondary">{e.status_code}</Badge>}
        <span className="text-xs text-muted-foreground ml-auto">
          {e.created_date ? new Date(e.created_date).toLocaleString() : ""}
        </span>
      </div>
      {e.error_message && <div className="text-xs text-muted-foreground mt-1 font-mono break-all">{e.error_message}</div>}
    </div>
  );
}