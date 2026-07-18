import React, { useEffect, useState } from "react";

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
          ? "bg-background/70 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
          <span className="font-display text-lg tracking-tight">Boliviq</span>
        </a>
        <nav className="flex items-center gap-5 md:gap-7 overflow-x-auto no-scrollbar">
          {items.map((i) => (
            <a
              key={i.id}
              href={`#${i.id}`}
              className="whitespace-nowrap text-xs md:text-sm text-white/50 hover:text-amber-200 transition-colors"
            >
              {i.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}