import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import {
  ON_MARKET_SOURCE, OFF_MARKET_SOURCES, sourceStatus,
  matchesFilters, normalizeProperty,
} from '../../shared/dealDiscovery.ts';

// Boliviq Deal Discovery Engine.
//
// BOLIVIQ FINDS DEALS -> ANALYZES -> SCORES -> RANKS -> returns
// investor-ready opportunities, instead of asking the investor to upload
// their own data. Searches every currently-connected source and is
// explicit about which sources it could not search because no
// credential/feed is configured — it never fabricates a property.
//
// Sources searched today:
//   - workspace: the caller's own Property records (their CRM data — an
//     enhancement, not a prerequisite; an empty workspace still gets
//     marketplace results).
//   - boliviq_marketplace: Property records ANY workspace has explicitly
//     marked visibility:'public' (opted in via the "List on Boliviq
//     Marketplace" toggle) — first-party cross-workspace deal flow.
//   - mls_reso: real RESO Web API adapter, gated on MLS_RESO_API_KEY /
//     MLS_RESO_BASE_URL. Reports connection_required (not fabricated data)
//     until those are configured.
//   - 9 off-market/public-record source classes (county assessor, tax
//     delinquency, foreclosure/auction, code violations, absentee owner,
//     probate, FSBO, expired listings, partner API) — each independently
//     gated on its own credential, each honestly reporting
//     connection_required until connected.

async function parseNaturalLanguageFilters(sr, query) {
  if (!query || !query.trim()) return { filters: {}, parseError: null };
  const prompt = `Convert this real-estate investor deal search into strict JSON matching this exact shape (omit keys you can't infer, use null for numbers you can't infer):
{
  "location": string or null,
  "max_price": number or null,
  "min_profit": number or null,
  "min_roi_pct": number or null,
  "strategies": array of zero or more of ["fix_flip","brrrr","rental","wholesale","buy_hold","development","land","value_add"],
  "property_types": array of strings or [],
  "on_off_market": one of "any","on_market","off_market",
  "distressed_only": boolean
}
Investor request: "${query}"
Respond with ONLY the JSON object, no prose, no markdown fences.`;
  try {
    const resp = await sr.integrations.Core.InvokeLLM({ prompt, model: 'automatic' });
    const text = typeof resp === 'string' ? resp : (resp?.response || resp?.output || JSON.stringify(resp));
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { filters: { location: query }, parseError: 'Could not parse structured filters; used the raw query as a location keyword.' };
    const parsed = JSON.parse(jsonMatch[0]);
    return { filters: parsed, parseError: null };
  } catch (e) {
    return { filters: { location: query }, parseError: 'Filter parsing failed; used the raw query as a location keyword.' };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const workspaceId = (body.workspace_id || '').toString().trim();
    const query = (body.query || '').toString();
    const explicitFilters = (body.filters && typeof body.filters === 'object') ? body.filters : {};
    if (!workspaceId) return Response.json({ error: 'workspace_id is required' }, { status: 400 });

    const sr = base44.asServiceRole;
    const memberships = await sr.entities.WorkspaceMembership.filter({
      workspace_id: workspaceId, user_id: user.id, status: 'active',
    });
    if (!memberships.length) return Response.json({ error: 'Forbidden — not a member of this workspace' }, { status: 403 });

    const { filters: parsedFilters, parseError } = await parseNaturalLanguageFilters(sr, query);
    const filters = { ...parsedFilters, ...explicitFilters };

    const sources = [];
    const allNormalized = [];

    // --- Source: workspace's own Property records (CRM data enhances, doesn't gate) ---
    const ownProperties = await sr.entities.Property.filter({ workspace_id: workspaceId }, '-updated_date', 300).catch(() => []);
    sources.push({ key: 'workspace_crm', label: 'Your workspace properties', type: 'first_party', status: 'connected', count: ownProperties.length });
    for (const p of ownProperties) allNormalized.push(normalizeProperty(p, 'Your workspace'));

    // --- Source: Boliviq Marketplace (public properties from other workspaces) ---
    const publicProperties = await sr.entities.Property.filter({ visibility: 'public' }, '-updated_date', 500).catch(() => []);
    const marketplaceProperties = publicProperties.filter((p) => p.workspace_id !== workspaceId);
    sources.push({ key: 'boliviq_marketplace', label: 'Boliviq Marketplace', type: 'first_party', status: 'connected', count: marketplaceProperties.length });
    for (const p of marketplaceProperties) allNormalized.push(normalizeProperty(p, 'Boliviq Marketplace'));

    // --- Source: MLS / RESO (real adapter, gated on credentials) ---
    const mlsStatus = sourceStatus(ON_MARKET_SOURCE.envVar);
    let mlsCount = 0;
    if (mlsStatus === 'connected') {
      try {
        const baseUrl = Deno.env.get(ON_MARKET_SOURCE.baseUrlEnvVar);
        const apiKey = Deno.env.get(ON_MARKET_SOURCE.envVar);
        // RESO Web API (OData) — standard $filter query. Real call, only reached
        // when both env vars are actually configured.
        const odataFilter = filters.location ? `$filter=contains(City,'${encodeURIComponent(filters.location)}')` : '';
        const resp = await fetch(`${baseUrl}/Property?${odataFilter}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          const listings = data.value || [];
          mlsCount = listings.length;
          for (const l of listings) {
            allNormalized.push(normalizeProperty({
              address: l.UnparsedAddress, city: l.City, state: l.StateOrProvince, zip_code: l.PostalCode,
              property_type: l.PropertyType, asking_price: l.ListPrice, days_on_market: l.DaysOnMarket,
              source_type: 'on_market', data_confidence: 'verified',
            }, 'MLS'));
          }
        }
      } catch (e) {
        console.log('dealDiscovery MLS/RESO call failed:', e.message);
      }
    }
    sources.push({ key: ON_MARKET_SOURCE.key, label: ON_MARKET_SOURCE.label, type: 'on_market', status: mlsStatus, count: mlsCount });

    // --- Off-market / public-record sources (each independently gated) ---
    for (const src of OFF_MARKET_SOURCES) {
      sources.push({ key: src.key, label: src.label, type: 'off_market', status: sourceStatus(src.envVar), count: 0 });
    }

    // --- Apply filters and rank ---
    const matched = allNormalized.filter((p) => matchesFilters(p, filters));
    matched.sort((a, b) => b.deal_score - a.deal_score);
    const results = matched.slice(0, 25);

    return Response.json({
      ok: true,
      query,
      filters_used: filters,
      parse_note: parseError,
      sources,
      results,
      count: results.length,
      total_matched: matched.length,
    });
  } catch (error) {
    console.log('dealDiscovery error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
