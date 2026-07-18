import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ROLES = ["admin", "manager", "member", "finance", "contractor", "agent", "viewer"];

export default function InviteMemberForm({ onSubmit, onCancel }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubmit({ email: email.trim(), role });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Email *</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@company.com" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Workspace role</Label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
          {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
        </select>
      </div>
      <p className="text-xs text-muted-foreground">The invitee will receive an app invite and be added to this workspace with the chosen role.</p>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Send invite</Button>
      </div>
    </form>
  );
}