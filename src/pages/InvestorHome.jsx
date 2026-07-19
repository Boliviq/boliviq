import React from "react";
import { TrendingUp, Bell, Store, LineChart, MessageCircle } from "lucide-react";
import RoleLanding from "@/components/role/RoleLanding";

export default function InvestorHome() {
  return <RoleLanding role={{
    icon: TrendingUp,
    title: "Welcome, Investor",
    subtitle: "Find deals, post opportunities, and let Boliviq work your pipeline.",
    tools: [
      { icon: TrendingUp, title: "Deal Pipeline", desc: "Track properties by strategy — wholesale, fix-flip, BRRRR, and more.", to: "/properties", cta: "Open CRM" },
      { icon: Bell, title: "Deal Alerts", desc: "Get notified the moment matching deals and listings drop.", to: "/deal-alerts", cta: "Manage Alerts" },
      { icon: Store, title: "Post a Deal", desc: "Post off-market deals and find cash buyers and funding partners.", to: "/marketplace", cta: "Go to Marketplace" },
      { icon: LineChart, title: "Analytics", desc: "Track portfolio performance and budgets.", to: "/analytics", cta: "View Analytics" },
      { icon: MessageCircle, title: "Ask Boliviq AI", desc: "Analyze deals and run numbers.", to: "/assistant", cta: "Open Assistant" },
    ],
  }} />;
}