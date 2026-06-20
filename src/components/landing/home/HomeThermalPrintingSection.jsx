// src/components/landing/home/HomeThermalPrintingSection.jsx
import React from "react";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";

import DesktopWindowsRoundedIcon from "@mui/icons-material/DesktopWindowsRounded";
import AndroidRoundedIcon from "@mui/icons-material/AndroidRounded";
import UsbRoundedIcon from "@mui/icons-material/UsbRounded";
import LanRoundedIcon from "@mui/icons-material/LanRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import {
  landingButtonSx,
  landingColors,
  landingTypography,
} from "../../../theme/landingTheme";

const downloadLinks = {
  windows: "#",
  android: "https://clicmenu.com.mx/downloads/clic-menu-printer.apk",
};

const printerImage = "/images/thermal-printer-clic-menu.png";

export default function HomeThermalPrintingSection() {
  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        bgcolor: landingColors.white,
        py: { xs: 7, sm: 8, md: 10 },
      }}
    >
      <Container>
        <Stack
          spacing={1.5}
          alignItems="center"
          textAlign="center"
          sx={{
            maxWidth: 860,
            mx: "auto",
            mb: { xs: 4, md: 5 },
          }}
        >
          <Typography
            sx={{
              ...landingTypography.landingEyebrow,
              color: landingColors.primary,
            }}
          >
            Integración de impresión térmica
          </Typography>

          <Typography
            component="h2"
            sx={{
              ...landingTypography.landingTitleLG,
              color: landingColors.title,
              maxWidth: 780,
            }}
          >
            Tu punto de venta también imprime tickets
          </Typography>

          <Typography
            sx={{
              ...landingTypography.landingTextLG,
              color: landingColors.muted,
              maxWidth: 650,
            }}
          >
            Usa Clic Menu con impresoras térmicas desde Windows o Android, por
            conexión USB o TCP/IP.
          </Typography>
        </Stack>

        <Paper
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 1,
            border: "1px solid rgba(201, 90, 59, 0.14)",
            bgcolor: "rgba(255, 248, 244, 0.92)",
            boxShadow: "0 26px 64px rgba(21, 25, 29, 0.07)",
            p: {
              xs: 2.2,
              sm: 2.8,
              md: 3.4,
              lg: 4,
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,248,244,0.92) 45%, rgba(255,243,236,0.86) 100%)",
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
            }}
          />

          <CornerLines position="topRight" />
          <CornerLines position="bottomLeft" />
          <DotPattern />

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "0.82fr 1.2fr 0.82fr",
              },
              gap: {
                xs: 2.2,
                md: 2.8,
                lg: 3.2,
              },
              alignItems: "center",
            }}
          >
            <SideBlock
              title="Compatible con"
              items={[
                {
                  icon: <DesktopWindowsRoundedIcon />,
                  title: "Windows",
                  text: "Para PC o caja principal",
                },
                {
                  icon: <AndroidRoundedIcon />,
                  title: "Android",
                  text: "Para tablets o celulares",
                },
              ]}
            />

            <Box
              sx={{
                position: "relative",
                minHeight: {
                  xs: 320,
                  sm: 370,
                  md: 410,
                },
                display: "grid",
                placeItems: "center",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: {
                    xs: 250,
                    sm: 315,
                    md: 365,
                  },
                  height: {
                    xs: 250,
                    sm: 315,
                    md: 365,
                  },
                  borderRadius: 1,
                  transform: "rotate(8deg)",
                  bgcolor: "rgba(201, 90, 59, 0.08)",
                  border: "1px solid rgba(201, 90, 59, 0.10)",
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  width: {
                    xs: 220,
                    sm: 280,
                    md: 330,
                  },
                  height: {
                    xs: 220,
                    sm: 280,
                    md: 330,
                  },
                  borderRadius: 1,
                  transform: "rotate(-7deg)",
                  bgcolor: "rgba(255,255,255,0.74)",
                  border: "1px solid rgba(201, 90, 59, 0.12)",
                  boxShadow: "0 20px 50px rgba(21, 25, 29, 0.05)",
                }}
              />

              <Box
                component="img"
                src={printerImage}
                alt="Impresora térmica para tickets de caja en Clic Menu"
                loading="lazy"
                sx={{
                  position: "relative",
                  zIndex: 1,
                  width: {
                    xs: 235,
                    sm: 295,
                    md: 350,
                  },
                  maxWidth: "100%",
                  height: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 24px 34px rgba(21, 25, 29, 0.18))",
                }}
              />
            </Box>

            <SideBlock
              title="Modos de conexión"
              items={[
                {
                  icon: <UsbRoundedIcon />,
                  title: "USB",
                  text: "Conexión directa",
                },
                {
                  icon: <LanRoundedIcon />,
                  title: "TCP/IP",
                  text: "Conexión por red",
                },
              ]}
            />
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="center"
            sx={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              mt: {
                xs: 2.4,
                md: 3,
              },
            }}
          >
            <Button
              component="a"
              href={downloadLinks.windows}
              sx={{
                ...landingButtonSx.primary,
                width: {
                  xs: "100%",
                  sm: "auto",
                },
                height: 44,
                px: 2.7,
              }}
              startIcon={<DesktopWindowsRoundedIcon />}
              endIcon={<DownloadRoundedIcon />}
            >
              Descargar Windows
            </Button>

            <Button
              component="a"
              href={downloadLinks.android}
              sx={{
                ...landingButtonSx.primaryInverse,
                width: {
                  xs: "100%",
                  sm: "auto",
                },
                height: 44,
                px: 2.7,
                border: `1px solid rgba(201, 90, 59, 0.22)`,
              }}
              startIcon={<AndroidRoundedIcon />}
              endIcon={<DownloadRoundedIcon />}
            >
              Descargar Android
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

function SideBlock({ title, items }) {
  return (
    <Stack
      spacing={1.6}
      alignItems="center"
      textAlign="center"
      sx={{
        width: "100%",
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 900,
          color: landingColors.primary,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          lineHeight: 1.25,
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "1fr",
          },
          gap: 1.2,
        }}
      >
        {items.map((item) => (
          <Paper
            key={item.title}
            sx={{
              p: {
                xs: 1.4,
                sm: 1.6,
              },
              borderRadius: 1,
              bgcolor: "rgba(255,255,255,0.94)",
              border: "1px solid rgba(201, 90, 59, 0.13)",
              boxShadow: "0 14px 34px rgba(21, 25, 29, 0.055)",
              minHeight: {
                xs: 118,
                md: 130,
              },
              display: "grid",
              placeItems: "center",
            }}
          >
            <Stack spacing={0.75} alignItems="center" textAlign="center">
              <Box
                sx={{
                  width: {
                    xs: 48,
                    md: 54,
                  },
                  height: {
                    xs: 48,
                    md: 54,
                  },
                  borderRadius: 1,
                  bgcolor: landingColors.primary,
                  color: landingColors.white,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 14px 26px rgba(201, 90, 59, 0.22)",
                  "& svg": {
                    fontSize: {
                      xs: 25,
                      md: 29,
                    },
                  },
                }}
              >
                {item.icon}
              </Box>

              <Typography
                sx={{
                  fontSize: {
                    xs: 14.5,
                    md: 16,
                  },
                  fontWeight: 900,
                  color: landingColors.title,
                  lineHeight: 1.15,
                }}
              >
                {item.title}
              </Typography>

              <Typography
                sx={{
                  fontSize: {
                    xs: 11.5,
                    md: 12.2,
                  },
                  fontWeight: 700,
                  color: landingColors.muted,
                  lineHeight: 1.25,
                }}
              >
                {item.text}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Box>
    </Stack>
  );
}

function CornerLines({ position }) {
  const isTopRight = position === "topRight";

  return (
    <Box
      sx={{
        position: "absolute",
        width: {
          xs: 96,
          sm: 130,
          md: 170,
        },
        height: {
          xs: 96,
          sm: 130,
          md: 170,
        },
        top: isTopRight ? 0 : "auto",
        right: isTopRight ? 0 : "auto",
        bottom: isTopRight ? "auto" : 0,
        left: isTopRight ? "auto" : 0,
        opacity: 0.34,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: -18,
          background:
            "repeating-linear-gradient(135deg, rgba(201, 90, 59, 0.28) 0 2px, transparent 2px 14px)",
          transform: isTopRight ? "translate(36px, -36px)" : "translate(-36px, 36px)",
        }}
      />
    </Box>
  );
}

function DotPattern() {
  return (
    <Box
      sx={{
        position: "absolute",
        right: {
          xs: 18,
          md: 46,
        },
        bottom: {
          xs: 18,
          md: 40,
        },
        width: 108,
        height: 76,
        opacity: 0.28,
        pointerEvents: "none",
        backgroundImage:
          "radial-gradient(rgba(201, 90, 59, 0.55) 1.5px, transparent 1.5px)",
        backgroundSize: "14px 14px",
        display: {
          xs: "none",
          sm: "block",
        },
      }}
    />
  );
}