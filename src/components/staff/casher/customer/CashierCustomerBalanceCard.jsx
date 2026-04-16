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
import StarsRoundedIcon from "@mui/icons-material/StarsRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";

export default function CashierCustomerBalanceCard({
  balanceData,
}) {
  const customer = balanceData?.customer || null;
  const pointsBalance = Number(balanceData?.points_balance || 0);

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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Saldo actual
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 14,
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                Consulta rápida del cliente seleccionado.
              </Typography>
            </Box>

            <Chip
              icon={<StarsRoundedIcon />}
              label={`${pointsBalance} puntos`}
              sx={{
                fontWeight: 800,
                bgcolor: "#FFF4D9",
                color: "#8A6D3B",
              }}
            />
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <InfoRow label="Cliente" value={customer?.name_alias || "—"} />
            <InfoRow
              label="Teléfono"
              value={customer?.phone || "—"}
              icon={<PhoneRoundedIcon fontSize="inherit" />}
            />
            <InfoRow
              label="Correo"
              value={customer?.email || "—"}
              icon={<EmailRoundedIcon fontSize="inherit" />}
            />
            <InfoRow
              label="Última actualización"
              value={formatDateTime(balanceData?.updated_at)}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value, icon = null }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1.5}>
      <Stack direction="row" spacing={0.75} alignItems="center">
        {icon ? (
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              color: "text.secondary",
              fontSize: 15,
            }}
          >
            {icon}
          </Box>
        ) : null}

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: "text.secondary",
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 800,
          color: "text.primary",
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Stack>
  );
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