import React from "react";
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";

export default function CashierSaleAccountRow({
  check,
  isMine = false,
  disabled = false,
  onOpen,
  onReopen,
}) {
  const status = String(
    check?.status || check?.check_status || ""
  ).toLowerCase();

  const permissions = check?.permissions || {};
  const paid = status === "paid";

  const canOpen =
    isMine &&
    !paid &&
    permissions.can_open === true &&
    Number(check?.sale_id || 0) > 0;

  const canReopen =
    isMine &&
    !paid &&
    permissions.can_reopen === true;

  return (
    <Box
      sx={{
        p: 1.25,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor: "#FCFCFC",
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: "text.primary",
                wordBreak: "break-word",
              }}
            >
              {check?.name ||
                check?.code ||
                `Cuenta #${check?.order_check_id || check?.id || "—"}`}
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: 12,
                color: "text.secondary",
              }}
            >
              {formatCheckDescription(check)}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            flexShrink={0}
          >
            <Chip
              label={paid ? "Pagada" : statusLabel(status)}
              size="small"
              sx={statusChipSx(status)}
            />

            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: "text.primary",
                whiteSpace: "nowrap",
              }}
            >
              {formatCurrency(check?.total)}
            </Typography>
          </Stack>
        </Stack>

        {canOpen || canReopen ? (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {canOpen ? (
              <Button
                size="small"
                variant="contained"
                disabled={disabled}
                onClick={() => onOpen?.(check)}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ borderRadius: 2, fontWeight: 800 }}
              >
                Continuar
              </Button>
            ) : null}

            {canReopen ? (
              <Button
                size="small"
                variant="outlined"
                disabled={disabled}
                onClick={() => onReopen?.(check)}
                startIcon={<LockOpenRoundedIcon />}
                sx={{ borderRadius: 2, fontWeight: 800 }}
              >
                Reabrir
              </Button>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}

function formatCheckDescription(check) {
  const splitType = String(check?.split_type || "").trim();
  const partIndex = Number(check?.part_index || 0);
  const partsTotal = Number(check?.parts_total || 0);

  if (partIndex > 0 && partsTotal > 0) {
    return `Parte ${partIndex} de ${partsTotal}`;
  }

  if (splitType && splitType !== "normal") {
    return splitType.replaceAll("_", " ");
  }

  return check?.sale_id
    ? `Venta #${check.sale_id}`
    : "Cuenta financiera";
}

function statusLabel(status) {
  const labels = {
    open: "Abierta",
    locked: "Bloqueada",
    paying: "En pago",
    paid: "Pagada",
  };

  return labels[status] || status || "Sin estado";
}

function statusChipSx(status) {
  if (status === "paid") {
    return {
      fontWeight: 800,
      bgcolor: "#E7F8EB",
      color: "#0A7A2F",
    };
  }

  if (status === "locked" || status === "paying") {
    return {
      fontWeight: 800,
      bgcolor: "#FFF4D9",
      color: "#8A6D3B",
    };
  }

  return {
    fontWeight: 800,
    bgcolor: "#EEF3FF",
    color: "#3156A3",
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
