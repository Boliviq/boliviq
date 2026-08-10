import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { normalizeProperty, matchesFilters } from '../../shared/dealDiscovery.ts';

// Deal Scout — scheduled monitoring for Buy Boxes with monitor:true.
// Foundation for automated deal monitoring (item 12): periodically re-checks
// currently-connected sources (today: Boliviq Marketplace public properties)
// against each active Buy Box, and for new matches above a score threshold:
//   - records the match (AuditLog, doubles as the idempotency/dedup log so
//     the same property is never re-notified for the same Buy Box),
//   - emails the Buy Box owner,
//   - optionally creates a Property lead in their workspace IF the Buy Box
//     owner explicitly turned on auto_add_to_pipeline.
// Never contacts a seller/agent or sends any external communication — only
// notifies the investor who owns the Buy Box, exactly as they configured it.
// Invoked by the DealScoutScan workflow (daily cron).

const MATCH_SCORE_THRESHOLD = 65;

function buyBoxToFilters(bb) {
  return {
    location: (bb.markets && bb.markets[0]) || undefined,
    max_price: bb.max_price ?? undefined,
    min_profit: bb.min_profit ?? undefined,
    min_roi_pct: bb.min_roi_pct ?? undefined,
    strategies: bb.strategies && bb.strategies.length ? bb.strategies : undefined,
    property_types: bb.property_types && bb.property_types.length ? bb.property_types : undefined,
    on_off_market: bb.on_off_market && bb.on_off_market !== 'any' ? bb.on_off_market : undefined,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const buyBoxes = await sr.entities.BuyBox.filter({ status: 'active', monitor: true }, '-created_date', 500);
    const publicProperties = await sr.entities.Property.filter({ visibility: 'public' }, '-updated_date', 500).catch(() => []);

    let scanned = 0;
    let matched = 0;
    let notified = 0;
    let addedToPipeline = 0;

    for (const bb of buyBoxes) {
      scanned++;
      const candidates = publicProperties.filter((p) => p.workspace_id !== bb.workspace_id);
      const filters = buyBoxToFilters(bb);
      const normalized = candidates.map((p) => normalizeProperty(p, 'Boliviq Marketplace'));
      const hits = normalized.filter((p) => matchesFilters(p, filters) && p.deal_score >= MATCH_SCORE_THRESHOLD);

      for (const hit of hits) {
        const already = await sr.entities.AuditLog.filter({
          workspace_id: bb.workspace_id, action: 'deal_scout.match', target_id: hit.id,
        });
        const alreadyNotifiedForThisBox = already.some((a) => a.metadata && a.metadata.buy_box_id === bb.id);
        if (alreadyNotifiedForThisBox) continue;

        matched++;
        await sr.entities.AuditLog.create({
          workspace_id: bb.workspace_id, actor_id: 'system', action: 'deal_scout.match',
          target_type: 'property', target_id: hit.id,
          metadata: { buy_box_id: bb.id, buy_box_name: bb.name, deal_score: hit.deal_score, address: hit.address },
        });

        if (bb.auto_add_to_pipeline) {
          try {
            await sr.entities.Property.create({
              workspace_id: bb.workspace_id,
              address: hit.address, city: hit.city, state: hit.state, zip_code: hit.zip_code,
              property_type: hit.property_type, deal_strategy: hit.deal_strategy,
              asking_price: hit.asking_price, valuation: hit.valuation, arv: hit.arv,
              estimated_rehab: hit.estimated_rehab, status: 'lead',
              source: 'boliviq_marketplace', source_type: hit.source_type,
              notes: `Auto-added by Deal Scout (Buy Box "${bb.name}") — Boliviq Deal Score ${hit.deal_score}/100.`,
            });
            addedToPipeline++;
          } catch (e) {
            console.log('dealScoutScan: auto-add to pipeline failed:', e.message);
          }
        }

        try {
          const owner = await sr.entities.User.get(bb.created_by_id).catch(() => null);
          if (owner && owner.email) {
            await sr.integrations.Core.SendEmail({
              to: owner.email,
              subject: `Boliviq Deal Scout: new match for "${bb.name}" (score ${hit.deal_score}/100)`,
              body: `A new opportunity matching your Buy Box "${bb.name}" appeared on the Boliviq Marketplace.\n\n` +
                `${hit.address || 'Address not disclosed'}\n` +
                `Boliviq Deal Score: ${hit.deal_score}/100\n${hit.score_reasons.map((r) => '- ' + r).join('\n')}\n\n` +
                `Log in to Boliviq to view full details.${bb.auto_add_to_pipeline ? '\n\nThis was automatically added to your pipeline as a new lead.' : ''}`,
            });
            notified++;
          }
        } catch (e) {
          console.log('dealScoutScan: notification email failed:', e.message);
        }
      }

      await sr.entities.BuyBox.update(bb.id, { last_scanned_date: new Date().toISOString() });
    }

    return Response.json({ ok: true, buy_boxes_scanned: scanned, new_matches: matched, notified, added_to_pipeline: addedToPipeline });
  } catch (error) {
    console.log('dealScoutScan error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
