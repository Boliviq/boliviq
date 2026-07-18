import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, Store, Sparkles, Users } from "lucide-react";

const TABS = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/properties", label: "CRM", icon: Building2 },
  { to: "/marketplace", label: "Market", icon: Store },
  { to: "/assistant", label: "AI", icon: Sparkles },
  { to: "/workspaces", label: "Spaces", icon: Users },
];

export default function MobileNav() {
  const { pathname } = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-14 border-t border-border bg-background/95 backdrop-blur-xl flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)]">
      {TABS.map((t) => {
        const active = pathname === t.to || (t.to !== "/dashboard" && pathname.startsWith(t.to));
        return (
          <Link key={t.to} to={t.to} className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] ${active ? "text-accent" : "text-muted-foreground"}`}>
            <t.icon className="h-5 w-5" />
            <span className="font-medium">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}