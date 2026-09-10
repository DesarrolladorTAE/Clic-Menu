// src/pages/staff/casher/CashierSaleDetailPage.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import CashierSaleDetailHeroCard from "../../../components/staff/casher/saleDetailPage/CashierSaleDetailHeroCard";
import CashierOrderItemsCard from "../../../components/staff/casher/saleDetailPage/CashierOrderItemsCard";
import CashierSaleSummaryCard from "../../../components/staff/casher/saleDetailPage/CashierSaleSummaryCard";
import CashierPaymentFormCard from "../../../components/staff/casher/saleDetailPage/CashierPaymentFormCard";
import CashierTaxSelectorCard from "../../../components/staff/casher/saleDetailPage/CashierTaxSelectorCard";
import CashierDiscountCard from "../../../components/staff/casher/saleDetailPage/CashierDiscountCard";
import CashierAdjustmentCard from "../../../components/staff/casher/saleDetailPage/CashierAdjustmentCard";
import CashierCustomerCard from "../../../components/staff/casher/saleDetailPage/CashierCustomerCard";
import CashierSaleOptionalActionsBar from "../../../components/staff/casher/saleDetailPage/CashierSaleOptionalActionsBar";
import CashierPaymentTabs from "../../../components/staff/casher/saleDetailPage/CashierPaymentTabs";
import CashierSaleToolDialog from "../../../components/staff/casher/saleDetailPage/CashierSaleToolDialog";
import CashierDiscountAuthorizationDialog from "../../../components/staff/casher/saleDetailPage/CashierDiscountAuthorizationDialog";
import CashierOperationalAuthorizationDialog from "../../../components/staff/casher/authorization/CashierOperationalAuthorizationDialog";
import CashierPostPaymentTicketModal from "../../../components/staff/casher/ticket/CashierPostPaymentTicketModal";
import CashierPrebillDialog from "../../../components/staff/casher/prebill/CashierPrebillDialog";

import useCashierSaleDetailLoad from "./saleDetail/useCashierSaleDetailLoad";
import useCashierSalePaymentFlow from "./saleDetail/useCashierSalePaymentFlow";
import useCashierSaleDiscounts from "./saleDetail/useCashierSaleDiscounts";
import useCashierSaleAdjustments from "./saleDetail/useCashierSaleAdjustments";
import useCashierSaleCustomer from "./saleDetail/useCashierSaleCustomer";
import useCashierSaleTicket from "./saleDetail/useCashierSaleTicket";
import useCashierSalePrebill from "./saleDetail/useCashierSalePrebill";

import {
  MY_SALES_PATH,
  adjustmentOrderRows,
  checkIdOf,
  checkSaleIdOf,
  deriveLegacyCanOperate,
  numberOrNull,
  toArray,
} from "./saleDetail/cashierSaleDetail.utils";

export default function CashierSaleDetailPage() {
  const nav = useNavigate();
  const { saleId } = useParams();

  const [loading, setLoading] = useState(true);
  const [activeTool, setActiveTool] = useState(null);
  const [paymentTab, setPaymentTab] = useState("payment");

  const [detailData, setDetailData] = useState(null);
  const [saleCheckContext, setSaleCheckContext] = useState(null);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [selectedCheckId, setSelectedCheckId] = useState(null);
  const [selectedSaleId, setSelectedSaleId] = useState(numberOrNull(saleId));
  const [preparedCheck, setPreparedCheck] = useState(null);
  const [isLegacySale, setIsLegacySale] = useState(false);
  const [settlement, setSettlement] = useState(null);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [discountSummary, setDiscountSummary] = useState(null);
  const [adjustmentSummary, setAdjustmentSummary] = useState(null);
  const [customerSummary, setCustomerSummary] = useState(null);

  const [taxOptionCode, setTaxOptionCode] = useState("");
  const [tip, setTip] = useState("0");
  const [payments, setPayments] = useState([]);

  const [globalDiscountForm, setGlobalDiscountForm] = useState({
    type: "fixed",
    value: "",
    reason: "",
  });

  const [itemDiscountDrafts, setItemDiscountDrafts] = useState([]);
  const [partialCancelForm, setPartialCancelForm] = useState({ reason: "" });
  const [partialCancelDrafts, setPartialCancelDrafts] = useState([]);

  const [contactForm, setContactForm] = useState({
    phone: "",
    email: "",
  });

  const [searchCustomerForm, setSearchCustomerForm] = useState({
    phone: "",
    email: "",
  });

  const [customerSearchResults, setCustomerSearchResults] = useState([]);

  const [createCustomerForm, setCreateCustomerForm] = useState({
    name_alias: "",
    phone: "",
    email: "",
    razon_social: "",
    rfc: "",
    regimen: "",
    postal_code: "",
  });

  const [cancelOrderReason, setCancelOrderReason] = useState("");
  const [cancelOrderId, setCancelOrderId] = useState("");

  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [discountBusy, setDiscountBusy] = useState(false);
  const [adjustmentBusy, setAdjustmentBusy] = useState(false);
  const [customerBusy, setCustomerBusy] = useState(false);
  const [searchingCustomers, setSearchingCustomers] = useState(false);

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

  const [pendingAdjustmentAuthorization, setPendingAdjustmentAuthorization] = useState(null);
  const [operationalAuthorizationOpen, setOperationalAuthorizationOpen] = useState(false);
  const [operationalAuthorizers, setOperationalAuthorizers] = useState([]);
  const [loadingOperationalAuthorizers, setLoadingOperationalAuthorizers] = useState(false);
  const [authorizingOperational, setAuthorizingOperational] = useState(false);
  const [operationalAuthorizationError, setOperationalAuthorizationError] = useState("");
  const [operationalAuthorizationMessage, setOperationalAuthorizationMessage] = useState("");

  const [postPaymentOpen, setPostPaymentOpen] = useState(false);
  const [postPaymentTicket, setPostPaymentTicket] = useState(null);
  const [postPaymentTicketWarning, setPostPaymentTicketWarning] = useState(false);
  const [postPaymentTicketErrorCode, setPostPaymentTicketErrorCode] = useState(null);
  const [postPaymentTicketErrorMessage, setPostPaymentTicketErrorMessage] = useState(null);
  const [postPaymentPrintConfig, setPostPaymentPrintConfig] = useState(null);
  const [postPaymentSale, setPostPaymentSale] = useState(null);
  const [postPaymentOrder, setPostPaymentOrder] = useState(null);
  const [postPaymentTable, setPostPaymentTable] = useState(null);
  const [postPaymentPayments, setPostPaymentPayments] = useState([]);
  const [postPaymentPoints, setPostPaymentPoints] = useState(null);

  const [ticketBusy, setTicketBusy] = useState({
    view: false,
    print: false,
    thermalPrint: false,
    voucherReprint: false,
    download: false,
    whatsapp: false,
  });

  const localIdRef = useRef(1);
  const draftIdRef = useRef(1);
  const cancelDraftIdRef = useRef(1);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "info",
    title: "",
    message: "",
  });

  const showAlert = ({ severity = "info", title, message }) => {
    if (!message) return;

    const resolvedTitle =
      title ||
      (severity === "success"
        ? "Listo"
        : severity === "warning"
        ? "Ojo"
        : severity === "error"
        ? "Error"
        : "Aviso");

    setAlertState({
      open: true,
      severity,
      title: resolvedTitle,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const pickErr = (e, fallback) =>
    e?.response?.data?.message || e?.message || fallback;

  const pickCode = (e) => e?.response?.data?.code;
  const pickData = (e) => e?.response?.data?.data || null;
  const pickErrorPayload = (e) => e?.response?.data || {};

  const sale = detailData?.sale || null;
  const cashSession = detailData?.cash_session || null;
  const orderDetail = detailData?.order_detail || null;

  const itemsTree = toArray(orderDetail?.items_tree);
  const itemsFlat = toArray(orderDetail?.items_flat);
  const itemsSummary = orderDetail?.items_summary || null;

  const adjustmentOrders = useMemo(
    () => adjustmentOrderRows(adjustmentSummary),
    [adjustmentSummary]
  );

  const exactCheckStatus = String(selectedCheck?.status || "").toLowerCase();

  const billingGroupStatus = String(
    saleCheckContext?.billing_group_status ??
    saleCheckContext?.billing_group?.status ??
    ""
  ).toLowerCase();

  const billingGroupAllowsEditing =
    !billingGroupStatus || billingGroupStatus === "open";

  const hasExactCheckOwnership = useMemo(() => {
    if (isLegacySale) return deriveLegacyCanOperate(detailData);

    const exactSaleId = Number(selectedSaleId || 0);
    const exactCheckId = Number(selectedCheckId || 0);
    const saleIdInState = Number(sale?.sale_id || sale?.id || 0);
    const saleCheckId = Number(sale?.order_check_id || 0);
    const checkSaleId = Number(
      selectedCheck?.sale_id ||
      selectedCheck?.sale?.sale_id ||
      selectedCheck?.sale?.id ||
      0
    );
    const cashSessionId = Number(cashSession?.id || 0);

    return Boolean(
      exactSaleId > 0 &&
      exactCheckId > 0 &&
      saleIdInState === exactSaleId &&
      checkSaleId === exactSaleId &&
      saleCheckId === exactCheckId &&
      String(sale?.status || "") === "taken" &&
      String(cashSession?.status || "") === "open" &&
      Number(sale?.cash_session_id || 0) === cashSessionId
    );
  }, [
    cashSession,
    detailData,
    isLegacySale,
    sale,
    selectedCheck,
    selectedCheckId,
    selectedSaleId,
  ]);

  const canEditAccount = useMemo(() => {
    if (isLegacySale) return deriveLegacyCanOperate(detailData);

    return (
      hasExactCheckOwnership &&
      exactCheckStatus === "open" &&
      billingGroupAllowsEditing
    );
  }, [
    billingGroupAllowsEditing,
    detailData,
    exactCheckStatus,
    hasExactCheckOwnership,
    isLegacySale,
  ]);

  const canOperate = useMemo(() => {
    if (isLegacySale) return deriveLegacyCanOperate(detailData);

    return (
      hasExactCheckOwnership &&
      ["open", "paying"].includes(exactCheckStatus)
    );
  }, [
    detailData,
    exactCheckStatus,
    hasExactCheckOwnership,
    isLegacySale,
  ]);

  const selectedCheckPolicy = useMemo(() => {
    if (isLegacySale) return null;

    return (
      toArray(saleCheckContext?.checks).find((check) => {
        const policyCheckId = checkIdOf(check);
        const policySaleId = checkSaleIdOf(check);

        return (
          (selectedCheckId &&
            policyCheckId === Number(selectedCheckId)) ||
          (selectedSaleId &&
            policySaleId === Number(selectedSaleId))
        );
      }) || null
    );
  }, [
    isLegacySale,
    saleCheckContext,
    selectedCheckId,
    selectedSaleId,
  ]);

  const canUsePrebill = useMemo(() => {
    if (isLegacySale || !selectedCheckId || !hasExactCheckOwnership) return false;

    const checkStatus = String(selectedCheck?.status || "").toLowerCase();
    const groupStatus = String(
      saleCheckContext?.billing_group_status ??
      saleCheckContext?.billing_group?.status ??
      ""
    ).toLowerCase();

    const orderSource = String(
      sale?.order?.source ??
      sale?.order_source ??
      ""
    ).trim().toLowerCase();

    const isCashierDirect =
      saleCheckContext?.operational?.is_cashier_direct === true ||
      orderSource === "cashier_direct";

    const isOnlineOrder = orderSource === "online_order";

    const hasTable =
      saleCheckContext?.operational?.has_table === true ||
      Number(selectedCheck?.primary_table_id || sale?.table_id || sale?.order?.table_id || 0) > 0;

    const hasPaymentEvidence =
      selectedCheck?.paid_at != null ||
      selectedCheck?.flags?.has_payments === true ||
      selectedCheck?.flags?.has_ticket === true ||
      selectedCheckPolicy?.flags?.has_payments === true ||
      selectedCheckPolicy?.flags?.has_ticket === true ||
      selectedCheckPolicy?.flags?.has_paid_sale === true ||
      selectedCheckPolicy?.flags?.has_refunds === true ||
      sale?.paid_at != null ||
      sale?.has_payments === true ||
      sale?.has_ticket === true ||
      ["paid", "partially_refunded", "refunded"].includes(
        String(sale?.status || "").toLowerCase()
      );

    return (
      ["open", "locked", "paying"].includes(checkStatus) &&
      (!groupStatus || ["open", "partially_paid"].includes(groupStatus)) &&
      hasTable &&
      !isCashierDirect &&
      !isOnlineOrder &&
      !hasPaymentEvidence
    );
  }, [
    hasExactCheckOwnership,
    isLegacySale,
    sale,
    saleCheckContext,
    selectedCheck,
    selectedCheckId,
    selectedCheckPolicy,
  ]);

  const isEqualPartsAccount = useMemo(() => {
    if (isLegacySale) return false;

    const splitMode = String(
      saleCheckContext?.split_mode ??
      saleCheckContext?.structure?.split_mode ??
      ""
    ).toLowerCase();

    const splitType = String(
      selectedCheckPolicy?.split_type ??
      selectedCheck?.split_type ??
      ""
    ).toLowerCase();

    return (
      splitMode === "equal_parts" ||
      splitType === "equal_parts" ||
      Boolean(selectedCheckPolicy?.flags?.is_equal_part)
    );
  }, [
    isLegacySale,
    saleCheckContext,
    selectedCheck,
    selectedCheckPolicy,
  ]);

  const canManageAdjustments = useMemo(() => {
    if (isLegacySale) return canEditAccount;

    const checkPermission =
      selectedCheckPolicy?.permissions?.can_manage_adjustments;

    const packagePermission =
      saleCheckContext?.permissions?.can_manage_adjustments;

    const backendAllows =
      typeof checkPermission === "boolean"
        ? checkPermission
        : typeof packagePermission === "boolean"
        ? packagePermission
        : !isEqualPartsAccount;

    return canEditAccount && backendAllows;
  }, [
    canEditAccount,
    isEqualPartsAccount,
    isLegacySale,
    saleCheckContext,
    selectedCheckPolicy,
  ]);

  const canManageDiscounts = useMemo(() => {
    if (isLegacySale) return canEditAccount;

    const checkPermission =
      selectedCheckPolicy?.permissions?.can_manage_discounts;

    const packagePermission =
      saleCheckContext?.permissions?.can_manage_discounts;

    const backendAllows =
      typeof checkPermission === "boolean"
        ? checkPermission
        : typeof packagePermission === "boolean"
        ? packagePermission
        : !isEqualPartsAccount;

    return canEditAccount && backendAllows;
  }, [
    canEditAccount,
    isEqualPartsAccount,
    isLegacySale,
    saleCheckContext,
    selectedCheckPolicy,
  ]);

  const canManageCustomer = useMemo(() => {
    const status = String(sale?.status || "");
    const owned =
      Number(sale?.cash_session_id || 0) ===
      Number(cashSession?.id || 0);

    return owned && ["taken", "paid"].includes(status);
  }, [cashSession, sale]);

  const selectedTaxOption = useMemo(() => {
    return taxOptions.find(
      (row) => String(row.code) === String(taxOptionCode)
    ) || null;
  }, [taxOptions, taxOptionCode]);

  const loadFlow = useCashierSaleDetailLoad({
    routeSaleId: saleId,
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
  });

  const ticketFlow = useCashierSaleTicket({
    selectedSaleId,
    postPaymentSale,
    postPaymentTicket,
    setPostPaymentTicket,
    setPostPaymentPrintConfig,
    ticketBusy,
    setTicketBusy,
    showAlert,
    pickErr,
  });

  const paymentFlow = useCashierSalePaymentFlow({
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
    loadPostPaymentPrintConfig: ticketFlow.loadPostPaymentPrintConfig,
    showAlert,
    pickErr,
    pickCode,
    pickData,
  });

  const prebillFlow = useCashierSalePrebill({
    selectedCheckId,
    taxOptionCode,
    canUsePrebill,
    operationBlocked:
      paying ||
      paymentFlow.netpayBusy ||
      paymentFlow.netpayPendingBlocked ||
      postPaymentOpen,
    showAlert,
    pickErr,
  });

  const discountFlow = useCashierSaleDiscounts({
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
    syncSaleFromDiscountSummary: loadFlow.syncSaleFromDiscountSummary,
    syncSinglePaymentFromFinancialSale:
      paymentFlow.syncSinglePaymentFromFinancialSale,
    refreshSelectedCheckDetail: loadFlow.refreshSelectedCheckDetail,
    setPreview,
    clearPreviewMode: paymentFlow.clearPreviewMode,
    financialLocked: paymentFlow.financialLocked,
    showAlert,
    pickErr,
    pickCode,
    pickErrorPayload,
  });

  const adjustmentFlow = useCashierSaleAdjustments({
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
    clearPreviewMode: paymentFlow.clearPreviewMode,
    load: loadFlow.load,
    financialLocked: paymentFlow.financialLocked,
    showAlert,
    pickErr,
    pickCode,
  });

  const customerFlow = useCashierSaleCustomer({
    selectedSaleId,
    canManageCustomer,
    contactForm,
    setContactForm,
    searchCustomerForm,
    setSearchCustomerForm,
    customerSearchResults,
    setCustomerSearchResults,
    createCustomerForm,
    setCreateCustomerForm,
    customerSummary,
    setCustomerSummary,
    customerBusy,
    setCustomerBusy,
    searchingCustomers,
    setSearchingCustomers,
    syncCustomerFormsFromSummary: loadFlow.syncCustomerFormsFromSummary,
    showAlert,
    pickErr,
    pickCode,
    pickData,
  });

  useEffect(() => {
    loadFlow.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleId]);

  useEffect(() => {
    if (
      activeTool === "adjustments" &&
      !canManageAdjustments
    ) {
      setActiveTool(null);
      return;
    }

    if (
      activeTool === "discounts" &&
      !canManageDiscounts
    ) {
      setActiveTool(null);
    }
  }, [
    activeTool,
    canManageAdjustments,
    canManageDiscounts,
  ]);

  const handleReturnToMySales = () => {
    setPostPaymentOpen(false);
    nav(MY_SALES_PATH, { replace: true });
  };

  const pageBusy =
    previewing ||
    paying ||
    paymentFlow.netpayBusy;

  const financialDisabled =
    pageBusy ||
    paymentFlow.netpayPendingBlocked ||
    postPaymentOpen;

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "70vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress />
            <Typography
              sx={{
                mt: 2,
                color: "text.secondary",
                fontSize: 14,
              }}
            >
              Cargando detalle de cuenta…
            </Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={1300}>
      <Stack spacing={3}>
        <CashierSaleDetailHeroCard
          sale={sale}
          check={selectedCheck}
          selectedCheck={selectedCheck}
          saleCheckContext={saleCheckContext}
          preparedCheck={preparedCheck}
          cashSession={cashSession}
          canOperate={canOperate}
          onBack={handleReturnToMySales}
        />

        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <CashierPaymentTabs value={paymentTab} onChange={setPaymentTab} />
        </Box>

        <Box
          sx={{
            display: {
              xs: paymentTab === "tools" ? "block" : "none",
              md: "block",
            },
          }}
        >
          <CashierSaleOptionalActionsBar
            adjustmentSummary={adjustmentSummary}
            customerSummary={customerSummary}
            discountSummary={discountSummary}
            disabled={financialDisabled}
            adjustmentsDisabled={!canManageAdjustments}
            customerDisabled={!canManageCustomer}
            discountsDisabled={!canManageDiscounts}
            onOpenAdjustments={() => setActiveTool("adjustments")}
            onOpenCustomer={() => setActiveTool("customer")}
            onOpenDiscounts={() => setActiveTool("discounts")}
          />
        </Box>

        <Box
          sx={{
            display: {
              xs: paymentTab === "payment" ? "block" : "none",
              md: "block",
            },
          }}
        >
          <Stack spacing={3}>
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: {
                  xs: "1fr",
                  xl: "1.15fr 0.85fr",
                },
                alignItems: "stretch",
              }}
            >
              <Box sx={{ height: "100%", minWidth: 0 }}>
                <CashierOrderItemsCard
                  itemsTree={itemsTree}
                  itemsSummary={itemsSummary}
                  selectedCheck={selectedCheck}
                />
              </Box>

              <Box
                sx={{
                  minWidth: 0,
                  height: "100%",
                  display: "grid",
                  gap: 3,
                  gridTemplateRows: {
                    xs: "auto auto",
                    xl: "minmax(0, 1fr) auto",
                  },
                  alignItems: "stretch",
                }}
              >
                <CashierSaleSummaryCard
                  sale={sale}
                  check={selectedCheck}
                  liveTip={Number(tip || 0)}
                  preview={preview}
                  previewMode={paymentFlow.previewMode}
                  selectedTaxOption={selectedTaxOption}
                />

                <CashierTaxSelectorCard
                  taxOptions={taxOptions}
                  value={taxOptionCode}
                  onChange={paymentFlow.handleTaxOptionChange}
                  disabled={!canOperate || financialDisabled}
                />
              </Box>
            </Box>

            <CashierPaymentFormCard
              methods={paymentMethods}
              initialAmount={paymentFlow.paymentInitialAmount}
              preview={preview}
              previewMode={paymentFlow.previewMode}
              tip={tip}
              onTipChange={paymentFlow.handleTipChange}
              payments={payments}
              onAddPayment={paymentFlow.handleAddPayment}
              onRemovePayment={paymentFlow.handleRemovePayment}
              onPaymentChange={paymentFlow.handlePaymentChange}
              onPreview={paymentFlow.handlePreview}
              previewing={previewing}
              paying={paying}
              hasPreview={Boolean(preview)}
              onPay={paymentFlow.handlePay}
              disabled={!canOperate || postPaymentOpen || paymentFlow.netpayPendingBlocked}
              maxPayments={paymentFlow.netpayMode ? 1 : 3}
              showAddPayment={!paymentFlow.netpayMode}
              showRemovePayment={!paymentFlow.netpayMode}
              netpayAvailable={paymentFlow.netpayBridgeAvailable}
              netpayMode={paymentFlow.netpayMode}
              onNetpayModeChange={paymentFlow.handleNetpayModeChange}
              netpayBusy={paymentFlow.netpayBusy}
              netpayStatus={paymentFlow.netpayStatus}
              netpayStatusLabel={paymentFlow.netpayStatusLabel}
              netpayTerminal={paymentFlow.netpayTerminal}
              netpayFinancialPending={paymentFlow.netpayPendingBlocked}
              netpayRecoveryAvailable={paymentFlow.netpayRecoveryAvailable}
              netpayPendingMessage={paymentFlow.netpayPendingMessage}
              onRetryNetpayRecovery={paymentFlow.retryPendingNetpayRecovery}
              paymentAmountLocked={paymentFlow.netpayMode}
              bankFieldsLocked={paymentFlow.netpayMode}
              showPrebill={canUsePrebill}
              onPrebill={prebillFlow.handleOpenPrebill}
              prebillDisabled={
                previewing ||
                paying ||
                paymentFlow.netpayBusy ||
                paymentFlow.netpayPendingBlocked ||
                postPaymentOpen
              }
            />
          </Stack>
        </Box>
      </Stack>

      <CashierSaleToolDialog
        open={
          activeTool === "adjustments" &&
          canManageAdjustments
        }
        onClose={() => setActiveTool(null)}
        title="Ajustes y cancelaciones"
        subtitle="Cancela ítems o una orden del paquete únicamente cuando sea necesario antes del cobro."
        icon={<TuneRoundedIcon />}
        maxWidth="lg"
      >
        <CashierAdjustmentCard
          sale={sale}
          selectedCheck={selectedCheck}
          itemsFlat={itemsFlat}
          summary={adjustmentSummary}
          orders={adjustmentOrders}
          orderOptions={adjustmentOrders}
          selectedOrderId={cancelOrderId}
          onSelectedOrderIdChange={setCancelOrderId}
          partialForm={partialCancelForm}
          onPartialFormChange={adjustmentFlow.handlePartialFormChange}
          partialDrafts={partialCancelDrafts}
          onAddPartialDraft={adjustmentFlow.handleAddPartialDraft}
          onRemovePartialDraft={adjustmentFlow.handleRemovePartialDraft}
          onPartialDraftChange={adjustmentFlow.handlePartialDraftChange}
          onSubmitPartial={adjustmentFlow.handleSubmitPartialCancel}
          cancelOrderReason={cancelOrderReason}
          onCancelOrderReasonChange={setCancelOrderReason}
          onSubmitCancelOrder={adjustmentFlow.handleSubmitCancelOrder}
          busy={adjustmentBusy}
          disabled={
            !canManageAdjustments ||
            financialDisabled
          }
        />
      </CashierSaleToolDialog>

      <CashierSaleToolDialog
        open={activeTool === "customer"}
        onClose={() => setActiveTool(null)}
        title="Cliente"
        subtitle="Guarda contacto simple o asocia un cliente formal únicamente a esta cuenta."
        icon={<PersonRoundedIcon />}
        maxWidth="lg"
      >
        <CashierCustomerCard
          summary={customerSummary}
          contactForm={contactForm}
          onContactFormChange={customerFlow.handleContactFormChange}
          onSaveContact={customerFlow.handleSaveContact}
          onRemoveContact={customerFlow.handleRemoveContact}
          searchForm={searchCustomerForm}
          onSearchFormChange={customerFlow.handleSearchCustomerFormChange}
          onSearch={customerFlow.handleSearchCustomers}
          searchResults={customerSearchResults}
          onAttachCustomer={customerFlow.handleAttachCustomer}
          createForm={createCustomerForm}
          onCreateFormChange={customerFlow.handleCreateCustomerFormChange}
          onCreateAndAttach={customerFlow.handleCreateAndAttachCustomer}
          onDetachCustomer={customerFlow.handleDetachCustomer}
          searching={searchingCustomers}
          busy={customerBusy}
          disabled={
            !canManageCustomer ||
            pageBusy ||
            postPaymentOpen
          }
        />
      </CashierSaleToolDialog>

      <CashierSaleToolDialog
        open={
          activeTool === "discounts" &&
          canManageDiscounts
        }
        onClose={() => setActiveTool(null)}
        title="Descuentos"
        subtitle="Aplica descuentos globales o por ítem sobre esta cuenta antes de validar el cobro."
        icon={<LocalOfferRoundedIcon />}
        maxWidth="lg"
      >
        <CashierDiscountCard
          sale={sale}
          selectedCheck={selectedCheck}
          itemsFlat={itemsFlat}
          summary={discountSummary}
          globalForm={globalDiscountForm}
          onGlobalFormChange={discountFlow.handleGlobalFormChange}
          itemDiscountDrafts={itemDiscountDrafts}
          onAddItemDiscountDraft={discountFlow.handleAddItemDiscountDraft}
          onRemoveItemDiscountDraft={discountFlow.handleRemoveItemDiscountDraft}
          onItemDiscountDraftChange={discountFlow.handleItemDiscountDraftChange}
          onApplyGlobal={discountFlow.handleApplyGlobalDiscount}
          onRemoveGlobal={discountFlow.handleRemoveGlobalDiscount}
          onApplyItemDraft={discountFlow.handleApplyItemDraft}
          onRemoveItem={discountFlow.handleRemoveItemDiscount}
          busy={discountBusy}
          disabled={
            !canManageDiscounts ||
            financialDisabled
          }
        />
      </CashierSaleToolDialog>

      <CashierDiscountAuthorizationDialog
        open={discountAuthorizationOpen}
        onClose={discountFlow.handleCloseDiscountAuthorization}
        onSubmit={discountFlow.handleSubmitDiscountAuthorization}
        authorizers={discountAuthorizers}
        form={discountAuthorizationForm}
        onFormChange={discountFlow.handleDiscountAuthorizationFormChange}
        loading={loadingDiscountAuthorizers}
        busy={authorizingDiscount}
        error={discountAuthorizationError}
        message={discountAuthorizationMessage}
        policy={discountAuthorizationPolicy}
      />

      <CashierOperationalAuthorizationDialog
        open={operationalAuthorizationOpen}
        onClose={adjustmentFlow.handleCloseOperationalAuthorization}
        onSubmit={adjustmentFlow.handleSubmitOperationalAuthorization}
        authorizers={operationalAuthorizers}
        loading={loadingOperationalAuthorizers}
        busy={authorizingOperational}
        error={operationalAuthorizationError}
        title="Autorizar cancelación"
        message={operationalAuthorizationMessage}
        submitLabel="Autorizar y continuar"
      />

      <CashierPrebillDialog
        open={prebillFlow.prebillOpen}
        onClose={prebillFlow.handleClosePrebill}
        customerSummary={customerSummary}
        onSendWhatsapp={prebillFlow.handleSendPrebillWhatsapp}
        sendingWhatsapp={prebillFlow.prebillWhatsappSending}
        onThermalPrint={prebillFlow.handleThermalPrintPrebill}
        thermalPrinting={prebillFlow.prebillPrinting}
        disabled={
          !canUsePrebill ||
          paying ||
          paymentFlow.netpayBusy ||
          paymentFlow.netpayPendingBlocked ||
          postPaymentOpen
        }
      />

      <CashierPostPaymentTicketModal
        open={postPaymentOpen}
        onClose={handleReturnToMySales}
        onContinue={handleReturnToMySales}
        onViewTicket={ticketFlow.handleViewTicket}
        onPrintTicket={ticketFlow.handlePrintTicket}
        onThermalPrintTicket={ticketFlow.handleThermalPrintTicket}
        onReprintNetpayVoucher={ticketFlow.handleReprintNetpayVoucher}
        onDownloadTicket={ticketFlow.handleDownloadTicket}
        onSendWhatsapp={ticketFlow.handleSendTicketWhatsapp}
        busyView={ticketBusy.view}
        busyPrint={ticketBusy.print}
        busyThermalPrint={ticketBusy.thermalPrint}
        busyVoucherReprint={ticketBusy.voucherReprint}
        busyDownload={ticketBusy.download}
        busyWhatsapp={ticketBusy.whatsapp}
        voucherReprintAvailable={ticketFlow.netpayVoucherAvailable}
        printConfig={postPaymentPrintConfig}
        customerSummary={customerSummary}
        ticket={postPaymentTicket}
        sale={postPaymentSale || detailData?.sale || null}
        order={postPaymentOrder || detailData?.sale?.order || null}
        table={postPaymentTable || detailData?.sale?.table || null}
        payments={postPaymentPayments}
        points={postPaymentPoints}
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
        autoHideDuration={4200}
      />
    </PageContainer>
  );
}
