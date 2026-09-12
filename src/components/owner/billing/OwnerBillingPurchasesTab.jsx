import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Button, Card, Chip, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

import { getMyRestaurants } from "../../../services/restaurant/restaurant.service";
import { getPlatformPurchases } from "../../../services/owner/platformBilling.service";

import usePagination from "../../../hooks/usePagination";
import PaginationFooter from "../../common/PaginationFooter";
import OwnerBillingFilters from "./OwnerBillingFilters";
import OwnerPurchaseInvoiceModal from "./OwnerPurchaseInvoiceModal";

const PAGE_SIZE = 4;

export default function OwnerBillingPurchasesTab({
  onAlert,
  onChanged,
  onEditTaxProfile,
}) {
  const onAlertRef = useRef(onAlert);
  const loadedRef = useRef(false);

  const now = new Date();

  const [filters, setFilters] = useState({
    period: "all",
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    restaurant_id: "",
    type: "all",
    status: "all",
  });

  const [restaurants, setRestaurants] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  useEffect(() => {
    onAlertRef.current = onAlert;
  }, [onAlert]);

  useEffect(() => {
    let active = true;

    const loadRestaurants = async () => {
      try {
        const res = await getMyRestaurants();
        if (!active) return;

        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setRestaurants(Array.isArray(list) ? list : []);
      } catch {
        if (active) setRestaurants([]);
      }
    };

    loadRestaurants();

    return () => {
      active = false;
    };
  }, []);

  const queryParams = useMemo(() => {
    const params = {
      period: filters.period,
      type: filters.type,
      status: filters.status,
    };

    if (filters.restaurant_id) params.restaurant_id = Number(filters.restaurant_id);

    if (filters.period === "year" || filters.period === "month") {
      params.year = Number(filters.year);
    }

    if (filters.period === "month") params.month = Number(filters.month);

    return params;
  }, [filters]);

  const loadPurchases = useCallback(async () => {
    if (loadedRef.current) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getPlatformPurchases(queryParams);
      setPurchases(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      onAlertRef.current?.({
        severity: "error",
        title: "No se pudieron cargar las compras",
        message: getApiMessage(error, "Intenta nuevamente."),
      });
    } finally {
      loadedRef.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, [queryParams]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const resetKey = useMemo(() => JSON.stringify(queryParams), [queryParams]);

  const {
    page, nextPage, prevPage, total, totalPages, startItem, endItem,
    hasPrev, hasNext, paginatedItems,
  } = usePagination({
    items: purchases,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
    resetKey,
  });

  const invoiceCompleted = async () => {
    await loadPurchases();
    onChanged?.();
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: 360, display: "grid", placeItems: "center" }}>
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress />

          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Cargando compras...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={2.5}>
        <OwnerBillingFilters
          filters={filters}
          restaurants={restaurants}
          onChange={setFilters}
        />

        <Paper
          sx={{
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            boxShadow: "none",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: 1.75,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                Compras
              </Typography>

              <Typography sx={{ mt: 0.4, fontSize: 12, color: "text.secondary" }}>
                Planes y complementos adquiridos en tus restaurantes.
              </Typography>
            </Box>

            {refreshing ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} />

                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Actualizando...
                </Typography>
              </Stack>
            ) : null}
          </Box>

          {purchases.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gridAutoRows: "1fr",
                  gap: 2,
                  bgcolor: "background.default",
                }}
              >
                {paginatedItems.map((purchase) => (
                  <PurchaseCard
                    key={`${purchase.source_type}-${purchase.source_id}`}
                    purchase={purchase}
                    onInvoice={() => setSelectedPurchase(purchase)}
                  />
                ))}
              </Box>

              <PaginationFooter
                page={page}
                totalPages={totalPages}
                startItem={startItem}
                endItem={endItem}
                total={total}
                hasPrev={hasPrev}
                hasNext={hasNext}
                onPrev={prevPage}
                onNext={nextPage}
                itemLabel="compras"
              />
            </>
          )}
        </Paper>
      </Stack>

      <OwnerPurchaseInvoiceModal
        open={Boolean(selectedPurchase)}
        purchase={selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        onCompleted={invoiceCompleted}
        onAlert={onAlert}
        onEditTaxProfile={onEditTaxProfile}
      />
    </>
  );
}

function PurchaseCard({ purchase, onInvoice }) {
  const visual = purchaseCardVisual(purchase);

  return (
    <Card
      sx={{
        width: "100%",
        minHeight: 330,
        height: "100%",
        border: "1px solid",
        borderColor: visual.border,
        borderTop: "3px solid",
        borderTopColor: visual.accent,
        borderRadius: 1,
        boxShadow: "0 4px 14px rgba(0,0,0,0.035)",
        bgcolor: "#fff",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2,
          bgcolor: visual.headerBg,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "flex-start" }}
          spacing={1.25}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: { xs: 16, sm: 17 },
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.35,
                wordBreak: "break-word",
              }}
            >
              {purchase.concept || "—"}
            </Typography>

            <Typography
              sx={{
                mt: 0.45,
                fontSize: 12,
                fontWeight: 700,
                color: "text.secondary",
              }}
            >
              {typeLabel(purchase.type)}
            </Typography>
          </Box>

          <PurchaseStatusChip
            status={purchase.invoice_status}
            canInvoice={purchase.can_invoice}
          />
        </Stack>
      </Box>

      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          height: "calc(100% - 86px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.75,
          }}
        >
          <InfoBlock label="Restaurante" value={entityName(purchase.restaurant)} />
          <InfoBlock label="Sucursal" value={entityName(purchase.branch)} />
          <InfoBlock label="Fecha de compra" value={formatDate(purchase.purchase_date)} />
          <InfoBlock label="Fecha límite" value={formatDate(purchase.invoice_deadline)} />
        </Box>

        <Box sx={{ flex: 1 }} />

        <Box
          sx={{
            mt: 2,
            px: 1.75,
            py: 1.4,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "rgba(0,0,0,0.025)",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.secondary" }}>
              Importe
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: 19, sm: 21 },
                fontWeight: 900,
                color: "text.primary",
                textAlign: "right",
              }}
            >
              {formatCurrency(purchase.amount, purchase.currency)}
            </Typography>
          </Stack>
        </Box>

        {purchase.can_invoice ? (
          <Button
            fullWidth
            variant="contained"
            startIcon={<ReceiptLongRoundedIcon />}
            onClick={onInvoice}
            sx={{ mt: 1.5, minHeight: 42, fontWeight: 800 }}
          >
            Facturar
          </Button>
        ) : null}
      </Box>
    </Card>
  );
}

function InfoBlock({ label, value }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 1.5,
        py: 1.25,
        borderRadius: 1,
        bgcolor: "rgba(0,0,0,0.025)",
      }}
    >
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.35,
          fontSize: 13,
          fontWeight: 700,
          color: "text.primary",
          lineHeight: 1.4,
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

function PurchaseStatusChip({ status, canInvoice }) {
  const config = purchaseStatusConfig(status, canInvoice);

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        maxWidth: 200,
        flexShrink: 0,
        bgcolor: config.bg,
        color: config.color,
        border: "1px solid",
        borderColor: config.border,
        fontWeight: 800,
      }}
    />
  );
}

function purchaseStatusConfig(status, canInvoice) {
  if (canInvoice) {
    return {
      label: "Disponible para facturar",
      bg: "#E8F5E9",
      color: "#1B5E20",
      border: "#A5D6A7",
    };
  }

  const map = {
    sin_facturar: {
      label: "Sin facturar",
      bg: "#FFF3E0",
      color: "#9A5700",
      border: "#FFD59A",
    },
    procesando: {
      label: "Procesando",
      bg: "#E3F2FD",
      color: "#1565C0",
      border: "#BBDEFB",
    },
    fallido: {
      label: "Fallido",
      bg: "#FFEBEE",
      color: "#C62828",
      border: "#FFCDD2",
    },
    revision_requerida: {
      label: "Requiere revisión",
      bg: "#F3E5F5",
      color: "#7B1FA2",
      border: "#CE93D8",
    },
    facturado: {
      label: "Facturado",
      bg: "#E8F5E9",
      color: "#2E7D32",
      border: "#A5D6A7",
    },
    publico_general: {
      label: "Público general",
      bg: "#ECEFF1",
      color: "#455A64",
      border: "#CFD8DC",
    },
    ventana_vencida: {
      label: "Ventana vencida",
      bg: "#FBEDE7",
      color: "#A4492D",
      border: "#E8B7A5",
    },
  };

  return map[status] || {
    label: status || "Sin estado",
    bg: "#F5F5F5",
    color: "#616161",
    border: "#E0E0E0",
  };
}

function purchaseCardVisual(purchase) {
  if (purchase?.can_invoice) {
    return {
      accent: "#2E7D32",
      border: "#C8E6C9",
      headerBg: "#F6FBF7",
    };
  }

  if (purchase?.invoice_status === "ventana_vencida") {
    return {
      accent: "#B85C38",
      border: "#E7C4B7",
      headerBg: "#FFF8F5",
    };
  }

  if (purchase?.invoice_status === "facturado") {
    return {
      accent: "#2E7D32",
      border: "#C8E6C9",
      headerBg: "#F7FBF7",
    };
  }

  return {
    accent: "#ff9800",
    border: "divider",
    headerBg: "rgba(255,152,0,0.035)",
  };
}

function typeLabel(type) {
  if (type === "plan") return "Plan";
  if (type === "addon") return "Complemento";
  return "Compra";
}

function entityName(value) {
  if (!value) return "—";
  if (typeof value === "string") return value;

  return value.trade_name || value.name || value.business_name || value.label || "—";
}

function formatCurrency(value, currency = "MXN") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(number);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getApiMessage(error, fallback) {
  const data = error?.response?.data;
  const firstError = data?.errors ? Object.values(data.errors).flat()?.[0] : null;

  return firstError || data?.message || fallback;
}

function EmptyState() {
  return (
    <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
      <ReceiptLongRoundedIcon sx={{ fontSize: 44, color: "text.disabled" }} />

      <Typography sx={{ mt: 1.5, fontSize: 20, fontWeight: 800, color: "text.primary" }}>
        No hay compras para mostrar
      </Typography>

      <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
        No se encontraron compras que coincidan con los filtros seleccionados.
      </Typography>
    </Box>
  );
}