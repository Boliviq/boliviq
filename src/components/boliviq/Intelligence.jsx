import React from "react";
import { Cpu, Bot } from "lucide-react";
import Section from "./Section";

const aiTypes = [
  "Construction AI", "Real Estate AI", "Investment AI", "Negotiation AI",
  "Marketing AI", "Legal document AI", "Financial AI", "CRM AI",
  "Scheduling AI", "Customer support AI", "Voice AI", "Phone AI",
  "Email AI", "SMS AI", "Document AI", "Research AI", "Analytics AI",
];

const agents = [
  "Lead Acquisition Agent", "Seller Qualification Agent", "Buyer Agent",
  "Construction Estimator", "Permit Research Agent", "Property Analyzer",
  "Comp Analysis Agent", "Marketing Manager", "Bookkeeper",
  "Transaction Coordinator", "Customer Support", "Cold Calling Agent",
  "Follow-Up Agent", "Social Media Manager", "Email Campaign Manager",
  "Project Manager", "Funding Assistant", "Document Generator",
  "Compliance Assistant",
];

export default function Intelligence() {
  return (
    <>
      <Section
        id="intelligence"
        index="06"
        label="Artificial Intelligence"
        title="AI is the heart of Boliviq."
        intro="Every user has access to AI. Every page has AI assistance. Every workflow can become AI-powered."
      >
        <div className="flex flex-wrap gap-2">
          {aiTypes.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-sm text-white/70"
            >
              <Cpu className="h-3 w-3 text-accent/70" /> {a}
            </span>
          ))}
        </div>
      </Section>

      <Section
        index="07"
        label="AI Agents"
        title="Autonomous AI employees that work independently and report back."
        intro="Boliviq isn't just chat. It includes autonomous agents that perform real work across the platform."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <div
              key={a}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 transition-colors hover:border-accent/25"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/15 bg-accent/[0.04]">
                <Bot className="h-4 w-4 text-accent/80" />
              </div>
              <span className="text-sm text-white/75">{a}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}