import React from "react";
import {
  Box, Button, Card, CardContent, Chip, Stack, Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

import {
  financialStatusColor,
  financialStatusLabel,
  formatCurrency,
  fulfillmentLabel,
  onlineOrderStatusColor,
  onlineOrderStatusLabel,
  paymentTypeLabel,
} from "../onlineOrderDisplay";

export default function CashierOnlineOrderPaymentHeroCard({
  order,
  sale,
  check,
  cashSession,
  paymentMethodsCount = 0,
  onBack,
}) {
  const publicNumber = cleanText(order?.public_number);
  const customerName = cleanText(order?.order_name) || "Cliente sin nombre";
  const customerPhone = cleanText(order?.customer_phone) || "Teléfono no disponible";

  const checkStatus = String(
    check?.status ??
      order?.order_check_status ??
      ""
  ).toLowerCase();

  const deliveryFee = Number(
    sale?.delivery_fee ??
      order?.delivery_fee ??
      0
  );

  const total = Number(
    sale?.payable_total ??
      sale?.total ??
      order?.total ??
      0
  );

  const cashSessionAvailable =
    Number(cashSession?.id || 0) > 0 &&
    ["open", "active"].includes(String(cashSession?.status || "").toLowerCase());

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        overflow: "hidden",
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={(theme) => ({
          height: 5,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        })}
      />

      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
              <Box
                sx={(theme) => ({
                  width: { xs: 46, sm: 52 },
                  height: { xs: 46, sm: 52 },
                  borderRadius: 1,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  color: "primary.main",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                })}
              >
                <PaymentsRoundedIcon />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 27, sm: 32, md: 38 },
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.08,
                    wordBreak: "break-word",
                  }}
                >
                  Registrar cobro
                </Typography>

                <Typography
                  sx={{
                    mt: 0.7,
                    fontSize: { xs: 14, sm: 15 },
                    color: "text.secondary",
                    lineHeight: 1.55,
                  }}
                >
                  {publicNumber ? `Pedido ${publicNumber}` : "Pedido en línea"}
                  {" · "}
                  Revisa la cuenta antes de registrar el pago.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              color="inherit"
              onClick={onBack}
              startIcon={<ArrowBackRoundedIcon />}
              sx={{
                width: { xs: "100%", md: "auto" },
                minWidth: { md: 210 },
                minHeight: 44,
                fontWeight: 800,
              }}
            >
              Volver a Mis pedidos
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={`Pedido: ${onlineOrderStatusLabel(order?.status)}`}
              size="small"
              color={onlineOrderStatusColor(order?.status)}
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />

            <Chip
              label={`Cobro: ${financialStatusLabel(order?.financial_status)}`}
              size="small"
              color={financialStatusColor(order?.financial_status)}
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />

            <Chip
              label={`Cuenta: ${checkStatusLabel(checkStatus)}`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />

            {order?.kitchen_flow ? (
              <Chip
                label={`Preparación: ${kitchenFlowLabel(order.kitchen_flow)}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />
            ) : null}

            {cashSessionAvailable ? (
              <Chip
                label="Caja disponible"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />
            ) : null}
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              alignItems: "stretch",
            }}
          >
            <MetricCard
              icon={<PersonRoundedIcon />}
              label="Cliente"
              value={customerName}
              helper={customerPhone}
            />

            <MetricCard
              icon={<LocalShippingRoundedIcon />}
              label="Entrega"
              value={fulfillmentLabel(order?.fulfillment_type)}
              helper={
                deliveryFee > 0
                  ? `Costo de entrega ${formatCurrency(deliveryFee)}`
                  : "Sin costo de entrega"
              }
            />

            <MetricCard
              icon={<PaymentsRoundedIcon />}
              label="Pago solicitado"
              value={paymentTypeLabel(order?.payment_type)}
              helper={
                paymentMethodsCount > 0
                  ? `${paymentMethodsCount} forma${paymentMethodsCount === 1 ? "" : "s"} de pago disponible${paymentMethodsCount === 1 ? "" : "s"}`
                  : "Sin formas de pago disponibles"
              }
            />

            <MetricCard
              icon={<ReceiptLongRoundedIcon />}
              label="Total del pedido"
              value={formatCurrency(total)}
              helper="Importe actual de la cuenta"
              emphasized
            />
          </Box>

          <Box
            sx={(theme) => ({
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              px: { xs: 1.5, sm: 2 },
              py: 1.5,
              backgroundColor: alpha(theme.palette.primary.main, 0.045),
            })}
          >
            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.55,
              }}
            >
              Revisa los productos, importes e impuestos de esta cuenta. Los cambios permitidos se reflejarán automáticamente sin necesidad de recargar la página.
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  icon,
  label,
  value,
  helper,
  emphasized = false,
}) {
  return (
    <Box
      sx={(theme) => ({
        minHeight: 132,
        height: "100%",
        border: "1px solid",
        borderColor: emphasized ? alpha(theme.palette.primary.main, 0.45) : "divider",
        borderRadius: 1,
        backgroundColor: emphasized ? alpha(theme.palette.primary.main, 0.045) : "background.paper",
        p: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      })}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={(theme) => ({
            width: 40,
            height: 40,
            borderRadius: 1,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            color: "primary.main",
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          })}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 800,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 0.35,
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Box sx={{ mt: 2, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: { xs: 17, sm: 18 },
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
            mt: 0.6,
            fontSize: 12.5,
            color: "text.secondary",
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {helper || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

function checkStatusLabel(status) {
  const labels = {
    open: "Abierta",
    paying: "En cobro",
    paid: "Pagada",
    cancelled: "Cancelada",
    canceled: "Cancelada",
  };

  return labels[String(status || "").toLowerCase()] || "No disponible";
}

function kitchenFlowLabel(value) {
  const labels = {
    with_kitchen: "Con cocina",
    without_kitchen: "Sin cocina",
  };

  return labels[String(value || "").toLowerCase()] || "Configurada";
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}