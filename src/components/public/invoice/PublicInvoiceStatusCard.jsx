import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";

function statusTitle(status) {
  const titles = {
    not_found: "Ticket no encontrado",
    expired: "Periodo vencido",
    used: "Ticket utilizado",
    cancelled: "Ticket cancelado",
    sale_not_found: "Venta no encontrada",
    sale_not_paid: "Venta no pagada",
    already_invoiced: "Ticket ya facturado",
    taeconta_not_connected: "Taeconta no conectado",
    taeconta_tax_profile_missing: "Perfil fiscal no sincronizado",
    invoice_setting_disabled: "Auto-facturación desactivada",
    not_available: "Ticket no disponible",
    invoice_inconsistent: "Revisión requerida",
  };

  return titles[status] || "No es posible facturar este ticket";
}

function statusLabel(status) {
  const labels = {
    not_found: "No encontrado",
    expired: "Vencido",
    used: "Utilizado",
    cancelled: "Cancelado",
    sale_not_found: "Venta no encontrada",
    sale_not_paid: "Venta no pagada",
    already_invoiced: "Facturado",
    taeconta_not_connected: "Taeconta no conectado",
    taeconta_tax_profile_missing: "Perfil fiscal faltante",
    invoice_setting_disabled: "Facturación desactivada",
    not_available: "No disponible",
    invoice_inconsistent: "Revisión requerida",
  };

  return labels[status] || "No disponible";
}


function statusColor(status) {
  if (
    ["expired", "used", "already_invoiced", "invoice_inconsistent"].includes(
      status
    )
  ) {
    return "primary";
  }

  if (["not_found", "cancelled", "sale_not_found"].includes(status)) {
    return "error";
  }

  return "default";
}

function StatusIcon({ status }) {
  if (status === "expired") return <EventBusyOutlinedIcon />;
  if (status === "used" || status === "already_invoiced") {
    return <ReceiptLongOutlinedIcon />;
  }
  if (status === "cancelled") return <BlockOutlinedIcon />;

  return <ErrorOutlineOutlinedIcon />;
}

export default function PublicInvoiceStatusCard({
  status,
  message,
  data = null,
}) {
  const color = statusColor(status);

  return (
    <Paper
      sx={{
        width: "100%",
        p: { xs: 2.5, sm: 3 },
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        boxShadow: "none",
      }}
    >
      <Stack spacing={2.5} alignItems="center" textAlign="center">
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: (theme) => {
              if (color === "error") {
                return alpha(theme.palette.error.main, 0.1);
              }

              if (color === "primary") {
                return alpha(theme.palette.primary.main, 0.14);
              }

              return alpha(theme.palette.text.secondary, 0.12);
            },
            color:
              color === "error"
                ? "error.main"
                : color === "primary"
                ? "primary.main"
                : "text.secondary",
          }}
        >
          <StatusIcon status={status} />
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: { xs: 22, sm: 26 },
              fontWeight: 900,
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            {statusTitle(status)}
          </Typography>

          <Typography
            sx={{
              mt: 1,
              maxWidth: 620,
              mx: "auto",
              fontSize: 14,
              color: "text.secondary",
              lineHeight: 1.65,
            }}
          >
            {message ||
              "El ticket no está disponible para facturación en este momento."}
          </Typography>
        </Box>

        <Chip
          label={statusLabel(status)}
          color={color}
          variant={color === "default" ? "outlined" : "filled"}
          size="small"
          sx={{ fontWeight: 800 }}
        />

        {data?.restaurant_name ? (
          <Box
            sx={{
              width: "100%",
              p: 1.75,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.default",
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 900,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 0.35,
              }}
            >
              Restaurante
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 15,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              {data.restaurant_name}
            </Typography>
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}