// src/pages/landing/contact/LandingContactPage.jsx
import React from "react";
import {
  Box, Button, Container, Link, Paper, Stack, Typography,
} from "@mui/material";

import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import LandingMenu from "../../../components/landing/menu/LandingMenu";
import LandingFooter from "../../../components/landing/footer/LandingFooter";
import SEO from "../../../components/seo/SEO";

import {
  landingColors,
  landingTypography,
} from "../../../theme/landingTheme";

const contactItems = [
  {
    label: "Email",
    value: "contacto@tecnologiasadministrativas.com",
    href: "mailto:contacto@tecnologiasadministrativas.com",
    icon: <EmailRoundedIcon />,
  },
  {
    label: "Teléfono",
    value: "+52 (744) 218 8925",
    href: "tel:+527442188925",
    icon: <PhoneRoundedIcon />,
  },
  {
    label: "Dirección",
    value: "C.24 202, Las Cruces, 39770. Acapulco de Juárez, Gro.",
    href: null,
    icon: <PlaceRoundedIcon />,
  },
  {
    label: "Horario",
    value: "Lunes a sábado · 9:00 AM - 4:30 PM",
    href: null,
    icon: <ScheduleRoundedIcon />,
  },
];

export default function LandingContactPage() {
  return (
    <>
      <SEO
        title="Contacta Clic Menu | Digitaliza tu Restaurante"
        description="Habla con el equipo de Clic Menu y comienza a digitalizar la operación de tu restaurante con menú QR y herramientas administrativas."
        keywords="contactar software restaurante, asesoría sistema restaurante, digitalizar restaurante, implementar menú qr"
        url="https://clicmenu.com.mx/contacto"
      />

      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          bgcolor: landingColors.bg,
          overflowX: "hidden",
        }}
      >
        <LandingMenu />

        <Box
          component="section"
          sx={{
            position: "relative",
            overflow: "hidden",
            bgcolor: landingColors.bg,
            py: {
              xs: 6,
              sm: 8,
              md: 11,
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -140,
              right: -150,
              width: {
                xs: 280,
                md: 460,
              },
              height: {
                xs: 280,
                md: 460,
              },
              borderRadius: "50%",
              bgcolor: "rgba(246, 199, 122, 0.38)",
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              bottom: -160,
              left: -160,
              width: {
                xs: 280,
                md: 430,
              },
              height: {
                xs: 280,
                md: 430,
              },
              borderRadius: "50%",
              bgcolor: "rgba(207, 109, 78, 0.12)",
              pointerEvents: "none",
            }}
          />

          <Container
            sx={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <Stack
              spacing={2.5}
              sx={{
                maxWidth: 820,
                mb: {
                  xs: 5,
                  md: 7,
                },
              }}
            >
              <Box
                sx={{
                  width: "fit-content",
                  px: 2,
                  py: 0.8,
                  borderRadius: 999,
                  border: `1px solid rgba(207, 109, 78, 0.24)`,
                  bgcolor: "rgba(255, 241, 232, 0.78)",
                  color: landingColors.terracotta,
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                Hablemos de tu restaurante
              </Box>

              <Typography
                component="h1"
                sx={{
                  ...landingTypography.landingTitleXL,
                  maxWidth: 760,
                  color: landingColors.title,
                  fontSize: {
                    xs: 42,
                    sm: 54,
                    md: 72,
                  },
                  lineHeight: 0.98,
                }}
              >
                Estamos listos para ayudarte a digitalizar tu operación
              </Typography>

              <Typography
                sx={{
                  ...landingTypography.landingTextLG,
                  maxWidth: 720,
                  color: landingColors.text,
                }}
              >
                  Ya sea que estés evaluando Clic Menu, necesites información sobre
                  nuestros planes o quieras conocer cómo mejorar la administración de tu
                  restaurante, nuestro equipo estará encantado de orientarte.
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: {
                  xs: 2,
                  md: 2.5,
                },
              }}
            >
              {contactItems.map((item) => (
                <ContactCard key={item.label} item={item} />
              ))}
            </Box>

            <Paper
              sx={{
                mt: {
                  xs: 3,
                  md: 4,
                },
                p: {
                  xs: 3,
                  md: 4,
                },
                borderRadius: {
                  xs: `${landingColors.radiusMd}px`,
                  md: `${landingColors.radiusLg}px`,
                },
                border: `1px solid rgba(207, 109, 78, 0.18)`,
                bgcolor: landingColors.dark,
                color: landingColors.white,
                boxShadow: landingColors.shadow,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -80,
                  right: -80,
                  width: 220,
                  height: 220,
                  borderRadius: "50%",
                  bgcolor: "rgba(255, 116, 31, 0.18)",
                  pointerEvents: "none",
                }}
              />

              <Stack
                direction={{
                  xs: "column",
                  md: "row",
                }}
                spacing={3}
                alignItems={{
                  xs: "flex-start",
                  md: "center",
                }}
                justifyContent="space-between"
                sx={{
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box>
                  <Typography
                    component="h2"
                    sx={{
                      ...landingTypography.landingTitleMD,
                      color: landingColors.white,
                    }}
                  >
                    ¿Listo para conocer Clic Menu?
                  </Typography>

                  <Typography
                    sx={{
                      ...landingTypography.landingText,
                      mt: 1,
                      maxWidth: 620,
                      color: "rgba(255,255,255,0.72)",
                    }}
                  >
                    Conversemos sobre tu negocio. Podemos ayudarte a implementar
                    la solución más adecuada para tu restaurante.
                  </Typography>
                </Box>

                <Button
                  component="a"
                  href="https://api.whatsapp.com/send/?phone=527442188925&text&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<WhatsAppIcon />}
                  sx={{
                    minWidth: {
                      xs: "100%",
                      sm: 240,
                    },
                    height: 48,
                    borderRadius: 999,
                    bgcolor: landingColors.orangeLine,
                    color: landingColors.white,
                    fontWeight: 900,
                    textTransform: "none",
                    boxShadow: "0 14px 28px rgba(255, 116, 31, 0.28)",
                    "&:hover": {
                      bgcolor: landingColors.terracotta,
                      boxShadow: "0 18px 34px rgba(207, 109, 78, 0.34)",
                    },
                  }}
                >
                  Contactar por WhatsApp
                </Button>
              </Stack>
            </Paper>
          </Container>
        </Box>

        <LandingFooter />
      </Box>
    </>
  );
}

function ContactCard({ item }) {
  const content = (
    <Paper
      component="article"
      sx={{
        height: "100%",
        p: {
          xs: 2.5,
          sm: 3,
          md: 3.5,
        },
        borderRadius: {
          xs: `${landingColors.radiusMd}px`,
          md: `${landingColors.radiusLg}px`,
        },
        border: `1px solid ${landingColors.border}`,
        bgcolor: landingColors.white,
        boxShadow: landingColors.shadowSoft,
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: item.href ? "translateY(-4px)" : "none",
          boxShadow: item.href ? landingColors.shadow : landingColors.shadowSoft,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: 5,
          background: `linear-gradient(90deg, ${landingColors.orangeLine}, ${landingColors.yellow})`,
        }}
      />

      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: "#FFF1E8",
            color: landingColors.orangeLine,
            flexShrink: 0,
            "& svg": {
              fontSize: 24,
            },
          }}
        >
          {item.icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: landingColors.muted,
              mb: 0.8,
            }}
          >
            {item.label}
          </Typography>

          <Typography
            sx={{
              fontSize: {
                xs: 19,
                sm: 22,
              },
              fontWeight: 900,
              color: landingColors.dark,
              lineHeight: 1.25,
              wordBreak: "break-word",
            }}
          >
            {item.value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );

  if (!item.href) return content;

  return (
    <Link href={item.href} underline="none">
      {content}
    </Link>
  );
}