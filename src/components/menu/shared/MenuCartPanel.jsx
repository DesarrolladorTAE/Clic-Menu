import React, { useMemo, useState } from "react";
import { money } from "../../../hooks/public/publicMenu.utils";
import { Badge, PillButton } from "../../../pages/public/publicMenu.ui";

import MenuCartPanelStyles from "./cartPanel/MenuCartPanelStyles";
import NoteEditorModal from "./cartPanel/NoteEditorModal";
import OldItemsSection from "./cartPanel/OldItemsSection";
import NewItemsSection from "./cartPanel/NewItemsSection";
import {
  buildOldItemsTree,
  getToastStyles,
} from "./cartPanel/cartPanel.utils";

export default function MenuCartPanel({
  title = "Comanda",
  subtitle = "",
  customerName = "",
  total = 0,
  oldItems = [],
  newItems = [],
  sendToast = "",
  sending = false,
  canAppend = false,
  canSubmit = false,
  showPaymentMessage = false,

  statusBadges = [],
  extraTopActions = null,

  onEmpty,
  onSubmit,
  onQtyChange,
  onNotesChange,
  onRemove,

  requestBillBlock = null,
}) {
  const [noteItem, setNoteItem] = useState(null);
  const [noteValue, setNoteValue] = useState("");

  const hasOld = Array.isArray(oldItems) && oldItems.length > 0;
  const hasNew = Array.isArray(newItems) && newItems.length > 0;
  const oldItemsTree = useMemo(() => buildOldItemsTree(oldItems), [oldItems]);
  const toastStyles = getToastStyles(sendToast);

  const openNoteModal = (item) => {
    setNoteItem(item);
    setNoteValue(String(item?.notes || ""));
  };

  const closeNoteModal = () => {
    setNoteItem(null);
    setNoteValue("");
  };

  const saveNote = (nextValue) => {
    if (!noteItem?.key) return;
    onNotesChange?.(noteItem.key, nextValue);
    closeNoteModal();
  };

  if (!hasOld && !hasNew) return null;

  return (
    <div className="cm-panel">
      <MenuCartPanelStyles />

      <NoteEditorModal
        open={!!noteItem}
        item={noteItem}
        value={noteValue}
        setValue={setNoteValue}
        onClose={closeNoteModal}
        onSave={saveNote}
      />

      <div className="cm-header">
        <div className="cm-header-main">
          <div>
            <div className="cm-title">{title}</div>

            {subtitle ? <div className="cm-subtitle">{subtitle}</div> : null}

            {customerName ? (
              <div className="cm-customer">
                A nombre de: <strong>{customerName}</strong>
              </div>
            ) : null}
          </div>

          <div className="cm-actions">
            <Badge tone="default">
              Total: <strong style={{ marginLeft: 6 }}>{money(total)}</strong>
            </Badge>

            <PillButton
              tone="danger"
              onClick={onEmpty}
              title="Vaciar items nuevos"
              disabled={sending || !hasNew}
            >
              🗑️ Vaciar
            </PillButton>

            <PillButton
              tone="orange"
              onClick={onSubmit}
              disabled={!canSubmit || sending}
              title={
                canAppend
                  ? "Agregar productos a la orden abierta"
                  : "Enviar comanda"
              }
            >
              {sending ? "⏳ Enviando..." : canAppend ? "➕ Agregar" : "📤 Enviar"}
            </PillButton>

            {extraTopActions}
          </div>
        </div>
      </div>

      {showPaymentMessage ? (
        <div
          style={{
            marginTop: 12,
            border: "1px solid rgba(245,158,11,0.28)",
            background: "#fef3c7",
            color: "#92400e",
            borderRadius: 16,
            padding: 11,
            fontSize: 13,
            fontWeight: 850,
            lineHeight: 1.4,
          }}
        >
          💳 Cuenta en proceso de pago. Un mesero está procesando tu cuenta.
        </div>
      ) : null}

      {statusBadges?.length ? (
        <div
          style={{
            marginTop: 11,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {statusBadges.map((b, idx) => (
            <Badge
              key={`${b?.label || idx}-${idx}`}
              tone={b?.tone || "default"}
              title={b?.title}
            >
              {b?.label}
            </Badge>
          ))}
        </div>
      ) : null}

      {requestBillBlock ? (
        <div style={{ marginTop: 12 }}>{requestBillBlock}</div>
      ) : null}

      {hasOld ? (
        <OldItemsSection oldItems={oldItems} oldItemsTree={oldItemsTree} />
      ) : (
        <div className="cm-empty-history">No hay historial cargado.</div>
      )}

      {hasNew ? (
        <NewItemsSection
          newItems={newItems}
          canAppend={canAppend}
          onQtyChange={onQtyChange}
          onRemove={onRemove}
          onOpenNote={openNoteModal}
        />
      ) : null}

      {sendToast ? (
        <div
          style={{
            marginTop: 12,
            border: toastStyles.border,
            borderRadius: 16,
            padding: 11,
            background: toastStyles.background,
            color: toastStyles.color,
            fontSize: 13,
            fontWeight: 850,
            whiteSpace: "pre-line",
            lineHeight: 1.45,
          }}
        >
          {sendToast}
        </div>
      ) : null}
    </div>
  );
}