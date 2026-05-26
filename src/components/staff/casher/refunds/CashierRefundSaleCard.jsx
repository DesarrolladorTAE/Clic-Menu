import React from "react";
import {
  Box, Card, CardContent, Chip, IconButton, Stack, Tooltip, Typography,
} from "@mui/material";

import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

export default function CashierRefundSaleCard({
  sale,
  onOpenDetail,
  onOpenCancel,
  onOpenTicketActions,
  thermalPrintSaleId = null,
}) {
  const status = String(sale?.status || "");
  

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.15,
                  wordBreak: "break-word",
                }}
              >
                {sale.customer_name || "Cliente sin nombre"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "text.secondary",
                }}
              >
                Venta #{sale.sale_id} · Orden #{sale.order_id || "—"}
              </Typography>
            </Box>

            <Chip
              label={getRefundStatusLabel(status)}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor:
                  status === "refunded"
                    ? "#F5F5F5"
                    : status === "partially_refunded"
                    ? "#FFF4D9"
                    : "#E7F8EB",
                color:
                  status === "refunded"
                    ? "#444"
                    : status === "partially_refunded"
                    ? "#8A6D3B"
                    : "#0A7A2F",
              }}
            />
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              icon={<HistoryRoundedIcon />}
              label={sale.ticket_folio ? `Folio ${sale.ticket_folio}` : "Sin folio"}
              size="small"
            />
          </Stack>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#FCFCFC",
              p: 1.5,
              minHeight: 98,
            }}
          >
            <Stack spacing={0.8}>
              <InfoRow label="Total" value={formatCurrency(sale.total)} />
              <InfoRow label="Devuelto" value={formatCurrency(sale.refunded_total)} />
              <InfoRow
                label="Disponible"
                value={formatCurrency(sale.available_to_refund)}
                strong
              />
            </Stack>
          </Box>

          <Stack spacing={0.5}>
            <Typography sx={helperLabelSx}>Pagada</Typography>
            <Typography sx={helperValueSx}>
              {formatDateTime(sale.paid_at)}
            </Typography>
          </Stack>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title="Ver detalle">
              <span>
                <IconButton
                  onClick={() => onOpenDetail?.(sale)}
                  sx={actionIconButtonSx}
                >
                  <VisibilityRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Cancelaciones/devoluciones">
              <span>
                <IconButton
                  onClick={() => onOpenCancel?.(sale)}
                  disabled={String(sale?.status || "") === "refunded"}
                  sx={{
                    ...actionIconButtonSx,
                    color: "error.main",
                    borderColor: "rgba(211, 47, 47, 0.35)",
                    "&:hover": {
                      borderColor: "error.main",
                      bgcolor: "rgba(211, 47, 47, 0.06)",
                    },
                  }}
                >
                  <ReplayRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Ticket">
              <span>
                <IconButton
                  disabled={
                    !sale?.ticket?.id ||
                    Number(thermalPrintSaleId || 0) === Number(sale?.sale_id || 0)
                  }
                  onClick={() => onOpenTicketActions?.(sale)}
                  sx={{
                    ...actionIconButtonSx,
                    color: "primary.main",
                  }}
                >
                  <ReceiptLongRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value, strong = false }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1}>
      <Typography
        sx={{
          fontSize: 13,
          color: strong ? "text.primary" : "text.secondary",
          fontWeight: strong ? 800 : 700,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 13,
          color: "text.primary",
          fontWeight: strong ? 800 : 700,
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

const actionIconButtonSx = {
  width: 42,
  height: 42,
  borderRadius: 1.5,
  border: "1px solid",
  borderColor: "divider",
  color: "text.primary",
  bgcolor: "background.paper",
  "&:hover": {
    borderColor: "primary.main",
    bgcolor: "rgba(255, 152, 0, 0.08)",
  },
};

const helperLabelSx = {
  fontSize: 11,
  fontWeight: 800,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

const helperValueSx = {
  mt: 0.1,
  fontSize: 13,
  color: "text.primary",
};

function getRefundStatusLabel(status) {
  switch (String(status || "").toLowerCase()) {
    case "paid":
      return "Pagada";
    case "partially_refunded":
      return "Parcialmente devuelta";
    case "refunded":
      return "Devuelta";
    default:
      return status || "—";
  }
}

function formatCurrency(value) {
  const safe = Number(value || 0);

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
}

function formatDateTime(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}