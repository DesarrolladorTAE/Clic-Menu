import React from "react";
import { Box, Chip, Container, Stack, Typography } from "@mui/material";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import {
  landingColors,
  landingTypography,
} from "../../../theme/landingTheme";

const faqs = [
  {
    question: "¿Clic Menu funciona para restaurantes pequeños?",
    answer:
      "Sí, Clic Menu se adapta tanto a negocios pequeños como a restaurantes con mayor operación.",
  },
  {
    question: "¿Necesito instalar equipos especiales?",
    answer:
      "No. Puedes utilizar Clic Menu desde computadora, tablet o celular.",
  },
  {
    question: "¿Puedo administrar mi menú fácilmente?",
    answer:
      "Sí, podrás agregar productos, categorías, precios e imágenes desde tu panel administrativo.",
  },
  {
    question: "¿El sistema incluye cocina y caja?",
    answer:
      "Sí, dependiendo del plan podrás gestionar cocina, pedidos, caja y flujo operativo.",
  },
];

export default function HomeFaqSection() {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        width: "100%",
        py: {
          xs: 7,
          sm: 8,
          md: 12,
        },
        bgcolor: landingColors.white,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: {
            xs: 24,
            md: 60,
          },
          right: {
            xs: -90,
            md: -120,
          },
          width: {
            xs: 220,
            md: 340,
          },
          height: {
            xs: 220,
            md: 340,
          },
          borderRadius: "50%",
          bgcolor: "rgba(246, 199, 122, 0.24)",
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: {
            xs: 40,
            md: 80,
          },
          left: {
            xs: -110,
            md: -150,
          },
          width: {
            xs: 240,
            md: 380,
          },
          height: {
            xs: 240,
            md: 380,
          },
          borderRadius: "50%",
          bgcolor: "rgba(207, 109, 78, 0.12)",
          zIndex: 0,
        }}
      />

      <Container>
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Stack
            spacing={2}
            alignItems="center"
            sx={{
              mb: {
                xs: 5,
                md: 6,
              },
              textAlign: "center",
            }}
          >
            <Chip
              icon={<HelpOutlineRoundedIcon />}
              label="Preguntas frecuentes"
              sx={{
                px: 1,
                bgcolor: "#FFF1E8",
                color: landingColors.terracotta,
                border: `1px solid rgba(207, 109, 78, 0.18)`,
                fontWeight: 900,
                "& .MuiChip-icon": {
                  color: landingColors.terracotta,
                },
              }}
            />

            <Typography
              component="h2"
              sx={{
                ...landingTypography.landingTitleLG,
                maxWidth: 720,
                color: landingColors.title,
              }}
            >
              Resolvemos tus dudas antes de empezar
            </Typography>

            <Typography
              sx={{
                ...landingTypography.landingText,
                maxWidth: 620,
                color: landingColors.muted,
              }}
            >
              Conoce lo básico de Clic Menu antes de comenzar a digitalizar la
              operación de tu restaurante.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 2.5,
              maxWidth: 920,
              mx: "auto",
            }}
          >
            {faqs.map((item, index) => (
              <Box
                key={item.question}
                component="article"
                sx={{
                  position: "relative",
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "52px 1fr",
                  },
                  gap: {
                    xs: 1.75,
                    sm: 2.25,
                  },
                  p: {
                    xs: "26px 24px",
                    md: "30px 34px",
                  },
                  border: `1px solid rgba(246, 199, 122, 0.9)`,
                  borderRadius: {
                    xs: 3,
                    md: `${landingColors.radiusLg}px`,
                  },
                  bgcolor: "rgba(255, 255, 255, 0.92)",
                  boxShadow: landingColors.shadowSoft,
                  transition: "all 0.25s ease",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 18,
                    bottom: 18,
                    width: 6,
                    borderRadius: "999px",
                    bgcolor: landingColors.orangeLine,
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    right: -34,
                    top: -34,
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    bgcolor: "rgba(246, 199, 122, 0.18)",
                  },
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: landingColors.shadow,
                    borderColor: landingColors.orangeSoft,
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    width: 46,
                    height: 46,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#FFF1E8",
                    color: landingColors.terracotta,
                    border: `1px solid rgba(207, 109, 78, 0.16)`,
                  }}
                >
                  <CheckCircleRoundedIcon fontSize="small" />
                </Box>

                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Typography
                    component="h3"
                    sx={{
                      ...landingTypography.landingCardTitle,
                      color: landingColors.title,
                    }}
                  >
                    {item.question}
                  </Typography>

                  <Typography
                    sx={{
                      ...landingTypography.landingText,
                      mt: 1.5,
                      color: landingColors.muted,
                    }}
                  >
                    {item.answer}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 2,
                      fontSize: 12,
                      fontWeight: 900,
                      color: landingColors.terracotta,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Pregunta {String(index + 1).padStart(2, "0")}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}