import React from "react";
import { MapPin, Search, Sparkles, Twitter, Instagram, Facebook } from "lucide-react";

const POPULAR = ["Off Market Deals", "Cash Buyers", "Wholesale", "Roofing", "Hard Money", "Funding Partners"];

export default function MarketplaceRightRail({ location, onLocationChange, onPopularSearch, onUpgrade }) {
  return (
    <aside className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <label className="flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4 text-accent" /> Location</label>
        <input
          value={location} onChange={(e) => onLocationChange(e.target.value)}
          placeholder="City, state, or ZIP"
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="flex items-center gap-2 text-sm font-medium"><Search className="h-4 w-4 text-accent" /> Popular Searches</h4>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {POPULAR.map((p) => (
            <button key={p} onClick={() => onPopularSearch(p)} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-accent/50 hover:text-foreground">{p}</button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-accent/40 bg-accent/[0.06] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-accent" /> Upgrade Your Marketplace Experience</div>
        <p className="mt-1 text-xs text-muted-foreground">Unlock AI-powered matching, featured listings, and priority placement with a Boliviq plan.</p>
        <button onClick={onUpgrade} className="mt-3 w-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/90">See plans</button>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="text-sm font-medium">Stay Connected</h4>
        <div className="mt-2 flex items-center gap-3 text-muted-foreground">
          {[Twitter, Instagram, Facebook].map((Icon, i) => (
            <span key={i} className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:border-accent/50 hover:text-accent transition-colors cursor-pointer">
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">@boliviq</p>
      </div>
    </aside>
  );
}