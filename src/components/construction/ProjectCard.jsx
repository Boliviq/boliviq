import React from "react";
import { Link } from "react-router-dom";
import { Calendar, DollarSign, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_TONE = {
  planning: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  in_progress: "bg-accent/15 text-accent border-accent/30",
  on_hold: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

const money = (n) => (n ? "$" + Number(n).toLocaleString() : "$0");

export default function ProjectCard({ project }) {
  const pct = Math.min(100, Math.max(0, project.progress || 0));
  const budgetPct = project.budget ? Math.min(100, Math.round((project.spent / project.budget) * 100)) : 0;
  const overBudget = project.budget && project.spent > project.budget;

  return (
    <Link to={`/construction/${project.id}`} className="block rounded-lg border border-border bg-card p-5 hover:border-accent/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="font-semibold leading-tight">{project.name}</div>
        <Badge variant="outline" className={`capitalize ${STATUS_TONE[project.status] || ""}`}>{project.status.replace(/_/g, " ")}</Badge>
      </div>
      {project.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Progress</span><span>{pct}%</span></div>
          <div className="h-1.5 rounded-full bg-background overflow-hidden"><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{money(project.spent)} / {money(project.budget)}</span>
            <span className={overBudget ? "text-rose-400" : ""}>{budgetPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-background overflow-hidden"><div className={`h-full ${overBudget ? "bg-rose-500" : "bg-chart-2"}`} style={{ width: `${budgetPct}%` }} /></div>
        </div>
      </div>
      {project.target_end_date && (
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />Target {project.target_end_date}</div>
      )}
      <div className="mt-2 flex justify-end"><ChevronRight className="h-4 w-4 text-muted-foreground" /></div>
    </Link>
  );
}