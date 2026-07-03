import { useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import usePagination from "../../../hooks/usePagination";
import { normalizeErr } from "../../../utils/err";

import SystemSubscriptionSalesHeader from "../../../components/system-admin/subscription-sales/SystemSubscriptionSalesHeader";
import SystemSubscriptionSalesFiltersCard from "../../../components/system-admin/subscription-sales/SystemSubscriptionSalesFiltersCard";
import SystemSubscriptionSalesSummaryCards from "../../../components/system-admin/subscription-sales/SystemSubscriptionSalesSummaryCards";
import SystemSubscriptionSalesListPanel from "../../../components/system-admin/subscription-sales/SystemSubscriptionSalesListPanel";

import {
  getSystemSubscriptionSalesMonthly,
  getSystemSubscriptionSalesSummary,
} from "../../../services/system-admin/systemSubscriptionSales.service";

const PAGE_SIZE = 5;

export default function SystemSubscriptionSalesPage() {
  const reqRef = useRef(0);

  const now = new Date();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [rows, setRows] = useState([]);
  const [period, setPeriod] = useState(null);
  const [summary, setSummary] = useState(null);
  const [byType, setByType] = useState([]);
  const [byPlan, setByPlan] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const [byProvider, setByProvider] = useState([]);

  const [meta, setMeta] = useState({
    page: 1,
    perPage: PAGE_SIZE,
    total: 0,
  });

  const [periodType, setPeriodType] = useState("month");
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [dateField, setDateField] = useState("created_at");
  const [subscriptionType, setSubscriptionType] = useState("all");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

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
      date_field: dateField,
      subscription_type: subscriptionType,

      ...(periodType !== "all" && year ? { year: Number(year) } : {}),
      ...(periodType === "month" && month ? { month: Number(month) } : {}),

      ...(q ? { q } : {}),
      ...(status ? { status } : {}),
    };
  }, [
    periodType,
    year,
    month,
    dateField,
    subscriptionType,
    q,
    status,
  ]);

  const loadSales = async ({ page = 1, initial = false } = {}) => {
    const myReq = ++reqRef.current;

    if (initial) setLoading(true);
    else setRefreshing(true);

    try {
      const [monthlyRes, summaryRes] = await Promise.all([
        getSystemSubscriptionSalesMonthly({
          ...params,
          page,
          per_page: PAGE_SIZE,
        }),
        getSystemSubscriptionSalesSummary(params),
      ]);

      if (myReq !== reqRef.current) return;

      const paginated = monthlyRes?.data || {};
      const list = Array.isArray(paginated?.data) ? paginated.data : [];

      setRows(list);
      setPeriod(monthlyRes?.period || summaryRes?.period || null);
      setSummary(summaryRes?.summary || monthlyRes?.summary || null);
      setByType(Array.isArray(summaryRes?.by_type) ? summaryRes.by_type : []);
      setByPlan(Array.isArray(summaryRes?.by_plan) ? summaryRes.by_plan : []);
      setByStatus(Array.isArray(summaryRes?.by_status) ? summaryRes.by_status : []);
      setByProvider(Array.isArray(summaryRes?.by_provider) ? summaryRes.by_provider : []);

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
        message: normalizeErr(e, "No se pudieron cargar las ventas de suscripciones."),
      });
    } finally {
      if (myReq !== reqRef.current) return;

      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSales({ page: 1, initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
              Cargando ventas de suscripciones…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <SystemSubscriptionSalesHeader
          refreshing={refreshing}
          period={period}
        />

        <SystemSubscriptionSalesFiltersCard
          periodType={periodType}
          year={year}
          month={month}
          dateField={dateField}
          subscriptionType={subscriptionType}
          q={q}
          status={status}
          total={meta.total}
          onChangePeriodType={setPeriodType}
          onChangeYear={setYear}
          onChangeMonth={setMonth}
          onChangeDateField={setDateField}
          onChangeSubscriptionType={setSubscriptionType}
          onChangeQ={setQ}
          onChangeStatus={setStatus}
        />

        <SystemSubscriptionSalesSummaryCards
          summary={summary}
          byType={byType}
          byPlan={byPlan}
          byStatus={byStatus}
          byProvider={byProvider}
        />

        <SystemSubscriptionSalesListPanel
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