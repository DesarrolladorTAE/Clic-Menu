import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";

export default function CashierSaleCard({
  sale,
  mode = "available",
  taking = false,
  onTake,
  onOpenDetail,
}) {
  const saleId = sale?.sale_id;
  const order = sale?.order || null;
  const table = sale?.table || null;

  const customerName = order?.customer_name?.trim() || "Cliente sin nombre";
  const titleAction = mode === "available" ? "Tomar venta" : "Continuar";
  const actionIcon =
    mode === "available" ? <AddTaskRoundedIcon /> : <ArrowForwardRoundedIcon />;

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
                {customerName}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "text.secondary",
                }}
              >
                Venta #{saleId} · Orden #{order?.id || "—"}
              </Typography>
            </Box>

            <Chip
              label={mode === "available" ? "Disponible" : "Tomada"}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: mode === "available" ? "#FFF4D9" : "#E7F8EB",
                color: mode === "available" ? "#8A6D3B" : "#0A7A2F",
              }}
            />
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              icon={<ReceiptLongRoundedIcon />}
              label={table?.name || "Sin mesa"}
              size="small"
            />
            <Chip
              label={order?.status || "—"}
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
              <InfoRow label="Subtotal" value={formatCurrency(sale?.subtotal)} />
              <InfoRow label="Descuento" value={formatCurrency(sale?.discount_total)} />
              <InfoRow label="Propina" value={formatCurrency(sale?.tip)} />
              <InfoRow
                label="Total"
                value={formatCurrency(sale?.total)}
                strong
              />
            </Stack>
          </Box>

          <Stack spacing={0.5}>
            <Typography sx={helperLabelSx}>Creada</Typography>
            <Typography sx={helperValueSx}>
              {formatDateTime(order?.created_at)}
            </Typography>

            {mode === "mine" ? (
              <>
                <Typography sx={{ ...helperLabelSx, mt: 0.75 }}>Tomada</Typography>
                <Typography sx={helperValueSx}>
                  {formatDateTime(sale?.taken_at)}
                </Typography>
              </>
            ) : null}
          </Stack>

          <Box sx={{ flex: 1 }} />

          <Stack spacing={1}>
            {mode === "available" ? (
              <Button
                variant="contained"
                onClick={() => onTake?.(sale)}
                disabled={taking}
                startIcon={actionIcon}
                sx={{
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                {taking ? "Tomando…" : titleAction}
              </Button>
            ) : null}

            <Button
              variant={mode === "available" ? "outlined" : "contained"}
              color={mode === "available" ? "inherit" : "primary"}
              onClick={() => onOpenDetail?.(sale)}
              sx={{
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {mode === "available" ? "Ver detalle" : "Ir al detalle"}
            </Button>
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
