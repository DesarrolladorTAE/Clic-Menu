import React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import {
  landingColors,
  landingTypography,
} from "../../../theme/landingTheme";

const benefits = [
  {
    title: "Pedidos más rápidos",
    text: "Reduce tiempos de atención y mejora el flujo del restaurante.",
    image: "/images/home_sec1_1.png",
    alt: "Pedidos rápidos desde celular",
  },
  {
    title: "Control total",
    text: "Administra mesas, ventas y pedidos desde una sola plataforma.",
    image: "/images/home_sec1_2.png",
    alt: "Control total del restaurante",
  },
  {
    title: "Menos errores en cocina",
    text: "Las órdenes llegan claras y organizadas en tiempo real.",
    image: "/images/home_sec1_3.png",
    alt: "Órdenes claras en cocina",
  },
];

export default function HomeBenefitsSection() {
  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        py: {
          xs: 7,
          sm: 8,
          md: 10,
        },
        bgcolor: landingColors.white,
      }}
    >
      <Container>
        <Typography
          component="h2"
          sx={{
            ...landingTypography.landingTitleLG,
            maxWidth: 620,
            mx: "auto",
            mb: {
              xs: 5,
              md: 7,
            },
            textAlign: "center",
            color: landingColors.dark,
          }}
        >
          Mejora la operación de tu restaurante
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: {
              xs: 5.5,
              sm: 6,
              md: 6,
            },
            alignItems: "start",
          }}
        >
          {benefits.map((item) => (
            <Stack
              component="article"
              key={item.title}
              spacing={2}
              alignItems="center"
              sx={{
                textAlign: "center",
                width: "100%",
              }}
            >
              <Box
                component="img"
                src={item.image}
                alt={item.alt}
                loading="lazy"
                sx={{
                  display: "block",
                  width: {
                    xs: 190,
                    sm: 220,
                    md: 230,
                    lg: 250,
                  },
                  maxWidth: "100%",
                  height: "auto",
                  objectFit: "contain",
                  mb: {
                    xs: 0.5,
                    md: 1,
                  },
                }}
              />

              <Typography
                component="h3"
                sx={{
                  ...landingTypography.landingCardTitle,
                  color: landingColors.dark,
                  fontSize: {
                    xs: 21,
                    md: 22,
                  },
                }}
              >
                {item.title}
              </Typography>

              <Typography
                sx={{
                  ...landingTypography.landingText,
                  maxWidth: {
                    xs: 320,
                    md: 300,
                  },
                  mx: "auto",
                  color: landingColors.dark,
                  lineHeight: 1.42,
                  fontSize: {
                    xs: 15,
                    md: 16,
                  },
                }}
              >
                {item.text}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Container>
    </Box>
  );
}