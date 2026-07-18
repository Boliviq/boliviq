import React from "react";
import { MapPin, Star, Wrench, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AVAIL_COLOR = {
  available: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  limited: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  booked: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  unavailable: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export default function ListingCard({ listing, onEdit, onDelete }) {
  const priceLabel = listing.price
    ? `$${Number(listing.price).toLocaleString()}${listing.pricing_model === "hourly" ? "/hr" : listing.pricing_model === "monthly" ? "/mo" : ""}`
    : listing.pricing_model === "quote" ? "Quote" : "—";

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10">
            <Wrench className="h-4 w-4 text-accent" />
          </span>
          <div>
            <div className="font-semibold leading-tight">{listing.title}</div>
            <div className="text-xs text-muted-foreground capitalize">{listing.category.replace(/_/g, " ")} · {listing.listing_type}</div>
          </div>
        </div>
        <Badge variant="outline" className={`capitalize ${AVAIL_COLOR[listing.availability] || ""}`}>{listing.availability}</Badge>
      </div>

      {listing.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{listing.description}</p>}

      {listing.provider_name && <div className="text-sm mb-1">{listing.provider_name}</div>}

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        {listing.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.location}</span>}
        {listing.rating > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-accent" />{listing.rating.toFixed(1)} ({listing.review_count || 0})</span>}
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="font-semibold">{priceLabel}</span>
        <div className="flex gap-1">
          <button onClick={() => onEdit(listing)} className="p-1.5 rounded-md hover:bg-background"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
          <button onClick={() => onDelete(listing)} className="p-1.5 rounded-md hover:bg-background"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
        </div>
      </div>
    </div>
  );
}