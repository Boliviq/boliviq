import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

const items = [
  { id: "overview", label: "Overview" },
  { id: "philosophy", label: "Philosophy" },
  { id: "ecosystem", label: "Ecosystem" },
  { id: "marketplace", label: "Marketplace" },
  { id: "intelligence", label: "Intelligence" },
  { id: "economy", label: "Economy" },
  { id: "platform", label: "Platform" },
];

export default function SectionNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
            <Building2 className="h-3.5 w-3.5 text-accent" />
          </span>
          <span className="leading-none">
            <span className="block font-display font-bold tracking-tight text-sm">BOLIVIQ</span>
            <span className="block text-[8px] tracking-[0.2em] text-muted-foreground uppercase mt-0.5">
              AI that builds better investors
            </span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          <Link to="/blueprint" className="text-sm font-medium text-accent hover:opacity-80 transition-opacity">
            Blueprint
          </Link>
          {items.map((i) => (
            <a
              key={i.id}
              href={`#${i.id}`}
              className="text-sm text-white/70 hover:text-accent transition-colors"
            >
              {i.label}
            </a>
          ))}
        </nav>

        <a
          href="#top"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
        >
          Get Started
        </a>
      </div>
    </header>
  );
}