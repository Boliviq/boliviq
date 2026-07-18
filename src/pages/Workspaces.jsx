import React, { useState } from "react";
import { useWorkspace } from "@/lib/workspaceContext";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Building2, Check, Loader2, Plus } from "lucide-react";

export default function Workspaces() {
  const { loading, error, workspaces, memberships, activeWorkspaceId, role, switchWorkspace, refresh } = useWorkspace();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const roleFor = (wsId) => memberships.find((m) => m.workspace_id === wsId)?.role;

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const res = await base44.functions.invoke("createWorkspace", { name: trimmed });
      await refresh();
      if (res.data?.workspace?.id) switchWorkspace(res.data.workspace.id);
      setName("");
      toast({ title: "Workspace created", description: res.data.workspace.name });
    } catch (err) {
      toast({ title: "Could not create workspace", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/10">
            <Building2 className="h-4 w-4 text-accent" />
          </span>
          <h1 className="font-display text-2xl font-bold">Your Workspaces</h1>
        </div>
        <p className="text-muted-foreground mb-8">Select a workspace or create a new one to get started.</p>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
            Could not load workspaces.
          </div>
        )}

        <form onSubmit={handleCreate} className="flex gap-2 mb-8">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New workspace name"
            disabled={creating}
          />
          <Button type="submit" disabled={creating || !name.trim()}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create
          </Button>
        </form>

        <div className="grid gap-3">
          {workspaces.length === 0 && !error && (
            <p className="text-sm text-muted-foreground">
              You don't belong to any workspaces yet. Create your first one above.
            </p>
          )}
          {workspaces.map((ws) => {
            const active = ws.id === activeWorkspaceId;
            return (
              <button
                key={ws.id}
                onClick={() => switchWorkspace(ws.id)}
                className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                  active ? "border-accent bg-accent/10" : "border-border bg-card hover:border-accent/40"
                }`}
              >
                <div>
                  <div className="font-semibold">{ws.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    Plan: {ws.plan} · Role: {roleFor(ws.id) || "—"}
                  </div>
                </div>
                {active && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-accent">
                    <Check className="h-3.5 w-3.5" /> Active
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeWorkspaceId && (
          <p className="mt-8 text-xs text-muted-foreground">
            Active role: <span className="capitalize text-foreground">{role || "—"}</span>
          </p>
        )}
      </div>
    </div>
  );
}