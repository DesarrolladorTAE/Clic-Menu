import React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
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
        width: "100%",
        py: {
          xs: 7,
          sm: 8,
          md: 12,
        },
        bgcolor: landingColors.white,
      }}
    >
      <Container>
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
          <Typography
            sx={{
              ...landingTypography.landingEyebrow,
            }}
          >
            Preguntas frecuentes
          </Typography>

          <Typography
            component="h2"
            sx={{
              ...landingTypography.landingTitleLG,
              maxWidth: 720,
            }}
          >
            Resolvemos tus dudas antes de empezar
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
          {faqs.map((item) => (
            <Box
              key={item.question}
              component="article"
              sx={{
                position: "relative",

                p: {
                  xs: "26px 24px",
                  md: "30px 34px",
                },

                pl: {
                  xs: "32px",
                  md: "42px",
                },

                border: `1px solid ${landingColors.border}`,

                borderRadius: {
                  xs: 3,
                  md: `${landingColors.radiusLg}px`,
                },

                bgcolor: landingColors.white,

                boxShadow: landingColors.shadowSoft,

                transition: "all 0.25s ease",

                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 20,
                  bottom: 20,
                  width: 6,
                  borderRadius: "999px",
                  bgcolor: landingColors.terracotta,
                },

                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: landingColors.shadow,
                },
              }}
            >
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
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}