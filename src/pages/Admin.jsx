import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Shield, ScrollText, Building2, Lock, CreditCard } from "lucide-react";
import InviteMemberForm from "@/components/admin/InviteMemberForm";
import AdminPricing from "@/components/admin/AdminPricing";

const ROLES = ["admin", "manager", "member", "finance", "contractor", "agent", "viewer"];

export default function Admin() {
  const { activeWorkspaceId, role, loading: wsLoading } = useWorkspace();
  const [tab, setTab] = useState("members");
  const [members, setMembers] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    if (!activeWorkspaceId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [m, w, a] = await Promise.all([
        base44.entities.WorkspaceMembership.filter({ workspace_id: activeWorkspaceId }, "created_date", 100).catch(() => []),
        base44.entities.Workspace.filter({ id: activeWorkspaceId }).catch(() => []),
        base44.entities.AuditLog.filter({ workspace_id: activeWorkspaceId }, "-created_date", 50).catch(() => []),
      ]);
      setMembers(m || []);
      setWorkspace((w && w[0]) || null);
      setAudit(a || []);
    } catch { toast({ title: "Could not load admin data", variant: "destructive" }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeWorkspaceId]);

  const invite = async ({ email, role: memberRole }) => {
    setBusy(true);
    try {
      await base44.functions.invoke("inviteWorkspaceMember", {
        workspace_id: activeWorkspaceId,
        email,
        role: memberRole,
      });
      toast({ title: `Invited ${email}` });
      setDialogOpen(false);
      load();
    } catch (err) {
      toast({ title: "Invite failed", description: err.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const changeRole = async (m, newRole) => {
    try {
      await base44.entities.WorkspaceMembership.update(m.id, { role: newRole });
      toast({ title: "Role updated" });
      load();
    } catch (err) { toast({ title: "Update failed", description: err.message, variant: "destructive" }); }
  };

  if (wsLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  if (!activeWorkspaceId) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="text-center"><p className="mb-4 text-muted-foreground">Select a workspace first.</p><Link to="/workspaces" className="text-accent font-semibold">Go to Workspaces →</Link></div></div>;
  }
  const isAdmin = role === "owner" || role === "admin";
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppTopBar />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h1 className="font-display text-xl font-semibold mb-1">Admins only</h1>
          <p className="text-sm text-muted-foreground">You need an owner or admin role in this workspace to view the admin console.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/10"><Shield className="h-4 w-4 text-accent" /></span>
          <div>
            <h1 className="font-display text-2xl font-bold">Admin Console</h1>
            <p className="text-sm text-muted-foreground">Members, audit log, and workspace settings.</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 border-b border-border">
          {[
            { id: "members", label: "Members", icon: UserPlus },
            { id: "audit", label: "Audit Log", icon: ScrollText },
            { id: "workspace", label: "Workspace", icon: Building2 },
            { id: "pricing", label: "Pricing & Plans", icon: CreditCard },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "members" && (
          <div>
            <div className="flex justify-end mb-4">
              <Button onClick={() => setDialogOpen(true)} className="gap-1.5"><UserPlus className="h-4 w-4" /> Invite member</Button>
            </div>
            {members.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">No members yet.</div>
            ) : (
              <div className="rounded-lg border border-border bg-card divide-y divide-border">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{m.user_id}</div>
                      <Badge variant="outline" className="mt-1 capitalize">{m.status}</Badge>
                    </div>
                    <select value={m.role} onChange={(e) => changeRole(m, e.target.value)} className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "audit" && (
          <div>
            {audit.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">No audit entries yet.</div>
            ) : (
              <div className="rounded-lg border border-border bg-card divide-y divide-border">
                {audit.map((a) => (
                  <div key={a.id} className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm">{a.action}</span>
                      <span className="text-xs text-muted-foreground">{new Date(a.created_date).toLocaleString()}</span>
                    </div>
                    {(a.target_type || a.target_id) && <div className="text-xs text-muted-foreground mt-1">{a.target_type} · {a.target_id}</div>}
                    {a.metadata && <div className="text-xs text-muted-foreground mt-1 font-mono">{JSON.stringify(a.metadata)}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "workspace" && (
          <div className="rounded-lg border border-border bg-card p-6 max-w-xl">
            {!workspace ? (
              <p className="text-muted-foreground">Workspace not found.</p>
            ) : (
              <div className="space-y-3">
                <div><div className="text-xs uppercase text-muted-foreground">Name</div><div className="font-medium">{workspace.name}</div></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><div className="text-xs uppercase text-muted-foreground">Plan</div><div className="font-medium capitalize">{(workspace.plan || "free").replace(/_/g, " ")}</div></div>
                  <div><div className="text-xs uppercase text-muted-foreground">Status</div><Badge variant="outline" className="capitalize">{workspace.status || "active"}</Badge></div>
                  <div><div className="text-xs uppercase text-muted-foreground">Billing source</div><div className="font-medium capitalize">{workspace.billing_source || "unknown"}</div></div>
                  <div><div className="text-xs uppercase text-muted-foreground">Stripe customer</div><div className="font-mono text-xs">{workspace.stripe_customer_id || "—"}</div></div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "pricing" && <AdminPricing />}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Invite a member</DialogTitle></DialogHeader>
          {busy ? <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div> : <InviteMemberForm onSubmit={invite} onCancel={() => setDialogOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}