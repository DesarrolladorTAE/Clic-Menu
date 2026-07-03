import React from "react";
import { Box, Stack, Typography } from "@mui/material";

function monthName(month) {
  const names = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const index = Number(month) - 1;
  return names[index] || "mes";
}

export default function SystemSubscriptionSalesHeader({
  refreshing = false,
  period,
}) {
  const periodLabel = (() => {
    if (!period) return "Periodo actual";

    if (period.period === "all") {
      return "Todo el historial";
    }

    if (period.period === "year") {
      return `Año ${period.year}`;
    }

    return `${monthName(period.month)} ${period.year}`;
  })();

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={2}
    >
      <Box>
        <Typography
          sx={{
            fontSize: { xs: 30, md: 42 },
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.1,
          }}
        >
          Ventas de suscripciones
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: { xs: 15, md: 18 },
          }}
        >
          Consulta ventas, renovaciones, demos y accesos internos por periodo.
        </Typography>

        <Typography
          sx={{
            mt: 1,
            fontSize: 13,
            color: "text.secondary",
            fontWeight: 800,
          }}
        >
          Periodo: {periodLabel}
        </Typography>

        {refreshing ? (
          <Typography
            sx={{
              mt: 1,
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Actualizando cambios…
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}