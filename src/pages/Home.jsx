import React from "react";
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
      className="min-h-screen bg-background text-foreground antialiased selection:bg-amber-300/20"
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
    </div>
  );
}