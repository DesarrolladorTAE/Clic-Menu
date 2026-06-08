// src/components/landing/home/HomePlansPreviewSection.jsx
import React from "react";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import {
  landingButtonSx,
  landingColors,
  landingTypography,
} from "../../../theme/landingTheme";

const plans = [
  {
    name: "Digital",
    text: "Para restaurantes que quieren iniciar con menú digital, ventas y operación básica.",
    features: ["Menú digital QR", "Ventas básicas", "Tickets", "Operación inicial"],
  },
  {
    name: "Gestión",
    badge: "Recomendado",
    highlighted: true,
    text: "Para negocios que necesitan inventarios, control operativo y mayor administración.",
    features: ["Inventarios", "Mesas y pedidos", "Cajas", "Reportes"],
  },
  {
    name: "Total",
    text: "Para restaurantes con operación avanzada, múltiples configuraciones y mayor control.",
    features: ["Control avanzado", "Sucursales", "Configuraciones", "Mayor administración"],
  },
];

export default function HomePlansPreviewSection() {
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      sx={{
        bgcolor: landingColors.white,
        py: { xs: 7, sm: 8, md: 10 },
      }}
    >
      <Container>
        <Stack
          spacing={1.5}
          alignItems="center"
          textAlign="center"
          sx={{ maxWidth: 820, mx: "auto", mb: { xs: 4, md: 5.5 } }}
        >
          <Typography
            sx={{
              ...landingTypography.landingEyebrow,
              color: landingColors.primary,
            }}
          >
            Planes Clic Menu
          </Typography>

          <Typography
            component="h2"
            sx={{
              ...landingTypography.landingTitleLG,
              color: landingColors.title,
            }}
          >
            Planes simples que crecen con tu restaurante
          </Typography>

          <Typography
            sx={{
              ...landingTypography.landingTextLG,
              color: landingColors.muted,
              maxWidth: 740,
            }}
          >
            Elige el plan que mejor se adapte a tu operación
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 2.2, md: 2.6 },
            alignItems: "stretch",
          }}
        >
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </Box>

        <Stack alignItems="center" sx={{ mt: { xs: 4, md: 5 } }}>
          <Button
            type="button"
            onClick={() => navigate("/planes")}
            sx={{
              ...landingButtonSx.primary,
              height: 46,
              px: 3.2,
            }}
            endIcon={<ArrowForwardRoundedIcon />}
          >
            Ver todos los planes
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

function PlanCard({ plan }) {
  const isHighlighted = plan.highlighted;

  return (
    <Paper
      component="article"
      sx={{
        height: "100%",
        minHeight: { xs: "auto", md: isHighlighted ? 390 : 360 },
        p: { xs: 2.5, sm: 2.8, md: 3 },
        mt: { xs: 0, md: isHighlighted ? -2 : 1.5 },
        mb: { xs: 0, md: isHighlighted ? -1 : 1.5 },
        borderRadius: 1,
        border: isHighlighted
          ? `1.5px solid ${landingColors.primary}`
          : `1px solid ${landingColors.borderSoft}`,
        bgcolor: landingColors.white,
        color: landingColors.text,
        boxShadow: isHighlighted
          ? "0 28px 65px rgba(201, 90, 59, 0.24)"
          : "0 16px 42px rgba(21, 25, 29, 0.07)",
        position: "relative",
        overflow: "hidden",
        transition:
          "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: isHighlighted ? 7 : 4,
          bgcolor: isHighlighted ? landingColors.primary : "rgba(201, 90, 59, 0.34)",
        },
        "&:hover": {
          transform: isHighlighted ? "translateY(-8px)" : "translateY(-5px)",
          borderColor: "rgba(201, 90, 59, 0.30)",
          boxShadow: isHighlighted
            ? "0 34px 75px rgba(201, 90, 59, 0.30)"
            : landingColors.shadowMedium,
        },
      }}
    >
      <Stack
        spacing={2.2}
        alignItems="center"
        textAlign="center"
        sx={{
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            minHeight: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {plan.badge ? (
            <Box
              sx={{
                px: 1.5,
                py: 0.65,
                borderRadius: 1,
                bgcolor: landingColors.primary,
                color: landingColors.white,
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                boxShadow: "0 12px 24px rgba(201, 90, 59, 0.24)",
              }}
            >
              {plan.badge}
            </Box>
          ) : (
            <Box
              sx={{
                width: 46,
                height: 4,
                borderRadius: 999,
                bgcolor: "rgba(201, 90, 59, 0.18)",
              }}
            />
          )}
        </Box>

        <Stack spacing={1.1} alignItems="center">
          <Typography
            component="h3"
            sx={{
              ...landingTypography.landingCardTitle,
              color: landingColors.title,
              fontSize: { xs: 25, md: 28 },
              textAlign: "center",
            }}
          >
            {plan.name}
          </Typography>

          <Typography
            sx={{
              ...landingTypography.landingText,
              color: landingColors.muted,
              fontSize: 14.5,
              lineHeight: 1.55,
              maxWidth: 300,
              textAlign: "center",
            }}
          >
            {plan.text}
          </Typography>
        </Stack>

        <Stack
          spacing={1}
          sx={{
            width: "100%",
            maxWidth: 260,
            mt: "auto",
          }}
        >
          {plan.features.map((feature) => (
            <Stack
              key={feature}
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                px: 1,
                py: 0.45,
                borderRadius: 1,
                bgcolor: isHighlighted
                  ? landingColors.orangePale
                  : "rgba(255, 243, 236, 0.64)",
                border: "1px solid rgba(201, 90, 59, 0.08)",
              }}
            >
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: 1,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: isHighlighted ? landingColors.primary : landingColors.primarySoft,
                  color: isHighlighted ? landingColors.white : landingColors.primary,
                  flexShrink: 0,
                }}
              >
                <CheckRoundedIcon sx={{ fontSize: 16 }} />
              </Box>

              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: landingColors.text,
                  textAlign: "left",
                }}
              >
                {feature}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}