import React from "react";
import { Building2, Users, Store, LineChart, MessageCircle } from "lucide-react";
import RoleLanding from "@/components/role/RoleLanding";

export default function AgentHome() {
  return <RoleLanding role={{
    icon: Building2,
    title: "Welcome, Real Estate Agent",
    subtitle: "List properties, manage leads, and grow your pipeline.",
    tools: [
      { icon: Building2, title: "Listings & Properties", desc: "List on/off MLS, track status, and manage your property pipeline.", to: "/properties", cta: "Open CRM" },
      { icon: Users, title: "Leads & Clients", desc: "Manage contacts and deal stages.", to: "/contacts", cta: "Open Contacts" },
      { icon: Store, title: "Marketplace", desc: "Reach the Boliviq community with free agent listings.", to: "/marketplace", cta: "Go to Marketplace" },
      { icon: LineChart, title: "Analytics", desc: "Track performance across your pipeline.", to: "/analytics", cta: "View Analytics" },
      { icon: MessageCircle, title: "Ask Boliviq AI", desc: "Draft listings, comps, and outreach.", to: "/assistant", cta: "Open Assistant" },
    ],
  }} />;
}