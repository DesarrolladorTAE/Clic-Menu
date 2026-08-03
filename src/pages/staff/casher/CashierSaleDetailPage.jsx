// src/pages/staff/casher/CashierSaleDetailPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import {
  fetchCashierSaleDetail,
} from "../../../services/staff/casher/cashierQueue.service";

import {
  fetchCashierSaleCheckContext,
  fetchCashierSaleCheckDetail,
  prepareCashierSaleCheckPayment,
} from "../../../services/staff/casher/cashierSaleCheck.service";

import {
  fetchCashierPaymentMethods,
  fetchCashierTaxOptions,
  previewCashierSalePayment,
  payCashierSale,
  extractTicketFromPayResponse,
  extractTicketWarningFromPayResponse,
} from "../../../services/staff/casher/cashierPayment.service";

import {
  fetchCashierSaleDiscountSummary,
  fetchCashierDiscountAuthorizers,
  applyCashierSaleGlobalDiscount,
  removeCashierSaleGlobalDiscount,
  applyCashierSaleItemDiscount,
  removeCashierSaleItemDiscount,
} from "../../../services/staff/casher/cashierDiscount.service";

import {
  fetchCashierSaleAdjustments,
  cancelCashierSaleItems,
  cancelCashierSaleOrder,
} from "../../../services/staff/casher/cashierAdjustment.service";

import {
  searchCashierCustomers,
  createCashierCustomer,
  fetchCashierSaleCustomerData,
  saveCashierSaleContactData,
  removeCashierSaleContactData,
  attachCashierSaleCustomer,
  detachCashierSaleCustomer,
} from "../../../services/staff/casher/cashierCustomer.service";

import {
  fetchCashierTicketById,
  openCashierTicketHtmlInNewTab,
  printCashierTicketFromHtml,
  saveCashierTicketPdf,
  openCashierTicketWindow,
  sendCashierSaleTicketWhatsapp,
  fetchCashierSaleTicketPrintConfig,
  fetchCashierSaleTicketPrintPayload,
  sendCashierThermalPrintPayload,
} from "../../../services/staff/casher/cashierTicket.service";

import {
  fetchCashierOperationalAuthorizers,
} from "../../../services/staff/casher/cashierOperationalAuthorizer.service";

import CashierSaleDetailHeroCard from "../../../components/staff/casher/saleDetailPage/CashierSaleDetailHeroCard";
import CashierOrderItemsCard from "../../../components/staff/casher/saleDetailPage/CashierOrderItemsCard";
import CashierSaleSummaryCard from "../../../components/staff/casher/saleDetailPage/CashierSaleSummaryCard";
import CashierPaymentFormCard from "../../../components/staff/casher/saleDetailPage/CashierPaymentFormCard";
import CashierTaxSelectorCard from "../../../components/staff/casher/saleDetailPage/CashierTaxSelectorCard";
import CashierDiscountCard from "../../../components/staff/casher/saleDetailPage/CashierDiscountCard";
import CashierAdjustmentCard from "../../../components/staff/casher/saleDetailPage/CashierAdjustmentCard";
import CashierCustomerCard from "../../../components/staff/casher/saleDetailPage/CashierCustomerCard";
import CashierSaleOptionalActionsBar from "../../../components/staff/casher/saleDetailPage/CashierSaleOptionalActionsBar";
import CashierSaleToolDialog from "../../../components/staff/casher/saleDetailPage/CashierSaleToolDialog";
import CashierDiscountAuthorizationDialog from "../../../components/staff/casher/saleDetailPage/CashierDiscountAuthorizationDialog";
import CashierOperationalAuthorizationDialog from "../../../components/staff/casher/authorization/CashierOperationalAuthorizationDialog";
import CashierPostPaymentTicketModal from "../../../components/staff/casher/ticket/CashierPostPaymentTicketModal";

const MY_SALES_PATH = "/staff/cashier/queue?tab=mine";

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function numberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function checkIdOf(check) {
  return numberOrNull(check?.id ?? check?.order_check_id);
}

function checkSaleIdOf(check) {
  return numberOrNull(
    check?.sale_id ??
      check?.sale?.sale_id ??
      check?.sale?.id
  );
}

function normalizeCheckItem(item) {
  const productName =
    item?.product_name ||
    item?.product?.name ||
    "Producto";

  const variantName =
    item?.variant_name ||
    item?.variant?.name ||
    null;

  const checkItemId = numberOrNull(
    item?.order_check_item_id ?? item?.id
  );

  const orderItemId = numberOrNull(item?.order_item_id);
  const parentOrderItemId = numberOrNull(
    item?.parent_order_item_id
  );

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
    promotion_discount_total: Number(
      item?.promotion_discount_total ?? 0
    ),
    manual_discount_total: Number(
      item?.manual_discount_total ?? 0
    ),
    discount_total: Number(item?.discount_total ?? 0),
    cancellation_total: Number(
      item?.cancellation_total ?? 0
    ),
    net_line_total: Number(item?.net_line_total ?? 0),
    line_total: Number(
      item?.net_line_total ??
        item?.line_total ??
        item?.base_line_total ??
        0
    ),
    product:
      item?.product ||
      (numberOrNull(item?.product_id)
        ? {
            id: Number(item.product_id),
            name: productName,
          }
        : null),
    variant:
      item?.variant ||
      (numberOrNull(item?.variant_id)
        ? {
            id: Number(item.variant_id),
            name: variantName,
          }
        : null),
    children: [],
  };
}

function buildCheckItemsTree(rawItems) {
  const itemsFlat = toArray(rawItems).map(normalizeCheckItem);
  const byOriginalOrderItemId = new Map();

  itemsFlat.forEach((item) => {
    if (item.order_item_id) {
      byOriginalOrderItemId.set(item.order_item_id, item);
    }
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

  return {
    itemsFlat,
    itemsTree: roots,
  };
}

function buildCheckItemsSummary(check, itemsFlat, itemsTree) {
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
    promotion_discount_total: Number(
      check?.promotion_discount_total ?? 0
    ),
    manual_discount_total: Number(
      check?.manual_discount_total ?? 0
    ),
    discount_total: Number(check?.discount_total ?? 0),
    cancellation_total: Number(
      check?.cancellation_total ?? 0
    ),
    taxable_amount: Number(check?.taxable_amount ?? 0),
    tax_total: Number(check?.tax_total ?? 0),
    tip: Number(check?.tip ?? 0),
    total: Number(check?.total ?? 0),
  };
}

function buildExactCheckDetail({
  routeSaleId,
  contextData,
  prepareData,
  checkDetailData,
  contextCheck,
}) {
  const check =
    checkDetailData?.check ||
    prepareData?.check ||
    contextCheck ||
    null;

  const checkId = checkIdOf(check);
  const exactSaleId = Number(routeSaleId);

  const currentCashSession =
    checkDetailData?.cash_session ||
    contextData?.cash_session ||
    null;

  const sourceSale =
    prepareData?.sale ||
    checkDetailData?.sale ||
    check?.sale ||
    contextCheck?.sale ||
    {};

  const orderId = numberOrNull(
    sourceSale?.order_id ?? check?.primary_order_id
  );

  const tableId = numberOrNull(
    sourceSale?.table_id ?? check?.primary_table_id
  );

  const order = {
    ...(sourceSale?.order || {}),
    ...(orderId ? { id: orderId } : {}),
    ...(tableId ? { table_id: tableId } : {}),
  };

  const table = tableId
    ? {
        ...(sourceSale?.table || {}),
        id: tableId,
      }
    : sourceSale?.table || null;

  const subtotal = Number(
    check?.subtotal ?? sourceSale?.subtotal ?? 0
  );

  const promotionDiscountTotal = Number(
    check?.promotion_discount_total ??
      sourceSale?.promotion_discount_total ??
      0
  );

  const manualDiscountTotal = Number(
    check?.manual_discount_total ??
      sourceSale?.manual_discount_total ??
      0
  );

  const discountTotal = Number(
    check?.discount_total ?? sourceSale?.discount_total ?? 0
  );

  const taxableAmount = Number(
    check?.taxable_amount ??
      sourceSale?.taxable_amount ??
      Math.max(0, subtotal - discountTotal)
  );

  const tip = Number(check?.tip ?? sourceSale?.tip ?? 0);
  const total = Number(
    check?.total ?? sourceSale?.total ?? taxableAmount + tip
  );

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

  const { itemsFlat, itemsTree } = buildCheckItemsTree(
    check?.items
  );

  return {
    sale,
    cash_session:
      checkDetailData?.cash_session ||
      contextData?.cash_session ||
      null,
    order_detail: {
      items: itemsFlat,
      items_tree: itemsTree,
      items_flat: itemsFlat,
      items_summary: buildCheckItemsSummary(
        check,
        itemsFlat,
        itemsTree
      ),
    },
    selected_check: check,
    sale_check_context: contextData,
    prepared_check: prepareData,
  };
}

function adjustmentOrderRows(summary) {
  const candidates =
    summary?.orders ||
    summary?.available_orders ||
    summary?.adjustment_summary?.orders ||
    summary?.data?.orders ||
    [];

  return toArray(candidates)
    .map((row) => {
      const id = numberOrNull(row?.id ?? row?.order_id);
      if (!id) return null;

      return {
        ...row,
        id,
        order_id: id,
        label:
          row?.label ||
          row?.name ||
          `Orden #${id}`,
      };
    })
    .filter(Boolean);
}

export default function CashierSaleDetailPage() {
  const nav = useNavigate();
  const { saleId } = useParams();

  const [loading, setLoading] = useState(true);
  const [activeTool, setActiveTool] = useState(null);

  const [detailData, setDetailData] = useState(null);
  const [saleCheckContext, setSaleCheckContext] = useState(null);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [selectedCheckId, setSelectedCheckId] = useState(null);
  const [selectedSaleId, setSelectedSaleId] = useState(
    numberOrNull(saleId)
  );
  const [preparedCheck, setPreparedCheck] = useState(null);
  const [isLegacySale, setIsLegacySale] = useState(false);
  const [settlement, setSettlement] = useState(null);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [discountSummary, setDiscountSummary] = useState(null);
  const [adjustmentSummary, setAdjustmentSummary] = useState(null);
  const [customerSummary, setCustomerSummary] = useState(null);

  const [taxOptionCode, setTaxOptionCode] = useState("");
  const [tip, setTip] = useState("0");
  const [payments, setPayments] = useState([]);

  const [globalDiscountForm, setGlobalDiscountForm] = useState({
    type: "fixed",
    value: "",
    reason: "",
  });

  const [itemDiscountDrafts, setItemDiscountDrafts] = useState([]);

  const [partialCancelForm, setPartialCancelForm] = useState({
    reason: "",
  });
  const [partialCancelDrafts, setPartialCancelDrafts] = useState([]);

  const [contactForm, setContactForm] = useState({
    phone: "",
    email: "",
  });

  const [searchCustomerForm, setSearchCustomerForm] = useState({
    phone: "",
    email: "",
  });
  const [customerSearchResults, setCustomerSearchResults] = useState([]);

  const [createCustomerForm, setCreateCustomerForm] = useState({
    name_alias: "",
    phone: "",
    email: "",
    razon_social: "",
    rfc: "",
    regimen: "",
    postal_code: "",
  });

  const [cancelOrderReason, setCancelOrderReason] = useState("");
  const [cancelOrderId, setCancelOrderId] = useState("");

  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [discountBusy, setDiscountBusy] = useState(false);
  const [adjustmentBusy, setAdjustmentBusy] = useState(false);
  const [customerBusy, setCustomerBusy] = useState(false);
  const [searchingCustomers, setSearchingCustomers] = useState(false);

  const [discountAuthorizationOpen, setDiscountAuthorizationOpen] =
    useState(false);
  const [discountAuthorizationPolicy, setDiscountAuthorizationPolicy] =
    useState(null);
  const [discountAuthorizationMessage, setDiscountAuthorizationMessage] =
    useState("");
  const [discountAuthorizationTarget, setDiscountAuthorizationTarget] =
    useState(null);
  const [discountAuthorizers, setDiscountAuthorizers] = useState([]);
  const [discountAuthorizationForm, setDiscountAuthorizationForm] = useState({
    user_id: "",
    pin: "",
  });
  const [loadingDiscountAuthorizers, setLoadingDiscountAuthorizers] =
    useState(false);
  const [authorizingDiscount, setAuthorizingDiscount] = useState(false);
  const [discountAuthorizationError, setDiscountAuthorizationError] =
    useState("");

  const [pendingAdjustmentAuthorization, setPendingAdjustmentAuthorization] =
    useState(null);
  const [operationalAuthorizationOpen, setOperationalAuthorizationOpen] =
    useState(false);
  const [operationalAuthorizers, setOperationalAuthorizers] = useState([]);
  const [loadingOperationalAuthorizers, setLoadingOperationalAuthorizers] =
    useState(false);
  const [authorizingOperational, setAuthorizingOperational] = useState(false);
  const [operationalAuthorizationError, setOperationalAuthorizationError] =
    useState("");
  const [operationalAuthorizationMessage, setOperationalAuthorizationMessage] =
    useState("");

  const [postPaymentOpen, setPostPaymentOpen] = useState(false);
  const [postPaymentTicket, setPostPaymentTicket] = useState(null);
  const [postPaymentTicketWarning, setPostPaymentTicketWarning] =
    useState(false);
  const [postPaymentTicketErrorCode, setPostPaymentTicketErrorCode] =
    useState(null);
  const [postPaymentTicketErrorMessage, setPostPaymentTicketErrorMessage] =
    useState(null);
  const [postPaymentPrintConfig, setPostPaymentPrintConfig] = useState(null);
  const [postPaymentSale, setPostPaymentSale] = useState(null);
  const [postPaymentOrder, setPostPaymentOrder] = useState(null);
  const [postPaymentTable, setPostPaymentTable] = useState(null);
  const [postPaymentPayments, setPostPaymentPayments] = useState([]);
  const [postPaymentPoints, setPostPaymentPoints] = useState(null);

  const [ticketBusy, setTicketBusy] = useState({
    view: false,
    print: false,
    thermalPrint: false,
    download: false,
    whatsapp: false,
  });

  const localIdRef = useRef(1);
  const draftIdRef = useRef(1);
  const cancelDraftIdRef = useRef(1);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "info",
    title: "",
    message: "",
  });

  const showAlert = ({ severity = "info", title, message }) => {
    if (!message) return;

    const resolvedTitle =
      title ||
      (severity === "success"
        ? "Listo"
        : severity === "warning"
        ? "Ojo"
        : severity === "error"
        ? "Error"
        : "Aviso");

    setAlertState({
      open: true,
      severity,
      title: resolvedTitle,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const pickErr = (e, fallback) =>
    e?.response?.data?.message || e?.message || fallback;

  const pickCode = (e) => e?.response?.data?.code;
  const pickData = (e) => e?.response?.data?.data || null;
  const pickErrorPayload = (e) => e?.response?.data || {};

  const sale = detailData?.sale || null;
  const cashSession = detailData?.cash_session || null;
  const orderDetail = detailData?.order_detail || null;

  const itemsTree = toArray(orderDetail?.items_tree);
  const itemsFlat = toArray(orderDetail?.items_flat);
  const itemsSummary = orderDetail?.items_summary || null;

  const adjustmentOrders = useMemo(
    () => adjustmentOrderRows(adjustmentSummary),
    [adjustmentSummary]
  );

  const handleReturnToMySales = () => {
    setPostPaymentOpen(false);
    nav(MY_SALES_PATH, { replace: true });
  };

  const createEmptyPayment = (methodId = "") => ({
    localId: `p-${localIdRef.current++}`,
    payment_method_id: methodId ? String(methodId) : "",
    amount: "",
    reference: "",
    last4: "",
    received: "",
  });

  const createEmptyItemDiscountDraft = () => ({
    localId: `d-${draftIdRef.current++}`,
    orderItemId: "",
    type: "fixed",
    value: "",
    reason: "",
  });

  const createEmptyPartialCancelDraft = () => ({
    localId: `c-${cancelDraftIdRef.current++}`,
    orderItemId: "",
    quantity: "",
  });

  const formatPaymentAmountValue = (value) => {
    const amount = Number(value || 0);
    if (!Number.isFinite(amount)) return "";
    return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  };

  const syncSinglePaymentAmountToSaleTotal = (nextTotal) => {
    const amount = Number(nextTotal || 0);
    if (!Number.isFinite(amount)) return;

    setPayments((prev) => {
      if (!Array.isArray(prev) || prev.length !== 1) return prev;

      return [
        {
          ...prev[0],
          amount: amount > 0 ? formatPaymentAmountValue(amount) : "",
        },
      ];
    });
  };

  const deriveLegacyCanOperate = (loadedDetail) => {
    const loadedSale = loadedDetail?.sale || null;
    const loadedSession = loadedDetail?.cash_session || null;
    const loadedOrder = loadedSale?.order || null;

    return (
      String(loadedSale?.status || "") === "taken" &&
      Number(loadedSale?.cash_session_id || 0) ===
        Number(loadedSession?.id || 0) &&
      String(loadedOrder?.status || "") === "paying"
    );
  };

  const exactCheckStatus = String(
    selectedCheck?.status || ""
  ).toLowerCase();

  const billingGroupStatus = String(
    saleCheckContext?.billing_group_status ??
      saleCheckContext?.billing_group?.status ??
      ""
  ).toLowerCase();

  const billingGroupAllowsEditing =
    !billingGroupStatus ||
    billingGroupStatus === "open";

  const hasExactCheckOwnership = useMemo(() => {
    if (isLegacySale) {
      return deriveLegacyCanOperate(detailData);
    }

    const exactSaleId = Number(selectedSaleId || 0);
    const exactCheckId = Number(selectedCheckId || 0);
    const saleIdInState = Number(sale?.sale_id || sale?.id || 0);
    const saleCheckId = Number(sale?.order_check_id || 0);
    const checkSaleId = Number(
      selectedCheck?.sale_id ||
        selectedCheck?.sale?.sale_id ||
        selectedCheck?.sale?.id ||
        0
    );
    const cashSessionId = Number(cashSession?.id || 0);

    return Boolean(
      exactSaleId > 0 &&
        exactCheckId > 0 &&
        saleIdInState === exactSaleId &&
        checkSaleId === exactSaleId &&
        saleCheckId === exactCheckId &&
        String(sale?.status || "") === "taken" &&
        String(cashSession?.status || "") === "open" &&
        Number(sale?.cash_session_id || 0) === cashSessionId
    );
  }, [
    cashSession,
    detailData,
    isLegacySale,
    sale,
    selectedCheck,
    selectedCheckId,
    selectedSaleId,
  ]);

  const canEditAccount = useMemo(() => {
    if (isLegacySale) {
      return deriveLegacyCanOperate(detailData);
    }

    return (
      hasExactCheckOwnership &&
      exactCheckStatus === "open" &&
      billingGroupAllowsEditing
    );
  }, [
    billingGroupAllowsEditing,
    detailData,
    exactCheckStatus,
    hasExactCheckOwnership,
    isLegacySale,
  ]);

  const canOperate = useMemo(() => {
    if (isLegacySale) {
      return deriveLegacyCanOperate(detailData);
    }

    return (
      hasExactCheckOwnership &&
      ["open", "paying"].includes(exactCheckStatus)
    );
  }, [
    detailData,
    exactCheckStatus,
    hasExactCheckOwnership,
    isLegacySale,
  ]);

  const selectedCheckPolicy = useMemo(() => {
    if (isLegacySale) return null;

    return (
      toArray(saleCheckContext?.checks).find((check) => {
        const policyCheckId = checkIdOf(check);
        const policySaleId = checkSaleIdOf(check);

        return (
          (selectedCheckId &&
            policyCheckId === Number(selectedCheckId)) ||
          (selectedSaleId &&
            policySaleId === Number(selectedSaleId))
        );
      }) || null
    );
  }, [
    isLegacySale,
    saleCheckContext,
    selectedCheckId,
    selectedSaleId,
  ]);

  const isEqualPartsAccount = useMemo(() => {
    if (isLegacySale) return false;

    const splitMode = String(
      saleCheckContext?.split_mode ??
        saleCheckContext?.structure?.split_mode ??
        ""
    ).toLowerCase();

    const splitType = String(
      selectedCheckPolicy?.split_type ??
        selectedCheck?.split_type ??
        ""
    ).toLowerCase();

    return (
      splitMode === "equal_parts" ||
      splitType === "equal_parts" ||
      Boolean(selectedCheckPolicy?.flags?.is_equal_part)
    );
  }, [
    isLegacySale,
    saleCheckContext,
    selectedCheck,
    selectedCheckPolicy,
  ]);

  const canManageAdjustments = useMemo(() => {
    if (isLegacySale) return canEditAccount;

    const checkPermission =
      selectedCheckPolicy?.permissions?.can_manage_adjustments;

    const packagePermission =
      saleCheckContext?.permissions?.can_manage_adjustments;

    const backendAllows =
      typeof checkPermission === "boolean"
        ? checkPermission
        : typeof packagePermission === "boolean"
        ? packagePermission
        : !isEqualPartsAccount;

    return canEditAccount && backendAllows;
  }, [
    canEditAccount,
    isEqualPartsAccount,
    isLegacySale,
    saleCheckContext,
    selectedCheckPolicy,
  ]);

  const canManageDiscounts = useMemo(() => {
    if (isLegacySale) return canEditAccount;

    const checkPermission =
      selectedCheckPolicy?.permissions?.can_manage_discounts;

    const packagePermission =
      saleCheckContext?.permissions?.can_manage_discounts;

    const backendAllows =
      typeof checkPermission === "boolean"
        ? checkPermission
        : typeof packagePermission === "boolean"
        ? packagePermission
        : !isEqualPartsAccount;

    return canEditAccount && backendAllows;
  }, [
    canEditAccount,
    isEqualPartsAccount,
    isLegacySale,
    saleCheckContext,
    selectedCheckPolicy,
  ]);

  const canManageCustomer = useMemo(() => {
    const status = String(sale?.status || "");
    const owned =
      Number(sale?.cash_session_id || 0) ===
      Number(cashSession?.id || 0);

    return owned && ["taken", "paid"].includes(status);
  }, [cashSession, sale]);

  useEffect(() => {
    if (
      activeTool === "adjustments" &&
      !canManageAdjustments
    ) {
      setActiveTool(null);
      return;
    }

    if (
      activeTool === "discounts" &&
      !canManageDiscounts
    ) {
      setActiveTool(null);
    }
  }, [
    activeTool,
    canManageAdjustments,
    canManageDiscounts,
  ]);

  const selectedTaxOption = useMemo(() => {
    return (
      taxOptions.find(
        (row) => String(row.code) === String(taxOptionCode)
      ) || null
    );
  }, [taxOptions, taxOptionCode]);

  const paymentInitialAmount = useMemo(() => {
    const accountNetAmount = Number(
      sale?.net_total ??
        sale?.taxable_amount ??
        sale?.payable_total ??
        sale?.total
    );

    const liveTipAmount = Number(tip || 0);

    if (
      !Number.isFinite(accountNetAmount) ||
      accountNetAmount < 0 ||
      !Number.isFinite(liveTipAmount) ||
      liveTipAmount < 0
    ) {
      return null;
    }

    return Math.round(
      (accountNetAmount + liveTipAmount) * 100
    ) / 100;
  }, [sale, tip]);

  const hasGlobalDiscount = useMemo(
    () => Boolean(discountSummary?.global_discount),
    [discountSummary]
  );

  const buildDefaultTaxCode = (loadedSale, loadedTaxOptions) => {
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
          (Math.abs(rate - 0.16) < 0.001 ||
            Math.abs(rate - 16) < 0.001))
      );
    });

    if (!saleTaxKind) {
      return defaultIva16?.code || options?.[0]?.code || "";
    }

    const matched = options.find((row) => {
      const rowKind = String(row?.tax_kind || "");
      const rowRate = Number(row?.rate ?? 0);

      if (saleTaxKind === "exempt") {
        return rowKind === "exempt";
      }

      return (
        rowKind === saleTaxKind &&
        Math.abs(rowRate - saleTaxRate) < 0.001
      );
    });

    return matched?.code || defaultIva16?.code || options?.[0]?.code || "";
  };

  const initializePayments = (loadedSale, loadedMethods) => {
    const initialTotal = Number(
      loadedSale?.payable_total ??
        loadedSale?.total ??
        0
    );

    const firstMethodId = loadedMethods?.[0]?.id
      ? String(loadedMethods[0].id)
      : "";

    setTip(String(Number(loadedSale?.tip || 0)));
    setPayments([
      {
        ...createEmptyPayment(firstMethodId),
        amount:
          initialTotal > 0
            ? formatPaymentAmountValue(initialTotal)
            : "",
      },
    ]);
  };

  const syncSaleFromDiscountSummary = (summaryData) => {
    const summarySale = summaryData?.sale || null;
    if (!summarySale) return;

    setDetailData((prev) => {
      if (!prev?.sale) return prev;

      return {
        ...prev,
        sale: {
          ...prev.sale,
          subtotal: summarySale.subtotal ?? prev.sale.subtotal,
          promotion_discount_total:
            summarySale.promotion_discount_total ??
            prev.sale.promotion_discount_total,
          manual_discount_total:
            summarySale.manual_discount_total ??
            prev.sale.manual_discount_total,
          discount_total:
            summarySale.discount_total ?? prev.sale.discount_total,
          taxable_amount:
            summarySale.taxable_amount ??
            summarySale.net_total ??
            prev.sale.taxable_amount,
          net_total:
            summarySale.net_total ??
            summarySale.taxable_amount ??
            prev.sale.net_total,
          tip: summarySale.tip ?? prev.sale.tip,
          total: summarySale.total ?? prev.sale.total,
          payable_total:
            summarySale.payable_total ??
            summarySale.total ??
            prev.sale.payable_total,
          tax_kind: summarySale.tax_kind ?? prev.sale.tax_kind,
          tax_rate: summarySale.tax_rate ?? prev.sale.tax_rate,
          tax_base: summarySale.tax_base ?? prev.sale.tax_base,
          tax_total: summarySale.tax_total ?? prev.sale.tax_total,
        },
      };
    });
  };

  const syncSinglePaymentFromFinancialSale = (
    financialSale,
    liveTipValue = tip
  ) => {
    if (!financialSale) return;

    const backendTip = Number(financialSale?.tip ?? 0);
    const currentLiveTip = Number(liveTipValue ?? backendTip);
    const backendNetTotal = Number(
      financialSale?.net_total ??
        financialSale?.taxable_amount ??
        financialSale?.payable_total ??
        financialSale?.total ??
        0
    );

    if (
      !Number.isFinite(backendNetTotal) ||
      !Number.isFinite(currentLiveTip)
    ) {
      return;
    }

    syncSinglePaymentAmountToSaleTotal(
      Math.max(0, backendNetTotal + currentLiveTip)
    );
  };

  const syncCustomerFormsFromSummary = (summaryData) => {
    const contactData = summaryData?.contact_data || null;

    setContactForm({
      phone: contactData?.phone || "",
      email: contactData?.email || "",
    });

    setSearchCustomerForm({
      phone: contactData?.phone || "",
      email: contactData?.email || "",
    });

    setCreateCustomerForm({
      name_alias: "",
      phone: contactData?.phone || "",
      email: contactData?.email || "",
      razon_social: "",
      rfc: "",
      regimen: "",
      postal_code: "",
    });
  };

  const loadDiscountSummaryIfNeeded = async (
    targetSaleId,
    allowOperation
  ) => {
    if (!allowOperation || !targetSaleId) {
      setDiscountSummary(null);
      return null;
    }

    try {
      const res = await fetchCashierSaleDiscountSummary(targetSaleId);
      const data = res?.data || null;
      setDiscountSummary(data);
      syncSaleFromDiscountSummary(data);
      return data;
    } catch {
      setDiscountSummary(null);
      return null;
    }
  };

  const loadAdjustmentSummaryIfNeeded = async (
    targetSaleId,
    allowOperation
  ) => {
    if (!allowOperation || !targetSaleId) {
      setAdjustmentSummary(null);
      return null;
    }

    try {
      const res = await fetchCashierSaleAdjustments(targetSaleId);
      const data = res?.data || null;
      setAdjustmentSummary(data);
      return data;
    } catch {
      setAdjustmentSummary(null);
      return null;
    }
  };

  const loadCustomerSummaryIfNeeded = async (
    targetSaleId,
    loadedDetail,
    resetForms = false
  ) => {
    const loadedSale = loadedDetail?.sale || null;
    const loadedSession = loadedDetail?.cash_session || null;
    const status = String(loadedSale?.status || "");
    const owned =
      Number(loadedSale?.cash_session_id || 0) ===
      Number(loadedSession?.id || 0);
    const shouldLoad =
      targetSaleId && owned && ["taken", "paid"].includes(status);

    if (!shouldLoad) {
      setCustomerSummary(null);
      if (resetForms) {
        syncCustomerFormsFromSummary(null);
        setCustomerSearchResults([]);
      }
      return null;
    }

    try {
      const res = await fetchCashierSaleCustomerData(targetSaleId);
      const data = res?.data || null;
      setCustomerSummary(data);

      if (resetForms) {
        syncCustomerFormsFromSummary(data);
        setCustomerSearchResults([]);
      }

      return data;
    } catch {
      setCustomerSummary(null);
      return null;
    }
  };

  const resetEditableForms = () => {
    setGlobalDiscountForm({
      type: "fixed",
      value: "",
      reason: "",
    });
    setItemDiscountDrafts([]);
    setPartialCancelForm({ reason: "" });
    setPartialCancelDrafts([]);
    setCancelOrderReason("");
    setCancelOrderId("");
    setPreview(null);
  };

  const applyLoadedState = async ({
    loadedDetail,
    loadedMethods,
    loadedTaxOptions,
    targetSaleId,
    allowOperation,
    preserveForm,
  }) => {
    setDetailData(loadedDetail);
    setPaymentMethods(loadedMethods);
    setTaxOptions(loadedTaxOptions);

    if (!preserveForm) {
      initializePayments(loadedDetail?.sale || null, loadedMethods);
      resetEditableForms();
    }

    const nextTaxCode = buildDefaultTaxCode(
      loadedDetail?.sale || null,
      loadedTaxOptions
    );

    setTaxOptionCode((prev) =>
      preserveForm && prev ? prev : nextTaxCode
    );

    await loadDiscountSummaryIfNeeded(
      targetSaleId,
      allowOperation
    );

    const adjustmentData =
      await loadAdjustmentSummaryIfNeeded(
        targetSaleId,
        allowOperation
      );

    await loadCustomerSummaryIfNeeded(
      targetSaleId,
      loadedDetail,
      !preserveForm
    );

    if (!preserveForm) {
      const orders = adjustmentOrderRows(adjustmentData);
      const fallbackOrderId = numberOrNull(
        loadedDetail?.sale?.order_id ||
          loadedDetail?.selected_check?.primary_order_id
      );

      setCancelOrderId(
        orders.length === 1
          ? String(orders[0].id)
          : fallbackOrderId
          ? String(fallbackOrderId)
          : ""
      );
    }
  };

  const loadLegacySale = async ({
    targetSaleId,
    preserveForm,
  }) => {
    const [detailRes, methodsRes, taxesRes] = await Promise.all([
      fetchCashierSaleDetail(targetSaleId),
      fetchCashierPaymentMethods(),
      fetchCashierTaxOptions(),
    ]);

    const loadedDetail = detailRes?.data || null;
    const loadedMethods = toArray(methodsRes?.data);
    const loadedTaxOptions = toArray(taxesRes?.data);

    setIsLegacySale(true);
    setSaleCheckContext(null);
    setSelectedCheck(null);
    setSelectedCheckId(null);
    setPreparedCheck(null);
    setSelectedSaleId(targetSaleId);

    await applyLoadedState({
      loadedDetail,
      loadedMethods,
      loadedTaxOptions,
      targetSaleId,
      allowOperation: deriveLegacyCanOperate(loadedDetail),
      preserveForm,
    });
  };

  const loadCheckSale = async ({
    targetSaleId,
    preserveForm,
  }) => {
    const contextRes = await fetchCashierSaleCheckContext(targetSaleId);
    const contextData = contextRes?.data || null;
    const contextChecks = toArray(contextData?.checks);

    const exactContextCheck = contextChecks.find(
      (check) => checkSaleIdOf(check) === Number(targetSaleId)
    );

    if (!exactContextCheck) {
      const error = new Error(
        "No se encontró la cuenta financiera vinculada a esta venta."
      );
      error.code = "SALE_CHECK_NOT_FOUND";
      throw error;
    }

    const exactCheckId = checkIdOf(exactContextCheck);

    if (!exactCheckId) {
      const error = new Error(
        "La cuenta encontrada no tiene un OrderCheck ID válido."
      );
      error.code = "ORDER_CHECK_ID_MISSING";
      throw error;
    }

    const checkDetailRes = await fetchCashierSaleCheckDetail(
      exactCheckId
    );

    const checkDetailData = checkDetailRes?.data || null;
    const exactDetailedCheck = checkDetailData?.check || null;
    const exactStatus = String(
      exactDetailedCheck?.status || ""
    ).toLowerCase();

    const exactSplitMode = String(
      contextData?.split_mode ??
        contextData?.structure?.split_mode ??
        ""
    ).toLowerCase();

    const exactSplitType = String(
      exactContextCheck?.split_type ??
        exactDetailedCheck?.split_type ??
        ""
    ).toLowerCase();

    const isExactEqualPartsAccount =
      exactSplitMode === "equal_parts" ||
      exactSplitType === "equal_parts" ||
      Boolean(exactContextCheck?.flags?.is_equal_part);

    const exactBillingGroupStatus = String(
      contextData?.billing_group_status ??
        contextData?.billing_group?.status ??
        ""
    ).toLowerCase();

    const exactBillingGroupAllowsEditing =
      !exactBillingGroupStatus ||
      exactBillingGroupStatus === "open";

    if (
      Number(checkDetailData?.sale_id || 0) !== Number(targetSaleId) ||
      checkSaleIdOf(exactDetailedCheck) !== Number(targetSaleId)
    ) {
      const error = new Error(
        "La cuenta consultada ya no está vinculada con la venta seleccionada."
      );
      error.code = "SALE_CHECK_RELATION_CHANGED";
      throw error;
    }

    if (!["open", "paying"].includes(exactStatus)) {
      const error = new Error(
        "La cuenta ya no está disponible para continuar el cobro."
      );
      error.code = "CHECK_NOT_AVAILABLE_FOR_PAYMENT";
      throw error;
    }

    const alreadyPrepared =
      exactStatus === "paying"
        ? {
            already_prepared: true,
            check: exactDetailedCheck,
            sale_id: Number(targetSaleId),
          }
        : null;

    const loadedDetail = buildExactCheckDetail({
      routeSaleId: targetSaleId,
      contextData,
      prepareData: alreadyPrepared,
      checkDetailData,
      contextCheck: exactContextCheck,
    });

    const [methodsRes, taxesRes] = await Promise.all([
      fetchCashierPaymentMethods(),
      fetchCashierTaxOptions(),
    ]);

    const loadedMethods = toArray(methodsRes?.data);
    const loadedTaxOptions = toArray(taxesRes?.data);

    setIsLegacySale(false);
    setSaleCheckContext(contextData);
    setSelectedCheck(exactDetailedCheck);
    setSelectedCheckId(exactCheckId);
    setSelectedSaleId(targetSaleId);
    setPreparedCheck(alreadyPrepared);

    await applyLoadedState({
      loadedDetail,
      loadedMethods,
      loadedTaxOptions,
      targetSaleId,
      allowOperation:
        exactStatus === "open" &&
        exactBillingGroupAllowsEditing &&
        !isExactEqualPartsAccount,
      preserveForm,
    });
  };

  const load = async ({ preserveForm = false } = {}) => {
    const targetSaleId = numberOrNull(saleId);

    if (!targetSaleId) {
      showAlert({
        severity: "error",
        message: "La cuenta indicada en la URL no es válida.",
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setSelectedSaleId(targetSaleId);
      setSettlement(null);

      try {
        await loadCheckSale({ targetSaleId, preserveForm });
      } catch (checkError) {
        const status = Number(checkError?.response?.status || 0);
        const code =
          checkError?.response?.data?.code || checkError?.code || "";

        if (status === 409 && code === "SALE_WITHOUT_BILLING_GROUP") {
          await loadLegacySale({ targetSaleId, preserveForm });
          return;
        }

        throw checkError;
      }
    } catch (e) {
      const status = Number(e?.response?.status || 0);
      const code = pickCode(e) || e?.code;

      const mustReturnToQueue =
        status === 403 ||
        status === 404 ||
        code === "NO_OPEN_CASH_SESSION" ||
        code === "SALE_PACKAGE_NOT_TAKEN_BY_CURRENT_CASH_SESSION" ||
        code === "CHECK_PACKAGE_NOT_TAKEN_BY_CURRENT_CASH_SESSION" ||
        code === "CHECK_NOT_TAKEN_BY_CURRENT_CASH_SESSION" ||
        code === "SALE_NOT_OWNED_BY_SESSION" ||
        code === "SALE_CHECK_NOT_FOUND" ||
        code === "SALE_CHECK_RELATION_CHANGED";

      if (mustReturnToQueue) {
        showAlert({
          severity: "warning",
          message: pickErr(
            e,
            "La cuenta ya no está disponible para esta caja."
          ),
        });

        setTimeout(() => {
          nav(MY_SALES_PATH, { replace: true });
        }, 650);
        return;
      }

      showAlert({
        severity: "error",
        message: pickErr(
          e,
          "No se pudo cargar el detalle de la cuenta."
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleId]);

  const refreshSelectedCheckDetail = async () => {
    try {
      if (isLegacySale) {
        const res = await fetchCashierSaleDetail(selectedSaleId);
        const latestDetail = res?.data || null;
        if (!latestDetail) return false;

        setDetailData((prev) => ({
          ...(prev || {}),
          ...latestDetail,
        }));
        return true;
      }

      if (!selectedCheckId || !selectedSaleId) return false;

      const res = await fetchCashierSaleCheckDetail(selectedCheckId);
      const checkDetailData = res?.data || null;
      const latestCheck = checkDetailData?.check || null;

      if (
        !latestCheck ||
        checkSaleIdOf(latestCheck) !== Number(selectedSaleId)
      ) {
        return false;
      }

      const latestDetail = buildExactCheckDetail({
        routeSaleId: selectedSaleId,
        contextData: saleCheckContext,
        prepareData: preparedCheck,
        checkDetailData,
        contextCheck: latestCheck,
      });

      setSelectedCheck(latestCheck);
      setDetailData((prev) => ({
        ...(prev || {}),
        ...latestDetail,
        sale: {
          ...(prev?.sale || {}),
          ...(latestDetail?.sale || {}),
        },
      }));

      return true;
    } catch (error) {
      console.error(
        "No se pudo actualizar el detalle financiero de la cuenta.",
        error
      );
      return false;
    }
  };

  const handleTipChange = (value) => {
    setTip(value);
    setPreview(null);

    const nextTip = value === "" ? 0 : Number(value);
    const backendNetTotal = Number(
      sale?.net_total ?? sale?.taxable_amount
    );

    if (
      !Number.isFinite(nextTip) ||
      nextTip < 0 ||
      !Number.isFinite(backendNetTotal)
    ) {
      return;
    }

    syncSinglePaymentAmountToSaleTotal(
      backendNetTotal + nextTip
    );
  };

  const handleAddPayment = () => {
    if (payments.length >= 3) {
      showAlert({
        severity: "warning",
        message: "Solo se permiten máximo 3 métodos de pago por cuenta.",
      });
      return;
    }

    const firstMethodId = paymentMethods?.[0]?.id
      ? String(paymentMethods[0].id)
      : "";

    setPayments((prev) => [
      ...prev,
      createEmptyPayment(firstMethodId),
    ]);
    setPreview(null);
  };

  const handleRemovePayment = (localId) => {
    setPayments((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((row) => row.localId !== localId);
    });
    setPreview(null);
  };

  const handlePaymentChange = (localId, field, value) => {
    setPayments((prev) =>
      prev.map((row) => {
        if (row.localId !== localId) return row;

        const nextRow = { ...row, [field]: value };

        if (field === "payment_method_id") {
          const method = paymentMethods.find(
            (candidate) =>
              Number(candidate.id) === Number(value || 0)
          );

          if (!method?.requires_reference) nextRow.reference = "";
          if (!method?.requires_last4) nextRow.last4 = "";
          if (!method?.requires_received_amount) nextRow.received = "";
        }

        if (field === "last4") {
          nextRow.last4 = String(value || "")
            .replace(/\D/g, "")
            .slice(0, 4);
        }

        return nextRow;
      })
    );

    setPreview(null);
  };

  const handleGlobalFormChange = (field, value) => {
    setGlobalDiscountForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItemDiscountDraft = () => {
    if (hasGlobalDiscount) {
      showAlert({
        severity: "warning",
        message:
          "Quita primero el descuento global antes de agregar descuentos por ítem.",
      });
      return;
    }

    setItemDiscountDrafts((prev) => [
      ...prev,
      createEmptyItemDiscountDraft(),
    ]);
  };

  const handleRemoveItemDiscountDraft = (localId) => {
    setItemDiscountDrafts((prev) =>
      prev.filter((draft) => draft.localId !== localId)
    );
  };

  const handleItemDiscountDraftChange = (localId, field, value) => {
    setItemDiscountDrafts((prev) =>
      prev.map((draft) =>
        draft.localId === localId
          ? { ...draft, [field]: value }
          : draft
      )
    );
  };

  const handlePartialFormChange = (field, value) => {
    setPartialCancelForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPartialDraft = () => {
    setPartialCancelDrafts((prev) => [
      ...prev,
      createEmptyPartialCancelDraft(),
    ]);
  };

  const handleRemovePartialDraft = (localId) => {
    setPartialCancelDrafts((prev) =>
      prev.filter((draft) => draft.localId !== localId)
    );
  };

  const handlePartialDraftChange = (localId, field, value) => {
    setPartialCancelDrafts((prev) =>
      prev.map((draft) =>
        draft.localId === localId
          ? { ...draft, [field]: value }
          : draft
      )
    );
  };

  const handleContactFormChange = (field, value) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchCustomerFormChange = (field, value) => {
    setSearchCustomerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCustomerFormChange = (field, value) => {
    setCreateCustomerForm((prev) => ({ ...prev, [field]: value }));
  };

  const normalizedPayload = useMemo(() => {
    return {
      tax_option_code: taxOptionCode || null,
      tip: Number(tip || 0),
      payments: payments.map((row) => {
        const method = paymentMethods.find(
          (candidate) =>
            Number(candidate.id) ===
            Number(row.payment_method_id || 0)
        );

        const payment = {
          payment_method_id: Number(row.payment_method_id || 0),
          amount: Number(row.amount || 0),
        };

        if (method?.requires_reference) {
          payment.reference = row.reference?.trim() || null;
        }

        if (method?.requires_last4) {
          payment.last4 = row.last4?.trim() || null;
        }

        if (method?.requires_received_amount) {
          payment.received =
            row.received === "" ||
            row.received === null ||
            row.received === undefined
              ? null
              : Number(row.received);
        }

        return payment;
      }),
    };
  }, [paymentMethods, payments, taxOptionCode, tip]);

  const validateBeforePreview = () => {
    if (!selectedSaleId) {
      showAlert({
        severity: "warning",
        message: "No hay una cuenta válida para procesar.",
      });
      return false;
    }

    if (!canOperate) {
      showAlert({
        severity: "warning",
        message:
          "La cuenta exacta ya no está disponible para generar la vista previa.",
      });
      return false;
    }


    if (!taxOptionCode) {
      showAlert({
        severity: "warning",
        message: "Debes seleccionar una tasa de consumo.",
      });
      return false;
    }

    if (!payments.length || payments.length > 3) {
      showAlert({
        severity: "warning",
        message:
          payments.length > 3
            ? "Solo se permiten máximo 3 métodos de pago por cuenta."
            : "Debes agregar al menos un pago.",
      });
      return false;
    }

    const ids = normalizedPayload.payments.map((row) =>
      Number(row.payment_method_id)
    );

    if (ids.some((id) => !id)) {
      showAlert({
        severity: "warning",
        message: "Selecciona un método de pago en todos los renglones.",
      });
      return false;
    }

    if (ids.length !== new Set(ids).size) {
      showAlert({
        severity: "warning",
        message: "No puedes repetir el mismo método de pago en la misma cuenta.",
      });
      return false;
    }

    for (let index = 0; index < payments.length; index += 1) {
      const row = payments[index];
      const method = paymentMethods.find(
        (candidate) =>
          Number(candidate.id) ===
          Number(row.payment_method_id || 0)
      );
      const amount = Number(row.amount || 0);

      if (!Number.isFinite(amount) || amount <= 0) {
        showAlert({
          severity: "warning",
          message: `El monto del pago ${index + 1} debe ser mayor a 0.`,
        });
        return false;
      }

      const reference = String(row.reference || "").trim();
      const last4 = String(row.last4 || "").trim();
      const received =
        row.received === "" ? null : Number(row.received);

      if (method?.requires_reference && !reference) {
        showAlert({
          severity: "warning",
          message: `${method?.name || "El método seleccionado"} requiere referencia.`,
        });
        return false;
      }

      if (reference.length > 100) {
        showAlert({
          severity: "warning",
          message: "La referencia no puede exceder 100 caracteres.",
        });
        return false;
      }

      if (method?.requires_last4 && !/^\d{4}$/.test(last4)) {
        showAlert({
          severity: "warning",
          message: `${method?.name || "El método seleccionado"} requiere exactamente los últimos 4 dígitos.`,
        });
        return false;
      }

      if (method?.requires_received_amount) {
        if (!Number.isFinite(received)) {
          showAlert({
            severity: "warning",
            message: `${method?.name || "El método seleccionado"} requiere monto recibido.`,
          });
          return false;
        }

        if (received < amount) {
          showAlert({
            severity: "warning",
            message: "El monto recibido no puede ser menor al monto aplicado.",
          });
          return false;
        }
      }
    }

    const expectedTotal =
      Number(sale?.net_total ?? sale?.taxable_amount ?? 0) +
      Number(tip || 0);

    const paymentsTotal = normalizedPayload.payments.reduce(
      (sum, row) => sum + Number(row.amount || 0),
      0
    );

    if (
      Number.isFinite(expectedTotal) &&
      Math.abs(paymentsTotal - expectedTotal) > 0.009
    ) {
      showAlert({
        severity: "warning",
        message:
          "La suma de los pagos debe coincidir con el total actual de la cuenta.",
      });
      return false;
    }

    return true;
  };

  const handlePreview = async () => {
    if (!validateBeforePreview()) return;

    try {
      setPreviewing(true);
      const res = await previewCashierSalePayment(
        selectedSaleId,
        normalizedPayload
      );
      setPreview(res?.data?.preview || null);

      showAlert({
        severity: "success",
        message: res?.message || "Vista previa generada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(
          e,
          "No se pudo validar la vista previa del cobro."
        ),
      });
    } finally {
      setPreviewing(false);
    }
  };

  const setTicketBusyKey = (key, value) => {
    setTicketBusy((prev) => ({ ...prev, [key]: value }));
  };

  const loadPostPaymentPrintConfig = async (targetSaleId) => {
    if (!targetSaleId) {
      setPostPaymentPrintConfig(null);
      return null;
    }

    try {
      const res = await fetchCashierSaleTicketPrintConfig(targetSaleId);
      const config = res?.data || null;
      setPostPaymentPrintConfig(config);
      return config;
    } catch {
      setPostPaymentPrintConfig(null);
      return null;
    }
  };

  const ensureLatestTicket = async () => {
    const currentTicketId = Number(postPaymentTicket?.id || 0);

    if (!currentTicketId) {
      throw new Error("No hay ticket disponible para consultar.");
    }

    const res = await fetchCashierTicketById(currentTicketId);
    return res?.data || postPaymentTicket;
  };

  const handleViewTicket = async () => {
    const ticketWindow = openCashierTicketWindow("Cargando ticket…");

    if (!ticketWindow) {
      showAlert({
        severity: "error",
        message: "El navegador bloqueó la apertura de la vista del ticket.",
      });
      return;
    }

    try {
      setTicketBusyKey("view", true);
      const latestTicket = await ensureLatestTicket();
      setPostPaymentTicket(latestTicket);
      await openCashierTicketHtmlInNewTab(
        latestTicket.id,
        ticketWindow
      );
    } catch (e) {
      try {
        if (!ticketWindow.closed) ticketWindow.close();
      } catch (error) {
        console.error(error);
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo abrir la vista del ticket."),
      });
    } finally {
      setTicketBusyKey("view", false);
    }
  };

  const handlePrintTicket = async () => {
    const printWindow = openCashierTicketWindow("Preparando impresión…");

    if (!printWindow) {
      showAlert({
        severity: "error",
        message: "El navegador bloqueó la ventana de impresión.",
      });
      return;
    }

    try {
      setTicketBusyKey("print", true);
      const latestTicket = await ensureLatestTicket();
      setPostPaymentTicket(latestTicket);
      await printCashierTicketFromHtml(latestTicket.id, printWindow);
    } catch (e) {
      try {
        if (!printWindow.closed) printWindow.close();
      } catch (error) {
        console.error(error);
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo imprimir el ticket."),
      });
    } finally {
      setTicketBusyKey("print", false);
    }
  };

  const handleThermalPrintTicket = async () => {
    const currentSaleId = Number(
      postPaymentSale?.sale_id ||
        postPaymentSale?.id ||
        selectedSaleId ||
        0
    );

    if (!currentSaleId) {
      showAlert({
        severity: "warning",
        message: "No hay una cuenta válida para imprimir.",
      });
      return;
    }

    try {
      setTicketBusyKey("thermalPrint", true);

      const configRes = await fetchCashierSaleTicketPrintConfig(
        currentSaleId
      );
      const config = configRes?.data || null;

      if (!config?.enabled || !config?.show_print_button) {
        showAlert({
          severity: "warning",
          message:
            config?.message ||
            "La impresión térmica no está habilitada para esta sucursal.",
        });
        return;
      }

      setPostPaymentPrintConfig(config);

      const payloadRes = await fetchCashierSaleTicketPrintPayload(
        currentSaleId
      );
      const payload = payloadRes?.payload || null;

      if (!payload) {
        throw new Error("No se recibió el payload de impresión térmica.");
      }

      await sendCashierThermalPrintPayload(payload, config);

      showAlert({
        severity: "success",
        message: "Ticket enviado a impresión térmica correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(
          e,
          "No se pudo enviar el ticket a la aplicación de impresión térmica."
        ),
      });
    } finally {
      setTicketBusyKey("thermalPrint", false);
    }
  };

  const handleDownloadTicket = async () => {
    try {
      setTicketBusyKey("download", true);
      const latestTicket = await ensureLatestTicket();
      setPostPaymentTicket(latestTicket);
      await saveCashierTicketPdf(latestTicket.id);
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo descargar el PDF del ticket."),
      });
    } finally {
      setTicketBusyKey("download", false);
    }
  };

  const handleSendTicketWhatsapp = async ({
    phone,
    body,
    saveContact,
  }) => {
    const targetSaleId = Number(
      postPaymentSale?.sale_id ||
        postPaymentSale?.id ||
        selectedSaleId ||
        0
    );

    try {
      setTicketBusyKey("whatsapp", true);

      await sendCashierSaleTicketWhatsapp(targetSaleId, {
        phone,
        body,
        save_contact: saveContact,
      });

      showAlert({
        severity: "success",
        message: "Ticket enviado correctamente por WhatsApp.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(
          e,
          "No se pudo enviar el ticket por WhatsApp."
        ),
      });
    } finally {
      setTicketBusyKey("whatsapp", false);
    }
  };

  const handlePay = async () => {
    if (!preview) {
      showAlert({
        severity: "warning",
        message: "Primero genera la vista previa del cobro.",
      });
      return;
    }

    if (!selectedSaleId) {
      showAlert({
        severity: "warning",
        message: "No se encontró la cuenta exacta que debe cobrarse.",
      });
      return;
    }

    try {
      setPaying(true);

      if (!isLegacySale) {
        if (!selectedCheckId) {
          throw new Error(
            "No se encontró el OrderCheck que debe prepararse."
          );
        }

        const prepareRes =
          await prepareCashierSaleCheckPayment(selectedCheckId);

        const prepareData = prepareRes?.data || null;
        const preparedPayload =
          prepareData?.check || null;

        const preparedCheckId = checkIdOf(preparedPayload);

        const preparedSaleId = numberOrNull(
          prepareData?.sale?.id ??
            prepareData?.sale?.sale_id ??
            prepareData?.sale_id ??
            preparedPayload?.sale_id
        );

        if (
          preparedCheckId !== Number(selectedCheckId) ||
          preparedSaleId !== Number(selectedSaleId) ||
          String(preparedPayload?.status || "").toLowerCase() !==
            "paying"
        ) {
          const error = new Error(
            "La cuenta no quedó preparada correctamente para el cobro."
          );
          error.code = "CHECK_NOT_PAYING_AFTER_PREPARE";
          throw error;
        }

        setPreparedCheck(prepareData);

        setSelectedCheck((prev) => ({
          ...(prev || {}),
          ...preparedPayload,
        }));

        setDetailData((prev) => ({
          ...(prev || {}),
          selected_check: {
            ...(prev?.selected_check || {}),
            ...preparedPayload,
          },
          prepared_check: prepareData,
        }));
      }

      const res = await payCashierSale(
        selectedSaleId,
        normalizedPayload
      );

      const paidSaleData = res?.data?.sale || null;
      const paidOrderData = res?.data?.order || null;
      const paidTableData = res?.data?.table || null;
      const paidPayments = toArray(res?.data?.payments);
      const paidSettlement = res?.data?.settlement || null;
      const paidPoints = res?.data?.points || null;
      const ticketFromPay = extractTicketFromPayResponse(res);
      const ticketWarningData =
        extractTicketWarningFromPayResponse(res);

      setSettlement(paidSettlement);
      setPostPaymentSale(paidSaleData);
      setPostPaymentOrder(paidOrderData);
      setPostPaymentTable(paidTableData);
      setPostPaymentPayments(paidPayments);
      setPostPaymentPoints(paidPoints);

      if (paidSaleData) {
        setDetailData((prev) => {
          if (!prev?.sale) return prev;

          return {
            ...prev,
            sale: {
              ...prev.sale,
              ...paidSaleData,
              id:
                paidSaleData.id ||
                paidSaleData.sale_id ||
                prev.sale.id,
              sale_id:
                paidSaleData.sale_id ||
                paidSaleData.id ||
                prev.sale.sale_id,
              net_total:
                paidSaleData.net_total ??
                paidSaleData.taxable_amount ??
                prev.sale.net_total,
              payable_total:
                paidSaleData.payable_total ??
                paidSaleData.total ??
                prev.sale.payable_total,
              order: {
                ...(prev.sale.order || {}),
                ...(paidOrderData || {}),
              },
              table: paidTableData
                ? {
                    ...(prev.sale.table || {}),
                    ...paidTableData,
                  }
                : prev.sale.table || null,
            },
          };
        });
      }

      setPostPaymentTicket(ticketFromPay || null);
      setPostPaymentTicketWarning(
        ticketWarningData.ticketWarning
      );
      setPostPaymentTicketErrorCode(
        ticketWarningData.ticketErrorCode
      );
      setPostPaymentTicketErrorMessage(
        ticketWarningData.ticketErrorMessage
      );

      const currentSaleId = Number(
        paidSaleData?.id ||
          paidSaleData?.sale_id ||
          selectedSaleId
      );

      await loadPostPaymentPrintConfig(currentSaleId);

      setPreview(null);

      showAlert({
        severity: "success",
        message:
          res?.message ||
          "La cuenta fue cobrada correctamente.",
      });

      setPostPaymentOpen(true);
    } catch (e) {
      const code = pickCode(e);
      const data = pickData(e);
      const actionRequired = String(data?.action_required || "");

      const requiresStockReview =
        actionRequired === "REVIEW_DIRECT_ORDER_STOCK" ||
        code === "INSUFFICIENT_WAREHOUSE_STOCK_ON_PAYMENT";

      const requiresCashRegisterReconfiguration =
        actionRequired === "RECONFIGURE_CASH_REGISTER_WAREHOUSE" ||
        code === "INVALID_CASH_REGISTER_WAREHOUSE" ||
        code === "DIRECT_ORDER_WAREHOUSE_MISMATCH";

      if (requiresStockReview) {
        setPreview(null);

        const orderId = Number(
          data?.order_id ||
            sale?.order?.id ||
            sale?.order_id ||
            selectedCheck?.primary_order_id ||
            0
        );

        showAlert({
          severity: "warning",
          title: "Revisa la venta",
          message: pickErr(
            e,
            "Algunos productos ya no tienen stock suficiente. Corrige la venta antes de cobrar."
          ),
        });

        if (orderId && selectedSaleId) {
          setTimeout(() => {
            nav(
              `/staff/cashier/direct-order?order_id=${orderId}&return_sale_id=${selectedSaleId}`,
              { replace: true }
            );
          }, 700);
        }

        return;
      }

      if (requiresCashRegisterReconfiguration) {
        setPreview(null);

        showAlert({
          severity: "warning",
          title: "Caja pendiente de configuración",
          message: pickErr(
            e,
            "No se puede cobrar esta cuenta porque la caja necesita que el propietario revise su almacén asignado."
          ),
        });
        return;
      }

      if (
        code === "SALE_ALREADY_PAID" ||
        code === "SALE_NOT_OWNED_BY_SESSION" ||
        code === "ORDER_NOT_IN_PAYING" ||
        code === "CHECK_SALE_NOT_PAYABLE"
      ) {
        showAlert({
          severity: "warning",
          message: pickErr(
            e,
            "La cuenta ya no está disponible para cobrarse."
          ),
        });

        setTimeout(() => {
          nav(MY_SALES_PATH, { replace: true });
        }, 600);
        return;
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo cobrar la cuenta."),
      });
    } finally {
      setPaying(false);
    }
  };

  const syncDiscountResponseToState = async (res) => {
    const summaryData = res?.data || null;

    setDiscountSummary(summaryData);
    syncSaleFromDiscountSummary(summaryData);
    syncSinglePaymentFromFinancialSale(summaryData?.sale, tip);
    setPreview(null);
    await refreshSelectedCheckDetail();
  };

  const resetDiscountAuthorizationState = () => {
    setDiscountAuthorizationOpen(false);
    setDiscountAuthorizationPolicy(null);
    setDiscountAuthorizationMessage("");
    setDiscountAuthorizationTarget(null);
    setDiscountAuthorizers([]);
    setDiscountAuthorizationForm({ user_id: "", pin: "" });
    setLoadingDiscountAuthorizers(false);
    setAuthorizingDiscount(false);
    setDiscountAuthorizationError("");
  };

  const handleDiscountAuthorizationFormChange = (field, value) => {
    setDiscountAuthorizationForm((prev) => ({ ...prev, [field]: value }));
  };

  const loadDiscountAuthorizersForAuthorization = async () => {
    try {
      setLoadingDiscountAuthorizers(true);
      setDiscountAuthorizationError("");

      const res = await fetchCashierDiscountAuthorizers();
      const rows = toArray(res?.data);

      setDiscountAuthorizers(rows);

      if (rows.length === 1) {
        setDiscountAuthorizationForm((prev) => ({
          ...prev,
          user_id: String(rows[0]?.user_id || ""),
        }));
      }

      if (!rows.length) {
        setDiscountAuthorizationError(
          res?.message ||
            "No hay autorizadores de descuentos disponibles para esta sucursal."
        );
      }

      return rows;
    } catch (e) {
      setDiscountAuthorizers([]);
      setDiscountAuthorizationError(
        pickErr(
          e,
          "No se pudieron cargar los autorizadores de descuentos."
        )
      );
      return [];
    } finally {
      setLoadingDiscountAuthorizers(false);
    }
  };

  const openDiscountAuthorizationModal = async ({
    error,
    target,
    fallbackMessage,
  }) => {
    const payload = pickErrorPayload(error);

    setDiscountAuthorizationTarget(target);
    setDiscountAuthorizationPolicy(payload?.discount_policy || null);
    setDiscountAuthorizationMessage(
      payload?.message ||
        fallbackMessage ||
        "Este descuento requiere autorización."
    );
    setDiscountAuthorizationForm({ user_id: "", pin: "" });
    setDiscountAuthorizationError("");
    setDiscountAuthorizationOpen(true);

    await loadDiscountAuthorizersForAuthorization();
  };

  const maybeHandleDiscountAuthorizationRequired = async ({
    error,
    target,
    fallbackMessage,
  }) => {
    if (pickCode(error) !== "DISCOUNT_AUTHORIZATION_REQUIRED") {
      return false;
    }

    await openDiscountAuthorizationModal({
      error,
      target,
      fallbackMessage,
    });

    return true;
  };

  const handleCloseDiscountAuthorization = () => {
    if (authorizingDiscount) return;
    resetDiscountAuthorizationState();
  };

  const buildAuthorizationErrorMessage = (e) => {
    const payload = pickErrorPayload(e);
    const authorizationError = payload?.authorization_error || {};

    return (
      authorizationError?.message ||
      authorizationError?.failure_message ||
      payload?.message ||
      "La autorización no es válida."
    );
  };

  const handleSubmitDiscountAuthorization = async () => {
    if (!discountAuthorizationTarget || !selectedSaleId) {
      setDiscountAuthorizationError(
        "No se encontró el descuento pendiente de autorización."
      );
      return;
    }

    if (!discountAuthorizationForm.user_id) {
      setDiscountAuthorizationError("Selecciona un autorizador.");
      return;
    }

    if (!String(discountAuthorizationForm.pin || "").trim()) {
      setDiscountAuthorizationError("Ingresa el PIN del autorizador.");
      return;
    }

    const authorizedPayload = {
      ...(discountAuthorizationTarget.payload || {}),
      authorization: {
        user_id: Number(discountAuthorizationForm.user_id),
        pin: String(discountAuthorizationForm.pin || "").trim(),
      },
    };

    try {
      setAuthorizingDiscount(true);
      setDiscountAuthorizationError("");

      let res = null;

      if (discountAuthorizationTarget.scope === "global") {
        res = await applyCashierSaleGlobalDiscount(
          selectedSaleId,
          authorizedPayload
        );
      }

      if (discountAuthorizationTarget.scope === "item") {
        res = await applyCashierSaleItemDiscount(
          selectedSaleId,
          Number(discountAuthorizationTarget.orderItemId || 0),
          authorizedPayload
        );
      }

      await syncDiscountResponseToState(res);

      if (
        discountAuthorizationTarget.scope === "item" &&
        discountAuthorizationTarget.draftLocalId
      ) {
        setItemDiscountDrafts((prev) =>
          prev.filter(
            (row) =>
              row.localId !==
              discountAuthorizationTarget.draftLocalId
          )
        );
      }

      resetDiscountAuthorizationState();

      showAlert({
        severity: "success",
        message:
          res?.message ||
          "Descuento autorizado y aplicado correctamente.",
      });
    } catch (e) {
      const code = pickCode(e);

      if (code === "DISCOUNT_AUTHORIZATION_INVALID") {
        setDiscountAuthorizationError(
          buildAuthorizationErrorMessage(e)
        );
        return;
      }

      if (code === "DISCOUNT_AUTHORIZATION_REQUIRED") {
        const payload = pickErrorPayload(e);
        setDiscountAuthorizationPolicy(
          payload?.discount_policy || null
        );
        setDiscountAuthorizationMessage(
          payload?.message ||
            "Este descuento requiere autorización."
        );
        setDiscountAuthorizationError(
          "Verifica el autorizador y el PIN para continuar."
        );
        return;
      }

      setDiscountAuthorizationError(
        pickErr(e, "No se pudo aplicar el descuento autorizado.")
      );
    } finally {
      setAuthorizingDiscount(false);
    }
  };

  const validateDiscountPayload = (type, value, scopeLabel) => {
    if (!canManageDiscounts) {
      showAlert({
        severity: "warning",
        message: isEqualPartsAccount
          ? "Las cuentas divididas en partes iguales no permiten descuentos. Deshaz la división antes de ajustar el importe."
          : "Los descuentos solo pueden modificarse mientras la cuenta está abierta.",
      });
      return false;
    }

    if (!type) {
      showAlert({
        severity: "warning",
        message: `Selecciona el tipo de descuento para ${scopeLabel}.`,
      });
      return false;
    }

    if (value === "" || value === null || value === undefined) {
      showAlert({
        severity: "warning",
        message: `Ingresa el valor del descuento para ${scopeLabel}.`,
      });
      return false;
    }

    return true;
  };

  const handleApplyGlobalDiscount = async () => {
    const { type, value, reason } = globalDiscountForm;

    if (!validateDiscountPayload(type, value, "el descuento total")) {
      return;
    }

    const payload = {
      type,
      value: Number(value || 0),
      reason: reason?.trim() || null,
    };

    try {
      setDiscountBusy(true);
      const res = await applyCashierSaleGlobalDiscount(
        selectedSaleId,
        payload
      );

      await syncDiscountResponseToState(res);

      showAlert({
        severity: "success",
        message: res?.message || "Descuento global aplicado correctamente.",
      });
    } catch (e) {
      const authorizationOpened =
        await maybeHandleDiscountAuthorizationRequired({
          error: e,
          target: { scope: "global", payload },
          fallbackMessage:
            "Este descuento global requiere autorización.",
        });

      if (authorizationOpened) return;

      const code = pickCode(e);

      if (
        code === "MOTIVO_DESCUENTO_REQUERIDO" ||
        code === "DISCOUNT_BLOCKED"
      ) {
        showAlert({
          severity: "warning",
          message: pickErr(
            e,
            "El descuento no puede aplicarse con los datos actuales."
          ),
        });
        return;
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo aplicar el descuento global."),
      });
    } finally {
      setDiscountBusy(false);
    }
  };

  const handleRemoveGlobalDiscount = async () => {
    try {
      setDiscountBusy(true);
      const res = await removeCashierSaleGlobalDiscount(
        selectedSaleId
      );

      await syncDiscountResponseToState(res);

      showAlert({
        severity: "success",
        message:
          res?.message ||
          "Descuento global removido correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo quitar el descuento global."),
      });
    } finally {
      setDiscountBusy(false);
    }
  };

  const handleApplyItemDraft = async (localId) => {
    const draft = itemDiscountDrafts.find(
      (row) => row.localId === localId
    );

    if (!draft) {
      showAlert({
        severity: "warning",
        message: "No se encontró el borrador del descuento por ítem.",
      });
      return;
    }

    const orderItemId = Number(draft.orderItemId || 0);

    if (!orderItemId) {
      showAlert({
        severity: "warning",
        message: "Selecciona el ítem al que le aplicarás el descuento.",
      });
      return;
    }

    if (
      !validateDiscountPayload(
        draft.type,
        draft.value,
        "el descuento por ítem"
      )
    ) {
      return;
    }

    const payload = {
      type: draft.type,
      value: Number(draft.value || 0),
      reason: draft.reason?.trim() || null,
    };

    try {
      setDiscountBusy(true);
      const res = await applyCashierSaleItemDiscount(
        selectedSaleId,
        orderItemId,
        payload
      );

      await syncDiscountResponseToState(res);

      setItemDiscountDrafts((prev) =>
        prev.filter((row) => row.localId !== localId)
      );

      showAlert({
        severity: "success",
        message:
          res?.message ||
          "Descuento por ítem aplicado correctamente.",
      });
    } catch (e) {
      const authorizationOpened =
        await maybeHandleDiscountAuthorizationRequired({
          error: e,
          target: {
            scope: "item",
            orderItemId,
            draftLocalId: localId,
            payload,
          },
          fallbackMessage:
            "Este descuento por ítem requiere autorización.",
        });

      if (authorizationOpened) return;

      const code = pickCode(e);

      if (
        code === "MOTIVO_DESCUENTO_REQUERIDO" ||
        code === "DISCOUNT_BLOCKED"
      ) {
        showAlert({
          severity: "warning",
          message: pickErr(
            e,
            "El descuento no puede aplicarse con los datos actuales."
          ),
        });
        return;
      }

      showAlert({
        severity: "error",
        message: pickErr(
          e,
          "No se pudo aplicar el descuento por ítem."
        ),
      });
    } finally {
      setDiscountBusy(false);
    }
  };

  const handleRemoveItemDiscount = async (orderItemId) => {
    try {
      setDiscountBusy(true);
      const res = await removeCashierSaleItemDiscount(
        selectedSaleId,
        orderItemId
      );

      await syncDiscountResponseToState(res);

      showAlert({
        severity: "success",
        message:
          res?.message ||
          "Descuento por ítem removido correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(
          e,
          "No se pudo quitar el descuento por ítem."
        ),
      });
    } finally {
      setDiscountBusy(false);
    }
  };

  const isOperationalAuthorizationRequired = (error) => {
    return (
      Number(error?.response?.status || 0) === 422 &&
      pickCode(error) === "OPERATIONAL_AUTHORIZATION_REQUIRED"
    );
  };

  const resetOperationalAuthorizationState = () => {
    setPendingAdjustmentAuthorization(null);
    setOperationalAuthorizationOpen(false);
    setOperationalAuthorizers([]);
    setLoadingOperationalAuthorizers(false);
    setAuthorizingOperational(false);
    setOperationalAuthorizationError("");
    setOperationalAuthorizationMessage("");
  };

  const loadOperationalAuthorizers = async () => {
    try {
      setLoadingOperationalAuthorizers(true);
      setOperationalAuthorizationError("");

      const res = await fetchCashierOperationalAuthorizers();
      const rows = toArray(
        res?.data?.authorizers || res?.data
      );

      setOperationalAuthorizers(rows);

      if (!rows.length) {
        setOperationalAuthorizationError(
          res?.message ||
            "No hay autorizadores operativos disponibles para esta sucursal."
        );
      }

      return rows;
    } catch (e) {
      setOperationalAuthorizers([]);
      setOperationalAuthorizationError(
        pickErr(
          e,
          "No se pudieron cargar los autorizadores operativos."
        )
      );
      return [];
    } finally {
      setLoadingOperationalAuthorizers(false);
    }
  };

  const openOperationalAuthorization = async ({
    error,
    operation,
  }) => {
    setPendingAdjustmentAuthorization(operation);
    setOperationalAuthorizationMessage(
      pickErr(
        error,
        "Esta cancelación requiere autorización operativa para limpiar los descuentos manuales afectados."
      )
    );
    setOperationalAuthorizationError("");
    setOperationalAuthorizationOpen(true);
    await loadOperationalAuthorizers();
  };

  const handleCloseOperationalAuthorization = () => {
    if (authorizingOperational) return;
    resetOperationalAuthorizationState();
  };

  const finishSuccessfulAdjustment = async ({
    response,
    operationType,
  }) => {
    setPreview(null);

    showAlert({
      severity: "success",
      message:
        response?.message ||
        (operationType === "order"
          ? "Orden cancelada correctamente."
          : "Ajuste parcial aplicado correctamente."),
    });

    if (operationType === "order") {
      setTimeout(() => {
        nav(MY_SALES_PATH, { replace: true });
      }, 500);
      return;
    }

    setPartialCancelForm({ reason: "" });
    setPartialCancelDrafts([]);
    await load({ preserveForm: false });
  };

  const handleSubmitOperationalAuthorization = async (authorization) => {
    const pending = pendingAdjustmentAuthorization;

    if (!pending) {
      setOperationalAuthorizationError(
        "No se encontró la cancelación pendiente."
      );
      return;
    }

    const authorizationUserId = Number(
      authorization?.authorization_user_id ??
        authorization?.user_id ??
        0
    );

    const authorizationPin = String(
      authorization?.authorization_pin ??
        authorization?.pin ??
        ""
    ).trim();

    if (!authorizationUserId) {
      setOperationalAuthorizationError("Selecciona un autorizador.");
      return;
    }

    if (!authorizationPin) {
      setOperationalAuthorizationError("Ingresa el PIN del autorizador.");
      return;
    }

    const retryPayload = {
      ...pending.payload,
      clear_discounts_on_restructure: true,
      authorization_user_id: authorizationUserId,
      authorization_pin: authorizationPin,
    };

    try {
      setAuthorizingOperational(true);
      setOperationalAuthorizationError("");

      const res =
        pending.type === "order"
          ? await cancelCashierSaleOrder(
              pending.saleId,
              retryPayload
            )
          : await cancelCashierSaleItems(
              pending.saleId,
              retryPayload
            );

      resetOperationalAuthorizationState();

      await finishSuccessfulAdjustment({
        response: res,
        operationType: pending.type,
      });
    } catch (e) {
      const status = Number(e?.response?.status || 0);
      const code = pickCode(e);

      if (
        status === 422 &&
        (code === "OPERATIONAL_AUTHORIZATION_INVALID" ||
          code === "OPERATIONAL_AUTHORIZATION_REQUIRED")
      ) {
        setOperationalAuthorizationError(
          pickErr(e, "La autorización operativa no es válida.")
        );
        return;
      }

      if (status === 409) {
        const message = pickErr(
          e,
          "La cancelación ya no puede realizarse."
        );
        resetOperationalAuthorizationState();
        showAlert({ severity: "warning", message });
        return;
      }

      setOperationalAuthorizationError(
        pickErr(e, "No se pudo completar la cancelación autorizada.")
      );
    } finally {
      setAuthorizingOperational(false);
    }
  };

  const handleSubmitPartialCancel = async () => {
    if (!canManageAdjustments) {
      showAlert({
        severity: "warning",
        message: isEqualPartsAccount
          ? "Las cuentas divididas en partes iguales no permiten cancelaciones. Deshaz la división antes de modificar el consumo."
          : "Las cancelaciones solo pueden aplicarse mientras la cuenta está abierta.",
      });
      return;
    }

    if (!partialCancelForm?.reason?.trim()) {
      showAlert({
        severity: "warning",
        message: "Debes indicar el motivo de la cancelación parcial.",
      });
      return;
    }

    if (!partialCancelDrafts.length) {
      showAlert({
        severity: "warning",
        message: "Debes agregar al menos un ítem a cancelar.",
      });
      return;
    }

    const items = partialCancelDrafts.map((draft) => ({
      order_item_id: Number(draft.orderItemId || 0),
      quantity: Number(draft.quantity || 0),
    }));

    if (items.some((row) => !row.order_item_id || !row.quantity)) {
      showAlert({
        severity: "warning",
        message: "Completa el ítem y la cantidad en todos los renglones.",
      });
      return;
    }

    const payload = {
      reason: partialCancelForm.reason.trim(),
      items,
    };

    try {
      setAdjustmentBusy(true);
      const res = await cancelCashierSaleItems(
        selectedSaleId,
        payload
      );

      await finishSuccessfulAdjustment({
        response: res,
        operationType: "items",
      });
    } catch (e) {
      const code = pickCode(e);
      const status = Number(e?.response?.status || 0);

      if (isOperationalAuthorizationRequired(e)) {
        await openOperationalAuthorization({
          error: e,
          operation: {
            type: "items",
            saleId: selectedSaleId,
            orderId: numberOrNull(
              sale?.order_id || selectedCheck?.primary_order_id
            ),
            payload,
            items,
          },
        });
        return;
      }

      if (code === "PARTIAL_ADJUSTMENT_WOULD_ZERO_ORDER") {
        showAlert({
          severity: "warning",
          message: pickErr(
            e,
            "La cancelación parcial dejaría la orden en cero. Usa cancelación total."
          ),
        });
        return;
      }

      showAlert({
        severity: status === 409 ? "warning" : "error",
        message: pickErr(
          e,
          "No se pudo aplicar la cancelación parcial."
        ),
      });
    } finally {
      setAdjustmentBusy(false);
    }
  };

  const handleSubmitCancelOrder = async () => {
    if (!canManageAdjustments) {
      showAlert({
        severity: "warning",
        message: isEqualPartsAccount
          ? "Las cuentas divididas en partes iguales no permiten cancelaciones. Deshaz la división antes de modificar el consumo."
          : "La orden solo puede cancelarse mientras la cuenta está abierta.",
      });
      return;
    }

    if (!cancelOrderReason.trim()) {
      showAlert({
        severity: "warning",
        message: "Debes indicar el motivo de la cancelación total.",
      });
      return;
    }

    const resolvedOrderId = numberOrNull(
      cancelOrderId ||
        sale?.order_id ||
        selectedCheck?.primary_order_id
    );

    if (adjustmentOrders.length > 1 && !resolvedOrderId) {
      showAlert({
        severity: "warning",
        message: "Selecciona la orden que deseas cancelar.",
      });
      return;
    }

    const payload = {
      reason: cancelOrderReason.trim(),
      ...(resolvedOrderId ? { order_id: resolvedOrderId } : {}),
    };

    try {
      setAdjustmentBusy(true);
      const res = await cancelCashierSaleOrder(
        selectedSaleId,
        payload
      );

      await finishSuccessfulAdjustment({
        response: res,
        operationType: "order",
      });
    } catch (e) {
      const status = Number(e?.response?.status || 0);

      if (isOperationalAuthorizationRequired(e)) {
        await openOperationalAuthorization({
          error: e,
          operation: {
            type: "order",
            saleId: selectedSaleId,
            orderId: resolvedOrderId,
            payload,
          },
        });
        return;
      }

      showAlert({
        severity: status === 409 ? "warning" : "error",
        message: pickErr(e, "No se pudo cancelar la orden."),
      });
    } finally {
      setAdjustmentBusy(false);
    }
  };

  const handleSaveContact = async () => {
    if (!canManageCustomer) {
      showAlert({
        severity: "warning",
        message: "La cuenta debe pertenecer a tu caja para operar datos de cliente.",
      });
      return;
    }

    try {
      setCustomerBusy(true);
      const res = await saveCashierSaleContactData(selectedSaleId, {
        phone: contactForm.phone?.trim() || null,
        email: contactForm.email?.trim() || null,
      });

      setCustomerSummary(res?.data || null);
      syncCustomerFormsFromSummary(res?.data || null);

      showAlert({
        severity: "success",
        message: res?.message || "Contacto simple guardado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo guardar el contacto simple."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

  const handleRemoveContact = async () => {
    try {
      setCustomerBusy(true);
      const res = await removeCashierSaleContactData(selectedSaleId);
      setCustomerSummary(res?.data || null);
      syncCustomerFormsFromSummary(res?.data || null);

      showAlert({
        severity: "success",
        message: res?.message || "Contacto simple eliminado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo eliminar el contacto simple."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

  const handleSearchCustomers = async () => {
    const phone = searchCustomerForm?.phone?.trim() || "";
    const email = searchCustomerForm?.email?.trim() || "";

    if (!phone && !email) {
      showAlert({
        severity: "warning",
        message: "Debes escribir al menos teléfono o correo para buscar.",
      });
      return;
    }

    try {
      setSearchingCustomers(true);
      const res = await searchCashierCustomers({
        phone: phone || undefined,
        email: email || undefined,
      });

      const rows = toArray(res?.data);
      setCustomerSearchResults(rows);

      showAlert({
        severity: rows.length ? "success" : "info",
        message: rows.length
          ? "Búsqueda de clientes completada."
          : "No se encontraron clientes con esos datos.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo buscar el cliente."),
      });
    } finally {
      setSearchingCustomers(false);
    }
  };

  const handleAttachCustomer = async (customerId) => {
    try {
      setCustomerBusy(true);
      const res = await attachCashierSaleCustomer(selectedSaleId, {
        customer_id: Number(customerId),
      });

      setCustomerSummary(res?.data || null);
      syncCustomerFormsFromSummary(res?.data || null);
      setCustomerSearchResults([]);

      showAlert({
        severity: "success",
        message: res?.message || "Cliente asociado correctamente a la cuenta.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo asociar el cliente a la cuenta."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

  const handleDetachCustomer = async () => {
    try {
      setCustomerBusy(true);
      const res = await detachCashierSaleCustomer(selectedSaleId);
      setCustomerSummary(res?.data || null);
      syncCustomerFormsFromSummary(res?.data || null);

      showAlert({
        severity: "success",
        message: res?.message || "Cliente desvinculado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo desvincular el cliente."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

  const handleCreateAndAttachCustomer = async () => {
    try {
      setCustomerBusy(true);

      const createPayload = {
        name_alias: createCustomerForm?.name_alias?.trim() || null,
        phone: createCustomerForm?.phone?.trim() || null,
        email: createCustomerForm?.email?.trim() || null,
        razon_social: createCustomerForm?.razon_social?.trim() || null,
        rfc: createCustomerForm?.rfc?.trim() || null,
        regimen: createCustomerForm?.regimen || null,
        postal_code: createCustomerForm?.postal_code?.trim() || null,
      };

      const created = await createCashierCustomer(createPayload);
      const createdCustomerId = Number(created?.data?.id || 0);

      if (!createdCustomerId) {
        throw new Error("No se obtuvo el id del cliente creado.");
      }

      const attached = await attachCashierSaleCustomer(selectedSaleId, {
        customer_id: createdCustomerId,
      });

      setCustomerSummary(attached?.data || null);
      syncCustomerFormsFromSummary(attached?.data || null);
      setCustomerSearchResults([]);

      showAlert({
        severity: "success",
        message: "Cliente creado y asociado correctamente a la cuenta.",
      });
    } catch (e) {
      const code = pickCode(e);
      const data = pickData(e);

      if (
        code === "CUSTOMER_ALREADY_EXISTS" &&
        Number(data?.customer_id || 0)
      ) {
        try {
          const attached = await attachCashierSaleCustomer(
            selectedSaleId,
            { customer_id: Number(data.customer_id) }
          );

          setCustomerSummary(attached?.data || null);
          syncCustomerFormsFromSummary(attached?.data || null);
          setCustomerSearchResults([]);

          showAlert({
            severity: "success",
            message:
              "El cliente ya existía y se asoció correctamente a la cuenta.",
          });
          return;
        } catch (attachError) {
          showAlert({
            severity: "error",
            message: pickErr(
              attachError,
              "El cliente ya existía, pero no se pudo asociar a la cuenta."
            ),
          });
          return;
        }
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo crear y asociar el cliente."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "70vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, color: "text.secondary", fontSize: 14 }}>
              Cargando detalle de cuenta…
            </Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={1300}>
      <Stack spacing={3}>
        <CashierSaleDetailHeroCard
          sale={sale}
          check={selectedCheck}
          selectedCheck={selectedCheck}
          saleCheckContext={saleCheckContext}
          preparedCheck={preparedCheck}
          cashSession={cashSession}
          canOperate={canOperate}
          onBack={handleReturnToMySales}
        />

        <CashierSaleOptionalActionsBar
          adjustmentSummary={adjustmentSummary}
          customerSummary={customerSummary}
          discountSummary={discountSummary}
          disabled={
            previewing ||
            paying ||
            postPaymentOpen
          }
          adjustmentsDisabled={!canManageAdjustments}
          customerDisabled={!canManageCustomer}
          discountsDisabled={!canManageDiscounts}
          onOpenAdjustments={() => setActiveTool("adjustments")}
          onOpenCustomer={() => setActiveTool("customer")}
          onOpenDiscounts={() => setActiveTool("discounts")}
        />

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "1fr",
              xl: "1.15fr 0.85fr",
            },
            alignItems: "stretch",
          }}
        >
          <Box sx={{ height: "100%", minWidth: 0 }}>
            <CashierOrderItemsCard
              itemsTree={itemsTree}
              itemsSummary={itemsSummary}
              selectedCheck={selectedCheck}
            />
          </Box>

          <Box
            sx={{
              minWidth: 0,
              height: "100%",
              display: "grid",
              gap: 3,
              gridTemplateRows: {
                xs: "auto auto",
                xl: "minmax(0, 1fr) auto",
              },
              alignItems: "stretch",
            }}
          >
            <CashierSaleSummaryCard
              sale={sale}
              check={selectedCheck}
              liveTip={Number(tip || 0)}
              preview={preview}
              selectedTaxOption={selectedTaxOption}
            />

            <CashierTaxSelectorCard
              taxOptions={taxOptions}
              value={taxOptionCode}
              onChange={(nextValue) => {
                setTaxOptionCode(nextValue);
                setPreview(null);
              }}
              disabled={!canOperate || previewing || paying || postPaymentOpen}
            />
          </Box>
        </Box>

        <CashierPaymentFormCard
          methods={paymentMethods}
          initialAmount={paymentInitialAmount}
          preview={preview}
          tip={tip}
          onTipChange={handleTipChange}
          payments={payments}
          onAddPayment={handleAddPayment}
          onRemovePayment={handleRemovePayment}
          onPaymentChange={handlePaymentChange}
          onPreview={handlePreview}
          previewing={previewing}
          paying={paying}
          hasPreview={Boolean(preview)}
          onPay={handlePay}
          disabled={!canOperate || postPaymentOpen}
        />
      </Stack>

      <CashierSaleToolDialog
        open={
          activeTool === "adjustments" &&
          canManageAdjustments
        }
        onClose={() => setActiveTool(null)}
        title="Ajustes y cancelaciones"
        subtitle="Cancela ítems o una orden del paquete únicamente cuando sea necesario antes del cobro."
        icon={<TuneRoundedIcon />}
        maxWidth="lg"
      >
        <CashierAdjustmentCard
          sale={sale}
          selectedCheck={selectedCheck}
          itemsFlat={itemsFlat}
          summary={adjustmentSummary}
          orders={adjustmentOrders}
          orderOptions={adjustmentOrders}
          selectedOrderId={cancelOrderId}
          onSelectedOrderIdChange={setCancelOrderId}
          partialForm={partialCancelForm}
          onPartialFormChange={handlePartialFormChange}
          partialDrafts={partialCancelDrafts}
          onAddPartialDraft={handleAddPartialDraft}
          onRemovePartialDraft={handleRemovePartialDraft}
          onPartialDraftChange={handlePartialDraftChange}
          onSubmitPartial={handleSubmitPartialCancel}
          cancelOrderReason={cancelOrderReason}
          onCancelOrderReasonChange={setCancelOrderReason}
          onSubmitCancelOrder={handleSubmitCancelOrder}
          busy={adjustmentBusy}
          disabled={
            !canManageAdjustments ||
            previewing ||
            paying ||
            postPaymentOpen
          }
        />
      </CashierSaleToolDialog>

      <CashierSaleToolDialog
        open={activeTool === "customer"}
        onClose={() => setActiveTool(null)}
        title="Cliente"
        subtitle="Guarda contacto simple o asocia un cliente formal únicamente a esta cuenta."
        icon={<PersonRoundedIcon />}
        maxWidth="lg"
      >
        <CashierCustomerCard
          summary={customerSummary}
          contactForm={contactForm}
          onContactFormChange={handleContactFormChange}
          onSaveContact={handleSaveContact}
          onRemoveContact={handleRemoveContact}
          searchForm={searchCustomerForm}
          onSearchFormChange={handleSearchCustomerFormChange}
          onSearch={handleSearchCustomers}
          searchResults={customerSearchResults}
          onAttachCustomer={handleAttachCustomer}
          createForm={createCustomerForm}
          onCreateFormChange={handleCreateCustomerFormChange}
          onCreateAndAttach={handleCreateAndAttachCustomer}
          onDetachCustomer={handleDetachCustomer}
          searching={searchingCustomers}
          busy={customerBusy}
          disabled={!canManageCustomer || previewing || paying || postPaymentOpen}
        />
      </CashierSaleToolDialog>

      <CashierSaleToolDialog
        open={
          activeTool === "discounts" &&
          canManageDiscounts
        }
        onClose={() => setActiveTool(null)}
        title="Descuentos"
        subtitle="Aplica descuentos globales o por ítem sobre esta cuenta antes de validar el cobro."
        icon={<LocalOfferRoundedIcon />}
        maxWidth="lg"
      >
        <CashierDiscountCard
          sale={sale}
          selectedCheck={selectedCheck}
          itemsFlat={itemsFlat}
          summary={discountSummary}
          globalForm={globalDiscountForm}
          onGlobalFormChange={handleGlobalFormChange}
          itemDiscountDrafts={itemDiscountDrafts}
          onAddItemDiscountDraft={handleAddItemDiscountDraft}
          onRemoveItemDiscountDraft={handleRemoveItemDiscountDraft}
          onItemDiscountDraftChange={handleItemDiscountDraftChange}
          onApplyGlobal={handleApplyGlobalDiscount}
          onRemoveGlobal={handleRemoveGlobalDiscount}
          onApplyItemDraft={handleApplyItemDraft}
          onRemoveItem={handleRemoveItemDiscount}
          busy={discountBusy}
          disabled={
            !canManageDiscounts ||
            previewing ||
            paying ||
            postPaymentOpen
          }
        />
      </CashierSaleToolDialog>

      <CashierDiscountAuthorizationDialog
        open={discountAuthorizationOpen}
        onClose={handleCloseDiscountAuthorization}
        onSubmit={handleSubmitDiscountAuthorization}
        authorizers={discountAuthorizers}
        form={discountAuthorizationForm}
        onFormChange={handleDiscountAuthorizationFormChange}
        loading={loadingDiscountAuthorizers}
        busy={authorizingDiscount}
        error={discountAuthorizationError}
        message={discountAuthorizationMessage}
        policy={discountAuthorizationPolicy}
      />

      <CashierOperationalAuthorizationDialog
        open={operationalAuthorizationOpen}
        onClose={handleCloseOperationalAuthorization}
        onSubmit={handleSubmitOperationalAuthorization}
        authorizers={operationalAuthorizers}
        loading={loadingOperationalAuthorizers}
        busy={authorizingOperational}
        error={operationalAuthorizationError}
        title="Autorizar cancelación"
        message={operationalAuthorizationMessage}
        submitLabel="Autorizar y continuar"
      />

      <CashierPostPaymentTicketModal
        open={postPaymentOpen}
        onClose={handleReturnToMySales}
        onContinue={handleReturnToMySales}
        onViewTicket={handleViewTicket}
        onPrintTicket={handlePrintTicket}
        onThermalPrintTicket={handleThermalPrintTicket}
        onDownloadTicket={handleDownloadTicket}
        onSendWhatsapp={handleSendTicketWhatsapp}
        busyView={ticketBusy.view}
        busyPrint={ticketBusy.print}
        busyThermalPrint={ticketBusy.thermalPrint}
        busyDownload={ticketBusy.download}
        busyWhatsapp={ticketBusy.whatsapp}
        printConfig={postPaymentPrintConfig}
        customerSummary={customerSummary}
        ticket={postPaymentTicket}
        sale={postPaymentSale || detailData?.sale || null}
        order={postPaymentOrder || detailData?.sale?.order || null}
        table={postPaymentTable || detailData?.sale?.table || null}
        payments={postPaymentPayments}
        points={postPaymentPoints}
        settlement={settlement}
        ticketWarning={postPaymentTicketWarning}
        ticketErrorCode={postPaymentTicketErrorCode}
        ticketErrorMessage={postPaymentTicketErrorMessage}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4200}
      />
    </PageContainer>
  );
}