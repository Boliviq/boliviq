import React from "react";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export default function TopBar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
            <Building2 className="h-3.5 w-3.5 text-accent" />
          </span>
          <span className="leading-none">
            <span className="block font-display font-bold tracking-tight text-sm">BOLIVIQ</span>
            <span className="block text-[8px] tracking-[0.2em] text-muted-foreground uppercase mt-0.5">
              AI that builds better investors
            </span>
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-xs text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="tracking-[0.2em] uppercase">Master Project Blueprint</span>
        </div>

        <Link
          to="/"
          className="shrink-0 text-sm text-white/60 hover:text-accent transition-colors"
        >
          ← Back to site
        </Link>
      </div>
    </header>
  );
}