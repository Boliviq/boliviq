import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Loader2, Search } from "lucide-react";
import ListingForm from "@/components/marketplace/ListingForm";
import ListingCard from "@/components/marketplace/ListingCard";
import MarketplaceHero from "@/components/marketplace/MarketplaceHero";
import MarketplaceCategoryGrid from "@/components/marketplace/MarketplaceCategoryGrid";
import MarketplaceSidebar from "@/components/marketplace/MarketplaceSidebar";
import MarketplaceRightRail from "@/components/marketplace/MarketplaceRightRail";
import MarketplaceFooter from "@/components/marketplace/MarketplaceFooter";

const CATEGORIES = ["all", "contracting", "renovation", "roofing", "plumbing", "electrical", "hvac", "landscaping", "cleaning", "photography", "staging", "legal", "financing", "insurance", "marketing", "materials", "equipment", "other"];
const pretty = (s) => s.replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase());

export default function Marketplace() {
  const { activeWorkspaceId, loading: wsLoading } = useWorkspace();
  const [me, setMe] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [mineOnly, setMineOnly] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    if (!activeWorkspaceId) { setLoading(false); return; }
    setLoading(true);
    try {
      const user = await base44.auth.me();
      setMe(user);
      const data = await base44.entities.MarketplaceListing.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 200);
      setListings(data || []);
    } catch {
      toast({ title: "Could not load listings", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeWorkspaceId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    return listings.filter((l) => {
      if (mineOnly && me && l.created_by_id !== me.id) return false;
      if (category !== "all" && l.category !== category) return false;
      if (q) {
        const hay = `${l.title || ""} ${l.provider_name || ""} ${l.description || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (loc) {
        const hay = `${l.location || ""} ${l.service_area || ""}`.toLowerCase();
        if (!hay.includes(loc)) return false;
      }
      return true;
    });
  }, [listings, category, query, location, mineOnly, me]);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (l) => { setEditing(l); setDialogOpen(true); };

  const save = async (form) => {
    try {
      if (editing) {
        await base44.entities.MarketplaceListing.update(editing.id, form);
        toast({ title: "Listing updated" });
      } else {
        await base44.entities.MarketplaceListing.create({ ...form, workspace_id: activeWorkspaceId });
        toast({ title: "Listing created" });
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const remove = async (l) => {
    if (!confirm(`Delete "${l.title}"?`)) return;
    try {
      await base44.entities.MarketplaceListing.delete(l.id);
      toast({ title: "Listing deleted" });
      load();
    } catch (err) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  if (wsLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  }
  if (!activeWorkspaceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center"><p className="mb-4 text-muted-foreground">Select a workspace first.</p><a href="/workspaces" className="text-accent font-semibold">Go to Workspaces →</a></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />

      {/* Search header */}
      <div className="sticky top-14 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the Boliviq Marketplace…"
              className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c === "all" ? "All Categories" : pretty(c)}</option>)}
          </select>
          <Button onClick={openCreate} className="gap-1.5"><Plus className="h-4 w-4" /> Post an Ad</Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid md:grid-cols-[210px_1fr] lg:grid-cols-[210px_1fr_240px] gap-6">
          <MarketplaceSidebar
            onPostAd={openCreate}
            onHome={() => { setMineOnly(false); setCategory("all"); setQuery(""); setLocation(""); }}
            onMyListings={() => setMineOnly(true)}
            mineOnly={mineOnly}
          />

          <main className="min-w-0">
            <MarketplaceHero />
            <MarketplaceCategoryGrid onPostFree={openCreate} />

            <section className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-semibold">{mineOnly ? "My Listings" : "Latest Listings"}</h2>
                <span className="text-xs text-muted-foreground">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
              </div>
              {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
                  {listings.length === 0 ? "No listings yet. Click “Post an Ad” to add your first one." : "No listings match your filters."}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((l) => <ListingCard key={l.id} listing={l} onEdit={openEdit} onDelete={remove} />)}
                </div>
              )}
            </section>
          </main>

          <MarketplaceRightRail
            location={location}
            onLocationChange={setLocation}
            onPopularSearch={(p) => setQuery(p)}
            onUpgrade={() => window.location.assign("/billing")}
          />
        </div>

        <MarketplaceFooter />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit listing" : "New listing"}</DialogTitle></DialogHeader>
          <ListingForm initial={editing} onSubmit={save} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}