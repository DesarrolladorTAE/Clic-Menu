// src/components/landing/home/HomeFaqSection.jsx
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
    question: "¿Necesito comprar equipo especial?",
    answer:
      "No necesariamente. Puedes usar Clic Menu desde computadora, tablet o celular. Si tu operación requiere impresión, puedes conectarlo con impresoras compatibles.",
  },
  {
    question: "¿Clic Menu funciona para restaurantes pequeños?",
    answer:
      "Sí. Puedes iniciar con funciones básicas y crecer conforme tu restaurante necesite más control.",
  },
  {
    question: "¿Puedo probar antes de pagar?",
    answer:
      "Sí. Puedes iniciar una prueba gratuita para conocer el sistema y validar si se adapta a tu operación.",
  },
  {
    question: "¿El sistema incluye menú QR y punto de venta?",
    answer:
      "Sí. Clic Menu integra menú digital QR, gestión de pedidos, caja, mesas y módulos operativos según el plan contratado.",
  },
  {
    question: "¿Puedo administrar mi menú fácilmente?",
    answer:
      "Sí, podrás agregar productos, categorías, precios e imágenes desde tu panel administrativo.",
  },
  {
    question: "¿Qué pasa si necesito ayuda?",
    answer:
      "Puedes contactar al equipo de soporte para recibir orientación sobre configuración, uso del sistema y selección del plan adecuado.",
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
          md: 10,
        },
        bgcolor: landingColors.white,
        overflow: "hidden",
      }}
    >
      <Container>
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Stack
            spacing={1.5}
            alignItems="center"
            sx={{
              mb: {
                xs: 4,
                md: 5,
              },
              textAlign: "center",
            }}
          >
            <Chip
              icon={<HelpOutlineRoundedIcon />}
              label="Preguntas frecuentes"
              sx={{
                px: 1,
                bgcolor: landingColors.white,
                color: landingColors.terracotta,
                border: `1px solid rgba(207, 109, 78, 0.18)`,
                fontWeight: 900,
                boxShadow: "0 10px 26px rgba(21, 25, 29, 0.05)",
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
              gap: 2,
              maxWidth: 940,
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
                    xs: "24px 22px",
                    md: "28px 32px",
                  },
                  border: `1px solid rgba(201, 90, 59, 0.16)`,
                  borderRadius: 1,
                  bgcolor: "rgba(255, 255, 255, 0.92)",
                  boxShadow: landingColors.shadowSoft,
                  transition:
                    "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 18,
                    bottom: 18,
                    width: 5,
                    borderRadius: "999px",
                    bgcolor: landingColors.orangeLine,
                  },
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: landingColors.shadowMedium,
                    borderColor: "rgba(201, 90, 59, 0.30)",
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    width: 46,
                    height: 46,
                    borderRadius: 1,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: landingColors.orangePale,
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
                      fontSize: {
                        xs: 20,
                        md: 22,
                      },
                    }}
                  >
                    {item.question}
                  </Typography>

                  <Typography
                    sx={{
                      ...landingTypography.landingText,
                      mt: 1.25,
                      color: landingColors.muted,
                      fontSize: {
                        xs: 14.5,
                        md: 15,
                      },
                    }}
                  >
                    {item.answer}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1.8,
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