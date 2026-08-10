import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database } from "lucide-react";

const TYPE_LABELS = { first_party: "First-party", on_market: "On-market", off_market: "Off-market" };

export default function DataSourcesPanel() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke("sourceConnectionStatus", {})
      .then((res) => setSources((res?.data || res)?.sources || []))
      .catch(() => setSources([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>;

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4 flex items-start gap-2">
        <Database className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
        Deal Discovery searches every source below. Connected sources are actually queried; "Connection required" sources are never faked — connect real credentials to add coverage.
      </p>
      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {sources.map((s) => (
          <div key={s.key} className="flex items-center gap-3 p-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.purpose}</div>
            </div>
            <Badge variant="outline" className="text-[10px] capitalize shrink-0">{TYPE_LABELS[s.type] || s.type}</Badge>
            <Badge
              variant="outline"
              className={`text-[10px] shrink-0 ${s.status === "connected" ? "border-emerald-500/40 text-emerald-400" : "border-amber-500/40 text-amber-400"}`}
            >
              {s.status === "connected" ? "Connected" : "Connection required"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
