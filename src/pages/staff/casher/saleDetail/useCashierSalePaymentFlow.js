// src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js

import { useEffect, useMemo, useRef, useState } from "react";

import {
  previewCashierSalePayment,
  payCashierSale,
  extractTicketFromPayResponse,
  extractTicketWarningFromPayResponse,
} from "../../../../services/staff/casher/cashierPayment.service";

import {
  prepareCashierSaleCheckPayment,
} from "../../../../services/staff/casher/cashierSaleCheck.service";

import {
  executeCashierNetpayPayment,
  getCashierNetpayError,
  getCashierPendingNetpayOperation,
  previewCashierNetpayPayment,
  recoverCashierNetpayPayment,
  resumeCashierPendingNetpayOperation,
} from "../../../../services/staff/casher/cashierNetpayPayment.service";

import {
  isNetpayBridgeAvailable,
} from "../../../../services/native/netpayBridge.service";

import {
  MY_SALES_PATH,
  checkIdOf,
  formatPaymentAmountValue,
  numberOrNull,
  toArray,
} from "./cashierSaleDetail.utils";

const NETPAY_STATUS_LABELS = {
  resolving_terminal: "Validando terminal NetPay…",
  creating_intent: "Preparando cobro NetPay…",
  starting_sale: "Enviando cobro a la terminal…",
  waiting_sale_result: "Esperando respuesta de la terminal…",
  sending_sale_result: "Procesando respuesta NetPay…",
  finalizing: "Finalizando cobro en Clic Menu…",
  requesting_recovery: "Preparando recuperación NetPay…",
  starting_recovery: "Consultando operación por folio…",
  waiting_recovery_result: "Esperando recuperación de NetPay…",
  sending_recovery_result: "Procesando recuperación NetPay…",
  recovery_required: "La operación requiere recuperación…",
  resuming_pending_operation: "Recuperando operación NetPay pendiente…",
  completed: "Operación NetPay completada.",
};

export default function useCashierSalePaymentFlow({
  nav,
  sale,
  selectedCheck,
  selectedCheckId,
  selectedSaleId,
  isLegacySale,
  canOperate,
  paymentMethods,
  taxOptionCode,
  setTaxOptionCode,
  tip,
  setTip,
  payments,
  setPayments,
  preview,
  setPreview,
  previewing,
  setPreviewing,
  paying,
  setPaying,
  localIdRef,
  setPreparedCheck,
  setSelectedCheck,
  setDetailData,
  setSettlement,
  setPostPaymentOpen,
  setPostPaymentTicket,
  setPostPaymentTicketWarning,
  setPostPaymentTicketErrorCode,
  setPostPaymentTicketErrorMessage,
  setPostPaymentSale,
  setPostPaymentOrder,
  setPostPaymentTable,
  setPostPaymentPayments,
  setPostPaymentPoints,
  loadPostPaymentPrintConfig,
  showAlert,
  pickErr,
  pickCode,
  pickData,
}) {
  const [previewMode, setPreviewMode] = useState(null);
  const [netpayMode, setNetpayMode] = useState(false);
  const [netpayBusy, setNetpayBusy] = useState(false);
  const [netpayStatus, setNetpayStatus] = useState("");
  const [netpayPendingBlocked, setNetpayPendingBlocked] = useState(false);
  const [netpayTerminal, setNetpayTerminal] = useState(null);

  const resumeSaleRef = useRef(null);
  const netpayBridgeAvailable = isNetpayBridgeAvailable();

  const clearPreviewMode = () => setPreviewMode(null);

  const createEmptyPayment = (methodId = "") => ({
    localId: `p-${localIdRef.current++}`,
    payment_method_id: methodId ? String(methodId) : "",
    amount: "",
    reference: "",
    last4: "",
    received: "",
  });

  const selectedPaymentMethod = useMemo(() => {
    if (payments.length !== 1) return null;

    return paymentMethods.find(
      (candidate) =>
        Number(candidate.id) ===
        Number(payments[0]?.payment_method_id || 0)
    ) || null;
  }, [paymentMethods, payments]);

  const isCardMethod = (method) => {
    return ["credit_card", "debit_card"].includes(
      String(method?.code || "").toLowerCase()
    );
  };

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

    return Math.round((accountNetAmount + liveTipAmount) * 100) / 100;
  }, [sale, tip]);

  const syncSinglePaymentAmountToSaleTotal = (nextTotal) => {
    const amount = Number(nextTotal || 0);
    if (!Number.isFinite(amount)) return;

    setPayments((prev) => {
      if (!Array.isArray(prev) || prev.length !== 1) return prev;

      return [{
        ...prev[0],
        amount: amount > 0 ? formatPaymentAmountValue(amount) : "",
      }];
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

  const clearPreview = () => {
    setPreview(null);
    setPreviewMode(null);
  };

  const handleTaxOptionChange = (nextValue) => {
    if (netpayBusy || netpayPendingBlocked) return;

    setTaxOptionCode(nextValue);
    clearPreview();
  };

  const handleTipChange = (value) => {
    if (netpayBusy || netpayPendingBlocked) return;

    setTip(value);
    clearPreview();

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
    if (netpayMode) {
      showAlert({
        severity: "warning",
        message: "NetPay solo permite un método de pago por operación.",
      });
      return;
    }

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

    clearPreview();
  };

  const handleRemovePayment = (localId) => {
    if (netpayMode) {
      showAlert({
        severity: "warning",
        message: "El cobro NetPay debe conservar un único método de pago.",
      });
      return;
    }

    setPayments((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((row) => row.localId !== localId);
    });

    clearPreview();
  };

  const handlePaymentChange = (localId, field, value) => {
    if (netpayBusy || netpayPendingBlocked) return;

    if (
      netpayMode &&
      ["amount", "reference", "last4", "received"].includes(field)
    ) {
      return;
    }

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

          if (netpayMode) {
            nextRow.reference = "";
            nextRow.last4 = "";
            nextRow.received = "";
          }
        }

        if (field === "last4") {
          nextRow.last4 = String(value || "")
            .replace(/\D/g, "")
            .slice(0, 4);
        }

        return nextRow;
      })
    );

    clearPreview();
  };

  const handleNetpayModeChange = (enabled) => {
    if (netpayBusy || netpayPendingBlocked) return;

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
      setNetpayTerminal(null);
      clearPreview();
      return;
    }

    const currentMethod = payments.length === 1
      ? paymentMethods.find(
          (row) =>
            Number(row.id) ===
            Number(payments[0]?.payment_method_id || 0)
        )
      : null;

    const cardMethod = isCardMethod(currentMethod)
      ? currentMethod
      : paymentMethods.find((row) => isCardMethod(row));

    if (!cardMethod) {
      showAlert({
        severity: "warning",
        message: "No hay un método Crédito o Débito activo para utilizar NetPay.",
      });
      return;
    }

    const currentRow = payments[0] || createEmptyPayment(cardMethod.id);

    setPayments([{
      ...currentRow,
      payment_method_id: String(cardMethod.id),
      amount: paymentInitialAmount !== null
        ? formatPaymentAmountValue(paymentInitialAmount)
        : "",
      reference: "",
      last4: "",
      received: "",
    }]);

    setNetpayMode(true);
    clearPreview();
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

  const validateBase = () => {
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
        message: "La cuenta exacta ya no está disponible para generar la vista previa.",
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

    return true;
  };

  const validateNormalPreview = () => {
    if (!validateBase()) return false;

    if (!payments.length || payments.length > 3) {
      showAlert({
        severity: "warning",
        message: payments.length > 3
          ? "Solo se permiten máximo 3 métodos de pago por cuenta."
          : "Debes agregar al menos un pago.",
      });
      return false;
    }

    const ids = normalizedPayload.payments.map(
      (row) => Number(row.payment_method_id)
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
          Number(candidate.id) === Number(row.payment_method_id || 0)
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
      const received = row.received === "" ? null : Number(row.received);

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
        message: "La suma de los pagos debe coincidir con el total actual de la cuenta.",
      });
      return false;
    }

    return true;
  };

  const validateNetpayPreview = () => {
    if (!validateBase()) return false;

    if (!netpayBridgeAvailable) {
      showAlert({
        severity: "warning",
        message: "La integración Android de NetPay no está disponible.",
      });
      return false;
    }

    if (payments.length !== 1) {
      showAlert({
        severity: "warning",
        message: "NetPay requiere exactamente un método de pago.",
      });
      return false;
    }

    if (!isCardMethod(selectedPaymentMethod)) {
      showAlert({
        severity: "warning",
        message: "NetPay solamente puede utilizar Crédito o Débito.",
      });
      return false;
    }

    const liveTip = Number(tip || 0);

    if (!Number.isFinite(liveTip) || liveTip < 0) {
      showAlert({
        severity: "warning",
        message: "La propina indicada no es válida.",
      });
      return false;
    }

    return true;
  };

  const ensurePreparedForPayment = async () => {
    if (isLegacySale) return null;

    if (!selectedCheckId) {
      throw new Error(
        "No se encontró el OrderCheck que debe prepararse."
      );
    }

    const currentStatus = String(selectedCheck?.status || "").toLowerCase();

    if (currentStatus === "paying") return null;

    const prepareRes =
      await prepareCashierSaleCheckPayment(selectedCheckId);

    const prepareData = prepareRes?.data || null;
    const preparedPayload = prepareData?.check || null;
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
      String(preparedPayload?.status || "").toLowerCase() !== "paying"
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

    return prepareData;
  };

  const handlePreview = async () => {
    if (netpayMode) {
      if (!validateNetpayPreview()) return;

      try {
        setPreviewing(true);
        setNetpayStatus("resolving_terminal");

        await ensurePreparedForPayment();

        const result = await previewCashierNetpayPayment({
          saleId: selectedSaleId,
          requestedPaymentMethodId: selectedPaymentMethod.id,
          tip: Number(tip || 0),
          taxOptionCode,
        });

        setNetpayTerminal(result?.terminal || null);
        setPreview(result?.preview || null);
        setPreviewMode("netpay");

        const expectedTotal = Number(result?.preview?.expected_total);

        if (Number.isFinite(expectedTotal)) {
          setPayments((prev) => {
            if (prev.length !== 1) return prev;

            return [{
              ...prev[0],
              amount: formatPaymentAmountValue(expectedTotal),
              reference: "",
              last4: "",
              received: "",
            }];
          });
        }

        showAlert({
          severity: "success",
          message:
            result?.response?.message ||
            "Vista previa NetPay generada correctamente.",
        });
      } catch (e) {
        clearPreview();

        showAlert({
          severity: "error",
          message: pickErr(
            e,
            "No se pudo validar la vista previa NetPay."
          ),
        });
      } finally {
        setPreviewing(false);
        setNetpayStatus("");
      }

      return;
    }

    if (!validateNormalPreview()) return;

    try {
      setPreviewing(true);

      const res = await previewCashierSalePayment(
        selectedSaleId,
        normalizedPayload
      );

      setPreview(res?.data?.preview || null);
      setPreviewMode("normal");

      showAlert({
        severity: "success",
        message:
          res?.message ||
          "Vista previa generada correctamente.",
      });
    } catch (e) {
      clearPreview();

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

  const applyNormalPaymentResult = async (res) => {
    const paidSaleData = res?.data?.sale || null;
    const paidOrderData = res?.data?.order || null;
    const paidTableData = res?.data?.table || null;
    const paidPayments = toArray(res?.data?.payments);
    const paidSettlement = res?.data?.settlement || null;
    const paidPoints = res?.data?.points || null;
    const ticketFromPay = extractTicketFromPayResponse(res);
    const ticketWarningData = extractTicketWarningFromPayResponse(res);

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
    setPostPaymentTicketWarning(ticketWarningData.ticketWarning);
    setPostPaymentTicketErrorCode(ticketWarningData.ticketErrorCode);
    setPostPaymentTicketErrorMessage(ticketWarningData.ticketErrorMessage);

    const currentSaleId = Number(
      paidSaleData?.id ||
      paidSaleData?.sale_id ||
      selectedSaleId
    );

    await loadPostPaymentPrintConfig(currentSaleId);

    clearPreview();

    showAlert({
      severity: "success",
      message:
        res?.message ||
        "La cuenta fue cobrada correctamente.",
    });

    setPostPaymentOpen(true);
  };

  const applyNetpayFinalization = async (result) => {
    const transaction = result?.transaction || null;
    const backendResponse = result?.backendResponse || null;
    const finalization = backendResponse?.finalization || null;
    const netpayTransactionId = numberOrNull(
      transaction?.netpay_transaction_id
    );

    const actualMethodCode =
      transaction?.detail?.card_type === "C"
        ? "credit_card"
        : transaction?.detail?.card_type === "D"
        ? "debit_card"
        : transaction?.requested_payment_method?.code || null;

    const actualMethod = paymentMethods.find(
      (method) => String(method?.code || "") === String(actualMethodCode || "")
    );

    const paidSaleData = {
      ...(sale || {}),
      id: finalization?.sale_id || sale?.id || selectedSaleId,
      sale_id: finalization?.sale_id || sale?.sale_id || sale?.id || selectedSaleId,
      netpay_transaction_id: netpayTransactionId,
      status: finalization?.sale_status || "paid",
      total: transaction?.expected_total ?? sale?.total,
      payable_total: transaction?.expected_total ?? sale?.payable_total,
      tip: transaction?.tip_requested ?? sale?.tip,
    };

    const paidPayments = [{
      payment_method_id: actualMethod?.id || null,
      method_code: actualMethodCode,
      method_name:
        actualMethod?.name ||
        transaction?.requested_payment_method?.name ||
        "Tarjeta",
      amount: Number(transaction?.expected_total || 0),
      reference: transaction?.result?.auth_code || null,
      last4: transaction?.detail?.last4 || null,
      received: null,
      change: 0,
    }];

    setSettlement(null);
    setPostPaymentSale(paidSaleData);
    setPostPaymentOrder(sale?.order || null);
    setPostPaymentTable(sale?.table || null);
    setPostPaymentPayments(paidPayments);
    setPostPaymentPoints(finalization?.points || null);
    setPostPaymentTicket(finalization?.ticket || null);
    setPostPaymentTicketWarning(Boolean(finalization?.ticket_warning));
    setPostPaymentTicketErrorCode(finalization?.ticket_error_code || null);
    setPostPaymentTicketErrorMessage(finalization?.ticket_error_message || null);

    setDetailData((prev) => {
      if (!prev?.sale) return prev;

      return {
        ...prev,
        sale: {
          ...prev.sale,
          ...paidSaleData,
        },
      };
    });

    await loadPostPaymentPrintConfig(
      Number(finalization?.sale_id || selectedSaleId)
    );

    clearPreview();
    setNetpayPendingBlocked(false);

    showAlert({
      severity: "success",
      title: "NetPay",
      message:
        backendResponse?.message ||
        "NetPay aprobó el cobro y la cuenta fue finalizada correctamente.",
    });

    setPostPaymentOpen(true);
  };

  const handleResolvedNetpayResult = async (result) => {
    if (result?.outcome === "finalized") {
      await applyNetpayFinalization(result);
      return true;
    }

    const messages = {
      declined: "NetPay rechazó la operación. Puedes intentar nuevamente.",
      user_cancelled: "La operación NetPay fue cancelada por el usuario.",
      cancelled: "La recuperación confirmó que la operación NetPay fue cancelada.",
      reversed: "La operación NetPay fue reversada.",
      no_record: "NetPay no encontró registro bancario para el folio. Puedes iniciar un nuevo intento.",
      not_sent: "La operación no llegó a enviarse al banco.",
      pending_reversal: "NetPay reportó un reverso pendiente. No inicies otro cobro hasta resolverlo.",
      pending_recovery: "La operación NetPay continúa pendiente de recuperación.",
      approved_local_error: "NetPay aprobó el cobro, pero Clic Menu todavía no pudo finalizarlo.",
    };

    const blocking = [
      "pending_reversal",
      "pending_recovery",
      "approved_local_error",
      "recovery_pending_local",
      "operation_pending_local",
    ].includes(result?.outcome);

    setNetpayPendingBlocked(blocking);
    clearPreview();

    showAlert({
      severity: blocking ? "error" : "warning",
      title: "NetPay",
      message:
        messages[result?.outcome] ||
        result?.backendResponse?.message ||
        "La operación NetPay terminó sin completar el cobro.",
    });

    return false;
  };

  const checkPendingOperation = () => {
    try {
      const pending = getCashierPendingNetpayOperation();

      if (
        pending?.hasPendingOperation &&
        pending?.operation?.saleId === Number(selectedSaleId)
      ) {
        setNetpayPendingBlocked(true);
        return pending.operation;
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleNormalPaymentError = (e) => {
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
      clearPreview();

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
      clearPreview();

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

      setTimeout(
        () => nav(MY_SALES_PATH, { replace: true }),
        600
      );

      return;
    }

    showAlert({
      severity: "error",
      message: pickErr(
        e,
        "No se pudo cobrar la cuenta."
      ),
    });
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

    if (netpayPendingBlocked) {
      showAlert({
        severity: "warning",
        title: "NetPay",
        message: "Existe una operación NetPay pendiente. Debes resolverla antes de iniciar otro cobro.",
      });
      return;
    }

    if (netpayMode) {
      if (previewMode !== "netpay" || !validateNetpayPreview()) return;

      try {
        setPaying(true);
        setNetpayBusy(true);

        await ensurePreparedForPayment();

        const result = await executeCashierNetpayPayment({
          saleId: selectedSaleId,
          requestedPaymentMethodId: selectedPaymentMethod.id,
          tip: Number(tip || 0),
          taxOptionCode,
          onStatus: ({ status, data }) => {
            setNetpayStatus(status);

            if (status === "resolving_terminal" && data?.netpay_terminal_id) {
              setNetpayTerminal(data);
            }
          },
        });

        await handleResolvedNetpayResult(result);
      } catch (e) {
        const netpayError = getCashierNetpayError(e);
        const pending = checkPendingOperation();

        if (pending || netpayError.bankApproved) {
          setNetpayPendingBlocked(true);
        }

        showAlert({
          severity: "error",
          title: "NetPay",
          message: netpayError.message,
        });
      } finally {
        setPaying(false);
        setNetpayBusy(false);
        setNetpayStatus("");
      }

      return;
    }

    if (previewMode !== "normal") {
      showAlert({
        severity: "warning",
        message: "Vuelve a generar la vista previa del cobro.",
      });
      return;
    }

    try {
      setPaying(true);
      await ensurePreparedForPayment();

      const res = await payCashierSale(
        selectedSaleId,
        normalizedPayload
      );

      await applyNormalPaymentResult(res);
    } catch (e) {
      handleNormalPaymentError(e);
    } finally {
      setPaying(false);
    }
  };

  const retryPendingNetpayRecovery = async () => {
    if (!selectedSaleId || netpayBusy) return;

    try {
      setNetpayBusy(true);
      setPaying(true);

      const pending = getCashierPendingNetpayOperation();
      const transactionId = pending?.operation?.netpayTransactionId;

      if (
        !pending?.hasPendingOperation ||
        pending?.operation?.saleId !== Number(selectedSaleId) ||
        !transactionId
      ) {
        setNetpayPendingBlocked(false);

        showAlert({
          severity: "info",
          title: "NetPay",
          message: "No existe una operación NetPay pendiente para esta cuenta.",
        });

        return;
      }

      let result;

      if (pending.operation.normalizedResult) {
        result = await resumeCashierPendingNetpayOperation({
          saleId: selectedSaleId,
          onStatus: ({ status }) => setNetpayStatus(status),
        });
      } else {
        const localState = String(pending.operation.localState || "").toLowerCase();

        if (localState === "result_pending_backend") {
          setNetpayPendingBlocked(true);

          showAlert({
            severity: "error",
            title: "NetPay",
            message:
              "Android conserva un resultado NetPay pendiente, pero Clic Menu no pudo interpretarlo. No se realizará otra recuperación hasta resolver ese resultado.",
          });

          return;
        }

        result = await recoverCashierNetpayPayment({
          saleId: selectedSaleId,
          netpayTransactionId: transactionId,
          onStatus: ({ status }) => setNetpayStatus(status),
        });
      }

      await handleResolvedNetpayResult(result);
    } catch (e) {
      const netpayError = getCashierNetpayError(e);
      setNetpayPendingBlocked(true);

      showAlert({
        severity: "error",
        title: "NetPay",
        message: netpayError.message,
      });
    } finally {
      setNetpayBusy(false);
      setPaying(false);
      setNetpayStatus("");
    }
  };

  useEffect(() => {
    setPreviewMode(null);
    setNetpayMode(false);
    setNetpayTerminal(null);
    setNetpayStatus("");
    setNetpayPendingBlocked(false);
    resumeSaleRef.current = null;
  }, [selectedSaleId]);

  useEffect(() => {
    if (
      !selectedSaleId ||
      !canOperate ||
      !netpayBridgeAvailable ||
      resumeSaleRef.current === Number(selectedSaleId)
    ) {
      return;
    }

    resumeSaleRef.current = Number(selectedSaleId);

    const resume = async () => {
      try {
        const pending = getCashierPendingNetpayOperation();

        if (
          !pending?.hasPendingOperation ||
          pending?.operation?.saleId !== Number(selectedSaleId)
        ) {
          return;
        }

        setNetpayMode(true);
        setNetpayPendingBlocked(true);
        setNetpayBusy(true);

        const result = await resumeCashierPendingNetpayOperation({
          saleId: selectedSaleId,
          onStatus: ({ status }) => setNetpayStatus(status),
        });

        if (result?.outcome === "different_sale" || result?.outcome === "none") {
          return;
        }

        await handleResolvedNetpayResult(result);
      } catch (e) {
        const netpayError = getCashierNetpayError(e);
        setNetpayPendingBlocked(true);

        showAlert({
          severity: "warning",
          title: "NetPay pendiente",
          message: netpayError.message,
        });
      } finally {
        setNetpayBusy(false);
        setNetpayStatus("");
      }
    };

    resume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSaleId, canOperate, netpayBridgeAvailable]);

  const financialLocked =
    netpayBusy ||
    netpayPendingBlocked;

  return {
    normalizedPayload,
    paymentInitialAmount,
    previewMode,
    netpayMode,
    netpayBridgeAvailable,
    netpayBusy,
    netpayStatus,
    netpayStatusLabel:
      NETPAY_STATUS_LABELS[netpayStatus] || "",
    netpayPendingBlocked,
    netpayTerminal,
    financialLocked,
    clearPreviewMode,
    syncSinglePaymentFromFinancialSale,
    handleTaxOptionChange,
    handleTipChange,
    handleAddPayment,
    handleRemovePayment,
    handlePaymentChange,
    handleNetpayModeChange,
    handlePreview,
    handlePay,
    retryPendingNetpayRecovery,
  };
}