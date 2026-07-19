import React from "react";
import { Home, HardHat, TrendingUp, Building2, KeyRound, Trees, Building, Landmark, FileText, Package, Users, Hammer, ArrowRight } from "lucide-react";

const TILES = [
  { icon: Home, title: "Homeowner Section", sub: "Projects & requests for your home", items: ["Home Repairs", "Improvement", "Projects", "Sell Your Home", "General Requests"] },
  { icon: HardHat, title: "Contractor Section", sub: "Skilled trades & general contracting", items: ["General Contracting", "Remodeling", "Roofing", "Electrical", "Plumbing", "And More…"] },
  { icon: TrendingUp, title: "Investor Section", sub: "Deals, funding & partnerships", items: ["Off Market Deals", "Cash Buyers", "Funding", "JV Partnerships", "Investor Services"] },
  { icon: Building2, title: "Realtor Section", sub: "Listings & agent services", items: ["Find a Realtor", "List On MLS", "List Off MLS", "Coming Soon", "Agent Services"] },
  { icon: Home, title: "Property For Sale", sub: "Listings across every channel", items: ["On MLS", "Off Market", "Wholesale Deals", "Auction", "Lease Option"] },
  { icon: KeyRound, title: "Lease / Rental Section", sub: "Find tenants & rentals", items: ["Long Term", "Short Term", "Rooms", "Commercial Lease", "Vacation"] },
  { icon: Trees, title: "Land & Lots Section", sub: "Raw land & development parcels", items: ["Residential", "Commercial", "Agricultural", "Recreational", "Development"] },
  { icon: Building, title: "Commercial Real Estate", sub: "Office, retail & industrial space", items: ["Office", "Retail", "Industrial", "Multi-Family", "Mixed Use"] },
  { icon: Landmark, title: "Mortgage & Lending", sub: "Lenders & capital partners", items: ["Lenders", "Hard Money", "Private Money", "Funding Partners", "Loan Services"] },
  { icon: FileText, title: "Real Estate Services", sub: "Title, inspection & closing", items: ["Title & Escrow", "Appraisers", "Inspectors", "Property Management", "Closing"] },
  { icon: Package, title: "Materials & Equipment", sub: "Buy, sell & source supplies", items: ["Building Materials", "Tools", "Appliances", "HVAC", "And More…"] },
  { icon: Users, title: "Network & Community", sub: "Events & local connections", items: ["Events", "Meetups", "Networking", "Mentorship", "Community Board"] },
];

export default function MarketplaceCategoryGrid({ onPostFree }) {
  return (
    <section className="mt-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TILES.map((t) => (
          <div key={t.title} className="rounded-lg border border-border bg-card p-4 flex flex-col hover:border-accent/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 border border-accent/30">
                <t.icon className="h-4 w-4 text-accent" />
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{t.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{t.sub}</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground flex-1">
              {t.items.map((it) => (
                <li key={it} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-accent/70" />{it}
                </li>
              ))}
            </ul>
            <button onClick={onPostFree} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent hover:gap-2 transition-all">
              Post Free <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}