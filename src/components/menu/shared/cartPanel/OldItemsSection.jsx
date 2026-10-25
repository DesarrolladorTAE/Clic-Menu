import React, { useEffect, useMemo, useRef, useState } from "react";
import { Badge, PillButton } from "../../../../pages/public/publicMenu.ui";
import { money, safeNum } from "../../../../hooks/public/publicMenu.utils";
import PaginationFooter from "../../../common/PaginationFooter";
import {
  buildOldItemsTree,
  classifyOrderHistoryItems,
  isOldMenuSetRoot,
  renderNotes,
  resolveOrderItemCancellationState,
} from "./cartPanel.utils";
import ModifierGroupsBlock from "./ModifierGroupsBlock";
import CompositeDetailBlock from "./CompositeDetailBlock";
import MenuSetCartDetail from "../menu-sets/MenuSetCartDetail";

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

function CancellationStateBlock({ item }) {
  const state = resolveOrderItemCancellationState(item);

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

function OldMenuSetHistoryDetail({
  item,
  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",
  themeColor,
}) {
  const pricing = resolveConfirmedItemPricing(item);
  const hasPromotions = pricing.appliedPromotions.length > 0;

  return (
    <div className="cm-menu-set-history-detail">
      <MenuSetCartDetail
        item={item}
        themeColor={themeColor}
        defaultExpanded={false}
        readOnly
      />

      {resolveOrderItemCancellationState(item).hasCancellation ? (
        <div className="cm-menu-set-history-state">
          <CancellationStateBlock item={item} />
        </div>
      ) : null}

      {hasPromotions || pricing.hasDiscount ? (
        <div className="cm-confirmed-detail-stack">
          {hasPromotions ? (
            <AppliedPromotionsBlock promotions={pricing.appliedPromotions} />
          ) : null}

          {pricing.hasDiscount ? (
            <ConfirmedLinePricingBlock pricing={pricing} />
          ) : null}
        </div>
      ) : null}

      {typeof onRemoveOldItem === "function" ? (
        <div className="cm-menu-set-history-actions">
          <OldRemoveButton
            item={item}
            onRemoveOldItem={onRemoveOldItem}
            removingOldItemId={removingOldItemId}
            oldItemRemoveLabel={oldItemRemoveLabel}
          />
        </div>
      ) : null}
    </div>
  );
}

function OldChildRow({
  item,
  hasActionColumn = false,
  depth = 1,
}) {
  const cancellation = resolveOrderItemCancellationState(item);

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
      <td
        className="cm-td cm-child"
        style={{ paddingLeft: Math.min(10 + depth * 12, 130) }}
      >
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

function OldNestedChildRows({ item, hasActionColumn = false, depth = 1 }) {
  const children = Array.isArray(item?.children) ? item.children : [];

  return (
    <>
      <OldChildRow item={item} hasActionColumn={hasActionColumn} depth={depth} />

      {children.map((child, index) => (
        <OldNestedChildRows
          key={`nested-${getOldItemId(child) || index}-${index}`}
          item={child}
          hasActionColumn={hasActionColumn}
          depth={depth + 1}
        />
      ))}
    </>
  );
}

function OldRow({
  item,
  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",
  themeColor,
}) {
  const hasActionColumn = typeof onRemoveOldItem === "function";

  if (isOldMenuSetRoot(item)) {
    return (
      <tr className="cm-menu-set-history-row">
        <td className="cm-td cm-menu-set-history-cell" colSpan={hasActionColumn ? 4 : 3}>
          <OldMenuSetHistoryDetail
            item={item}
            onRemoveOldItem={onRemoveOldItem}
            removingOldItemId={removingOldItemId}
            oldItemRemoveLabel={oldItemRemoveLabel}
            themeColor={themeColor}
          />
        </td>
      </tr>
    );
  }

  const label = item?.variant_name
    ? `${item.product_name} · ${item.variant_name}`
    : item.product_name || `Producto #${item.product_id}`;

  const pricing = resolveConfirmedItemPricing(item);

  const cancellation = resolveOrderItemCancellationState(item);

  const isCompositeParent =
    !!item?.is_composite_parent ||
    (Array.isArray(item?.children) && item.children.length > 0);

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

function OldNestedChildCard({ item }) {
  const label = item?.variant_name
    ? `${item.product_name} · ${item.variant_name}`
    : item.product_name || `Producto #${item.product_id}`;

  const cancellation = resolveOrderItemCancellationState(item);
  const children = Array.isArray(item?.children) ? item.children : [];

  const subtotal = safeNum(
    item?.line_total,
    safeNum(item?.unit_price, 0) * safeNum(item?.quantity, 1),
  );

  const hideMoney = safeNum(item?.unit_price, 0) <= 0 && subtotal <= 0;

  return (
    <div className="cm-child-card">
      <div className="cm-mobile-title">↳ {label}</div>

      <div className="cm-mobile-sub">
        Cantidad: <strong>{cancellation.effectiveQuantity}</strong> ·{" "}
        {hideMoney ? "Incluido" : money(subtotal)}
      </div>

      <CancellationStateBlock item={item} />
      <ModifierGroupsBlock groups={item?.modifier_groups_display || []} />

      {item?.notes ? (
        <div className="cm-note">• {renderNotes(item.notes)}</div>
      ) : null}

      {children.length > 0 ? (
        <div className="cm-children-list">
          {children.map((child, index) => (
            <OldNestedChildCard
              key={`mobile-nested-${getOldItemId(child) || index}-${index}`}
              item={child}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function OldItemCard({
  item,
  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",
  themeColor,
}) {
  if (isOldMenuSetRoot(item)) {
    return (
      <OldMenuSetHistoryDetail
        item={item}
        onRemoveOldItem={onRemoveOldItem}
        removingOldItemId={removingOldItemId}
        oldItemRemoveLabel={oldItemRemoveLabel}
        themeColor={themeColor}
      />
    );
  }

  const label = item?.variant_name
    ? `${item.product_name} · ${item.variant_name}`
    : item.product_name || `Producto #${item.product_id}`;

  const pricing = resolveConfirmedItemPricing(item);

  const cancellation = resolveOrderItemCancellationState(item);

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
          {item.children.map((child, index) => (
            <OldNestedChildCard
              key={`old-mobile-child-${getOldItemId(child) || index}-${index}`}
              item={child}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HistoryItemsGroup({
  title,
  items = [],
  emptyMessage = "",
  itemLabel = "productos",
  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",
  themeColor,
}) {
  const rows = Array.isArray(items) ? items : [];
  const canRemoveOldItems = typeof onRemoveOldItem === "function";
  const [page, setPage] = useState(1);

  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / OLD_ITEMS_PAGE_SIZE));

  useEffect(() => {
    setPage((currentPage) => Math.min(Math.max(currentPage, 1), totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * OLD_ITEMS_PAGE_SIZE;
    return rows.slice(startIndex, startIndex + OLD_ITEMS_PAGE_SIZE);
  }, [rows, page]);

  const startItem = totalItems > 0 ? (page - 1) * OLD_ITEMS_PAGE_SIZE + 1 : 0;
  const endItem = Math.min(page * OLD_ITEMS_PAGE_SIZE, totalItems);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div style={{ display: "grid", gap: 9 }}>
      <div className="cm-section-title">
        <span>{title}</span>
        <Badge tone="dark">{totalItems}</Badge>
      </div>

      {totalItems <= 0 ? (
        <div className="cm-empty-history">{emptyMessage}</div>
      ) : (
        <>
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
                {paginatedItems.map((item) => (
                  <React.Fragment key={`history-${item?.id || item?.order_item_id}`}>
                    <OldRow
                      item={item}
                      onRemoveOldItem={onRemoveOldItem}
                      removingOldItemId={removingOldItemId}
                      oldItemRemoveLabel={oldItemRemoveLabel}
                      themeColor={themeColor}
                    />

                    {!isOldMenuSetRoot(item) &&
                      Array.isArray(item?.children) &&
                      item.children.length > 0
                        ? item.children.map((child, index) => (
                            <OldNestedChildRows
                              key={`history-child-${getOldItemId(child) || index}-${index}`}
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
            {paginatedItems.map((item) => (
              <OldItemCard
                key={`history-mobile-${item?.id || item?.order_item_id}`}
                item={item}
                onRemoveOldItem={onRemoveOldItem}
                removingOldItemId={removingOldItemId}
                oldItemRemoveLabel={oldItemRemoveLabel}
                themeColor={themeColor}
              />
            ))}
          </div>

          {totalItems > OLD_ITEMS_PAGE_SIZE ? (
            <PaginationFooter
              page={page}
              totalPages={totalPages}
              startItem={startItem}
              endItem={endItem}
              total={totalItems}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onPrev={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              onNext={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
              itemLabel={itemLabel}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

export default function OldItemsSection({
  oldItems = [],
  oldItemsTree = [],
  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",
  themeColor,
}) {
  const sectionRef = useRef(null);
  const [inheritedColor, setInheritedColor] = useState("#FF9800");

  useEffect(() => {
    if (!sectionRef.current || typeof window === "undefined") return;

    const value = window.getComputedStyle(sectionRef.current)
      .getPropertyValue("--cm-cart-accent").trim();

    const nextColor = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#FF9800";
    setInheritedColor((current) => current === nextColor ? current : nextColor);
  }, [themeColor, oldItems, oldItemsTree]);

  const activeColor = /^#[0-9A-Fa-f]{6}$/.test(String(themeColor || ""))
    ? themeColor : inheritedColor;

  const confirmedItems = useMemo(() => {
    const source = Array.isArray(oldItemsTree) && oldItemsTree.length > 0
      ? oldItemsTree : oldItems;

    return buildOldItemsTree(source);
  }, [oldItems, oldItemsTree]);

  const { sentItems, cancelledItems } = useMemo(
    () => classifyOrderHistoryItems(confirmedItems),
    [confirmedItems],
  );

  return (
    <div className="cm-section" ref={sectionRef}>
      <HistoryItemsGroup
        title="Pedidos enviados"
        themeColor={activeColor}
        items={sentItems}
        emptyMessage="No hay productos vigentes en el historial."
        itemLabel="productos enviados"
        onRemoveOldItem={onRemoveOldItem}
        removingOldItemId={removingOldItemId}
        oldItemRemoveLabel={oldItemRemoveLabel}
      />

      {cancelledItems.length > 0 ? (
        <HistoryItemsGroup
          title="Cancelados"
          themeColor={activeColor}
          items={cancelledItems}
          itemLabel="productos cancelados"
          onRemoveOldItem={null}
          removingOldItemId={null}
          oldItemRemoveLabel={oldItemRemoveLabel}
        />
      ) : null}
    </div>
  );
}