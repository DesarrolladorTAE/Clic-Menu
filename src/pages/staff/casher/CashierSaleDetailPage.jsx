// src/pages/staff/casher/CashierSaleDetailPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import {
  fetchCashierSaleDetail,
  takeCashierSale,
} from "../../../services/staff/casher/cashierQueue.service";

import {
  fetchCashierPaymentMethods,
  fetchCashierTaxOptions,
  previewCashierSalePayment,
  payCashierSale,
  extractTicketFromPayResponse,
  extractTicketWarningFromPayResponse,
} from "../../../services/staff/casher/cashierPayment.service";

import {
  fetchCashierSaleDiscountSummary,
  applyCashierSaleGlobalDiscount,
  removeCashierSaleGlobalDiscount,
  applyCashierSaleItemDiscount,
  removeCashierSaleItemDiscount,
} from "../../../services/staff/casher/cashierDiscount.service";

import {
  fetchCashierSaleAdjustments,
  cancelCashierSaleItems,
  cancelCashierSaleOrder,
} from "../../../services/staff/casher/cashierAdjustment.service";

import {
  searchCashierCustomers,
  createCashierCustomer,
  fetchCashierSaleCustomerData,
  saveCashierSaleContactData,
  removeCashierSaleContactData,
  attachCashierSaleCustomer,
  detachCashierSaleCustomer,
} from "../../../services/staff/casher/cashierCustomer.service";

import {
  fetchCashierTicketById,
  openCashierTicketHtmlInNewTab,
  printCashierTicketFromHtml,
  saveCashierTicketPdf,
  openCashierTicketWindow,
} from "../../../services/staff/casher/cashierTicket.service";

import CashierSaleDetailHeroCard from "../../../components/staff/casher/saleDetailPage/CashierSaleDetailHeroCard";
import CashierOrderItemsCard from "../../../components/staff/casher/saleDetailPage/CashierOrderItemsCard";
import CashierSaleSummaryCard from "../../../components/staff/casher/saleDetailPage/CashierSaleSummaryCard";
import CashierPaymentFormCard from "../../../components/staff/casher/saleDetailPage/CashierPaymentFormCard";
import CashierTaxSelectorCard from "../../../components/staff/casher/saleDetailPage/CashierTaxSelectorCard";
import CashierDiscountCard from "../../../components/staff/casher/saleDetailPage/CashierDiscountCard";
import CashierAdjustmentCard from "../../../components/staff/casher/saleDetailPage/CashierAdjustmentCard";
import CashierCustomerCard from "../../../components/staff/casher/saleDetailPage/CashierCustomerCard";
import CashierPostPaymentTicketModal from "../../../components/staff/casher/ticket/CashierPostPaymentTicketModal";

export default function CashierSaleDetailPage() {
  const nav = useNavigate();
  const { saleId } = useParams();

  const [loading, setLoading] = useState(true);
  const [taking, setTaking] = useState(false);

  const [detailData, setDetailData] = useState(null);
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

  const [partialCancelForm, setPartialCancelForm] = useState({
    reason: "",
  });
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

  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [discountBusy, setDiscountBusy] = useState(false);
  const [adjustmentBusy, setAdjustmentBusy] = useState(false);
  const [customerBusy, setCustomerBusy] = useState(false);
  const [searchingCustomers, setSearchingCustomers] = useState(false);

  const [postPaymentOpen, setPostPaymentOpen] = useState(false);
  const [postPaymentTicket, setPostPaymentTicket] = useState(null);
  const [postPaymentTicketWarning, setPostPaymentTicketWarning] = useState(false);
  const [postPaymentTicketErrorCode, setPostPaymentTicketErrorCode] = useState(null);
  const [postPaymentTicketErrorMessage, setPostPaymentTicketErrorMessage] = useState(null);

  const [ticketBusy, setTicketBusy] = useState({
    view: false,
    print: false,
    download: false,
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

  const sale = detailData?.sale || null;
  const cashSession = detailData?.cash_session || null;
  const orderDetail = detailData?.order_detail || null;

  const itemsTree = Array.isArray(orderDetail?.items_tree)
    ? orderDetail.items_tree
    : [];
  const itemsFlat = Array.isArray(orderDetail?.items_flat)
    ? orderDetail.items_flat
    : [];
  const itemsSummary = orderDetail?.items_summary || null;

  const pickErr = (e, fallback) =>
    e?.response?.data?.message || e?.message || fallback;

  const pickCode = (e) => e?.response?.data?.code;
  const pickData = (e) => e?.response?.data?.data || null;

  const createEmptyPayment = (methodId = "") => ({
    localId: `p-${localIdRef.current++}`,
    payment_method_id: methodId ? String(methodId) : "",
    amount: "",
    reference: "",
    last4: "",
    received: "",
  });

  const createEmptyItemDiscountDraft = () => ({
    localId: `d-${draftIdRef.current++}`,
    orderItemId: "",
    type: "fixed",
    value: "",
    reason: "",
  });

  const createEmptyPartialCancelDraft = () => ({
    localId: `c-${cancelDraftIdRef.current++}`,
    orderItemId: "",
    quantity: "",
  });

  const deriveCanOperate = (loadedDetail) => {
    const loadedSale = loadedDetail?.sale || null;
    const loadedSession = loadedDetail?.cash_session || null;
    const loadedOrder = loadedSale?.order || null;

    return (
      String(loadedSale?.status || "") === "taken" &&
      Number(loadedSale?.cash_session_id || 0) ===
        Number(loadedSession?.id || 0) &&
      String(loadedOrder?.status || "") === "paying"
    );
  };

  const deriveCanManageCustomer = (loadedDetail) => {
    const loadedSale = loadedDetail?.sale || null;
    const loadedSession = loadedDetail?.cash_session || null;

    const status = String(loadedSale?.status || "");
    const owned =
      Number(loadedSale?.cash_session_id || 0) ===
      Number(loadedSession?.id || 0);

    return owned && ["taken", "paid"].includes(status);
  };

  const canOperate = useMemo(() => deriveCanOperate(detailData), [detailData]);
  const canManageCustomer = useMemo(
    () => deriveCanManageCustomer(detailData),
    [detailData]
  );

  const canTake = useMemo(() => {
    return String(sale?.status || "") === "pending" && !sale?.cash_session_id;
  }, [sale]);

  const selectedTaxOption = useMemo(() => {
    return (
      taxOptions.find((row) => String(row.code) === String(taxOptionCode)) ||
      null
    );
  }, [taxOptions, taxOptionCode]);

  const hasGlobalDiscount = useMemo(() => {
    return !!discountSummary?.global_discount;
  }, [discountSummary]);

  const buildDefaultTaxCode = (loadedSale, loadedTaxOptions) => {
    const saleTaxKind = String(loadedSale?.tax_kind || "");
    const saleTaxRate = Number(loadedSale?.tax_rate ?? 0);

    const matched = (Array.isArray(loadedTaxOptions) ? loadedTaxOptions : []).find(
      (row) => {
        const rowKind = String(row?.tax_kind || "");
        const rowRate = Number(row?.rate ?? 0);

        if (saleTaxKind === "exempt") {
          return rowKind === "exempt";
        }

        return rowKind === saleTaxKind && Math.abs(rowRate - saleTaxRate) < 0.001;
      }
    );

    return matched?.code || "";
  };

  const syncSaleFromDiscountSummary = (summaryData) => {
    if (!summaryData?.sale) return;

    setDetailData((prev) => {
      if (!prev?.sale) return prev;

      return {
        ...prev,
        sale: {
          ...prev.sale,
          subtotal: summaryData.sale.subtotal,
          discount_total: summaryData.sale.discount_total,
          tip: summaryData.sale.tip,
          total: summaryData.sale.total,
          tax_kind: summaryData.sale.tax_kind,
          tax_rate: summaryData.sale.tax_rate,
          tax_base: summaryData.sale.tax_base,
          tax_total: summaryData.sale.tax_total,
        },
      };
    });
  };

  const initializePayments = (loadedSale, loadedMethods) => {
    const initialTotal = Number(loadedSale?.total || 0);
    const firstMethodId = loadedMethods?.[0]?.id
      ? String(loadedMethods[0].id)
      : "";

    setTip(String(Number(loadedSale?.tip || 0)));
    setPayments([
      {
        ...createEmptyPayment(firstMethodId),
        amount: initialTotal ? String(initialTotal) : "",
      },
    ]);
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

  const loadDiscountSummaryIfNeeded = async (loadedDetail) => {
    const shouldLoad = deriveCanOperate(loadedDetail);

    if (!shouldLoad) {
      setDiscountSummary(null);
      return null;
    }

    try {
      const res = await fetchCashierSaleDiscountSummary(
        loadedDetail?.sale?.sale_id
      );
      setDiscountSummary(res?.data || null);
      syncSaleFromDiscountSummary(res?.data || null);
      return res?.data || null;
    } catch {
      setDiscountSummary(null);
      return null;
    }
  };

  const loadAdjustmentSummaryIfNeeded = async (loadedDetail) => {
    const shouldLoad = deriveCanOperate(loadedDetail);

    if (!shouldLoad) {
      setAdjustmentSummary(null);
      return null;
    }

    try {
      const res = await fetchCashierSaleAdjustments(loadedDetail?.sale?.sale_id);
      setAdjustmentSummary(res?.data || null);
      return res?.data || null;
    } catch {
      setAdjustmentSummary(null);
      return null;
    }
  };

  const loadCustomerSummaryIfNeeded = async (loadedDetail, resetForms = false) => {
    const shouldLoad = deriveCanManageCustomer(loadedDetail);

    if (!shouldLoad) {
      setCustomerSummary(null);
      if (resetForms) {
        syncCustomerFormsFromSummary(null);
        setCustomerSearchResults([]);
      }
      return null;
    }

    try {
      const res = await fetchCashierSaleCustomerData(loadedDetail?.sale?.sale_id);
      setCustomerSummary(res?.data || null);

      if (resetForms) {
        syncCustomerFormsFromSummary(res?.data || null);
        setCustomerSearchResults([]);
      }

      return res?.data || null;
    } catch {
      setCustomerSummary(null);
      return null;
    }
  };

  const load = async ({ preserveForm = false } = {}) => {
    try {
      setLoading(true);

      const [detailRes, methodsRes, taxesRes] = await Promise.all([
        fetchCashierSaleDetail(saleId),
        fetchCashierPaymentMethods(),
        fetchCashierTaxOptions(),
      ]);

      const loadedDetail = detailRes?.data || null;
      const loadedMethods = Array.isArray(methodsRes?.data)
        ? methodsRes.data
        : [];
      const loadedTaxOptions = Array.isArray(taxesRes?.data)
        ? taxesRes.data
        : [];

      setDetailData(loadedDetail);
      setPaymentMethods(loadedMethods);
      setTaxOptions(loadedTaxOptions);

      if (!preserveForm) {
        initializePayments(loadedDetail?.sale || null, loadedMethods);
        setGlobalDiscountForm({
          type: "fixed",
          value: "",
          reason: "",
        });
        setItemDiscountDrafts([]);
        setPartialCancelForm({ reason: "" });
        setPartialCancelDrafts([]);
        setCancelOrderReason("");
        setPreview(null);
      }

      const nextTaxCode = buildDefaultTaxCode(
        loadedDetail?.sale || null,
        loadedTaxOptions
      );

      setTaxOptionCode((prev) => (preserveForm && prev ? prev : nextTaxCode));

      await Promise.all([
        loadDiscountSummaryIfNeeded(loadedDetail),
        loadAdjustmentSummaryIfNeeded(loadedDetail),
        loadCustomerSummaryIfNeeded(loadedDetail, !preserveForm),
      ]);
    } catch (e) {
      const st = e?.response?.status;
      const code = pickCode(e);

      if (
        st === 409 &&
        (code === "NO_OPEN_CASH_SESSION" ||
          code === "SALE_NOT_OWNED_BY_SESSION")
      ) {
        nav("/staff/cashier/queue", { replace: true });
        return;
      }

      if (st === 403 || st === 404) {
        nav("/staff/cashier/queue", { replace: true });
        return;
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo cargar el detalle de la venta."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleId]);

  const handleTakeSale = async () => {
    if (!sale?.sale_id || taking) return;

    try {
      setTaking(true);

      const res = await takeCashierSale(sale.sale_id);

      showAlert({
        severity: "success",
        message: res?.message || "Venta tomada correctamente.",
      });

      setPreview(null);
      await load({ preserveForm: false });
    } catch (e) {
      showAlert({
        severity: "warning",
        message: pickErr(e, "No se pudo tomar la venta."),
      });
    } finally {
      setTaking(false);
    }
  };

  const handleTipChange = (value) => {
    setTip(value);
    setPreview(null);
  };

  const handleAddPayment = () => {
    if (payments.length >= 3) {
      showAlert({
        severity: "warning",
        message: "Solo se permiten máximo 3 métodos de pago por venta.",
      });
      return;
    }

    const firstMethodId = paymentMethods?.[0]?.id
      ? String(paymentMethods[0].id)
      : "";

    setPayments((prev) => [...prev, createEmptyPayment(firstMethodId)]);
    setPreview(null);
  };

  const handleRemovePayment = (localId) => {
    setPayments((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((row) => row.localId !== localId);
    });
    setPreview(null);
  };

  const handlePaymentChange = (localId, field, value) => {
    setPayments((prev) =>
      prev.map((row) => {
        if (row.localId !== localId) return row;

        const nextRow = { ...row, [field]: value };

        if (field === "payment_method_id") {
          const method = paymentMethods.find(
            (m) => Number(m.id) === Number(value || 0)
          );

          if (!method?.requires_reference) nextRow.reference = "";
          if (!method?.requires_last4) nextRow.last4 = "";
          if (!method?.requires_received_amount) nextRow.received = "";
        }

        if (field === "last4") {
          nextRow.last4 = String(value || "")
            .replace(/\D/g, "")
            .slice(0, 4);
        }

        return nextRow;
      })
    );

    setPreview(null);
  };

  const handleGlobalFormChange = (field, value) => {
    setGlobalDiscountForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddItemDiscountDraft = () => {
    if (hasGlobalDiscount) {
      showAlert({
        severity: "warning",
        message:
          "Quita primero el descuento global antes de agregar descuentos por ítem.",
      });
      return;
    }

    setItemDiscountDrafts((prev) => [...prev, createEmptyItemDiscountDraft()]);
  };

  const handleRemoveItemDiscountDraft = (localId) => {
    setItemDiscountDrafts((prev) =>
      prev.filter((draft) => draft.localId !== localId)
    );
  };

  const handleItemDiscountDraftChange = (localId, field, value) => {
    setItemDiscountDrafts((prev) =>
      prev.map((draft) => {
        if (draft.localId !== localId) return draft;
        return {
          ...draft,
          [field]: value,
        };
      })
    );
  };

  const handlePartialFormChange = (field, value) => {
    setPartialCancelForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddPartialDraft = () => {
    setPartialCancelDrafts((prev) => [...prev, createEmptyPartialCancelDraft()]);
  };

  const handleRemovePartialDraft = (localId) => {
    setPartialCancelDrafts((prev) =>
      prev.filter((draft) => draft.localId !== localId)
    );
  };

  const handlePartialDraftChange = (localId, field, value) => {
    setPartialCancelDrafts((prev) =>
      prev.map((draft) => {
        if (draft.localId !== localId) return draft;
        return {
          ...draft,
          [field]: value,
        };
      })
    );
  };

  const handleContactFormChange = (field, value) => {
    setContactForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearchCustomerFormChange = (field, value) => {
    setSearchCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateCustomerFormChange = (field, value) => {
    setCreateCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const normalizedPayload = useMemo(() => {
    return {
      tax_option_code: taxOptionCode || null,
      tip: Number(tip || 0),
      payments: payments.map((row) => ({
        payment_method_id: Number(row.payment_method_id || 0),
        amount: Number(row.amount || 0),
        reference: row.reference?.trim() || null,
        last4: row.last4?.trim() || null,
        received:
          row.received === "" ||
          row.received === null ||
          row.received === undefined
            ? null
            : Number(row.received),
      })),
    };
  }, [payments, taxOptionCode, tip]);

  const validateBeforePreview = () => {
    if (!sale?.sale_id) {
      showAlert({
        severity: "warning",
        message: "No hay una venta válida para procesar.",
      });
      return false;
    }

    if (!canOperate) {
      showAlert({
        severity: "warning",
        message:
          "La venta debe estar tomada por tu caja y la orden en estado paying antes de cobrar.",
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

    if (!payments.length) {
      showAlert({
        severity: "warning",
        message: "Debes agregar al menos un pago.",
      });
      return false;
    }

    if (payments.length > 3) {
      showAlert({
        severity: "warning",
        message: "Solo se permiten máximo 3 métodos de pago por venta.",
      });
      return false;
    }

    const hasInvalidMethod = normalizedPayload.payments.some(
      (row) => !row.payment_method_id
    );

    if (hasInvalidMethod) {
      showAlert({
        severity: "warning",
        message: "Selecciona un método de pago en todos los renglones.",
      });
      return false;
    }

    const ids = normalizedPayload.payments.map((row) =>
      Number(row.payment_method_id)
    );
    const uniqueIds = Array.from(new Set(ids));

    if (ids.length !== uniqueIds.length) {
      showAlert({
        severity: "warning",
        message: "No puedes repetir el mismo método de pago en la misma venta.",
      });
      return false;
    }

    return true;
  };

  const handlePreview = async () => {
    if (!validateBeforePreview()) return;

    try {
      setPreviewing(true);

      const res = await previewCashierSalePayment(
        sale.sale_id,
        normalizedPayload
      );
      setPreview(res?.data?.preview || null);

      showAlert({
        severity: "success",
        message: res?.message || "Vista previa generada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo validar la vista previa del cobro."),
      });
    } finally {
      setPreviewing(false);
    }
  };

  const setTicketBusyKey = (key, value) => {
    setTicketBusy((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClosePostPayment = () => {
    setPostPaymentOpen(false);
  };

  const handleContinueToQueue = () => {
    setPostPaymentOpen(false);
    nav("/staff/cashier/queue", { replace: true });
  };

  const ensureLatestTicket = async () => {
    const currentTicketId = Number(postPaymentTicket?.id || 0);

    if (!currentTicketId) {
      throw new Error("No hay ticket disponible para consultar.");
    }

    const res = await fetchCashierTicketById(currentTicketId);
    return res?.data || postPaymentTicket;
  };

  const handleViewTicket = async () => {
    const ticketWindow = openCashierTicketWindow("Cargando ticket…");

    if (!ticketWindow) {
      showAlert({
        severity: "error",
        message: "El navegador bloqueó la apertura de la vista del ticket.",
      });
      return;
    }

    try {
      setTicketBusyKey("view", true);
      const latestTicket = await ensureLatestTicket();
      setPostPaymentTicket(latestTicket);
      await openCashierTicketHtmlInNewTab(latestTicket.id, ticketWindow);
    } catch (e) {
      try {
        if (!ticketWindow.closed) {
          ticketWindow.close();
        }
      } catch (error) {
        console.error(error);
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo abrir la vista del ticket."),
      });
    } finally {
      setTicketBusyKey("view", false);
    }
  };

  const handlePrintTicket = async () => {
    const printWindow = openCashierTicketWindow("Preparando impresión…");

    if (!printWindow) {
      showAlert({
        severity: "error",
        message: "El navegador bloqueó la ventana de impresión.",
      });
      return;
    }

    try {
      setTicketBusyKey("print", true);
      const latestTicket = await ensureLatestTicket();
      setPostPaymentTicket(latestTicket);
      await printCashierTicketFromHtml(latestTicket.id, printWindow);
    } catch (e) {
      try {
        if (!printWindow.closed) {
          printWindow.close();
        }
      } catch (error) {
        console.error(error);
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo imprimir el ticket."),
      });
    } finally {
      setTicketBusyKey("print", false);
    }
  };

  const handleDownloadTicket = async () => {
    try {
      setTicketBusyKey("download", true);
      const latestTicket = await ensureLatestTicket();
      setPostPaymentTicket(latestTicket);
      await saveCashierTicketPdf(latestTicket.id);
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo descargar el PDF del ticket."),
      });
    } finally {
      setTicketBusyKey("download", false);
    }
  };

  const handlePay = async () => {
    if (!preview) {
      showAlert({
        severity: "warning",
        message: "Primero genera la vista previa del cobro.",
      });
      return;
    }

    try {
      setPaying(true);

      const res = await payCashierSale(sale.sale_id, normalizedPayload);
      const paidSaleData = res?.data?.sale || null;
      const paidOrderData = res?.data?.order || null;
      const paidTableData = res?.data?.table || null;
      const ticketFromPay = extractTicketFromPayResponse(res);
      const ticketWarningData = extractTicketWarningFromPayResponse(res);

      if (paidSaleData) {
        setDetailData((prev) => {
          if (!prev?.sale) return prev;

          return {
            ...prev,
            sale: {
              ...prev.sale,
              status: paidSaleData.status ?? prev.sale.status,
              subtotal: paidSaleData.subtotal ?? prev.sale.subtotal,
              discount_total:
                paidSaleData.discount_total ?? prev.sale.discount_total,
              tip: paidSaleData.tip ?? prev.sale.tip,
              total: paidSaleData.total ?? prev.sale.total,
              tax_kind: paidSaleData.tax_kind ?? prev.sale.tax_kind,
              tax_rate: paidSaleData.tax_rate ?? prev.sale.tax_rate,
              tax_base: paidSaleData.tax_base ?? prev.sale.tax_base,
              tax_total: paidSaleData.tax_total ?? prev.sale.tax_total,
              paid_at: paidSaleData.paid_at ?? prev.sale.paid_at,
              order: {
                ...(prev.sale.order || {}),
                ...(paidOrderData || {}),
              },
              table: {
                ...(prev.sale.table || {}),
                ...(paidTableData || {}),
              },
            },
            cash_session: prev.cash_session,
          };
        });
      }

      setPostPaymentTicket(ticketFromPay || null);
      setPostPaymentTicketWarning(ticketWarningData.ticketWarning);
      setPostPaymentTicketErrorCode(ticketWarningData.ticketErrorCode);
      setPostPaymentTicketErrorMessage(ticketWarningData.ticketErrorMessage);

      setPreview(null);

      showAlert({
        severity: "success",
        message: res?.message || "Venta cobrada correctamente.",
      });

      setPostPaymentOpen(true);
    } catch (e) {
      const code = pickCode(e);

      if (
        code === "SALE_ALREADY_PAID" ||
        code === "SALE_NOT_OWNED_BY_SESSION" ||
        code === "ORDER_NOT_IN_PAYING"
      ) {
        showAlert({
          severity: "warning",
          message: pickErr(e, "La venta ya no está disponible para cobrarse."),
        });

        setTimeout(() => {
          nav("/staff/cashier/queue", { replace: true });
        }, 600);
        return;
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo cobrar la venta."),
      });
    } finally {
      setPaying(false);
    }
  };

  const validateDiscountPayload = (type, value, scopeLabel) => {
    if (!canOperate) {
      showAlert({
        severity: "warning",
        message: "Solo puedes operar descuentos cuando la orden está en caja.",
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

  const handleApplyGlobalDiscount = async () => {
    const { type, value, reason } = globalDiscountForm;

    if (!validateDiscountPayload(type, value, "el descuento total")) return;

    try {
      setDiscountBusy(true);

      const res = await applyCashierSaleGlobalDiscount(sale.sale_id, {
        type,
        value: Number(value || 0),
        reason: reason?.trim() || null,
      });

      setDiscountSummary(res?.data || null);
      syncSaleFromDiscountSummary(res?.data || null);
      setPreview(null);

      showAlert({
        severity: "success",
        message: res?.message || "Descuento global aplicado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo aplicar el descuento global."),
      });
    } finally {
      setDiscountBusy(false);
    }
  };

  const handleRemoveGlobalDiscount = async () => {
    try {
      setDiscountBusy(true);

      const res = await removeCashierSaleGlobalDiscount(sale.sale_id);

      setDiscountSummary(res?.data || null);
      syncSaleFromDiscountSummary(res?.data || null);
      setPreview(null);

      showAlert({
        severity: "success",
        message: res?.message || "Descuento global removido correctamente.",
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

    if (!validateDiscountPayload(draft.type, draft.value, "el descuento por ítem")) {
      return;
    }

    try {
      setDiscountBusy(true);

      const res = await applyCashierSaleItemDiscount(
        sale.sale_id,
        orderItemId,
        {
          type: draft.type,
          value: Number(draft.value || 0),
          reason: draft.reason?.trim() || null,
        }
      );

      setDiscountSummary(res?.data || null);
      syncSaleFromDiscountSummary(res?.data || null);
      setItemDiscountDrafts((prev) =>
        prev.filter((row) => row.localId !== localId)
      );
      setPreview(null);

      showAlert({
        severity: "success",
        message: res?.message || "Descuento por ítem aplicado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo aplicar el descuento por ítem."),
      });
    } finally {
      setDiscountBusy(false);
    }
  };

  const handleRemoveItemDiscount = async (orderItemId) => {
    try {
      setDiscountBusy(true);

      const res = await removeCashierSaleItemDiscount(
        sale.sale_id,
        orderItemId
      );

      setDiscountSummary(res?.data || null);
      syncSaleFromDiscountSummary(res?.data || null);
      setPreview(null);

      showAlert({
        severity: "success",
        message: res?.message || "Descuento por ítem removido correctamente.",
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

  const handleSubmitPartialCancel = async () => {
    if (!canOperate) {
      showAlert({
        severity: "warning",
        message: "La orden debe estar en caja antes de aplicar cancelaciones.",
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

    const hasInvalidItem = items.some(
      (row) => !row.order_item_id || !row.quantity
    );

    if (hasInvalidItem) {
      showAlert({
        severity: "warning",
        message: "Completa el ítem y la cantidad en todos los renglones.",
      });
      return;
    }

    try {
      setAdjustmentBusy(true);

      const res = await cancelCashierSaleItems(sale.sale_id, {
        reason: partialCancelForm.reason.trim(),
        items,
      });

      showAlert({
        severity: "success",
        message: res?.message || "Ajuste parcial aplicado correctamente.",
      });

      setPartialCancelForm({ reason: "" });
      setPartialCancelDrafts([]);
      setPreview(null);

      await load({ preserveForm: false });
    } catch (e) {
      const code = pickCode(e);

      if (code === "PARTIAL_ADJUSTMENT_WOULD_ZERO_ORDER") {
        showAlert({
          severity: "warning",
          message:
            pickErr(
              e,
              "La cancelación parcial dejaría la orden en cero. Usa cancelación total."
            ) || "",
        });
        return;
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo aplicar la cancelación parcial."),
      });
    } finally {
      setAdjustmentBusy(false);
    }
  };

  const handleSubmitCancelOrder = async () => {
    if (!canOperate) {
      showAlert({
        severity: "warning",
        message: "La orden debe estar en caja antes de cancelarla.",
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

    try {
      setAdjustmentBusy(true);

      const res = await cancelCashierSaleOrder(sale.sale_id, {
        reason: cancelOrderReason.trim(),
      });

      showAlert({
        severity: "success",
        message: res?.message || "Orden cancelada correctamente.",
      });

      setTimeout(() => {
        nav("/staff/cashier/queue", { replace: true });
      }, 500);
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo cancelar la orden."),
      });
    } finally {
      setAdjustmentBusy(false);
    }
  };

  const handleSaveContact = async () => {
    if (!canManageCustomer) {
      showAlert({
        severity: "warning",
        message: "La venta debe estar tomada por tu caja para operar datos de cliente.",
      });
      return;
    }

    try {
      setCustomerBusy(true);

      const res = await saveCashierSaleContactData(sale.sale_id, {
        phone: contactForm.phone?.trim() || null,
        email: contactForm.email?.trim() || null,
      });

      setCustomerSummary(res?.data || null);
      syncCustomerFormsFromSummary(res?.data || null);

      showAlert({
        severity: "success",
        message: res?.message || "Contacto simple guardado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo guardar el contacto simple."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

  const handleRemoveContact = async () => {
    try {
      setCustomerBusy(true);

      const res = await removeCashierSaleContactData(sale.sale_id);
      setCustomerSummary(res?.data || null);
      syncCustomerFormsFromSummary(res?.data || null);

      showAlert({
        severity: "success",
        message: res?.message || "Contacto simple eliminado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo eliminar el contacto simple."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

  const handleSearchCustomers = async () => {
    const phone = searchCustomerForm?.phone?.trim() || "";
    const email = searchCustomerForm?.email?.trim() || "";

    if (!phone && !email) {
      showAlert({
        severity: "warning",
        message: "Debes escribir al menos teléfono o correo para buscar.",
      });
      return;
    }

    try {
      setSearchingCustomers(true);

      const res = await searchCashierCustomers({
        phone: phone || undefined,
        email: email || undefined,
      });

      const rows = Array.isArray(res?.data) ? res.data : [];
      setCustomerSearchResults(rows);

      if (!rows.length) {
        showAlert({
          severity: "info",
          message: "No se encontraron clientes con esos datos.",
        });
        return;
      }

      showAlert({
        severity: "success",
        message: "Búsqueda de clientes completada.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo buscar el cliente."),
      });
    } finally {
      setSearchingCustomers(false);
    }
  };

  const handleAttachCustomer = async (customerId) => {
    try {
      setCustomerBusy(true);

      const res = await attachCashierSaleCustomer(sale.sale_id, {
        customer_id: Number(customerId),
      });

      setCustomerSummary(res?.data || null);
      syncCustomerFormsFromSummary(res?.data || null);
      setCustomerSearchResults([]);

      showAlert({
        severity: "success",
        message: res?.message || "Cliente asociado correctamente a la venta.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo asociar el cliente a la venta."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

  const handleDetachCustomer = async () => {
    try {
      setCustomerBusy(true);

      const res = await detachCashierSaleCustomer(sale.sale_id);
      setCustomerSummary(res?.data || null);
      syncCustomerFormsFromSummary(res?.data || null);

      showAlert({
        severity: "success",
        message: res?.message || "Cliente desvinculado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo desvincular el cliente."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

  const handleCreateAndAttachCustomer = async () => {
    try {
      setCustomerBusy(true);

      const createPayload = {
        name_alias: createCustomerForm?.name_alias?.trim() || null,
        phone: createCustomerForm?.phone?.trim() || null,
        email: createCustomerForm?.email?.trim() || null,
        razon_social: createCustomerForm?.razon_social?.trim() || null,
        rfc: createCustomerForm?.rfc?.trim() || null,
        regimen: createCustomerForm?.regimen || null,
        postal_code: createCustomerForm?.postal_code?.trim() || null,
      };

      const created = await createCashierCustomer(createPayload);
      const createdCustomerId = Number(created?.data?.id || 0);

      if (!createdCustomerId) {
        throw new Error("No se obtuvo el id del cliente creado.");
      }

      const attached = await attachCashierSaleCustomer(sale.sale_id, {
        customer_id: createdCustomerId,
      });

      setCustomerSummary(attached?.data || null);
      syncCustomerFormsFromSummary(attached?.data || null);
      setCustomerSearchResults([]);

      showAlert({
        severity: "success",
        message: "Cliente creado y asociado correctamente a la venta.",
      });
    } catch (e) {
      const code = pickCode(e);
      const data = pickData(e);

      if (code === "CUSTOMER_ALREADY_EXISTS" && Number(data?.customer_id || 0)) {
        try {
          const attached = await attachCashierSaleCustomer(sale.sale_id, {
            customer_id: Number(data.customer_id),
          });

          setCustomerSummary(attached?.data || null);
          syncCustomerFormsFromSummary(attached?.data || null);
          setCustomerSearchResults([]);

          showAlert({
            severity: "success",
            message:
              "El cliente ya existía y se asoció correctamente a la venta.",
          });
          return;
        } catch (attachError) {
          showAlert({
            severity: "error",
            message: pickErr(
              attachError,
              "El cliente ya existía, pero no se pudo asociar a la venta."
            ),
          });
          return;
        }
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo crear y asociar el cliente."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

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
            <Typography sx={{ mt: 2, color: "text.secondary", fontSize: 14 }}>
              Cargando detalle de venta…
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
          cashSession={cashSession}
          canOperate={canOperate}
          canTake={canTake}
          taking={taking}
          onTake={handleTakeSale}
          onBack={() => nav("/staff/cashier/queue")}
        />

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "1fr",
              xl: "1.2fr 0.9fr",
            },
            alignItems: "start",
          }}
        >
          <Stack spacing={3}>
            <CashierOrderItemsCard
              itemsTree={itemsTree}
              itemsSummary={itemsSummary}
            />

            <CashierAdjustmentCard
              sale={sale}
              itemsFlat={itemsFlat}
              summary={adjustmentSummary}
              partialForm={partialCancelForm}
              onPartialFormChange={handlePartialFormChange}
              partialDrafts={partialCancelDrafts}
              onAddPartialDraft={handleAddPartialDraft}
              onRemovePartialDraft={handleRemovePartialDraft}
              onPartialDraftChange={handlePartialDraftChange}
              onSubmitPartial={handleSubmitPartialCancel}
              cancelOrderReason={cancelOrderReason}
              onCancelOrderReasonChange={setCancelOrderReason}
              onSubmitCancelOrder={handleSubmitCancelOrder}
              busy={adjustmentBusy}
              disabled={!canOperate || previewing || paying || postPaymentOpen}
            />

            <CashierDiscountCard
              sale={sale}
              itemsFlat={itemsFlat}
              summary={discountSummary}
              globalForm={globalDiscountForm}
              onGlobalFormChange={handleGlobalFormChange}
              itemDiscountDrafts={itemDiscountDrafts}
              onAddItemDiscountDraft={handleAddItemDiscountDraft}
              onRemoveItemDiscountDraft={handleRemoveItemDiscountDraft}
              onItemDiscountDraftChange={handleItemDiscountDraftChange}
              onApplyGlobal={handleApplyGlobalDiscount}
              onRemoveGlobal={handleRemoveGlobalDiscount}
              onApplyItemDraft={handleApplyItemDraft}
              onRemoveItem={handleRemoveItemDiscount}
              busy={discountBusy}
              disabled={!canOperate || previewing || paying || postPaymentOpen}
            />
          </Stack>

          <Stack spacing={3}>
            <CashierSaleSummaryCard
              sale={sale}
              liveTip={Number(tip || 0)}
              preview={preview}
              selectedTaxOption={selectedTaxOption}
            />

            <CashierCustomerCard
              summary={customerSummary}
              contactForm={contactForm}
              onContactFormChange={handleContactFormChange}
              onSaveContact={handleSaveContact}
              onRemoveContact={handleRemoveContact}
              searchForm={searchCustomerForm}
              onSearchFormChange={handleSearchCustomerFormChange}
              onSearch={handleSearchCustomers}
              searchResults={customerSearchResults}
              onAttachCustomer={handleAttachCustomer}
              createForm={createCustomerForm}
              onCreateFormChange={handleCreateCustomerFormChange}
              onCreateAndAttach={handleCreateAndAttachCustomer}
              onDetachCustomer={handleDetachCustomer}
              searching={searchingCustomers}
              busy={customerBusy}
              disabled={!canManageCustomer || previewing || paying || postPaymentOpen}
            />

            <CashierTaxSelectorCard
              taxOptions={taxOptions}
              value={taxOptionCode}
              onChange={(nextValue) => {
                setTaxOptionCode(nextValue);
                setPreview(null);
              }}
              disabled={!canOperate || previewing || paying || postPaymentOpen}
            />

            <CashierPaymentFormCard
              methods={paymentMethods}
              tip={tip}
              onTipChange={handleTipChange}
              payments={payments}
              onAddPayment={handleAddPayment}
              onRemovePayment={handleRemovePayment}
              onPaymentChange={handlePaymentChange}
              onPreview={handlePreview}
              previewing={previewing}
              paying={paying}
              hasPreview={!!preview}
              onPay={handlePay}
              disabled={!canOperate || postPaymentOpen}
            />
          </Stack>
        </Box>
      </Stack>

      <CashierPostPaymentTicketModal
        open={postPaymentOpen}
        onClose={handleClosePostPayment}
        onContinue={handleContinueToQueue}
        onViewTicket={handleViewTicket}
        onPrintTicket={handlePrintTicket}
        onDownloadTicket={handleDownloadTicket}
        busyView={ticketBusy.view}
        busyPrint={ticketBusy.print}
        busyDownload={ticketBusy.download}
        ticket={postPaymentTicket}
        sale={detailData?.sale || null}
        order={detailData?.sale?.order || null}
        table={detailData?.sale?.table || null}
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