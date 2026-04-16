import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import usePagination from "../../../../hooks/usePagination";
import { useStaffAuth } from "../../../../context/StaffAuthContext";

import {
  fetchCashierRefundSalesHistory,
} from "../../../../services/staff/casher/cashierRefunds.service";

import CashierRefundsHeroCard from "../../../../components/staff/casher/refunds/CashierRefundsHeroCard";
import CashierRefundHistoryFiltersCard from "../../../../components/staff/casher/refunds/CashierRefundHistoryFiltersCard";
import CashierRefundSalesPanel from "../../../../components/staff/casher/refunds/CashierRefundSalesPanel";

const PAGE_SIZE = 6;

export default function CashierRefundsHistoryPage() {
  const nav = useNavigate();
  const { clearStaff } = useStaffAuth() || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState([]);

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
    const raw =
      res?.data?.rows ||
      res?.data?.sales ||
      res?.data ||
      [];

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
  }, []);

  const filteredRows = useMemo(() => {
    const query = String(filters?.query || "").trim().toLowerCase();
    const status = String(filters?.status || "all");

    return rows.filter((row) => {
      if (status !== "all" && String(row?.status) !== status) return false;

      if (!query) return true;

      const haystack = [
        row?.sale_id,
        row?.order_id,
        row?.ticket_folio,
        row?.customer_name,
        row?.status,
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

  const handleBack = () => {
    nav("/staff/cashier/queue");
  };

  const handleOpenDetail = (sale) => {
    const saleId = sale?.sale_id;
    if (!saleId) return;

    nav(`/staff/cashier/refunds/${saleId}`);
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
        <CashierRefundsHeroCard
          syncing={refreshing}
          rows={rows}
          onBack={handleBack}
        />

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
        />
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
