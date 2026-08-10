import { base44 } from "@/api/base44Client";

// Thin client for the workspaceRecords backend function — see
// base44/functions/workspaceRecords/entry.ts for why this exists (RLS on
// Property/Contact/ConstructionProject/ConstructionTask/MarketplaceListing
// is created_by_id-only, so a direct base44.entities.X call only ever
// returns the calling user's own records, never a teammate's).

const unwrap = (res) => (res && res.data) || res || {};

const invoke = (action, params) =>
  base44.functions.invoke("workspaceRecords", { action, ...params }).then(unwrap);

export const listWorkspaceRecords = (entity, workspaceId, { filter, sort, limit } = {}) =>
  invoke("list", { entity, workspace_id: workspaceId, filter, sort, limit }).then((r) => r.records || []);

export const getWorkspaceRecord = (entity, workspaceId, id) =>
  invoke("get", { entity, workspace_id: workspaceId, id }).then((r) => r.record);

export const createWorkspaceRecord = (entity, workspaceId, data) =>
  invoke("create", { entity, workspace_id: workspaceId, data }).then((r) => r.record);

export const updateWorkspaceRecord = (entity, workspaceId, id, data) =>
  invoke("update", { entity, workspace_id: workspaceId, id, data }).then((r) => r.record);

export const deleteWorkspaceRecord = (entity, workspaceId, id) =>
  invoke("delete", { entity, workspace_id: workspaceId, id });
