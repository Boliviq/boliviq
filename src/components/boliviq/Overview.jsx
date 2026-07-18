import React from "react";
import Section from "./Section";

const disconnected = [
  "A wholesaler uses one CRM.",
  "A contractor uses another.",
  "An investor uses spreadsheets.",
  "A realtor uses the MLS.",
  "A lender uses separate software.",
  "Property owners post on Facebook or Craigslist.",
  "Contractors advertise elsewhere.",
  "None of these systems communicate.",
];

export default function Overview() {
  return (
    <>
      <Section
        id="overview"
        index="01"
        label="What is Boliviq"
        title="One intelligent ecosystem for an industry built on disconnected tools."
        intro="Today, real estate professionals use dozens of software products that never communicate. Boliviq replaces that fragmentation with a single AI-powered operating platform."
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
            <h3 className="font-display text-xl font-semibold text-white/80 mb-5">The problem today</h3>
            <ul className="space-y-3">
              {disconnected.map((d) => (
                <li key={d} className="flex gap-3 text-white/50 text-sm">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-300/50" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-accent/15 bg-accent/[0.03] p-7">
            <h3 className="font-display text-xl font-semibold text-accent mb-5">The Boliviq way</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              Instead of separate software, Boliviq becomes the central operating platform where AI
              assists every participant while intelligently connecting them together.
            </p>
            <p className="text-white/50 text-xs leading-relaxed">
              The goal is to become the Salesforce + Zillow + DealMachine + Buildertrend +
              Monday.com + ChatGPT + LinkedIn for the real estate industry.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="mission"
        index="02"
        label="The Mission"
        title="Make buying, selling, building, investing, and managing real estate dramatically easier."
        intro="Boliviq's AI reduces paperwork, eliminates repetitive tasks, automates communication, uncovers opportunities before competitors, and helps users make smarter decisions."
      >
        <blockquote className="rounded-2xl border-l-2 border-accent/50 bg-white/[0.02] px-7 py-6 font-display text-2xl md:text-3xl font-semibold text-white/90 leading-snug">
          “Rather than replacing professionals, Boliviq amplifies them.”
        </blockquote>
      </Section>
    </>
  );
}