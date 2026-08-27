// src/pages/staff/casher/saleDetail/useCashierSaleDiscounts.js

import {
  fetchCashierDiscountAuthorizers,
  applyCashierSaleGlobalDiscount,
  removeCashierSaleGlobalDiscount,
  applyCashierSaleItemDiscount,
  removeCashierSaleItemDiscount,
} from "../../../../services/staff/casher/cashierDiscount.service";

import { toArray } from "./cashierSaleDetail.utils";

export default function useCashierSaleDiscounts({
  selectedSaleId,
  canManageDiscounts,
  isEqualPartsAccount,
  globalDiscountForm,
  setGlobalDiscountForm,
  itemDiscountDrafts,
  setItemDiscountDrafts,
  discountSummary,
  setDiscountSummary,
  discountBusy,
  setDiscountBusy,
  discountAuthorizationOpen,
  setDiscountAuthorizationOpen,
  discountAuthorizationPolicy,
  setDiscountAuthorizationPolicy,
  discountAuthorizationMessage,
  setDiscountAuthorizationMessage,
  discountAuthorizationTarget,
  setDiscountAuthorizationTarget,
  discountAuthorizers,
  setDiscountAuthorizers,
  discountAuthorizationForm,
  setDiscountAuthorizationForm,
  loadingDiscountAuthorizers,
  setLoadingDiscountAuthorizers,
  authorizingDiscount,
  setAuthorizingDiscount,
  discountAuthorizationError,
  setDiscountAuthorizationError,
  draftIdRef,
  tip,
  syncSaleFromDiscountSummary,
  syncSinglePaymentFromFinancialSale,
  refreshSelectedCheckDetail,
  setPreview,
  clearPreviewMode,
  financialLocked,
  showAlert,
  pickErr,
  pickCode,
  pickErrorPayload,
}) {
  const hasGlobalDiscount = Boolean(discountSummary?.global_discount);

  const ensureNotLocked = () => {
    if (!financialLocked) return true;

    showAlert({
      severity: "warning",
      message: "No puedes modificar descuentos mientras existe una operación NetPay en proceso o pendiente de resolución.",
    });

    return false;
  };

  const createEmptyItemDiscountDraft = () => ({
    localId: `d-${draftIdRef.current++}`,
    orderItemId: "",
    type: "fixed",
    value: "",
    reason: "",
  });

  const handleGlobalFormChange = (field, value) => {
    setGlobalDiscountForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItemDiscountDraft = () => {
    if (!ensureNotLocked()) return;

    if (hasGlobalDiscount) {
      showAlert({
        severity: "warning",
        message: "Quita primero el descuento global antes de agregar descuentos por ítem.",
      });
      return;
    }

    setItemDiscountDrafts((prev) => [...prev, createEmptyItemDiscountDraft()]);
  };

  const handleRemoveItemDiscountDraft = (localId) => {
    if (!ensureNotLocked()) return;
    setItemDiscountDrafts((prev) => prev.filter((draft) => draft.localId !== localId));
  };

  const handleItemDiscountDraftChange = (localId, field, value) => {
    if (!ensureNotLocked()) return;

    setItemDiscountDrafts((prev) =>
      prev.map((draft) =>
        draft.localId === localId ? { ...draft, [field]: value } : draft
      )
    );
  };

  const syncDiscountResponseToState = async (res) => {
    const summaryData = res?.data || null;

    setDiscountSummary(summaryData);
    syncSaleFromDiscountSummary(summaryData);
    syncSinglePaymentFromFinancialSale(summaryData?.sale, tip);
    setPreview(null);
    clearPreviewMode();
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
        pickErr(e, "No se pudieron cargar los autorizadores de descuentos.")
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
    if (pickCode(error) !== "DISCOUNT_AUTHORIZATION_REQUIRED") return false;

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

  const validateDiscountPayload = (type, value, scopeLabel) => {
    if (!ensureNotLocked()) return false;

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

  const handleSubmitDiscountAuthorization = async () => {
    if (!ensureNotLocked()) return;

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
            (row) => row.localId !== discountAuthorizationTarget.draftLocalId
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
        setDiscountAuthorizationError(buildAuthorizationErrorMessage(e));
        return;
      }

      if (code === "DISCOUNT_AUTHORIZATION_REQUIRED") {
        const payload = pickErrorPayload(e);

        setDiscountAuthorizationPolicy(payload?.discount_policy || null);
        setDiscountAuthorizationMessage(
          payload?.message || "Este descuento requiere autorización."
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

  const handleApplyGlobalDiscount = async () => {
    const { type, value, reason } = globalDiscountForm;
    if (!validateDiscountPayload(type, value, "el descuento total")) return;

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
          fallbackMessage: "Este descuento global requiere autorización.",
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
    if (!ensureNotLocked()) return;

    try {
      setDiscountBusy(true);

      const res = await removeCashierSaleGlobalDiscount(selectedSaleId);
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
    if (!ensureNotLocked()) return;

    const draft = itemDiscountDrafts.find((row) => row.localId === localId);

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
        message: pickErr(e, "No se pudo aplicar el descuento por ítem."),
      });
    } finally {
      setDiscountBusy(false);
    }
  };

  const handleRemoveItemDiscount = async (orderItemId) => {
    if (!ensureNotLocked()) return;

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
        message: pickErr(e, "No se pudo quitar el descuento por ítem."),
      });
    } finally {
      setDiscountBusy(false);
    }
  };

  return {
    hasGlobalDiscount,
    handleGlobalFormChange,
    handleAddItemDiscountDraft,
    handleRemoveItemDiscountDraft,
    handleItemDiscountDraftChange,
    handleSubmitDiscountAuthorization,
    handleCloseDiscountAuthorization,
    handleApplyGlobalDiscount,
    handleRemoveGlobalDiscount,
    handleApplyItemDraft,
    handleRemoveItemDiscount,
  };
}
