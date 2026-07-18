import React from "react";
import { Search, BarChart3, Users, Bot } from "lucide-react";
import Section from "./Section";

const pillars = [
  {
    icon: Search,
    title: "Find Opportunities",
    desc: "Locate the people, properties, and resources ahead of everyone else.",
    items: [
      "Properties", "Sellers", "Contractors", "Investors", "Funding", "Buyers",
      "Employees", "Vendors", "Materials", "Deals before everyone else",
    ],
  },
  {
    icon: BarChart3,
    title: "Analyze Opportunities",
    desc: "Every opportunity is instantly analyzed by AI — automatically.",
    items: [
      "ARV", "Repair estimates", "Construction costs", "Permit history",
      "Rental projections", "Cash flow", "ROI", "Neighborhood trends",
      "School ratings", "Crime", "Flood zones", "Insurance estimates",
      "Market appreciation", "Comparable sales", "Holding costs", "Exit strategies",
      "Tax implications", "Investment score", "Risk score", "Negotiation suggestions",
    ],
  },
  {
    icon: Users,
    title: "Connect People",
    desc: "Not just software — an intelligent marketplace that connects those who need each other.",
    items: [
      "Homeowners ↔ Contractors", "Contractors ↔ Jobs", "Investors ↔ Contractors",
      "Wholesalers ↔ Buyers", "Realtors ↔ Listings", "Lenders ↔ Borrowers",
      "Inspectors", "Appraisers", "Photographers", "Property managers",
      "Surveyors", "Title companies", "Insurance agents", "Material suppliers",
      "Equipment rentals", "Architects", "Engineers", "Land developers",
    ],
  },
  {
    icon: Bot,
    title: "Automate Work",
    desc: "AI agents perform work instead of simply answering questions.",
    items: [
      "Call sellers", "Answer phones", "Schedule appointments", "Respond to leads",
      "Write contracts", "Write repair scopes", "Estimate construction", "Generate offers",
      "Run comps", "Send emails & SMS", "Generate social media", "Manage CRM",
      "Organize tasks", "Track crews", "Analyze invoices", "Review permits",
      "Generate reports", "Monitor county records", "Track probate & foreclosures",
      "Watch tax sales & expired listings", "Notify investors", "Negotiate appointments",
    ],
  },
];

export default function Philosophy() {
  return (
    <Section
      id="philosophy"
      index="03"
      label="Core Philosophy"
      title="Everything inside Boliviq revolves around four ideas."
      intro="Find opportunities, analyze them instantly, connect the right people, and automate the work in between."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {pillars.map((p, i) => (
          <div
            key={p.title}
            className="group rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-accent/25 hover:bg-accent/[0.02]"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
                <p.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span className="font-mono text-xs text-white/30">0{i + 1}</span>
                <h3 className="font-display text-xl font-semibold text-foreground leading-tight">{p.title}</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{p.desc}</p>
            <div className="flex flex-wrap gap-2">
              {p.items.map((it) => (
                <span
                  key={it}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/65"
                >
                  {it}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}