import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
} from "@mui/material";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";

export default function PlanCard({
  plan,
  isCurrent = false,
  isDisabled = false,
  busy = false,
  billingPeriod = "monthly",
  actionLabel = null,
  onSubscribe,
}) {
  const includedFeatures = Array.isArray(plan?.features?.included)
    ? plan.features.included
    : Array.isArray(plan?.includes)
    ? plan.includes
    : [];

  const excludedFeatures = Array.isArray(plan?.features?.excluded)
    ? plan.features.excluded
    : [];

  const isPurchasable = plan?.is_purchasable !== false;

  const billingMonths = plan?.billing_months || {};
  const billingLabels = plan?.billing_labels || {};

  const billingConfig = {
    monthly: {
      months: Number(billingMonths.monthly || 1),
      label: billingLabels.monthly
        ? `Plan ${String(billingLabels.monthly).toLowerCase()}`
        : "Plan mensual",
      suffix: "/ mes",
    },
    semester: {
      months: Number(billingMonths.semester || 6),
      label: billingLabels.semester
        ? `Plan ${String(billingLabels.semester).toLowerCase()}`
        : "Plan semestral",
      suffix: "/ semestre",
    },
    annual: {
      months: Number(billingMonths.annual || 12),
      label: billingLabels.annual
        ? `Plan ${String(billingLabels.annual).toLowerCase()}`
        : "Plan anual",
      suffix: "/ año",
    },
  };

  const selectedBilling = billingConfig[billingPeriod] || billingConfig.monthly;

  const finalPrice =
    plan?.billing_prices?.[billingPeriod] ?? Number(plan?.monthly_price || 0);

  const originalPrice =
    plan?.billing_original_prices?.[billingPeriod] ?? finalPrice;

  const discountData = plan?.billing_discounts?.[billingPeriod] || null;

  const discountAmount = Number(discountData?.discount_amount || 0);

  const hasReferralDiscount =
    plan?.referral_discount?.applies === true && discountAmount > 0;

  const discountPercent = Number(plan?.referral_discount?.percent || 5);

  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 1,
        border: "1px solid",
        borderColor: isCurrent ? "primary.main" : "divider",
        backgroundColor: isCurrent ? "primary.main" : "background.paper",
        color: isCurrent ? "#fff" : "text.primary",
        boxShadow: "none",
        minHeight: 100,
        height: "100%",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform:
            !isCurrent && !isDisabled && isPurchasable
              ? "translateY(-8px)"
              : "translateY(0)",
          boxShadow:
            !isCurrent && !isDisabled && isPurchasable
              ? "0 10px 24px rgba(0,0,0,0.10)"
              : "none",
          borderColor:
            !isCurrent && !isDisabled && isPurchasable
              ? "primary.main"
              : undefined,
        },
      }}
    >
      <Box
        sx={{
          height: 10,
          width: "100%",
          backgroundColor: isCurrent ? "#FFB547" : "primary.main",
          opacity: isCurrent ? 1 : 0.88,
        }}
      />

      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Stack spacing={2} sx={{ height: "100%" }}>
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
                    fontSize: 20,
                    fontWeight: 800,
                    color: isCurrent ? "#fff" : "text.primary",
                    lineHeight: 1.2,
                    wordBreak: "break-word",
                  }}
                >
                  {plan.name}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 12,
                    fontWeight: 800,
                    color: isCurrent
                      ? "rgba(255,255,255,0.85)"
                      : "text.secondary",
                  }}
                >
                  {plan.slug}
                </Typography>
              </Box>

              {isCurrent ? (
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 999,
                    backgroundColor: "#fff",
                    color: "primary.main",
                    fontSize: 12,
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  }}
                >
                  Plan actual
                </Box>
              ) : null}
            </Stack>

            {hasReferralDiscount ? (
              <Chip
                icon={<PercentRoundedIcon />}
                label={`${discountPercent}% referido aplicado`}
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: isCurrent ? "rgba(255,255,255,0.18)" : "#dcfce7",
                  color: isCurrent ? "#fff" : "#166534",
                  fontWeight: 900,
                  borderRadius: 999,
                  "& .MuiChip-icon": {
                    color: isCurrent ? "#fff" : "#166534",
                  },
                }}
              />
            ) : null}

            {hasReferralDiscount ? (
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: isCurrent
                    ? "rgba(255,255,255,0.72)"
                    : "text.secondary",
                  textDecoration: "line-through",
                }}
              >
                Antes: ${Number(originalPrice).toLocaleString("es-MX")}{" "}
                {plan.currency || "MXN"}
              </Typography>
            ) : null}

            <Typography
              sx={{
                fontSize: { xs: 42, sm: 52 },
                fontWeight: 900,
                lineHeight: 1,
                color: isCurrent ? "#fff" : "text.primary",
              }}
            >
              {plan.monthly_price === null
                ? "Desde"
                : `$${Number(finalPrice).toLocaleString("es-MX")}`}
              <Typography
                component="span"
                sx={{
                  ml: 0.5,
                  fontSize: 20,
                  fontWeight: 700,
                  color: isCurrent
                    ? "rgba(255,255,255,0.88)"
                    : "text.secondary",
                }}
              >
                {plan.currency || "MXN"}
              </Typography>
            </Typography>

            {hasReferralDiscount ? (
              <Typography
                sx={{
                  mt: -0.5,
                  fontSize: 13,
                  fontWeight: 900,
                  color: isCurrent ? "#fff" : "#166534",
                }}
              >
                Ahorras ${Number(discountAmount).toLocaleString("es-MX")} en
                este periodo.
              </Typography>
            ) : null}

            <Typography
              sx={{
                mt: -0.5,
                fontSize: 13,
                fontWeight: 800,
                color: isCurrent
                  ? "rgba(255,255,255,0.78)"
                  : "text.secondary",
              }}
            >
              {selectedBilling.label} {selectedBilling.suffix}
            </Typography>

            <Typography
              sx={{
                fontSize: 14,
                lineHeight: 1.55,
                color: isCurrent
                  ? "rgba(255,255,255,0.88)"
                  : "text.secondary",
                minHeight: 44,
              }}
            >
              {plan.description || "Sin descripción disponible para este plan."}
            </Typography>
          </Stack>

          <Button
            onClick={() => {
              if (!isPurchasable || isDisabled || busy) return;
              onSubscribe?.(plan.id, selectedBilling.months);
            }}
            disabled={isDisabled || busy || !isPurchasable}
            variant={isCurrent ? "contained" : "outlined"}
            sx={{
              height: 46,
              borderRadius: 999,
              fontWeight: 800,
              mt: 0.5,
              backgroundColor: isCurrent ? "#fff" : undefined,
              color: isCurrent ? "primary.main" : undefined,
              borderColor: isCurrent ? "#fff" : undefined,
              "&:hover": isCurrent
                ? {
                    backgroundColor: "#fff",
                    color: "primary.main",
                  }
                : undefined,
            }}
          >
            {!isPurchasable
              ? "No disponible"
              : busy
              ? "Contratando..."
              : actionLabel || (isCurrent ? "Plan actual" : "Contratar")}
          </Button>

          <Box
            sx={{
              pt: 1,
              mt: "auto",
              borderTop: "1px solid",
              borderColor: isCurrent ? "rgba(255,255,255,0.24)" : "divider",
            }}
          >
            <Stack spacing={2}>
              <FeatureSectionTitle text="Incluye" isCurrent={isCurrent} />

              <Stack spacing={1.2}>
                {includedFeatures.length > 0 ? (
                  includedFeatures.map((item, idx) => (
                    <FeatureRow
                      key={`${plan.id}-included-${idx}`}
                      text={item}
                      isCurrent={isCurrent}
                      variant="included"
                    />
                  ))
                ) : (
                  <FeatureRow
                    text="Sin beneficios listados"
                    isCurrent={isCurrent}
                    variant="included"
                  />
                )}
              </Stack>

              {excludedFeatures.length > 0 ? (
                <Box
                  sx={{
                    pt: 1.5,
                    borderTop: "1px solid",
                    borderColor: isCurrent
                      ? "rgba(255,255,255,0.18)"
                      : "divider",
                  }}
                >
                  <Stack spacing={1.2}>
                    <FeatureSectionTitle
                      text="No incluye"
                      isCurrent={isCurrent}
                    />

                    {excludedFeatures.map((item, idx) => (
                      <FeatureRow
                        key={`${plan.id}-excluded-${idx}`}
                        text={item}
                        isCurrent={isCurrent}
                        variant="excluded"
                      />
                    ))}
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function FeatureSectionTitle({ text, isCurrent }) {
  return (
    <Typography
      sx={{
        fontSize: 13,
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: isCurrent ? "rgba(255,255,255,0.78)" : "text.secondary",
      }}
    >
      {text}
    </Typography>
  );
}

function FeatureRow({ text, isCurrent, variant = "included" }) {
  const isExcluded = variant === "excluded";
  const Icon = isExcluded ? CancelRoundedIcon : CheckCircleRoundedIcon;

  return (
    <Stack direction="row" spacing={1.2} alignItems="flex-start">
      <Icon
        sx={{
          fontSize: 18,
          mt: "2px",
          color: isCurrent
            ? isExcluded
              ? "rgba(255,255,255,0.62)"
              : "#fff"
            : isExcluded
            ? "error.main"
            : "#2eae18",
          flexShrink: 0,
        }}
      />

      <Typography
        sx={{
          fontSize: 14,
          lineHeight: 1.5,
          color: isCurrent
            ? isExcluded
              ? "rgba(255,255,255,0.62)"
              : "rgba(255,255,255,0.92)"
            : isExcluded
            ? "text.secondary"
            : "text.primary",
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}