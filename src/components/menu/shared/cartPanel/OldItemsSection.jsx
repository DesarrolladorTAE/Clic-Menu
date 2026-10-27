import React, { useEffect, useMemo, useRef, useState } from "react";
import { Badge, PillButton } from "../../../../pages/public/publicMenu.ui";
import { money, safeNum } from "../../../../hooks/public/publicMenu.utils";
import PaginationFooter from "../../../common/PaginationFooter";
import {
  buildOldItemsTree,
  classifyOrderHistoryItems,
  isOldMenuSetRoot,
  resolveOrderItemCancellationState,
} from "./cartPanel.utils";

import CompositeDetailBlock from "./CompositeDetailBlock";
import CartProductDetailIcons from "./CartProductDetailIcons";
import MenuSetCartDetail from "../menu-sets/MenuSetCartDetail";

import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";

const OLD_ITEMS_PAGE_SIZE = 4;

function getOldItemId(item) {
  return Number(item?.id || item?.order_item_id || 0);
}

function isOldCompositeItem(item) {
  if (isOldMenuSetRoot(item)) {
    return false;
  }

  return (
    (Array.isArray(item?.children) && item.children.length > 0) ||
    (Array.isArray(item?.components) && item.components.length > 0) ||
    (Array.isArray(item?.components_detail) && item.components_detail.length > 0)
  );
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

function OldCompositeHistoryCard({
  item,
  themeColor,
  onShowDetails,
  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",
}) {
  const [expanded, setExpanded] = useState(false);

  const pricing = resolveConfirmedItemPricing(item);
  const cancellation = resolveOrderItemCancellationState(item);

  const label = item?.variant_name
    ? `${item?.product_name || item?.name || "Producto"} · ${item.variant_name}`
    : item?.product_name || item?.name || `Producto #${item?.product_id}`;

  const components = [item?.children, item?.components, item?.components_detail]
    .find((rows) => Array.isArray(rows) && rows.length > 0) || [];

  const productCount = components.length;
  const hasPromotions = pricing.appliedPromotions.length > 0;

  const color = /^#[0-9A-Fa-f]{6}$/.test(String(themeColor || ""))
    ? themeColor : "#FF9800";

  return (
    <article
      className="cm-history-composite"
      style={{ "--cm-composite-accent": color }}
    >
      <button
        type="button"
        className="cm-history-composite-trigger"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-label={`${expanded ? "Ocultar" : "Mostrar"} productos de ${label}`}
      >
        <span className="cm-composite-head-icon">
          <RestaurantMenuRoundedIcon sx={{ fontSize: 20 }} />
        </span>

        <span className="cm-history-composite-main">
          <strong className="cm-composite-name">{label}</strong>

          <span className="cm-history-composite-meta">
            {cancellation.fullyCancelled
              ? "Cancelado"
              : `${cancellation.effectiveQuantity} ${cancellation.effectiveQuantity === 1 ? "unidad" : "unidades"}`}
            {" · "}
            {productCount} {productCount === 1 ? "producto" : "productos"}
          </span>
        </span>

        <span className="cm-history-composite-amount">
          <strong>{money(pricing.netLineTotal)}</strong>
          <span>Confirmado</span>
        </span>

        <span className="cm-composite-chevron">
          {expanded
            ? <ExpandLessRoundedIcon sx={{ fontSize: 21 }} />
            : <ExpandMoreRoundedIcon sx={{ fontSize: 21 }} />}
        </span>
      </button>

      {expanded ? (
        <div className="cm-history-composite-content">
          <CompositeDetailBlock
            item={item}
            details={item?.components_detail || []}
            themeColor={color}
            onShowDetails={onShowDetails}
          />

          <div className="cm-composite-product-actions">
            <PreparedReuseBadge item={item} />
            <CartProductDetailIcons item={item} onShowDetails={onShowDetails} />
          </div>

          {cancellation.hasCancellation ? (
            <CancellationStateBlock item={item} />
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
      ) : null}
    </article>
  );
}

function OldRegularHistoryCard({
  item,
  themeColor,
  onShowDetails,
  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",
}) {
  const pricing = resolveConfirmedItemPricing(item);
  const cancellation = resolveOrderItemCancellationState(item);

  const name = item?.product_name || item?.name || `Producto #${item?.product_id}`;
  const label = item?.variant_name ? `${name} · ${item.variant_name}` : name;
  const hasPromotions = pricing.appliedPromotions.length > 0;

  const color = /^#[0-9A-Fa-f]{6}$/.test(String(themeColor || ""))
    ? themeColor : "#FF9800";

  return (
    <article className="cm-history-composite cm-history-standard" style={{ "--cm-composite-accent": color }}>
      <div className="cm-history-composite-trigger cm-history-standard-header">
        <span className="cm-composite-head-icon">
          <RestaurantMenuRoundedIcon sx={{ fontSize: 20 }} />
        </span>

        <span className="cm-history-composite-main">
          <strong className="cm-composite-name">{label}</strong>

          <span className="cm-history-composite-meta">
            {cancellation.fullyCancelled
              ? `Cancelado · Cantidad original: ${cancellation.originalQuantity}`
              : `Cantidad: ${cancellation.effectiveQuantity}`}
          </span>
        </span>

        <span className="cm-history-composite-amount">
          <strong>{money(pricing.netLineTotal)}</strong>
          <span>Confirmado</span>
        </span>
      </div>

      <div className="cm-history-standard-tools">
        <PreparedReuseBadge item={item} />
        <CartProductDetailIcons item={item} onShowDetails={onShowDetails} />
      </div>

      {cancellation.hasCancellation ? (
        <div className="cm-history-standard-section">
          <CancellationStateBlock item={item} />
        </div>
      ) : null}

      {hasPromotions || pricing.hasDiscount ? (
        <div className="cm-history-standard-section">
          <div className="cm-confirmed-detail-stack">
            {hasPromotions ? (
              <AppliedPromotionsBlock promotions={pricing.appliedPromotions} />
            ) : null}

            {pricing.hasDiscount ? (
              <ConfirmedLinePricingBlock pricing={pricing} />
            ) : null}
          </div>
        </div>
      ) : null}

      {typeof onRemoveOldItem === "function" ? (
        <div className="cm-history-standard-section cm-menu-set-history-actions">
          <OldRemoveButton
            item={item}
            onRemoveOldItem={onRemoveOldItem}
            removingOldItemId={removingOldItemId}
            oldItemRemoveLabel={oldItemRemoveLabel}
          />
        </div>
      ) : null}
    </article>
  );
}

function OldMenuSetHistoryDetail({
  item,
  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",
  themeColor,
  onShowDetails,
}) {
  const pricing = resolveConfirmedItemPricing(item);
  const hasPromotions = pricing.appliedPromotions.length > 0;

  return (
    <div className="cm-menu-set-history-detail">
      <MenuSetCartDetail
        item={item}
        themeColor={themeColor}
        defaultExpanded={false}
        onShowDetails={onShowDetails}
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

function OldRow({
  item,
  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",
  allowOldMenuSetRemoval = true,
  themeColor,
  onShowDetails,
}) {
  const resolvedRemoveAction = !allowOldMenuSetRemoval && isOldMenuSetRoot(item)
    ? null : onRemoveOldItem;

  const hasActionColumn = typeof resolvedRemoveAction === "function";

  if (isOldMenuSetRoot(item)) {
    return (
      <tr className="cm-menu-set-history-row">
        <td className="cm-td cm-menu-set-history-cell" colSpan={hasActionColumn ? 4 : 3}>
          <OldMenuSetHistoryDetail
            item={item}
            onRemoveOldItem={resolvedRemoveAction}
            removingOldItemId={removingOldItemId}
            oldItemRemoveLabel={oldItemRemoveLabel}
            themeColor={themeColor}
            onShowDetails={onShowDetails}
          />
        </td>
      </tr>
    );
  }

  if (isOldCompositeItem(item)) {
    return (
      <tr className="cm-menu-set-history-row cm-history-composite-table-row">
        <td
          className="cm-td cm-menu-set-history-cell cm-history-composite-table-cell"
          colSpan={hasActionColumn ? 4 : 3}
        >
          <OldCompositeHistoryCard
            item={item}
            themeColor={themeColor}
            onShowDetails={onShowDetails}
            onRemoveOldItem={onRemoveOldItem}
            removingOldItemId={removingOldItemId}
            oldItemRemoveLabel={oldItemRemoveLabel}
          />
        </td>
      </tr>
    );
  }

  return (
    <tr className="cm-menu-set-history-row">
      <td
        className="cm-td cm-menu-set-history-cell cm-history-composite-table-cell"
        colSpan={hasActionColumn ? 4 : 3}
      >
        <OldRegularHistoryCard
          item={item}
          themeColor={themeColor}
          onShowDetails={onShowDetails}
          onRemoveOldItem={onRemoveOldItem}
          removingOldItemId={removingOldItemId}
          oldItemRemoveLabel={oldItemRemoveLabel}
        />
      </td>
    </tr>
  );
}

function OldItemCard({
  item,
  onRemoveOldItem,
  removingOldItemId = null,
  oldItemRemoveLabel = "Quitar",
  allowOldMenuSetRemoval = true,
  themeColor,
  onShowDetails,
}) {
  const resolvedRemoveAction = !allowOldMenuSetRemoval && isOldMenuSetRoot(item)
    ? null : onRemoveOldItem;

  if (isOldMenuSetRoot(item)) {
    return (
      <OldMenuSetHistoryDetail
        item={item}
        onRemoveOldItem={resolvedRemoveAction}
        removingOldItemId={removingOldItemId}
        oldItemRemoveLabel={oldItemRemoveLabel}
        themeColor={themeColor}
        onShowDetails={onShowDetails}
      />
    );
  }

  if (isOldCompositeItem(item)) {
    return (
      <OldCompositeHistoryCard
        item={item}
        themeColor={themeColor}
        onShowDetails={onShowDetails}
        onRemoveOldItem={onRemoveOldItem}
        removingOldItemId={removingOldItemId}
        oldItemRemoveLabel={oldItemRemoveLabel}
      />
    );
  }
  return (
    <OldRegularHistoryCard
      item={item}
      themeColor={themeColor}
      onShowDetails={onShowDetails}
      onRemoveOldItem={onRemoveOldItem}
      removingOldItemId={removingOldItemId}
      oldItemRemoveLabel={oldItemRemoveLabel}
    />
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
  allowOldMenuSetRemoval = true,
  themeColor,
  onShowDetails,
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
          <div className="cm-table-wrap cm-history-card-table">
            <table className="cm-table">
              <tbody>
                {paginatedItems.map((item) => (
                  <React.Fragment key={`history-${item?.id || item?.order_item_id}`}>
                    <OldRow
                      item={item}
                      onRemoveOldItem={onRemoveOldItem}
                      removingOldItemId={removingOldItemId}
                      oldItemRemoveLabel={oldItemRemoveLabel}
                      allowOldMenuSetRemoval={allowOldMenuSetRemoval}
                      themeColor={themeColor}
                      onShowDetails={onShowDetails}
                    />
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
                allowOldMenuSetRemoval={allowOldMenuSetRemoval}
                themeColor={themeColor}
                onShowDetails={onShowDetails}
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
  allowOldMenuSetRemoval = true,
  themeColor,
  onShowDetails,
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
        allowOldMenuSetRemoval={allowOldMenuSetRemoval}
        onShowDetails={onShowDetails}
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
          onShowDetails={onShowDetails}
        />
      ) : null}
    </div>
  );
}