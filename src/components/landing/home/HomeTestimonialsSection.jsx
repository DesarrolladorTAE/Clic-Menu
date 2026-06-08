// Card 6
import React from "react";
import { Avatar, Box, Container, Paper, Stack, Typography } from "@mui/material";

import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import LocalCafeRoundedIcon from "@mui/icons-material/LocalCafeRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

import { landingColors, landingTypography } from "../../../theme/landingTheme";

const testimonials = [
  {
    text: "Ahora los pedidos llegan más claros y el equipo trabaja con mayor orden durante el servicio.",
    author: "Restaurante local",
    icon: <RestaurantRoundedIcon />,
  },
  {
    text: "El menú digital nos ayudó a mostrar mejor nuestros productos y reducir tiempos de atención.",
    author: "Cafetería",
    icon: <LocalCafeRoundedIcon />,
  },
  {
    text: "Tenemos mejor control de ventas, caja y operación diaria desde una sola plataforma.",
    author: "Negocio gastronómico",
    icon: <StorefrontRoundedIcon />,
  },
];

export default function HomeTestimonialsSection() {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: landingColors.bgSoft,
        py: { xs: 7, sm: 8, md: 10 },
      }}
    >
      <Container>
        <Stack
          spacing={1.5}
          alignItems="center"
          textAlign="center"
          sx={{
            maxWidth: 780,
            mx: "auto",
            mb: { xs: 4, md: 5.5 },
          }}
        >
          <Typography sx={landingTypography.landingEyebrow}>
            Testimonios
          </Typography>

          <Typography component="h2" sx={landingTypography.landingTitleLG}>
            Lo que dicen nuestros clientes
          </Typography>

          <Typography
            sx={{
              ...landingTypography.landingTextLG,
              color: landingColors.muted,
              maxWidth: 680,
            }}
          >
            Restaurantes que están modernizando su operación con Clic Menu.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {testimonials.map((item) => (
            <Paper
              key={item.author}
              component="article"
              sx={{
                height: "100%",
                p: { xs: 2.4, sm: 2.8, md: 3 },
                borderRadius: landingColors.radiusSm,
                border: `1px solid ${landingColors.borderSoft}`,
                bgcolor: landingColors.white,
                boxShadow: landingColors.shadowCard,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: landingColors.radiusXs,
                      bgcolor: landingColors.primarySoft,
                      color: landingColors.primary,
                      border: "1px solid rgba(201, 90, 59, 0.16)",
                    }}
                  >
                    {item.icon}
                  </Avatar>

                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: landingColors.radiusXs,
                      display: "grid",
                      placeItems: "center",
                      color: landingColors.primary,
                      bgcolor: landingColors.orangePale,
                      ml: "auto",
                    }}
                  >
                    <FormatQuoteRoundedIcon sx={{ fontSize: 24 }} />
                  </Box>
                </Stack>

                <Typography
                  sx={{
                    ...landingTypography.landingText,
                    color: landingColors.text,
                    fontSize: 15,
                    lineHeight: 1.65,
                  }}
                >
                  “{item.text}”
                </Typography>

                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: landingColors.primary,
                    pt: 0.5,
                  }}
                >
                  {item.author}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}