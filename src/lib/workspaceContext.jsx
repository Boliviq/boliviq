import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const WorkspaceContext = createContext(null);
const STORAGE_KEY = "boliviq.active_workspace_id";

/**
 * Resolves the signed-in user's workspaces + role from WorkspaceMembership,
 * and tracks the active workspace (client-side selection; access is still
 * enforced server-side by RLS and memberships). Role is the membership role
 * for the active workspace (owner | admin | manager | member | ...).
 */
export function WorkspaceProvider({ children }) {
  const [memberships, setMemberships] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Defense-in-depth: never fire entity queries for anonymous users.
      // WorkspaceProvider should only mount inside ProtectedRoute, but this
      // prevents any RLS denial from firing if it renders unauthenticated.
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        setLoading(false);
        return;
      }
      // Activate any pending invites for this user before loading memberships,
      // so a teammate who just registered/logged in sees their workspace immediately.
      await base44.functions.invoke("acceptWorkspaceInvites", {}).catch(() => null);
      // Workspace RLS is created_by_id-only (or platform admin), so an invited
      // teammate can never read a Workspace they didn't create directly —
      // listMyWorkspaces returns both, gated on active membership instead.
      const res = await base44.functions.invoke("listMyWorkspaces", {});
      const data = (res && res.data) || res || {};
      const ms = data.memberships || [];
      const ws = data.workspaces || [];
      setMemberships(ms);

      const wsIds = Array.from(new Set(ms.map((m) => m.workspace_id))).filter(Boolean);
      setWorkspaces(ws);

      const stored = localStorage.getItem(STORAGE_KEY);
      const active = stored && wsIds.includes(stored) ? stored : wsIds[0] || null;
      setActiveWorkspaceId(active);
      if (active) localStorage.setItem(STORAGE_KEY, active);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const switchWorkspace = useCallback((workspaceId) => {
    localStorage.setItem(STORAGE_KEY, workspaceId);
    setActiveWorkspaceId(workspaceId);
  }, []);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || null;
  const activeMembership = memberships.find((m) => m.workspace_id === activeWorkspaceId) || null;
  const role = activeMembership?.role || null;

  return (
    <WorkspaceContext.Provider
      value={{
        loading,
        error,
        memberships,
        workspaces,
        activeWorkspace,
        activeWorkspaceId,
        role,
        switchWorkspace,
        refresh: load,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return ctx;
}