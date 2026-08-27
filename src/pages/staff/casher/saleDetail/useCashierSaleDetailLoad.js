// src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js

import { fetchCashierSaleDetail } from "../../../../services/staff/casher/cashierQueue.service";
import {
  fetchCashierSaleCheckContext,
  fetchCashierSaleCheckDetail,
} from "../../../../services/staff/casher/cashierSaleCheck.service";
import {
  fetchCashierPaymentMethods,
  fetchCashierTaxOptions,
} from "../../../../services/staff/casher/cashierPayment.service";
import { fetchCashierSaleDiscountSummary } from "../../../../services/staff/casher/cashierDiscount.service";
import { fetchCashierSaleAdjustments } from "../../../../services/staff/casher/cashierAdjustment.service";
import { fetchCashierSaleCustomerData } from "../../../../services/staff/casher/cashierCustomer.service";

import {
  MY_SALES_PATH,
  adjustmentOrderRows,
  buildDefaultTaxCode,
  buildExactCheckDetail,
  checkIdOf,
  checkSaleIdOf,
  deriveLegacyCanOperate,
  formatPaymentAmountValue,
  numberOrNull,
  toArray,
} from "./cashierSaleDetail.utils";

export default function useCashierSaleDetailLoad({
  routeSaleId,
  nav,
  showAlert,
  pickErr,
  pickCode,
  setLoading,
  setDetailData,
  saleCheckContext,
  setSaleCheckContext,
  setSelectedCheck,
  selectedCheckId,
  setSelectedCheckId,
  selectedSaleId,
  setSelectedSaleId,
  preparedCheck,
  setPreparedCheck,
  isLegacySale,
  setIsLegacySale,
  setSettlement,
  setPaymentMethods,
  setTaxOptions,
  setDiscountSummary,
  setAdjustmentSummary,
  setCustomerSummary,
  setTaxOptionCode,
  tip,
  setTip,
  setPayments,
  setPreview,
  setGlobalDiscountForm,
  setItemDiscountDrafts,
  setPartialCancelForm,
  setPartialCancelDrafts,
  setCancelOrderReason,
  setCancelOrderId,
  setContactForm,
  setSearchCustomerForm,
  setCreateCustomerForm,
  setCustomerSearchResults,
  localIdRef,
}) {
  const createEmptyPayment = (methodId = "") => ({
    localId: `p-${localIdRef.current++}`,
    payment_method_id: methodId ? String(methodId) : "",
    amount: "",
    reference: "",
    last4: "",
    received: "",
  });

  const initializePayments = (loadedSale, loadedMethods) => {
    const initialTotal = Number(loadedSale?.payable_total ?? loadedSale?.total ?? 0);
    const firstMethodId = loadedMethods?.[0]?.id ? String(loadedMethods[0].id) : "";

    setTip(String(Number(loadedSale?.tip || 0)));
    setPayments([{
      ...createEmptyPayment(firstMethodId),
      amount: initialTotal > 0 ? formatPaymentAmountValue(initialTotal) : "",
    }]);
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
            summarySale.promotion_discount_total ?? prev.sale.promotion_discount_total,
          manual_discount_total:
            summarySale.manual_discount_total ?? prev.sale.manual_discount_total,
          discount_total: summarySale.discount_total ?? prev.sale.discount_total,
          taxable_amount:
            summarySale.taxable_amount ?? summarySale.net_total ?? prev.sale.taxable_amount,
          net_total:
            summarySale.net_total ?? summarySale.taxable_amount ?? prev.sale.net_total,
          tip: summarySale.tip ?? prev.sale.tip,
          total: summarySale.total ?? prev.sale.total,
          payable_total:
            summarySale.payable_total ?? summarySale.total ?? prev.sale.payable_total,
          tax_kind: summarySale.tax_kind ?? prev.sale.tax_kind,
          tax_rate: summarySale.tax_rate ?? prev.sale.tax_rate,
          tax_base: summarySale.tax_base ?? prev.sale.tax_base,
          tax_total: summarySale.tax_total ?? prev.sale.tax_total,
        },
      };
    });
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

  const loadDiscountSummaryIfNeeded = async (targetSaleId, allowOperation) => {
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

  const loadAdjustmentSummaryIfNeeded = async (targetSaleId, allowOperation) => {
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
      Number(loadedSale?.cash_session_id || 0) === Number(loadedSession?.id || 0);

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
    setGlobalDiscountForm({ type: "fixed", value: "", reason: "" });
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

    setTaxOptionCode((prev) => preserveForm && prev ? prev : nextTaxCode);

    await loadDiscountSummaryIfNeeded(targetSaleId, allowOperation);

    const adjustmentData =
      await loadAdjustmentSummaryIfNeeded(targetSaleId, allowOperation);

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

  const loadLegacySale = async ({ targetSaleId, preserveForm }) => {
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

  const loadCheckSale = async ({ targetSaleId, preserveForm }) => {
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

    const checkDetailRes = await fetchCashierSaleCheckDetail(exactCheckId);
    const checkDetailData = checkDetailRes?.data || null;
    const exactDetailedCheck = checkDetailData?.check || null;
    const exactStatus = String(exactDetailedCheck?.status || "").toLowerCase();

    const exactSplitMode = String(
      contextData?.split_mode ?? contextData?.structure?.split_mode ?? ""
    ).toLowerCase();

    const exactSplitType = String(
      exactContextCheck?.split_type ?? exactDetailedCheck?.split_type ?? ""
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
      !exactBillingGroupStatus || exactBillingGroupStatus === "open";

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

    const alreadyPrepared = exactStatus === "paying"
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
    const targetSaleId = numberOrNull(routeSaleId);

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
          message: pickErr(e, "La cuenta ya no está disponible para esta caja."),
        });

        setTimeout(() => nav(MY_SALES_PATH, { replace: true }), 650);
        return;
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo cargar el detalle de la cuenta."),
      });
    } finally {
      setLoading(false);
    }
  };

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

      if (!latestCheck || checkSaleIdOf(latestCheck) !== Number(selectedSaleId)) {
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

  return {
    load,
    refreshSelectedCheckDetail,
    syncSaleFromDiscountSummary,
    syncCustomerFormsFromSummary,
  };
}