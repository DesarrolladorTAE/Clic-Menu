import React, { useEffect, useMemo, useState } from "react";
import { Badge, PillButton } from "../../../../pages/public/publicMenu.ui";
import { money, safeNum } from "../../../../hooks/public/publicMenu.utils";
import PaginationFooter from "../../../common/PaginationFooter";
import { renderNotes } from "./cartPanel.utils";
import ModifierGroupsBlock from "./ModifierGroupsBlock";
import CompositeDetailBlock from "./CompositeDetailBlock";

const OLD_ITEMS_PAGE_SIZE = 4;

function getOldItemId(item) {
  return Number(item?.id || item?.order_item_id || 0);
}

function hasOwn(source, key) {
  return (
    source != null &&
    typeof source === "object" &&
    Object.prototype.hasOwnProperty.call(source, key)
  );
}

function roundMoney(value) {
  return Math.round((safeNum(value, 0) + Number.EPSILON) * 100) / 100;
}

function normalizeItemQuantity(value, fallback = 0) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity)) return Math.max(0, Math.trunc(Number(fallback) || 0));

  return Math.max(0, Math.trunc(quantity));
}

function resolveCancellationState(item) {
  const originalQuantity = normalizeItemQuantity(
    hasOwn(item, "original_quantity") ? item?.original_quantity : item?.quantity,
  );

  const cancelledQuantity = Math.min(
    originalQuantity,
    normalizeItemQuantity(item?.cancelled_quantity),
  );

  const effectiveQuantity = hasOwn(item, "effective_quantity")
    ? Math.min(originalQuantity, normalizeItemQuantity(item?.effective_quantity))
    : Math.max(0, originalQuantity - cancelledQuantity);

  const cancellations = Array.isArray(item?.cancellations) ? item.cancellations : [];
  const hasCancellation =
    Boolean(item?.is_cancelled) ||
    cancelledQuantity > 0 ||
    cancellations.length > 0;

  return {
    originalQuantity,
    cancelledQuantity,
    effectiveQuantity,
    cancellations,
    hasCancellation,
    fullyCancelled: hasCancellation && effectiveQuantity <= 0,
    partiallyCancelled: hasCancellation && effectiveQuantity > 0,
  };
}

function CancellationStateBlock({ item }) {
  const state = resolveCancellationState(item);

  if (!state.hasCancellation) return null;

  if (state.fullyCancelled) {
    return (
      <div className="cm-cancellation-summary">
        <span className="cm-cancellation-full">Cancelado</span>
        <span>Cantidad original: {state.originalQuantity}</span>

        {state.cancellations.length > 1 ? (
          <span>{state.cancellations.length} cancelaciones aplicadas</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="cm-cancellation-summary">
      <span>
        <strong>{state.effectiveQuantity}</strong> de{" "}
        <strong>{state.originalQuantity}</strong> vigentes
      </span>

      <span>
        Cancelada{state.cancelledQuantity === 1 ? "" : "s"}:{" "}
        <strong>{state.cancelledQuantity}</strong>
      </span>

      {state.cancellations.length > 1 ? (
        <span>{state.cancellations.length} cancelaciones aplicadas</span>
      ) : null}
    </div>
  );
}

function PreparedReuseBadge({ item }) {
  if (String(item?.fulfillment_source || "") !== "prepared_reuse") return null;

  return <span className="cm-prepared-badge">Preparación rápida</span>;
}

function resolveConfirmedItemPricing(item) {
  const quantity = Math.max(
    0,
    safeNum(
      hasOwn(item, "original_quantity") ? item?.original_quantity : item?.quantity,
      1,
    ),
  );

  const unitPrice = roundMoney(Math.max(0, safeNum(item?.unit_price, 0)));

  const legacyGrossLineTotal = roundMoney(unitPrice * quantity);

  const grossLineTotal = roundMoney(
    Math.max(
      0,
      hasOwn(item, "gross_line_total")
        ? safeNum(item?.gross_line_total, legacyGrossLineTotal)
        : hasOwn(item, "line_total")
          ? safeNum(item?.line_total, legacyGrossLineTotal)
          : legacyGrossLineTotal,
    ),
  );

  const promotionDiscountTotal = roundMoney(
    Math.max(
      0,
      hasOwn(item, "promotion_discount_total")
        ? safeNum(item?.promotion_discount_total, 0)
        : 0,
    ),
  );

  const explicitDiscountTotal = hasOwn(item, "discount_total")
    ? roundMoney(Math.max(0, safeNum(item?.discount_total, 0)))
    : null;

  const manualDiscountTotal = roundMoney(
    Math.max(
      0,
      hasOwn(item, "manual_discount_total")
        ? safeNum(item?.manual_discount_total, 0)
        : explicitDiscountTotal !== null
          ? explicitDiscountTotal - promotionDiscountTotal
          : 0,
    ),
  );

  const discountTotal = roundMoney(
    Math.max(
      0,
      explicitDiscountTotal !== null
        ? explicitDiscountTotal
        : promotionDiscountTotal + manualDiscountTotal,
    ),
  );

  const netLineTotal = roundMoney(
    Math.max(
      0,
      hasOwn(item, "net_line_total")
        ? safeNum(item?.net_line_total, grossLineTotal - discountTotal)
        : grossLineTotal - discountTotal,
    ),
  );

  const appliedPromotions = Array.isArray(item?.applied_promotions)
    ? item.applied_promotions
    : [];

  const hasDetailedPricing = [
    "gross_line_total",
    "promotion_discount_total",
    "manual_discount_total",
    "discount_total",
    "net_line_total",
    "applied_promotions",
  ].some((field) => hasOwn(item, field));

  return {
    unitPrice,
    quantity,

    grossLineTotal,
    promotionDiscountTotal,
    manualDiscountTotal,
    discountTotal,
    netLineTotal,

    appliedPromotions,
    hasDetailedPricing,
    hasDiscount: discountTotal > 0,
  };
}

function translatePromotionType(value) {
  const type = String(value || "").toLowerCase();

  const labels = {
    promotional_price: "Precio promocional",
    buy_x_pay_y: "Promoción por cantidad",
    product_discount: "Descuento de producto",
  };

  return labels[type] || (value ? String(value) : "Promoción");
}

function formatAffectedQuantity(value) {
  const quantity = Math.max(0, safeNum(value, 0));

  if (Number.isInteger(quantity)) {
    return String(quantity);
  }

  return quantity
    .toFixed(3)
    .replace(/0+$/, "")
    .replace(/\.$/, "");
}

function OldRemoveButton({
  item,
  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",
}) {
  if (!onRemoveOldItem) return null;

  const itemId = getOldItemId(item);
  const removing = itemId > 0 && Number(removingOldItemId || 0) === itemId;

  return (
    <PillButton
      tone="danger"
      disabled={removing}
      title="Quitar producto guardado"
      onClick={() => onRemoveOldItem?.(item)}
    >
      {removing ? "⏳ Quitando..." : `🗑️ ${oldItemRemoveLabel}`}
    </PillButton>
  );
}

function AppliedPromotionsBlock({ promotions = [] }) {
  const rows = Array.isArray(promotions) ? promotions : [];

  if (rows.length <= 0) return null;

  return (
    <div className="cm-applied-promotions">
      {rows.map((promotion, index) => {
        const promotionName =
          promotion?.promotion_name || "Promoción aplicada";

        const promotionType = translatePromotionType(
          promotion?.promotion_type,
        );

        const quantityAffected = formatAffectedQuantity(
          promotion?.quantity_affected,
        );

        return (
          <span
            key={
              promotion?.order_item_promotion_application_id ||
              promotion?.id ||
              `${promotion?.promotion_id || "promotion"}-${index}`
            }
            className="cm-applied-promotion"
            title={`${promotionName} · ${promotionType}`}
          >
            {promotionName} · {promotionType} · {quantityAffected} unidad
            {Number(quantityAffected) === 1 ? "" : "es"}
          </span>
        );
      })}
    </div>
  );
}

function ConfirmedLinePricingBlock({ pricing }) {
  if (!pricing?.hasDiscount) return null;

  const hasSeparatedDiscount =
    pricing.promotionDiscountTotal > 0 ||
    pricing.manualDiscountTotal > 0;

  return (
    <div className="cm-line-discount">
      <div className="cm-line-discount-row">
        <span className="cm-line-discount-label">
          Subtotal antes de descuento
        </span>

        <span className="cm-line-discount-value">
          {money(pricing.grossLineTotal)}
        </span>
      </div>

      {pricing.promotionDiscountTotal > 0 ? (
        <div className="cm-line-discount-row">
          <span className="cm-line-discount-label">
            Promoción
          </span>

          <span className="cm-line-discount-value">
            −{money(pricing.promotionDiscountTotal)}
          </span>
        </div>
      ) : null}

      {pricing.manualDiscountTotal > 0 ? (
        <div className="cm-line-discount-row">
          <span className="cm-line-discount-label">
            Descuento manual
          </span>

          <span className="cm-line-discount-value">
            −{money(pricing.manualDiscountTotal)}
          </span>
        </div>
      ) : null}

      {!hasSeparatedDiscount && pricing.discountTotal > 0 ? (
        <div className="cm-line-discount-row">
          <span className="cm-line-discount-label">
            Descuento aplicado
          </span>

          <span className="cm-line-discount-value">
            −{money(pricing.discountTotal)}
          </span>
        </div>
      ) : null}
    </div>
  );
}


function OldChildRow({
  item,
  hasActionColumn = false,
}) {
  const cancellation = resolveCancellationState(item);

  const label = item?.variant_name
    ? `${item.product_name} · ${item.variant_name}`
    : item.product_name || `Producto #${item.product_id}`;

  const subtotal = safeNum(
    item?.line_total,
    safeNum(item?.unit_price, 0) * safeNum(item?.quantity, 1),
  );

  const hideMoney =
    safeNum(item?.unit_price, 0) <= 0 && safeNum(subtotal, 0) <= 0;

  return (
    <tr>
      <td className="cm-td cm-child">
        <div style={{ fontWeight: 850, fontSize: 12, color: "#3F3A52" }}>
          ↳ {label}
        </div>

        <CancellationStateBlock item={item} />

        <ModifierGroupsBlock
          groups={item?.modifier_groups_display || []}
          indent={12}
        />

        {item?.notes ? (
          <div className="cm-note">• {renderNotes(item.notes)}</div>
        ) : null}
      </td>

      <td className="cm-td cm-center cm-child">
        {cancellation.effectiveQuantity}
      </td>

      <td className="cm-td cm-right cm-child cm-bold">
        {hideMoney ? "Incluido" : money(subtotal)}
      </td>

      {hasActionColumn ? (
        <td className="cm-td cm-child" aria-hidden="true" />
      ) : null}
    </tr>
  );
}

function OldRow({
  item,
  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",
}) {
  const label = item?.variant_name
    ? `${item.product_name} · ${item.variant_name}`
    : item.product_name || `Producto #${item.product_id}`;

  const pricing = resolveConfirmedItemPricing(item);

  const cancellation = resolveCancellationState(item);

  const isCompositeParent =
    !!item?.is_composite_parent ||
    (Array.isArray(item?.children) && item.children.length > 0);

  const hasActionColumn =
  typeof onRemoveOldItem === "function";

  const hasAppliedPromotions =
    Array.isArray(pricing.appliedPromotions) &&
    pricing.appliedPromotions.length > 0;

  const hasFullWidthDetail =
    hasAppliedPromotions || pricing.hasDiscount;

  return (
    <>
      <tr>

        <td className={`cm-td ${isCompositeParent ? "cm-combo" : ""}`}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontWeight: 950, fontSize: 13, color: "#3F3A52" }}>
              {label}
            </div>

            {isCompositeParent ? (
              <span className="cm-combo-badge">Combo</span>
            ) : null}

            <PreparedReuseBadge item={item} />
          </div>

          <CancellationStateBlock item={item} />

          <ModifierGroupsBlock groups={item?.modifier_groups_display || []} />
          <CompositeDetailBlock details={item?.components_detail || []} />

          {item?.notes ? (
            <div className="cm-note">• {renderNotes(item.notes)}</div>
          ) : null}
        </td>

        <td className={`cm-td cm-center ${isCompositeParent ? "cm-combo" : ""}`}>
          {cancellation.effectiveQuantity}
        </td>

        <td
          className={`cm-td cm-right cm-bold ${
            isCompositeParent ? "cm-combo" : ""
          }`}
          title="Total histórico confirmado por el servidor"
        >
          {money(pricing.netLineTotal)}
        </td>

        {hasActionColumn ? (
          <td className={`cm-td cm-right ${isCompositeParent ? "cm-combo" : ""}`}>
            <OldRemoveButton
              item={item}
              onRemoveOldItem={onRemoveOldItem}
              removingOldItemId={removingOldItemId}
              oldItemRemoveLabel={oldItemRemoveLabel}
            />
          </td>
        ) : null}
      </tr>

      {hasFullWidthDetail ? (
        <tr className="cm-pricing-detail-row">
          <td
            className="cm-td cm-pricing-detail-cell"
            colSpan={hasActionColumn ? 4 : 3}
          >
            <div className="cm-confirmed-detail-stack">
              {hasAppliedPromotions ? (
                <AppliedPromotionsBlock
                  promotions={pricing.appliedPromotions}
                />
              ) : null}

              {pricing.hasDiscount ? (
                <ConfirmedLinePricingBlock pricing={pricing} />
              ) : null}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function OldItemCard({
  item,
  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",
}) {
  const label = item?.variant_name
    ? `${item.product_name} · ${item.variant_name}`
    : item.product_name || `Producto #${item.product_id}`;

  const pricing = resolveConfirmedItemPricing(item);

  const cancellation = resolveCancellationState(item);

  const isCompositeParent =
    !!item?.is_composite_parent ||
    (Array.isArray(item?.children) && item.children.length > 0);

  return (
    <div className="cm-mobile-card">
      <div className="cm-mobile-card-head">
        <div>
          <div className="cm-mobile-title">{label}</div>

          {!cancellation.hasCancellation ? (
            <div className="cm-mobile-sub">
              Cantidad: <strong>{cancellation.effectiveQuantity}</strong>
            </div>
          ) : null}

          <CancellationStateBlock item={item} />
        </div>

        <div
          className="cm-mobile-price"
          title="Total histórico confirmado por el servidor"
        >
          {money(pricing.netLineTotal)}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {isCompositeParent ? <span className="cm-combo-badge">Combo</span> : null}
        <PreparedReuseBadge item={item} />
      </div>

      <ModifierGroupsBlock groups={item?.modifier_groups_display || []} />
      <CompositeDetailBlock details={item?.components_detail || []} />

      <AppliedPromotionsBlock
        promotions={pricing.appliedPromotions}
      />

      <ConfirmedLinePricingBlock pricing={pricing} />

      {item?.notes ? (
        <div className="cm-note">• {renderNotes(item.notes)}</div>
      ) : null}

      {onRemoveOldItem ? (
        <div style={{ marginTop: 10, display: "flex", justifyContent: "end" }}>
          <OldRemoveButton
            item={item}
            onRemoveOldItem={onRemoveOldItem}
            removingOldItemId={removingOldItemId}
            oldItemRemoveLabel={oldItemRemoveLabel}
          />
        </div>
      ) : null}

      {Array.isArray(item?.children) && item.children.length > 0 ? (
        <div className="cm-children-list">
          {item.children.map((child) => {
            const childLabel = child?.variant_name
              ? `${child.product_name} · ${child.variant_name}`
              : child.product_name || `Producto #${child.product_id}`;

            const childCancellation = resolveCancellationState(child);

            const childSubtotal = safeNum(
              child?.line_total,
              safeNum(child?.unit_price, 0) * safeNum(child?.quantity, 1),
            );

            const childHideMoney =
              safeNum(child?.unit_price, 0) <= 0 &&
              safeNum(childSubtotal, 0) <= 0;

            return (
              <div
                key={`old-mobile-child-${child?.id}`}
                className="cm-child-card"
              >
                <div className="cm-mobile-title">↳ {childLabel}</div>

                <div className="cm-mobile-sub">
                  Cantidad: <strong>{childCancellation.effectiveQuantity}</strong> ·{" "}
                  {childHideMoney ? "Incluido" : money(childSubtotal)}
                </div>

                <CancellationStateBlock item={child} />

                <ModifierGroupsBlock
                  groups={child?.modifier_groups_display || []}
                />

                {child?.notes ? (
                  <div className="cm-note">• {renderNotes(child.notes)}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function OldItemsSection({
  oldItems = [],
  oldItemsTree = [],
  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",
}) {
  const canRemoveOldItems = typeof onRemoveOldItem === "function";

  const confirmedItems = Array.isArray(oldItemsTree)
    ? oldItemsTree
    : [];

  const [page, setPage] = useState(1);

  const totalConfirmedItems = confirmedItems.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalConfirmedItems / OLD_ITEMS_PAGE_SIZE),
  );

  useEffect(() => {
    setPage((currentPage) =>
      Math.min(Math.max(currentPage, 1), totalPages),
    );
  }, [totalPages]);

  const paginatedConfirmedItems = useMemo(() => {
    const startIndex = (page - 1) * OLD_ITEMS_PAGE_SIZE;
    const endIndex = startIndex + OLD_ITEMS_PAGE_SIZE;

    return confirmedItems.slice(startIndex, endIndex);
  }, [confirmedItems, page]);

  const startItem =
    totalConfirmedItems > 0
      ? (page - 1) * OLD_ITEMS_PAGE_SIZE + 1
      : 0;

  const endItem = Math.min(
    page * OLD_ITEMS_PAGE_SIZE,
    totalConfirmedItems,
  );

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const handlePrevPage = () => {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  };

  const handleNextPage = () => {
    setPage((currentPage) =>
      Math.min(totalPages, currentPage + 1),
    );
  };

  return (
    <div className="cm-section">
      <div className="cm-section-title">
        <span>Items ya enviados</span>
        <Badge tone="dark">{oldItems.length}</Badge>
      </div>

      <div className="cm-table-wrap">
        <table className="cm-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th style={{ textAlign: "center" }}>Cant.</th>
              <th style={{ textAlign: "right" }}>Total</th>

              {canRemoveOldItems ? (
                <th style={{ textAlign: "right" }}>Acción</th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {paginatedConfirmedItems.map((it) => (
              <React.Fragment key={`old-${it?.id}`}>
                <OldRow
                  item={it}
                  onRemoveOldItem={onRemoveOldItem}
                  removingOldItemId={removingOldItemId}
                  oldItemRemoveLabel={oldItemRemoveLabel}
                />

                {Array.isArray(it?.children) && it.children.length > 0
                  ? it.children.map((child) => (
                      <OldChildRow
                        key={`old-child-${child?.id}`}
                        item={child}
                        hasActionColumn={canRemoveOldItems}
                      />
                    ))
                  : null}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cm-mobile-list">
        {paginatedConfirmedItems.map((it) => (
          <OldItemCard
            key={`old-mobile-${it?.id}`}
            item={it}
            onRemoveOldItem={onRemoveOldItem}
            removingOldItemId={removingOldItemId}
            oldItemRemoveLabel={oldItemRemoveLabel}
          />
        ))}
      </div>

      {totalConfirmedItems > OLD_ITEMS_PAGE_SIZE ? (
        <PaginationFooter
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          total={totalConfirmedItems}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
          itemLabel="productos confirmados"
        />
      ) : null}

    </div>
  );
}