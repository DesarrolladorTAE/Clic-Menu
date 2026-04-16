import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import { useStaffAuth } from "../../../../context/StaffAuthContext";

import {
  fetchCashierSaleRefundSummary,
  refundCashierSaleAmount,
  refundCashierSaleFull,
  refundCashierSaleItems,
} from "../../../../services/staff/casher/cashierRefunds.service";

import CashierRefundDetailHeroCard from "../../../../components/staff/casher/refunds/CashierRefundDetailHeroCard";
import CashierRefundSummaryCard from "../../../../components/staff/casher/refunds/CashierRefundSummaryCard";
import CashierRefundActionsCard from "../../../../components/staff/casher/refunds/CashierRefundActionsCard";

export default function CashierRefundSaleDetailPage() {
  const nav = useNavigate();
  const { saleId } = useParams();
  const { clearStaff } = useStaffAuth() || {};

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState(null);
  const [refundPermissions, setRefundPermissions] = useState({
    can_refund: true,
    same_cash_session: true,
    message: "",
  });

  const [fullReason, setFullReason] = useState("");
  const [amountForm, setAmountForm] = useState({
    amount: "",
    reason: "",
  });
  const [itemDrafts, setItemDrafts] = useState([]);

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

  const load = async () => {
    try {
      setLoading(true);

      const res = await fetchCashierSaleRefundSummary(saleId);
      const data = res?.data || null;

      setSummary(data);
      setRefundPermissions(
        data?.refund_permissions || {
          can_refund: true,
          same_cash_session: true,
          message: "",
        }
      );
    } catch (e) {
      const st = e?.response?.status;
      const code = pickCode(e);

      if (st === 409 && code === "NO_OPEN_CASH_SESSION") {
        nav("/staff/cashier", { replace: true });
        return;
      }

      if (st === 401) {
        clearStaff?.();
        nav("/staff/login", { replace: true });
        return;
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo cargar el detalle histórico."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [saleId]);

  const orderItems = useMemo(() => {
    return Array.isArray(summary?.order_items) ? summary.order_items : [];
  }, [summary]);

  const hasRefundBalance = Number(summary?.sale?.available_to_refund || 0) > 0;
  const canRefund =
    Boolean(refundPermissions?.can_refund) && hasRefundBalance;

  const handleBack = () => {
    nav("/staff/cashier/refunds");
  };

  const handleAmountFormChange = (key, value) => {
    setAmountForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddItemDraft = () => {
    setItemDrafts((prev) => [
      ...prev,
      {
        localId: `${Date.now()}-${Math.random()}`,
        order_item_id: "",
        amount: "",
      },
    ]);
  };

  const handleRemoveItemDraft = (localId) => {
    setItemDrafts((prev) => prev.filter((row) => row.localId !== localId));
  };

  const handleItemDraftChange = (localId, key, value) => {
    setItemDrafts((prev) =>
      prev.map((row) =>
        row.localId === localId
          ? {
              ...row,
              [key]: value,
            }
          : row
      )
    );
  };

  const resetForms = () => {
    setFullReason("");
    setAmountForm({
      amount: "",
      reason: "",
    });
    setItemDrafts([]);
  };

  const validateAmountRefund = () => {
    const amount = Number(amountForm?.amount || 0);
    const reason = String(amountForm?.reason || "").trim();
    const available = Number(summary?.sale?.available_to_refund || 0);

    if (!reason) {
      showAlert({
        severity: "warning",
        message: "Debes capturar un motivo para el refund por monto.",
      });
      return false;
    }

    if (!amount || amount <= 0) {
      showAlert({
        severity: "warning",
        message: "Debes capturar un monto válido para refund.",
      });
      return false;
    }

    if (amount > available) {
      showAlert({
        severity: "warning",
        message: "El monto supera el saldo disponible para refund.",
      });
      return false;
    }

    return true;
  };

  const validateItemRefund = () => {
    if (!Array.isArray(itemDrafts) || itemDrafts.length === 0) {
      showAlert({
        severity: "warning",
        message: "Agrega al menos un ítem para aplicar refund por líneas.",
      });
      return false;
    }

    const usedIds = new Set();

    for (const draft of itemDrafts) {
      const orderItemId = Number(draft?.order_item_id || 0);
      const amount = Number(draft?.amount || 0);

      if (!orderItemId) {
        showAlert({
          severity: "warning",
          message: "Selecciona un ítem válido para cada refund por líneas.",
        });
        return false;
      }

      if (usedIds.has(orderItemId)) {
        showAlert({
          severity: "warning",
          message: "No repitas el mismo ítem dentro del mismo refund.",
        });
        return false;
      }

      usedIds.add(orderItemId);

      if (!amount || amount <= 0) {
        showAlert({
          severity: "warning",
          message: "Cada ítem debe tener un monto válido a devolver.",
        });
        return false;
      }

      const found = orderItems.find(
        (row) => Number(row?.order_item_id) === orderItemId
      );
      const available = Number(found?.available_to_refund || 0);

      if (!found) {
        showAlert({
          severity: "warning",
          message: `El ítem ${orderItemId} ya no está disponible para refund.`,
        });
        return false;
      }

      if (amount > available) {
        showAlert({
          severity: "warning",
          message: `El monto del ítem #${orderItemId} supera lo disponible para refund.`,
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmitFull = async () => {
    const reason = String(fullReason || "").trim();

    if (!canRefund) {
      showAlert({
        severity: "warning",
        message:
          refundPermissions?.message ||
          "Esta venta solo está disponible para consulta.",
      });
      return;
    }

    if (!reason) {
      showAlert({
        severity: "warning",
        message: "Debes capturar un motivo para el refund total.",
      });
      return;
    }

    try {
      setBusy(true);

      const res = await refundCashierSaleFull(saleId, { reason });
      const data = res?.data?.summary || null;

      setSummary(data);
      setRefundPermissions(
        data?.refund_permissions || refundPermissions
      );
      resetForms();

      showAlert({
        severity: "success",
        message: res?.message || "Refund total aplicado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo aplicar el refund total."),
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitAmount = async () => {
    if (!canRefund) {
      showAlert({
        severity: "warning",
        message:
          refundPermissions?.message ||
          "Esta venta solo está disponible para consulta.",
      });
      return;
    }

    if (!validateAmountRefund()) return;

    try {
      setBusy(true);

      const res = await refundCashierSaleAmount(saleId, {
        amount: Number(amountForm.amount),
        reason: String(amountForm.reason).trim(),
      });

      const data = res?.data?.summary || null;

      setSummary(data);
      setRefundPermissions(
        data?.refund_permissions || refundPermissions
      );
      setAmountForm({
        amount: "",
        reason: "",
      });

      showAlert({
        severity: "success",
        message: res?.message || "Refund parcial por monto aplicado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo aplicar el refund por monto."),
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitItems = async () => {
    if (!canRefund) {
      showAlert({
        severity: "warning",
        message:
          refundPermissions?.message ||
          "Esta venta solo está disponible para consulta.",
      });
      return;
    }

    if (!validateItemRefund()) return;

    const reason = window.prompt("Escribe el motivo del refund por ítems:");
    const normalizedReason = String(reason || "").trim();

    if (!normalizedReason) {
      showAlert({
        severity: "warning",
        message: "Debes capturar un motivo para el refund por ítems.",
      });
      return;
    }

    try {
      setBusy(true);

      const payload = {
        reason: normalizedReason,
        items: itemDrafts.map((draft) => ({
          order_item_id: Number(draft.order_item_id),
          amount: Number(draft.amount),
        })),
      };

      const res = await refundCashierSaleItems(saleId, payload);
      const data = res?.data?.summary || null;

      setSummary(data);
      setRefundPermissions(
        data?.refund_permissions || refundPermissions
      );
      setItemDrafts([]);

      showAlert({
        severity: "success",
        message: res?.message || "Refund parcial por ítems aplicado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo aplicar el refund por ítems."),
      });
    } finally {
      setBusy(false);
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
              Cargando detalle histórico…
            </Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <CashierRefundDetailHeroCard
          summary={summary}
          onBack={handleBack}
        />

        {!refundPermissions?.can_refund ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "#F3D39A",
              backgroundColor: "#FFF8E8",
            }}
          >
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 800,
                color: "#8A6D3B",
              }}
            >
              Solo consulta
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.55,
              }}
            >
              {refundPermissions?.message ||
                "Puedes consultar esta venta, pero solo la misma caja que la cobró puede aplicar refunds."}
            </Typography>
          </Box>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "repeat(1, minmax(0, 1fr))",
              xl: "minmax(0, 0.95fr) minmax(0, 1.05fr)",
            },
          }}
        >
          <CashierRefundSummaryCard summary={summary} />

          <CashierRefundActionsCard
            summary={summary}
            fullReason={fullReason}
            onFullReasonChange={setFullReason}
            onSubmitFull={handleSubmitFull}
            amountForm={amountForm}
            onAmountFormChange={handleAmountFormChange}
            onSubmitAmount={handleSubmitAmount}
            itemDrafts={itemDrafts}
            onAddItemDraft={handleAddItemDraft}
            onRemoveItemDraft={handleRemoveItemDraft}
            onItemDraftChange={handleItemDraftChange}
            onSubmitItems={handleSubmitItems}
            busy={busy}
            disabled={!canRefund}
          />
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