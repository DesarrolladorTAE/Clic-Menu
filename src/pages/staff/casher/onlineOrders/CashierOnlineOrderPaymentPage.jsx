import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import { useStaffAuth } from "../../../../context/StaffAuthContext";

import CashierOnlineOrderPaymentHeroCard from "../../../../components/staff/casher/onlineOrders/paymentPage/CashierOnlineOrderPaymentHeroCard";
import CashierOrderItemsCard from "../../../../components/staff/casher/saleDetailPage/CashierOrderItemsCard";
import CashierSaleSummaryCard from "../../../../components/staff/casher/saleDetailPage/CashierSaleSummaryCard";
import CashierTaxSelectorCard from "../../../../components/staff/casher/saleDetailPage/CashierTaxSelectorCard";
import CashierPaymentFormCard from "../../../../components/staff/casher/saleDetailPage/CashierPaymentFormCard";
import CashierDiscountCard from "../../../../components/staff/casher/saleDetailPage/CashierDiscountCard";
import CashierSaleOptionalActionsBar from "../../../../components/staff/casher/saleDetailPage/CashierSaleOptionalActionsBar";
import CashierSaleToolDialog from "../../../../components/staff/casher/saleDetailPage/CashierSaleToolDialog";
import CashierDiscountAuthorizationDialog from "../../../../components/staff/casher/saleDetailPage/CashierDiscountAuthorizationDialog";
import CashierPostPaymentTicketModal from "../../../../components/staff/casher/ticket/CashierPostPaymentTicketModal";

import {
  fetchCashierOnlineOrderDetail,
} from "../../../../services/staff/casher/onlineOrders/cashierOnlineOrders.service";

import {
  prepareCashierSaleCheckPayment,
} from "../../../../services/staff/casher/cashierSaleCheck.service";

import {
  fetchCashierPaymentMethods,
  fetchCashierTaxOptions,
  previewCashierSalePayment,
  payCashierSale,
  extractTicketFromPayResponse,
  extractTicketWarningFromPayResponse,
} from "../../../../services/staff/casher/cashierPayment.service";

import {
  fetchCashierSaleDiscountSummary,
  fetchCashierDiscountAuthorizers,
  applyCashierSaleGlobalDiscount,
  removeCashierSaleGlobalDiscount,
  applyCashierSaleItemDiscount,
  removeCashierSaleItemDiscount,
} from "../../../../services/staff/casher/cashierDiscount.service";

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
} from "../../../../services/staff/casher/cashierTicket.service";

const MY_ONLINE_ORDERS_PATH = "/staff/cashier/online-orders?tab=mine";
const PAYMENT_ACTIONS = ["prepare_payment", "pay"];
const POLL_INTERVAL = 8000;

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function numberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function round2(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
}

function createPageError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function resolveOnlineOrderPayload(response) {
  return response?.data?.online_order || response?.data || response?.online_order || null;
}

function flattenItemsTree(items) {
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

function buildFinancialSale(onlineOrder) {
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

function buildFinancialCheck(onlineOrder, sale) {
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

function buildDefaultTaxCode(sale, taxOptions) {
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

function paymentTotalForSale(sale, liveTip) {
  const backendTotal = Number(sale?.payable_total ?? sale?.total ?? 0);
  const backendTip = Number(sale?.tip ?? 0);
  const nextTip = Number(liveTip ?? 0);

  if (!Number.isFinite(backendTotal) || !Number.isFinite(backendTip) || !Number.isFinite(nextTip)) return null;

  return round2(Math.max(0, backendTotal - backendTip) + Math.max(0, nextTip));
}

function formatPaymentAmountValue(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

function buildOnlineOrderCustomerSummary(onlineOrder) {
  const phone = String(onlineOrder?.customer_phone || "").trim();
  const email = String(onlineOrder?.customer_email || "").trim();
  const name = String(onlineOrder?.order_name || "").trim();

  return {
    customer: null,
    contact_data: {
      phone: phone || null,
      email: email || null,
    },
    phone: phone || null,
    email: email || null,
    name_alias: name || null,
  };
}

function onlinePaymentMethodCodes(paymentType) {
  const type = String(paymentType || "").toLowerCase();

  if (type === "cash") return ["cash"];
  if (type === "transfer") return ["transfer"];
  if (type === "terminal") return ["credit_card", "debit_card"];

  return [];
}

function filterOnlinePaymentMethods(onlineOrder, methods) {
  const allowedCodes = onlinePaymentMethodCodes(onlineOrder?.payment_type);

  return toArray(methods).filter((method) =>
    allowedCodes.includes(String(method?.code || "").toLowerCase())
  );
}

function resolveInitialOnlinePaymentMethodId(onlineOrder, methods) {
  const type = String(onlineOrder?.payment_type || "").toLowerCase();
  const allowedMethods = filterOnlinePaymentMethods(onlineOrder, methods);

  if (["cash", "transfer"].includes(type)) {
    return allowedMethods[0]?.id ? String(allowedMethods[0].id) : "";
  }

  if (type === "terminal" && allowedMethods.length === 1) {
    return String(allowedMethods[0].id);
  }

  return "";
}

export default function CashierOnlineOrderPaymentPage() {
  const nav = useNavigate();
  const { onlineOrderId } = useParams();
  const { clearStaff } = useStaffAuth() || {};

  const [loading, setLoading] = useState(true);
  const [activeTool, setActiveTool] = useState(null);

  const [onlineOrder, setOnlineOrder] = useState(null);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [sale, setSale] = useState(null);
  const [cashSession, setCashSession] = useState(null);
  const [itemsTree, setItemsTree] = useState([]);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [taxOptionCode, setTaxOptionCode] = useState("");
  const [tip, setTip] = useState("0");
  const [payments, setPayments] = useState([]);

  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [paying, setPaying] = useState(false);

  const [discountSummary, setDiscountSummary] = useState(null);
  const [discountBusy, setDiscountBusy] = useState(false);
  const [globalDiscountForm, setGlobalDiscountForm] = useState({
    type: "fixed",
    value: "",
    reason: "",
  });
  const [itemDiscountDrafts, setItemDiscountDrafts] = useState([]);

  const [discountAuthorizationOpen, setDiscountAuthorizationOpen] = useState(false);
  const [discountAuthorizationPolicy, setDiscountAuthorizationPolicy] = useState(null);
  const [discountAuthorizationMessage, setDiscountAuthorizationMessage] = useState("");
  const [discountAuthorizationTarget, setDiscountAuthorizationTarget] = useState(null);
  const [discountAuthorizers, setDiscountAuthorizers] = useState([]);
  const [discountAuthorizationForm, setDiscountAuthorizationForm] = useState({
    user_id: "",
    pin: "",
  });
  const [loadingDiscountAuthorizers, setLoadingDiscountAuthorizers] = useState(false);
  const [authorizingDiscount, setAuthorizingDiscount] = useState(false);
  const [discountAuthorizationError, setDiscountAuthorizationError] = useState("");

  const [settlement, setSettlement] = useState(null);
  const [postPaymentOpen, setPostPaymentOpen] = useState(false);
  const [postPaymentTicket, setPostPaymentTicket] = useState(null);
  const [postPaymentTicketWarning, setPostPaymentTicketWarning] = useState(false);
  const [postPaymentTicketErrorCode, setPostPaymentTicketErrorCode] = useState(null);
  const [postPaymentTicketErrorMessage, setPostPaymentTicketErrorMessage] = useState(null);
  const [postPaymentPrintConfig, setPostPaymentPrintConfig] = useState(null);
  const [postPaymentSale, setPostPaymentSale] = useState(null);
  const [postPaymentOrder, setPostPaymentOrder] = useState(null);

  const [ticketBusy, setTicketBusy] = useState({
    view: false,
    print: false,
    thermalPrint: false,
    download: false,
    whatsapp: false,
  });

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "info",
    title: "",
    message: "",
  });

  const pollRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const loadingRequestRef = useRef(false);
  const paymentCompletedRef = useRef(false);
  const paymentLocalIdRef = useRef(1);
  const discountDraftIdRef = useRef(1);

  const targetOnlineOrderId = numberOrNull(onlineOrderId);
  const selectedSaleId = numberOrNull(sale?.sale_id ?? sale?.id);
  const selectedCheckId = numberOrNull(selectedCheck?.id ?? selectedCheck?.order_check_id);

  const actions = useMemo(() => toArray(onlineOrder?.actions), [onlineOrder]);
  const canManageDiscounts = actions.includes("discount") && !previewing && !paying && !postPaymentOpen;
  const canPreparePayment = actions.includes("prepare_payment");
  const canPay = actions.includes("pay");
  const paymentAvailable = canPreparePayment || canPay;

  const paymentType = String(onlineOrder?.payment_type || "").toLowerCase();

  const onlinePaymentMethods = useMemo(
    () => filterOnlinePaymentMethods(onlineOrder, paymentMethods),
    [onlineOrder, paymentMethods]
  );

  const paymentMethodLocked =
    ["cash", "transfer"].includes(paymentType) &&
    onlinePaymentMethods.length === 1;

  const itemsFlat = useMemo(() => flattenItemsTree(itemsTree), [itemsTree]);

  const selectedTaxOption = useMemo(() => {
    return taxOptions.find((row) => String(row?.code) === String(taxOptionCode)) || null;
  }, [taxOptions, taxOptionCode]);

  const paymentInitialAmount = useMemo(() => paymentTotalForSale(sale, tip), [sale, tip]);
  const hasGlobalDiscount = Boolean(discountSummary?.global_discount);
  const customerSummary = useMemo(() => buildOnlineOrderCustomerSummary(onlineOrder), [onlineOrder]);

  const showAlert = ({ severity = "info", title, message }) => {
    if (!message) return;

    const resolvedTitle =
      title ||
      (severity === "success"
        ? "Listo"
        : severity === "warning"
        ? "Aviso"
        : severity === "error"
        ? "Error"
        : "Información");

    setAlertState({ open: true, severity, title: resolvedTitle, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((previous) => ({ ...previous, open: false }));
  };

  const pickErr = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

  const pickCode = (error) =>
    error?.response?.data?.code || error?.code || "";

  const pickErrorPayload = (error) =>
    error?.response?.data || {};

  const createEmptyPayment = () => ({
    localId: `online-payment-${paymentLocalIdRef.current++}`,
    payment_method_id: "",
    amount: "",
    reference: "",
    last4: "",
    received: "",
  });

  const createEmptyItemDiscountDraft = () => ({
    localId: `online-discount-${discountDraftIdRef.current++}`,
    orderItemId: "",
    type: "fixed",
    value: "",
    reason: "",
  });

  const goToMyOrders = ({ replace = false } = {}) => {
    nav(MY_ONLINE_ORDERS_PATH, { replace });
  };

  const handleReturnToMyOrders = () => {
    paymentCompletedRef.current = true;
    setPostPaymentOpen(false);
    nav(MY_ONLINE_ORDERS_PATH, { replace: true });
  };

  const scheduleReturnToMyOrders = () => {
    if (redirectTimerRef.current) return;

    redirectTimerRef.current = setTimeout(() => {
      nav(MY_ONLINE_ORDERS_PATH, { replace: true });
    }, 3000);
  };

  const syncSinglePaymentAmount = (financialSale, liveTip = tip) => {
    const total = paymentTotalForSale(financialSale, liveTip);
    if (total === null) return;

    setPayments((previous) => {
      if (!Array.isArray(previous) || previous.length !== 1) return previous;

      return [{
        ...previous[0],
        amount: total > 0 ? formatPaymentAmountValue(total) : "",
      }];
    });
  };

  const applyOnlineOrderSnapshot = (
    loadedOnlineOrder,
    { preserveForm = true, methods = paymentMethods } = {}
  ) => {
    const financialSale = buildFinancialSale(loadedOnlineOrder);
    const financialCheck = buildFinancialCheck(loadedOnlineOrder, financialSale);

    setOnlineOrder(loadedOnlineOrder);
    setSale(financialSale);
    setSelectedCheck(financialCheck);
    setCashSession(loadedOnlineOrder?.cash_session || null);
    setItemsTree(toArray(loadedOnlineOrder?.products));

    if (!preserveForm) {
      const initialTip = Number(financialSale?.tip || 0);
      const total = paymentTotalForSale(financialSale, initialTip);
      const initialMethodId = resolveInitialOnlinePaymentMethodId(
        loadedOnlineOrder,
        methods
      );

      setTip(String(initialTip));
      setPayments([{
        ...createEmptyPayment(),
        payment_method_id: initialMethodId,
        amount: total && total > 0 ? formatPaymentAmountValue(total) : "",
      }]);

      setPreview(null);
      setDiscountSummary(null);
      setGlobalDiscountForm({ type: "fixed", value: "", reason: "" });
      setItemDiscountDrafts([]);
    }
  };

  const validateOnlineOrderSnapshot = (loadedOnlineOrder) => {
    if (!loadedOnlineOrder) {
      throw createPageError("ONLINE_ORDER_NOT_FOUND", "No se encontró el pedido en línea.");
    }

    const financialStatus = String(loadedOnlineOrder?.financial_status || "").toLowerCase();
    if (financialStatus === "paid") {
      throw createPageError("ONLINE_ORDER_ALREADY_PAID", "Este pedido ya tiene el cobro registrado.");
    }

    const loadedActions = toArray(loadedOnlineOrder?.actions);
    if (!loadedActions.some((action) => PAYMENT_ACTIONS.includes(action))) {
      throw createPageError(
        "ONLINE_ORDER_PAYMENT_NOT_AVAILABLE",
        "Este pedido ya no está disponible para registrar el cobro en este momento."
      );
    }

    if (!numberOrNull(loadedOnlineOrder?.sale_id) || !numberOrNull(loadedOnlineOrder?.order_check_id)) {
      throw createPageError(
        "ONLINE_ORDER_FINANCIAL_DATA_MISSING",
        "No se encontró la cuenta asociada a este pedido."
      );
    }

    return loadedOnlineOrder;
  };

  const refreshOnlineOrderSnapshot = async ({ preserveForm = true } = {}) => {
    if (!targetOnlineOrderId) return null;

    const response = await fetchCashierOnlineOrderDetail(targetOnlineOrderId);
    const loaded = validateOnlineOrderSnapshot(resolveOnlineOrderPayload(response));

    applyOnlineOrderSnapshot(loaded, { preserveForm });
    return loaded;
  };

  const handleLoadError = (error, { silent = false } = {}) => {
    const status = Number(error?.response?.status || 0);
    const code = pickCode(error);
    const message = pickErr(error, "El pedido ya no está disponible para registrar el cobro.");

    if (paymentCompletedRef.current) return;

    if (status === 401) {
      clearStaff?.();
      nav("/staff/login", { replace: true });
      return;
    }

    if (code === "NO_OPEN_CASH_SESSION") {
      nav("/staff/cashier", { replace: true });
      return;
    }

    if (code === "NO_ACTIVE_STAFF_CONTEXT") {
      nav("/staff/select-context", { replace: true });
      return;
    }

    const mustReturn =
      status === 403 ||
      status === 404 ||
      [
        "INVALID_ONLINE_ORDER_ID",
        "ONLINE_ORDER_NOT_FOUND",
        "ONLINE_ORDER_ALREADY_PAID",
        "ONLINE_ORDER_PAYMENT_NOT_AVAILABLE",
        "ONLINE_ORDER_FINANCIAL_DATA_MISSING",
      ].includes(code);

    if (mustReturn) {
      showAlert({ severity: "warning", message });
      scheduleReturnToMyOrders();
      return;
    }

    if (silent) {
      console.error("No se pudo actualizar la información del pedido.", error);
      return;
    }

    showAlert({ severity: "error", message });
  };

  const load = async ({ silent = false, preserveForm = false } = {}) => {
    if (loadingRequestRef.current || paymentCompletedRef.current) return;

    if (!targetOnlineOrderId) {
      handleLoadError(
        createPageError("INVALID_ONLINE_ORDER_ID", "El pedido indicado no es válido."),
        { silent }
      );
      if (!silent) setLoading(false);
      return;
    }

    try {
      loadingRequestRef.current = true;
      if (!silent) setLoading(true);

      if (preserveForm) {
        await refreshOnlineOrderSnapshot({ preserveForm: true });
        return;
      }

      const [orderResponse, methodsResponse, taxesResponse] = await Promise.all([
        fetchCashierOnlineOrderDetail(targetOnlineOrderId),
        fetchCashierPaymentMethods(),
        fetchCashierTaxOptions(),
      ]);

      const loadedOnlineOrder = validateOnlineOrderSnapshot(resolveOnlineOrderPayload(orderResponse));
      const methods = toArray(methodsResponse?.data);
      const taxes = toArray(taxesResponse?.data);
      const allowedMethods = filterOnlinePaymentMethods(loadedOnlineOrder, methods);

      applyOnlineOrderSnapshot(loadedOnlineOrder, {
        preserveForm: false,
        methods,
      });

      setPaymentMethods(methods);
      setTaxOptions(taxes);
      setTaxOptionCode(buildDefaultTaxCode(buildFinancialSale(loadedOnlineOrder), taxes));

      if (!silent && methods.length === 0) {
        showAlert({
            severity: "warning",
            message: "No hay formas de pago activas disponibles para esta caja.",
        });
      } else if (!silent && allowedMethods.length === 0) {
        showAlert({
            severity: "warning",
            message: "No hay una forma de pago activa compatible con el método elegido para este Pedido en línea.",
        });
      }
    } catch (error) {
      handleLoadError(error, { silent });
    } finally {
      loadingRequestRef.current = false;
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load({ silent: false, preserveForm: false });

    pollRef.current = setInterval(() => {
      if (document.visibilityState === "visible" && !paymentCompletedRef.current) {
        load({ silent: true, preserveForm: true });
      }
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetOnlineOrderId]);

  useEffect(() => {
    if (activeTool === "discounts" && !canManageDiscounts) setActiveTool(null);
  }, [activeTool, canManageDiscounts]);

  const handleTipChange = (value) => {
    setTip(value);
    setPreview(null);

    const parsed = value === "" ? 0 : Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return;

    syncSinglePaymentAmount(sale, parsed);
  };

  const handlePaymentChange = (localId, field, value) => {
    setPayments((previous) =>
      previous.map((row) => {
        if (row.localId !== localId) return row;

        const next = { ...row, [field]: value };

        if (field === "payment_method_id") {
          const method = paymentMethods.find((candidate) => Number(candidate?.id) === Number(value || 0));

          if (!method?.requires_reference) next.reference = "";
          if (!method?.requires_last4) next.last4 = "";
          if (!method?.requires_received_amount) next.received = "";
        }

        if (field === "last4") {
          next.last4 = String(value || "").replace(/\D/g, "").slice(0, 4);
        }

        return next;
      })
    );

    setPreview(null);
  };

  const normalizedPayload = useMemo(() => {
    return {
      tax_option_code: taxOptionCode || null,
      tip: Number(tip || 0),
      payments: payments.map((row) => {
        const method = paymentMethods.find(
          (candidate) => Number(candidate?.id) === Number(row?.payment_method_id || 0)
        );

        const payment = {
          payment_method_id: Number(row?.payment_method_id || 0),
          amount: Number(row?.amount || 0),
        };

        if (method?.requires_reference) payment.reference = String(row?.reference || "").trim() || null;
        if (method?.requires_last4) payment.last4 = String(row?.last4 || "").trim() || null;

        if (method?.requires_received_amount) {
          payment.received =
            row?.received === "" || row?.received === null || row?.received === undefined
              ? null
              : Number(row.received);
        }

        return payment;
      }),
    };
  }, [paymentMethods, payments, taxOptionCode, tip]);

  const validateBeforePreview = () => {
    if (!selectedSaleId || !selectedCheckId) {
      showAlert({
        severity: "warning",
        message: "No se encontró la cuenta financiera que debe cobrarse.",
      });
      return false;
    }

    if (!paymentAvailable) {
      showAlert({
        severity: "warning",
        message: "El backend ya no permite registrar el cobro de este pedido.",
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

    if (payments.length !== 1) {
      showAlert({
        severity: "warning",
        message: "Los Pedidos en línea permiten exactamente un método de pago.",
      });
      return false;
    }

    const row = payments[0];
    const methodId = Number(row?.payment_method_id || 0);
    const method = paymentMethods.find((candidate) => Number(candidate?.id) === methodId);

    if (!methodId || !method) {
      showAlert({
        severity: "warning",
        message: "Selecciona el método con el que se registrará el cobro.",
      });
      return false;
    }

    const amount = Number(row?.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      showAlert({
        severity: "warning",
        message: "El monto del pago debe ser mayor a 0.",
      });
      return false;
    }

    const reference = String(row?.reference || "").trim();
    const last4 = String(row?.last4 || "").trim();
    const received = row?.received === "" ? null : Number(row?.received);

    if (method?.requires_reference && !reference) {
      showAlert({
        severity: "warning",
        message: `${method?.name || "El método seleccionado"} requiere referencia.`,
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

    const expectedTotal = paymentTotalForSale(sale, tip);

    if (
      expectedTotal !== null &&
      Math.abs(Number(row?.amount || 0) - expectedTotal) > 0.009
    ) {
      showAlert({
        severity: "warning",
        message: "El monto del pago debe coincidir con el total actual del pedido.",
      });
      return false;
    }

    return true;
  };

  const ensurePreparedForPayment = async () => {
    const currentActions = toArray(onlineOrder?.actions);
    const currentCheckStatus = String(onlineOrder?.order_check_status || selectedCheck?.status || "").toLowerCase();

    if (currentActions.includes("pay") || currentCheckStatus === "paying") return onlineOrder;

    if (!currentActions.includes("prepare_payment")) {
      throw createPageError(
        "ONLINE_ORDER_PAYMENT_NOT_AVAILABLE",
        "El pedido ya no puede prepararse para cobro en este momento."
      );
    }

    if (!selectedCheckId) {
      throw createPageError(
        "ONLINE_ORDER_FINANCIAL_DATA_MISSING",
        "No se encontró la cuenta que debe prepararse para cobro."
      );
    }

    await prepareCashierSaleCheckPayment(selectedCheckId);

    const refreshed = await refreshOnlineOrderSnapshot({ preserveForm: true });
    const refreshedActions = toArray(refreshed?.actions);
    const refreshedCheckStatus = String(refreshed?.order_check_status || "").toLowerCase();

    if (!refreshedActions.includes("pay") && refreshedCheckStatus !== "paying") {
      throw createPageError(
        "CHECK_NOT_PAYING_AFTER_PREPARE",
        "La cuenta no quedó preparada correctamente para continuar el cobro."
      );
    }

    setActiveTool(null);
    return refreshed;
  };

  const handlePreview = async () => {
    if (!validateBeforePreview()) return;

    try {
      setPreviewing(true);

      await ensurePreparedForPayment();

      const response = await previewCashierSalePayment(selectedSaleId, normalizedPayload);
      setPreview(response?.data?.preview || null);

      showAlert({
        severity: "success",
        message: response?.message || "Vista previa de cobro generada.",
      });
    } catch (error) {
      const code = pickCode(error);
      const status = Number(error?.response?.status || 0);

      if (
        status === 403 ||
        [
          "ONLINE_ORDER_FINANCIAL_ACCESS_DENIED",
          "ONLINE_ORDER_PREPARE_PAYMENT_NOT_ALLOWED",
          "ONLINE_ORDER_PAYMENT_NOT_ALLOWED",
          "ONLINE_ORDER_PAYMENT_NOT_AVAILABLE",
        ].includes(code)
      ) {
        showAlert({
          severity: "warning",
          message: pickErr(error, "El pedido ya no está disponible para continuar el cobro."),
        });

        try {
          await refreshOnlineOrderSnapshot({ preserveForm: true });
        } catch {
          // La consulta posterior es únicamente de sincronización.
        }

        return;
      }

      showAlert({
        severity: "error",
        message: pickErr(error, "No se pudo generar la vista previa del cobro."),
      });
    } finally {
      setPreviewing(false);
    }
  };

  const handleGlobalFormChange = (field, value) => {
    setGlobalDiscountForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleAddItemDiscountDraft = () => {
    if (hasGlobalDiscount) {
      showAlert({
        severity: "warning",
        message: "Quita primero el descuento global antes de agregar descuentos por ítem.",
      });
      return;
    }

    setItemDiscountDrafts((previous) => [...previous, createEmptyItemDiscountDraft()]);
  };

  const handleRemoveItemDiscountDraft = (localId) => {
    setItemDiscountDrafts((previous) => previous.filter((row) => row.localId !== localId));
  };

  const handleItemDiscountDraftChange = (localId, field, value) => {
    setItemDiscountDrafts((previous) =>
      previous.map((row) => row.localId === localId ? { ...row, [field]: value } : row)
    );
  };

  const syncSaleFromDiscountSummary = (summaryData) => {
    const summarySale = summaryData?.sale;
    if (!summarySale) return;

    setSale((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        status: summarySale.status ?? previous.status,
        subtotal: summarySale.subtotal ?? previous.subtotal,
        promotion_discount_total:
          summarySale.promotion_discount_total ?? previous.promotion_discount_total,
        manual_discount_total:
          summarySale.manual_discount_total ?? previous.manual_discount_total,
        discount_total: summarySale.discount_total ?? previous.discount_total,
        taxable_amount:
          summarySale.taxable_amount ?? summarySale.net_total ?? previous.taxable_amount,
        net_total:
          summarySale.net_total ?? summarySale.taxable_amount ?? previous.net_total,
        delivery_fee: summarySale.delivery_fee ?? previous.delivery_fee,
        tip: summarySale.tip ?? previous.tip,
        total: summarySale.total ?? previous.total,
        payable_total:
          summarySale.payable_total ?? summarySale.total ?? previous.payable_total,
        tax_kind: summarySale.tax_kind ?? previous.tax_kind,
        tax_rate: summarySale.tax_rate ?? previous.tax_rate,
        tax_base: summarySale.tax_base ?? previous.tax_base,
        tax_total: summarySale.tax_total ?? previous.tax_total,
      };
    });

    syncSinglePaymentAmount(summarySale, tip);
  };

  const syncDiscountResponseToState = async (response) => {
    const summaryData = response?.data || null;

    setDiscountSummary(summaryData);
    syncSaleFromDiscountSummary(summaryData);
    setPreview(null);

    try {
      await refreshOnlineOrderSnapshot({ preserveForm: true });
    } catch (error) {
      console.error("No se pudo refrescar el Pedido en línea después del descuento.", error);
    }
  };

  const handleOpenDiscounts = async () => {
    if (!canManageDiscounts || !selectedSaleId) {
      showAlert({
        severity: "warning",
        message: "Los descuentos ya no están disponibles para este pedido.",
      });
      return;
    }

    try {
      setDiscountBusy(true);

      const response = await fetchCashierSaleDiscountSummary(selectedSaleId);
      const summaryData = response?.data || null;

      setDiscountSummary(summaryData);
      syncSaleFromDiscountSummary(summaryData);

      try {
        await refreshOnlineOrderSnapshot({ preserveForm: true });
      } catch {
        // El resumen de descuentos sigue siendo válido aunque falle este refresh auxiliar.
      }

      setActiveTool("discounts");
    } catch (error) {
      showAlert({
        severity: "error",
        message: pickErr(error, "No se pudo cargar la información de descuentos."),
      });
    } finally {
      setDiscountBusy(false);
    }
  };

  const validateDiscountPayload = (type, value, label) => {
    if (!canManageDiscounts) {
      showAlert({
        severity: "warning",
        message: "Los descuentos ya no pueden modificarse en este momento.",
      });
      return false;
    }

    if (!type) {
      showAlert({
        severity: "warning",
        message: `Selecciona el tipo de descuento para ${label}.`,
      });
      return false;
    }

    if (value === "" || value === null || value === undefined) {
      showAlert({
        severity: "warning",
        message: `Ingresa el valor del descuento para ${label}.`,
      });
      return false;
    }

    return true;
  };

  const resetDiscountAuthorizationState = () => {
    setDiscountAuthorizationOpen(false);
    setDiscountAuthorizationPolicy(null);
    setDiscountAuthorizationMessage("");
    setDiscountAuthorizationTarget(null);
    setDiscountAuthorizers([]);
    setDiscountAuthorizationForm({ user_id: "", pin: "" });
    setDiscountAuthorizationError("");
    setLoadingDiscountAuthorizers(false);
    setAuthorizingDiscount(false);
  };

  const handleDiscountAuthorizationFormChange = (field, value) => {
    setDiscountAuthorizationForm((previous) => ({ ...previous, [field]: value }));
  };

  const loadDiscountAuthorizersForAuthorization = async () => {
    try {
      setLoadingDiscountAuthorizers(true);
      setDiscountAuthorizationError("");

      const response = await fetchCashierDiscountAuthorizers();
      const rows = toArray(response?.data);

      setDiscountAuthorizers(rows);

      if (rows.length === 1) {
        setDiscountAuthorizationForm((previous) => ({
          ...previous,
          user_id: String(rows[0]?.user_id || ""),
        }));
      }

      if (!rows.length) {
        setDiscountAuthorizationError(
          response?.message || "No hay autorizadores de descuentos disponibles para esta sucursal."
        );
      }

      return rows;
    } catch (error) {
      setDiscountAuthorizers([]);
      setDiscountAuthorizationError(
        pickErr(error, "No se pudieron cargar los autorizadores de descuentos.")
      );
      return [];
    } finally {
      setLoadingDiscountAuthorizers(false);
    }
  };

  const openDiscountAuthorizationModal = async ({ error, target, fallbackMessage }) => {
    const payload = pickErrorPayload(error);

    setDiscountAuthorizationTarget(target);
    setDiscountAuthorizationPolicy(payload?.discount_policy || null);
    setDiscountAuthorizationMessage(
      payload?.message || fallbackMessage || "Este descuento requiere autorización."
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
    if (pickCode(error) !== "DISCOUNT_AUTHORIZATION_REQUIRED") return false;

    await openDiscountAuthorizationModal({ error, target, fallbackMessage });
    return true;
  };

  const handleCloseDiscountAuthorization = () => {
    if (authorizingDiscount) return;
    resetDiscountAuthorizationState();
  };

  const handleSubmitDiscountAuthorization = async () => {
    if (!discountAuthorizationTarget || !selectedSaleId) {
      setDiscountAuthorizationError("No se encontró el descuento pendiente de autorización.");
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

    const payload = {
      ...(discountAuthorizationTarget.payload || {}),
      authorization: {
        user_id: Number(discountAuthorizationForm.user_id),
        pin: String(discountAuthorizationForm.pin || "").trim(),
      },
    };

    try {
      setAuthorizingDiscount(true);
      setDiscountAuthorizationError("");

      let response = null;

      if (discountAuthorizationTarget.scope === "global") {
        response = await applyCashierSaleGlobalDiscount(selectedSaleId, payload);
      }

      if (discountAuthorizationTarget.scope === "item") {
        response = await applyCashierSaleItemDiscount(
          selectedSaleId,
          Number(discountAuthorizationTarget.orderItemId || 0),
          payload
        );
      }

      await syncDiscountResponseToState(response);

      if (
        discountAuthorizationTarget.scope === "item" &&
        discountAuthorizationTarget.draftLocalId
      ) {
        setItemDiscountDrafts((previous) =>
          previous.filter((row) => row.localId !== discountAuthorizationTarget.draftLocalId)
        );
      }

      resetDiscountAuthorizationState();

      showAlert({
        severity: "success",
        message: response?.message || "Descuento autorizado y aplicado correctamente.",
      });
    } catch (error) {
      const code = pickCode(error);

      if (code === "DISCOUNT_AUTHORIZATION_INVALID") {
        const payloadError = pickErrorPayload(error);
        const authorizationError = payloadError?.authorization_error || {};

        setDiscountAuthorizationError(
          authorizationError?.message ||
            authorizationError?.failure_message ||
            payloadError?.message ||
            "La autorización no es válida."
        );
        return;
      }

      if (code === "DISCOUNT_AUTHORIZATION_REQUIRED") {
        const payloadError = pickErrorPayload(error);

        setDiscountAuthorizationPolicy(payloadError?.discount_policy || null);
        setDiscountAuthorizationMessage(
          payloadError?.message || "Este descuento requiere autorización."
        );
        setDiscountAuthorizationError("Verifica el autorizador y el PIN para continuar.");
        return;
      }

      setDiscountAuthorizationError(
        pickErr(error, "No se pudo aplicar el descuento autorizado.")
      );
    } finally {
      setAuthorizingDiscount(false);
    }
  };

  const handleApplyGlobalDiscount = async () => {
    const { type, value, reason } = globalDiscountForm;

    if (!validateDiscountPayload(type, value, "el descuento total")) return;

    const payload = {
      type,
      value: Number(value || 0),
      reason: String(reason || "").trim() || null,
    };

    try {
      setDiscountBusy(true);

      const response = await applyCashierSaleGlobalDiscount(selectedSaleId, payload);
      await syncDiscountResponseToState(response);

      showAlert({
        severity: "success",
        message: response?.message || "Descuento global aplicado correctamente.",
      });
    } catch (error) {
      const authorizationOpened = await maybeHandleDiscountAuthorizationRequired({
        error,
        target: { scope: "global", payload },
        fallbackMessage: "Este descuento global requiere autorización.",
      });

      if (authorizationOpened) return;

      showAlert({
        severity: Number(error?.response?.status || 0) === 409 ? "warning" : "error",
        message: pickErr(error, "No se pudo aplicar el descuento global."),
      });
    } finally {
      setDiscountBusy(false);
    }
  };

  const handleRemoveGlobalDiscount = async () => {
    try {
      setDiscountBusy(true);

      const response = await removeCashierSaleGlobalDiscount(selectedSaleId);
      await syncDiscountResponseToState(response);

      showAlert({
        severity: "success",
        message: response?.message || "Descuento global removido correctamente.",
      });
    } catch (error) {
      showAlert({
        severity: Number(error?.response?.status || 0) === 409 ? "warning" : "error",
        message: pickErr(error, "No se pudo quitar el descuento global."),
      });
    } finally {
      setDiscountBusy(false);
    }
  };

  const handleApplyItemDraft = async (localId) => {
    const draft = itemDiscountDrafts.find((row) => row.localId === localId);

    if (!draft) {
      showAlert({
        severity: "warning",
        message: "No se encontró el descuento por ítem que estás capturando.",
      });
      return;
    }

    const orderItemId = Number(draft?.orderItemId || 0);

    if (!orderItemId) {
      showAlert({
        severity: "warning",
        message: "Selecciona el producto al que aplicarás el descuento.",
      });
      return;
    }

    if (!validateDiscountPayload(draft.type, draft.value, "el descuento por ítem")) return;

    const payload = {
      type: draft.type,
      value: Number(draft.value || 0),
      reason: String(draft.reason || "").trim() || null,
    };

    try {
      setDiscountBusy(true);

      const response = await applyCashierSaleItemDiscount(
        selectedSaleId,
        orderItemId,
        payload
      );

      await syncDiscountResponseToState(response);

      setItemDiscountDrafts((previous) =>
        previous.filter((row) => row.localId !== localId)
      );

      showAlert({
        severity: "success",
        message: response?.message || "Descuento por ítem aplicado correctamente.",
      });
    } catch (error) {
      const authorizationOpened = await maybeHandleDiscountAuthorizationRequired({
        error,
        target: {
          scope: "item",
          orderItemId,
          draftLocalId: localId,
          payload,
        },
        fallbackMessage: "Este descuento por ítem requiere autorización.",
      });

      if (authorizationOpened) return;

      showAlert({
        severity: Number(error?.response?.status || 0) === 409 ? "warning" : "error",
        message: pickErr(error, "No se pudo aplicar el descuento por ítem."),
      });
    } finally {
      setDiscountBusy(false);
    }
  };

  const handleRemoveItemDiscount = async (orderItemId) => {
    try {
      setDiscountBusy(true);

      const response = await removeCashierSaleItemDiscount(
        selectedSaleId,
        Number(orderItemId)
      );

      await syncDiscountResponseToState(response);

      showAlert({
        severity: "success",
        message: response?.message || "Descuento por ítem removido correctamente.",
      });
    } catch (error) {
      showAlert({
        severity: Number(error?.response?.status || 0) === 409 ? "warning" : "error",
        message: pickErr(error, "No se pudo quitar el descuento por ítem."),
      });
    } finally {
      setDiscountBusy(false);
    }
  };

  const setTicketBusyKey = (key, value) => {
    setTicketBusy((previous) => ({ ...previous, [key]: value }));
  };

  const loadPostPaymentPrintConfig = async (targetSaleId) => {
    if (!targetSaleId) {
      setPostPaymentPrintConfig(null);
      return null;
    }

    try {
      const response = await fetchCashierSaleTicketPrintConfig(targetSaleId);
      const config = response?.data || null;

      setPostPaymentPrintConfig(config);
      return config;
    } catch {
      setPostPaymentPrintConfig(null);
      return null;
    }
  };

  const ensureLatestTicket = async () => {
    const ticketId = Number(postPaymentTicket?.id || 0);

    if (!ticketId) throw new Error("No hay ticket disponible para consultar.");

    const response = await fetchCashierTicketById(ticketId);
    return response?.data || postPaymentTicket;
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

      await openCashierTicketHtmlInNewTab(latestTicket.id, ticketWindow);
    } catch (error) {
      try {
        if (!ticketWindow.closed) ticketWindow.close();
      } catch {
        // La ventana ya no está disponible.
      }

      showAlert({
        severity: "error",
        message: pickErr(error, "No se pudo abrir la vista del ticket."),
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
    } catch (error) {
      try {
        if (!printWindow.closed) printWindow.close();
      } catch {
        // La ventana ya no está disponible.
      }

      showAlert({
        severity: "error",
        message: pickErr(error, "No se pudo imprimir el ticket."),
      });
    } finally {
      setTicketBusyKey("print", false);
    }
  };

  const handleThermalPrintTicket = async () => {
    const targetSaleId = Number(
      postPaymentSale?.sale_id ||
        postPaymentSale?.id ||
        selectedSaleId ||
        0
    );

    if (!targetSaleId) {
      showAlert({
        severity: "warning",
        message: "No se encontró la venta que debe imprimirse.",
      });
      return;
    }

    try {
      setTicketBusyKey("thermalPrint", true);

      const configResponse = await fetchCashierSaleTicketPrintConfig(targetSaleId);
      const config = configResponse?.data || null;

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

      const payloadResponse = await fetchCashierSaleTicketPrintPayload(targetSaleId);
      const payload = payloadResponse?.payload || null;

      if (!payload) {
        throw new Error("No se recibió el payload de impresión térmica.");
      }

      await sendCashierThermalPrintPayload(payload, config);

      showAlert({
        severity: "success",
        message: "Ticket enviado a impresión térmica correctamente.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        message: pickErr(
          error,
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
    } catch (error) {
      showAlert({
        severity: "error",
        message: pickErr(error, "No se pudo descargar el PDF del ticket."),
      });
    } finally {
      setTicketBusyKey("download", false);
    }
  };

  const handleSendTicketWhatsapp = async ({ phone, body, saveContact }) => {
    const targetSaleId = Number(
      postPaymentSale?.sale_id ||
        postPaymentSale?.id ||
        selectedSaleId ||
        0
    );

    if (!targetSaleId) {
      showAlert({
        severity: "warning",
        message: "No se encontró la venta asociada al ticket.",
      });
      return;
    }

    try {
      setTicketBusyKey("whatsapp", true);

      const response = await sendCashierSaleTicketWhatsapp(targetSaleId, {
        phone,
        body,
        save_contact: saveContact,
      });

      showAlert({
        severity: "success",
        message: response?.message || "Ticket enviado correctamente por WhatsApp.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        message: pickErr(error, "No se pudo enviar el ticket por WhatsApp."),
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
        message: "No se encontró la venta que debe cobrarse.",
      });
      return;
    }

    try {
      setPaying(true);

      /*
       * La vista previa ya debió preparar la cuenta. Se revalida de forma
       * idempotente por si el estado cambió entre preview y pago.
       */
      await ensurePreparedForPayment();

      const response = await payCashierSale(selectedSaleId, normalizedPayload);

      const paidSale = response?.data?.sale || null;
      const paidOrder = response?.data?.order || null;
      const paidSettlement = response?.data?.settlement || null;
      const ticket = extractTicketFromPayResponse(response);
      const ticketWarningData = extractTicketWarningFromPayResponse(response);

      paymentCompletedRef.current = true;

      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }

      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }

      setSettlement(paidSettlement);
      setPostPaymentSale(paidSale);
      setPostPaymentOrder(paidOrder);
      setPostPaymentTicket(ticket || null);

      setPostPaymentTicketWarning(ticketWarningData.ticketWarning);
      setPostPaymentTicketErrorCode(ticketWarningData.ticketErrorCode);
      setPostPaymentTicketErrorMessage(ticketWarningData.ticketErrorMessage);

      if (paidSale) {
        setSale((previous) => ({
          ...(previous || {}),
          ...paidSale,
          id: paidSale?.id || paidSale?.sale_id || previous?.id,
          sale_id: paidSale?.sale_id || paidSale?.id || previous?.sale_id,
          payable_total:
            paidSale?.payable_total ??
            paidSale?.total ??
            previous?.payable_total,
        }));
      }

      const paidSaleId = Number(
        paidSale?.sale_id ||
          paidSale?.id ||
          selectedSaleId
      );

      if (ticket?.id) await loadPostPaymentPrintConfig(paidSaleId);
      else setPostPaymentPrintConfig(null);

      setPreview(null);
      setActiveTool(null);

      showAlert({
        severity: "success",
        message: response?.message || "Venta cobrada correctamente.",
      });

      setPostPaymentOpen(true);
    } catch (error) {
      const code = pickCode(error);

      if (
        [
          "ONLINE_ORDER_FINANCIAL_ACCESS_DENIED",
          "ONLINE_ORDER_PAYMENT_NOT_ALLOWED",
          "SALE_ALREADY_PAID",
          "SALE_NOT_OWNED_BY_SESSION",
          "ORDER_NOT_IN_PAYING",
          "CHECK_SALE_NOT_PAYABLE",
        ].includes(code)
      ) {
        showAlert({
          severity: "warning",
          message: pickErr(error, "El pedido ya no está disponible para cobrarse."),
        });

        try {
          await refreshOnlineOrderSnapshot({ preserveForm: true });
        } catch {
          // La respuesta original del backend conserva el mensaje autoritativo.
        }

        return;
      }

      showAlert({
        severity: "error",
        message: pickErr(error, "No se pudo registrar el cobro."),
      });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando información del cobro…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  if (!onlineOrder || !sale || !selectedCheck) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "58vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center" sx={{ width: "100%", maxWidth: 520, textAlign: "center" }}>
            <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 800 }}>
              Cobro no disponible
            </Typography>

            <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.6 }}>
              Este pedido ya no está disponible para registrar el cobro desde esta pantalla.
            </Typography>

            <Button
              variant="contained"
              onClick={() => goToMyOrders({ replace: true })}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Volver a Mis pedidos
            </Button>
          </Stack>
        </Box>

        <AppAlert
          open={alertState.open}
          onClose={closeAlert}
          severity={alertState.severity}
          title={alertState.title}
          message={alertState.message}
          autoHideDuration={3000}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={1300}>
      <Stack spacing={3}>
        <CashierOnlineOrderPaymentHeroCard
          order={onlineOrder}
          sale={sale}
          check={selectedCheck}
          cashSession={cashSession}
          paymentMethodsCount={onlinePaymentMethods.length}
          onBack={() => goToMyOrders()}
        />

        <CashierSaleOptionalActionsBar
            discountSummary={discountSummary || { sale }}
            disabled={previewing || paying || postPaymentOpen}
            adjustmentsDisabled
            customerDisabled
            discountsDisabled={!actions.includes("discount") || discountBusy}
            showAdjustments={false}
            showCustomer={false}
            showDiscounts
            onOpenDiscounts={handleOpenDiscounts}
        />

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              xl: "1.15fr 0.85fr",
            },
            alignItems: "stretch",
          }}
        >
          <Box sx={{ minWidth: 0, height: "100%" }}>
            <CashierOrderItemsCard
              itemsTree={itemsTree}
              itemsSummary={onlineOrder?.products_summary || null}
              selectedCheck={selectedCheck}
            />
          </Box>

          <Stack spacing={3} sx={{ minWidth: 0, height: "100%" }}>
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
              disabled={!paymentAvailable || previewing || paying || postPaymentOpen}
            />
          </Stack>
        </Box>

        <CashierPaymentFormCard
            methods={onlinePaymentMethods}
            initialAmount={paymentInitialAmount}
            preview={preview}
            tip={tip}
            onTipChange={handleTipChange}
            payments={payments}
            onPaymentChange={handlePaymentChange}
            onPreview={handlePreview}
            previewing={previewing}
            paying={paying}
            hasPreview={Boolean(preview)}
            onPay={handlePay}
            disabled={!paymentAvailable || postPaymentOpen}
            maxPayments={1}
            showAddPayment={false}
            showRemovePayment={false}
            paymentMethodLocked={paymentMethodLocked}
            description="Registra el método de pago correspondiente a este Pedido en línea."
            helperText={
                paymentType === "terminal"
                ? "Este Pedido en línea permite un solo método de pago. Selecciona tarjeta de crédito o débito según corresponda."
                : "Este Pedido en línea permite un solo método de pago y fue definido al realizar el pedido."
            }
        />
      </Stack>

      <CashierSaleToolDialog
        open={activeTool === "discounts" && canManageDiscounts}
        onClose={() => setActiveTool(null)}
        title="Descuentos"
        subtitle="Aplica descuentos sobre los productos del pedido antes de preparar definitivamente el cobro."
        icon={<LocalOfferRoundedIcon />}
        maxWidth="lg"
      >
        <CashierDiscountCard
          sale={sale}
          orderCheckId={selectedCheckId}
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
          disabled={!canManageDiscounts || previewing || paying || postPaymentOpen}
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

      <CashierPostPaymentTicketModal
        open={postPaymentOpen}
        onContinue={handleReturnToMyOrders}
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
        sale={postPaymentSale || sale}
        order={postPaymentOrder}
        table={null}
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
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}