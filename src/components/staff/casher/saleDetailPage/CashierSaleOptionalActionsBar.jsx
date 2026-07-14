import React from "react";
import {
  Box, Button, Chip, Paper, Stack, Typography,
} from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const ORANGE = "#FF9800";

export default function CashierSaleOptionalActionsBar({
  adjustmentSummary = null,
  customerSummary = null,
  discountSummary = null,
  disabled = false,
  onOpenAdjustments,
  onOpenCustomer,
  onOpenDiscounts,
}) {
  const adjustmentsCount = Array.isArray(adjustmentSummary?.adjustments)
    ? adjustmentSummary.adjustments.filter(
        (row) => String(row?.status || "") === "applied"
      ).length
    : 0;

  const customer = customerSummary?.customer || null;
  const contactData = customerSummary?.contact_data || null;

  const hasFormalCustomer = Boolean(customer?.customer_id || customer?.id);
  const hasSimpleContact = Boolean(contactData?.phone || contactData?.email);

  const manualDiscountTotal = Number(
    discountSummary?.sale?.manual_discount_total ??
      discountSummary?.manual_discount_total ??
      0
  );

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 18, sm: 20 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            Herramientas opcionales
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 14,
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            Usa estas opciones solo cuando necesites ajustar la venta antes de cobrar.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          <ActionButton
            icon={<TuneRoundedIcon />}
            title="Ajustes y cancelaciones"
            status={
              adjustmentsCount > 0
                ? `${adjustmentsCount} ajuste${adjustmentsCount === 1 ? "" : "s"}`
                : "Sin ajustes"
            }
            active={adjustmentsCount > 0}
            disabled={disabled}
            onClick={onOpenAdjustments}
          />

          <ActionButton
            icon={<PersonRoundedIcon />}
            title="Cliente"
            status={
              hasFormalCustomer
                ? "Cliente asociado"
                : hasSimpleContact
                ? "Contacto simple"
                : "Sin cliente"
            }
            active={hasFormalCustomer || hasSimpleContact}
            disabled={disabled}
            onClick={onOpenCustomer}
          />

          <ActionButton
            icon={<LocalOfferRoundedIcon />}
            title="Descuentos manuales"
            status={
              manualDiscountTotal > 0
                ? `${formatCurrency(manualDiscountTotal)} manual aplicado`
                : "Sin descuentos manuales"
            }
            active={manualDiscountTotal > 0}
            disabled={disabled}
            onClick={onOpenDiscounts}
          />
        </Box>
      </Stack>
    </Paper>
  );
}

function ActionButton({ icon, title, status, active = false, disabled = false, onClick }) {
  return (
    <Button
      type="button"
      variant="outlined"
      disabled={disabled}
      onClick={onClick}
      endIcon={<ArrowForwardRoundedIcon />}
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 78,
        px: 2,
        py: 1.5,
        borderRadius: 1,
        borderColor: active ? ORANGE : "divider",
        color: "text.primary",
        backgroundColor: active ? "rgba(255, 152, 0, 0.06)" : "#fff",
        textTransform: "none",
        boxShadow: "none",
        "&:hover": {
          borderColor: ORANGE,
          backgroundColor: "rgba(255, 152, 0, 0.08)",
        },
        "& .MuiButton-endIcon": {
          color: ORANGE,
        },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 1,
            bgcolor: "rgba(255, 152, 0, 0.12)",
            color: ORANGE,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0, textAlign: "left" }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.2,
              wordBreak: "break-word",
            }}
          >
            {title}
          </Typography>

          <Chip
            label={status}
            size="small"
            sx={{
              mt: 0.75,
              height: 24,
              maxWidth: "100%",
              fontSize: 12,
              fontWeight: 800,
              bgcolor: active ? "#FFF3E0" : "#F1F1F1",
              color: active ? "#A75A00" : "text.secondary",
              "& .MuiChip-label": {
                px: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        </Box>
      </Stack>
    </Button>
  );
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