import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import usePagination from "../../../../hooks/usePagination";
import { normalizeErr } from "../../../../utils/err";

import SystemPlatformPurchasesFilters from "../../../../components/system-admin/billing/purchases/SystemPlatformPurchasesFilters";
import SystemPlatformPurchasesPanel from "../../../../components/system-admin/billing/purchases/SystemPlatformPurchasesPanel";
import SystemPlatformInvoiceModal from "../../../../components/system-admin/billing/purchases/SystemPlatformInvoiceModal";

import { getSystemOwners } from "../../../../services/system-admin/systemOwners.service";
import { getSystemPlatformPurchases } from "../../../../services/system-admin/billing/platformBilling.service";

const PAGE_SIZE = 4;

export default function SystemPlatformPurchasesPage() {
  const requestRef = useRef(0);
  const contextRequestRef = useRef(0);
  const loadedRef = useRef(false);

  const now = new Date();

  const [filters, setFilters] = useState({
    q: "",
    period: "month",
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    owner_id: "",
    restaurant_id: "",
    branch_id: "",
    type: "all",
    status: "all",
    payment_method: "all",
  });

  const [debouncedQ, setDebouncedQ] = useState("");
  const [owners, setOwners] = useState([]);
  const [contextRows, setContextRows] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingContext, setLoadingContext] = useState(false);

  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(filters.q.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.q]);

  const periodParams = useMemo(() => {
    const params = { period: filters.period };

    if (filters.period === "year" || filters.period === "month") {
      params.year = Number(filters.year);
    }

    if (filters.period === "month") {
      params.month = Number(filters.month);
    }

    return params;
  }, [filters.period, filters.year, filters.month]);

  const queryParams = useMemo(() => {
    const params = {
      ...periodParams,
      type: filters.type,
      status: filters.status,
      payment_method: filters.payment_method,
    };

    if (filters.owner_id) params.owner_id = Number(filters.owner_id);
    if (filters.restaurant_id) params.restaurant_id = Number(filters.restaurant_id);
    if (filters.branch_id) params.branch_id = Number(filters.branch_id);
    if (debouncedQ) params.q = debouncedQ;

    return params;
  }, [
    periodParams,
    filters.type,
    filters.status,
    filters.payment_method,
    filters.owner_id,
    filters.restaurant_id,
    filters.branch_id,
    debouncedQ,
  ]);

  const resetKey = useMemo(() => JSON.stringify(queryParams), [queryParams]);

  const pagination = usePagination({
    items: purchases,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
    resetKey,
  });

  const selectedKeys = useMemo(() => {
    return new Set(selectedPurchases.map((purchase) => purchaseKey(purchase)));
  }, [selectedPurchases]);

  const compatibility = useMemo(() => {
    return selectionCompatibility(selectedPurchases);
  }, [selectedPurchases]);

  const loadOwners = useCallback(async () => {
    try {
      const res = await getSystemOwners({ page: 1, per_page: 100 });
      const paginator = res?.data || {};
      const rows = Array.isArray(paginator?.data) ? paginator.data : [];
      setOwners(rows);
    } catch (error) {
      showAlert({
        severity: "error",
        title: "No se pudieron cargar los propietarios",
        message: normalizeErr(error, "Intenta nuevamente."),
      });
    }
  }, []);

  const loadContextRows = useCallback(async () => {
    if (!filters.owner_id) {
      setContextRows([]);
      return;
    }

    const myRequest = ++contextRequestRef.current;
    setLoadingContext(true);

    try {
      const res = await getSystemPlatformPurchases({
        ...periodParams,
        owner_id: Number(filters.owner_id),
        type: "all",
        status: "all",
        payment_method: "all",
      });

      if (myRequest !== contextRequestRef.current) return;

      setContextRows(Array.isArray(res?.data) ? res.data : []);
    } catch {
      if (myRequest === contextRequestRef.current) setContextRows([]);
    } finally {
      if (myRequest === contextRequestRef.current) setLoadingContext(false);
    }
  }, [filters.owner_id, periodParams]);

  const loadPurchases = useCallback(async ({ initial = false } = {}) => {
    const myRequest = ++requestRef.current;

    if (initial || !loadedRef.current) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await getSystemPlatformPurchases(queryParams);
      if (myRequest !== requestRef.current) return;

      setPurchases(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      if (myRequest !== requestRef.current) return;

      showAlert({
        severity: "error",
        title: "No se pudieron cargar los movimientos",
        message: normalizeErr(error, "Intenta nuevamente."),
      });
    } finally {
      if (myRequest !== requestRef.current) return;

      loadedRef.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, [queryParams]);

  useEffect(() => {
    loadOwners();
  }, [loadOwners]);

  useEffect(() => {
    loadContextRows();
  }, [loadContextRows]);

  useEffect(() => {
    loadPurchases({ initial: !loadedRef.current });
  }, [loadPurchases]);

  useEffect(() => {
    setSelectedPurchases([]);
    setInvoiceModalOpen(false);
  }, [resetKey]);

  const canSelectPurchase = (purchase) => {
    if (!isActionable(purchase)) return false;
    if (selectedKeys.has(purchaseKey(purchase))) return true;
    if (selectedPurchases.length === 0) return true;

    const next = [...selectedPurchases, purchase];
    const nextCompatibility = selectionCompatibility(next);

    return nextCompatibility.owner || nextCompatibility.publicGeneral;
  };

  const togglePurchase = (purchase) => {
    const key = purchaseKey(purchase);

    if (selectedKeys.has(key)) {
      setSelectedPurchases((prev) =>
        prev.filter((item) => purchaseKey(item) !== key)
      );
      return;
    }

    const next = [...selectedPurchases, purchase];
    const nextCompatibility = selectionCompatibility(next);

    if (!nextCompatibility.samePeriod) {
      showAlert({
        severity: "warning",
        title: "Movimientos incompatibles",
        message: "Las compras de una misma factura deben pertenecer al mismo periodo.",
      });
      return;
    }

    if (!nextCompatibility.sameCurrency) {
      showAlert({
        severity: "warning",
        title: "Movimientos incompatibles",
        message: "Las compras de una misma factura deben utilizar la misma moneda.",
      });
      return;
    }

    if (!nextCompatibility.owner && !nextCompatibility.publicGeneral) {
      showAlert({
        severity: "warning",
        title: "No pueden agruparse",
        message: "Los movimientos seleccionados no tienen un mismo tipo de facturación disponible.",
      });
      return;
    }

    setSelectedPurchases(next);
  };

  const invoiceCompleted = async (res) => {
    notifyInvoiceResult(res);
    setSelectedPurchases([]);
    await loadPurchases();
  };

  const notifyInvoiceResult = (res) => {
    if (res?.ok === true && res?.status === "stamped") {
      showAlert({
        severity: "success",
        title: "Factura timbrada",
        message: res?.message || "La factura se generó correctamente.",
      });
      return;
    }

    if (res?.status === "review_required") {
      showAlert({
        severity: "warning",
        title: "Factura en revisión",
        message: res?.message || "El resultado requiere revisión antes de realizar otra acción.",
      });
      return;
    }

    if (res?.status === "processing") {
      showAlert({
        severity: "info",
        title: "Factura en proceso",
        message: res?.message || "La factura continúa en proceso.",
      });
      return;
    }

    showAlert({
      severity: "error",
      title: "No fue posible timbrar la factura",
      message: res?.message || "La factura quedó registrada como fallida.",
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />

            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
              Cargando movimientos…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 30, md: 42 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.1,
            }}
          >
            Movimientos facturables
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: { xs: 15, md: 18 },
              color: "text.secondary",
            }}
          >
            Consulta y factura las compras de planes y complementos realizadas en Clic Menu.
          </Typography>
        </Box>

        <SystemPlatformPurchasesFilters
          filters={filters}
          owners={owners}
          contextRows={contextRows}
          loadingContext={loadingContext}
          onChange={setFilters}
        />

        <SystemPlatformPurchasesPanel
          purchases={purchases}
          selectedKeys={selectedKeys}
          pagination={pagination}
          refreshing={refreshing}
          canSelect={canSelectPurchase}
          onToggle={togglePurchase}
          onClearSelection={() => setSelectedPurchases([])}
          onOpenInvoice={() => setInvoiceModalOpen(true)}
        />
      </Stack>

      <SystemPlatformInvoiceModal
        open={invoiceModalOpen}
        purchases={selectedPurchases}
        compatibility={compatibility}
        onClose={() => setInvoiceModalOpen(false)}
        onCompleted={invoiceCompleted}
        onAlert={showAlert}
      />

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

function selectionCompatibility(purchases = []) {
  if (!purchases.length) {
    return {
      owner: false,
      publicGeneral: false,
      samePeriod: true,
      sameCurrency: true,
      sameOwner: true,
    };
  }

  const first = purchases[0];
  const firstPeriod = String(first?.period_date || "");
  const firstCurrency = String(first?.currency || "").toUpperCase();
  const firstOwnerId = Number(first?.owner?.id || 0);

  const samePeriod = purchases.every(
    (purchase) => String(purchase?.period_date || "") === firstPeriod
  );

  const sameCurrency = purchases.every(
    (purchase) => String(purchase?.currency || "").toUpperCase() === firstCurrency
  );

  const sameOwner =
    firstOwnerId > 0 &&
    purchases.every(
      (purchase) => Number(purchase?.owner?.id || 0) === firstOwnerId
    );

  const owner =
    samePeriod &&
    sameCurrency &&
    sameOwner &&
    purchases.every((purchase) => purchase?.can_invoice_owner === true);

  const publicGeneral =
    samePeriod &&
    sameCurrency &&
    purchases.every(
      (purchase) => purchase?.can_invoice_public_general === true
    );

  return {
    owner,
    publicGeneral,
    samePeriod,
    sameCurrency,
    sameOwner,
  };
}

function isActionable(purchase) {
  return purchase?.can_invoice_owner === true ||
    purchase?.can_invoice_public_general === true;
}

function purchaseKey(purchase) {
  return `${purchase?.source_type || "source"}-${purchase?.source_id || 0}`;
}