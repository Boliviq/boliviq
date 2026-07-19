import React from "react";
import { HardHat, Calculator, Store, Hammer, Users, MessageCircle } from "lucide-react";
import RoleLanding from "@/components/role/RoleLanding";

export default function ContractorHome() {
  return <RoleLanding role={{
    icon: HardHat,
    title: "Welcome, Contractor",
    subtitle: "Estimate jobs, manage builds, find work, and grow your business.",
    tools: [
      { icon: Calculator, title: "Contractor Tools", desc: "Estimate costs, build a supplies list, and schedule phases — job time auto-adds a +20% buffer.", to: "/contractor-tools", cta: "Open Tools" },
      { icon: Store, title: "Post Your Services", desc: "List your trade on the marketplace and get found by homeowners.", to: "/marketplace", cta: "Go to Marketplace" },
      { icon: Hammer, title: "Projects", desc: "Manage your active construction projects and tasks.", to: "/construction", cta: "View Projects" },
      { icon: Users, title: "Clients & Leads", desc: "Track contacts and deal stages.", to: "/contacts", cta: "Open Contacts" },
      { icon: MessageCircle, title: "Ask Boliviq AI", desc: "Get help pricing jobs and sourcing materials.", to: "/assistant", cta: "Open Assistant" },
    ],
  }} />;
}