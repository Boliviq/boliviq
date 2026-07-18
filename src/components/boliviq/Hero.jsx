import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Play } from "lucide-react";
import FeatureBadges from "./FeatureBadges";
import DealAnalyzer from "./DealAnalyzer";
import StatsBar from "./StatsBar";

export default function Hero() {
  return (
    <section id="top" className="relative px-6 md:px-10 pt-28 pb-16 overflow-hidden">
      {/* grid + glows */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 20% 0%, rgba(184,242,0,0.10), transparent 60%), radial-gradient(ellipse 60% 50% at 90% 90%, rgba(56,96,140,0.18), transparent 60%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                North Star Vision Document
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.02] tracking-tight text-foreground">
              Find Better Deals.
              <br />
              Build Bigger Profits.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Boliviq brings property acquisition, deal analysis, construction planning, and
              project management into one professional AI-powered platform — the master
              specification from which every feature, screen, agent, and decision is derived.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#overview"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
              >
                Start Your Free Plan <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/blueprint"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 hover:border-accent/40 hover:text-accent transition-colors"
              >
                <Play className="h-4 w-4" /> View the Blueprint
              </Link>
            </div>

            <FeatureBadges />
          </div>

          <div className="lg:mt-0">
            <DealAnalyzer />
          </div>
        </div>

        <StatsBar />
      </div>
    </section>
  );
}