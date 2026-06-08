// src/components/landing/home/HomeSolutionsSection.jsx
//Card 1
import React from "react";
import { Box, Chip, Container, Paper, Stack, Typography } from "@mui/material";

import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";

import { landingColors, landingTypography } from "../../../theme/landingTheme";

const solutions = [
  {
    number: "01",
    title: "Menú Digital QR",
    text: "Tus comensales ordenan desde su celular. visualizan platillos, extras y variantes.",
    icon: <QrCode2RoundedIcon />,
    chips: ["QR", "Menú", "Precios"],
  },
  {
    number: "02",
    title: "Punto de Venta POS",
    text: "Administración ágil de cajas, mesas y emisión de tickets rápidos.",
    icon: <PointOfSaleRoundedIcon />,
    chips: ["Cajas", "Mesas", "Tickets"],
  },
  {
    number: "03",
    title: "Inventarios",
    text: "Lleva el control de tus insumos, reduce pérdidas y conoce el costo real de tus productos.",
    icon: <Inventory2RoundedIcon />,
    chips: ["Insumos", "Costos", "Control"],
  },
  {
    number: "04",
    title: "Reportes en Vivo",
    text: "Visualiza tus ventas y rendimiento del negocio desde cualquier lugar.",
    icon: <InsightsRoundedIcon />,
    chips: ["Ventas", "Reportes", "Control"],
  },
];

export default function HomeSolutionsSection() {
  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        bgcolor: landingColors.white,
        py: {
          xs: 7,
          sm: 8,
          md: 10,
        },
      }}
    >
      <Container>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "0.82fr 1.18fr",
            },
            gap: {
              xs: 4,
              md: 5,
              lg: 6,
            },
            alignItems: "center",
          }}
        >
          <Stack
            spacing={1.7}
            sx={{
              maxWidth: {
                xs: 820,
                lg: 430,
              },
              mx: {
                xs: "auto",
                lg: 0,
              },
              textAlign: {
                xs: "center",
                lg: "left",
              },
              alignItems: {
                xs: "center",
                lg: "flex-start",
              },
            }}
          >
            <Typography
              sx={{
                ...landingTypography.landingEyebrow,
                color: landingColors.primary,
              }}
            >
              Control para tu restaurante
            </Typography>

            <Typography
              component="h2"
              sx={{
                ...landingTypography.landingTitleLG,
                color: landingColors.title,
              }}
            >
              Soluciones clave diseñadas para vender más
            </Typography>

            <Typography
              sx={{
                ...landingTypography.landingTextLG,
                color: landingColors.muted,
                maxWidth: 560,
              }}
            >
              Menú QR, ventas, inventario y reportes en una sola plataforma.
            </Typography>

            <Box
              sx={{
                width: "100%",
                maxWidth: 360,
                mt: 1,
                p: 2,
                borderRadius: 1,
                bgcolor: landingColors.bgWarm,
                border: `1px solid rgba(201, 90, 59, 0.14)`,
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: landingColors.title,
                  lineHeight: 1.45,
                }}
              >
                Menos errores. Más rapidez. Más control.
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: {
                xs: 2,
                sm: 2.3,
                md: 2.6,
              },
              alignItems: "stretch",
              "&::before": {
                content: '""',
                display: {
                  xs: "none",
                  sm: "block",
                },
                position: "absolute",
                top: "50%",
                left: 28,
                right: 28,
                height: 2,
                bgcolor: "rgba(201, 90, 59, 0.16)",
                zIndex: 0,
              },
            }}
          >
            {solutions.map((item) => (
              <SolutionCard key={item.title} item={item} />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function SolutionCard({ item }) {
  return (
    <Paper
      component="article"
      sx={{
        height: "100%",
        minHeight: {
          xs: "auto",
          md: 282,
        },
        p: {
          xs: 2.4,
          sm: 2.6,
          md: 3,
        },
        borderRadius: 1,
        border: `1px solid ${landingColors.borderSoft}`,
        bgcolor: landingColors.white,
        boxShadow: landingColors.shadowCard,
        position: "relative",
        overflow: "hidden",
        zIndex: 1,
        transition:
          "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 4,
          bgcolor: landingColors.primary,
        },
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "rgba(201, 90, 59, 0.28)",
          boxShadow: landingColors.shadowMedium,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 4,
          right: 0,
          width: {
            xs: 78,
            md: 86,
          },
          height: {
            xs: 58,
            md: 64,
          },
          borderBottomLeftRadius: 999,
          bgcolor: landingColors.primarySoft,
          borderLeft: "1px solid rgba(201, 90, 59, 0.14)",
          borderBottom: "1px solid rgba(201, 90, 59, 0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: {
              xs: 24,
              md: 28,
            },
            fontWeight: 900,
            lineHeight: 1,
            color: landingColors.primary,
            letterSpacing: "-0.04em",
            opacity: 0.42,
            transform: "translate(5px, -2px)",
          }}
        >
          {item.number}
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ height: "100%", position: "relative", zIndex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: landingColors.primarySoft,
              color: landingColors.primary,
              border: "1px solid rgba(201, 90, 59, 0.16)",
              "& svg": {
                fontSize: 27,
              },
            }}
          >
            {item.icon}
          </Box>
        </Stack>

        <Stack spacing={1}>
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
            {item.title}
          </Typography>

          <Typography
            sx={{
              ...landingTypography.landingText,
              color: landingColors.muted,
              fontSize: 14.5,
              lineHeight: 1.58,
            }}
          >
            {item.text}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={0.8}
          useFlexGap
          flexWrap="wrap"
          sx={{
            mt: "auto",
            pt: 0.5,
          }}
        >
          {item.chips.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              size="small"
              sx={{
                height: 27,
                borderRadius: 1,
                bgcolor: landingColors.orangePale,
                color: landingColors.primary,
                border: "1px solid rgba(201, 90, 59, 0.14)",
                fontSize: 11.5,
                fontWeight: 900,
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}