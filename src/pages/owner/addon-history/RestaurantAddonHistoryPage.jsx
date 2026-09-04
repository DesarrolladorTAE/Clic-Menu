import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import usePagination from "../../../hooks/usePagination";
import { normalizeErr } from "../../../utils/err";

import AddonHistoryHeader from "../../../components/owner/addon-history/AddonHistoryHeader";
import AddonTabs from "../../../components/owner/addon-history/AddonTabs";
import AddonCatalogPanel from "../../../components/owner/addon-history/AddonCatalogPanel";
import AddonHistorySummary from "../../../components/owner/addon-history/AddonHistorySummary";
import AddonHistoryFilters from "../../../components/owner/addon-history/AddonHistoryFilters";
import AddonHistoryList from "../../../components/owner/addon-history/AddonHistoryList";

import {
  getRestaurantAddons,
  getRestaurantAddonCatalog,
  getRestaurantAddonHistory,
} from "../../../services/owner/addon.service";

const PAGE_SIZE = 5;

export default function RestaurantAddonHistoryPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const baseReqRef = useRef(0);
  const historyReqRef = useRef(0);
  const pageRef = useRef(1);
  const branchInitializedRef = useRef(false);

  const now = new Date();

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [tab, setTab] = useState("current");

  const [restaurant, setRestaurant] = useState(null);
  const [branches, setBranches] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [currentAddons, setCurrentAddons] = useState([]);

  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);

  const [meta, setMeta] = useState({
    page: 1,
    perPage: PAGE_SIZE,
    total: 0,
  });

  const [filters, setFilters] = useState({
    branchId: "",
    period: "all",
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

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

  const requestFilters = useMemo(() => {
    const next = { period: filters.period };

    if (filters.branchId) next.branch_id = Number(filters.branchId);
    if (filters.period === "year" || filters.period === "month") next.year = Number(filters.year);
    if (filters.period === "month") next.month = Number(filters.month);

    return next;
  }, [filters]);

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const loadBase = useCallback(async ({ initial = false, silent = false } = {}) => {
    const myReq = ++baseReqRef.current;
    if (initial) setLoading(true);

    try {
      const [catalogRes, currentRes] = await Promise.all([
        getRestaurantAddonCatalog(restaurantId),
        getRestaurantAddons(restaurantId),
      ]);

      if (myReq !== baseReqRef.current) return;

      const branchList = Array.isArray(catalogRes?.branches) ? catalogRes.branches : [];
      const catalogList = Array.isArray(catalogRes?.data) ? catalogRes.data : [];
      const currentList = Array.isArray(currentRes?.data) ? currentRes.data : [];

      setRestaurant(catalogRes?.restaurant || currentRes?.restaurant || null);
      setBranches(branchList);
      setCatalog(catalogList);
      setCurrentAddons(currentList);

      setFilters((prev) => {
        const currentExists =
          prev.branchId &&
          branchList.some((branch) => String(branch.id) === String(prev.branchId));

        if (currentExists) return prev;

        if (!branchInitializedRef.current) {
          branchInitializedRef.current = true;

          return {
            ...prev,
            branchId: branchList.length > 0 ? String(branchList[0].id) : "",
          };
        }

        if (prev.branchId && !currentExists) {
          return {
            ...prev,
            branchId: branchList.length > 0 ? String(branchList[0].id) : "",
          };
        }

        return prev;
      });
    } catch (e) {
      if (myReq !== baseReqRef.current) return;

      if (!silent) {
        showAlert({
          severity: "error",
          title: "Error",
          message: normalizeErr(e, "No se pudieron cargar los complementos del restaurante."),
        });
      }
    } finally {
      if (myReq !== baseReqRef.current) return;
      if (initial) setLoading(false);
    }
  }, [restaurantId]);

  const loadHistory = useCallback(async ({ page = 1, silent = false } = {}) => {
    const myReq = ++historyReqRef.current;
    if (!silent) setHistoryLoading(true);

    try {
      const res = await getRestaurantAddonHistory(restaurantId, {
        ...requestFilters,
        page,
        per_page: PAGE_SIZE,
      });

      if (myReq !== historyReqRef.current) return;

      const paginated = res?.data || {};
      const list = Array.isArray(paginated?.data) ? paginated.data : [];
      const resolvedPage = Number(paginated?.current_page || page || 1);

      if (res?.restaurant) setRestaurant(res.restaurant);

      setSummary(res?.summary || null);
      setRows(list);

      setMeta({
        page: resolvedPage,
        perPage: Number(paginated?.per_page || PAGE_SIZE),
        total: Number(paginated?.total || list.length || 0),
      });

      pageRef.current = resolvedPage;
    } catch (e) {
      if (myReq !== historyReqRef.current) return;

      if (!silent) {
        showAlert({
          severity: "error",
          title: "Error",
          message: normalizeErr(e, "No se pudo cargar el historial de complementos."),
        });
      }
    } finally {
      if (myReq !== historyReqRef.current) return;
      if (!silent) setHistoryLoading(false);
    }
  }, [restaurantId, requestFilters]);

  useEffect(() => {
    branchInitializedRef.current = false;
    pageRef.current = 1;
    loadBase({ initial: true });
  }, [loadBase]);

  useEffect(() => {
    if (tab !== "history") return;

    pageRef.current = 1;
    loadHistory({ page: 1 });
  }, [tab, loadHistory]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadBase({ silent: true });

      if (tab === "history") {
        loadHistory({ page: pageRef.current, silent: true });
      }
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [tab, loadBase, loadHistory]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;

      loadBase({ silent: true });

      if (tab === "history") {
        loadHistory({ page: pageRef.current, silent: true });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tab, loadBase, loadHistory]);

  const handleTabChange = (nextTab) => {
    if (nextTab !== "history" && !filters.branchId && branches.length > 0) {
      setFilters((prev) => ({
        ...prev,
        branchId: String(branches[0].id),
      }));
    }

    setTab(nextTab);
  };

  const handleFiltersChange = (nextFilters) => {
    setFilters((prev) => ({ ...prev, ...nextFilters }));
  };

  const handleChangePage = async (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    await loadHistory({ page: nextPage });
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />

            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando complementos…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <AddonHistoryHeader
          restaurant={restaurant}
          restaurantId={restaurantId}
          onBack={() => nav(`/owner/restaurants/${restaurantId}/plans`)}
        />

        <AddonTabs
          tab={tab}
          onChange={handleTabChange}
        />

        <AddonHistoryFilters
          tab={tab}
          filters={filters}
          branches={branches}
          total={meta.total}
          onChange={handleFiltersChange}
        />

        {tab === "current" ? (
          <AddonCatalogPanel
            mode="current"
            catalog={catalog}
            currentAddons={currentAddons}
            branches={branches}
            selectedBranchId={filters.branchId}
          />
        ) : null}

        {tab === "available" ? (
          <AddonCatalogPanel
            mode="available"
            catalog={catalog}
            currentAddons={currentAddons}
            branches={branches}
            selectedBranchId={filters.branchId}
          />
        ) : null}

        {tab === "history" ? (
          <>
            {historyLoading ? (
              <Box
                sx={{
                  minHeight: 180,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Stack spacing={1.5} alignItems="center">
                  <CircularProgress size={32} color="primary" />

                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Cargando historial…
                  </Typography>
                </Stack>
              </Box>
            ) : (
              <>
                <AddonHistorySummary summary={summary} />

                <AddonHistoryList
                  rows={rows}
                  pagination={pagination}
                  onPrev={() => handleChangePage(pagination.page - 1)}
                  onNext={() => handleChangePage(pagination.page + 1)}
                />
              </>
            )}
          </>
        ) : null}
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