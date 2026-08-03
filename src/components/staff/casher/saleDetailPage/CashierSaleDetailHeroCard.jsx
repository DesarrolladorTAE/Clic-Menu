// src/components/staff/casher/saleDetailPage/CashierSaleDetailHeroCard.jsx
import React from "react";
import {
  Box, Button, Card, CardContent, Chip, Stack, Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import FormatListNumberedRoundedIcon from "@mui/icons-material/FormatListNumberedRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import TableRestaurantRoundedIcon from "@mui/icons-material/TableRestaurantRounded";

export default function CashierSaleDetailHeroCard({
  sale,
  selectedCheck = null,
  preparedCheck = null,
  saleCheckContext = null,
  billingGroup = null,
  relatedOrders = [],
  relatedTables = [],
  cashSession = null,
  onBack,
  canOperate = false,
  preparing = false,
}) {
  const check =
    preparedCheck?.check ||
    selectedCheck ||
    saleCheckContext?.check ||
    null;

  const exactSale =
    preparedCheck?.sale ||
    check?.sale ||
    sale ||
    null;

  const activeCashSession =
    cashSession ||
    saleCheckContext?.cash_session ||
    null;

  const packageData =
    billingGroup ||
    preparedCheck?.billing_group ||
    preparedCheck?.summary?.billing_group ||
    saleCheckContext?.billing_group ||
    saleCheckContext?.operational?.billing_group ||
    exactSale?.billing_group ||
    null;

  const checkItems = Array.isArray(check?.items) ? check.items : [];

  const orderRows = mergeEntityRows(
    relatedOrders,
    saleCheckContext?.orders,
    preparedCheck?.summary?.orders,
    exactSale?.order ? [exactSale.order] : [],
    sale?.order ? [sale.order] : [],
    check?.primary_order_id ? [{ id: check.primary_order_id }] : [],
    checkItems.map((item) => ({
      id: item?.source_order_id,
    }))
  );

  const tableRows = mergeEntityRows(
    relatedTables,
    saleCheckContext?.tables,
    preparedCheck?.summary?.tables,
    exactSale?.table ? [exactSale.table] : [],
    sale?.table ? [sale.table] : [],
    check?.primary_table_id ? [{ id: check.primary_table_id }] : [],
    checkItems.map((item) => ({
      id: item?.source_table_id,
    }))
  );

  const saleId = positiveInt(
    exactSale?.id ??
      exactSale?.sale_id ??
      saleCheckContext?.sale_id ??
      check?.sale_id
  );

  const checkId = positiveInt(
    check?.id ??
      check?.order_check_id
  );

  const linkedSaleId = positiveInt(
    check?.sale_id ??
      check?.sale?.id ??
      check?.sale?.sale_id
  );

  const billingGroupId = positiveInt(
    packageData?.id ??
      preparedCheck?.order_billing_group_id ??
      saleCheckContext?.order_billing_group_id ??
      exactSale?.order_billing_group_id
  );

  const checkStatus = normalizeStatus(check?.status);

  const packageStatus = normalizeStatus(
    packageData?.status ??
      preparedCheck?.billing_group?.status ??
      preparedCheck?.billing_group_status ??
      preparedCheck?.summary?.billing_group?.status ??
      preparedCheck?.summary?.billing_group_status ??
      saleCheckContext?.operational?.billing_group_status ??
      saleCheckContext?.structure?.billing_group_status ??
      saleCheckContext?.billing_group_status ??
      exactSale?.billing_group_status
  );
  const cashSessionStatus = normalizeStatus(activeCashSession?.status);

  const exactSaleLinked =
    saleId > 0 &&
    linkedSaleId > 0 &&
    saleId === linkedSaleId;

  const validCashSession =
    positiveInt(activeCashSession?.id) > 0 &&
    ["open", "active"].includes(cashSessionStatus);

  const availableForEditing =
    checkStatus === "open" &&
    exactSaleLinked &&
    validCashSession;

  const readyForPayment =
    Boolean(canOperate) &&
    checkStatus === "paying" &&
    exactSaleLinked &&
    validCashSession;

  const readinessLabel = resolveReadinessLabel({
    readyForPayment,
    availableForEditing,
    preparing,
    check,
    checkStatus,
    exactSaleLinked,
    validCashSession,
  });

  const readinessColors = readyForPayment
    ? {
        backgroundColor: "#E7F8EB",
        color: "#0A7A2F",
      }
    : {
        backgroundColor: "#FFF4D9",
        color: "#8A6D3B",
      };

  const checkName =
    cleanText(check?.name) ||
    cleanText(check?.code) ||
    "Cuenta seleccionada";

  const ordersLabel = formatOrderRows(orderRows);
  const tablesLabel = formatTableRows(tableRows);

  const cashRegisterLabel = positiveInt(activeCashSession?.cash_register_id)
    ? `Caja #${positiveInt(activeCashSession.cash_register_id)}`
    : "Caja no identificada";

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
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 28, md: 40 },
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.06,
                }}
              >
                Cobrar cuenta
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: { xs: 14, md: 16 },
                  lineHeight: 1.55,
                  maxWidth: 820,
                }}
              >
                Revisa los productos asignados a esta cuenta, aplica los ajustes
                permitidos, valida la vista previa y confirma únicamente su
                cobro.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="inherit"
              onClick={onBack}
              startIcon={<ArrowBackRoundedIcon />}
              sx={{
                width: { xs: "100%", md: "auto" },
                minWidth: { xs: "100%", md: 210 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Volver a Mis ventas
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={readinessLabel}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: readinessColors.backgroundColor,
                color: readinessColors.color,
              }}
            />

            <Chip
              label={`Estado cuenta: ${translateStatus(
                checkStatus,
                "check"
              )}`}
              size="small"
            />

            {packageStatus ? (
              <Chip
                label={`Estado paquete: ${translateStatus(
                  packageStatus,
                  "billing"
                )}`}
                size="small"
              />
            ) : null}

            <Chip
              label={`${cashRegisterLabel} · ${translateStatus(
                cashSessionStatus,
                "cash"
              )}`}
              size="small"
            />

            {billingGroupId > 0 ? (
              <Chip
                label={`Paquete financiero #${billingGroupId}`}
                size="small"
              />
            ) : null}
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
            }}
          >
            <MetricCard
              icon={<AccountBalanceWalletRoundedIcon />}
              label="Cuenta"
              value={checkName}
              helper={
                checkId > 0
                  ? `Cuenta financiera #${checkId}`
                  : "Cuenta financiera no identificada"
              }
            />

            <MetricCard
              icon={<ReceiptLongRoundedIcon />}
              label="Venta vinculada"
              value={saleId > 0 ? `Venta #${saleId}` : "Venta no identificada"}
              helper={
                exactSaleLinked
                  ? "Venta exacta de esta cuenta"
                  : "Vínculo pendiente de validar"
              }
            />

            <MetricCard
              icon={<FormatListNumberedRoundedIcon />}
              label={
                orderRows.length === 1
                  ? "Orden relacionada"
                  : "Órdenes relacionadas"
              }
              value={ordersLabel}
              helper={
                orderRows.length > 0
                  ? `${orderRows.length} orden(es) identificada(s)`
                  : "Sin órdenes identificadas"
              }
            />

            <MetricCard
              icon={<TableRestaurantRoundedIcon />}
              label={
                tableRows.length === 1
                  ? "Mesa relacionada"
                  : "Mesas relacionadas"
              }
              value={tablesLabel}
              helper={
                tableRows.length > 0
                  ? `${tableRows.length} mesa(s) identificada(s)`
                  : "Cuenta sin mesa"
              }
            />
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={`Subtotal ${formatCurrency(exactSale?.subtotal)}`}
              size="small"
            />

            <Chip
              label={`Promociones ${formatCurrency(
                exactSale?.promotion_discount_total
              )}`}
              size="small"
            />

            <Chip
              label={`Descuento manual ${formatCurrency(
                exactSale?.manual_discount_total
              )}`}
              size="small"
            />

            <Chip
              label={`Propina ${formatCurrency(exactSale?.tip)}`}
              size="small"
            />

            <Chip
              label={`Total sincronizado ${formatCurrency(
                exactSale?.payable_total ??
                  exactSale?.total
              )}`}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: "#FFF3E0",
                color: "#A75A00",
              }}
            />
          </Stack>

          {availableForEditing ? (
            <Box
              sx={{
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                p: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.55,
                }}
              >
                La cuenta está abierta. Puedes revisar sus productos, aplicar
                descuentos o realizar ajustes antes de iniciar la vista previa
                del cobro.
              </Typography>
            </Box>
          ) : !readyForPayment ? (
            <Box
              sx={{
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                p: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.55,
                }}
              >
                Esta cuenta no está disponible para cobrar. Verifica que siga
                vinculada con la venta seleccionada y que la caja permanezca
                abierta.
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function MetricCard({ icon, label, value, helper }) {
  return (
    <Box
      sx={{
        minHeight: 116,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor: "#fff",
        p: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: "rgba(255, 152, 0, 0.10)",
            color: "primary.main",
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 800,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.25,
            wordBreak: "break-word",
          }}
        >
          {value || "—"}
        </Typography>

        <Typography
          sx={{
            mt: 0.75,
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.35,
            wordBreak: "break-word",
          }}
        >
          {helper || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

function resolveReadinessLabel({
  readyForPayment,
  availableForEditing,
  preparing,
  check,
  checkStatus,
  exactSaleLinked,
  validCashSession,
}) {
  if (preparing) return "Preparando cuenta para cobro";
  if (readyForPayment) return "Cuenta preparada para cobro";
  if (!check) return "Cuenta no localizada";
  if (!exactSaleLinked) return "Venta de la cuenta no validada";
  if (!validCashSession) return "Caja no disponible";
  if (availableForEditing) return "Cuenta abierta para revisión";
  if (checkStatus === "paying") return "Cuenta en proceso de cobro";
  if (checkStatus === "paid") return "Cuenta pagada";
  return "Cuenta no disponible para cobro";
}

function mergeEntityRows(...sources) {
  const rows = [];
  const map = new Map();

  sources.forEach((source) => {
    const entries = Array.isArray(source)
      ? source
      : source
      ? [source]
      : [];

    entries.forEach((entry) => {
      const normalized =
        entry && typeof entry === "object"
          ? entry
          : { id: entry };

      const id = positiveInt(
        normalized?.id ??
          normalized?.order_id ??
          normalized?.table_id
      );

      if (id <= 0) return;

      const previous = map.get(id) || {};
      map.set(id, {
        ...previous,
        ...normalized,
        id,
      });
    });
  });

  map.forEach((entry) => rows.push(entry));

  return rows;
}

function formatOrderRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "Sin órdenes";
  }

  return rows
    .map((row) => {
      const name = cleanText(row?.name);
      const code = cleanText(row?.code);
      const id = positiveInt(row?.id);

      if (name) return name;
      if (code) return code;
      return id > 0 ? `Orden #${id}` : null;
    })
    .filter(Boolean)
    .join(" · ");
}

function formatTableRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "Sin mesa";
  }

  return rows
    .map((row) => {
      const name = cleanText(row?.name);
      const code = cleanText(row?.code);
      const id = positiveInt(row?.id);

      if (name) return name;
      if (code) return code;
      return id > 0 ? `Mesa #${id}` : null;
    })
    .filter(Boolean)
    .join(" · ");
}

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function translateStatus(status, context = "general") {
  const key = normalizeStatus(status);

  const dictionary = {
    pending: "Pendiente",
    taken: "Tomada",
    open: "Abierta",
    locked: "Bloqueada",
    paying: "En cobro",
    paid: "Pagada",
    partially_paid: "Pago parcial",
    cancelled: "Cancelada",
    canceled: "Cancelada",
    merged: "Fusionada",
    closed: "Cerrada",
    occupied: "Ocupada",
    available: "Disponible",
    free: "Libre",
    active: "Activa",
    inactive: "Inactiva",
    ready: "Lista",
    queued: "En espera",
    in_progress: "En preparación",
    served: "Entregada",
    delivered: "Entregada",
    refunded: "Devuelta",
    partially_refunded: "Parcialmente devuelta",
  };

  if (dictionary[key]) return dictionary[key];

  if (context === "cash") return "No disponible";
  if (context === "billing") return "No identificado";
  if (context === "check") return "No identificado";

  return "—";
}

function cleanText(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function positiveInt(value) {
  const normalized = Number(value);

  return Number.isInteger(normalized) && normalized > 0
    ? normalized
    : 0;
}

function formatCurrency(value) {
  const normalized = Number(value);
  const safe = Number.isFinite(normalized) ? normalized : 0;

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