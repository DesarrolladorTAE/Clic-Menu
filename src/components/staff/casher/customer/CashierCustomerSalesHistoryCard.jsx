import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

export default function CashierCustomerSalesHistoryCard({
  rows = [],
}) {
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
        <Stack spacing={2}>
          <Box>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Historial de compras
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Ventas asociadas al cliente formal seleccionado.
            </Typography>
          </Box>

          <Divider />

          {rows.length > 0 ? (
            <Stack spacing={1.25}>
              {rows.map((row) => (
                <Box
                  key={row.sale_id}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    backgroundColor: "#fff",
                    p: 1.5,
                  }}
                >
                  <Stack spacing={1}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "text.primary",
                          }}
                        >
                          Venta #{row.sale_id}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 13,
                            color: "text.secondary",
                          }}
                        >
                          {row?.ticket?.folio
                            ? `Folio ${row.ticket.folio}`
                            : `Orden #${row.order_id}`}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                        <Typography
                          sx={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "text.primary",
                          }}
                        >
                          {formatCurrency(row.total)}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 12,
                            color: "text.secondary",
                          }}
                        >
                          {formatDateTime(row.paid_at)}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={`Estado: ${translateSaleStatus(row.status)}`}
                        size="small"
                      />
                      <Chip
                        label={`Devuelto: ${formatCurrency(row.refunded_total)}`}
                        size="small"
                      />
                      <Chip
                        label={
                          row?.order?.table_id
                            ? `Mesa #${row.order.table_id}`
                            : "Sin mesa"
                        }
                        size="small"
                      />
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <EmptyState text="Este cliente aún no tiene ventas asociadas." />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function translateSaleStatus(status) {
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

function EmptyState({ text }) {
  return (
    <Box
      sx={{
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 1,
        p: 2,
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          color: "text.secondary",
          lineHeight: 1.55,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}