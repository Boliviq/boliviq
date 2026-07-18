import React from "react";
import Section from "./Section";

const roles = [
  {
    role: "Homeowners",
    tier: "Free",
    features: [
      "Post a home for sale", "Sell without a realtor", "Request contractor bids",
      "AI home value estimates", "Renovation ideas", "Remodeling cost estimates",
      "Track property value", "Request financing", "Upload inspection reports",
      "Store property documents", "Maintenance reminders", "Hire contractors",
      "Communicate with buyers", "AI offer analysis", "Instant cash offer estimates",
      "Market change alerts",
    ],
  },
  {
    role: "Investors",
    tier: "Pro",
    features: [
      "Deal sourcing", "Lead management", "Driving for dollars", "Property searches",
      "AI underwriting", "CRM", "Skip tracing", "Marketing", "Offer generation",
      "Portfolio management", "Construction management", "Exit analysis",
      "Funding management", "Investor marketplace", "Private lending", "Joint ventures",
      "AI assistants", "Credit-based automation",
    ],
  },
  {
    role: "Wholesalers",
    tier: "Pro",
    features: [
      "Lead lists", "Marketing campaigns", "Disposition lists", "Buyer CRM",
      "Offer generation", "Assignment tracking", "SMS", "Calling", "AI negotiation",
      "Deal pipeline", "Contract generation",
    ],
  },
  {
    role: "Realtors",
    tier: "Pro",
    features: [
      "MLS integration", "Client CRM", "Listing management", "AI marketing",
      "Open house automation", "Offer comparison", "Commission tracking",
      "Lead generation", "Client follow-up", "Showing scheduling", "AI transaction coordinator",
    ],
  },
  {
    role: "Contractors",
    tier: "Free",
    features: [
      "Free profiles", "Licensing & insurance verification", "Portfolio", "Reviews",
      "Bidding marketplace", "Material estimating", "Labor estimating", "Scheduling",
      "Project management", "Invoice generation", "Crew management", "Time tracking",
      "Equipment tracking", "AI estimating assistant", "Permit tracking",
    ],
  },
  {
    role: "Property Managers",
    tier: "Pro",
    features: [
      "Maintenance requests", "Tenant communication", "Rent collection", "Lease tracking",
      "Vendor management", "Inspection scheduling", "Financial reports", "AI tenant assistant",
    ],
  },
  {
    role: "Lenders",
    tier: "Pro",
    features: [
      "Loan marketplace", "Lead generation", "Borrower portal", "Document collection",
      "AI qualification", "Pre-approval workflows", "Pipeline management",
    ],
  },
  {
    role: "Inspectors",
    tier: "Pro",
    features: [
      "Inspection scheduling", "Report uploads", "AI report summaries", "Client portal",
      "Lead generation",
    ],
  },
  {
    role: "Appraisers",
    tier: "Pro",
    features: ["Order management", "Comparable sales", "Scheduling", "Report delivery"],
  },
  {
    role: "Material Suppliers",
    tier: "Pro",
    features: ["Product catalogs", "Pricing", "Delivery scheduling", "Inventory", "Marketplace listings"],
  },
];

export default function Ecosystem() {
  return (
    <Section
      id="ecosystem"
      index="04"
      label="Who Uses Boliviq"
      title="Built for the entire real estate ecosystem."
      intro="Every participant in real estate has a place inside Boliviq — from homeowners to investors to every kind of professional."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((r) => (
          <div key={r.role} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-foreground">{r.role}</h3>
              <span
                className={`rounded-full px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${
                  r.tier === "Free"
                    ? "border border-emerald-300/20 bg-emerald-300/[0.05] text-emerald-200/80"
                    : "border border-amber-300/20 bg-amber-300/[0.05] text-amber-200/80"
                }`}
              >
                {r.tier}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {r.features.map((f) => (
                <span
                  key={f}
                  className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-xs text-white/55"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}