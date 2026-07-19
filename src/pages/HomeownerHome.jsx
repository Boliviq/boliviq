import React from "react";
import { Home, Store, Hammer, Building2, MessageCircle } from "lucide-react";
import RoleLanding from "@/components/role/RoleLanding";

export default function HomeownerHome() {
  return <RoleLanding role={{
    icon: Home,
    title: "Welcome, Homeowner",
    subtitle: "Everything you need to fix, improve, and manage your home — in one place.",
    tools: [
      { icon: Store, title: "Post a Request", desc: "Post repairs, improvements, and projects — get matched with pros for free.", to: "/marketplace", cta: "Go to Marketplace" },
      { icon: Hammer, title: "My Projects", desc: "Track active construction and renovation projects.", to: "/construction", cta: "View Projects" },
      { icon: Building2, title: "My Properties", desc: "Manage your properties and listings.", to: "/properties", cta: "Open CRM" },
      { icon: MessageCircle, title: "Ask Boliviq AI", desc: "Get guidance on repairs, costs, and next steps.", to: "/assistant", cta: "Open Assistant" },
    ],
  }} />;
}