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

function toDisplayAmount(value, fallback = 0) {
  const number = Number(value);

  if (Number.isFinite(number)) {
    return number;
  }

  const fallbackNumber = Number(fallback);

  return Number.isFinite(fallbackNumber) ? fallbackNumber : 0;
}

function normalizeStatusText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isRepeatedPaymentBadge(badge) {
  const label = normalizeStatusText(badge?.label);

  return (
    label.includes("en proceso de pago") ||
    label.includes("proceso de pago") ||
    label === "en caja" ||
    label === "paying"
  );
}

function PricingSummaryBlock({
  pricingSummary,
  fallbackTotal = 0,
}) {
  if (!pricingSummary || typeof pricingSummary !== "object") {
    return null;
  }

  const confirmed =
    pricingSummary?.confirmed &&
    typeof pricingSummary.confirmed === "object"
      ? pricingSummary.confirmed
      : {};

  const pending =
    pricingSummary?.pending &&
    typeof pricingSummary.pending === "object"
      ? pricingSummary.pending
      : {};

  const hasConfirmed = Boolean(pricingSummary?.hasConfirmed);
  const hasPending = Boolean(pricingSummary?.hasPending);
  const isEstimated = Boolean(pricingSummary?.isEstimated);

  if (!hasConfirmed && !hasPending) {
    return null;
  }

  const confirmedPromotionDiscount = toDisplayAmount(
    confirmed?.promotionDiscountTotal,
    0,
  );

  const confirmedManualDiscount = toDisplayAmount(
    confirmed?.manualDiscountTotal,
    0,
  );

  const confirmedDiscountTotal =
    confirmedPromotionDiscount + confirmedManualDiscount;

  const confirmedTotal = toDisplayAmount(
    confirmed?.confirmedTotal,
    0,
  );

  const pendingGrossSubtotal = toDisplayAmount(
    pending?.grossSubtotalReference,
    0,
  );

  const pendingPromotionPreview = toDisplayAmount(
    pending?.promotionDiscountPreview,
    0,
  );

  const pendingTotalApproximate = toDisplayAmount(
    pending?.totalApproximate,
    pendingGrossSubtotal,
  );

  const displayTotal = toDisplayAmount(
    pricingSummary?.displayTotal,
    fallbackTotal,
  );

  const hasUnresolvedQuantityPromotions = Boolean(
    pricingSummary?.hasUnresolvedQuantityPromotions,
  );

  const hasConfirmedAndPending = hasConfirmed && hasPending;
  const hasOnlyConfirmed = hasConfirmed && !hasPending;
  const hasOnlyPending = !hasConfirmed && hasPending;

  return (
    <div className="cm-pricing-summary">
      <div className="cm-pricing-summary-head">
        <div className="cm-pricing-summary-title">
          Resumen de importes
        </div>

        <span
          className={`cm-pricing-state ${
            isEstimated
              ? "cm-pricing-state-estimated"
              : "cm-pricing-state-confirmed"
          }`}
        >
          {isEstimated ? "Aproximado" : "Confirmado"}
        </span>
      </div>

      <div className="cm-pricing-summary-grid">
        {hasConfirmedAndPending ? (
          <>
            <div className="cm-pricing-summary-row">
              <span className="cm-pricing-summary-label">
                Total confirmado actual
              </span>

              <span className="cm-pricing-summary-value">
                {money(confirmedTotal)}
              </span>
            </div>

            <div className="cm-pricing-summary-row">
              <span className="cm-pricing-summary-label">
                Productos nuevos aproximados
              </span>

              <span className="cm-pricing-summary-value">
                {money(pendingTotalApproximate)}
              </span>
            </div>

            <div className="cm-pricing-summary-row cm-pricing-summary-row-total">
              <span className="cm-pricing-summary-label">
                Total estimado al enviar
              </span>

              <span className="cm-pricing-summary-value">
                {money(displayTotal)}
              </span>
            </div>
          </>
        ) : null}

        {hasOnlyConfirmed ? (
          <div className="cm-pricing-summary-row cm-pricing-summary-row-total">
            <span className="cm-pricing-summary-label">
              Total confirmado
            </span>

            <span className="cm-pricing-summary-value">
              {money(confirmedTotal || displayTotal)}
            </span>
          </div>
        ) : null}

        {hasOnlyPending ? (
          <>
            <div className="cm-pricing-summary-row">
              <span className="cm-pricing-summary-label">
                Subtotal de referencia
              </span>

              <span className="cm-pricing-summary-value">
                {money(pendingGrossSubtotal)}
              </span>
            </div>

            <div className="cm-pricing-summary-row cm-pricing-summary-row-total">
              <span className="cm-pricing-summary-label">
                Total aproximado
              </span>

              <span className="cm-pricing-summary-value">
                {money(pendingTotalApproximate || displayTotal)}
              </span>
            </div>
          </>
        ) : null}
      </div>

      {hasConfirmedAndPending ? (
        <div className="cm-pricing-summary-secondary">
          {confirmedDiscountTotal > 0 ? (
            <div>
              Descuentos ya aplicados:{" "}
              <strong>−{money(confirmedDiscountTotal)}</strong>
            </div>
          ) : null}

          {pendingPromotionPreview > 0 ? (
            <div>
              Promoción visual en productos nuevos:{" "}
              <strong>−{money(pendingPromotionPreview)}</strong>
            </div>
          ) : null}
        </div>
      ) : null}

      {hasOnlyConfirmed && confirmedDiscountTotal > 0 ? (
        <div className="cm-pricing-summary-secondary">
          Descuentos aplicados:{" "}
          <strong>−{money(confirmedDiscountTotal)}</strong>
        </div>
      ) : null}

      {hasOnlyPending && pendingPromotionPreview > 0 ? (
        <div className="cm-pricing-summary-secondary">
          Promoción visual:{" "}
          <strong>−{money(pendingPromotionPreview)}</strong>
        </div>
      ) : null}

      {isEstimated ? (
        <div className="cm-pricing-summary-note cm-pricing-summary-note-estimated">
          {hasUnresolvedQuantityPromotions
            ? "Hay promociones por cantidad. El descuento exacto se confirmará al enviar."
            : "El total final se confirmará al enviar."}
        </div>
      ) : null}
    </div>
  );
}

export default function MenuCartPanel({
  title = "Comanda",
  subtitle = "",
  customerName = "",
  total = 0,
  pricingSummary = null,
  oldItems = [],
  newItems = [],
  sendToast = "",
  sending = false,
  canAppend = false,
  canSubmit = false,
  showPaymentMessage = false,

  statusBadges = [],
  extraTopActions = null,

  submitLabel = "",
  submitTitle = "",

  onEmpty,
  onSubmit,
  onQtyChange,
  onNotesChange,
  onRemove,

  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",

  requestBillBlock = null,
}) {
  const [noteItem, setNoteItem] = useState(null);
  const [noteValue, setNoteValue] = useState("");

  const hasOld = Array.isArray(oldItems) && oldItems.length > 0;
  const hasNew = Array.isArray(newItems) && newItems.length > 0;
  const oldItemsTree = useMemo(() => buildOldItemsTree(oldItems), [oldItems]);

  const isPaymentInProgress = Boolean(showPaymentMessage);

  const visibleStatusBadges = useMemo(() => {
    const badges = Array.isArray(statusBadges) ? statusBadges : [];

    if (!isPaymentInProgress) {
      return badges;
    }

    return badges.filter((badge) => !isRepeatedPaymentBadge(badge));
  }, [statusBadges, isPaymentInProgress]);

  const visibleRequestBillBlock =
    !isPaymentInProgress ? requestBillBlock : null;

  const visibleSendToast =
    !isPaymentInProgress ? String(sendToast || "") : "";

  const toastStyles = getToastStyles(visibleSendToast);

  const hasPricingSummary =
    pricingSummary &&
    typeof pricingSummary === "object";

  const resolvedDisplayTotal = hasPricingSummary
    ? toDisplayAmount(pricingSummary?.displayTotal, total)
    : toDisplayAmount(total, 0);

  const resolvedSubmitTitle =
    submitTitle ||
    (canAppend ? "Agregar productos a la orden abierta" : "Enviar comanda");

  const resolvedSubmitLabel =
    submitLabel ||
    (sending ? "⏳ Enviando..." : canAppend ? "➕ Agregar" : "📤 Enviar");

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
              title={resolvedSubmitTitle}
            >
              {sending ? "⏳ Enviando..." : resolvedSubmitLabel}
            </PillButton>

            {extraTopActions}
          </div>
        </div>
      </div>

      {isPaymentInProgress ? (
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
          💳 Cuenta en proceso de pago. El cajero finalizará el cobro.
        </div>
      ) : null}

      {visibleStatusBadges.length > 0 ? (
        <div
          style={{
            marginTop: 11,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {visibleStatusBadges.map((b, idx) => (
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

      {visibleRequestBillBlock ? (
        <div style={{ marginTop: 12 }}>
          {visibleRequestBillBlock}
        </div>
      ) : null}

      <PricingSummaryBlock
        pricingSummary={pricingSummary}
        fallbackTotal={resolvedDisplayTotal}
      />

      {hasOld ? (
        <OldItemsSection
          oldItems={oldItems}
          oldItemsTree={oldItemsTree}
          onRemoveOldItem={onRemoveOldItem}
          removingOldItemId={removingOldItemId}
          oldItemRemoveLabel={oldItemRemoveLabel}
        />
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

      {visibleSendToast ? (
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
          {visibleSendToast}
        </div>
      ) : null}
    </div>
  );
}