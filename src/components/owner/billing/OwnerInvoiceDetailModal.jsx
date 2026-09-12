import { useEffect, useRef, useState } from "react";
import {
  Box, Chip, CircularProgress, Dialog, DialogContent, DialogTitle,
  IconButton, Stack, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";

import { getPlatformInvoice } from "../../../services/owner/platformBilling.service";

export default function OwnerInvoiceDetailModal({
  open,
  invoiceId,
  onClose,
  onAlert,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const onAlertRef = useRef(onAlert);

  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    onAlertRef.current = onAlert;
  }, [onAlert]);

  useEffect(() => {
    if (!open || !invoiceId) return undefined;

    let active = true;

    const load = async () => {
      setLoading(true);
      setInvoice(null);

      try {
        const res = await getPlatformInvoice(invoiceId);
        if (!active) return;
        setInvoice(res?.data || null);
      } catch (error) {
        if (!active) return;

        onAlertRef.current?.({
          severity: "error",
          title: "No se pudo consultar la factura",
          message: getApiMessage(error, "Intenta nuevamente."),
        });

        onClose?.();
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [open, invoiceId]);

  const fiscal = invoice?.fiscal || null;
  const receiver = fiscal?.receiver_snapshot || null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            bgcolor: "background.paper",
          },
        },
      }}
    >
      <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "#111111", color: "#fff" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, sm: 24 }, color: "#fff" }}>
              Detalle de factura
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
              Consulta la información fiscal y los conceptos incluidos.
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default" }}>
        {loading ? (
          <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress />
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                Cargando factura...
              </Typography>
            </Stack>
          </Box>
        ) : invoice ? (
          <Stack spacing={2}>
            <Box sx={panelSx}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1.5}
              >
                <Box>
                  <Typography sx={sectionTitleSx}>
                    {invoiceFolio(invoice)}
                  </Typography>

                  <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary" }}>
                    Periodo: {formatDate(invoice.period_date)}
                  </Typography>
                </Box>

                <InvoiceStatusChip status={invoice.status} />
              </Stack>

              <Box sx={infoGridSx}>
                <InfoBlock label="Fecha de timbrado" value={formatDateTime(invoice.stamped_at)} />
                <InfoBlock label="UUID" value={invoice.uuid || "—"} />
                <InfoBlock label="Gestionada por" value={issuanceLabel(invoice.issuance_source)} />
                <InfoBlock label="Uso CFDI" value={fiscal?.uso_cfdi || "—"} />
                <InfoBlock label="Método de pago" value={paymentMethodLabel(fiscal?.metodo_pago)} />
                <InfoBlock label="Forma de pago" value={paymentFormLabel(fiscal?.forma_pago)} />
              </Box>
            </Box>

            <Box sx={panelSx}>
              <Typography sx={sectionTitleSx}>Receptor</Typography>

              <Box sx={infoGridSx}>
                <InfoBlock label="RFC" value={receiverValue(receiver, ["rfc", "clienteRFC"])} />
                <InfoBlock
                  label="Razón social"
                  value={receiverValue(receiver, ["business_name", "name", "Nombre"])}
                />
                <InfoBlock
                  label="Régimen fiscal"
                  value={receiverValue(receiver, ["tax_regime", "regimen", "RegimenFiscal"])}
                />
                <InfoBlock
                  label="Código postal"
                  value={receiverValue(receiver, ["postal_code", "cp", "DomicilioFiscalReceptor"])}
                />
              </Box>
            </Box>

            <Box sx={panelSx}>
              <Typography sx={sectionTitleSx}>Conceptos</Typography>

              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                {(invoice.items || []).map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Stack spacing={1.25}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Box>
                          <Typography sx={{ fontSize: 15, fontWeight: 800 }}>
                            {item.description || "Concepto"}
                          </Typography>

                          <Typography sx={{ mt: 0.4, fontSize: 12, color: "text.secondary" }}>
                            {item.type === "addon" ? "Complemento" : "Plan"}
                          </Typography>
                        </Box>

                        <Typography sx={{ fontSize: 16, fontWeight: 900, color: "primary.main" }}>
                          {formatCurrency(item.total, invoice.currency)}
                        </Typography>
                      </Stack>

                      <InfoRow
                        label="Restaurante"
                        value={sourceEntity(item.source_snapshot, "restaurant")}
                      />

                      <InfoRow
                        label="Sucursal"
                        value={sourceEntity(item.source_snapshot, "branch")}
                      />

                      <InfoRow
                        label="Subtotal"
                        value={formatCurrency(item.subtotal, invoice.currency)}
                      />

                      <InfoRow
                        label="IVA"
                        value={formatCurrency(item.tax_total, invoice.currency)}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box sx={panelSx}>
              <Stack spacing={1.25}>
                <InfoRow label="Subtotal" value={formatCurrency(invoice.subtotal, invoice.currency)} />
                <InfoRow label="IVA" value={formatCurrency(invoice.tax_total, invoice.currency)} />

                <Box sx={{ pt: 1.25, borderTop: "1px solid", borderColor: "divider" }}>
                  <InfoRow
                    label="Total"
                    value={formatCurrency(invoice.total, invoice.currency)}
                    strong
                  />
                </Box>
              </Stack>
            </Box>
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function InvoiceStatusChip({ status }) {
  const config = statusConfig(status);

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{ bgcolor: config.bg, color: config.color, fontWeight: 800 }}
    />
  );
}

function statusConfig(status) {
  const map = {
    stamped: { label: "Timbrada", bg: "#E8F5E9", color: "#2E7D32" },
    processing: { label: "En proceso", bg: "#E3F2FD", color: "#1565C0" },
    failed: { label: "Fallida", bg: "#FFEBEE", color: "#C62828" },
    review_required: { label: "Requiere revisión", bg: "#F3E5F5", color: "#7B1FA2" },
  };

  return map[status] || { label: status || "Sin estado", bg: "#F5F5F5", color: "#616161" };
}

function InfoBlock({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{label}</Typography>
      <Typography
        sx={{
          mt: 0.4,
          fontSize: 14,
          fontWeight: 700,
          color: "text.primary",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

function InfoRow({ label, value, strong = false }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{label}</Typography>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: strong ? 900 : 700,
          color: strong ? "primary.main" : "text.primary",
          textAlign: "right",
        }}
      >
        {value || "—"}
      </Typography>
    </Stack>
  );
}

function invoiceFolio(invoice) {
  const serie = invoice?.fiscal?.serie;
  const folio = invoice?.fiscal?.folio;

  if (serie && folio !== null && folio !== undefined) return `${serie}-${folio}`;
  if (serie) return serie;

  return `Factura #${invoice?.id || ""}`;
}

function issuanceLabel(source) {
  if (source === "owner") return "Propietario";
  if (source === "system_admin") return "Administración";
  return "—";
}

function paymentMethodLabel(value) {
  if (value === "PUE") return "PUE · Pago en una sola exhibición";
  return value || "—";
}

function paymentFormLabel(value) {
  if (value === "03") return "03 · Transferencia electrónica de fondos";
  return value || "—";
}

function receiverValue(snapshot, keys) {
  if (!snapshot || typeof snapshot !== "object") return "—";

  for (const key of keys) {
    if (snapshot[key]) return snapshot[key];
  }

  return "—";
}

function sourceEntity(snapshot, type) {
  if (!snapshot || typeof snapshot !== "object") return "—";

  const value =
    snapshot[type] ||
    snapshot[`${type}_name`] ||
    snapshot[`${type}Name`];

  if (!value) return "—";
  if (typeof value === "string") return value;

  return value.trade_name || value.name || value.label || "—";
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
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("es-MX");
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getApiMessage(error, fallback) {
  const data = error?.response?.data;
  const firstError = data?.errors ? Object.values(data.errors).flat()?.[0] : null;
  return firstError || data?.message || fallback;
}

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
};

const sectionTitleSx = {
  fontSize: 17,
  fontWeight: 800,
  color: "text.primary",
};

const infoGridSx = {
  mt: 2,
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    md: "repeat(3, minmax(0, 1fr))",
  },
  gap: 2,
};