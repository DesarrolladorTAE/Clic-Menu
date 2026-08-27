import { useEffect, useMemo, useRef, useState } from "react";

import { prepareCashierSaleCheckPayment } from "../../../../../services/staff/casher/cashierSaleCheck.service";
import { payCashierSale, previewCashierSalePayment } from "../../../../../services/staff/casher/cashierPayment.service";

import {
  executeCashierNetpayPayment,
  getCashierNetpayError,
  getCashierPendingNetpayOperation,
  previewCashierNetpayPayment,
  resumeCashierPendingNetpayOperation,
} from "../../../../../services/staff/casher/cashierNetpayPayment.service";

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
  const [netpayPending, setNetpayPending] = useState(false);
  const [netpayStatus, setNetpayStatus] = useState(null);

  const resumeAttemptRef = useRef(null);

  const paymentType = String(onlineOrder?.payment_type || "").toLowerCase();
  const isNetpayPayment = paymentType === "terminal";

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

  const financialLocked =
    previewing ||
    paying ||
    (isNetpayPayment && netpayPending);

  const netpayLocked =
    isNetpayPayment &&
    (previewing || paying || netpayPending);

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

  const handleTipChange = (value) => {
    if (financialLocked) return;

    setTip(value);
    setPreview(null);

    const parsed = value === "" ? 0 : Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return;

    syncSinglePaymentAmount(sale, parsed);
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
        message:
          "Existe una operación NetPay sin resolver. Debe recuperarse antes de iniciar otro cobro.",
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

  const handleResolvedNetpayOutcome = async (result, { fromResume = false } = {}) => {
    const outcome = String(result?.outcome || "").toLowerCase();

    if (outcome === "finalized") {
      await finishNetpayPayment(result);
      return;
    }

    if ([
      "pending_recovery",
      "pending_reversal",
      "recovery_pending_local",
      "operation_pending_local",
      "approved_local_error",
      "different_sale",
    ].includes(outcome)) {
      setNetpayPending(true);
      paymentInProgressRef.current = true;

      const message =
        outcome === "different_sale"
          ? "La terminal PAX tiene otra operación NetPay pendiente. Debe resolverse antes de iniciar este cobro."
          : outcome === "pending_reversal"
          ? "NetPay reportó un reverso pendiente. No se iniciará otro cobro hasta resolverlo."
          : "La operación NetPay permanece pendiente y debe resolverse antes de iniciar otro cobro.";

      showAlert({
        severity: "warning",
        title: "Operación NetPay pendiente",
        message,
      });

      return;
    }

    setNetpayPending(false);
    paymentInProgressRef.current = false;
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
        severity: "warning",
        title: "Operación reversada",
        message: "NetPay confirmó que la operación fue reversada.",
      });
      return;
    }

    if (outcome === "no_record") {
      showAlert({
        severity: "warning",
        title: "Operación no encontrada",
        message:
          "NetPay no encontró registro bancario para el folio. El cobro no quedó aplicado.",
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

  const detectLocalPendingOperation = () => {
    try {
      const pending = getCashierPendingNetpayOperation();

      if (pending?.hasPendingOperation) {
        setNetpayPending(true);
        paymentInProgressRef.current = true;
        return true;
      }
    } catch (error) {
      console.error("No se pudo consultar la operación NetPay pendiente.", error);
    }

    return false;
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
        message: "No puedes iniciar otro cobro hasta resolver la operación NetPay pendiente.",
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
        const hasPending = detectLocalPendingOperation();

        if (netpayError.bankApproved || hasPending) {
          setNetpayPending(true);
          paymentInProgressRef.current = true;

          showAlert({
            severity: "warning",
            title: netpayError.bankApproved
              ? "Pago aprobado pendiente de finalizar"
              : "Operación NetPay pendiente",
            message: netpayError.bankApproved
              ? "El banco aprobó el cobro, pero Clic Menu todavía debe resolver su finalización local. No inicies otro cobro."
              : netpayError.message,
          });

          return;
        }

        paymentInProgressRef.current = false;

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
      if (!netpayPending && !paymentCompletedRef.current) {
        paymentInProgressRef.current = false;
      }

      setPaying(false);
    }
  };

  useEffect(() => {
    if (!isNetpayPayment || !selectedSaleId || paymentCompletedRef.current) return;

    const resumeKey = `${selectedSaleId}`;

    if (resumeAttemptRef.current === resumeKey) return;
    resumeAttemptRef.current = resumeKey;

    let cancelled = false;

    const resume = async () => {
      try {
        const pending = getCashierPendingNetpayOperation();

        if (!pending?.hasPendingOperation) {
          if (!cancelled) {
            setNetpayPending(false);
            paymentInProgressRef.current = false;
          }
          return;
        }

        if (cancelled) return;

        setNetpayPending(true);
        paymentInProgressRef.current = true;

        const result = await resumeCashierPendingNetpayOperation({
          saleId: selectedSaleId,
          onStatus: handleNetpayStatus,
        });

        if (cancelled) return;

        await handleResolvedNetpayOutcome(result, { fromResume: true });
      } catch (error) {
        if (cancelled) return;

        const netpayError = getCashierNetpayError(error);
        const stillPending = detectLocalPendingOperation();

        if (stillPending || netpayError.bankApproved) {
          setNetpayPending(true);
          paymentInProgressRef.current = true;

          showAlert({
            severity: "warning",
            title: "Operación NetPay pendiente",
            message:
              netpayError.message ||
              "Existe una operación NetPay pendiente que debe resolverse antes de continuar.",
          });
          return;
        }

        setNetpayPending(false);
        paymentInProgressRef.current = false;
      }
    };

    resume();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNetpayPayment, selectedSaleId]);

  return {
    paymentType,
    isNetpayPayment,
    selectedPaymentMethod,
    normalizedPayload,

    previewing,
    paying,
    netpayPending,
    netpayStatus,
    netpayLocked,
    financialLocked,

    handleTipChange,
    handlePaymentChange,
    handlePreview,
    handlePay,
  };
}