import React from "react";
import { Badge } from "../../../../pages/public/publicMenu.ui";
import { money, safeNum } from "../../../../hooks/public/publicMenu.utils";
import ModifierGroupsBlock from "./ModifierGroupsBlock";
import CompositeDetailBlock from "./CompositeDetailBlock";
import QtyControl from "./QtyControl";

function NoteButton({ item, onOpenNote }) {
  const note = String(item?.notes || "").trim();

  return (
    <div className="cm-note-button-wrap">
      <button
        type="button"
        className={`cm-note-btn ${note ? "cm-note-btn-active" : ""}`}
        onClick={() => onOpenNote?.(item)}
        title={note ? "Editar nota" : "Agregar nota"}
      >
        📝 {note ? "Editar nota" : "Nota"}
      </button>

      {note ? <div className="cm-note-preview">“{note}”</div> : null}
    </div>
  );
}

function NewItemCard({ item, onQtyChange, onRemove, onOpenNote }) {
  const subtotal = safeNum(item?.unit_price, 0) * safeNum(item?.quantity, 1);
  const label = item?.variant_name
    ? `${item.name} · ${item.variant_name}`
    : item.name;

  return (
    <div className="cm-new-card">
      <div className="cm-new-card-top">
        <div className="cm-new-info">
          <div className="cm-new-title">{label}</div>
          <div className="cm-new-meta">
            Precio: <strong>{money(item?.unit_price)}</strong>
          </div>
        </div>

        <button
          className="cm-icon-btn cm-remove-btn"
          onClick={() => onRemove?.(item.key)}
          title="Quitar"
        >
          🗑️
        </button>
      </div>

      <ModifierGroupsBlock groups={item?.modifier_groups_display || []} />
      <CompositeDetailBlock details={item?.components_detail || []} />

      <div className="cm-new-controls">
        <div>
          <div className="cm-mini-label">Cantidad</div>
          <QtyControl item={item} onQtyChange={onQtyChange} />
        </div>

        <div className="cm-new-total-box">
          <span>Subtotal</span>
          <strong>{money(subtotal)}</strong>
        </div>
      </div>

      <NoteButton item={item} onOpenNote={onOpenNote} />
    </div>
  );
}

export default function NewItemsSection({
  newItems = [],
  canAppend = false,
  onQtyChange,
  onRemove,
  onOpenNote,
}) {
  return (
    <div className="cm-section">
      <div className="cm-section-title">
        <span>Items nuevos por {canAppend ? "agregar" : "enviar"}</span>
        <Badge tone="ok">{newItems.length}</Badge>
      </div>

      <div className="cm-new-card-list">
        {newItems.map((it) => (
          <NewItemCard
            key={`new-card-${it.key}`}
            item={it}
            onQtyChange={onQtyChange}
            onRemove={onRemove}
            onOpenNote={onOpenNote}
          />
        ))}
      </div>
    </div>
  );
}