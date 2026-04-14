import React from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

function InfoRow({ label, value, highlight = false }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
    >
      <Typography
        sx={{
          fontSize: 14,
          color: "text.secondary",
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 14,
          color: highlight ? "primary.main" : "text.primary",
          fontWeight: 800,
          textAlign: "right",
        }}
      >
        {value || "—"}
      </Typography>
    </Stack>
  );
}

export default function CashierTicketPreviewCard({
  ticket,
  sale,
  order,
  table,
  ticketWarning = false,
  ticketErrorCode = null,
  ticketErrorMessage = null,
}) {
  const total = Number(sale?.total || 0);
  const hasTicket = Boolean(ticket?.id);

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.25}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: hasTicket ? "primary.main" : "warning.main",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {hasTicket ? <ReceiptLongIcon /> : <WarningAmberRoundedIcon />}
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 21,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.1,
                }}
              >
                {hasTicket ? "Ticket generado" : "Cobro realizado"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 14,
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                {hasTicket
                  ? "La venta ya quedó cerrada correctamente y el ticket quedó listo para verse, imprimirse o descargarse."
                  : "La venta ya quedó cerrada correctamente, pero el ticket no está disponible en este momento."}
              </Typography>
            </Box>
          </Stack>

          {ticketWarning && (
            <Alert
              severity="warning"
              sx={{
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                alignItems: "flex-start",
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 0.5 }}>
                Aviso del ticket
              </Typography>

              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                {ticketErrorMessage ||
                  "La venta fue realizada correctamente, pero ocurrió un problema con el ticket."}
              </Typography>

              {ticketErrorCode ? (
                <Typography
                  sx={{
                    mt: 0.75,
                    fontSize: 12,
                    color: "text.secondary",
                    fontWeight: 700,
                  }}
                >
                  Código: {ticketErrorCode}
                </Typography>
              ) : null}
            </Alert>
          )}

          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Stack spacing={1.5}>
              <InfoRow label="Folio" value={ticket?.folio} highlight={hasTicket} />
              <InfoRow label="Ticket ID" value={ticket?.id} />
              <InfoRow label="Venta" value={sale?.id ? `#${sale.id}` : "—"} />
              <InfoRow label="Orden" value={order?.id ? `#${order.id}` : "—"} />
              <InfoRow label="Mesa" value={table?.name || "Sin mesa"} />
              <InfoRow
                label="Total cobrado"
                value={`$${total.toFixed(2)}`}
                highlight
              />
            </Stack>
          </Box>

          <Divider />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleRoundedIcon
                sx={{
                  color: hasTicket && ticket?.html_available
                    ? "success.main"
                    : "text.disabled",
                  fontSize: 20,
                }}
              />
              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  fontWeight: 700,
                }}
              >
                HTML disponible: {ticket?.html_available ? "Sí" : "No"}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleRoundedIcon
                sx={{
                  color: hasTicket && ticket?.pdf_available
                    ? "success.main"
                    : "text.disabled",
                  fontSize: 20,
                }}
              />
              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  fontWeight: 700,
                }}
              >
                PDF disponible: {ticket?.pdf_available ? "Sí" : "No"}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}