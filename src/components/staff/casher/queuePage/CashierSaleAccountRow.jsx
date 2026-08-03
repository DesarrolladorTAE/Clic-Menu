// src/components/staff/casher/queuePage/CashierSaleAccountRow.jsx
import React from "react";
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";

export default function CashierSaleAccountRow({
  check,
  isMine = false,
  disabled = false,
  onOpen,
  onReopen,
}) {
  const status = String(check?.status || check?.check_status || "").toLowerCase();
  const permissions = check?.permissions || {};
  const paid = status === "paid";

  const canOpen =
    isMine &&
    !paid &&
    permissions.can_open === true &&
    Number(check?.sale_id || 0) > 0;

  const canReopen = isMine && !paid && permissions.can_reopen === true;
  const chip = statusChip(status);

  return (
    <Card
      sx={{
        height: "100%",
        minHeight: 138,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent
        sx={{
          p: 1.5,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: 1.5 },
        }}
      >
        <Stack spacing={1.25} sx={{ height: "100%" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "flex-start" }}
            spacing={1}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", wordBreak: "break-word" }}>
                {check?.name || check?.code || `Cuenta #${check?.order_check_id || check?.id || "—"}`}
              </Typography>

              <Typography sx={{ mt: 0.3, fontSize: 12, lineHeight: 1.4, color: "text.secondary" }}>
                {formatCheckDescription(check)}
              </Typography>
            </Box>

            <Stack
              direction="row"
              justifyContent={{ xs: "space-between", sm: "flex-end" }}
              alignItems="center"
              spacing={1}
              flexShrink={0}
            >
              <Chip label={chip.label} size="small" color={chip.color} variant={chip.variant} />

              <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary", whiteSpace: "nowrap" }}>
                {formatCurrency(check?.total)}
              </Typography>
            </Stack>
          </Stack>

          <Box sx={{ flex: 1 }} />

          {canOpen || canReopen ? (
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end" spacing={1}>
              {canOpen ? (
                <Button
                  type="button"
                  size="small"
                  variant="contained"
                  disabled={disabled}
                  onClick={() => onOpen?.(check)}
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  Continuar
                </Button>
              ) : null}

              {canReopen ? (
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  color="secondary"
                  disabled={disabled}
                  onClick={() => onReopen?.(check)}
                  startIcon={<LockOpenRoundedIcon />}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  Reabrir
                </Button>
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function formatCheckDescription(check) {
  const splitType = String(check?.split_type || "").trim();
  const partIndex = Number(check?.part_index || 0);
  const partsTotal = Number(check?.parts_total || 0);

  if (partIndex > 0 && partsTotal > 0) return `Parte ${partIndex} de ${partsTotal}`;
  if (splitType && splitType !== "normal") return splitType.replaceAll("_", " ");

  return check?.sale_id ? `Venta #${check.sale_id}` : "Cuenta financiera";
}

function statusChip(status) {
  if (status === "paid") {
    return { label: "Pagada", color: "success", variant: "outlined" };
  }

  if (status === "locked") {
    return { label: "Bloqueada", color: "warning", variant: "outlined" };
  }

  if (status === "paying") {
    return { label: "En pago", color: "warning", variant: "outlined" };
  }

  return {
    label: status === "open" ? "Abierta" : status || "Sin estado",
    color: "secondary",
    variant: "outlined",
  };
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
