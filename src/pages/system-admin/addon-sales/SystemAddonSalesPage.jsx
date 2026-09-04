import { useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import usePagination from "../../../hooks/usePagination";
import { normalizeErr } from "../../../utils/err";

import SystemAddonSalesHeader from "../../../components/system-admin/addon-sales/SystemAddonSalesHeader";
import SystemAddonSalesFiltersCard from "../../../components/system-admin/addon-sales/SystemAddonSalesFiltersCard";
import SystemAddonSalesSummaryCards from "../../../components/system-admin/addon-sales/SystemAddonSalesSummaryCards";
import SystemAddonSalesListPanel from "../../../components/system-admin/addon-sales/SystemAddonSalesListPanel";

import {
  getSystemAddonSalesCatalog,
  getSystemAddonSalesMonthly,
} from "../../../services/system-admin/systemAddonSales.service";

const PAGE_SIZE = 5;

export default function SystemAddonSalesPage() {
  const reqRef = useRef(0);
  const filtersMountedRef = useRef(false);
  const now = new Date();

  const [loading, setLoading] = useState(true);

  const [rows, setRows] = useState([]);
  const [period, setPeriod] = useState(null);
  const [summary, setSummary] = useState(null);
  const [addons, setAddons] = useState([]);

  const [meta, setMeta] = useState({
    page: 1,
    perPage: PAGE_SIZE,
    total: 0,
  });

  const [periodType, setPeriodType] = useState("month");
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [addonId, setAddonId] = useState("");
  const [q, setQ] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const pagination = usePagination({
    items: rows,
    pageSize: PAGE_SIZE,
    mode: "backend",
    serverMeta: meta,
  });

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const params = useMemo(() => {
    return {
      period: periodType,
      ...(periodType !== "all" && year ? { year: Number(year) } : {}),
      ...(periodType === "month" && month ? { month: Number(month) } : {}),
      ...(addonId ? { addon_id: Number(addonId) } : {}),
      ...(q.trim() ? { q: q.trim() } : {}),
    };
  }, [periodType, year, month, addonId, q]);

  const loadCatalog = async () => {
    try {
      const catalog = await getSystemAddonSalesCatalog();
      setAddons(catalog);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo cargar el catálogo de complementos."),
      });
    }
  };

  const loadSales = async ({ page = 1, initial = false } = {}) => {
    const myReq = ++reqRef.current;
    if (initial) setLoading(true);

    try {
      const res = await getSystemAddonSalesMonthly({
        ...params,
        page,
        per_page: PAGE_SIZE,
      });

      if (myReq !== reqRef.current) return;

      const paginated = res?.data || {};
      const list = Array.isArray(paginated?.data) ? paginated.data : [];

      setRows(list);
      setPeriod(res?.period || null);
      setSummary(res?.summary || null);

      setMeta({
        page: Number(paginated?.current_page || page || 1),
        perPage: Number(paginated?.per_page || PAGE_SIZE),
        total: Number(paginated?.total || list.length || 0),
      });
    } catch (e) {
      if (myReq !== reqRef.current) return;

      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudieron cargar las ventas de complementos."),
      });
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
    loadSales({ page: 1, initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!filtersMountedRef.current) {
      filtersMountedRef.current = true;
      return;
    }

    const t = setTimeout(() => {
      loadSales({ page: 1, initial: false });
    }, 300);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleChangePage = async (nextPage) => {
    await loadSales({ page: nextPage, initial: false });
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando ventas de complementos…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <SystemAddonSalesHeader period={period} />

        <SystemAddonSalesFiltersCard
          periodType={periodType}
          year={year}
          month={month}
          addonId={addonId}
          addons={addons}
          q={q}
          total={meta.total}
          onChangePeriodType={setPeriodType}
          onChangeYear={setYear}
          onChangeMonth={setMonth}
          onChangeAddonId={setAddonId}
          onChangeQ={setQ}
        />

        <SystemAddonSalesSummaryCards summary={summary} />

        <SystemAddonSalesListPanel
          rows={rows}
          period={period}
          pagination={pagination}
          onPrev={() => handleChangePage(pagination.page - 1)}
          onNext={() => handleChangePage(pagination.page + 1)}
        />
      </Stack>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}