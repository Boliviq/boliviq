// Boliviq 2026 pricing catalog — 8 membership tiers + AI credit packs.
// Source of truth for plan metadata, Stripe price IDs, and feature flags.

export const BILLING_CYCLE = { MONTHLY: "monthly", ANNUAL: "annual" };

export const PLANS = [
  {
    id: "free", name: "Homeowner", tagline: "Free forever",
    priceMonthly: 0, priceAnnual: 0,
    monthlyPriceId: null, annualPriceId: null,
    ai: "none", seats: 1, featured: false,
    target: "Homeowners · Buyers · Sellers · Consumers",
    features: [
      "Post homes for sale & properties wanted",
      "Post repair, remodel & contractor requests",
      "Browse the marketplace",
      "Search contractors, realtors, investors, lenders, wholesalers",
      "Message professionals & receive estimates",
      "Upload project photos, manage favorites & reviews",
    ],
    restrictions: ["No AI access", "No AI credits, assistants, reports or automation"],
  },
  {
    id: "homeowner_ai", name: "Homeowner + AI", tagline: "AI-powered tools for your home",
    priceMonthly: 9.99, priceAnnual: 99.90,
    monthlyPriceId: "price_1Tv06uGIUtciLaIv1f90LIQP", annualPriceId: "price_1Tv06tGIUtciLaIvzJ4cl5nG",
    ai: "tokens", seats: 1, featured: false,
    target: "Homeowners who want AI tools",
    features: [
      "Everything in Homeowner",
      "AI photo estimator & project planner",
      "AI material & labor estimates",
      "250 AI credits included monthly — buy more anytime",
      "Email support",
    ],
    restrictions: ["AI is not unlimited — every request consumes credits"],
  },
  {
    id: "professional", name: "Professional", tagline: "Pro business tools",
    priceMonthly: 49.99, priceAnnual: 479.90,
    monthlyPriceId: "price_1TuhKaGIUtciLaIvAwSZsSS5", annualPriceId: "price_1TuhKaGIUtciLaIvIpxDOqkj",
    ai: "none", seats: 1, featured: false,
    target: "Contractors · Realtors · Investors · Wholesalers · Lenders · Inspectors · Architects · Property Managers",
    features: [
      "Everything in Homeowner",
      "Professional profile & business page + verification",
      "Lead management, CRM & pipeline",
      "Marketplace, messaging, scheduling & calendar",
      "Estimates, invoices & project management",
      "Construction tools & deal calculator",
      "Marketing tools, document storage & analytics",
    ],
    restrictions: ["No AI", "Team invitations disabled"],
  },
  {
    id: "team_professional", name: "Team Professional", tagline: "Shared workspace, up to 5",
    priceMonthly: 199, priceAnnual: 1910.40,
    monthlyPriceId: "price_1TuhKaGIUtciLaIvVcu8PYcC", annualPriceId: "price_1TuhKaGIUtciLaIvILXy4Psw",
    ai: "none", seats: 5, featured: false,
    target: "Small teams & agencies (up to 5 members)",
    features: [
      "Everything in Professional",
      "Shared workspace, CRM, marketplace, projects & files",
      "Shared clients, dashboards & calendars",
      "Permissions, role management & internal messaging",
      "Task assignments",
    ],
    restrictions: ["No AI", "No AI credits or assistance — everything manual"],
  },
  {
    id: "professional_ai", name: "Professional + AI", tagline: "Pro + AI (credit-metered)",
    priceMonthly: 149.99, priceAnnual: 1439.90,
    monthlyPriceId: "price_1TuhKaGIUtciLaIvIWw93Wci", annualPriceId: "price_1TuhKaGIUtciLaIvZTsKam5b",
    ai: "tokens", seats: 1, featured: true,
    target: "Pros who want every AI tool, paying per use",
    features: [
      "Everything in Professional",
      "Construction AI, property & deal analysis",
      "Material takeoffs & labor estimator",
      "Proposal & marketing generator",
      "Image & document analysis",
      "AI chat, voice AI, phone AI, workflow AI & AI reports",
      "10,000 AI credits included monthly — buy more anytime",
    ],
    restrictions: ["AI is not unlimited — every request consumes credits"],
  },
  {
    id: "team_professional_ai", name: "Team Professional + AI", tagline: "Team + shared AI credits, up to 5",
    priceMonthly: 699, priceAnnual: 6710.40,
    monthlyPriceId: "price_1TuhKaGIUtciLaIvMhfR2oie", annualPriceId: "price_1TuhKaGIUtciLaIvmdlYKLNn",
    ai: "tokens", seats: 5, featured: false,
    target: "Teams (up to 5) sharing AI",
    features: [
      "Everything in Team Professional",
      "Shared AI credit wallet, assistants, reports & workflows",
      "Shared AI automations",
      "50,000 AI credits included monthly — buy more anytime",
    ],
    restrictions: ["Unlimited AI is NOT included — shared credits consumed per request"],
  },
  {
    id: "professional_ai_unlimited", name: "Professional AI Unlimited", tagline: "Unlimited AI, no credits",
    priceMonthly: 499, priceAnnual: 4790.40,
    monthlyPriceId: "price_1TuhKaGIUtciLaIvrsEpadrz", annualPriceId: "price_1TuhKaGIUtciLaIvIVidXRIC",
    ai: "unlimited", seats: 1, featured: false,
    target: "Power users who want unlimited everything",
    features: [
      "Everything in Professional + AI",
      "Unlimited AI — no credit usage or deductions",
      "Unlimited reports, construction analysis, marketing & automation",
      "Unlimited assistants, conversations, voice & document AI",
    ],
    restrictions: [],
  },
  {
    id: "team_ai_unlimited", name: "Team AI Unlimited", tagline: "Unlimited shared AI, up to 5",
    priceMonthly: 1299, priceAnnual: 12470.40,
    monthlyPriceId: "price_1TuhKaGIUtciLaIvCHMv8mKB", annualPriceId: "price_1TuhKaGIUtciLaIvHs6J4o9l",
    ai: "unlimited", seats: 5, featured: false,
    target: "Teams (up to 5) with unlimited AI",
    features: [
      "Everything in Team Professional + AI",
      "Unlimited shared AI — no credits required",
      "Unlimited reports, automation, assistants & conversations",
      "Unlimited construction, image, voice & document AI",
    ],
    restrictions: [],
  },
];

export const TOKEN_PACKS = [
  { id: "tokens_5000", name: "5,000 AI Credits", price: 49, tokens: 5000, priceId: "price_1TuivvGIUtciLaIvjbZLSNyr" },
  { id: "tokens_15000", name: "15,000 AI Credits", price: 129, tokens: 15000, priceId: "price_1TuivvGIUtciLaIvxGRlnFg9", popular: true },
  { id: "tokens_50000", name: "50,000 AI Credits", price: 399, tokens: 50000, priceId: "price_1TuivvGIUtciLaIvUXBwho8Y" },
];

export const AI_MODE = {
  none: { label: "No AI", badge: "bg-muted text-muted-foreground" },
  tokens: { label: "AI · Credits", badge: "bg-primary/15 text-primary" },
  unlimited: { label: "AI · Unlimited", badge: "bg-accent/15 text-accent" },
};

export const planById = (id) => PLANS.find((p) => p.id === id);