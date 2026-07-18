import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const fmt = (v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`);

export default function BudgetBar({ data, title }) {
  const hasData = data.some((d) => d.budget > 0 || d.spent > 0);
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-semibold mb-4">{title}</h3>
      {!hasData ? (
        <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">No projects</div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={45} />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="budget" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}