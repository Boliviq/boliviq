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
      const me = await base44.auth.me();
      const ms = await base44.entities.WorkspaceMembership.filter({
        user_id: me.id,
        status: "active",
      });
      setMemberships(ms);

      const wsIds = Array.from(new Set(ms.map((m) => m.workspace_id))).filter(Boolean);
      let ws = [];
      if (wsIds.length) {
        ws = await base44.entities.Workspace.filter({ id: { $in: wsIds } });
      }
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