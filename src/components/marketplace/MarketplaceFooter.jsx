import React from "react";
import { Link } from "react-router-dom";

const STATS = [
  { value: "20,000+", label: "Community Members" },
  { value: "5,000+", label: "Active Listings" },
  { value: "2,500+", label: "Professionals" },
  { value: "Every Day", label: "Deals Made" },
];

export default function MarketplaceFooter() {
  return (
    <footer className="mt-10">
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-secondary to-background">
        <div className="px-6 py-10 md:py-14 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold">One Community. Unlimited Opportunities.</h2>
          <p className="mt-2 text-sm text-muted-foreground">Join thousands of owners, pros, and investors growing together on Boliviq.</p>
          <Link to="/" className="mt-5 inline-flex items-center rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90">Live Boliviq</Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4 text-center">
            <div className="font-display text-xl font-bold text-accent">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </footer>
  );
}