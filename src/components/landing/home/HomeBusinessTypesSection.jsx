// src/components/landing/home/HomeBusinessTypesSection.jsx
import React, { useEffect, useState } from "react";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";

import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import LocalCafeRoundedIcon from "@mui/icons-material/LocalCafeRounded";
import HotelRoundedIcon from "@mui/icons-material/HotelRounded";

import { landingColors, landingTypography } from "../../../theme/landingTheme";

const businessTypes = [
  {
    title: "Para restaurantes",
    text: "Mesas, pedidos, cocina y caja en orden.",
    icon: <RestaurantRoundedIcon />,
  },
  {
    title: "Para cafeterías",
    text: "Pedidos rápidos y atención más ágil.",
    icon: <LocalCafeRoundedIcon />,
  },
  {
    title: "Para hoteles",
    text: "Control para restaurante, cafetería o consumo interno.",
    icon: <HotelRoundedIcon />,
  },
];

export default function HomeBusinessTypesSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % businessTypes.length);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <Box
      component="section"
      sx={{
        bgcolor: landingColors.bgSoft,
        pt: { xs: 7, sm: 8, md: 10 },
        pb: { xs: 3, sm: 3.5, md: 4 },
      }}
    >
      <Container>
        <Stack
          spacing={1.4}
          alignItems="center"
          textAlign="center"
          sx={{
            maxWidth: 820,
            mx: "auto",
            mb: { xs: 3.5, md: 4 },
          }}
        >
          <Typography
            sx={{
              ...landingTypography.landingEyebrow,
              color: landingColors.primary,
            }}
          >
            Tipos de negocio
          </Typography>

          <Typography
            component="h2"
            sx={{
              ...landingTypography.landingTitleLG,
              color: landingColors.title,
            }}
          >
            Clic Menu se adapta a tu forma de atender
          </Typography>

          <Typography
            sx={{
              ...landingTypography.landingTextLG,
              color: landingColors.muted,
              maxWidth: 600,
            }}
          >
            Una solución práctica para negocios gastronómicos que quieren operar
            con más orden.
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
            alignItems: "stretch",
          }}
        >
          {businessTypes.map((item, index) => (
            <BusinessTypeCard
              key={item.title}
              item={item}
              active={index === activeIndex}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}

function BusinessTypeCard({ item, active }) {
  return (
    <Paper
      component="article"
      sx={{
        height: "100%",
        minHeight: { xs: 175, md: 185 },
        p: { xs: 2.2, sm: 2.4, md: 2.5 },
        borderRadius: 1,
        border: active
          ? "1px solid rgba(201, 90, 59, 0.16)"
          : "1px solid transparent",
        bgcolor: active ? landingColors.white : "transparent",
        boxShadow: active
          ? "0 22px 50px rgba(21, 25, 29, 0.10)"
          : "none",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        transform: active ? "translateY(-6px)" : "translateY(0)",
        transition:
          "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease, background 0.24s ease",

        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 4,
          bgcolor: active ? landingColors.primary : "transparent",
          transition: "background 0.24s ease",
        },
      }}
    >
      <Stack
        spacing={1.5}
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        sx={{
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          className="business-icon"
          sx={{
            width: 52,
            height: 52,
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
            bgcolor: active ? landingColors.primary : landingColors.primarySoft,
            color: active ? landingColors.white : landingColors.primary,
            border: active
              ? `1px solid ${landingColors.primary}`
              : "1px solid rgba(201, 90, 59, 0.16)",
            boxShadow: active
              ? "0 14px 28px rgba(201, 90, 59, 0.26)"
              : "none",
            transform: active ? "translateY(-2px)" : "translateY(0)",
            transition:
              "transform 0.24s ease, box-shadow 0.24s ease, background 0.24s ease, color 0.24s ease, border-color 0.24s ease",

            "& svg": {
              fontSize: 29,
            },
          }}
        >
          {item.icon}
        </Box>

        <Stack spacing={0.8}>
          <Typography
            component="h3"
            sx={{
              ...landingTypography.landingCardTitle,
              color: landingColors.title,
              fontSize: { xs: 20, md: 22 },
            }}
          >
            {item.title}
          </Typography>

          <Typography
            sx={{
              ...landingTypography.landingText,
              color: landingColors.muted,
              fontSize: 14.5,
              lineHeight: 1.5,
              maxWidth: 270,
            }}
          >
            {item.text}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}