import React from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/lib/workspaceContext";
import { Building2 } from "lucide-react";
import MobileNav from "@/components/MobileNav";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/analytics", label: "Analytics" },
  { to: "/properties", label: "CRM" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/construction", label: "Construction" },
  { to: "/contractor-tools", label: "Tools" },
  { to: "/construction-estimator", label: "Estimator" },
  { to: "/assistant", label: "AI Assistant" },
  { to: "/rewards", label: "Rewards" },
  { to: "/contacts", label: "Contacts" },
  { to: "/workspaces", label: "Workspaces" },
  { to: "/billing", label: "Billing" },
  { to: "/admin", label: "Admin" },
  { to: "/admin/permissions-monitor", label: "Permissions" },
  { to: "/admin/setup-health", label: "Setup" },
  { to: "/admin/foundation-health", label: "Foundation" },
  { to: "/admin/security-audit", label: "Security" },
  { to: "/admin/launch-monitor", label: "Launch" },
  { to: "/knowledge-base", label: "Knowledge" },
];

export default function AppTopBar() {
  const { activeWorkspace } = useWorkspace();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
            <Building2 className="h-3.5 w-3.5 text-accent" />
          </span>
          <span className="font-display font-bold tracking-tight text-sm">BOLIVIQ</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm text-white/70 hover:text-accent transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>
        {activeWorkspace?.name && (
          <div className="text-xs text-muted-foreground truncate max-w-[40vw]">{activeWorkspace.name}</div>
        )}
      </div>
      <MobileNav />
    </header>
  );
}