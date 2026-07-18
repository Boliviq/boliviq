import React from "react";

export default function Section({ id, index, label, title, intro, children }) {
  return (
    <section
      id={id}
      className="relative px-6 md:px-10 py-24 md:py-32 border-t border-white/[0.06] scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-xs tracking-[0.3em] text-amber-300/80">{index}</span>
          <span className="h-px w-10 bg-gradient-to-r from-amber-300/50 to-transparent" />
          <span className="text-xs tracking-[0.3em] uppercase text-white/40">{label}</span>
        </div>
        <h2 className="font-display text-4xl md:text-5xl leading-[1.08] tracking-tight text-foreground max-w-3xl">
          {title}
        </h2>
        {intro && (
          <p className="mt-6 text-lg text-white/55 max-w-2xl leading-relaxed">{intro}</p>
        )}
        {children && <div className="mt-12">{children}</div>}
      </div>
    </section>
  );
}