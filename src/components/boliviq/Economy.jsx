import React from "react";
import { Coins, Users } from "lucide-react";
import Section from "./Section";

const creditTasks = [
  "Voice calls", "AI analysis", "Document generation", "Construction estimates",
  "Image analysis", "Market research", "Data enrichment", "Skip tracing", "Automation",
];

const creditSources = [
  "Purchased", "Earned", "Rewarded", "Referred", "Shared", "Transferred within teams",
];

const community = [
  "Build profiles", "Post updates", "Share projects", "Ask questions", "Find partners",
  "Recruit employees", "Create companies", "Leave reviews", "Recommend vendors",
  "Follow experts", "Earn reputation scores",
];

export default function Economy() {
  return (
    <>
      <Section
        id="economy"
        index="08"
        label="Credit Economy"
        title="A hybrid subscription plus AI credit model."
        intro="Subscriptions unlock platform features. Credits pay for AI-intensive tasks — and they can be purchased, earned, rewarded, referred, shared, and transferred within teams."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
            <Coins className="h-5 w-5 text-amber-300/70 mb-4" />
            <h3 className="font-display text-lg mb-4 text-foreground">Credits power</h3>
            <div className="flex flex-wrap gap-2">
              {creditTasks.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/65"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
            <Users className="h-5 w-5 text-amber-300/70 mb-4" />
            <h3 className="font-display text-lg mb-4 text-foreground">Credits can be</h3>
            <div className="flex flex-wrap gap-2">
              {creditSources.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-amber-300/15 bg-amber-300/[0.04] px-3 py-1 text-xs text-amber-100/75"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        index="09"
        label="Community"
        title="A professional network for real estate."
        intro="LinkedIn meets GitHub meets BiggerPockets — focused specifically on real estate and construction."
      >
        <div className="flex flex-wrap gap-2">
          {community.map((c) => (
            <span
              key={c}
              className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-sm text-white/70"
            >
              {c}
            </span>
          ))}
        </div>
      </Section>
    </>
  );
}