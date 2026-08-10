import { base44 } from "@/api/base44Client";

const LOCAL_KEY = "boliviq.rls-monitor.events.v1";
const LOCAL_MAX = 100;

/**
 * Permission-denial monitor.
 *
 * Unlike a global window.fetch patch that fires for everyone, this monitor is
 * intentionally admin-only: it never activates for anonymous or non-admin
 * visitors, so no banner or logging ever reaches the public site.
 */

function looksLikeDenial(err) {
  if (!err) return false;
  const msg = String(err.message || err.statusText || err.code || "").toLowerCase();
  const status = err.status || err.statusCode || err.response?.status;
  if (status === 401 || status === 403) return { denied: true, status };
  if (/(row-level security|rls|forbidden|unauthorized|permission denied|403|401)/.test(msg)) {
    return { denied: true, status: status || null };
  }
  return false;
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(events) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(events.slice(0, LOCAL_MAX)));
  } catch {
    /* storage unavailable — fail silently */
  }
}

/**
 * Capture a denial. Persists to the RlsEvent entity when an admin is signed in
 * and a workspace is active; otherwise buffers to localStorage (never throws).
 * Returns the original error so callers can `await captureDenial(...)` in a
 * chain without changing control flow.
 */
export async function captureDenial(err, context = {}) {
  const hit = looksLikeDenial(err);
  if (!hit) return err;

  const event = {
    entity_name: context.entity_name || "unknown",
    operation: context.operation || "unknown",
    status_code: hit.status,
    error_message: String(err.message || "").slice(0, 1000),
    url: context.url || (typeof window !== "undefined" ? window.location.pathname : ""),
  };

  let persistedToEntity = false;
  if (context.workspace_id) {
    try {
      await base44.entities.RlsEvent.create({ ...event, workspace_id: context.workspace_id });
      persistedToEntity = true;
    } catch {
      /* not admin or not authed — fall through to local buffer */
    }
  }

  if (!persistedToEntity) {
    const events = readLocal();
    events.unshift({ ...event, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, created_date: new Date().toISOString() });
    writeLocal(events);
  }
  return err;
}

/**
 * Wrap a promise-returning entity call. On rejection, if the error is a
 * permission denial, it is captured (and logged for admins). The original
 * rejection is re-thrown so existing error handling is unchanged.
 */
export async function capture(promise, context = {}) {
  try {
    return await promise;
  } catch (err) {
    await captureDenial(err, context);
    throw err;
  }
}

/**
 * Reads buffered localStorage events (used by the admin monitor page to surface
 * denials that happened before an admin session existed).
 */
export function getBufferedEvents() {
  return readLocal();
}

export function clearBufferedEvents() {
  writeLocal([]);
}