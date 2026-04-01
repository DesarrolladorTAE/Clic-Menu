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
} from "../../../services/staff/casher/cashierQueue.service";

import {
  fetchCashierPaymentMethods,
  previewCashierSalePayment,
  payCashierSale,
} from "../../../services/staff/casher/cashierPayment.service";

import CashierSaleDetailHeroCard from "../../../components/staff/casher/saleDetailPage/CashierSaleDetailHeroCard";
import CashierOrderItemsCard from "../../../components/staff/casher/saleDetailPage/CashierOrderItemsCard";
import CashierSaleSummaryCard from "../../../components/staff/casher/saleDetailPage/CashierSaleSummaryCard";
import CashierPaymentFormCard from "../../../components/staff/casher/saleDetailPage/CashierPaymentFormCard";

export default function CashierSaleDetailPage() {
  const nav = useNavigate();
  const { saleId } = useParams();

  const [loading, setLoading] = useState(true);
  const [detailData, setDetailData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [tip, setTip] = useState("0");
  const [payments, setPayments] = useState([]);

  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [paying, setPaying] = useState(false);

  const localIdRef = useRef(1);

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

  const load = async () => {
    try {
      setLoading(true);

      const [detailRes, methodsRes] = await Promise.all([
        fetchCashierSaleDetail(saleId),
        fetchCashierPaymentMethods(),
      ]);

      const loadedDetail = detailRes?.data || null;
      const loadedMethods = Array.isArray(methodsRes?.data) ? methodsRes.data : [];

      setDetailData(loadedDetail);
      setPaymentMethods(loadedMethods);

      const initialTotal = Number(loadedDetail?.sale?.total || 0);
      const firstMethodId = loadedMethods?.[0]?.id ? String(loadedMethods[0].id) : "";

      setTip(String(Number(loadedDetail?.sale?.tip || 0)));
      setPayments([
        {
          ...createEmptyPayment(firstMethodId),
          amount: initialTotal ? String(initialTotal) : "",
        },
      ]);
    } catch (e) {
      const st = e?.response?.status;
      const code = pickCode(e);

      if (
        st === 409 &&
        (code === "NO_OPEN_CASH_SESSION" || code === "SALE_NOT_OWNED_BY_SESSION")
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

  const handleTipChange = (value) => {
    setTip(value);
    setPreview(null);
  };

  const handleAddPayment = () => {
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
      prev.map((row) =>
        row.localId === localId ? { ...row, [field]: value } : row
      )
    );
    setPreview(null);
  };

  const normalizedPayload = useMemo(() => {
    return {
      tip: Number(tip || 0),
      payments: payments.map((row) => ({
        payment_method_id: Number(row.payment_method_id || 0),
        amount: Number(row.amount || 0),
        reference: row.reference?.trim() || null,
        last4: row.last4?.trim() || null,
        received:
          row.received === "" || row.received === null || row.received === undefined
            ? null
            : Number(row.received),
      })),
    };
  }, [payments, tip]);

  const validateBeforePreview = () => {
    if (!sale?.sale_id) {
      showAlert({
        severity: "warning",
        message: "No hay una venta válida para procesar.",
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

    return true;
  };

  const handlePreview = async () => {
    if (!validateBeforePreview()) return;

    try {
      setPreviewing(true);

      const res = await previewCashierSalePayment(sale.sale_id, normalizedPayload);
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
              itemsTree={orderDetail?.items_tree || []}
              itemsSummary={orderDetail?.items_summary || null}
            />
          </Stack>

          <Stack spacing={3}>
            <CashierSaleSummaryCard
              sale={sale}
              liveTip={Number(tip || 0)}
              preview={preview}
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
