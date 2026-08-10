import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { ON_MARKET_SOURCE, OFF_MARKET_SOURCES, sourceStatus } from '../../shared/dealDiscovery.ts';

// Powers the admin "Data Sources" page — an honest, live-checked registry of
// every Deal Discovery source and whether it's actually connected. Never
// reports 'connected' unless the underlying credential env var is set.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const sources = [
      { key: 'boliviq_marketplace', label: 'Boliviq Marketplace', type: 'first_party', status: 'connected', purpose: 'Properties any workspace has opted into public visibility.' },
      { key: 'workspace_crm', label: 'Your CRM / Workspace Data', type: 'first_party', status: 'connected', purpose: 'Properties and contacts already in your workspace.' },
      { key: 'user_imports', label: 'User Imports', type: 'first_party', status: 'connected', purpose: 'Manually created or imported Property records.' },
      { key: ON_MARKET_SOURCE.key, label: ON_MARKET_SOURCE.label, type: 'on_market', status: sourceStatus(ON_MARKET_SOURCE.envVar), purpose: 'Live on-market listings via a RESO-compatible feed.' },
      ...OFF_MARKET_SOURCES.map((s) => ({
        key: s.key, label: s.label, type: 'off_market', status: sourceStatus(s.envVar),
        purpose: 'Off-market / public-record deal signals.',
      })),
    ];

    return Response.json({ ok: true, sources });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
