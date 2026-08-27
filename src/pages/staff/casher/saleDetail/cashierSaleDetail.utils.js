// src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js

export const MY_SALES_PATH = "/staff/cashier/queue?tab=mine";

export function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function numberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function checkIdOf(check) {
  return numberOrNull(check?.id ?? check?.order_check_id);
}

export function checkSaleIdOf(check) {
  return numberOrNull(check?.sale_id ?? check?.sale?.sale_id ?? check?.sale?.id);
}

export function normalizeCheckItem(item) {
  const productName = item?.product_name || item?.product?.name || "Producto";
  const variantName = item?.variant_name || item?.variant?.name || null;
  const checkItemId = numberOrNull(item?.order_check_item_id ?? item?.id);
  const orderItemId = numberOrNull(item?.order_item_id);
  const parentOrderItemId = numberOrNull(item?.parent_order_item_id);

  return {
    ...item,
    id: checkItemId,
    order_check_item_id: checkItemId,
    order_item_id: orderItemId,
    parent_order_item_id: parentOrderItemId,
    product_name: productName,
    variant_name: variantName,
    name: productName,
    quantity: Number(item?.quantity ?? 0),
    unit_price: Number(item?.unit_price ?? 0),
    base_line_total: Number(item?.base_line_total ?? 0),
    modifiers_total: Number(item?.modifiers_total ?? 0),
    promotion_discount_total: Number(item?.promotion_discount_total ?? 0),
    manual_discount_total: Number(item?.manual_discount_total ?? 0),
    discount_total: Number(item?.discount_total ?? 0),
    cancellation_total: Number(item?.cancellation_total ?? 0),
    net_line_total: Number(item?.net_line_total ?? 0),
    line_total: Number(item?.net_line_total ?? item?.line_total ?? item?.base_line_total ?? 0),
    product: item?.product || (numberOrNull(item?.product_id) ? {
      id: Number(item.product_id),
      name: productName,
    } : null),
    variant: item?.variant || (numberOrNull(item?.variant_id) ? {
      id: Number(item.variant_id),
      name: variantName,
    } : null),
    children: [],
  };
}

export function buildCheckItemsTree(rawItems) {
  const itemsFlat = toArray(rawItems).map(normalizeCheckItem);
  const byOriginalOrderItemId = new Map();

  itemsFlat.forEach((item) => {
    if (item.order_item_id) byOriginalOrderItemId.set(item.order_item_id, item);
  });

  const roots = [];

  itemsFlat.forEach((item) => {
    const parent = item.parent_order_item_id
      ? byOriginalOrderItemId.get(item.parent_order_item_id)
      : null;

    if (parent) {
      parent.children.push(item);
      return;
    }

    roots.push(item);
  });

  return { itemsFlat, itemsTree: roots };
}

export function buildCheckItemsSummary(check, itemsFlat, itemsTree) {
  const rootQuantity = itemsTree.reduce(
    (sum, item) => sum + Number(item?.quantity ?? 0),
    0
  );

  return {
    items_count: itemsFlat.length,
    total_items: itemsFlat.length,
    root_items_count: itemsTree.length,
    total_quantity: rootQuantity,
    quantity_total: rootQuantity,
    subtotal: Number(check?.subtotal ?? 0),
    promotion_discount_total: Number(check?.promotion_discount_total ?? 0),
    manual_discount_total: Number(check?.manual_discount_total ?? 0),
    discount_total: Number(check?.discount_total ?? 0),
    cancellation_total: Number(check?.cancellation_total ?? 0),
    taxable_amount: Number(check?.taxable_amount ?? 0),
    tax_total: Number(check?.tax_total ?? 0),
    tip: Number(check?.tip ?? 0),
    total: Number(check?.total ?? 0),
  };
}

export function buildExactCheckDetail({
  routeSaleId,
  contextData,
  prepareData,
  checkDetailData,
  contextCheck,
}) {
  const check = checkDetailData?.check || prepareData?.check || contextCheck || null;
  const checkId = checkIdOf(check);
  const exactSaleId = Number(routeSaleId);
  const currentCashSession = checkDetailData?.cash_session || contextData?.cash_session || null;

  const sourceSale =
    prepareData?.sale ||
    checkDetailData?.sale ||
    check?.sale ||
    contextCheck?.sale ||
    {};

  const orderId = numberOrNull(sourceSale?.order_id ?? check?.primary_order_id);
  const tableId = numberOrNull(sourceSale?.table_id ?? check?.primary_table_id);

  const order = {
    ...(sourceSale?.order || {}),
    ...(orderId ? { id: orderId } : {}),
    ...(tableId ? { table_id: tableId } : {}),
  };

  const table = tableId
    ? { ...(sourceSale?.table || {}), id: tableId }
    : sourceSale?.table || null;

  const subtotal = Number(check?.subtotal ?? sourceSale?.subtotal ?? 0);
  const promotionDiscountTotal = Number(
    check?.promotion_discount_total ?? sourceSale?.promotion_discount_total ?? 0
  );
  const manualDiscountTotal = Number(
    check?.manual_discount_total ?? sourceSale?.manual_discount_total ?? 0
  );
  const discountTotal = Number(check?.discount_total ?? sourceSale?.discount_total ?? 0);
  const taxableAmount = Number(
    check?.taxable_amount ??
    sourceSale?.taxable_amount ??
    Math.max(0, subtotal - discountTotal)
  );
  const tip = Number(check?.tip ?? sourceSale?.tip ?? 0);
  const total = Number(check?.total ?? sourceSale?.total ?? taxableAmount + tip);

  const sale = {
    ...sourceSale,
    id: exactSaleId,
    sale_id: exactSaleId,
    order_id: orderId,
    order_check_id: checkId,
    order_billing_group_id: numberOrNull(
      contextData?.order_billing_group_id ??
      check?.order_billing_group_id ??
      sourceSale?.order_billing_group_id
    ),
    cash_session: currentCashSession,
    status: sourceSale?.status || "taken",
    subtotal,
    promotion_discount_total: promotionDiscountTotal,
    manual_discount_total: manualDiscountTotal,
    discount_total: discountTotal,
    taxable_amount: taxableAmount,
    net_total: taxableAmount,
    tip,
    total,
    payable_total: total,
    order,
    table,
  };

  const { itemsFlat, itemsTree } = buildCheckItemsTree(check?.items);

  return {
    sale,
    cash_session: checkDetailData?.cash_session || contextData?.cash_session || null,
    order_detail: {
      items: itemsFlat,
      items_tree: itemsTree,
      items_flat: itemsFlat,
      items_summary: buildCheckItemsSummary(check, itemsFlat, itemsTree),
    },
    selected_check: check,
    sale_check_context: contextData,
    prepared_check: prepareData,
  };
}

export function adjustmentOrderRows(summary) {
  const candidates =
    summary?.orders ||
    summary?.available_orders ||
    summary?.adjustment_summary?.orders ||
    summary?.data?.orders ||
    [];

  return toArray(candidates).map((row) => {
    const id = numberOrNull(row?.id ?? row?.order_id);
    if (!id) return null;

    return {
      ...row,
      id,
      order_id: id,
      label: row?.label || row?.name || `Orden #${id}`,
    };
  }).filter(Boolean);
}

export function deriveLegacyCanOperate(loadedDetail) {
  const loadedSale = loadedDetail?.sale || null;
  const loadedSession = loadedDetail?.cash_session || null;
  const loadedOrder = loadedSale?.order || null;

  return (
    String(loadedSale?.status || "") === "taken" &&
    Number(loadedSale?.cash_session_id || 0) === Number(loadedSession?.id || 0) &&
    String(loadedOrder?.status || "") === "paying"
  );
}

export function buildDefaultTaxCode(loadedSale, loadedTaxOptions) {
  const options = toArray(loadedTaxOptions);
  const saleTaxKind = String(loadedSale?.tax_kind || "");
  const saleTaxRate = Number(loadedSale?.tax_rate ?? 0);

  const defaultIva16 = options.find((row) => {
    const code = String(row?.code || "").toLowerCase();
    const name = String(row?.name || row?.label || "").toLowerCase();
    const kind = String(row?.tax_kind || "").toLowerCase();
    const rate = Number(row?.rate ?? 0);

    return (
      (code.includes("iva") && code.includes("16")) ||
      (name.includes("iva") && name.includes("16")) ||
      (kind === "iva" &&
        (Math.abs(rate - 0.16) < 0.001 || Math.abs(rate - 16) < 0.001))
    );
  });

  if (!saleTaxKind) return defaultIva16?.code || options?.[0]?.code || "";

  const matched = options.find((row) => {
    const rowKind = String(row?.tax_kind || "");
    const rowRate = Number(row?.rate ?? 0);

    if (saleTaxKind === "exempt") return rowKind === "exempt";

    return rowKind === saleTaxKind && Math.abs(rowRate - saleTaxRate) < 0.001;
  });

  return matched?.code || defaultIva16?.code || options?.[0]?.code || "";
}

export function formatPaymentAmountValue(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "";
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}
