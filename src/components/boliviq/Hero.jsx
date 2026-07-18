import React from "react";
import { Sparkles, ArrowDown } from "lucide-react";

const pillars = ["Find", "Analyze", "Connect", "Automate"];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 overflow-hidden"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 0%, rgba(212,165,87,0.14), transparent 60%), radial-gradient(ellipse 70% 50% at 90% 95%, rgba(64,96,140,0.18), transparent 60%), radial-gradient(circle at 50% 45%, rgba(212,165,87,0.04), transparent 70%)",
        }}
      />
      <div className="absolute right-[10%] top-[20%] -z-10 hidden md:block">
        <div className="relative h-2.5 w-2.5">
          <div className="absolute inset-0 rounded-full bg-amber-200 blur-md animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-amber-100" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full pt-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.04] px-4 py-1.5 mb-8">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-xs tracking-[0.25em] uppercase text-amber-100/80">
            North Star Vision Document
          </span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl md:text-8xl leading-[0.98] tracking-tight text-foreground">
          The operating system
          <br />
          for <span className="italic text-amber-200/90">real estate</span>.
        </h1>

        <p className="mt-8 max-w-2xl text-lg md:text-xl text-white/55 leading-relaxed">
          Boliviq is an AI-powered real estate and construction platform that connects every
          participant — buyers, sellers, builders, investors, lenders, and professionals — into one
          intelligent ecosystem. This document is the master specification from which every feature,
          screen, agent, and decision is derived.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          {pillars.map((p) => (
            <span
              key={p}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-white/70"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
        <span className="text-[10px] tracking-[0.3em] uppercase">Read on</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}