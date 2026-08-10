import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import { listWorkspaceRecords, createWorkspaceRecord, deleteWorkspaceRecord } from "@/lib/workspaceRecords";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Search, Sparkles, Target, Plus, Trash2, Radio } from "lucide-react";
import BuyBoxForm from "@/components/dealdiscovery/BuyBoxForm";
import DealResultCard from "@/components/dealdiscovery/DealResultCard";

const SUGGESTIONS = [
  "Find me distressed houses within 20 miles of Nashville under $350,000 with at least $75,000 estimated spread.",
  "Find me off-market properties with high equity.",
  "Find fixer uppers that would work as flips with at least 20% projected ROI.",
];

export default function DealDiscovery() {
  const { activeWorkspaceId, loading: wsLoading } = useWorkspace();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [sources, setSources] = useState([]);
  const [parseNote, setParseNote] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [buyBoxes, setBuyBoxes] = useState([]);
  const [bbDialogOpen, setBbDialogOpen] = useState(false);
  const [viewDeal, setViewDeal] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const loadBuyBoxes = async () => {
    if (!activeWorkspaceId) return;
    const data = await listWorkspaceRecords("BuyBox", activeWorkspaceId).catch(() => []);
    setBuyBoxes(data || []);
  };
  useEffect(() => { loadBuyBoxes(); }, [activeWorkspaceId]);

  const runSearch = async (q, explicitFilters) => {
    if (!activeWorkspaceId) return;
    setSearching(true);
    setSearched(true);
    try {
      const res = await base44.functions.invoke("dealDiscovery", {
        workspace_id: activeWorkspaceId, query: q || "", filters: explicitFilters || {},
      });
      const data = res?.data || res || {};
      setResults(data.results || []);
      setSources(data.sources || []);
      setParseNote(data.parse_note || null);
    } catch (err) {
      toast({ title: "Search failed", description: err.message || err.error, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const searchFromBuyBox = (bb) => {
    setQuery(`Buy Box: ${bb.name}`);
    runSearch("", {
      location: bb.markets?.[0], max_price: bb.max_price, min_profit: bb.min_profit,
      min_roi_pct: bb.min_roi_pct, strategies: bb.strategies?.length ? bb.strategies : undefined,
    });
  };

  const saveBuyBox = async (form) => {
    try {
      await createWorkspaceRecord("BuyBox", activeWorkspaceId, form);
      toast({ title: "Buy Box saved" });
      setBbDialogOpen(false);
      loadBuyBoxes();
    } catch (err) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const removeBuyBox = async (bb) => {
    if (!window.confirm(`Delete Buy Box "${bb.name}"?`)) return;
    try {
      await deleteWorkspaceRecord("BuyBox", activeWorkspaceId, bb.id);
      loadBuyBoxes();
    } catch (err) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const toPropertyPayload = (deal, status) => ({
    address: deal.address, city: deal.city, state: deal.state, zip_code: deal.zip_code,
    property_type: deal.property_type, deal_strategy: deal.deal_strategy,
    asking_price: deal.asking_price, valuation: deal.valuation, arv: deal.arv,
    estimated_rehab: deal.estimated_rehab, status,
    source: deal.source === "Boliviq Marketplace" ? "boliviq_marketplace" : "manual",
    source_type: deal.source_type, notes: `Imported from Deal Discovery — Boliviq Deal Score ${deal.deal_score}/100.`,
  });

  const saveToCrm = async (deal) => {
    setBusyAction(`save-${deal.id}`);
    try {
      await createWorkspaceRecord("Property", activeWorkspaceId, toPropertyPayload(deal, "lead"));
      toast({ title: "Saved to CRM" });
    } catch (err) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally { setBusyAction(null); }
  };

  const addToPipeline = async (deal) => {
    setBusyAction(`pipeline-${deal.id}`);
    try {
      await createWorkspaceRecord("Property", activeWorkspaceId, toPropertyPayload(deal, "prospect"));
      toast({ title: "Added to pipeline" });
    } catch (err) {
      toast({ title: "Add failed", description: err.message, variant: "destructive" });
    } finally { setBusyAction(null); }
  };

  const runAnalysis = async (deal) => {
    setBusyAction(`analyze-${deal.id}`);
    try {
      const res = await base44.functions.invoke("dealCalculator", {
        type: "flip",
        inputs: {
          purchasePrice: deal.asking_price || deal.valuation || 0,
          rehab: deal.estimated_rehab || 0,
          arv: deal.arv || deal.valuation || 0,
        },
      });
      setAnalysis({ deal, result: (res?.data || res)?.result });
    } catch (err) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally { setBusyAction(null); }
  };

  if (wsLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  if (!activeWorkspaceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center"><p className="mb-4 text-muted-foreground">Select a workspace first.</p><Link to="/workspaces" className="text-accent font-semibold">Go to Workspaces →</Link></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold flex items-center gap-1.5"><Target className="h-4 w-4 text-accent" /> Buy Boxes</h2>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setBbDialogOpen(true)}><Plus className="h-3.5 w-3.5" /></Button>
          </div>
          {buyBoxes.length === 0 ? (
            <p className="text-xs text-muted-foreground">No Buy Boxes yet. Create one to save your criteria and enable monitoring.</p>
          ) : (
            <div className="space-y-2">
              {buyBoxes.map((bb) => (
                <div key={bb.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <button onClick={() => searchFromBuyBox(bb)} className="text-left text-sm font-medium hover:text-accent">{bb.name}</button>
                    <button onClick={() => removeBuyBox(bb)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {bb.monitor && <Badge variant="outline" className="text-[9px] gap-1"><Radio className="h-2.5 w-2.5" /> Monitoring</Badge>}
                    {bb.markets?.slice(0, 2).map((m) => <Badge key={m} variant="secondary" className="text-[9px]">{m}</Badge>)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Sources searched</h3>
            <div className="space-y-1.5">
              {sources.length === 0 ? (
                <p className="text-xs text-muted-foreground">Run a search to see source coverage.</p>
              ) : sources.map((s) => (
                <div key={s.key} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate pr-2">{s.label}</span>
                  <Badge variant="outline" className={`text-[9px] shrink-0 ${s.status === "connected" ? "border-emerald-500/40 text-emerald-400" : "border-muted-foreground/30 text-muted-foreground"}`}>
                    {s.status === "connected" ? `Connected${s.count != null ? ` · ${s.count}` : ""}` : "Connection required"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main>
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" /> Deal Discovery</h1>
            <p className="text-sm text-muted-foreground">Boliviq finds and ranks deals for you — this doesn't require you to have any properties in your CRM yet.</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 mb-6">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g. "Find me distressed houses within 20 miles of Nashville under $350,000 with at least $75,000 estimated spread."'
              rows={2}
              className="mb-3"
            />
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => setQuery(s)} className="text-[11px] text-muted-foreground hover:text-accent underline underline-offset-2">{s.slice(0, 40)}…</button>
                ))}
              </div>
              <Button onClick={() => runSearch(query)} disabled={searching} className="gap-1.5">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Find Deals
              </Button>
            </div>
          </div>

          {parseNote && <p className="text-xs text-muted-foreground mb-4">{parseNote}</p>}

          {searching ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
          ) : !searched ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
              Ask Boliviq to find deals, or select a Buy Box to run its criteria.
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground mb-2">No matches from currently connected sources.</p>
              <p className="text-xs text-muted-foreground">Check the sidebar for which sources are connected — connecting MLS/off-market feeds increases coverage.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {results.map((deal) => (
                <DealResultCard
                  key={deal.id}
                  deal={deal}
                  busyAction={busyAction}
                  onView={setViewDeal}
                  onAnalyze={runAnalysis}
                  onSaveToCrm={saveToCrm}
                  onAddToPipeline={addToPipeline}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={bbDialogOpen} onOpenChange={setBbDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Buy Box</DialogTitle></DialogHeader>
          <BuyBoxForm onSubmit={saveBuyBox} onCancel={() => setBbDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewDeal} onOpenChange={(o) => !o && setViewDeal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{viewDeal?.address || "Deal detail"}</DialogTitle></DialogHeader>
          {viewDeal && (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">{[viewDeal.city, viewDeal.state, viewDeal.zip_code].filter(Boolean).join(", ")}</p>
              <p>Source: <span className="text-foreground">{viewDeal.source}</span> · {viewDeal.source_type?.replace("_", " ")} · data confidence: {viewDeal.data_confidence}</p>
              <p>Boliviq Deal Score: <span className="font-bold text-accent">{viewDeal.deal_score}/100</span></p>
              <ul className="list-disc pl-4 text-muted-foreground">
                {viewDeal.score_reasons?.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
              {viewDeal.external_url && <a href={viewDeal.external_url} target="_blank" rel="noreferrer" className="text-accent text-xs underline">View original listing</a>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!analysis} onOpenChange={(o) => !o && setAnalysis(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Flip analysis — {analysis?.deal?.address}</DialogTitle></DialogHeader>
          {analysis?.result && (
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total cost</span><span>${Number(analysis.result.totalCost || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Net profit</span><span>${Number(analysis.result.netProfit || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ROI</span><span>{((analysis.result.roi || 0) * 100).toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">MAO (70% rule)</span><span>${Number(analysis.result.mao || 0).toLocaleString()}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
