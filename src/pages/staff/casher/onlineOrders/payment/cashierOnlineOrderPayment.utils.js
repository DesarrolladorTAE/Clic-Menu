export const MY_ONLINE_ORDERS_PATH = "/staff/cashier/online-orders?tab=mine";
export const PAYMENT_ACTIONS = ["prepare_payment", "pay"];
export const POLL_INTERVAL = 8000;

export function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function numberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function round2(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
}

export function createPageError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function pickErr(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

export function pickCode(error) {
  return error?.response?.data?.code || error?.code || "";
}

export function pickErrorPayload(error) {
  return error?.response?.data || {};
}

export function resolveOnlineOrderPayload(response) {
  return response?.data?.online_order || response?.data || response?.online_order || null;
}

export function flattenItemsTree(items) {
  const result = [];

  const visit = (rows) => {
    toArray(rows).forEach((row) => {
      result.push(row);
      if (Array.isArray(row?.children) && row.children.length) visit(row.children);
    });
  };

  visit(items);
  return result;
}

export function buildFinancialSale(onlineOrder) {
  const saleId = numberOrNull(onlineOrder?.sale_id);
  const orderCheckId = numberOrNull(onlineOrder?.order_check_id);

  return {
    id: saleId,
    sale_id: saleId,
    status: onlineOrder?.sale_status || null,
    cash_session_id: numberOrNull(onlineOrder?.sale_cash_session_id),
    order_check_id: orderCheckId,
    subtotal: Number(onlineOrder?.subtotal ?? 0),
    promotion_discount_total: Number(onlineOrder?.promotion_discount_total ?? 0),
    manual_discount_total: Number(onlineOrder?.manual_discount_total ?? 0),
    discount_total: Number(onlineOrder?.discount_total ?? 0),
    taxable_amount: Number(onlineOrder?.taxable_amount ?? 0),
    net_total: Number(onlineOrder?.net_total ?? onlineOrder?.taxable_amount ?? 0),
    tip: Number(onlineOrder?.tip ?? 0),
    tax_kind: onlineOrder?.tax_kind ?? null,
    tax_rate: onlineOrder?.tax_rate ?? null,
    tax_base: Number(onlineOrder?.tax_base ?? 0),
    tax_total: Number(onlineOrder?.tax_total ?? 0),
    delivery_fee: Number(onlineOrder?.delivery_fee ?? 0),
    total: Number(onlineOrder?.total ?? 0),
    payable_total: Number(onlineOrder?.total ?? 0),
  };
}

export function buildFinancialCheck(onlineOrder, sale) {
  return {
    id: numberOrNull(onlineOrder?.order_check_id),
    order_check_id: numberOrNull(onlineOrder?.order_check_id),
    sale_id: numberOrNull(onlineOrder?.sale_id),
    status: onlineOrder?.order_check_status || null,
    subtotal: sale?.subtotal ?? 0,
    promotion_discount_total: sale?.promotion_discount_total ?? 0,
    manual_discount_total: sale?.manual_discount_total ?? 0,
    discount_total: sale?.discount_total ?? 0,
    taxable_amount: sale?.taxable_amount ?? 0,
    tip: sale?.tip ?? 0,
    delivery_fee: sale?.delivery_fee ?? 0,
    total: sale?.total ?? 0,
  };
}

export function buildDefaultTaxCode(sale, taxOptions) {
  const options = toArray(taxOptions);
  if (!options.length) return "";

  const saleTaxKind = String(sale?.tax_kind || "");
  const saleTaxRate = Number(sale?.tax_rate ?? 0);

  const defaultIva16 = options.find((row) => {
    const code = String(row?.code || "").toLowerCase();
    const name = String(row?.name || row?.label || "").toLowerCase();
    const kind = String(row?.tax_kind || "").toLowerCase();
    const rate = Number(row?.rate ?? 0);

    return (
      (code.includes("iva") && code.includes("16")) ||
      (name.includes("iva") && name.includes("16")) ||
      (kind === "iva" && (Math.abs(rate - 0.16) < 0.001 || Math.abs(rate - 16) < 0.001))
    );
  });

  if (!saleTaxKind) return defaultIva16?.code || options[0]?.code || "";

  const matched = options.find((row) => {
    const rowKind = String(row?.tax_kind || "");
    const rowRate = Number(row?.rate ?? 0);

    if (saleTaxKind === "exempt") return rowKind === "exempt";

    return rowKind === saleTaxKind && Math.abs(rowRate - saleTaxRate) < 0.001;
  });

  return matched?.code || defaultIva16?.code || options[0]?.code || "";
}

export function paymentTotalForSale(sale, liveTip) {
  const backendTotal = Number(sale?.payable_total ?? sale?.total ?? 0);
  const backendTip = Number(sale?.tip ?? 0);
  const nextTip = Number(liveTip ?? 0);

  if (!Number.isFinite(backendTotal) || !Number.isFinite(backendTip) || !Number.isFinite(nextTip)) return null;

  return round2(Math.max(0, backendTotal - backendTip) + Math.max(0, nextTip));
}

export function formatPaymentAmountValue(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

export function buildOnlineOrderCustomerSummary(onlineOrder) {
  const phone = String(onlineOrder?.customer_phone || "").trim();
  const email = String(onlineOrder?.customer_email || "").trim();
  const name = String(onlineOrder?.order_name || "").trim();

  return {
    customer: null,
    contact_data: { phone: phone || null, email: email || null },
    phone: phone || null,
    email: email || null,
    name_alias: name || null,
  };
}

export function onlinePaymentMethodCodes(paymentType) {
  const type = String(paymentType || "").toLowerCase();

  if (type === "cash") return ["cash"];
  if (type === "transfer") return ["transfer"];
  if (type === "terminal") return ["credit_card", "debit_card"];

  return [];
}

export function filterOnlinePaymentMethods(onlineOrder, methods) {
  const allowedCodes = onlinePaymentMethodCodes(onlineOrder?.payment_type);

  return toArray(methods).filter((method) =>
    allowedCodes.includes(String(method?.code || "").toLowerCase())
  );
}

export function resolveInitialOnlinePaymentMethodId(onlineOrder, methods) {
  const type = String(onlineOrder?.payment_type || "").toLowerCase();
  const allowedMethods = filterOnlinePaymentMethods(onlineOrder, methods);

  if (["cash", "transfer"].includes(type)) {
    return allowedMethods[0]?.id ? String(allowedMethods[0].id) : "";
  }

  if (type === "terminal" && allowedMethods.length === 1) return String(allowedMethods[0].id);

  return "";
}
