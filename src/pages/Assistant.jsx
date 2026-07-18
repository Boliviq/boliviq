import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/lib/workspaceContext";
import AppTopBar from "@/components/AppTopBar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Send, Sparkles, MessageSquare, Trash2 } from "lucide-react";

const SUGGESTIONS = [
  "Summarize my deal pipeline",
  "Which property has the best profit potential?",
  "What construction projects are over budget?",
  "Draft a follow-up email to my top investor contact",
];

export default function Assistant() {
  const { activeWorkspaceId, loading: wsLoading } = useWorkspace();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const scrollRef = useRef(null);
  const { toast } = useToast();

  const loadConversations = async () => {
    if (!activeWorkspaceId) { setLoadingConvos(false); return; }
    setLoadingConvos(true);
    try {
      const data = await base44.entities.Conversation.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 50);
      setConversations(data || []);
    } catch { toast({ title: "Could not load conversations", variant: "destructive" }); }
    setLoadingConvos(false);
  };

  const loadMessages = async (id) => {
    if (!id) { setMessages([]); return; }
    try {
      const data = await base44.entities.Message.filter({ conversation_id: id }, "created_date", 200);
      setMessages(data || []);
    } catch { toast({ title: "Could not load messages", variant: "destructive" }); }
  };

  useEffect(() => { loadConversations(); }, [activeWorkspaceId]);
  useEffect(() => { loadMessages(activeId); }, [activeId]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const newConversation = async () => {
    try {
      const c = await base44.entities.Conversation.create({ workspace_id: activeWorkspaceId, title: "New conversation" });
      setConversations((prev) => [c, ...prev]);
      setActiveId(c.id);
      setMessages([]);
    } catch (err) { toast({ title: "Could not start conversation", description: err.message, variant: "destructive" }); }
  };

  const removeConversation = async (c, e) => {
    e?.stopPropagation();
    if (!confirm("Delete this conversation and its messages?")) return;
    try {
      const msgs = await base44.entities.Message.filter({ conversation_id: c.id });
      await base44.entities.Message.deleteMany({ conversation_id: c.id });
      await base44.entities.Conversation.delete(c.id);
      if (activeId === c.id) { setActiveId(null); setMessages([]); }
      loadConversations();
    } catch (err) { toast({ title: "Delete failed", description: err.message, variant: "destructive" }); }
  };

  const buildContext = async () => {
    const [properties, projects, contacts] = await Promise.all([
      base44.entities.Property.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 20).catch(() => []),
      base44.entities.ConstructionProject.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 10).catch(() => []),
      base44.entities.Contact.filter({ workspace_id: activeWorkspaceId }, "-updated_date", 10).catch(() => []),
    ]);
    const money = (n) => (n ? "$" + Number(n).toLocaleString() : "—");
    const propsSummary = (properties || []).map((p) => `- ${p.address} (${p.status || "lead"}, ${p.deal_strategy || "n/a"}, valuation ${money(p.valuation)}, ARV ${money(p.arv)})`).join("\n");
    const projSummary = (projects || []).map((p) => `- ${p.name} (${p.status}, budget ${money(p.budget)}, spent ${money(p.spent)}, progress ${p.progress || 0}%)`).join("\n");
    const contactSummary = (contacts || []).map((c) => `- ${c.full_name} (${c.type}, ${c.stage})`).join("\n");
    return `BOLIVIQ WORKSPACE CONTEXT (real-time):
Properties (${(properties || []).length}): ${propsSummary || "none"}
Construction projects (${(projects || []).length}): ${projSummary || "none"}
Contacts (${(contacts || []).length}): ${contactSummary || "none"}`;
  };

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    let convoId = activeId;
    setSending(true);
    setInput("");
    try {
      if (!convoId) {
        const c = await base44.entities.Conversation.create({ workspace_id: activeWorkspaceId, title: content.slice(0, 40) });
        convoId = c.id;
        setConversations((prev) => [c, ...prev]);
        setActiveId(c.id);
      }
      const userMsg = await base44.entities.Message.create({ conversation_id: convoId, role: "user", content });
      setMessages((prev) => [...prev, userMsg]);

      const context = await buildContext();
      const transcript = [...messages, userMsg].map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
      const prompt = `You are Boliviq AI, an expert real-estate and construction operating assistant. Use the workspace context below to give concise, actionable answers. If data is missing, say so and suggest next steps.\n\n${context}\n\nConversation:\n${transcript}\n\nAssistant:`;

      const res = await base44.integrations.Core.InvokeLLM({ prompt, model: "automatic" });
      const reply = typeof res === "string" ? res : (res?.response || res?.output || JSON.stringify(res));
      const aiMsg = await base44.entities.Message.create({ conversation_id: convoId, role: "assistant", content: reply });
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      toast({ title: "AI request failed", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (wsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  }
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
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid md:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col rounded-lg border border-border bg-card overflow-hidden">
          <div className="p-3 border-b border-border">
            <button onClick={newConversation} className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> New chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingConvos ? (
              <div className="p-4 text-center text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">No conversations yet.</div>
            ) : (
              conversations.map((c) => (
                <div key={c.id} onClick={() => setActiveId(c.id)} className={`group flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer text-sm ${activeId === c.id ? "bg-accent/10 text-accent" : "hover:bg-background"}`}>
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 truncate">{c.title || "New conversation"}</span>
                  <button onClick={(e) => removeConversation(c, e)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-background"><Trash2 className="h-3 w-3 text-muted-foreground" /></button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Thread */}
        <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
          <div className="md:hidden flex items-center gap-2 p-3 border-b border-border">
            <button onClick={newConversation} className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"><Plus className="h-3.5 w-3.5" /> New</button>
            <select value={activeId || ""} onChange={(e) => setActiveId(e.target.value || null)} className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs">
              <option value="">Select conversation…</option>
              {conversations.map((c) => <option key={c.id} value={c.id}>{c.title || "New conversation"}</option>)}
            </select>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 mb-3"><Sparkles className="h-6 w-6 text-accent" /></span>
                <h2 className="font-display text-lg font-semibold mb-1">Boliviq AI Assistant</h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">Ask anything about your deals, projects, and contacts — powered by your live workspace data.</p>
                <div className="grid sm:grid-cols-2 gap-2 max-w-md w-full">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="text-left rounded-md border border-border bg-background px-3 py-2 text-sm hover:border-accent/40 transition-colors">{s}</button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-accent text-accent-foreground" : "bg-background border border-border"}`}>
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start"><div className="rounded-lg px-4 py-2.5 bg-background border border-border"><Loader2 className="h-4 w-4 animate-spin text-accent" /></div></div>
            )}
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1}
                placeholder="Ask Boliviq AI…"
                className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring max-h-32"
              />
              <button onClick={() => send()} disabled={sending || !input.trim()} className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-accent text-accent-foreground disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}