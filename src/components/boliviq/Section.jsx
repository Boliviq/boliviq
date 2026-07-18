import React from "react";

export default function Section({ id, index, label, title, intro, children }) {
  return (
    <section
      id={id}
      className="relative px-6 md:px-10 py-24 md:py-28 border-t border-white/[0.06] scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-[11px] text-white/25">{index}</span>
          <span className="text-accent text-xs font-semibold tracking-[0.3em] uppercase">
            {label}
          </span>
          <span className="h-px w-12 bg-accent/30" />
        </div>
        <h2 className="font-display text-3xl md:text-[2.75rem] font-bold leading-[1.08] tracking-tight text-foreground max-w-3xl">
          {title}
        </h2>
        {intro && (
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">{intro}</p>
        )}
        {children && <div className="mt-12">{children}</div>}
      </div>
    </section>
  );
}