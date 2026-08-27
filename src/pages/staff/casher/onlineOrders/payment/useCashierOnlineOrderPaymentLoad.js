import { useEffect, useRef, useState } from "react";
import echo from "../../../../../realtime/echo";

import { fetchCashierOnlineOrderDetail } from "../../../../../services/staff/casher/onlineOrders/cashierOnlineOrders.service";
import {
  fetchCashierPaymentMethods,
  fetchCashierTaxOptions,
} from "../../../../../services/staff/casher/cashierPayment.service";

import {
  MY_ONLINE_ORDERS_PATH,
  PAYMENT_ACTIONS,
  POLL_INTERVAL,
  buildDefaultTaxCode,
  buildFinancialCheck,
  buildFinancialSale,
  createPageError,
  filterOnlinePaymentMethods,
  formatPaymentAmountValue,
  numberOrNull,
  paymentTotalForSale,
  pickCode,
  pickErr,
  resolveInitialOnlinePaymentMethodId,
  resolveOnlineOrderPayload,
  toArray,
} from "./cashierOnlineOrderPayment.utils";

export default function useCashierOnlineOrderPaymentLoad({
  onlineOrderId,
  nav,
  clearStaff,
  showAlert,
}) {
  const [loading, setLoading] = useState(true);
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

  const pollRef = useRef(null);
  const wsRefreshFastRef = useRef(null);
  const wsRefreshSlowRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const loadingRequestRef = useRef(false);
  const paymentInProgressRef = useRef(false);
  const paymentCompletedRef = useRef(false);
  const paymentLocalIdRef = useRef(1);

  const targetOnlineOrderId = numberOrNull(onlineOrderId);
  const selectedSaleId = numberOrNull(sale?.sale_id ?? sale?.id);
  const selectedCheckId = numberOrNull(selectedCheck?.id ?? selectedCheck?.order_check_id);
  const branchId = Number(onlineOrder?.meta?.branch_id || 0);

  const createEmptyPayment = () => ({
    localId: `online-payment-${paymentLocalIdRef.current++}`,
    payment_method_id: "",
    amount: "",
    reference: "",
    last4: "",
    received: "",
  });

  const goToMyOrders = ({ replace = false } = {}) => {
    nav(MY_ONLINE_ORDERS_PATH, { replace });
  };

  const scheduleReturnToMyOrders = () => {
    if (redirectTimerRef.current) return;

    redirectTimerRef.current = setTimeout(() => {
      nav(MY_ONLINE_ORDERS_PATH, { replace: true });
    }, 3000);
  };

  const stopLiveRefresh = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
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
      const initialMethodId = resolveInitialOnlinePaymentMethodId(loadedOnlineOrder, methods);

      setTip(String(initialTip));
      setPayments([{
        ...createEmptyPayment(),
        payment_method_id: initialMethodId,
        amount: total && total > 0 ? formatPaymentAmountValue(total) : "",
      }]);

      setPreview(null);
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

      applyOnlineOrderSnapshot(loadedOnlineOrder, { preserveForm: false, methods });

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
    paymentCompletedRef.current = false;
    paymentInProgressRef.current = false;

    load({ silent: false, preserveForm: false });

    pollRef.current = setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        !paymentInProgressRef.current &&
        !paymentCompletedRef.current
      ) {
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
    if (!branchId) return undefined;

    const channelName = `branch.${branchId}.cashier`;

    const scheduleRefresh = () => {
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
      if (wsRefreshSlowRef.current) clearTimeout(wsRefreshSlowRef.current);

      wsRefreshFastRef.current = setTimeout(() => {
        if (paymentInProgressRef.current || paymentCompletedRef.current) return;
        load({ silent: true, preserveForm: true });
      }, 120);

      wsRefreshSlowRef.current = setTimeout(() => {
        if (paymentInProgressRef.current || paymentCompletedRef.current) return;
        load({ silent: true, preserveForm: true });
      }, 900);
    };

    const handleCashierQueueUpdated = (payload = {}) => {
      const eventBranchId = Number(payload?.branch_id || 0);
      if (!eventBranchId || eventBranchId !== branchId) return;
      if (paymentInProgressRef.current || paymentCompletedRef.current) return;

      const eventSaleId = Number(payload?.sale_id || 0);
      if (eventSaleId && selectedSaleId && eventSaleId !== selectedSaleId) return;

      scheduleRefresh();
    };

    echo.private(channelName).listen(".cashier.queue.updated", handleCashierQueueUpdated);

    return () => {
      if (wsRefreshFastRef.current) {
        clearTimeout(wsRefreshFastRef.current);
        wsRefreshFastRef.current = null;
      }

      if (wsRefreshSlowRef.current) {
        clearTimeout(wsRefreshSlowRef.current);
        wsRefreshSlowRef.current = null;
      }

      echo.leaveChannel(channelName);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, selectedSaleId]);

  return {
    loading,
    onlineOrder,
    setOnlineOrder,
    selectedCheck,
    setSelectedCheck,
    sale,
    setSale,
    cashSession,
    itemsTree,

    paymentMethods,
    taxOptions,
    taxOptionCode,
    setTaxOptionCode,
    tip,
    setTip,
    payments,
    setPayments,
    preview,
    setPreview,

    targetOnlineOrderId,
    selectedSaleId,
    selectedCheckId,
    branchId,

    paymentInProgressRef,
    paymentCompletedRef,

    goToMyOrders,
    stopLiveRefresh,
    syncSinglePaymentAmount,
    refreshOnlineOrderSnapshot,
    load,
  };
}
