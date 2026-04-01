import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import usePagination from "../../../hooks/usePagination";

import { useStaffAuth } from "../../../context/StaffAuthContext";

import {
  fetchCashierSaleQueue,
  takeCashierSale,
} from "../../../services/staff/casher/cashierQueue.service";

import CashierQueueHeroCard from "../../../components/staff/casher/CashierQueueHeroCard";
import CashierQueueTabs from "../../../components/staff/casher/CashierQueueTabs";
import CashierSalesPanel from "../../../components/staff/casher/CashierSalesPanel";

const PAGE_SIZE = 5;

export default function CashierQueuePage() {
  const nav = useNavigate();
  const { clearStaff } = useStaffAuth() || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [queueData, setQueueData] = useState(null);

  const [tab, setTab] = useState("available");
  const [takingSaleId, setTakingSaleId] = useState(null);

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

  const load = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const res = await fetchCashierSaleQueue();
      setQueueData(res?.data || null);
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
        message: pickErr(e, "No se pudo cargar el tablero de cobro."),
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
    }, 10000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cashSession = queueData?.cash_session || null;
  const availableSales = useMemo(
    () => (Array.isArray(queueData?.available_sales) ? queueData.available_sales : []),
    [queueData]
  );
  const mySales = useMemo(
    () => (Array.isArray(queueData?.my_sales) ? queueData.my_sales : []),
    [queueData]
  );

  const myTotal = useMemo(() => {
    return mySales.reduce((acc, item) => acc + Number(item?.total || 0), 0);
  }, [mySales]);

  const activeList = tab === "available" ? availableSales : mySales;

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
    items: activeList,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const moveTakenSaleToMine = (saleRow) => {
    if (!saleRow?.sale_id) return;

    setQueueData((prev) => {
      const current = prev || {};

      const currentAvailable = Array.isArray(current.available_sales)
        ? current.available_sales
        : [];
      const currentMine = Array.isArray(current.my_sales)
        ? current.my_sales
        : [];

      const filteredAvailable = currentAvailable.filter(
        (row) => Number(row?.sale_id) !== Number(saleRow.sale_id)
      );

      const mineWithoutDup = currentMine.filter(
        (row) => Number(row?.sale_id) !== Number(saleRow.sale_id)
      );

      return {
        ...current,
        available_sales: filteredAvailable,
        my_sales: [saleRow, ...mineWithoutDup],
      };
    });
  };

  const handleTakeSale = async (sale) => {
    const saleId = sale?.sale_id;
    if (!saleId || takingSaleId) return;

    setTakingSaleId(saleId);

    try {
      const res = await takeCashierSale(saleId);
      const takenRow = res?.data || null;

      if (takenRow) {
        moveTakenSaleToMine(takenRow);
        setTab("mine");
      }

      showAlert({
        severity: "success",
        message: res?.message || "Venta tomada correctamente.",
      });

      load({ silent: true });
    } catch (e) {
      const code = pickCode(e);
      const msg = pickErr(e, "No se pudo tomar la venta.");

      if (
        code === "SALE_NOT_AVAILABLE" ||
        code === "SALE_ALREADY_TAKEN"
      ) {
        showAlert({
          severity: "warning",
          message: msg,
        });
        load({ silent: true });
        return;
      }

      showAlert({
        severity: "error",
        message: msg,
      });
    } finally {
      setTakingSaleId(null);
    }
  };

  const handleOpenDetail = (sale) => {
    const saleId = sale?.sale_id;
    if (!saleId) return;

    nav(`/staff/cashier/sales/${saleId}`);
  };

  const handleBackWithCheck = () => {
    if (mySales.length > 0) {
      showAlert({
        severity: "warning",
        title: "Ventas activas",
        message: "No puedes salir si tienes ventas tomadas. Termina de cobrarlas primero."
      });
      return;
    }
    nav("/staff/cashier");
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
              Cargando tablero de cobro…
            </Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <CashierQueueHeroCard
          cashSession={cashSession}
          availableCount={availableSales.length}
          myCount={mySales.length}
          myTotal={myTotal}
          syncing={refreshing}
          onBack={handleBackWithCheck}
        />

        <CashierQueueTabs
          tab={tab}
          onChange={setTab}
          availableCount={availableSales.length}
          myCount={mySales.length}
        />

        <CashierSalesPanel
          title={tab === "available" ? "Ventas disponibles" : "Mis ventas"}
          subtitle={
            tab === "available"
              ? "Estas ventas todavía no están asignadas a ninguna caja. Puedes tomarlas para comenzar el cobro."
              : "Estas ventas ya están tomadas por tu caja. Desde aquí puedes continuar al detalle para cobrar."
          }
          mode={tab === "available" ? "available" : "mine"}
          sales={paginatedItems}
          actionBusyId={takingSaleId}
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          total={total}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={prevPage}
          onNext={nextPage}
          onTake={handleTakeSale}
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
