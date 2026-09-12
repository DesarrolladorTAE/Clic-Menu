import { useEffect, useState } from "react";
import {
  Box, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Stack,
  Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";

import { getSystemPlatformInvoice } from "../../../../services/system-admin/billing/platformBilling.service";

export default function SystemPlatformInvoiceDetailModal({
  open,
  invoiceId,
  onClose,
  onError,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !invoiceId) return;

    let alive = true;

    const load = async () => {
      setLoading(true);
      setInvoice(null);

      try {
        const res = await getSystemPlatformInvoice(invoiceId);
        if (!alive) return;

        setInvoice(res?.data || null);
      } catch (error) {
        if (!alive) return;

        onError?.(
          apiMessage(error, "No se pudo consultar el detalle de la factura.")
        );
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [open, invoiceId, onError]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth={false}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 860 },
            height: { xs: "100%", sm: "auto" },
            maxHeight: { xs: "100%", sm: "92vh" },
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            bgcolor: "background.paper",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: "#111111",
          color: "#fff",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 800, color: "#fff" }}>
              Detalle de factura
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
              {invoice ? invoiceReference(invoice) : "Consultando información fiscal…"}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            aria-label="Cerrar"
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

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "background.default",
          overflowY: "auto",
        }}
      >
        {loading ? (
          <Box sx={{ minHeight: 360, display: "grid", placeItems: "center" }}>
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress color="primary" />
              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                Cargando detalle…
              </Typography>
            </Stack>
          </Box>
        ) : invoice ? (
          <Stack spacing={2}>
            <InvoiceSummary invoice={invoice} />
            <ReceiverSection invoice={invoice} />
            <FiscalSection invoice={invoice} />
            <ItemsSection invoice={invoice} />
            <TotalsSection invoice={invoice} />
            <AttemptsSection attempts={invoice.attempts || []} />
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function InvoiceSummary({ invoice }) {
  return (
    <Section title="Resumen de la factura">
      <Box sx={gridSx}>
        <InfoBlock label="Serie / Folio" value={invoiceReference(invoice)} />
        <InfoBlock label="Periodo" value={formatPeriod(invoice.period_date)} />
        <InfoBlock label="Estado" value={<InvoiceStatusChip status={invoice.status} />} />
        <InfoBlock label="Origen de emisión" value={issuanceSourceLabel(invoice.issuance_source)} />
        <InfoBlock label="Tipo de receptor" value={receiverTypeLabel(invoice.receiver_type)} />
        <InfoBlock label="Fecha fiscal" value={formatDateTime(invoice?.fiscal?.fiscal_date)} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <InfoBlock label="UUID" value={invoice.uuid || "—"} monospace />
      </Box>
    </Section>
  );
}

function ReceiverSection({ invoice }) {
  const snapshot = invoice?.fiscal?.receiver_snapshot || {};
  const receiver = invoice?.receiver || {};

  const businessName =
    snapshot.business_name ||
    receiver.full_name ||
    receiver.name ||
    (invoice.receiver_type === "public_general" ? "Público General" : "—");

  return (
    <Section title="Receptor">
      <Box sx={gridSx}>
        <InfoBlock
          label={invoice.receiver_type === "public_general" ? "Receptor" : "Propietario"}
          value={receiverName(invoice)}
        />

        <InfoBlock label="RFC" value={snapshot.rfc || receiver.rfc || "—"} />
        <InfoBlock label="Razón social" value={businessName} />
        <InfoBlock label="Régimen fiscal" value={snapshot.tax_regime || "—"} />
        <InfoBlock label="Código postal fiscal" value={snapshot.postal_code || "—"} />
        <InfoBlock label="Correo" value={snapshot.email || receiver.email || "—"} />
      </Box>
    </Section>
  );
}

function FiscalSection({ invoice }) {
  const fiscal = invoice?.fiscal || {};

  return (
    <Section title="Información fiscal">
      <Box sx={gridSx}>
        <InfoBlock label="Uso CFDI" value={usoCfdiLabel(fiscal.uso_cfdi)} />
        <InfoBlock label="Método de pago" value={paymentMethodLabel(fiscal.metodo_pago)} />
        <InfoBlock label="Forma de pago" value={paymentFormLabel(fiscal.forma_pago)} />
        <InfoBlock label="Fecha de timbrado" value={formatDateTime(invoice.stamped_at)} />
      </Box>
    </Section>
  );
}

function ItemsSection({ invoice }) {
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  return (
    <Section title={`Conceptos (${items.length})`}>
      {items.length === 0 ? (
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          No hay conceptos registrados.
        </Typography>
      ) : (
        <Stack spacing={1.25}>
          {items.map((item) => {
            const snapshot = item.source_snapshot || {};

            return (
              <Box
                key={item.id}
                sx={{
                  p: 1.75,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "#fff",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                      {item.description || "Concepto"}
                    </Typography>

                    <Typography sx={{ mt: 0.3, fontSize: 12, color: "text.secondary" }}>
                      {item.type === "plan" ? "Plan" : item.type === "addon" ? "Complemento" : "Compra"}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: 16, fontWeight: 900, color: "text.primary" }}>
                    {formatCurrency(item.total, invoice.currency)}
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    mt: 1.5,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                    gap: 1,
                  }}
                >
                  <SmallInfo
                    label="Propietario"
                    value={
                      invoice.receiver_type === "owner"
                        ? receiverName(invoice)
                        : snapshot.owner_id
                          ? `Propietario #${snapshot.owner_id}`
                          : "—"
                    }
                  />

                  <SmallInfo
                    label="Restaurante"
                    value={snapshot.restaurant_name || `Restaurante #${item.restaurant_id}`}
                  />

                  <SmallInfo
                    label="Sucursal"
                    value={
                      snapshot.branch_name ||
                      (item.branch_id ? `Sucursal #${item.branch_id}` : "No aplica")
                    }
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </Section>
  );
}

function TotalsSection({ invoice }) {
  return (
    <Section title="Totales">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
          gap: 1.25,
        }}
      >
        <AmountBlock label="Subtotal" value={formatCurrency(invoice.subtotal, invoice.currency)} />
        <AmountBlock label="IVA" value={formatCurrency(invoice.tax_total, invoice.currency)} />

        <Box
          sx={{
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "rgba(0,0,0,0.025)",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Total</Typography>
          <Typography sx={{ mt: 0.3, fontSize: 21, fontWeight: 900, color: "text.primary" }}>
            {formatCurrency(invoice.total, invoice.currency)}
          </Typography>
        </Box>
      </Box>
    </Section>
  );
}

function AttemptsSection({ attempts }) {
  if (!attempts.length) return null;

  const ordered = [...attempts].sort(
    (a, b) => Number(b.attempt_number || 0) - Number(a.attempt_number || 0)
  );

  return (
    <Section title="Historial de intentos">
      <Stack spacing={1.25}>
        {ordered.map((attempt) => (
          <Box
            key={attempt.id}
            sx={{
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "#fff",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={1}
            >
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                  Intento {attempt.attempt_number}
                </Typography>

                <Typography sx={{ mt: 0.3, fontSize: 12, color: "text.secondary" }}>
                  {formatDateTime(attempt.created_at)}
                </Typography>
              </Box>

              <InvoiceStatusChip status={attempt.status} />
            </Stack>

            <Box
              sx={{
                mt: 1.25,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                gap: 1,
              }}
            >
              <SmallInfo
                label="Código de respuesta"
                value={attempt.http_status ? String(attempt.http_status) : "—"}
              />

              <SmallInfo
                label="Referencia TaeConta"
                value={attempt.taeconta_factura_id || "—"}
              />
            </Box>

            {attempt.error_message ? (
              <Box
                sx={{
                  mt: 1.25,
                  p: 1.25,
                  borderRadius: 1,
                  bgcolor: "rgba(211,47,47,0.055)",
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: "error.main" }}>
                  Resultado
                </Typography>

                <Typography sx={{ mt: 0.35, fontSize: 12, color: "text.primary", lineHeight: 1.5 }}>
                  {attempt.error_message}
                </Typography>
              </Box>
            ) : null}
          </Box>
        ))}
      </Stack>
    </Section>
  );
}

function Section({ title, children }) {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.25 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
    >
      <Typography sx={{ mb: 1.5, fontSize: 17, fontWeight: 800, color: "text.primary" }}>
        {title}
      </Typography>

      {children}
    </Box>
  );
}

function InfoBlock({ label, value, monospace = false }) {
  return (
    <Box sx={{ minWidth: 0, p: 1.3, borderRadius: 1, bgcolor: "rgba(0,0,0,0.025)" }}>
      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{label}</Typography>

      {typeof value === "string" || typeof value === "number" ? (
        <Typography
          sx={{
            mt: 0.3,
            fontSize: 13,
            fontWeight: 700,
            color: "text.primary",
            lineHeight: 1.45,
            wordBreak: "break-word",
            ...(monospace ? { fontFamily: "monospace" } : {}),
          }}
        >
          {value || "—"}
        </Typography>
      ) : (
        <Box sx={{ mt: 0.5 }}>{value}</Box>
      )}
    </Box>
  );
}

function SmallInfo({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 10, fontWeight: 800, color: "text.secondary" }}>
        {label}
      </Typography>

      <Typography sx={{ mt: 0.2, fontSize: 12, color: "text.primary", wordBreak: "break-word" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function AmountBlock({ label, value }) {
  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "#fff",
      }}
    >
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ mt: 0.3, fontSize: 17, fontWeight: 800 }}>{value}</Typography>
    </Box>
  );
}

function InvoiceStatusChip({ status }) {
  const map = {
    stamped: ["Timbrada", "#E8F5E9", "#2E7D32", "#A5D6A7"],
    processing: ["En proceso", "#E3F2FD", "#1565C0", "#BBDEFB"],
    failed: ["Fallida", "#FFEBEE", "#C62828", "#FFCDD2"],
    review_required: ["Requiere revisión", "#F3E5F5", "#7B1FA2", "#CE93D8"],
  };

  const [label, bg, color, border] = map[status] || [
    "Sin estado",
    "#F5F5F5",
    "#616161",
    "#E0E0E0",
  ];

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: bg,
        color,
        border: "1px solid",
        borderColor: border,
        fontWeight: 800,
      }}
    />
  );
}

function receiverName(invoice) {
  if (invoice?.receiver_type === "public_general") {
    return invoice?.receiver?.name || "Público General";
  }

  return invoice?.receiver?.full_name ||
    [invoice?.receiver?.name, invoice?.receiver?.last_name_paternal, invoice?.receiver?.last_name_maternal]
      .filter(Boolean)
      .join(" ") ||
    "—";
}

function receiverTypeLabel(value) {
  if (value === "owner") return "Propietario";
  if (value === "public_general") return "Público General";
  return "—";
}

function issuanceSourceLabel(value) {
  if (value === "owner") return "Propietario";
  if (value === "system_admin") return "Administrador";
  return "—";
}

function invoiceReference(invoice) {
  const serie = invoice?.fiscal?.serie;
  const folio = invoice?.fiscal?.folio;

  if (serie && folio !== null && folio !== undefined) return `${serie}-${folio}`;
  if (folio !== null && folio !== undefined) return String(folio);

  return "Sin folio";
}

function usoCfdiLabel(value) {
  const labels = {
    G01: "Adquisición de mercancías",
    G02: "Devoluciones, descuentos o bonificaciones",
    G03: "Gastos en general",
    I01: "Construcciones",
    I02: "Mobiliario y equipo de oficina por inversiones",
    I03: "Equipo de transporte",
    I04: "Equipo de cómputo y accesorios",
    I05: "Dados, troqueles, moldes, matrices y herramental",
    I06: "Comunicaciones telefónicas",
    I07: "Comunicaciones satelitales",
    I08: "Otra maquinaria y equipo",
    D01: "Honorarios médicos, dentales y gastos hospitalarios",
    D02: "Gastos médicos por incapacidad o discapacidad",
    D03: "Gastos funerales",
    D04: "Donativos",
    D05: "Intereses reales por créditos hipotecarios",
    D06: "Aportaciones voluntarias al SAR",
    D07: "Primas por seguros de gastos médicos",
    D08: "Transportación escolar obligatoria",
    D09: "Depósitos para ahorro y planes de pensiones",
    D10: "Servicios educativos",
    CP01: "Pagos",
    CN01: "Nómina",
    S01: "Sin efectos fiscales",
  };

  if (!value) return "—";
  return labels[value] ? `${value} - ${labels[value]}` : value;
}

function paymentMethodLabel(value) {
  if (value === "PUE") return "PUE - Pago en una sola exhibición";
  if (value === "PPD") return "PPD - Pago en parcialidades o diferido";
  return value || "—";
}

function paymentFormLabel(value) {
  if (value === "03") return "03 - Transferencia electrónica de fondos";
  return value || "—";
}

function formatPeriod(value) {
  if (!value) return "—";

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";

  const text = date.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  return text.charAt(0).toUpperCase() + text.slice(1);
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

function formatCurrency(value, currency = "MXN") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(number);
}

function apiMessage(error, fallback) {
  const data = error?.response?.data;
  const first = data?.errors ? Object.values(data.errors).flat()?.[0] : null;
  return first || data?.message || fallback;
}

const gridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    md: "repeat(3, minmax(0, 1fr))",
  },
  gap: 1.25,
};