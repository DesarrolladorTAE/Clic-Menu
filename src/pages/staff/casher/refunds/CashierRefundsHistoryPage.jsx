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
  executeCashierNetpayCancellation,
  resumeCashierPendingNetpayCancellation,
} from "../../../../services/staff/casher/cashierNetpayCancellation.service";

import {
  executeCashierNetpayVoucherReprint,
  getCashierNetpayVoucherReprintError,
  resumeCashierPendingNetpayVoucherReprint,
} from "../../../../services/staff/casher/cashierNetpayVoucherReprint.service";

import {
  getCashierPendingNetpayOperation,
} from "../../../../services/staff/casher/cashierNetpayPayment.service";

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
  const [voucherReprintSaleId, setVoucherReprintSaleId] = useState(null);
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
  const pendingNetpayResumeRef = useRef(false);

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
      const status = String(row?.status || "").toLowerCase();
      const total = Number(row?.total || 0);
      const refundedTotal = Number(row?.refunded_total || 0);

      const rawNetpayTransactionId = Number(row?.netpay_transaction_id || 0);
      const netpayTransactionId =
        Number.isInteger(rawNetpayTransactionId) && rawNetpayTransactionId > 0
          ? rawNetpayTransactionId
          : null;

      const backendAvailable = Number(row?.available_to_refund);
      const availableToRefund = Number.isFinite(backendAvailable)
        ? Math.max(backendAvailable, 0)
        : Math.max(total - refundedTotal, 0);

      const backendCanRefund = row?.refund_permissions?.can_refund === true;
      const canRefund =
        backendCanRefund &&
        ["paid", "partially_refunded"].includes(status) &&
        availableToRefund > 0;

      return {
        sale_id: saleId,
        order_id: orderId || null,
        netpay_transaction_id: netpayTransactionId,
        ticket_folio: ticketFolio,
        customer_name: customerName,
        status,
        total,
        refunded_total: refundedTotal,
        available_to_refund: availableToRefund,
        can_refund: canRefund,
        paid_at: row?.paid_at || null,

        ticket: row?.ticket || null,
        customer: row?.customer || null,
        contact_data: row?.contact_data || null,
        refund_permissions: row?.refund_permissions || null,
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

  const handleResolvedNetpayCancellation = async (
    result,
    { resumed = false } = {}
  ) => {
    const outcome = String(
      result?.outcome || ""
    ).toLowerCase();

    if (
      outcome === "none" ||
      outcome ===
        "different_operation_type"
    ) {
      return false;
    }

    if (outcome === "cancelled") {
      setCancelOpen(false);
      setCancelReason("");
      setSelectedSummary(null);

      showAlert({
        severity: "success",
        title: resumed
          ? "Cancelación recuperada"
          : "Devolución aplicada",
        message:
          result?.message ||
          "NetPay confirmó la cancelación y Clic Menu registró correctamente la devolución total.",
      });

      await load({
        silent: true,
      });

      return true;
    }

    if (
      outcome === "not_cancelled"
    ) {
      showAlert({
        severity: "warning",
        title:
          "Cancelación no confirmada",
        message:
          result?.message ||
          "NetPay no confirmó la cancelación bancaria. La venta permanece cobrada.",
      });

      return false;
    }

    if (
      outcome ===
      "recovery_required"
    ) {
      showAlert({
        severity: "warning",
        title:
          "Verificación pendiente",
        message:
          result?.message ||
          "La cancelación NetPay continúa pendiente de recuperación.",
      });

      return false;
    }

    if (
      outcome ===
      "operation_pending_local"
    ) {
      showAlert({
        severity: "warning",
        title:
          "Operación NetPay pendiente",
        message:
          result?.message ||
          "Existe una cancelación NetPay pendiente en esta terminal.",
      });

      return false;
    }

    return false;
  };

  const handleResolvedNetpayVoucherReprint = async (
    result,
    { resumed = false } = {}
  ) => {
    const outcome = String(result?.outcome || "").toLowerCase();

    if (outcome === "none") return false;

    if (result?.reprintSuccess === true || outcome === "reprinted") {
      showAlert({
        severity: "success",
        title: resumed ? "Voucher recuperado" : "Voucher NetPay",
        message:
          result?.backendResponse?.message ||
          "El voucher NetPay fue reimpreso correctamente.",
      });

      return true;
    }

    const messages = {
      communication_error:
        "No fue posible confirmar la reimpresión del voucher por un problema de comunicación.",
      not_sent:
        "La solicitud de reimpresión no llegó a ejecutarse en Smart PinPad.",
      invalid_response:
        "NetPay devolvió una respuesta que no permite confirmar correctamente la reimpresión del voucher.",
      voucher_in_progress:
        "La reimpresión del voucher NetPay continúa en proceso.",
      not_reprinted:
        "NetPay procesó la solicitud, pero no confirmó una reimpresión exitosa del voucher.",
    };

    showAlert({
      severity: "warning",
      title: resumed ? "Reimpresión recuperada" : "Voucher NetPay",
      message:
        result?.backendResponse?.message ||
        messages[outcome] ||
        "La reimpresión del voucher NetPay no pudo confirmarse.",
    });

    return false;
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

  useEffect(() => {
    if (loading || pendingNetpayResumeRef.current) return;

    pendingNetpayResumeRef.current = true;
    let active = true;

    const resumePendingNetpayOperation = async () => {
      try {
        const pending = getCashierPendingNetpayOperation();

        if (
          !pending?.hasPendingOperation ||
          !pending?.operation
        ) {
          return;
        }

        const operationType = String(
          pending.operation.operationType || ""
        ).trim().toLowerCase();

        if (operationType === "cancellation") {
          const result = await resumeCashierPendingNetpayCancellation();
          if (!active) return;

          await handleResolvedNetpayCancellation(result, { resumed: true });
          return;
        }

        if (operationType === "voucher_reprint") {
          const saleId = Number(pending.operation.saleId || 0);
          const netpayTransactionId = Number(
            pending.operation.netpayTransactionId || 0
          );

          if (
            !Number.isInteger(saleId) ||
            saleId <= 0 ||
            !Number.isInteger(netpayTransactionId) ||
            netpayTransactionId <= 0
          ) {
            throw new Error(
              "La reimpresión NetPay pendiente no conserva una referencia válida de venta y transacción."
            );
          }

          setVoucherReprintSaleId(saleId);

          try {
            const result = await resumeCashierPendingNetpayVoucherReprint({
              saleId,
              netpayTransactionId,
            });

            if (!active) return;

            await handleResolvedNetpayVoucherReprint(result, {
              resumed: true,
            });
          } finally {
            if (active) setVoucherReprintSaleId(null);
          }
        }

        /*
         * sale y recovery pertenecen al flujo de cobro.
         * Esta pantalla no debe consumirlos ni limpiarlos.
         */
      } catch (e) {
        if (!active) return;

        showAlert({
          severity: "error",
          title: "No se pudo recuperar NetPay",
          message: pickErr(
            e,
            "No se pudo continuar la operación NetPay pendiente."
          ),
        });
      }
    };

    resumePendingNetpayOperation();

    return () => {
      active = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const filteredRows = useMemo(() => {
    const query = String(filters?.query || "").trim().toLowerCase();
    const status = String(filters?.status || "all");

    return rows.filter((row) => {
      const rowStatus = String(row?.status || "").toLowerCase();

      if (!["paid", "partially_refunded", "refunded"].includes(rowStatus)) {
        return false;
      }

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

  const selectedCanRefund = canRefundSummary(selectedSummary);

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

    if (!canRefundSummary(data)) {
      showAlert({
        severity: "warning",
        title: "Devolución no disponible",
        message:
          data?.refund_permissions?.message ||
          (Number(data?.sale?.available_to_refund || 0) <= 0
            ? "Esta venta ya no tiene saldo disponible para devolución."
            : "Esta venta no se encuentra en un estado válido para devolución."),
      });
      return;
    }

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

    if (!selectedCanRefund) {
      showAlert({
        severity: "warning",
        title: "Devolución no disponible",
        message:
          selectedSummary?.refund_permissions?.message ||
          (Number(selectedSummary?.sale?.available_to_refund || 0) <= 0
            ? "Esta venta ya no tiene saldo disponible para devolución."
            : "Esta venta ya no se encuentra disponible para devolución."),
      });
      return;
    }

    setCancelBusy(true);

    try {
      const res =
        await refundCashierSaleFull(
          saleId,
          { reason }
        );

      const data =
        res?.data?.summary || null;

      setSelectedSummary(data);
      setCancelOpen(false);
      setCancelReason("");

      showAlert({
        severity: "success",
        title: "Devolución aplicada",
        message:
          res?.message ||
          "Devolución total aplicada correctamente.",
      });

      await load({
        silent: true,
      });
    } catch (e) {
      const code =
        pickCode(e);

      if (
        code ===
        "NETPAY_BANK_CANCELLATION_REQUIRED"
      ) {
        const netpayTransactionId =
          Number(
            e?.response?.data?.data
              ?.netpay_transaction_id ||
              0
          );

        if (
          !Number.isInteger(
            netpayTransactionId
          ) ||
          netpayTransactionId <= 0
        ) {
          showAlert({
            severity: "error",
            title:
              "No se pudo cancelar",
            message:
              "Backend indicó que la venta requiere cancelación NetPay, pero no devolvió la operación bancaria relacionada.",
          });

          return;
        }

        try {
          const result =
            await executeCashierNetpayCancellation({
              saleId,
              netpayTransactionId,
              reason,
            });

          await handleResolvedNetpayCancellation(
            result
          );
        } catch (netpayError) {
          const netpayStatus =
            Number(
              netpayError?.response
                ?.status || 0
            );

          showAlert({
            severity:
              [409, 422].includes(
                netpayStatus
              )
                ? "warning"
                : "error",
            title:
              "No se pudo cancelar en NetPay",
            message: pickErr(
              netpayError,
              "No se pudo completar la cancelación bancaria NetPay."
            ),
          });
        }

        return;
      }

      const status =
        Number(
          e?.response?.status || 0
        );

      showAlert({
        severity:
          [409, 422].includes(status)
            ? "warning"
            : "error",
        title:
          "No se pudo aplicar",
        message: pickErr(
          e,
          "No se pudo aplicar la devolución total."
        ),
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

  const handleReprintNetpayVoucher = async (sale) => {
    const saleId = Number(sale?.sale_id || 0);
    const netpayTransactionId = Number(
      sale?.netpay_transaction_id || 0
    );

    if (!saleId) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "No se pudo identificar la venta.",
      });
      return;
    }

    if (
      !Number.isInteger(netpayTransactionId) ||
      netpayTransactionId <= 0
    ) {
      showAlert({
        severity: "warning",
        title: "Voucher NetPay",
        message:
          "Esta venta no tiene una operación NetPay disponible para reimprimir su voucher.",
      });
      return;
    }

    setVoucherReprintSaleId(saleId);

    try {
      const result = await executeCashierNetpayVoucherReprint({
        saleId,
        netpayTransactionId,
      });

      await handleResolvedNetpayVoucherReprint(result);
    } catch (e) {
      const netpayError = getCashierNetpayVoucherReprintError(e);
      const status = Number(e?.response?.status || 0);

      showAlert({
        severity: [409, 422].includes(status) ? "warning" : "error",
        title: "No se pudo reimprimir",
        message: netpayError.message,
      });
    } finally {
      setVoucherReprintSaleId(null);
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
    if (sendingWhatsapp || thermalPrintSaleId || voucherReprintSaleId) return;

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
        voucherReprintAvailable={
          Number(ticketActionsSale?.netpay_transaction_id || 0) > 0
        }
        onReprintNetpayVoucher={handleReprintNetpayVoucher}
        voucherReprinting={
          Number(voucherReprintSaleId || 0) ===
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
        disabled={!selectedCanRefund}
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

function canRefundSummary(summary) {
  const status = String(summary?.sale?.status || "").toLowerCase();
  const available = Number(summary?.sale?.available_to_refund || 0);
  const backendPermission =
    summary?.refund_permissions?.can_refund === true;

  return (
    backendPermission &&
    ["paid", "partially_refunded"].includes(status) &&
    available > 0
  );
}