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
} from "../../../services/staff/casher/cashierPayment.service";

import {
  fetchCashierSaleDiscountSummary,
  applyCashierSaleGlobalDiscount,
  removeCashierSaleGlobalDiscount,
  applyCashierSaleItemDiscount,
  removeCashierSaleItemDiscount,
} from "../../../services/staff/casher/cashierDiscount.service";

import CashierSaleDetailHeroCard from "../../../components/staff/casher/saleDetailPage/CashierSaleDetailHeroCard";
import CashierOrderItemsCard from "../../../components/staff/casher/saleDetailPage/CashierOrderItemsCard";
import CashierSaleSummaryCard from "../../../components/staff/casher/saleDetailPage/CashierSaleSummaryCard";
import CashierPaymentFormCard from "../../../components/staff/casher/saleDetailPage/CashierPaymentFormCard";
import CashierTaxSelectorCard from "../../../components/staff/casher/saleDetailPage/CashierTaxSelectorCard";
import CashierDiscountCard from "../../../components/staff/casher/saleDetailPage/CashierDiscountCard";

export default function CashierSaleDetailPage() {
  const nav = useNavigate();
  const { saleId } = useParams();

  const [loading, setLoading] = useState(true);
  const [taking, setTaking] = useState(false);

  const [detailData, setDetailData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [discountSummary, setDiscountSummary] = useState(null);

  const [taxOptionCode, setTaxOptionCode] = useState("");
  const [tip, setTip] = useState("0");
  const [payments, setPayments] = useState([]);

  const [globalDiscountForm, setGlobalDiscountForm] = useState({
    type: "fixed",
    value: "",
    reason: "",
  });

  const [itemDiscountDrafts, setItemDiscountDrafts] = useState([]);

  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [discountBusy, setDiscountBusy] = useState(false);

  const localIdRef = useRef(1);
  const draftIdRef = useRef(1);

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

  const canOperate = useMemo(() => deriveCanOperate(detailData), [detailData]);

  const canTake = useMemo(() => {
    return (
      String(sale?.status || "") === "pending" && !sale?.cash_session_id
    );
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

  const loadDiscountSummaryIfNeeded = async (loadedDetail) => {
    const shouldLoad = deriveCanOperate(loadedDetail);

    if (!shouldLoad) {
      setDiscountSummary(null);
      return;
    }

    try {
      const res = await fetchCashierSaleDiscountSummary(
        loadedDetail?.sale?.sale_id
      );
      setDiscountSummary(res?.data || null);
      syncSaleFromDiscountSummary(res?.data || null);
    } catch {
      setDiscountSummary(null);
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
      }

      const nextTaxCode = buildDefaultTaxCode(
        loadedDetail?.sale || null,
        loadedTaxOptions
      );

      setTaxOptionCode((prev) => (preserveForm && prev ? prev : nextTaxCode));

      await loadDiscountSummaryIfNeeded(loadedDetail);
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

      showAlert({
        severity: "success",
        message: res?.message || "Venta cobrada correctamente.",
      });

      setTimeout(() => {
        nav("/staff/cashier/queue", { replace: true });
      }, 450);
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
              disabled={!canOperate || previewing || paying}
            />
          </Stack>

          <Stack spacing={3}>
            <CashierSaleSummaryCard
              sale={sale}
              liveTip={Number(tip || 0)}
              preview={preview}
              selectedTaxOption={selectedTaxOption}
            />

            <CashierTaxSelectorCard
              taxOptions={taxOptions}
              value={taxOptionCode}
              onChange={(nextValue) => {
                setTaxOptionCode(nextValue);
                setPreview(null);
              }}
              disabled={!canOperate || previewing || paying}
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
              disabled={!canOperate}
            />
          </Stack>
        </Box>
      </Stack>

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