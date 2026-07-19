import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import KnowledgeArticleForm, { SECTIONS } from "@/components/knowledge/KnowledgeArticleForm";
import { Loader2, Plus, Search, BookOpen, Pencil, Trash2, FileText, ChevronLeft } from "lucide-react";

const sectionLabel = (id) => SECTIONS.find((s) => s.id === id)?.label || id;

export default function KnowledgeBase() {
  const { loading: wsLoading } = useWorkspace();
  const [me, setMe] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("governance");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      setMe(user);
      const data = await base44.entities.KnowledgeArticle.list("-sort_order", 500);
      setArticles(data || []);
    } catch { toast({ title: "Could not load knowledge base", variant: "destructive" }); }
    setLoading(false);
  };

  useEffect(() => { if (!wsLoading) load(); }, [wsLoading]);

  const isAdmin = me?.role === "admin";

  const counts = useMemo(() => {
    const c = {};
    SECTIONS.forEach((s) => (c[s.id] = 0));
    articles.forEach((a) => { if (a.status !== "archived" && c[a.section] != null) c[a.section]++; });
    return c;
  }, [articles]);

  const sectionArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles
      .filter((a) => a.status === "published" || isAdmin)
      .filter((a) => a.section === activeSection)
      .filter((a) => !q || (a.title || "").toLowerCase().includes(q) || (a.subtitle || "").toLowerCase().includes(q) || (a.content || "").toLowerCase().includes(q) || (a.tags || []).some((t) => t.toLowerCase().includes(q)))
      .sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0));
  }, [articles, activeSection, query, isAdmin]);

  const save = async (form) => {
    try {
      if (editing) {
        await base44.entities.KnowledgeArticle.update(editing.id, form);
        toast({ title: "Article updated" });
      } else {
        await base44.entities.KnowledgeArticle.create(form);
        toast({ title: "Article created" });
      }
      setDialogOpen(false);
      load();
    } catch (err) { toast({ title: "Save failed", description: err.message, variant: "destructive" }); }
  };

  const remove = async (a) => {
    if (!confirm(`Delete "${a.title}"?`)) return;
    try { await base44.entities.KnowledgeArticle.delete(a.id); if (selected?.id === a.id) setSelected(null); load(); }
    catch (err) { toast({ title: "Delete failed", description: err.message, variant: "destructive" }); }
  };

  if (wsLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopBar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2"><BookOpen className="h-5 w-5 text-accent" /> Master Knowledge Base</h1>
            <p className="text-sm text-muted-foreground">Boliviq's constitution and filing system — governance, product, agents, integrations, and more.</p>
          </div>
          {isAdmin && <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-1.5 shrink-0"><Plus className="h-4 w-4" /> New article</Button>}
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          {/* Section nav */}
          <aside className="md:sticky md:top-20 self-start">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles…"
                className="w-full rounded-md border border-input bg-background pl-8 pr-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible no-scrollbar">
              {SECTIONS.map((s) => (
                <button key={s.id} onClick={() => { setActiveSection(s.id); setSelected(null); }}
                  className={`text-left whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors ${activeSection === s.id ? "bg-accent/10 text-accent font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                  <span className="flex items-center justify-between gap-2">{s.label}<span className="text-xs opacity-70">{counts[s.id] || 0}</span></span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main pane */}
          <div className="min-w-0">
            {selected ? (
              <article className="rounded-lg border border-border bg-card p-6">
                <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"><ChevronLeft className="h-4 w-4" /> Back to {sectionLabel(selected.section)}</button>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wide text-accent">{sectionLabel(selected.section)}</div>
                    <h2 className="font-display text-xl font-bold mt-1">{selected.title}</h2>
                    {selected.subtitle && <p className="text-sm text-muted-foreground mt-1">{selected.subtitle}</p>}
                    {selected.tags?.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{selected.tags.map((t) => <span key={t} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">{t}</span>)}</div>}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => { setEditing(selected); setDialogOpen(true); }} className="p-1.5 rounded hover:bg-background"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(selected)} className="p-1.5 rounded hover:bg-background"><Trash2 className="h-4 w-4 text-destructive" /></button>
                    </div>
                  )}
                </div>
                <div className="prose prose-invert max-w-none mt-5 text-sm leading-relaxed text-foreground/90">
                  <ReactMarkdown>{selected.content || ""}</ReactMarkdown>
                </div>
              </article>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-lg font-semibold">{sectionLabel(activeSection)}</h2>
                  <span className="text-xs text-muted-foreground">{sectionArticles.length} article{sectionArticles.length === 1 ? "" : "s"}</span>
                </div>
                {sectionArticles.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No articles in this section yet. {isAdmin && "Click “New article” to add the first one."}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {sectionArticles.map((a) => (
                      <button key={a.id} onClick={() => setSelected(a)} className="text-left rounded-lg border border-border bg-card p-4 hover:border-accent/50 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">{a.title}</span>
                          {a.status !== "published" && <span className="text-[10px] uppercase rounded px-1.5 py-0.5 bg-muted text-muted-foreground">{a.status}</span>}
                        </div>
                        {a.subtitle && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.subtitle}</p>}
                        {a.category && <span className="inline-block mt-2 text-[11px] text-accent/80">{a.category}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit article" : "New knowledge article"}</DialogTitle></DialogHeader>
          <KnowledgeArticleForm initial={editing} onSubmit={save} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}