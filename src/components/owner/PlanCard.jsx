import {
  Box, Button, Card, CardContent, Stack, Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

export default function PlanCard({
  plan,
  isCurrent = false,
  isDisabled = false,
  busy = false,
  billingPeriod = "monthly",
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

  const billingConfig = {
      monthly: {
        months: 1,
        label: "Plan mensual",
        suffix: "/ mes",
      },
      semester: {
        months: 6,
        label: "Plan semestral",
        suffix: "/ semestre",
      },
      annual: {
        months: 12,
        label: "Plan anual",
        suffix: "/ año",
      },
  };

  const selectedBilling = billingConfig[billingPeriod] || billingConfig.monthly;

  const displayPrice =
    plan?.billing_prices?.[billingPeriod] ??
    Number(plan?.monthly_price || 0);


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
        transform: isCurrent ? "translateY(0)" : "translateY(0)",
        "&:hover": {
          transform:
            !isCurrent && !isDisabled ? "translateY(-8px)" : "translateY(0)",
          boxShadow:
            !isCurrent && !isDisabled
              ? "0 10px 24px rgba(0,0,0,0.10)"
              : "none",
          borderColor:
            !isCurrent && !isDisabled ? "primary.main" : undefined,
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
                    color: isCurrent ? "rgba(255,255,255,0.85)" : "text.secondary",
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
                : `$${Number(displayPrice).toLocaleString("es-MX")}`}
              <Typography
                component="span"
                sx={{
                  ml: 0.5,
                  fontSize: 20,
                  fontWeight: 700,
                  color: isCurrent ? "rgba(255,255,255,0.88)" : "text.secondary",
                }}
              >
                {plan.currency || "MXN"}
              </Typography>
            </Typography>

            <Typography
              sx={{
                mt: -0.5,
                fontSize: 13,
                fontWeight: 800,
                color: isCurrent ? "rgba(255,255,255,0.78)" : "text.secondary",
              }}
            >
              {selectedBilling.label} {selectedBilling.suffix}
            </Typography>

            <Typography
              sx={{
                fontSize: 14,
                lineHeight: 1.55,
                color: isCurrent ? "rgba(255,255,255,0.88)" : "text.secondary",
                minHeight: 44,
              }}
            >
              {plan.description || "Sin descripción disponible para este plan."}
            </Typography>
          </Stack>

          <Button
            onClick={() => onSubscribe(plan.id, selectedBilling.months)}
            disabled={isDisabled || busy}
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
            {isCurrent
              ? "Plan actual"
              : busy
              ? "Contratando..."
              : "Contratar"}
          </Button>

          <Box
            sx={{
              pt: 1,
              mt: "auto",
              borderTop: "1px solid",
              borderColor: isCurrent
                ? "rgba(255,255,255,0.24)"
                : "divider",
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
                    <FeatureSectionTitle text="No incluye" isCurrent={isCurrent} />

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