import React from "react";
import { Gift, ShieldCheck, Lock, Sparkles } from "lucide-react";

const BADGES = [
  { icon: Gift, label: "Free to Post" },
  { icon: ShieldCheck, label: "Verified Community" },
  { icon: Lock, label: "Secure Messaging" },
  { icon: Sparkles, label: "AI-Powered Connections" },
];

export default function MarketplaceHero() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border">
      <img
        src="https://images.unsplash.com/photo-1448630380429-43ac2a3f0d0d?auto=format&fit=crop&w=1600&q=80"
        alt="Boliviq marketplace"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
      <div className="relative px-6 py-10 md:px-10 md:py-14">
        <h1 className="font-display text-2xl md:text-4xl font-bold max-w-xl leading-tight">
          The Real Estate Marketplace Built for Our Community.
          <span className="block text-accent">Buy. Sell. Connect. Grow.</span>
        </h1>
        <div className="mt-6 grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-5">
          {BADGES.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-sm text-foreground/90">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
                <b.icon className="h-4 w-4 text-accent" />
              </span>
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}