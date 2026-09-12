import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box, Button, Card, Chip, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import {
  downloadPlatformInvoicePdf,
  downloadPlatformInvoiceXml,
  getPlatformInvoices,
  retryPlatformInvoice,
} from "../../../services/owner/platformBilling.service";

import PaginationFooter from "../../common/PaginationFooter";
import OwnerInvoiceDetailModal from "./OwnerInvoiceDetailModal";

const PAGE_SIZE = 4;

export default function OwnerBillingInvoicesTab({
  onAlert,
  refreshKey = 0,
}) {
  const onAlertRef = useRef(onAlert);
  const loadedRef = useRef(false);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);

  const [meta, setMeta] = useState({
    total: 0,
    perPage: PAGE_SIZE,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailInvoiceId, setDetailInvoiceId] = useState(null);
  const [retryingMap, setRetryingMap] = useState({});
  const [downloadingMap, setDownloadingMap] = useState({});

  useEffect(() => {
    onAlertRef.current = onAlert;
  }, [onAlert]);

  const loadInvoices = useCallback(async (targetPage = page) => {
    if (loadedRef.current) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getPlatformInvoices({
        page: targetPage,
        per_page: PAGE_SIZE,
      });

      const paginator = res?.data || {};
      const data = Array.isArray(paginator?.data) ? paginator.data : [];

      const currentPage = Number(paginator?.current_page || targetPage || 1);
      const lastPage = Math.max(1, Number(paginator?.last_page || 1));

      if (currentPage > lastPage) {
        setPage(lastPage);
        return;
      }

      setRows(data);
      setPage(currentPage);

      setMeta({
        total: Number(paginator?.total || 0),
        perPage: Number(paginator?.per_page || PAGE_SIZE),
        lastPage,
        from: Number(paginator?.from || 0),
        to: Number(paginator?.to || 0),
      });
    } catch (error) {
      onAlertRef.current?.({
        severity: "error",
        title: "No se pudieron cargar las facturas",
        message: getApiMessage(error, "Intenta nuevamente."),
      });
    } finally {
      loadedRef.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    loadInvoices(page);
  }, [page, refreshKey]);

  const retryInvoice = async (invoice) => {
    if (!invoice?.id || !invoice?.can_retry || retryingMap[invoice.id]) return;

    setRetryingMap((prev) => ({ ...prev, [invoice.id]: true }));

    try {
      const res = await retryPlatformInvoice(invoice.id);

      notifyOperation(res);
      await loadInvoices(page);
    } catch (error) {
      const response = error?.response?.data;

      if (response?.data?.id) {
        notifyOperation(response);
        await loadInvoices(page);
      } else {
        onAlert?.({
          severity: "error",
          title: "No se pudo reintentar la factura",
          message: getApiMessage(error, "Intenta nuevamente."),
        });
      }
    } finally {
      setRetryingMap((prev) => ({ ...prev, [invoice.id]: false }));
    }
  };

  const notifyOperation = (res) => {
    if (res?.ok === true && res?.status === "stamped") {
      onAlert?.({
        severity: "success",
        title: "Factura timbrada",
        message: res?.message || "La factura se timbró correctamente.",
      });
      return;
    }

    if (res?.status === "review_required") {
      onAlert?.({
        severity: "warning",
        title: "Factura en revisión",
        message: res?.message || "La factura requiere revisión.",
      });
      return;
    }

    if (res?.status === "processing") {
      onAlert?.({
        severity: "info",
        title: "Factura en proceso",
        message: res?.message || "La factura continúa en proceso.",
      });
      return;
    }

    onAlert?.({
      severity: "error",
      title: "No fue posible timbrar la factura",
      message: res?.message || "La factura continúa como fallida.",
    });
  };

  const download = async (invoice, type) => {
    const key = `${invoice.id}-${type}`;
    if (downloadingMap[key]) return;

    setDownloadingMap((prev) => ({ ...prev, [key]: true }));

    try {
      const file =
        type === "pdf"
          ? await downloadPlatformInvoicePdf(invoice.id)
          : await downloadPlatformInvoiceXml(invoice.id);

      saveBlob(file.blob, file.filename);
    } catch (error) {
      onAlert?.({
        severity: "error",
        title: "No se pudo descargar el archivo",
        message: getApiMessage(
          error,
          `El archivo ${type.toUpperCase()} no está disponible.`
        ),
      });
    } finally {
      setDownloadingMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: 360, display: "grid", placeItems: "center" }}>
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress />

          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Cargando facturas...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <>
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
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
              Mis facturas
            </Typography>

            <Typography sx={{ mt: 0.4, fontSize: 12, color: "text.secondary" }}>
              Consulta y descarga las facturas generadas por tus compras de Clic Menu.
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

        {rows.length === 0 ? (
          <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
            <DescriptionRoundedIcon sx={{ fontSize: 44, color: "text.disabled" }} />

            <Typography sx={{ mt: 1.5, fontSize: 20, fontWeight: 800 }}>
              Aún no tienes facturas
            </Typography>

            <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
              Cuando se genere una factura aparecerá en esta sección.
            </Typography>
          </Box>
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
              {rows.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  retrying={Boolean(retryingMap[invoice.id])}
                  downloadingMap={downloadingMap}
                  onView={() => setDetailInvoiceId(invoice.id)}
                  onRetry={() => retryInvoice(invoice)}
                  onDownload={download}
                />
              ))}
            </Box>

            <PaginationFooter
              page={page}
              totalPages={meta.lastPage}
              startItem={meta.from}
              endItem={meta.to}
              total={meta.total}
              hasPrev={page > 1}
              hasNext={page < meta.lastPage}
              onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
              onNext={() => setPage((prev) => Math.min(meta.lastPage, prev + 1))}
              itemLabel="facturas"
            />
          </>
        )}
      </Paper>

      <OwnerInvoiceDetailModal
        open={Boolean(detailInvoiceId)}
        invoiceId={detailInvoiceId}
        onClose={() => setDetailInvoiceId(null)}
        onAlert={onAlert}
      />
    </>
  );
}

function InvoiceCard({
  invoice,
  retrying,
  downloadingMap,
  onView,
  onRetry,
  onDownload,
}) {
  const visual = invoiceCardVisual(invoice.status);

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
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: 16, sm: 17 }, fontWeight: 800 }}>
              {invoiceFolio(invoice)}
            </Typography>

            <Typography sx={{ mt: 0.4, fontSize: 12, color: "text.secondary" }}>
              {invoiceDate(invoice)}
            </Typography>
          </Box>

          <InvoiceStatusChip status={invoice.status} />
        </Stack>
      </Box>

      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          height: "calc(100% - 83px)",
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
            gap: 1.5,
          }}
        >
          <InfoBlock
            label="Total"
            value={formatCurrency(invoice.total, invoice.currency)}
            strong
          />

          <InfoBlock
            label="Periodo"
            value={formatDate(invoice.period_date)}
          />
        </Box>

        <Box
          sx={{
            mt: 1.5,
            px: 1.5,
            py: 1.25,
            borderRadius: 1,
            bgcolor: "rgba(0,0,0,0.025)",
          }}
        >
          <Typography sx={{ mb: 0.5, fontSize: 12, color: "text.secondary" }}>
            UUID
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              fontFamily: "monospace",
              lineHeight: 1.5,
              wordBreak: "break-all",
              color: "text.primary",
            }}
          >
            {invoice.uuid || "—"}
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Stack spacing={1} sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<VisibilityRoundedIcon />}
            onClick={onView}
            sx={{ fontWeight: 800 }}
          >
            Ver detalle
          </Button>

          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={
                downloadingMap[`${invoice.id}-pdf`]
                  ? <CircularProgress size={16} color="inherit" />
                  : <PictureAsPdfRoundedIcon />
              }
              disabled={
                !invoice?.documents?.pdf_available ||
                downloadingMap[`${invoice.id}-pdf`]
              }
              onClick={() => onDownload(invoice, "pdf")}
            >
              PDF
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={
                downloadingMap[`${invoice.id}-xml`]
                  ? <CircularProgress size={16} color="inherit" />
                  : <CodeRoundedIcon />
              }
              disabled={
                !invoice?.documents?.xml_available ||
                downloadingMap[`${invoice.id}-xml`]
              }
              onClick={() => onDownload(invoice, "xml")}
            >
              XML
            </Button>
          </Stack>

          {invoice.can_retry ? (
            <Button
              fullWidth
              variant="outlined"
              startIcon={
                retrying
                  ? <CircularProgress size={16} color="inherit" />
                  : <ReplayRoundedIcon />
              }
              disabled={retrying}
              onClick={onRetry}
              sx={{
                color: "warning.dark",
                borderColor: "warning.main",
                "&:hover": {
                  borderColor: "warning.dark",
                  bgcolor: "rgba(237,108,2,0.05)",
                },
              }}
            >
              {retrying ? "Reintentando..." : "Reintentar"}
            </Button>
          ) : null}
        </Stack>
      </Box>
    </Card>
  );
}

function InfoBlock({ label, value, strong = false }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 1.5,
        py: 1.25,
        borderRadius: 1,
        bgcolor: strong ? "rgba(255,152,0,0.055)" : "rgba(0,0,0,0.025)",
        border: strong ? "1px solid rgba(255,152,0,0.14)" : "1px solid transparent",
      }}
    >
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.35,
          fontSize: strong ? 18 : 13,
          fontWeight: strong ? 900 : 700,
          color: strong ? "primary.main" : "text.primary",
          lineHeight: 1.4,
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

function InvoiceStatusChip({ status }) {
  const config = statusConfig(status);

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
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

function statusConfig(status) {
  const map = {
    stamped: {
      label: "Timbrada",
      bg: "#E8F5E9",
      color: "#2E7D32",
      border: "#A5D6A7",
    },
    processing: {
      label: "En proceso",
      bg: "#E3F2FD",
      color: "#1565C0",
      border: "#90CAF9",
    },
    failed: {
      label: "Fallida",
      bg: "#FFEBEE",
      color: "#C62828",
      border: "#EF9A9A",
    },
    review_required: {
      label: "Requiere revisión",
      bg: "#F3E5F5",
      color: "#7B1FA2",
      border: "#CE93D8",
    },
  };

  return map[status] || {
    label: status || "Sin estado",
    bg: "#F5F5F5",
    color: "#616161",
    border: "#E0E0E0",
  };
}

function invoiceCardVisual(status) {
  const map = {
    stamped: {
      accent: "#2E7D32",
      border: "#C8E6C9",
      headerBg: "#F6FBF7",
    },
    processing: {
      accent: "#1976D2",
      border: "#BBDEFB",
      headerBg: "#F5FAFF",
    },
    failed: {
      accent: "#D32F2F",
      border: "#FFCDD2",
      headerBg: "#FFF8F8",
    },
    review_required: {
      accent: "#8E24AA",
      border: "#E1BEE7",
      headerBg: "#FCF8FD",
    },
  };

  return map[status] || {
    accent: "#ff9800",
    border: "divider",
    headerBg: "rgba(255,152,0,0.035)",
  };
}

function invoiceFolio(invoice) {
  const serie = invoice?.fiscal?.serie;
  const folio = invoice?.fiscal?.folio;

  if (serie && folio !== null && folio !== undefined) return `${serie}-${folio}`;
  if (serie) return serie;

  return `Factura #${invoice?.id || ""}`;
}

function invoiceDate(invoice) {
  const value =
    invoice?.stamped_at ||
    invoice?.fiscal?.fiscal_date ||
    invoice?.period_date;

  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("es-MX");
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(value, currency = "MXN") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(number);
}

function saveBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename || "factura";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}

function getApiMessage(error, fallback) {
  const data = error?.response?.data;

  if (data instanceof Blob) return fallback;

  const firstError = data?.errors
    ? Object.values(data.errors).flat()?.[0]
    : null;

  return firstError || data?.message || fallback;
}