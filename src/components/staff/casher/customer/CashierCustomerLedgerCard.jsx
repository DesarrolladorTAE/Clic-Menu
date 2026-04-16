import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

export default function CashierCustomerLedgerCard({
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
              Ledger de puntos
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Movimientos positivos y negativos generados por compras o devoluciones.
            </Typography>
          </Box>

          <Divider />

          {rows.length > 0 ? (
            <Stack spacing={1.25}>
              {rows.map((row) => {
                const delta = Number(row?.points_delta || 0);
                const positive = delta >= 0;

                return (
                  <Box
                    key={row.id}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      backgroundColor: "#fff",
                      p: 1.5,
                    }}
                  >
                    <Stack spacing={0.85}>
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
                            {translateLedgerReason(row?.reason)}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.35,
                              fontSize: 13,
                              color: "text.secondary",
                            }}
                          >
                            {row?.ticket_folio
                              ? `Folio ${row.ticket_folio}`
                              : row?.sale_id
                              ? `Venta #${row.sale_id}`
                              : "Sin referencia de venta"}
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                          <Typography
                            sx={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: positive ? "#0A7A2F" : "#B42318",
                            }}
                          >
                            {positive ? `+${delta}` : `${delta}`} pts
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.35,
                              fontSize: 12,
                              color: "text.secondary",
                            }}
                          >
                            {formatDateTime(row?.created_at)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <EmptyState text="Aún no hay movimientos de puntos para este cliente." />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function translateLedgerReason(reason) {
  const normalized = String(reason || "").toLowerCase();

  switch (normalized) {
    case "sale_paid":
      return "Compra pagada";
    case "sale_paid_earned":
      return "Puntos generados por compra";
    case "refund_partial":
      return "Devolución parcial";
    case "refund_full":
      return "Devolución total";
    default:
      return "Movimiento de puntos";
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