import React from "react";
import { Link } from "react-router-dom";
import { Plus, LayoutGrid, List, Bookmark, MessageSquare, Eye, ShieldCheck, HelpCircle, Users, Home } from "lucide-react";

export default function MarketplaceSidebar({ onPostAd, onHome, onMyListings, mineOnly }) {
  const nav = [
    { icon: LayoutGrid, label: "Marketplace Home", onClick: onHome, active: !mineOnly },
    { icon: List, label: "My Listings", onClick: onMyListings, active: mineOnly },
    { icon: Bookmark, label: "Saved Searches", to: "/deal-alerts" },
    { icon: MessageSquare, label: "Messages", disabled: true },
    { icon: Eye, label: "My Watchlist", disabled: true },
  ];
  return (
    <aside className="space-y-4">
      <button onClick={onPostAd} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90">
        <Plus className="h-4 w-4" /> Post an Ad
      </button>

      <nav className="rounded-lg border border-border bg-card p-2">
        {nav.map((n) =>
          n.to ? (
            <Link key={n.label} to={n.to} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ) : (
            <button key={n.label} onClick={n.onClick} disabled={n.disabled}
              className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm ${n.disabled ? "text-muted-foreground/40 cursor-not-allowed" : n.active ? "bg-accent/10 text-accent font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <n.icon className="h-4 w-4" /> {n.label}
              {n.disabled && <span className="ml-auto text-[10px] uppercase">soon</span>}
            </button>
          )
        )}
      </nav>

      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="font-semibold text-sm">Welcome to the Boliviq Marketplace</h4>
        <p className="mt-1 text-xs text-muted-foreground">Post free, connect with verified pros, and grow your real estate network — all in one place.</p>
      </div>

      <div className="space-y-2">
        {[
          { icon: Home, label: "Homeowners" },
          { icon: Users, label: "Professionals" },
          { icon: ShieldCheck, label: "Safety First" },
          { icon: HelpCircle, label: "Need Help?" },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <c.icon className="h-4 w-4 text-accent" /> {c.label}
          </div>
        ))}
      </div>
    </aside>
  );
}