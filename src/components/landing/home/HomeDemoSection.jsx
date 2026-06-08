// src/components/landing/home/HomeDemoSection.jsx
import React from "react";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";

import {
  landingButtonSx,
  landingColors,
  landingTypography,
} from "../../../theme/landingTheme";

export default function HomeDemoSection() {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: landingColors.bgSoft,
        pt: { xs: 3, sm: 3.5, md: 4 },
        pb: { xs: 7, sm: 8, md: 9 },
      }}
    >
      <Container>
        <Paper
          sx={{
            position: "relative",
            overflow: "hidden",
            p: { xs: 2.2, sm: 2.6, md: 3 },
            borderRadius: 1,
            border: `1px solid rgba(201, 90, 59, 0.18)`,
            bgcolor: landingColors.white,
            boxShadow: landingColors.shadowCard,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(255, 243, 236, 0.88) 0%, rgba(255,255,255,1) 52%, rgba(255, 240, 233, 0.78) 100%)",
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 5,
              bgcolor: landingColors.primary,
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "0.78fr 1.22fr",
              },
              gap: { xs: 2.4, md: 3.2 },
              alignItems: "center",
            }}
          >
            <Paper
              sx={{
                minHeight: { xs: 230, md: 245 },
                borderRadius: 1,
                border: `1px solid rgba(201, 90, 59, 0.16)`,
                bgcolor: "rgba(255,255,255,0.94)",
                boxShadow: landingColors.shadowSoft,
                display: "grid",
                placeItems: "center",
                p: { xs: 2, md: 2.4 },
              }}
            >
              <Stack spacing={1.2} alignItems="center" textAlign="center">
                <Box
                  sx={{
                    width: { xs: 155, sm: 170, md: 178 },
                    height: { xs: 155, sm: 170, md: 178 },
                    borderRadius: 1,
                    bgcolor: landingColors.white,
                    display: "grid",
                    placeItems: "center",
                    p: 1.2,
                    border: `1px solid rgba(201, 90, 59, 0.22)`,
                    boxShadow: "0 12px 26px rgba(201, 90, 59, 0.09)",
                  }}
                >
                  <Box
                    component="img"
                    src="/images/demo-qr.png"
                    alt="QR demo de Clic Menu"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>

                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: landingColors.title,
                  }}
                >
                  Escanea el menú demo
                </Typography>
              </Stack>
            </Paper>

            <Stack
              spacing={1.2}
              alignItems={{ xs: "center", md: "flex-start" }}
              textAlign={{ xs: "center", md: "left" }}
            >
              <Typography
                sx={{
                  ...landingTypography.landingEyebrow,
                  color: landingColors.primary,
                }}
              >
                Prueba gratuita
              </Typography>

              <Typography
                component="h2"
                sx={{
                  ...landingTypography.landingTitleLG,
                  color: landingColors.title,
                  maxWidth: 560,
                  fontSize: {
                    xs: "clamp(28px, 7vw, 38px)",
                    md: "clamp(32px, 3vw, 42px)",
                  },
                  lineHeight: 1.04,
                }}
              >
                Vive la experiencia durante 7 días
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={0.9}
                useFlexGap
                flexWrap="wrap"
                sx={{
                  pt: 0.2,
                  width: { xs: "100%", sm: "auto" },
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <FeaturePill icon={<PersonAddAlt1RoundedIcon />} text="Crea tu cuenta" />
                <FeaturePill icon={<RestaurantMenuRoundedIcon />} text="Carga tu menú" />
                <FeaturePill icon={<QrCode2RoundedIcon />} text="Prueba tu QR" />
              </Stack>

              <Button
                component="a"
                href="/auth/register"
                sx={{
                  ...landingButtonSx.primary,
                  width: { xs: "100%", sm: "fit-content" },
                  height: 44,
                  px: 3,
                  mt: 0.3,
                }}
                endIcon={<ArrowForwardRoundedIcon />}
              >
                Crear cuenta gratis
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

function FeaturePill({ icon, text }) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="center"
      sx={{
        px: 1.15,
        py: 0.75,
        borderRadius: 1,
        bgcolor: landingColors.orangePale,
        border: `1px solid rgba(201, 90, 59, 0.16)`,
        color: landingColors.primary,
      }}
    >
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          color: landingColors.primary,
          "& svg": {
            fontSize: 18,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 12.5,
          fontWeight: 900,
          color: landingColors.primary,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}