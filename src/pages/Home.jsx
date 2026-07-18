import React from "react";
import { MessageCircle } from "lucide-react";
import SectionNav from "@/components/boliviq/SectionNav";
import Hero from "@/components/boliviq/Hero";
import Overview from "@/components/boliviq/Overview";
import Philosophy from "@/components/boliviq/Philosophy";
import Ecosystem from "@/components/boliviq/Ecosystem";
import Marketplace from "@/components/boliviq/Marketplace";
import Intelligence from "@/components/boliviq/Intelligence";
import Economy from "@/components/boliviq/Economy";
import Platform from "@/components/boliviq/Platform";

export default function Home() {
  return (
    <div
      id="top"
      className="min-h-screen bg-background text-foreground antialiased selection:bg-accent/20"
    >
      <SectionNav />
      <main>
        <Hero />
        <Overview />
        <Philosophy />
        <Ecosystem />
        <Marketplace />
        <Intelligence />
        <Economy />
        <Platform />
      </main>

      <a
        href="#intelligence"
        aria-label="Boliviq AI"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 hover:scale-105 transition-transform"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  );
}