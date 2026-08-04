import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Plans where AI is unlimited — token deduction is bypassed server-side.
const UNLIMITED_AI_PLANS = new Set(['professional_ai_unlimited', 'team_ai_unlimited']);
// Plans that include any AI access.
const AI_PLANS = new Set([
  'homeowner_ai',
  'professional_ai', 'team_professional_ai',
  'professional_ai_unlimited', 'team_ai_unlimited',
]);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const workspaceId = (body.workspace_id || '').toString().trim();
    const amount = Number(body.amount);
    const reference = (body.reference || '').toString().trim();
    const idempotencyKey = (body.idempotency_key || '').toString().trim();
    const type = (body.type || 'charge').toString().trim();

    if (!workspaceId || !amount || amount <= 0 || !idempotencyKey) {
      return Response.json({ error: 'workspace_id, positive amount, and idempotency_key are required' }, { status: 400 });
    }

    const sr = base44.asServiceRole;
    const memberships = await sr.entities.WorkspaceMembership.filter({
      workspace_id: workspaceId, user_id: user.id, status: 'active',
    });
    if (!memberships.length) return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Idempotency: a prior ledger entry for this key means the charge already happened.
    const existing = await sr.entities.LedgerEntry.filter({ workspace_id: workspaceId, idempotency_key: idempotencyKey });
    if (existing && existing.length) {
      return Response.json({ ok: true, balance: existing[0].balance_after, idempotent: true });
    }

    // Resolve plan to determine AI access + unlimited bypass.
    const subs = await sr.entities.Subscription.filter({ workspace_id: workspaceId });
    const plan = (subs[0] && subs[0].plan) || 'free';

    if (!AI_PLANS.has(plan)) {
      return Response.json({ error: 'AI is not available on your plan. Upgrade to an AI plan to use AI features.', no_ai: true }, { status: 403 });
    }
    // Unlimited AI plans bypass token deduction entirely.
    if (UNLIMITED_AI_PLANS.has(plan)) {
      await sr.entities.AuditLog.create({
        workspace_id: workspaceId, actor_id: user.id, action: 'credit.bypass_unlimited',
        target_type: 'subscription', target_id: subs[0] && subs[0].id,
        metadata: { amount, reference, idempotency_key: idempotencyKey, plan },
      });
      return Response.json({ ok: true, bypass: true, plan });
    }

    const wallets = await sr.entities.CreditWallet.filter({ workspace_id: workspaceId });
    const wallet = wallets[0];
    if (!wallet) return Response.json({ error: 'No credit wallet found', insufficient: true }, { status: 404 });

    const balance = wallet.balance || 0;
    if (balance < amount) {
      return Response.json({ error: 'Insufficient AI credits. Purchase more credits or upgrade to an unlimited AI plan.', insufficient: true, balance }, { status: 402 });
    }

    const newBalance = balance - amount;
    await sr.entities.CreditWallet.update(wallet.id, { balance: newBalance });
    await sr.entities.LedgerEntry.create({
      workspace_id: workspaceId, wallet_id: wallet.id, delta: -amount, type,
      reference, idempotency_key: idempotencyKey, balance_after: newBalance,
    });
    await sr.entities.AuditLog.create({
      workspace_id: workspaceId, actor_id: user.id, action: 'credit.charged',
      target_type: 'credit_wallet', target_id: wallet.id,
      metadata: { amount, reference, idempotency_key: idempotencyKey },
    });

    return Response.json({ ok: true, balance: newBalance });
  } catch (error) {
    console.log('chargeCredits error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});