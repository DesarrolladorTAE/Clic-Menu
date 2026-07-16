import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

function formatMoney(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "Sin datos";

  return number.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function formatDate(value) {
  if (!value) return "Sin datos";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function invoiceModeLabel(value) {
  if (value === "global") return "Facturación global";
  if (value === "per_product") return "Facturación por producto";
  if (value === "both") return "Ambos modos";
  return "Sin datos";
}

function statusLabel(value) {
  const labels = {
    available: "Disponible",
    expired: "Vencido",
    used: "Utilizado",
    cancelled: "Cancelado",
    not_found: "No encontrado",
    sale_not_found: "Venta no encontrada",
    sale_not_paid: "Venta no pagada",
    already_invoiced: "Ya facturado",
    taeconta_not_connected: "Taeconta no conectado",
    taeconta_tax_profile_missing: "Perfil fiscal faltante",
    invoice_setting_disabled: "Facturación desactivada",
    not_available: "No disponible",
    stamped: "Timbrado",
  };

  return labels[value] || value || "Sin datos";
}

function statusColor(status, canInvoice) {
  if (canInvoice) return "success";

  if (["expired", "used", "already_invoiced"].includes(status)) {
    return "primary";
  }

  if (["not_found", "cancelled", "sale_not_found"].includes(status)) {
    return "error";
  }

  return "default";
}

export default function PublicInvoiceSummaryCard({ data }) {
  const status = data?.status || "";
  const canInvoice = !!data?.can_invoice;

  const invoiceableTotal =
    data?.invoiceable_total ??
    data?.sale_total;

  const tip = Number(data?.tip ?? 0);

  const paidTotal =
    data?.paid_total ??
    data?.sale_total;

  const hasTip =
    Number.isFinite(tip) &&
    tip > 0;

  return (
    <Paper
      sx={{
        width: "100%",
        p: 0,
        overflow: "hidden",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2,
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
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 900,
              color: "text.primary",
            }}
          >
            Resumen del ticket
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            Verifica la información de tu consumo antes de capturar tus datos
            fiscales.
          </Typography>
        </Box>

        <Chip
          label={statusLabel(status)}
          color={statusColor(status, canInvoice)}
          variant={canInvoice ? "filled" : "outlined"}
          size="small"
          sx={{ fontWeight: 800 }}
        />
      </Box>

      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          <SummaryItem
            icon={<StorefrontOutlinedIcon fontSize="small" />}
            label="Restaurante"
            value={data?.restaurant_name || "Sin datos"}
          />

          <SummaryItem
            icon={<ReceiptLongOutlinedIcon fontSize="small" />}
            label="Folio de venta"
            value={data?.sale_id ? `#${data.sale_id}` : "Sin datos"}
          />

          <SummaryItem
            icon={<PaidOutlinedIcon fontSize="small" />}
            label="Importe a facturar"
            value={formatMoney(invoiceableTotal)}
            secondary={
              hasTip
                ? `Propina: ${formatMoney(tip)} · Total pagado: ${formatMoney(
                    paidTotal
                  )}`
                : null
            }
          />

          <SummaryItem
            icon={<CalendarMonthOutlinedIcon fontSize="small" />}
            label="Fecha de venta"
            value={formatDate(data?.sale_date)}
          />

          <SummaryItem
            icon={<EventAvailableOutlinedIcon fontSize="small" />}
            label="Fecha límite"
            value={formatDate(data?.expires_at)}
          />

          <SummaryItem
            icon={<SettingsOutlinedIcon fontSize="small" />}
            label="Modo de facturación"
            value={invoiceModeLabel(data?.invoice_mode)}
          />
        </Box>
      </Box>
    </Paper>
  );
}

function SummaryItem({ icon, label, value, secondary = null }) {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: 118,
        height: "100%",
        p: 1.75,
        pl: 2.25,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.default",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          bgcolor: "primary.main",
        },
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 900,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 0.35,
            }}
          >
            {label}
          </Typography>
        </Stack>

        <Box>
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.45,
              wordBreak: "break-word",
            }}
          >
            {value || "Sin datos"}
          </Typography>

          {secondary ? (
            <Typography
              sx={{
                mt: 0.5,
                fontSize: 12,
                color: "text.secondary",
                lineHeight: 1.45,
                wordBreak: "break-word",
              }}
            >
              {secondary}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
}