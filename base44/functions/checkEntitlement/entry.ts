import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// 2026 pricing migration — 7 tiers.
// null = unlimited. false = disabled. true = enabled (no numeric limit).
const PLAN_ENTITLEMENTS = {
  // Homeowner (FREE) — no AI, marketplace + basic tools only.
  free: {
    marketplace: true, crm: false, construction_intelligence: false,
    deal_calculator: true, ai_access: false, ai_unlimited: false,
    ai_credits_monthly: 0, seats: 1,
  },
  // Professional — $49.99, no AI.
  professional: {
    marketplace: true, crm: true, construction_intelligence: true,
    deal_calculator: true, ai_access: false, ai_unlimited: false,
    ai_credits_monthly: 0, seats: 1,
  },
  // Team Professional — $199, up to 5 members, no AI.
  team_professional: {
    marketplace: true, crm: true, construction_intelligence: true,
    deal_calculator: true, ai_access: false, ai_unlimited: false,
    ai_credits_monthly: 0, seats: 5,
  },
  // Professional + AI — $149.99, token-metered AI.
  professional_ai: {
    marketplace: true, crm: true, construction_intelligence: true,
    deal_calculator: true, ai_access: true, ai_unlimited: false,
    ai_credits_monthly: 10000, seats: 1,
  },
  // Team Professional + AI — $699, shared token wallet, up to 5 members.
  team_professional_ai: {
    marketplace: true, crm: true, construction_intelligence: true,
    deal_calculator: true, ai_access: true, ai_unlimited: false,
    ai_credits_monthly: 50000, seats: 5,
  },
  // Professional AI Unlimited — $499, unlimited AI (no tokens).
  professional_ai_unlimited: {
    marketplace: true, crm: true, construction_intelligence: true,
    deal_calculator: true, ai_access: true, ai_unlimited: true,
    ai_credits_monthly: null, seats: 1,
  },
  // Team AI Unlimited — $1,299, unlimited shared AI, up to 5 members.
  team_ai_unlimited: {
    marketplace: true, crm: true, construction_intelligence: true,
    deal_calculator: true, ai_access: true, ai_unlimited: true,
    ai_credits_monthly: null, seats: 5,
  },
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