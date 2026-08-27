import { useEffect, useRef, useState } from "react";

import {
  applyCashierSaleGlobalDiscount,
  applyCashierSaleItemDiscount,
  fetchCashierDiscountAuthorizers,
  fetchCashierSaleDiscountSummary,
  removeCashierSaleGlobalDiscount,
  removeCashierSaleItemDiscount,
} from "../../../../../services/staff/casher/cashierDiscount.service";

import {
  formatPaymentAmountValue,
  paymentTotalForSale,
  pickCode,
  pickErr,
  pickErrorPayload,
  toArray,
} from "./cashierOnlineOrderPayment.utils";

export default function useCashierOnlineOrderDiscounts({
  selectedSaleId,
  sale,
  setSale,
  tip,
  setPayments,
  setPreview,
  refreshOnlineOrderSnapshot,
  baseCanManageDiscounts,
  financialLocked,
  postPaymentOpen,
  setActiveTool,
  showAlert,
}) {
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

  const discountDraftIdRef = useRef(1);

  const canManageDiscounts =
    Boolean(baseCanManageDiscounts) &&
    !financialLocked &&
    !postPaymentOpen;

  const hasGlobalDiscount = Boolean(discountSummary?.global_discount);

  useEffect(() => {
    setDiscountSummary(null);
    setGlobalDiscountForm({ type: "fixed", value: "", reason: "" });
    setItemDiscountDrafts([]);
    resetDiscountAuthorizationState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSaleId]);

  const createEmptyItemDiscountDraft = () => ({
    localId: `online-discount-${discountDraftIdRef.current++}`,
    orderItemId: "",
    type: "fixed",
    value: "",
    reason: "",
  });

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

  const handleGlobalFormChange = (field, value) => {
    setGlobalDiscountForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleAddItemDiscountDraft = () => {
    if (!canManageDiscounts) {
      showAlert({
        severity: "warning",
        message: "Los descuentos no pueden modificarse durante el cobro.",
      });
      return;
    }

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
    if (!canManageDiscounts) return;

    setItemDiscountDrafts((previous) =>
      previous.filter((row) => row.localId !== localId)
    );
  };

  const handleItemDiscountDraftChange = (localId, field, value) => {
    if (!canManageDiscounts) return;

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
        message: financialLocked
          ? "No puedes modificar descuentos mientras se procesa el cobro."
          : "Los descuentos ya no están disponibles para este pedido.",
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
        message: financialLocked
          ? "Los descuentos permanecen bloqueados mientras se procesa el cobro."
          : "Los descuentos ya no pueden modificarse en este momento.",
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

  function resetDiscountAuthorizationState() {
    setDiscountAuthorizationOpen(false);
    setDiscountAuthorizationPolicy(null);
    setDiscountAuthorizationMessage("");
    setDiscountAuthorizationTarget(null);
    setDiscountAuthorizers([]);
    setDiscountAuthorizationForm({ user_id: "", pin: "" });
    setDiscountAuthorizationError("");
    setLoadingDiscountAuthorizers(false);
    setAuthorizingDiscount(false);
  }

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
          response?.message ||
          "No hay autorizadores de descuentos disponibles para esta sucursal."
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

    if (!canManageDiscounts) {
      setDiscountAuthorizationError("El cobro está en proceso y no permite modificar descuentos.");
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
    if (!canManageDiscounts) return;

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
        target: { scope: "item", orderItemId, draftLocalId: localId, payload },
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
    if (!canManageDiscounts) return;

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

  return {
    canManageDiscounts,
    discountSummary,
    discountBusy,
    globalDiscountForm,
    itemDiscountDrafts,

    discountAuthorizationOpen,
    discountAuthorizationPolicy,
    discountAuthorizationMessage,
    discountAuthorizers,
    discountAuthorizationForm,
    loadingDiscountAuthorizers,
    authorizingDiscount,
    discountAuthorizationError,

    handleGlobalFormChange,
    handleAddItemDiscountDraft,
    handleRemoveItemDiscountDraft,
    handleItemDiscountDraftChange,
    handleOpenDiscounts,
    handleApplyGlobalDiscount,
    handleRemoveGlobalDiscount,
    handleApplyItemDraft,
    handleRemoveItemDiscount,

    handleDiscountAuthorizationFormChange,
    handleCloseDiscountAuthorization,
    handleSubmitDiscountAuthorization,
  };
}
