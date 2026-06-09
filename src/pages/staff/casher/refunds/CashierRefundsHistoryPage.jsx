// src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, CircularProgress, Stack, Typography,
} from "@mui/material";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import usePagination from "../../../../hooks/usePagination";
import { useStaffAuth } from "../../../../context/StaffAuthContext";

import {
  fetchCashierRefundSalesHistory,
  fetchCashierSaleRefundSummary,
  refundCashierSaleFull,
} from "../../../../services/staff/casher/cashierRefunds.service";

import {
  sendCashierSaleTicketWhatsapp,
  fetchCashierSaleTicketPrintConfig,
  fetchCashierSaleTicketPrintPayload,
  sendCashierThermalPrintPayload,
} from "../../../../services/staff/casher/cashierTicket.service";

import CashierRefundsHeroCard from "../../../../components/staff/casher/refunds/CashierRefundsHeroCard";
import CashierRefundHistoryFiltersCard from "../../../../components/staff/casher/refunds/CashierRefundHistoryFiltersCard";
import CashierRefundSalesPanel from "../../../../components/staff/casher/refunds/CashierRefundSalesPanel";
import CashierRefundTicketActionsDialog from "../../../../components/staff/casher/refunds/CashierRefundTicketActionsDialog";
import CashierRefundSaleDetailDialog from "../../../../components/staff/casher/refunds/CashierRefundSaleDetailDialog";
import CashierRefundFullCancelDialog from "../../../../components/staff/casher/refunds/CashierRefundFullCancelDialog";

const PAGE_SIZE = 6;

export default function CashierRefundsHistoryPage() {
  const nav = useNavigate();
  const { clearStaff } = useStaffAuth() || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState([]);

  const [ticketActionsSale, setTicketActionsSale] = useState(null);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);

  const [thermalPrintSaleId, setThermalPrintSaleId] = useState(null);
  const [thermalConfig, setThermalConfig] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [cancelReason, setCancelReason] = useState("");
  const [cancelBusy, setCancelBusy] = useState(false);

  const [filters, setFilters] = useState({
    query: "",
    status: "all",
  });

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "info",
    title: "",
    message: "",
  });

  const pollRef = useRef(null);

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

  const normalizeRows = (res) => {
    const raw = res?.data?.rows || res?.data?.sales || res?.data || [];

    if (!Array.isArray(raw)) return [];

    return raw.map((row) => {
      const saleId = Number(row?.sale_id ?? row?.id ?? 0);
      const orderId = Number(row?.order_id ?? row?.order?.id ?? 0);
      const ticketFolio = row?.ticket?.folio || row?.ticket_folio || null;
      const customerName =
        row?.order?.customer_name?.trim?.() ||
        row?.customer_name?.trim?.() ||
        "Cliente sin nombre";
      const total = Number(row?.total || 0);
      const refundedTotal = Number(row?.refunded_total || 0);
      const availableToRefund = Math.max(total - refundedTotal, 0);

      return {
        sale_id: saleId,
        order_id: orderId || null,
        ticket_folio: ticketFolio,
        customer_name: customerName,
        status: String(row?.status || ""),
        total,
        refunded_total: refundedTotal,
        available_to_refund: availableToRefund,
        paid_at: row?.paid_at || null,

        ticket: row?.ticket || null,
        customer: row?.customer || null,
        contact_data: row?.contact_data || null,
      };
    });
  };

  const load = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const res = await fetchCashierRefundSalesHistory();
      setRows(normalizeRows(res));
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
        message: pickErr(e, "No se pudo cargar el historial de ventas."),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();

    pollRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        load({ silent: true });
      }
    }, 12000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    const query = String(filters?.query || "").trim().toLowerCase();
    const status = String(filters?.status || "all");

    return rows.filter((row) => {
      const rowStatus = String(row?.status || "");

      if (!["paid", "refunded"].includes(rowStatus)) return false;

      if (status !== "all" && rowStatus !== status) return false;

      if (!query) return true;

      const haystack = [
        row?.sale_id,
        row?.order_id,
        row?.ticket_folio,
        row?.customer_name,
        rowStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [rows, filters]);

  const {
    page,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    nextPage,
    prevPage,
    paginatedItems,
  } = usePagination({
    items: filteredRows,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const loadSaleSummary = async (sale) => {
    const saleId = Number(sale?.sale_id || 0);

    if (!saleId) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "No se pudo identificar la venta.",
      });
      return null;
    }

    setSummaryLoading(true);

    try {
      const res = await fetchCashierSaleRefundSummary(saleId);
      const data = res?.data || null;
      setSelectedSummary(data);
      return data;
    } catch (e) {
      showAlert({
        severity: "error",
        title: "No se pudo cargar",
        message: pickErr(e, "No se pudo cargar el detalle de la venta."),
      });
      return null;
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleOpenDetail = async (sale) => {
    const data = await loadSaleSummary(sale);

    if (!data) return;

    setDetailOpen(true);
  };


  const handleOpenCancel = async (sale) => {
    const data = await loadSaleSummary(sale);

    if (!data) return;

    setCancelReason("");
    setCancelOpen(true);
  };

  const handleCloseDetail = () => {
    if (summaryLoading) return;
    setDetailOpen(false);
  };

  const handleCloseCancel = () => {
    if (cancelBusy) return;
    setCancelOpen(false);
    setCancelReason("");
  };

  const handleSubmitFullCancel = async () => {
    const saleId = Number(selectedSummary?.sale?.id || 0);
    const reason = String(cancelReason || "").trim();

    if (!saleId) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "No se pudo identificar la venta.",
      });
      return;
    }

    if (!reason) {
      showAlert({
        severity: "warning",
        title: "Motivo requerido",
        message: "Debes escribir el motivo de la cancelación/devolución.",
      });
      return;
    }

    setCancelBusy(true);

    try {
      const res = await refundCashierSaleFull(saleId, { reason });
      const data = res?.data?.summary || null;

      setSelectedSummary(data);
      setCancelOpen(false);
      setCancelReason("");

      showAlert({
        severity: "success",
        title: "Devolución aplicada",
        message: res?.message || "Devolución total aplicada correctamente.",
      });

      await load({ silent: true });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "No se pudo aplicar",
        message: pickErr(e, "No se pudo aplicar la devolución total."),
      });
    } finally {
      setCancelBusy(false);
    }
  };

  const handleThermalPrintTicket = async (sale) => {
    const saleId = Number(sale?.sale_id || 0);

    if (!saleId) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "No se pudo identificar la venta.",
      });
      return;
    }

    if (!sale?.ticket?.id) {
      showAlert({
        severity: "warning",
        title: "Ticket no disponible",
        message: "Esta venta no tiene ticket disponible para imprimir.",
      });
      return;
    }

    setThermalPrintSaleId(saleId);

    try {
      const configRes = await fetchCashierSaleTicketPrintConfig(saleId);
      const config = configRes?.data || null;

      if (!config?.enabled || !config?.show_print_button) {
        showAlert({
          severity: "warning",
          title: "Impresión no disponible",
          message:
            config?.message ||
            "La impresión térmica no está habilitada para esta sucursal.",
        });
        return;
      }

      const payloadRes = await fetchCashierSaleTicketPrintPayload(saleId);
      const payload = payloadRes?.payload || null;

      if (!payload) {
        throw new Error("No se recibió el payload de impresión térmica.");
      }

      await sendCashierThermalPrintPayload(payload, config);

      showAlert({
        severity: "success",
        title: "Ticket enviado",
        message: "Ticket enviado a impresión térmica correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "No se pudo imprimir",
        message: pickErr(
          e,
          "No se pudo enviar el ticket a la aplicación de impresión térmica."
        ),
      });
    } finally {
      setThermalPrintSaleId(null);
    }
  };

  const handleOpenTicketActions = async (sale) => {
    if (!sale?.sale_id) return;

    if (!sale?.ticket?.id) {
      showAlert({
        severity: "warning",
        title: "Ticket no disponible",
        message: "Esta venta no tiene ticket disponible.",
      });
      return;
    }

    setTicketActionsSale(sale);
    setThermalConfig(null);

    try {
      const configRes = await fetchCashierSaleTicketPrintConfig(sale.sale_id);
      setThermalConfig(configRes?.data || null);
    } catch {
      setThermalConfig(null);
    }
  };

  const handleCloseTicketActions = () => {
    if (sendingWhatsapp || thermalPrintSaleId) return;

    setTicketActionsSale(null);
    setThermalConfig(null);
  };

  const handleSendWhatsapp = async ({ sale, phone, save_contact }) => {
    const saleId = sale?.sale_id;

    if (!saleId) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "No se pudo identificar la venta.",
      });
      return;
    }

    setSendingWhatsapp(true);

    try {
      const res = await sendCashierSaleTicketWhatsapp(saleId, {
        phone,
        save_contact,
        body: null,
      });

      showAlert({
        severity: "success",
        title: "Ticket enviado",
        message: res?.message || "Ticket enviado correctamente por WhatsApp.",
      });

      setTicketActionsSale(null);
      setThermalConfig(null);

      await load({ silent: true });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "No se pudo enviar",
        message: pickErr(
          e,
          "No se pudo reenviar el ticket por WhatsApp."
        ),
      });
    } finally {
      setSendingWhatsapp(false);
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
              Cargando historial de ventas…
            </Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <CashierRefundsHeroCard syncing={refreshing} rows={rows} />

        <CashierRefundHistoryFiltersCard
          filters={filters}
          onChange={handleFilterChange}
        />

        <CashierRefundSalesPanel
          sales={paginatedItems}
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          total={total}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={prevPage}
          onNext={nextPage}
          onOpenDetail={handleOpenDetail}
          onOpenCancel={handleOpenCancel}
          onOpenTicketActions={handleOpenTicketActions}
          thermalPrintSaleId={thermalPrintSaleId}
        />
      </Stack>

      <CashierRefundTicketActionsDialog
        open={!!ticketActionsSale}
        sale={ticketActionsSale}
        sendingWhatsapp={sendingWhatsapp}
        onClose={handleCloseTicketActions}
        onSendWhatsapp={handleSendWhatsapp}
        thermalEnabled={Boolean(
          thermalConfig?.enabled && thermalConfig?.show_print_button
        )}
        thermalConfig={thermalConfig}
        onThermalPrint={handleThermalPrintTicket}
        thermalPrinting={
          Number(thermalPrintSaleId || 0) ===
          Number(ticketActionsSale?.sale_id || 0)
        }
      />

      <CashierRefundSaleDetailDialog
        open={detailOpen}
        onClose={handleCloseDetail}
        summary={selectedSummary}
      />

      <CashierRefundFullCancelDialog
        open={cancelOpen}
        onClose={handleCloseCancel}
        summary={selectedSummary}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        onSubmit={handleSubmitFullCancel}
        busy={cancelBusy}
        disabled={!selectedSummary?.refund_permissions?.can_refund}
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