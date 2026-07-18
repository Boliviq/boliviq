import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import PropertyCard from "./PropertyCard";

const COLUMNS = [
  { id: "lead", label: "Leads" },
  { id: "prospect", label: "Prospects" },
  { id: "under_contract", label: "Under Contract" },
  { id: "owned", label: "Owned" },
  { id: "listed", label: "Listed" },
  { id: "sold", label: "Sold" },
];

export default function PipelineBoard({ properties, onMove, onEdit }) {
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    onMove(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {COLUMNS.map((col) => {
          const items = properties.filter((p) => (p.status || "lead") === col.id);
          return (
            <div key={col.id} className="w-72 shrink-0">
              <div className="rounded-lg border border-border bg-card/50 p-3 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">{col.label}</span>
                  <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5">{items.length}</span>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[120px] space-y-2 rounded-md p-1.5 transition-colors ${snapshot.isDraggingOver ? "bg-accent/10" : ""}`}
                    >
                      {items.map((p, idx) => (
                        <Draggable key={p.id} draggableId={p.id} index={idx}>
                          {(prov, snap) => (
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                              <PropertyCard property={p} onClick={() => onEdit(p)} dragging={snap.isDragging} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {items.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-xs text-muted-foreground text-center py-6">No deals</div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}