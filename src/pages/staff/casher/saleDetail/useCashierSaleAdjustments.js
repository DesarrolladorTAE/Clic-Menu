// src/pages/staff/casher/saleDetail/useCashierSaleAdjustments.js

import { useEffect } from "react";

import {
  cancelCashierSaleItems,
  cancelCashierSaleOrder,
} from "../../../../services/staff/casher/cashierAdjustment.service";

import {
  fetchCashierOperationalAuthorizers,
} from "../../../../services/staff/casher/cashierOperationalAuthorizer.service";

import {
  MY_SALES_PATH,
  toArray,
} from "./cashierSaleDetail.utils";

const AUTHORIZATION_ERROR_CODES = new Set([
  "AUTORIZADOR_OPERATIVO_REQUERIDO",
  "PIN_AUTORIZADOR_OPERATIVO_REQUERIDO",
  "USUARIO_AUTORIZADOR_NO_ENCONTRADO",
  "USUARIO_AUTORIZADOR_INACTIVO",
  "AUTORIZADOR_OPERATIVO_NO_CONFIGURADO",
  "AUTORIZADOR_OPERATIVO_INACTIVO",
  "PIN_AUTORIZADOR_OPERATIVO_INVALIDO",
  "AUTOAUTORIZACION_OPERATIVA_NO_PERMITIDA",
  "OPERATIONAL_AUTHORIZATION_FAILED",
]);

export default function useCashierSaleAdjustments({
  nav,
  selectedSaleId,
  canManageAdjustments,
  isEqualPartsAccount,
  setPartialCancelForm,
  setPartialCancelDrafts,
  adjustmentBusy,
  setAdjustmentBusy,
  operationalAuthorizers,
  setOperationalAuthorizers,
  loadingOperationalAuthorizers,
  setLoadingOperationalAuthorizers,
  operationalAuthorizationError,
  setOperationalAuthorizationError,
  cancelDraftIdRef,
  setPreview,
  clearPreviewMode,
  load,
  financialLocked,
  showAlert,
  pickErr,
  pickCode,
}) {
  const ensureNotLocked = () => {
    if (!financialLocked) return true;

    showAlert({
      severity: "warning",
      message: "No puedes realizar correcciones mientras existe una operación NetPay en proceso o pendiente de resolución.",
    });

    return false;
  };

  const createEmptyPartialCancelDraft = () => ({
    localId: `c-${cancelDraftIdRef.current++}`,
    orderItemId: "",
    quantity: "",
  });

  const handlePartialFormChange = (field, value) => {
    setPartialCancelForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPartialDraft = () => {
    if (!ensureNotLocked()) return;
    setPartialCancelDrafts((prev) => [...prev, createEmptyPartialCancelDraft()]);
  };

  const handleRemovePartialDraft = (localId) => {
    if (!ensureNotLocked()) return;
    setPartialCancelDrafts((prev) => prev.filter((draft) => draft.localId !== localId));
  };

  const handlePartialDraftChange = (localId, field, value) => {
    if (!ensureNotLocked()) return;

    setPartialCancelDrafts((prev) =>
      prev.map((draft) =>
        draft.localId === localId ? { ...draft, [field]: value } : draft
      )
    );
  };

  const loadOperationalAuthorizers = async () => {
    try {
      setLoadingOperationalAuthorizers(true);
      setOperationalAuthorizationError("");

      const res = await fetchCashierOperationalAuthorizers();
      const rows = toArray(res?.data?.authorizers || res?.data);
      setOperationalAuthorizers(rows);

      if (!rows.length) {
        setOperationalAuthorizationError(
          res?.message || "No hay autorizadores operativos disponibles para esta sucursal."
        );
      }

      return rows;
    } catch (e) {
      setOperationalAuthorizers([]);
      setOperationalAuthorizationError(
        pickErr(e, "No se pudieron cargar los autorizadores operativos.")
      );
      return [];
    } finally {
      setLoadingOperationalAuthorizers(false);
    }
  };

  useEffect(() => {
    if (!canManageAdjustments || !Number(selectedSaleId || 0)) {
      setOperationalAuthorizers([]);
      setOperationalAuthorizationError("");
      return;
    }

    loadOperationalAuthorizers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageAdjustments, selectedSaleId]);

  const normalizeCorrectionPayload = (payload = {}) => ({
    ...payload,
    reason: String(payload?.reason || "").trim(),
    authorization_user_id: Number(payload?.authorization_user_id || 0),
    authorization_pin: String(payload?.authorization_pin || "").trim(),
    clear_discounts_on_restructure: payload?.clear_discounts_on_restructure === true,
  });

  const validateCorrectionAuthorization = (payload) => {
    if (!payload.reason) {
      showAlert({ severity: "warning", message: "Debes indicar el motivo de la corrección." });
      return false;
    }

    if (!payload.authorization_user_id) {
      showAlert({ severity: "warning", message: "Debes seleccionar un autorizador operativo." });
      return false;
    }

    if (!payload.authorization_pin) {
      showAlert({ severity: "warning", message: "Debes ingresar el PIN del autorizador operativo." });
      return false;
    }

    return true;
  };

  const handleCorrectionError = (error, fallback) => {
    const status = Number(error?.response?.status || 0);
    const code = pickCode(error);
    const message = pickErr(error, fallback);

    if (code === "CLEAR_DISCOUNTS_ON_RESTRUCTURE_REQUIRED") {
      showAlert({
        severity: "warning",
        title: "Descuentos manuales",
        message: message || "Esta corrección afecta descuentos manuales. Confirma su eliminación para continuar.",
      });
      return;
    }

    if (AUTHORIZATION_ERROR_CODES.has(code)) {
      setOperationalAuthorizationError(message);
      showAlert({ severity: "warning", title: "Autorización rechazada", message });
      return;
    }

    showAlert({
      severity: status === 409 || status === 422 ? "warning" : "error",
      message,
    });
  };

  const finishSuccessfulAdjustment = async ({ response, operationType }) => {
    setPreview(null);
    clearPreviewMode();
    setOperationalAuthorizationError("");

    showAlert({
      severity: "success",
      message:
        response?.message ||
        (operationType === "order"
          ? "Orden cancelada correctamente."
          : "Corrección aplicada correctamente."),
    });

    if (operationType === "order") {
      setTimeout(() => nav(MY_SALES_PATH, { replace: true }), 500);
      return;
    }

    setPartialCancelForm({ reason: "" });
    setPartialCancelDrafts([]);
    await load({ preserveForm: false });
  };

  const handleSubmitPartialCancel = async (formPayload = {}) => {
    if (!ensureNotLocked() || adjustmentBusy) return;

    if (!canManageAdjustments) {
      showAlert({
        severity: "warning",
        message: isEqualPartsAccount
          ? "Las cuentas divididas en partes iguales no permiten correcciones. Deshaz la división antes de modificar el consumo."
          : "La cuenta ya no permite corregir el consumo.",
      });
      return;
    }

    const payload = normalizeCorrectionPayload(formPayload);
    const items = toArray(payload.items).map((item) => ({
      order_item_id: Number(item?.order_item_id || 0),
      quantity: Number(item?.quantity || 0),
    }));

    if (!validateCorrectionAuthorization(payload)) return;

    if (!items.length) {
      showAlert({ severity: "warning", message: "Debes agregar al menos un producto a corregir." });
      return;
    }

    if (items.some((item) => !item.order_item_id || !Number.isInteger(item.quantity) || item.quantity < 1)) {
      showAlert({
        severity: "warning",
        message: "Completa correctamente el producto y la cantidad en todos los renglones.",
      });
      return;
    }

    const requestPayload = { ...payload, items };

    try {
      setAdjustmentBusy(true);
      setOperationalAuthorizationError("");

      const res = await cancelCashierSaleItems(selectedSaleId, requestPayload);
      await finishSuccessfulAdjustment({ response: res, operationType: "items" });
    } catch (e) {
      if (pickCode(e) === "PARTIAL_ADJUSTMENT_WOULD_ZERO_ORDER") {
        showAlert({
          severity: "warning",
          message: pickErr(
            e,
            "La corrección dejaría la orden en cero. Usa la cancelación completa de la orden."
          ),
        });
        return;
      }

      handleCorrectionError(e, "No se pudo corregir el consumo de la cuenta.");
    } finally {
      setAdjustmentBusy(false);
    }
  };

  const handleSubmitCancelOrder = async (formPayload = {}) => {
    if (!ensureNotLocked() || adjustmentBusy) return;

    if (!canManageAdjustments) {
      showAlert({
        severity: "warning",
        message: isEqualPartsAccount
          ? "Las cuentas divididas en partes iguales no permiten correcciones. Deshaz la división antes de modificar el consumo."
          : "La orden ya no puede cancelarse desde esta cuenta.",
      });
      return;
    }

    const payload = normalizeCorrectionPayload(formPayload);

    if (!validateCorrectionAuthorization(payload)) return;

    const orderId = Number(payload?.order_id || 0);
    const requestPayload = {
      reason: payload.reason,
      authorization_user_id: payload.authorization_user_id,
      authorization_pin: payload.authorization_pin,
      clear_discounts_on_restructure: payload.clear_discounts_on_restructure,
      ...(orderId > 0 ? { order_id: orderId } : {}),
    };

    try {
      setAdjustmentBusy(true);
      setOperationalAuthorizationError("");

      const res = await cancelCashierSaleOrder(selectedSaleId, requestPayload);
      await finishSuccessfulAdjustment({ response: res, operationType: "order" });
    } catch (e) {
      handleCorrectionError(e, "No se pudo cancelar la orden.");
    } finally {
      setAdjustmentBusy(false);
    }
  };

  return {
    operationalAuthorizers,
    loadingOperationalAuthorizers,
    operationalAuthorizationError,
    loadOperationalAuthorizers,
    handlePartialFormChange,
    handleAddPartialDraft,
    handleRemovePartialDraft,
    handlePartialDraftChange,
    handleSubmitPartialCancel,
    handleSubmitCancelOrder,
  };
}