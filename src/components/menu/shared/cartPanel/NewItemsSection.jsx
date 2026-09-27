import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "../../../../pages/public/publicMenu.ui";
import {
  buildNewItemsPricingSummary,
  getAvailabilityData,
  getPublicAvailabilityPresentation,
  money,
  safeNum,
} from "../../../../hooks/public/publicMenu.utils";
import {
  getPreparedItemConfigurationSummary,
  getPreparedItemCurrentPrice,
  getPreparedItemDisplayName,
  isPreparedItemLine,
} from "../../../../hooks/menu/preparedItem.utils";

import { isCartItemAvailabilityInvalid } from "../../../../hooks/menu/menuAvailability.utils";
import PaginationFooter from "../../../common/PaginationFooter";
import { buildOldItemsTree, renderNotes } from "./cartPanel.utils";
import ModifierGroupsBlock from "./ModifierGroupsBlock";
import CompositeDetailBlock from "./CompositeDetailBlock";
import QtyControl from "./QtyControl";

const NEW_ITEMS_PAGE_SIZE = 4;

function useItemsPagination(items, pageSize = NEW_ITEMS_PAGE_SIZE) {
  const rows = Array.isArray(items) ? items : [];
  const [page, setPage] = useState(1);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage((currentPage) => Math.min(Math.max(currentPage, 1), totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return rows.slice(startIndex, startIndex + pageSize);
  }, [rows, page, pageSize]);

  return {
    page,
    setPage,
    total,
    totalPages,
    paginatedItems,
    startItem: total > 0 ? (page - 1) * pageSize + 1 : 0,
    endItem: Math.min(page * pageSize, total),
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}

function normalizeAvailabilityMaxQty(value) {
  if (value === null || value === undefined || value === "") return null;

  const quantity = Number(value);
  if (!Number.isFinite(quantity)) return null;

  return Math.max(0, Math.floor(quantity));
}

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

function RemoveButton({ item, onRemove }) {
  return (
    <button
      type="button"
      className="cm-icon-btn cm-remove-btn"
      onClick={() => onRemove?.(item?.key)}
      title="Quitar"
    >
      🗑️
    </button>
  );
}

function PreparedNewItemCard({ item, onRemove, onOpenNote }) {
  const label = getPreparedItemDisplayName(item);
  const configurationSummary = getPreparedItemConfigurationSummary(item);
  const currentPrice = getPreparedItemCurrentPrice(item);

  return (
    <div className="cm-new-card">
      <div className="cm-new-card-top">
        <div className="cm-new-info">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              flexWrap: "wrap",
            }}
          >
            <div className="cm-new-title">{label}</div>
            <span className="cm-prepared-badge">Preparación rápida</span>
          </div>

          {configurationSummary.length > 0 ? (
            <div className="cm-new-meta">
              {configurationSummary.join(" · ")}
            </div>
          ) : null}

          <div className="cm-price-stack" style={{ marginTop: 7 }}>
            <strong>{currentPrice !== null ? money(currentPrice) : "—"}</strong>
          </div>
        </div>

        <RemoveButton item={item} onRemove={onRemove} />
      </div>

      <div className="cm-new-controls">
        <div>
          <div className="cm-mini-label">Cantidad</div>
          <div className="cm-fixed-quantity">1 unidad</div>
        </div>

        <div
          className="cm-new-total-box"
          title="Importe de referencia. El total final se confirmará al enviar."
        >
          <span>Subtotal aprox.</span>
          <strong>{currentPrice !== null ? money(currentPrice) : "—"}</strong>
        </div>
      </div>

      <NoteButton item={item} onOpenNote={onOpenNote} />
    </div>
  );
}

function getPendingItemLabel(item) {
  const productName =
    item?.product_name ||
    item?.name ||
    `Producto #${item?.product_id || ""}`;

  return item?.variant_name
    ? `${productName} · ${item.variant_name}`
    : productName;
}

function getPendingItemQuantity(item) {
  const quantity = Number(
    item?.effective_quantity ??
    item?.quantity ??
    0,
  );

  if (!Number.isFinite(quantity)) {
    return 0;
  }

  return Math.max(0, Math.trunc(quantity));
}

function getPendingItemTotal(item) {
  const quantity = getPendingItemQuantity(item);
  const unitPrice = Math.max(0, safeNum(item?.unit_price, 0));

  return Math.max(
    0,
    safeNum(
      item?.net_line_total,
      safeNum(item?.line_total, unitPrice * quantity),
    ),
  );
}

function PendingChildCard({ item }) {
  const label = getPendingItemLabel(item);
  const quantity = getPendingItemQuantity(item);
  const total = getPendingItemTotal(item);

  return (
    <div className="cm-child-card">
      <div className="cm-mobile-title">↳ {label}</div>

      <div className="cm-mobile-sub">
        Cantidad: <strong>{quantity}</strong>
        {total > 0 ? <> · {money(total)}</> : null}
      </div>

      <ModifierGroupsBlock groups={item?.modifier_groups_display || []} />

      {item?.notes ? (
        <div className="cm-note">• {renderNotes(item.notes)}</div>
      ) : null}
    </div>
  );
}

function PendingNewItemCard({ item }) {
  const label = getPendingItemLabel(item);
  const quantity = getPendingItemQuantity(item);
  const total = getPendingItemTotal(item);

  const isPrepared =
    String(item?.fulfillment_source || "") === "prepared_reuse";

  return (
    <div className="cm-new-card">
      <div className="cm-new-card-top">
        <div className="cm-new-info">
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <div className="cm-new-title">{label}</div>
            <span className="cm-prepared-badge">En espera de aprobación</span>

            {isPrepared ? (
              <span className="cm-prepared-badge">Preparación rápida</span>
            ) : null}
          </div>

          <div className="cm-new-meta">Pedido enviado · Solo lectura</div>
        </div>
      </div>

      <ModifierGroupsBlock groups={item?.modifier_groups_display || []} />
      <CompositeDetailBlock details={item?.components_detail || []} />

      {item?.notes ? (
        <div className="cm-note">• {renderNotes(item.notes)}</div>
      ) : null}

      <div className="cm-new-controls">
        <div>
          <div className="cm-mini-label">Cantidad</div>
          <div className="cm-fixed-quantity">
            {quantity} {quantity === 1 ? "unidad" : "unidades"}
          </div>
        </div>

        <div
          className="cm-new-total-box"
          title="Importe correspondiente al pedido enviado."
        >
          <span>Total enviado</span>
          <strong>{money(total)}</strong>
        </div>
      </div>

      {Array.isArray(item?.children) && item.children.length > 0 ? (
        <div className="cm-children-list">
          {item.children.map((child) => (
            <PendingChildCard
              key={`pending-child-${child?.id || child?.order_item_id}`}
              item={child}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NewItemCard({ item, onQtyChange, onRemove, onOpenNote }) {
  if (isPreparedItemLine(item)) {
    return (
      <PreparedNewItemCard
        item={item}
        onRemove={onRemove}
        onOpenNote={onOpenNote}
      />
    );
  }

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

  const itemAvailability =
    getAvailabilityData(item) ||
    (item?.availability_status
      ? {
          status: item.availability_status,
          is_available_now: item.is_available_now,
          max_available_qty: item?.max_available_qty ?? null,
        }
      : null);

  const invalidItem = isCartItemAvailabilityInvalid(item);
  const availabilityUi = getPublicAvailabilityPresentation(itemAvailability);

  const selectedQty = Math.max(0, Number(item?.quantity || 0));

  const maxAvailableQty = normalizeAvailabilityMaxQty(
    itemAvailability?.max_available_qty,
  );

  const quantityExceedsAvailability =
    maxAvailableQty !== null && selectedQty > maxAvailableQty;

  const invalidAvailabilityLabel = quantityExceedsAvailability
    ? "Disponibilidad limitada"
    : availabilityUi.label || "No disponible";

  const invalidAvailabilityCaption = quantityExceedsAvailability
    ? `Cantidad seleccionada: ${selectedQty}. Máx. disponible: ${maxAvailableQty}.`
    : availabilityUi.caption || invalidAvailabilityLabel;

  return (
    <div
      className="cm-new-card"
      aria-invalid={invalidItem ? "true" : undefined}
      style={
        invalidItem
          ? {
              borderColor: "rgba(211, 47, 47, 0.32)",
              background: "rgba(211, 47, 47, 0.025)",
            }
          : undefined
      }
    >
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

        <RemoveButton item={item} onRemove={onRemove} />
      </div>

      {invalidItem ? (
        <div
          role="alert"
          title={invalidAvailabilityCaption}
          style={{
            padding: "10px 12px",
            borderRadius: 9,
            border: "1px solid rgba(211, 47, 47, 0.24)",
            background: "rgba(211, 47, 47, 0.07)",
            color: "#B42318",
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 4 }}>
            {invalidAvailabilityLabel}
          </div>

          <div style={{ fontWeight: 700 }}>
            {quantityExceedsAvailability ? (
              <>
                Seleccionaste {selectedQty}. Máx. disponible: {maxAvailableQty}.
                <br />
                Ajusta la cantidad para continuar.
              </>
            ) : (
              <>Quítalo para continuar.</>
            )}
          </div>
        </div>
      ) : null}

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
          title="Importe de referencia. El total final se confirmará al enviar."
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
  pendingItems = [],
  canAppend = false,
  onQtyChange,
  onRemove,
  onOpenNote,
}) {
  const items = Array.isArray(newItems) ? newItems : [];

  const pendingItemsTree = useMemo(
    () => buildOldItemsTree(pendingItems),
    [pendingItems],
  );

  const localPagination = useItemsPagination(items);
  const pendingPagination = useItemsPagination(pendingItemsTree);

  const showPendingItems = pendingPagination.total > 0;
  const showLocalItems = localPagination.total > 0 || !showPendingItems;

  return (
    <div className="cm-section">
      {showPendingItems ? (
        <>
          <div className="cm-section-title">
            <span>En espera de aprobación</span>
            <Badge tone="dark">{pendingPagination.total}</Badge>
          </div>

          <div className="cm-new-card-list">
            {pendingPagination.paginatedItems.map((item) => (
              <PendingNewItemCard
                key={`pending-card-${item?.id || item?.order_item_id}`}
                item={item}
              />
            ))}
          </div>

          {pendingPagination.total > NEW_ITEMS_PAGE_SIZE ? (
            <PaginationFooter
              page={pendingPagination.page}
              totalPages={pendingPagination.totalPages}
              startItem={pendingPagination.startItem}
              endItem={pendingPagination.endItem}
              total={pendingPagination.total}
              hasPrev={pendingPagination.hasPrev}
              hasNext={pendingPagination.hasNext}
              onPrev={() =>
                pendingPagination.setPage((currentPage) =>
                  Math.max(1, currentPage - 1),
                )
              }
              onNext={() =>
                pendingPagination.setPage((currentPage) =>
                  Math.min(pendingPagination.totalPages, currentPage + 1),
                )
              }
              itemLabel="productos en espera"
            />
          ) : null}
        </>
      ) : null}

      {showLocalItems ? (
        <>
          <div className="cm-section-title">
            <span>
              Items nuevos por {canAppend ? "agregar" : "enviar"}
            </span>
            <Badge tone="ok">{localPagination.total}</Badge>
          </div>

          <div className="cm-new-card-list">
            {localPagination.paginatedItems.map((item) => (
              <NewItemCard
                key={`new-card-${item.key}`}
                item={item}
                onQtyChange={onQtyChange}
                onRemove={onRemove}
                onOpenNote={onOpenNote}
              />
            ))}
          </div>

          {localPagination.total > NEW_ITEMS_PAGE_SIZE ? (
            <PaginationFooter
              page={localPagination.page}
              totalPages={localPagination.totalPages}
              startItem={localPagination.startItem}
              endItem={localPagination.endItem}
              total={localPagination.total}
              hasPrev={localPagination.hasPrev}
              hasNext={localPagination.hasNext}
              onPrev={() =>
                localPagination.setPage((currentPage) =>
                  Math.max(1, currentPage - 1),
                )
              }
              onNext={() =>
                localPagination.setPage((currentPage) =>
                  Math.min(localPagination.totalPages, currentPage + 1),
                )
              }
              itemLabel="productos nuevos"
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}