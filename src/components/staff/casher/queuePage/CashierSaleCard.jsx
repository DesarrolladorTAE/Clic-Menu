import React, { useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";

import CashierSaleActionsMenu from "./CashierSaleActionsMenu";
import CashierSaleAccountsList from "./CashierSaleAccountsList";

export default function CashierSaleCard({
  sale,
  mode = "available",
  taking = false,
  disabled = false,
  onTake,
  onOpenDetail,
  onOpenCheck,
  onReopenCheck,
  onSplit,
  onMerge,
  onRelease,
}) {
  const saleId = Number(sale?.sale_id || 0);
  const isMine = mode === "mine";
  const isAvailable = mode === "available";
  const hasBillingGroup = Number(sale?.order_billing_group_id || 0) > 0;

  const orders = useMemo(() => normalizeOrders(sale), [sale]);
  const tables = useMemo(() => normalizeTables(sale), [sale]);
  const checks = useMemo(
    () => (Array.isArray(sale?.checks) ? sale.checks : []),
    [sale]
  );

  const customerLabel = useMemo(() => formatCustomers(orders), [orders]);
  const ordersLabel = useMemo(() => formatOrders(orders), [orders]);
  const tablesLabel = useMemo(() => formatTables(tables), [tables]);

  const accountCount = Number(
    sale?.counts?.active_checks ??
      sale?.counts?.checks_total ??
      checks.length ??
      0
  );

  const total = Number(sale?.total ?? 0);
  const paidTotal = Number(sale?.paid_total ?? 0);
  const pendingTotal = Number(
    sale?.pending_total ?? sale?.payable_total ?? sale?.total ?? 0
  );

  const actionsDisabled = disabled || taking;
  const representativeOrder = orders[0] || sale?.order || null;

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
                  fontSize: 19,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.15,
                  wordBreak: "break-word",
                }}
              >
                Venta #{saleId || "—"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.45,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "text.primary",
                  wordBreak: "break-word",
                }}
              >
                {customerLabel}
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 12,
                  color: "text.secondary",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}
              >
                {ordersLabel}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={0.75}
              alignItems="flex-start"
              flexShrink={0}
            >
              <Chip
                label={generalStatusLabel(sale, mode)}
                size="small"
                sx={generalStatusChipSx(sale, mode)}
              />

              {isMine && hasBillingGroup ? (
                <CashierSaleActionsMenu
                  sale={sale}
                  disabled={actionsDisabled}
                  onSplit={onSplit}
                  onMerge={onMerge}
                  onRelease={onRelease}
                />
              ) : null}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<ReceiptLongRoundedIcon />}
              label={tablesLabel}
              size="small"
            />

            <Chip label={`${accountCount} ${accountCount === 1 ? "cuenta" : "cuentas"}`} size="small" />

            {sale?.billing_group_status ? (
              <Chip
                label={billingStatusLabel(sale.billing_group_status)}
                size="small"
                variant="outlined"
              />
            ) : null}
          </Stack>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#FCFCFC",
              p: 1.5,
            }}
          >
            <Stack spacing={0.8}>
              <InfoRow label="Total" value={formatCurrency(total)} />
              <InfoRow label="Pagado" value={formatCurrency(paidTotal)} />
              <Divider />
              <InfoRow
                label="Pendiente"
                value={formatCurrency(pendingTotal)}
                strong
              />
            </Stack>
          </Box>

          <Stack spacing={0.5}>
            <Typography sx={helperLabelSx}>Mesas</Typography>
            <Typography sx={helperValueSx}>{tablesLabel}</Typography>

            <Typography sx={{ ...helperLabelSx, mt: 0.75 }}>
              Creada
            </Typography>
            <Typography sx={helperValueSx}>
              {formatDateTime(representativeOrder?.created_at)}
            </Typography>

            {isMine ? (
              <>
                <Typography sx={{ ...helperLabelSx, mt: 0.75 }}>
                  Tomada
                </Typography>
                <Typography sx={helperValueSx}>
                  {formatDateTime(sale?.taken_at)}
                </Typography>
              </>
            ) : null}
          </Stack>

          <CashierSaleAccountsList
            checks={checks}
            isMine={isMine}
            disabled={actionsDisabled}
            onOpenCheck={(check) => onOpenCheck?.(check, sale)}
            onReopenCheck={(check) => onReopenCheck?.(check, sale)}
          />

          <Box sx={{ flex: 1 }} />

          <Stack spacing={1}>
            {isAvailable ? (
              <>
                <Button
                  variant="contained"
                  onClick={() => onTake?.(sale)}
                  disabled={actionsDisabled}
                  startIcon={<AddTaskRoundedIcon />}
                  sx={{
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {taking ? "Tomando…" : "Tomar venta"}
                </Button>

                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => onOpenDetail?.(sale)}
                  disabled={actionsDisabled}
                  sx={{
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Ver detalle
                </Button>
              </>
            ) : null}

            {isMine && checks.length === 0 ? (
              <Button
                variant="contained"
                onClick={() => onOpenDetail?.(sale)}
                disabled={actionsDisabled || !saleId}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Continuar
              </Button>
            ) : null}
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

function normalizeOrders(sale) {
  const rows =
    Array.isArray(sale?.orders) && sale.orders.length > 0
      ? sale.orders
      : sale?.order
      ? [sale.order]
      : [];

  const seen = new Set();

  return rows.filter((order) => {
    const id = Number(order?.id || 0);

    if (!id || seen.has(id)) return false;

    seen.add(id);
    return true;
  });
}

function normalizeTables(sale) {
  const rows =
    Array.isArray(sale?.tables) && sale.tables.length > 0
      ? sale.tables
      : sale?.table
      ? [sale.table]
      : [];

  const seen = new Set();

  return rows.filter((table) => {
    const id = Number(table?.id || 0);

    if (!id || seen.has(id)) return false;

    seen.add(id);
    return true;
  });
}

function formatCustomers(orders) {
  const names = Array.from(
    new Set(
      orders
        .map((order) => String(order?.customer_name || "").trim())
        .filter(Boolean)
    )
  );

  return names.length > 0 ? names.join(" · ") : "Cliente sin nombre";
}

function formatOrders(orders) {
  const ids = orders
    .map((order) => Number(order?.id || 0))
    .filter((id) => id > 0);

  if (ids.length === 0) return "Sin orden asociada";

  return ids.map((id) => `Orden #${id}`).join(" · ");
}

function formatTables(tables) {
  if (tables.length === 0) return "Sin mesa";

  return tables
    .map((table) => normalizeTableName(table?.name, table?.id))
    .join(" · ");
}

function normalizeTableName(name, id) {
  const resolved = String(name || "").trim();

  if (!resolved) return `Mesa #${id || "—"}`;
  if (resolved.toLowerCase().startsWith("mesa")) return resolved;

  return `Mesa ${resolved}`;
}

function generalStatusLabel(sale, mode) {
  if (mode === "available") return "Disponible";

  const status = String(sale?.status || "").toLowerCase();

  const labels = {
    pending: "Pendiente",
    taken: "Tomada",
    paid: "Pagada",
    mixed: "Parcial",
  };

  return labels[status] || "Tomada";
}

function generalStatusChipSx(sale, mode) {
  if (mode === "available") {
    return {
      fontWeight: 800,
      bgcolor: "#FFF4D9",
      color: "#8A6D3B",
    };
  }

  const status = String(sale?.status || "").toLowerCase();

  if (status === "paid") {
    return {
      fontWeight: 800,
      bgcolor: "#E7F8EB",
      color: "#0A7A2F",
    };
  }

  if (status === "mixed") {
    return {
      fontWeight: 800,
      bgcolor: "#FFF3E0",
      color: "#A75A00",
    };
  }

  return {
    fontWeight: 800,
    bgcolor: "#EEF3FF",
    color: "#3156A3",
  };
}

function billingStatusLabel(value) {
  const status = String(value || "").toLowerCase();

  const labels = {
    open: "Grupo abierto",
    partially_paid: "Pago parcial",
    paid: "Grupo pagado",
  };

  return labels[status] || status.replaceAll("_", " ");
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
  wordBreak: "break-word",
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