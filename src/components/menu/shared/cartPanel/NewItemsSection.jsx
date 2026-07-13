import React from "react";
import { Badge } from "../../../../pages/public/publicMenu.ui";
import {
  buildNewItemsPricingSummary,
  money,
} from "../../../../hooks/public/publicMenu.utils";
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
  const pricingSummary = buildNewItemsPricingSummary([item]);
  const pricingLine = pricingSummary.lines[0];

  const promotion = pricingLine?.promotion || {
    hasActivePromotion: false,
    promotionLabel: "",
    promotionName: "",
    originalPrice: Number(item?.unit_price || 0),
    displayPrice: Number(item?.unit_price || 0),
    promotionDiscountPreview: 0,
    isQuantityPromotion: false,
    hasImmediatePricePreview: false,
    shouldStrikeOriginalPrice: false,
  };

  const unitPriceReference = Number(
    pricingLine?.unitPriceReference ?? item?.unit_price ?? 0,
  );

  const grossLineReference = Number(
    pricingLine?.grossLineReference ?? 0,
  );

  const promotionDiscountPreview = Number(
    pricingLine?.promotionDiscountPreview ?? 0,
  );

  const lineTotalApproximate = Number(
    pricingLine?.lineTotalApproximate ?? grossLineReference,
  );

  const showPromotionBadge =
    promotion.hasActivePromotion &&
    Boolean(promotion.promotionLabel);

  const showPromotionalPrice =
    promotion.hasActivePromotion &&
    !promotion.isQuantityPromotion &&
    promotion.hasImmediatePricePreview;

  const label = item?.variant_name
    ? `${item.name} · ${item.variant_name}`
    : item.name;

  return (
    <div className="cm-new-card">
      <div className="cm-new-card-top">
        <div className="cm-new-info">
          <div className="cm-new-title">{label}</div>

          <div className="cm-new-meta">Precio base</div>

          <div className="cm-price-stack">
            {showPromotionalPrice ? (
              <>
                <span className="cm-price-original">
                  {money(promotion.originalPrice)}
                </span>

                <span className="cm-price-promotional">
                  {money(promotion.displayPrice)}
                </span>
              </>
            ) : (
              <strong>{money(unitPriceReference)}</strong>
            )}
          </div>

          {showPromotionBadge ? (
            <div
              className={`cm-promotion-badge ${
                promotion.isQuantityPromotion
                  ? "cm-promotion-badge-quantity"
                  : ""
              }`}
              title={
                promotion.promotionName
                  ? `${promotion.promotionName}: ${promotion.promotionLabel}`
                  : promotion.promotionLabel
              }
            >
              {promotion.promotionLabel}
            </div>
          ) : null}

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

      {showPromotionalPrice && promotionDiscountPreview > 0 ? (
        <div className="cm-line-discount">
          <div className="cm-line-discount-row">
            <span className="cm-line-discount-label">
              Subtotal base
            </span>

            <span className="cm-line-discount-value">
              {money(grossLineReference)}
            </span>
          </div>

          <div className="cm-line-discount-row">
            <span className="cm-line-discount-label">
              Descuento promocional de referencia
            </span>

            <span className="cm-line-discount-value">
              −{money(promotionDiscountPreview)}
            </span>
          </div>
        </div>
      ) : null}

      {promotion.hasActivePromotion ? (
        <div className="cm-promotion-caption">
          Los extras no se descuentan. Los ajustes y el total definitivo se
          confirmarán al enviar.
        </div>
      ) : null}

      <div className="cm-new-controls">
        <div>
          <div className="cm-mini-label">Cantidad</div>
          <QtyControl item={item} onQtyChange={onQtyChange} />
        </div>

        <div
          className="cm-new-total-box"
          title="Importe de referencia. El total se confirmará el total al enviar."
        >
          <span>
            {promotion.hasActivePromotion
              ? "Total aprox."
              : "Subtotal aprox."}
          </span>

          <strong>{money(lineTotalApproximate)}</strong>
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