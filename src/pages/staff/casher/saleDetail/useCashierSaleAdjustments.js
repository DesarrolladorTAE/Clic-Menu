// src/pages/staff/casher/saleDetail/useCashierSaleAdjustments.js

import {
  cancelCashierSaleItems,
  cancelCashierSaleOrder,
} from "../../../../services/staff/casher/cashierAdjustment.service";

import {
  fetchCashierOperationalAuthorizers,
} from "../../../../services/staff/casher/cashierOperationalAuthorizer.service";

import {
  MY_SALES_PATH,
  numberOrNull,
  toArray,
} from "./cashierSaleDetail.utils";

export default function useCashierSaleAdjustments({
  nav,
  sale,
  selectedCheck,
  selectedSaleId,
  canManageAdjustments,
  isEqualPartsAccount,
  adjustmentOrders,
  partialCancelForm,
  setPartialCancelForm,
  partialCancelDrafts,
  setPartialCancelDrafts,
  cancelOrderReason,
  setCancelOrderReason,
  cancelOrderId,
  setCancelOrderId,
  adjustmentBusy,
  setAdjustmentBusy,
  pendingAdjustmentAuthorization,
  setPendingAdjustmentAuthorization,
  operationalAuthorizationOpen,
  setOperationalAuthorizationOpen,
  operationalAuthorizers,
  setOperationalAuthorizers,
  loadingOperationalAuthorizers,
  setLoadingOperationalAuthorizers,
  authorizingOperational,
  setAuthorizingOperational,
  operationalAuthorizationError,
  setOperationalAuthorizationError,
  operationalAuthorizationMessage,
  setOperationalAuthorizationMessage,
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
      message: "No puedes realizar cancelaciones mientras existe una operación NetPay en proceso o pendiente de resolución.",
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

    setPartialCancelDrafts((prev) => [
      ...prev,
      createEmptyPartialCancelDraft(),
    ]);
  };

  const handleRemovePartialDraft = (localId) => {
    if (!ensureNotLocked()) return;

    setPartialCancelDrafts((prev) =>
      prev.filter((draft) => draft.localId !== localId)
    );
  };

  const handlePartialDraftChange = (localId, field, value) => {
    if (!ensureNotLocked()) return;

    setPartialCancelDrafts((prev) =>
      prev.map((draft) =>
        draft.localId === localId
          ? { ...draft, [field]: value }
          : draft
      )
    );
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
      const rows = toArray(res?.data?.authorizers || res?.data);

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

  const openOperationalAuthorization = async ({ error, operation }) => {
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
    clearPreviewMode();

    showAlert({
      severity: "success",
      message:
        response?.message ||
        (operationType === "order"
          ? "Orden cancelada correctamente."
          : "Ajuste parcial aplicado correctamente."),
    });

    if (operationType === "order") {
      setTimeout(() => nav(MY_SALES_PATH, { replace: true }), 500);
      return;
    }

    setPartialCancelForm({ reason: "" });
    setPartialCancelDrafts([]);

    await load({ preserveForm: false });
  };

  const handleSubmitOperationalAuthorization = async (authorization) => {
    if (!ensureNotLocked()) return;

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

      const res = pending.type === "order"
        ? await cancelCashierSaleOrder(pending.saleId, retryPayload)
        : await cancelCashierSaleItems(pending.saleId, retryPayload);

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
        (
          code === "OPERATIONAL_AUTHORIZATION_INVALID" ||
          code === "OPERATIONAL_AUTHORIZATION_REQUIRED"
        )
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
        pickErr(
          e,
          "No se pudo completar la cancelación autorizada."
        )
      );
    } finally {
      setAuthorizingOperational(false);
    }
  };

  const handleSubmitPartialCancel = async () => {
    if (!ensureNotLocked()) return;

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
              sale?.order_id ||
              selectedCheck?.primary_order_id
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
    if (!ensureNotLocked()) return;

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
        message: pickErr(
          e,
          "No se pudo cancelar la orden."
        ),
      });
    } finally {
      setAdjustmentBusy(false);
    }
  };

  return {
    operationalAuthorizationOpen,
    operationalAuthorizers,
    loadingOperationalAuthorizers,
    authorizingOperational,
    operationalAuthorizationError,
    operationalAuthorizationMessage,
    handlePartialFormChange,
    handleAddPartialDraft,
    handleRemovePartialDraft,
    handlePartialDraftChange,
    handleCloseOperationalAuthorization,
    handleSubmitOperationalAuthorization,
    handleSubmitPartialCancel,
    handleSubmitCancelOrder,
  };
}
