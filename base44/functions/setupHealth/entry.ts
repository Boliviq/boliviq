import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// Admin-only Setup & Health endpoint. Each "service" is tested live and a
// status (ok | missing | error) is returned with a plain-English detail.
// A pasted `value` can be tested before it is saved in the dashboard.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const service = (body.service || '').toString();
    const mode = body.mode === 'test' ? 'test' : 'live';
    const pasted = body.value ? body.value.toString() : null;

    if (service === 'stripe_account') {
      const stored = mode === 'test' ? secrets.get('STRIPE_TEST_SECRET_KEY') : secrets.get('STRIPE_SECRET_KEY');
      const key = pasted || stored;
      if (!key) return Response.json({ status: 'missing', detail: 'No secret key set for ' + mode + ' mode.' });
      const r = await fetch('https://api.stripe.com/v1/account', { headers: { Authorization: 'Bearer ' + key } });
      if (!r.ok) return Response.json({ status: 'error', detail: 'Stripe rejected the key (HTTP ' + r.status + ').' });
      const acct = await r.json();
      const label = acct.business_name || acct.email || acct.id || 'account';
      return Response.json({ status: 'ok', detail: 'Connected to Stripe ' + mode + ' account: ' + label + '.' });
    }

    if (service === 'stripe_webhook') {
      const stored = mode === 'test' ? secrets.get('STRIPE_TEST_WEBHOOK_SECRET') : secrets.get('STRIPE_WEBHOOK_SECRET');
      const secret = pasted || stored;
      if (!secret) return Response.json({ status: 'missing', detail: 'No webhook secret set for ' + mode + ' mode.' });
      // The webhook signing secret cannot be verified against Stripe without a
      // real signed event, so we confirm it is set and well-formed.
      if (!/^whsec_/.test(secret)) return Response.json({ status: 'error', detail: 'Secret does not look like a Stripe webhook secret (should start with whsec_).' });
      return Response.json({ status: 'ok', detail: 'Webhook secret is set for ' + mode + ' mode. Full verification requires a live Stripe event.' });
    }

    if (service === 'openai') {
      const key = pasted || secrets.get('OPENAI_API_KEY');
      const model = (body.model || 'gpt-4o-mini').toString();
      if (!key) return Response.json({ status: 'missing', detail: 'No OpenAI API key set.' });
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: 'ping' }], max_tokens: 1 })
      });
      if (!r.ok) return Response.json({ status: 'error', detail: 'OpenAI rejected the key (HTTP ' + r.status + ').' });
      return Response.json({ status: 'ok', detail: 'OpenAI responded using model ' + model + '.' });
    }

    return Response.json({ status: 'error', detail: 'Unknown service: ' + service });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}