import React from "react";
import { Store } from "lucide-react";
import Section from "./Section";

const categories = [
  "Homes", "Land", "Commercial", "Rental property", "Businesses",
  "Investment partnerships", "Construction projects", "Contractors",
  "Subcontractors", "Architects", "Engineers", "Inspectors", "Surveyors",
  "Property managers", "Private lenders", "Hard money", "Material suppliers",
  "Equipment rentals", "AI services", "Digital products", "Courses",
  "Templates", "Documents", "Software integrations",
];

export default function Marketplace() {
  return (
    <Section
      id="marketplace"
      index="05"
      label="The Marketplace"
      title="Find nearly every service you need — without leaving Boliviq."
      intro="Instead of searching outside the platform, users discover relevant people, services, and opportunities naturally across the ecosystem."
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((c) => (
          <div
            key={c}
            className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5 transition-colors hover:border-amber-300/20 hover:bg-amber-300/[0.02]"
          >
            <Store className="h-4 w-4 text-amber-300/60" />
            <span className="text-sm text-white/70">{c}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}