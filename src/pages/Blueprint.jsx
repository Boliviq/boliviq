import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import TopBar from "@/components/blueprint/TopBar";
import Sidebar from "@/components/blueprint/Sidebar";
import SectionView from "@/components/blueprint/SectionView";
import { sections } from "@/data/blueprint";

export default function Blueprint() {
  const [active, setActive] = useState("governance");
  const section = sections.find((s) => s.id === active) || sections[0];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-accent/20">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20 flex gap-8">
        <Sidebar sections={sections} active={active} onSelect={setActive} />
        <main className="flex-1 min-w-0 py-8 md:py-10">
          <SectionView section={section} />
        </main>
      </div>

      <a
        href="#agents"
        onClick={() => setActive("agents")}
        aria-label="Boliviq AI agents"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 hover:scale-105 transition-transform"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  );
}