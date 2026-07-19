import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Matches a newly created Property or MarketplaceListing against all active
// DealAlert subscriptions and emails each matching registered user.
// Invoked by entity-trigger workflows (no user session) — uses the service role.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const source = (body.source || '').toString().trim();
    const id = (body.entity_id || '').toString().trim();
    if (!source || !id) return Response.json({ error: 'source and entity_id are required' }, { status: 400 });

    let record;
    if (source === 'property') record = await sr.entities.Property.get(id);
    else if (source === 'listing') record = await sr.entities.MarketplaceListing.get(id);
    else return Response.json({ error: 'source must be "property" or "listing"' }, { status: 400 });
    if (!record) return Response.json({ error: 'record not found' }, { status: 404 });

    // Build a haystack of text fields to match the alert location against.
    const hay = [
      record.address, record.location, record.service_area, record.deal_strategy,
      record.category, record.listing_type, record.title, record.property_type,
    ].filter(Boolean).join(' ').toLowerCase();

    const price = source === 'property' ? (record.valuation || record.arv) : record.price;

    const alerts = await sr.entities.DealAlert.filter({ status: 'active' });
    const matched = [];

    for (const a of alerts) {
      const loc = (a.location || '').trim().toLowerCase();
      if (loc && !hay.includes(loc)) continue;

      if (source === 'property' && a.deal_types && a.deal_types.length) {
        if (!record.deal_strategy || !a.deal_types.includes(record.deal_strategy)) continue;
      }
      if (source === 'listing' && a.categories && a.categories.length) {
        if (!record.category || !a.categories.includes(record.category)) continue;
      }
      if (a.min_price != null && price != null && price < a.min_price) continue;
      if (a.max_price != null && price != null && price > a.max_price) continue;

      matched.push(a);
    }

    const title = source === 'property'
      ? (record.address || 'New property')
      : (record.title || 'New marketplace listing');
    const kind = source === 'property' ? 'deal' : 'opportunity';
    const detail = source === 'property'
      ? `Status: ${record.status || '—'} · Strategy: ${record.deal_strategy || '—'} · Valuation: ${record.valuation ? '$' + Number(record.valuation).toLocaleString() : '—'}`
      : `Category: ${record.category || '—'} · Type: ${record.listing_type || '—'} · Price: ${record.price ? '$' + Number(record.price).toLocaleString() : 'quote'}`;

    let sent = 0;
    for (const a of matched) {
      const subject = `Boliviq alert: new ${kind} matching "${a.location}" — ${title}`;
      const bodyText =
        `Hi ${a.full_name || 'there'},\n\n` +
        `A new ${kind} matching your Boliviq alert for "${a.location}" just appeared.\n\n` +
        `${title}\n${detail}\n` +
        (record.address ? `Location: ${record.address}\n` : '') +
        (record.location ? `Service area: ${record.location}\n` : '') +
        `\nLog in to Boliviq to view full details and take action.\n\n` +
        `— The Boliviq team\n\n` +
        `You received this because you subscribed to a deal alert. Manage your alerts in Boliviq.`;
      try {
        await sr.integrations.Core.SendEmail({ to: a.email, subject, body: bodyText });
        await sr.entities.DealAlert.update(a.id, { last_sent_date: new Date().toISOString() });
        await sr.entities.AuditLog.create({
          workspace_id: a.workspace_id || null, actor_id: 'system', action: 'deal_alert.sent',
          target_type: source, target_id: id, metadata: { alert_id: a.id, email: a.email, kind, title },
        });
        sent++;
      } catch (e) {
        console.log('deal_alert email failed for ' + a.email + ': ' + e.message);
      }
    }

    return Response.json({ ok: true, source, entity_id: id, matched: matched.length, sent });
  } catch (error) {
    console.log('sendDealAlerts error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});