import React from "react";
import { Plug, Compass, ShieldCheck } from "lucide-react";
import Section from "./Section";

const integrations = [
  "MLS systems", "County & assessor records", "Mapping services", "CRMs",
  "E-signature tools", "Accounting software", "Communication platforms",
  "Payment processors", "AI model providers", "Cloud storage",
  "Construction management systems",
];

const visionItems = [
  "Buying property", "Selling property", "Building a house", "Finding contractors",
  "Finding investors", "Managing rentals", "Finding financing",
  "Running construction projects", "Marketing listings", "Analyzing investments",
  "Managing a real estate business",
];

const principles = [
  { title: "AI-first", desc: "AI proactively assists — it doesn't wait to be asked." },
  { title: "Simple", desc: "Complex professional tasks feel easy, even for beginners." },
  { title: "Connected", desc: "Users discover relevant people, services, and opportunities naturally." },
  { title: "Trustworthy", desc: "Verified identities, transparent reviews, audit logs, strong security." },
  { title: "Mobile-first", desc: "Every workflow works smoothly on phones, tablets, and desktops." },
  { title: "Modular", desc: "Pay only for what you need, expand over time." },
  { title: "Scalable", desc: "Millions of users, thousands of concurrent agents, enterprise-ready." },
  { title: "Data-driven", desc: "Recommendations backed by measurable data with AI confidence scores." },
];

export default function Platform() {
  return (
    <>
      <Section
        id="platform"
        index="10"
        label="Integrations"
        title="Connected to the platforms and data sources the industry relies on."
        intro="Boliviq uses APIs and licensed data sources rather than scraping services that prohibit it."
      >
        <div className="flex flex-wrap gap-2">
          {integrations.map((i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-sm text-white/70"
            >
              <Plug className="h-3 w-3 text-accent/70" /> {i}
            </span>
          ))}
        </div>
      </Section>

      <Section
        index="11"
        label="Long-Term Vision"
        title="Become the operating system for the real estate industry."
        intro="When someone thinks about any of these, Boliviq should be the first platform they think of."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {visionItems.map((v) => (
            <div
              key={v}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5"
            >
              <Compass className="h-4 w-4 text-accent/70" />
              <span className="text-sm text-white/75">{v}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        index="12"
        label="Design Principles"
        title="Every feature built for Boliviq should satisfy these principles."
        intro="The foundation from which every feature, schema, screen, agent, and roadmap decision is derived."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {principles.map((p) => (
            <div key={p.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <h3 className="font-display text-base font-semibold text-foreground">{p.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <footer className="px-6 md:px-10 py-16 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold text-foreground">Boliviq</p>
            <p className="text-sm text-muted-foreground">
              The operating system for real estate &amp; construction.
            </p>
          </div>
          <p className="text-xs text-white/30 tracking-[0.2em] uppercase">
            North Star Vision · Master Specification
          </p>
        </div>
      </footer>
    </>
  );
}