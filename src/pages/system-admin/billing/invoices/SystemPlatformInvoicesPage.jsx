import { useCallback, useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import { normalizeErr } from "../../../../utils/err";

import SystemPlatformInvoicesFilters from "../../../../components/system-admin/billing/invoices/SystemPlatformInvoicesFilters";
import SystemPlatformInvoicesPanel from "../../../../components/system-admin/billing/invoices/SystemPlatformInvoicesPanel";
import SystemPlatformInvoiceDetailModal from "../../../../components/system-admin/billing/invoices/SystemPlatformInvoiceDetailModal";

import { getSystemOwners } from "../../../../services/system-admin/systemOwners.service";
import {
  downloadSystemPlatformInvoicePdf,
  downloadSystemPlatformInvoiceXml,
  getSystemPlatformInvoices,
  retrySystemPlatformInvoice,
} from "../../../../services/system-admin/billing/platformBilling.service";

const PAGE_SIZE = 4;

export default function SystemPlatformInvoicesPage() {
  const requestRef = useRef(0);
  const loadedRef = useRef(false);

  const [invoices, setInvoices] = useState([]);
  const [owners, setOwners] = useState([]);

  const [filters, setFilters] = useState({
    status: "",
    receiver_type: "",
    issuance_source: "",
    owner_id: "",
  });

  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    page: 1,
    perPage: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailInvoiceId, setDetailInvoiceId] = useState(null);

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

  const loadOwners = useCallback(async () => {
    try {
      const res = await getSystemOwners({ page: 1, per_page: 100 });
      const paginator = res?.data || {};
      setOwners(Array.isArray(paginator?.data) ? paginator.data : []);
    } catch (error) {
      showAlert({
        severity: "error",
        title: "No se pudieron cargar los propietarios",
        message: normalizeErr(error, "Intenta nuevamente."),
      });
    }
  }, []);

  const loadInvoices = useCallback(async (requestedPage = 1) => {
    const myRequest = ++requestRef.current;

    if (!loadedRef.current) setLoading(true);

    try {
      const res = await getSystemPlatformInvoices({
        page: requestedPage,
        per_page: PAGE_SIZE,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.receiver_type ? { receiver_type: filters.receiver_type } : {}),
        ...(filters.issuance_source ? { issuance_source: filters.issuance_source } : {}),
        ...(filters.owner_id ? { owner_id: Number(filters.owner_id) } : {}),
      });

      if (myRequest !== requestRef.current) return;

      const paginated = res?.data || {};
      const rows = Array.isArray(paginated?.data) ? paginated.data : [];

      setInvoices(rows);
      setMeta({
        page: Number(paginated?.current_page || requestedPage || 1),
        perPage: Number(paginated?.per_page || PAGE_SIZE),
        total: Number(paginated?.total || 0),
        totalPages: Math.max(Number(paginated?.last_page || 1), 1),
      });
    } catch (error) {
      if (myRequest !== requestRef.current) return;

      showAlert({
        severity: "error",
        title: "No se pudieron cargar las facturas",
        message: normalizeErr(error, "Intenta nuevamente."),
      });
    } finally {
      if (myRequest !== requestRef.current) return;

      loadedRef.current = true;
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOwners();
  }, [loadOwners]);

  useEffect(() => {
    loadInvoices(page);
  }, [page, loadInvoices]);

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const replaceInvoice = (updated) => {
    if (!updated?.id) return;

    setInvoices((prev) =>
      prev.map((invoice) =>
        Number(invoice.id) === Number(updated.id)
          ? { ...invoice, ...updated }
          : invoice
      )
    );
  };

  const openDetail = (invoice) => {
    setDetailInvoiceId(invoice.id);
    setDetailOpen(true);
  };

  const handleRetry = async (invoice) => {
    if (!invoice?.can_retry || busyKey) return;

    const confirmed = window.confirm(
      `¿Reintentar la factura ${invoiceReference(invoice)}?\n\nSolo continúa si deseas realizar un nuevo intento de timbrado.`
    );

    if (!confirmed) return;

    setBusyKey(`retry-${invoice.id}`);

    try {
      const res = await retrySystemPlatformInvoice(invoice.id);

      if (res?.data) replaceInvoice(res.data);
      showOperationResult(res);
    } catch (error) {
      const response = error?.response?.data;

      if (response?.data?.id) {
        replaceInvoice(response.data);
        showOperationResult(response);
      } else {
        showAlert({
          severity: "error",
          title: "No se pudo reintentar la factura",
          message: normalizeErr(error, "Intenta nuevamente."),
        });
      }
    } finally {
      setBusyKey("");
    }
  };

  const showOperationResult = (res) => {
    if (res?.ok === true && res?.status === "stamped") {
      showAlert({
        severity: "success",
        title: "Factura timbrada",
        message: res?.message || "La factura se timbró correctamente.",
      });
      return;
    }

    if (res?.status === "review_required") {
      showAlert({
        severity: "warning",
        title: "Factura en revisión",
        message: res?.message || "El resultado requiere revisión manual.",
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
      message: res?.message || "La factura continúa en estado fallido.",
    });
  };

  const handleDownloadPdf = async (invoice) => {
    await downloadInvoice(invoice, "pdf");
  };

  const handleDownloadXml = async (invoice) => {
    await downloadInvoice(invoice, "xml");
  };

  const downloadInvoice = async (invoice, type) => {
    const key = `${type}-${invoice.id}`;
    if (busyKey) return;

    setBusyKey(key);

    try {
      const result =
        type === "pdf"
          ? await downloadSystemPlatformInvoicePdf(invoice.id)
          : await downloadSystemPlatformInvoiceXml(invoice.id);

      saveBlob(result.blob, result.filename);
    } catch (error) {
      showAlert({
        severity: "error",
        title: "No se pudo descargar el archivo",
        message: await downloadErrorMessage(
          error,
          type === "pdf"
            ? "El PDF de la factura no está disponible."
            : "El XML de la factura no está disponible."
        ),
      });
    } finally {
      setBusyKey("");
    }
  };

  const pagination = {
    page: meta.page,
    totalPages: meta.totalPages,
    total: meta.total,
    startItem: meta.total === 0 ? 0 : (meta.page - 1) * meta.perPage + 1,
    endItem: meta.total === 0 ? 0 : Math.min(meta.page * meta.perPage, meta.total),
    hasPrev: meta.page > 1,
    hasNext: meta.page < meta.totalPages,
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />

            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
              Cargando facturas…
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
            Facturas emitidas
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: { xs: 15, md: 18 },
              color: "text.secondary",
            }}
          >
            Consulta los comprobantes fiscales generados por compras de planes y complementos.
          </Typography>
        </Box>

        <SystemPlatformInvoicesFilters
          filters={filters}
          owners={owners}
          onChange={handleFiltersChange}
        />

        <SystemPlatformInvoicesPanel
          invoices={invoices}
          pagination={pagination}
          busyKey={busyKey}
          onView={openDetail}
          onDownloadPdf={handleDownloadPdf}
          onDownloadXml={handleDownloadXml}
          onRetry={handleRetry}
          onPrev={() => setPage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setPage((prev) => Math.min(prev + 1, meta.totalPages))}
        />
      </Stack>

      <SystemPlatformInvoiceDetailModal
        open={detailOpen}
        invoiceId={detailInvoiceId}
        onClose={() => {
          setDetailOpen(false);
          setDetailInvoiceId(null);
        }}
        onError={(message) =>
          showAlert({
            severity: "error",
            title: "No se pudo consultar la factura",
            message,
          })
        }
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

function saveBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename || "archivo";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

async function downloadErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const json = JSON.parse(text);
      if (json?.message) return json.message;
    } catch {
      return fallback;
    }
  }

  return data?.message || fallback;
}

function invoiceReference(invoice) {
  const serie = invoice?.fiscal?.serie;
  const folio = invoice?.fiscal?.folio;

  if (serie && folio !== null && folio !== undefined) return `${serie}-${folio}`;
  if (folio !== null && folio !== undefined) return String(folio);

  return `Factura ${invoice?.id || ""}`.trim();
}