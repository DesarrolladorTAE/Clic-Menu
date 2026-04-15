import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export default function PlanCard({
  plan,
  isCurrent = false,
  isDisabled = false,
  busy = false,
  onSubscribe,
}) {
  const includes = Array.isArray(plan?.includes) ? plan.includes : [];

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
              {plan.monthly_price === null ? "Desde" : `$${plan.monthly_price}`}
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
            onClick={() => onSubscribe(plan.id)}
            disabled={isDisabled}
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
            <Stack spacing={1.2}>
              <FeatureRow
                text={`Sucursales: ${
                  plan.max_branches === null ? "Ilimitadas" : plan.max_branches
                }`}
                isCurrent={isCurrent}
              />

              {includes.length > 0 ? (
                includes.map((item, idx) => (
                  <FeatureRow
                    key={`${plan.id}-${idx}`}
                    text={item}
                    isCurrent={isCurrent}
                  />
                ))
              ) : (
                <FeatureRow
                  text="Sin beneficios listados"
                  isCurrent={isCurrent}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function FeatureRow({ text, isCurrent }) {
  return (
    <Stack direction="row" spacing={1.2} alignItems="flex-start">
      <CheckCircleRoundedIcon
        sx={{
          fontSize: 18,
          mt: "2px",
          color: isCurrent ? "#fff" : "primary.main",
          flexShrink: 0,
        }}
      />

      <Typography
        sx={{
          fontSize: 14,
          lineHeight: 1.5,
          color: isCurrent ? "rgba(255,255,255,0.92)" : "text.primary",
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}