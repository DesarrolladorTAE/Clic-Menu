import { useEffect, useMemo, useRef, useState } from "react";

import { prepareCashierSaleCheckPayment } from "../../../../../services/staff/casher/cashierSaleCheck.service";
import { payCashierSale, previewCashierSalePayment } from "../../../../../services/staff/casher/cashierPayment.service";

import {
  executeCashierNetpayPayment,
  getCashierNetpayError,
  getCashierPendingNetpayOperation,
  getCashierUnresolvedNetpayPayment,
  previewCashierNetpayPayment,
  resumeCashierPendingNetpayOperation,
  resumeCashierUnresolvedNetpayPayment,
} from "../../../../../services/staff/casher/cashierNetpayPayment.service";

import { isNetpayBridgeAvailable } from "../../../../../services/native/netpayBridge.service";

import {
  createPageError,
  formatPaymentAmountValue,
  paymentTotalForSale,
  pickCode,
  pickErr,
  toArray,
} from "./cashierOnlineOrderPayment.utils";

const TERMINAL_METHOD_CODES = ["credit_card", "debit_card"];

export default function useCashierOnlineOrderPaymentFlow({
  onlineOrder,
  selectedCheck,
  selectedSaleId,
  selectedCheckId,
  sale,
  setSale,
  paymentMethods,
  taxOptionCode,
  tip,
  setTip,
  payments,
  setPayments,
  preview,
  setPreview,
  paymentAvailable,
  refreshOnlineOrderSnapshot,
  syncSinglePaymentAmount,
  paymentInProgressRef,
  paymentCompletedRef,
  stopLiveRefresh,
  setActiveTool,
  showAlert,
  openNormalPaymentResult,
  openNetpayPaymentResult,
}) {
  const [previewing, setPreviewing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [netpayMode, setNetpayMode] = useState(false);
  const [netpayPending, setNetpayPending] = useState(false);
  const [netpayDevicePending, setNetpayDevicePending] = useState(false);
  const [netpayRecoveryAvailable, setNetpayRecoveryAvailable] = useState(false);
  const [netpayPendingMessage, setNetpayPendingMessage] = useState("");
  const [netpayStatus, setNetpayStatus] = useState(null);
  const [netpayTerminal, setNetpayTerminal] = useState(null);

  const resumeAttemptRef = useRef(null);

  const paymentType = String(onlineOrder?.payment_type || "").toLowerCase();
  const isTerminalPayment = paymentType === "terminal";
  const netpayBridgeAvailable = isNetpayBridgeAvailable();
  const isNetpayPayment = isTerminalPayment && netpayMode;

  const selectedPaymentMethod = useMemo(() => {
    if (payments.length !== 1) return null;

    return paymentMethods.find(
      (candidate) => Number(candidate?.id) === Number(payments[0]?.payment_method_id || 0)
    ) || null;
  }, [paymentMethods, payments]);

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
            row?.received === "" ||
            row?.received === null ||
            row?.received === undefined
              ? null
              : Number(row.received);
        }

        return payment;
      }),
    };
  }, [paymentMethods, payments, taxOptionCode, tip]);

  const financialLocked = previewing || paying || netpayPending || (isNetpayPayment && netpayDevicePending);

  const netpayLocked = isNetpayPayment && (previewing || paying || netpayPending || netpayDevicePending);

  const handleNetpayStatus = ({ status, data }) => {
    setNetpayStatus({ status, data });

    const bankingStates = [
      "resolving_terminal",
      "creating_intent",
      "starting_sale",
      "waiting_sale_result",
      "sending_sale_result",
      "requesting_recovery",
      "starting_recovery",
      "waiting_recovery_result",
      "sending_recovery_result",
      "finalizing",
      "recovery_required",
      "resuming_pending_operation",
    ];

    if (bankingStates.includes(status)) paymentInProgressRef.current = true;
  };

  const readLocalNetpayPendingOperation = () => {
    try {
      const pending = getCashierPendingNetpayOperation();
      const operation = pending?.hasPendingOperation ? pending?.operation || null : null;

      return {
        hasPendingOperation: Boolean(pending?.hasPendingOperation && operation),
        operation,
        sameSale: Boolean(operation?.saleId && operation.saleId === Number(selectedSaleId)),
      };
    } catch (error) {
      console.error("No se pudo consultar la operación NetPay pendiente.", error);
      return { hasPendingOperation: false, operation: null, sameSale: false };
    }
  };

  const syncLocalNetpayPendingOperation = () => {
    const pending = readLocalNetpayPendingOperation();
    setNetpayDevicePending(pending.hasPendingOperation);
    paymentInProgressRef.current = pending.hasPendingOperation;
    return pending;
  };

  const handleTipChange = (value) => {
    if (financialLocked) return;

    setTip(value);
    setPreview(null);

    const parsed = value === "" ? 0 : Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return;

    syncSinglePaymentAmount(sale, parsed);
  };

  const handleNetpayModeChange = (enabled) => {
    if (!isTerminalPayment || previewing || paying || netpayPending) return;

    const next = Boolean(enabled);

    if (next && !netpayBridgeAvailable) {
      showAlert({
        severity: "warning",
        title: "NetPay",
        message: "NetPay solamente está disponible desde una terminal PAX compatible.",
      });
      return;
    }

    if (!next) {
      setNetpayMode(false);
      setNetpayStatus(null);
      setNetpayTerminal(null);
      setPreview(null);
      return;
    }

    const currentCode = String(selectedPaymentMethod?.code || "").toLowerCase();

    const cardMethod = TERMINAL_METHOD_CODES.includes(currentCode)
      ? selectedPaymentMethod
      : paymentMethods.find((method) =>
          TERMINAL_METHOD_CODES.includes(String(method?.code || "").toLowerCase())
        );

    if (!cardMethod) {
      showAlert({
        severity: "warning",
        message: "No hay un método Crédito o Débito activo para utilizar NetPay.",
      });
      return;
    }

    const expectedTotal = paymentTotalForSale(sale, tip);

    setPayments((previous) => {
      if (!Array.isArray(previous) || previous.length !== 1) return previous;

      return [{
        ...previous[0],
        payment_method_id: String(cardMethod.id),
        amount: expectedTotal !== null
          ? formatPaymentAmountValue(expectedTotal)
          : previous[0].amount,
        reference: "",
        last4: "",
        received: "",
      }];
    });

    setNetpayMode(true);
    setNetpayStatus(null);
    setNetpayTerminal(null);
    setPreview(null);
  };

  const handlePaymentChange = (localId, field, value) => {
    if (financialLocked) return;

    setPayments((previous) =>
      previous.map((row) => {
        if (row.localId !== localId) return row;

        const next = { ...row, [field]: value };

        if (field === "payment_method_id") {
          const method = paymentMethods.find(
            (candidate) => Number(candidate?.id) === Number(value || 0)
          );

          if (isNetpayPayment) {
            next.reference = "";
            next.last4 = "";
            next.received = "";
          } else {
            if (!method?.requires_reference) next.reference = "";
            if (!method?.requires_last4) next.last4 = "";
            if (!method?.requires_received_amount) next.received = "";
          }
        }

        if (field === "last4") {
          next.last4 = String(value || "").replace(/\D/g, "").slice(0, 4);
        }

        return next;
      })
    );

    setPreview(null);
  };

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

    if (netpayPending) {
      showAlert({
        severity: "warning",
        title: "Operación NetPay pendiente",
        message: "Esta cuenta tiene una operación NetPay financieramente pendiente y debe resolverse antes de cobrarla nuevamente.",
      });
      return false;
    }

    if (isNetpayPayment && netpayDevicePending) {
      showAlert({
        severity: "warning",
        title: "Terminal NetPay ocupada",
        message: "La terminal PAX conserva una operación NetPay pendiente. Finalízala antes de iniciar otra operación NetPay.",
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

    if (isNetpayPayment) {
      const methodCode = String(method?.code || "").toLowerCase();

      if (!TERMINAL_METHOD_CODES.includes(methodCode)) {
        showAlert({
          severity: "warning",
          message: "NetPay solamente puede iniciarse con tarjeta de Crédito o Débito.",
        });
        return false;
      }

      return true;
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
    const currentCheckStatus = String(
      onlineOrder?.order_check_status || selectedCheck?.status || ""
    ).toLowerCase();

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

  const handleNormalPreview = async () => {
    await ensurePreparedForPayment();

    const response = await previewCashierSalePayment(selectedSaleId, normalizedPayload);
    setPreview(response?.data?.preview || null);

    showAlert({
      severity: "success",
      message: response?.message || "Vista previa de cobro generada.",
    });
  };

  const handleNetpayPreview = async () => {
    await ensurePreparedForPayment();

    const result = await previewCashierNetpayPayment({
      saleId: selectedSaleId,
      requestedPaymentMethodId: selectedPaymentMethod?.id,
      tip: Number(tip || 0),
      taxOptionCode,
    });

    const netpayPreview = result?.preview || null;
    setNetpayTerminal(result?.terminal || null);

    if (!netpayPreview?.preview_valid) {
      throw createPageError(
        "NETPAY_PREVIEW_INVALID",
        "Backend no confirmó una vista previa NetPay válida."
      );
    }

    setPreview({
      ...netpayPreview,
      preview_type: "netpay",
    });

    const expectedTotal = Number(netpayPreview?.expected_total);

    if (Number.isFinite(expectedTotal) && expectedTotal > 0) {
      setPayments((previous) => {
        if (!Array.isArray(previous) || previous.length !== 1) return previous;

        return [{
          ...previous[0],
          amount: formatPaymentAmountValue(expectedTotal),
          reference: "",
          last4: "",
          received: "",
        }];
      });
    }

    showAlert({
      severity: "success",
      message: result?.response?.message || "Vista previa NetPay generada correctamente.",
    });
  };

  const handlePreview = async () => {
    if (!validateBeforePreview()) return;

    try {
      setPreviewing(true);

      if (isNetpayPayment) await handleNetpayPreview();
      else await handleNormalPreview();
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
        message: pickErr(
          error,
          isNetpayPayment
            ? "No se pudo generar la vista previa NetPay."
            : "No se pudo generar la vista previa del cobro."
        ),
      });
    } finally {
      setPreviewing(false);
    }
  };

  const markPaymentCompleted = () => {
    paymentCompletedRef.current = true;
    paymentInProgressRef.current = false;
    setNetpayPending(false);
    setNetpayDevicePending(false);
    setNetpayRecoveryAvailable(false);
    setNetpayPendingMessage("");
    stopLiveRefresh();
  };

  const applyNormalPaidSale = (paidSale) => {
    if (!paidSale) return;

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
  };

  const finishNormalPayment = async (response) => {
    const result = await openNormalPaymentResult(response);

    markPaymentCompleted();
    applyNormalPaidSale(result?.paidSale);

    setPreview(null);
    setActiveTool(null);

    showAlert({
      severity: "success",
      message: response?.message || "Venta cobrada correctamente.",
    });
  };

  const finishNetpayPayment = async (result) => {
    const postPayment = await openNetpayPaymentResult({
      result,
      sale,
    });

    markPaymentCompleted();

    if (postPayment?.paidSale) {
      setSale((previous) => ({
        ...(previous || {}),
        ...postPayment.paidSale,
      }));
    }

    setPreview(null);
    setActiveTool(null);

    showAlert({
      severity: "success",
      message:
        result?.backendResponse?.message ||
        "NetPay aprobó el cobro y la venta fue finalizada correctamente.",
    });
  };

  const resolveNetpayPendingMessage = (result, localPending = null) => {
    const outcome = String(result?.outcome || "").toLowerCase();
    const recoveryAvailable = result?.recoveryAvailable === true || result?.requiresRecovery === true;

    if (outcome === "pending_reversal") {
      if (recoveryAvailable) {
        return "La transacción necesaria para detonar el reverso ya fue completada en esta PAX. Ya puedes recuperar nuevamente la operación NetPay pendiente.";
      }

      if (localPending?.hasPendingOperation) {
        return "NetPay confirmó un reverso pendiente. La cuenta seguirá bloqueada y la terminal todavía conserva una operación local pendiente.";
      }

      return "NetPay confirmó un reverso pendiente. La cuenta seguirá bloqueada, pero la PAX está libre. Realiza otra transacción NetPay en esta misma terminal y después vuelve a este pedido.";
    }

    if (outcome === "pending_recovery") {
      return recoveryAvailable
        ? "La operación NetPay está pendiente y ya puede recuperarse por folio."
        : "La operación NetPay todavía necesita resolverse antes de continuar.";
    }

    if (outcome === "approved_local_error") {
      return "El banco aprobó el cobro, pero Clic Menu todavía no pudo finalizarlo localmente.";
    }

    if (outcome === "recovery_pending_local") {
      return "La recuperación NetPay sigue pendiente localmente en la terminal PAX.";
    }

    if (outcome === "operation_pending_local") {
      return "La terminal PAX conserva esta operación NetPay pendiente.";
    }

    return "La operación NetPay permanece pendiente y esta cuenta seguirá bloqueada hasta resolverla.";
  };

  const handleResolvedNetpayOutcome = async (result, { fromResume = false } = {}) => {
    const outcome = String(result?.outcome || "").toLowerCase();

    if (outcome === "finalized") {
      await finishNetpayPayment(result);
      return;
    }

    const localPending = syncLocalNetpayPendingOperation();

    if (outcome === "different_sale") {
      setNetpayPending(false);
      setNetpayRecoveryAvailable(false);
      setNetpayPendingMessage("");
      setPreview(null);

      showAlert({
        severity: "warning",
        title: "Terminal NetPay ocupada",
        message: localPending.operation?.saleId
          ? `La terminal PAX conserva una operación pendiente de la venta ${localPending.operation.saleId}. Finaliza primero esa operación.`
          : "La terminal PAX conserva otra operación NetPay pendiente.",
      });

      return;
    }

    if ([
      "pending_recovery",
      "pending_reversal",
      "recovery_pending_local",
      "operation_pending_local",
      "approved_local_error",
      "pending",
    ].includes(outcome)) {
      const recoveryAvailable =
        result?.recoveryAvailable === true ||
        result?.requiresRecovery === true;

      const message = resolveNetpayPendingMessage({
        ...result,
        recoveryAvailable,
      }, localPending);

      setNetpayPending(true);
      setNetpayRecoveryAvailable(recoveryAvailable);
      setNetpayPendingMessage(message);
      setPreview(null);

      showAlert({
        severity: "warning",
        title: "Operación NetPay pendiente",
        message,
      });

      return;
    }

    setNetpayPending(false);
    setNetpayRecoveryAvailable(false);
    setNetpayPendingMessage("");
    setPreview(null);

    if (outcome === "declined") {
      showAlert({
        severity: "warning",
        title: "Pago declinado",
        message: "NetPay declinó la operación. Puedes volver a intentar el cobro.",
      });
      return;
    }

    if (outcome === "user_cancelled") {
      showAlert({
        severity: "info",
        title: "Cobro cancelado",
        message: "La operación NetPay fue cancelada antes de completarse.",
      });
      return;
    }

    if (outcome === "cancelled") {
      showAlert({
        severity: "warning",
        title: "Operación cancelada",
        message: "La recuperación confirmó que la operación NetPay está cancelada.",
      });
      return;
    }

    if (outcome === "reversed") {
      showAlert({
        severity: "info",
        title: "Operación reversada",
        message: "NetPay confirmó que la operación fue reversada. Esta cuenta ya no conserva un cobro bancario pendiente.",
      });
      return;
    }

    if (outcome === "no_record") {
      showAlert({
        severity: "warning",
        title: "Operación no encontrada",
        message: "NetPay no encontró registro bancario para el folio. El cobro no quedó aplicado.",
      });
      return;
    }

    if (outcome === "not_sent") {
      showAlert({
        severity: "warning",
        title: "Cobro no enviado",
        message: "La operación no llegó a enviarse al banco. Puedes intentar nuevamente.",
      });
      return;
    }

    if (!fromResume) {
      showAlert({
        severity: "warning",
        message: "NetPay terminó en un estado que requiere revisar la operación antes de continuar.",
      });
    }
  };

  const handleNormalPay = async () => {
    await ensurePreparedForPayment();

    const response = await payCashierSale(selectedSaleId, normalizedPayload);
    await finishNormalPayment(response);
  };

  const handleNetpayPay = async () => {
    await ensurePreparedForPayment();

    const result = await executeCashierNetpayPayment({
      saleId: selectedSaleId,
      requestedPaymentMethodId: selectedPaymentMethod?.id,
      tip: Number(tip || 0),
      taxOptionCode,
      onStatus: handleNetpayStatus,
    });

    await handleResolvedNetpayOutcome(result);
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

    if (isNetpayPayment && !preview?.preview_valid) {
      showAlert({
        severity: "warning",
        message: "Primero genera una vista previa NetPay válida.",
      });
      return;
    }

    if (isNetpayPayment && netpayPending) {
      showAlert({
        severity: "warning",
        title: "Operación NetPay pendiente",
        message: "Esta cuenta tiene una operación NetPay financieramente pendiente. Debes resolverla antes de volver a cobrar esta misma cuenta.",
      });
      return;
    }

    if (isNetpayPayment && netpayDevicePending) {
      showAlert({
        severity: "warning",
        title: "Terminal NetPay ocupada",
        message: "La terminal PAX conserva una operación NetPay pendiente. Finalízala antes de iniciar otro cobro NetPay.",
      });
      return;
    }

    try {
      setPaying(true);
      paymentInProgressRef.current = true;

      if (isNetpayPayment) await handleNetpayPay();
      else await handleNormalPay();
    } catch (error) {
      if (isNetpayPayment) {
        const netpayError = getCashierNetpayError(error);
        const localPending = syncLocalNetpayPendingOperation();

        let unresolved = null;

        try {
          unresolved = await getCashierUnresolvedNetpayPayment({ saleId: selectedSaleId });
        } catch {
          // El error original del cobro conserva prioridad.
        }

        if (unresolved?.financiallyUnresolved || netpayError.bankApproved) {
          setNetpayPending(true);

          if (unresolved?.financiallyUnresolved) {
            const recoveryAvailable = unresolved?.recoveryAvailable === true;

            setNetpayRecoveryAvailable(recoveryAvailable);
            setNetpayPendingMessage(
              resolveNetpayPendingMessage({
                outcome: unresolved.outcome,
                financiallyUnresolved: true,
                recoveryAvailable,
                recoveryReason: unresolved.recoveryReason,
              }, localPending)
            );
          }
        }

        if (localPending.hasPendingOperation || unresolved?.financiallyUnresolved || netpayError.bankApproved) {
          showAlert({
            severity: "warning",
            title: netpayError.bankApproved
              ? "Pago aprobado pendiente de finalizar"
              : "Operación NetPay pendiente",
            message: netpayError.bankApproved
              ? "El banco aprobó el cobro, pero Clic Menu todavía debe resolver su finalización local."
              : netpayError.message,
          });

          return;
        }

        showAlert({
          severity: "error",
          message: netpayError.message,
        });

        return;
      }

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
      if (!paymentCompletedRef.current) {
        const localPending = readLocalNetpayPendingOperation();
        setNetpayDevicePending(localPending.hasPendingOperation);
        paymentInProgressRef.current = localPending.hasPendingOperation;
      }

      setPaying(false);
    }
  };

  const retryPendingNetpayRecovery = async () => {
    if (!selectedSaleId || paying) return;

    try {
      setPaying(true);

      const localPending = readLocalNetpayPendingOperation();
      let result;

      if (localPending.hasPendingOperation) {
        if (!localPending.sameSale) {
          setNetpayDevicePending(true);
          paymentInProgressRef.current = true;

          showAlert({
            severity: "warning",
            title: "Terminal NetPay ocupada",
            message: localPending.operation?.saleId
              ? `La terminal PAX conserva una operación pendiente de la venta ${localPending.operation.saleId}. Finalízala primero.`
              : "La terminal PAX conserva otra operación NetPay pendiente.",
          });

          return;
        }

        result = await resumeCashierPendingNetpayOperation({
          saleId: selectedSaleId,
          onStatus: handleNetpayStatus,
        });
      } else {
        result = await resumeCashierUnresolvedNetpayPayment({
          saleId: selectedSaleId,
          onStatus: handleNetpayStatus,
        });
      }

      if (result?.outcome === "none") {
        setNetpayPending(false);
        setNetpayDevicePending(false);
        setNetpayRecoveryAvailable(false);
        setNetpayPendingMessage("");
        paymentInProgressRef.current = false;

        showAlert({
          severity: "info",
          title: "NetPay",
          message: "Esta cuenta ya no tiene una operación NetPay pendiente de resolución.",
        });

        return;
      }

      await handleResolvedNetpayOutcome(result);
    } catch (error) {
      const netpayError = getCashierNetpayError(error);
      const localPending = syncLocalNetpayPendingOperation();

      let unresolved = null;

      try {
        unresolved = await getCashierUnresolvedNetpayPayment({ saleId: selectedSaleId });
      } catch {
        // Conservamos el error original.
      }

      if (unresolved?.financiallyUnresolved) {
        const recoveryAvailable = unresolved?.recoveryAvailable === true;

        setNetpayPending(true);
        setNetpayRecoveryAvailable(recoveryAvailable);
        setNetpayPendingMessage(
          resolveNetpayPendingMessage({
            outcome: unresolved.outcome,
            financiallyUnresolved: true,
            recoveryAvailable,
            recoveryReason: unresolved.recoveryReason,
          }, localPending)
        );
      }

      showAlert({
        severity: localPending.hasPendingOperation || unresolved?.financiallyUnresolved ? "warning" : "error",
        title: "NetPay",
        message: netpayError.message,
      });
    } finally {
      if (!paymentCompletedRef.current) {
        const localPending = readLocalNetpayPendingOperation();
        setNetpayDevicePending(localPending.hasPendingOperation);
        paymentInProgressRef.current = localPending.hasPendingOperation;
      }

      setPaying(false);
      setNetpayStatus(null);
    }
  };

   useEffect(() => {
    setNetpayMode(false);
    setNetpayPending(false);
    setNetpayDevicePending(false);
    setNetpayRecoveryAvailable(false);
    setNetpayPendingMessage("");
    setNetpayStatus(null);
    setNetpayTerminal(null);
    resumeAttemptRef.current = null;
  }, [selectedSaleId]);

  useEffect(() => {
    if (
      !isTerminalPayment ||
      !netpayBridgeAvailable ||
      !selectedSaleId ||
      paymentCompletedRef.current
    ) {
      return;
    }

    const resumeKey = `${selectedSaleId}`;
    if (resumeAttemptRef.current === resumeKey) return;

    resumeAttemptRef.current = resumeKey;
    let cancelled = false;

    const resume = async () => {
      try {
        const localPending = readLocalNetpayPendingOperation();

        /*
         * Primero manda Android si conserva ESTA Sale.
         * El resultado durable debe entregarse antes de consultar otra cosa.
         */
        if (localPending.hasPendingOperation && localPending.sameSale) {
          if (cancelled) return;

          setNetpayMode(true);
          setNetpayPending(true);
          setNetpayDevicePending(true);
          setNetpayRecoveryAvailable(false);
          setNetpayPendingMessage("Esta cuenta conserva una operación NetPay local pendiente que Clic Menu está intentando resolver.");
          paymentInProgressRef.current = true;

          const operationType = String(localPending.operation?.operationType || "").toLowerCase();

          if (!["sale", "recovery"].includes(operationType)) {
            showAlert({
              severity: "warning",
              title: "Operación NetPay pendiente",
              message: "Esta cuenta conserva una operación NetPay local que debe resolverse desde su flujo correspondiente.",
            });

            return;
          }

          const result = await resumeCashierPendingNetpayOperation({
            saleId: selectedSaleId,
            onStatus: handleNetpayStatus,
          });

          if (cancelled) return;

          await handleResolvedNetpayOutcome(result, { fromResume: true });
          return;
        }

        /*
         * Si Android conserva otra Sale, la actual no adquiere un estado
         * financiero pendiente; solamente la PAX está ocupada.
         */
        if (localPending.hasPendingOperation && !localPending.sameSale) {
          if (cancelled) return;

          setNetpayDevicePending(true);
          paymentInProgressRef.current = true;

          showAlert({
            severity: "warning",
            title: "Terminal NetPay ocupada",
            message: localPending.operation?.saleId
              ? `La terminal PAX conserva una operación pendiente de la venta ${localPending.operation.saleId}.`
              : "La terminal PAX conserva otra operación NetPay pendiente.",
          });
        } else {
          setNetpayDevicePending(false);
          paymentInProgressRef.current = false;
        }

        /*
         * Aunque Android esté vacío, Backend puede conservar:
         * pending_recovery, pending_reversal o approved + local pendiente/error.
         */
        const unresolved = await getCashierUnresolvedNetpayPayment({
          saleId: selectedSaleId,
        });

        if (cancelled || !unresolved?.hasUnresolvedTransaction || !unresolved?.transaction) {
          if (!cancelled) {
            setNetpayPending(false);
            setNetpayRecoveryAvailable(false);
            setNetpayPendingMessage("");
          }

          return;
        }

        setNetpayMode(true);
        setNetpayPending(true);

        await handleResolvedNetpayOutcome({
          outcome: unresolved.outcome,
          financiallyUnresolved: unresolved.financiallyUnresolved,
          recoveryRequired: unresolved.recoveryRequired,
          recoveryAvailable: unresolved.recoveryAvailable,
          recoveryReason: unresolved.recoveryReason,
          triggerTransactionId: unresolved.triggerTransactionId,
          transaction: unresolved.transaction,
          backendResponse: unresolved.response,
        }, { fromResume: true });
      } catch (error) {
        if (cancelled) return;

        const netpayError = getCashierNetpayError(error);
        const localPending = syncLocalNetpayPendingOperation();

        let unresolved = null;

        try {
          unresolved = await getCashierUnresolvedNetpayPayment({ saleId: selectedSaleId });
        } catch {
          // La revisión Backend es secundaria respecto al error original.
        }

        if (unresolved?.financiallyUnresolved) {
          const recoveryAvailable = unresolved?.recoveryAvailable === true;

          setNetpayMode(true);
          setNetpayPending(true);
          setNetpayRecoveryAvailable(recoveryAvailable);
          setNetpayPendingMessage(
            resolveNetpayPendingMessage({
              outcome: unresolved.outcome,
              financiallyUnresolved: true,
              recoveryAvailable,
              recoveryReason: unresolved.recoveryReason,
            }, localPending)
          );
        }

        if (localPending.hasPendingOperation || unresolved?.financiallyUnresolved || netpayError.bankApproved) {
          showAlert({
            severity: "warning",
            title: "Operación NetPay pendiente",
            message: netpayError.message || "Existe una operación NetPay pendiente que debe resolverse antes de continuar.",
          });

          return;
        }

        setNetpayPending(false);
        setNetpayRecoveryAvailable(false);
        setNetpayPendingMessage("");
      }
    };

    resume();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTerminalPayment, netpayBridgeAvailable, selectedSaleId]);

  return {
    paymentType,
    isTerminalPayment,
    isNetpayPayment,
    netpayMode,
    netpayBridgeAvailable,
    netpayTerminal,
    selectedPaymentMethod,
    normalizedPayload,

    previewing,
    paying,
    netpayPending,
    netpayDevicePending,
    netpayRecoveryAvailable,
    netpayPendingMessage,
    netpayStatus,
    netpayLocked,
    financialLocked,

    handleTipChange,
    handleNetpayModeChange,
    handlePaymentChange,
    handlePreview,
    handlePay,
    retryPendingNetpayRecovery,
  };

}