import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { MONTHLY_CREDIT_GRANT, currentBillingMonth } from '../../shared/billingCatalog.ts';

// Scheduled monthly credit grant for active AI subscribers.
// Called by the MonthlyCreditGrant workflow on the 1st of each month.
// Ensures annual subscribers receive monthly credits (not just on the annual invoice).
// Idempotent per workspace per billing month — safe for duplicate calls.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const billingMonth = currentBillingMonth();
    const now = new Date();

    // Get all active subscriptions (service role bypasses RLS).
    const subs = await sr.entities.Subscription.filter({ status: 'active' });
    let granted = 0;
    let skipped = 0;
    let ineligible = 0;
    const results = [];

    for (const sub of subs) {
      const grant = MONTHLY_CREDIT_GRANT[sub.plan] || 0;
      if (grant === 0) {
        ineligible++;
        continue;
      }

      // Skip if subscription is canceled but period hasn't ended yet —
      // still grant (they paid for this period). But if period has ended, skip.
      if (sub.cancel_at_period_end && sub.current_period_end) {
        const periodEnd = new Date(sub.current_period_end);
        if (periodEnd < now) {
          skipped++;
          continue;
        }
      }

      // Idempotency: check if a grant was already issued for this billing month.
      // This key is shared with the invoice.paid handler, preventing double-grants.
      const idemKey = 'grant_' + sub.workspace_id + '_' + billingMonth;
      const existing = await sr.entities.LedgerEntry.filter({
        workspace_id: sub.workspace_id, idempotency_key: idemKey,
      });
      if (existing && existing.length) {
        skipped++;
        continue;
      }

      // Grant credits atomically.
      const wallets = await sr.entities.CreditWallet.filter({ workspace_id: sub.workspace_id });
      const wallet = wallets[0] || await sr.entities.CreditWallet.create({
        workspace_id: sub.workspace_id, balance: 0, reserved: 0,
      });
      await sr.entities.CreditWallet.updateMany({ id: wallet.id }, { $inc: { balance: grant } });
      const updated = await sr.entities.CreditWallet.get(wallet.id);
      await sr.entities.LedgerEntry.create({
        workspace_id: sub.workspace_id, wallet_id: wallet.id, delta: grant, type: 'grant',
        reference: 'scheduled_' + billingMonth, idempotency_key: idemKey, balance_after: updated.balance,
      });
      await sr.entities.AuditLog.create({
        workspace_id: sub.workspace_id, actor_id: 'system',
        action: 'credit_grant.scheduled_monthly', target_type: 'credit_wallet', target_id: wallet.id,
        metadata: { grant, plan: sub.plan, billing_month: billingMonth },
      });
      granted++;
      results.push({ workspace_id: sub.workspace_id, plan: sub.plan, grant });
    }

    return Response.json({
      ok: true, billing_month: billingMonth, granted, skipped, ineligible, total: subs.length,
    });
  } catch (error) {
    console.log('grantMonthlyCredits error:', error.message);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
});