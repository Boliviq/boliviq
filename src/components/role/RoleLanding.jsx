import React from "react";
import { Link } from "react-router-dom";
import AppTopBar from "@/components/AppTopBar";
import { ArrowRight, Store } from "lucide-react";

export default function RoleLanding({ role }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <section className="border-b border-border bg-gradient-to-b from-secondary/60 to-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 border border-accent/30">
              <role.icon className="h-5 w-5 text-accent" />
            </span>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">{role.title}</h1>
              <p className="text-sm text-muted-foreground">{role.subtitle}</p>
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <h2 className="font-display text-lg font-semibold mb-3">Your tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {role.tools.map((t) => (
            <Link key={t.to + t.title} to={t.to} className="group rounded-xl border border-border bg-card p-5 hover:border-accent/50 transition-colors">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 border border-accent/30"><t.icon className="h-5 w-5 text-accent" /></span>
              <h3 className="mt-3 font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all">{t.cta || "Open"} <ArrowRight className="h-3.5 w-3.5" /></span>
            </Link>
          ))}
        </div>
        <Link to="/marketplace" className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-accent/40 bg-accent/[0.06] p-5 hover:bg-accent/[0.1] transition-colors">
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-accent" />
            <div>
              <div className="font-semibold">Boliviq Marketplace — free for everyone</div>
              <div className="text-sm text-muted-foreground">Post, browse, and connect — no cost to participate.</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">Enter <ArrowRight className="h-4 w-4" /></span>
        </Link>
      </div>
    </div>
  );
}