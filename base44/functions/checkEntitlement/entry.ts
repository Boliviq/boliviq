import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Plan -> default entitlements. null = unlimited. false = disabled.
const PLAN_ENTITLEMENTS = {
  free: { ai_credits_monthly: 25, max_properties: 5, construction_intelligence: false, ai_agents_unlimited: false, seats: 1 },
  beginner: { ai_credits_monthly: 1000, max_properties: 100, construction_intelligence: false, ai_agents_unlimited: false, seats: 1 },
  professional: { ai_credits_monthly: 5000, max_properties: null, construction_intelligence: true, ai_agents_unlimited: false, seats: 1 },
  team: { ai_credits_monthly: 5000, max_properties: null, construction_intelligence: true, ai_agents_unlimited: false, seats: 5 },
  professional_ai_max: { ai_credits_monthly: null, max_properties: null, construction_intelligence: true, ai_agents_unlimited: true, seats: 1 },
  team_ai_max: { ai_credits_monthly: null, max_properties: null, construction_intelligence: true, ai_agents_unlimited: true, seats: 10 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const workspaceId = (body.workspace_id || '').toString().trim();
    const feature = (body.feature || '').toString().trim();
    if (!workspaceId || !feature) return Response.json({ error: 'workspace_id and feature are required' }, { status: 400 });

    const sr = base44.asServiceRole;
    const memberships = await sr.entities.WorkspaceMembership.filter({
      workspace_id: workspaceId, user_id: user.id, status: 'active',
    });
    if (!memberships.length) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const subs = await sr.entities.Subscription.filter({ workspace_id: workspaceId });
    const plan = (subs[0] && subs[0].plan) || 'free';
    const planDefaults = PLAN_ENTITLEMENTS[plan] || PLAN_ENTITLEMENTS.free;

    // Explicit Entitlement records (owner_grant / promotion / manual) override plan defaults.
    const overrides = await sr.entities.Entitlement.filter({ workspace_id: workspaceId, feature });
    const override = overrides[0];

    let enabled, limitValue, source;
    if (override) {
      enabled = override.enabled;
      limitValue = override.limit_value;
      source = override.source;
    } else {
      const def = planDefaults[feature];
      if (def === undefined) { enabled = false; limitValue = null; source = 'plan'; }
      else if (def === null) { enabled = true; limitValue = null; source = 'plan'; }
      else if (typeof def === 'boolean') { enabled = def; limitValue = null; source = 'plan'; }
      else { enabled = true; limitValue = def; source = 'plan'; }
    }

    return Response.json({
      feature, enabled, limit_value: limitValue, plan, source,
      unlimited: enabled && limitValue === null,
    });
  } catch (error) {
    console.log('checkEntitlement error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});