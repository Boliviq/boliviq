import React from "react";

export default function Sidebar({ sections, active, onSelect }) {
  return (
    <>
      {/* Mobile: horizontal scroll selector */}
      <div className="md:hidden -mx-4 px-4 mb-4 overflow-x-auto no-scrollbar flex gap-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors ${
              active === s.id
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-white/10 bg-white/[0.02] text-white/60"
            }`}
          >
            {s.code} · {s.title}
          </button>
        ))}
      </div>

      {/* Desktop: sticky vertical nav */}
      <aside className="hidden md:block w-60 shrink-0">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 no-scrollbar">
          <p className="px-3 mb-2 text-[10px] tracking-[0.25em] uppercase text-white/30">
            Master Index
          </p>
          <nav className="space-y-0.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`w-full text-left flex items-baseline gap-2.5 rounded-lg px-3 py-2 transition-colors ${
                  active === s.id
                    ? "bg-accent/10 text-accent"
                    : "text-white/60 hover:bg-white/[0.03] hover:text-white/90"
                }`}
              >
                <span className="font-mono text-[11px] opacity-60">{s.code}</span>
                <span className="text-sm">{s.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}