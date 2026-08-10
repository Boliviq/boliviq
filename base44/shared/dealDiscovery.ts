// Boliviq Deal Discovery — shared source registry, filter matching, and
// scoring logic used by dealDiscovery (interactive search) and
// dealScoutScan (scheduled Buy Box monitoring).
//
// Honesty rule: a source only ever reports 'connected' if the credential/env
// var it needs is actually configured. Nothing here fabricates a result —
// an unconnected source always returns zero results and 'connection_required',
// never a guessed or synthetic property.

export const ON_MARKET_SOURCE = {
  key: 'mls_reso',
  label: 'MLS / RESO Web API',
  envVar: 'MLS_RESO_API_KEY',
  baseUrlEnvVar: 'MLS_RESO_BASE_URL',
};

// Off-market / public-record source registry. Each entry needs its own
// credential before it can return real data — see envVar. None are
// fabricated or scraped in violation of a source's terms of access.
export const OFF_MARKET_SOURCES = [
  { key: 'county_assessor', label: 'County Assessor Records', envVar: 'SOURCE_COUNTY_ASSESSOR_API_KEY' },
  { key: 'tax_delinquency', label: 'Tax Delinquency Data', envVar: 'SOURCE_TAX_DELINQUENCY_API_KEY' },
  { key: 'foreclosure_auction', label: 'Foreclosure / Auction Data', envVar: 'SOURCE_FORECLOSURE_API_KEY' },
  { key: 'code_violations', label: 'Code Violation Records', envVar: 'SOURCE_CODE_VIOLATIONS_API_KEY' },
  { key: 'absentee_owner', label: 'Absentee Owner Indicators', envVar: 'SOURCE_ABSENTEE_OWNER_API_KEY' },
  { key: 'probate_estate', label: 'Probate / Estate Records', envVar: 'SOURCE_PROBATE_API_KEY' },
  { key: 'fsbo_feed', label: 'FSBO Listings', envVar: 'SOURCE_FSBO_API_KEY' },
  { key: 'expired_withdrawn', label: 'Expired / Withdrawn Listings', envVar: 'SOURCE_EXPIRED_LISTINGS_API_KEY' },
  { key: 'partner_provider', label: 'Partner Property Data API', envVar: 'SOURCE_PARTNER_API_KEY' },
];

export function sourceStatus(envVar) {
  return Deno.env.get(envVar) ? 'connected' : 'connection_required';
}

// --- Natural-language filter shape ---
// { location, max_price, min_profit, min_roi_pct, strategies[], property_types[],
//   min_beds, min_baths, min_sqft, min_lot_acres, on_off_market, distressed_only }

function textIncludes(haystack, needle) {
  if (!needle) return true;
  return (haystack || '').toLowerCase().includes(String(needle).toLowerCase());
}

export function matchesFilters(p, filters) {
  if (!filters) return true;
  if (filters.location) {
    const hay = [p.address, p.city, p.state, p.zip_code].filter(Boolean).join(' ');
    if (!textIncludes(hay, filters.location)) return false;
  }
  if (filters.max_price != null) {
    const price = p.asking_price ?? p.valuation;
    if (price != null && price > filters.max_price) return false;
  }
  if (filters.strategies && filters.strategies.length) {
    if (!p.deal_strategy || !filters.strategies.includes(p.deal_strategy)) return false;
  }
  if (filters.property_types && filters.property_types.length) {
    if (!p.property_type || !filters.property_types.some((t) => textIncludes(p.property_type, t))) return false;
  }
  if (filters.on_off_market && filters.on_off_market !== 'any') {
    if ((p.source_type || 'off_market') !== filters.on_off_market) return false;
  }
  if (filters.distressed_only && !(p.distress_indicators && p.distress_indicators.length)) return false;
  if (filters.min_profit != null || filters.min_roi_pct != null) {
    const { profit, roiPct } = estimateReturn(p);
    if (filters.min_profit != null && (profit == null || profit < filters.min_profit)) return false;
    if (filters.min_roi_pct != null && (roiPct == null || roiPct < filters.min_roi_pct)) return false;
  }
  return true;
}

export function estimateReturn(p) {
  const arv = p.arv ?? null;
  const askingOrValue = p.asking_price ?? p.valuation ?? null;
  const rehab = p.estimated_rehab ?? 0;
  if (arv == null || askingOrValue == null) return { profit: null, roiPct: null };
  const totalCost = askingOrValue + rehab;
  const profit = arv - totalCost;
  const roiPct = totalCost > 0 ? (profit / totalCost) * 100 : null;
  return { profit, roiPct };
}

// Boliviq Deal Score (0-100) — transparent, reason-annotated, never a black box.
export function scoreDeal(p) {
  const reasons = [];
  let score = 0;
  let hasCoreData = false;

  const { profit, roiPct } = estimateReturn(p);
  if (profit != null) {
    hasCoreData = true;
    const askingOrValue = p.asking_price ?? p.valuation ?? 0;
    const spreadPct = askingOrValue > 0 ? (profit / askingOrValue) * 100 : 0;
    const spreadPoints = Math.max(0, Math.min(40, Math.round(spreadPct)));
    score += spreadPoints;
    if (profit > 0) reasons.push(`Estimated $${Math.round(profit).toLocaleString()} projected spread`);
  }
  if (roiPct != null) {
    hasCoreData = true;
    const roiPoints = Math.max(0, Math.min(25, Math.round(roiPct)));
    score += roiPoints;
    if (roiPct >= 15) reasons.push(`Estimated ${Math.round(roiPct)}% ROI`);
  }
  if (p.price_reduced) {
    score += 5;
    reasons.push('Asking price has been reduced');
  }
  if (p.days_on_market != null && p.days_on_market > 60) {
    score += 5;
    reasons.push(`${p.days_on_market} days on market — negotiation leverage`);
  }
  const distress = p.distress_indicators || [];
  if (distress.length) {
    const distressPoints = Math.min(15, distress.length * 5);
    score += distressPoints;
    reasons.push(`Distress indicators: ${distress.map((d) => d.replace(/_/g, ' ')).join(', ')}`);
  }
  if (p.occupancy === 'vacant') {
    score += 3;
    reasons.push('Property is vacant');
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  if (!hasCoreData) {
    reasons.unshift('Insufficient pricing data to fully score — asking price and/or ARV missing');
  }
  return { score, reasons, profit, roiPct, dataConfidence: hasCoreData ? p.data_confidence || 'verified' : 'estimated' };
}

export function normalizeProperty(p, sourceLabel) {
  const { score, reasons, profit, roiPct } = scoreDeal(p);
  return {
    id: p.id,
    kind: 'property',
    address: p.address,
    city: p.city,
    state: p.state,
    zip_code: p.zip_code,
    property_type: p.property_type,
    deal_strategy: p.deal_strategy,
    status: p.status,
    asking_price: p.asking_price ?? null,
    valuation: p.valuation ?? null,
    arv: p.arv ?? null,
    estimated_rehab: p.estimated_rehab ?? null,
    estimated_profit: profit,
    estimated_roi_pct: roiPct != null ? Math.round(roiPct * 10) / 10 : null,
    days_on_market: p.days_on_market ?? null,
    price_reduced: !!p.price_reduced,
    distress_indicators: p.distress_indicators || [],
    occupancy: p.occupancy,
    source: sourceLabel,
    source_type: p.source_type || 'off_market',
    external_url: p.external_url || null,
    data_confidence: p.data_confidence || 'verified',
    last_updated: p.updated_date || p.created_date || null,
    deal_score: score,
    score_reasons: reasons,
    workspace_id: p.workspace_id,
  };
}
