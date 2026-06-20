import React from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import {
  landingButtonSx,
  landingColors,
  landingTypography,
} from "../../../theme/landingTheme";

import LandingMenu from "../../../components/landing/menu/LandingMenu";
import HomeSolutionsSection from "../../../components/landing/home/HomeSolutionsSection";
import HomeDemoSection from "../../../components/landing/home/HomeDemoSection";
import HomeBusinessTypesSection from "../../../components/landing/home/HomeBusinessTypesSection";
import HomePlansPreviewSection from "../../../components/landing/home/HomePlansPreviewSection";
import HomeTestimonialsSection from "../../../components/landing/home/HomeTestimonialsSection";
import HomeThermalPrintingSection from "../../../components/landing/home/HomeThermalPrintingSection";

import HomeFaqSection from "../../../components/landing/home/HomeFaqSection";
import LandingFooter from "../../../components/landing/footer/LandingFooter";
import SEO from "../../../components/seo/SEO";

export default function HomePage() {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate("/auth/register");
  };

  const handleDemo = () => {
    navigate("/contacto");
  };

  return (
    <>
      <SEO
        title="Clic Menu | Menú QR y Punto de Venta para Restaurantes"
        description="Digitaliza tu restaurante con Clic Menu. Menú QR, punto de venta, pedidos, caja, inventarios y reportes en una sola plataforma."
        keywords="menú qr restaurante, punto de venta restaurante, software para restaurantes, sistema para restaurantes, pos restaurante, comandas digitales"
        url="https://clicmenu.com.mx"
      />

      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          bgcolor: landingColors.white,
          overflowX: "hidden",
        }}
      >
        <LandingMenu />

        <Box
          component="section"
          sx={{
            position: "relative",
            width: "100%",
            minHeight: {
              xs: "auto",
              md: "calc(100vh - 76px)",
            },
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            bgcolor: landingColors.orangeSoft,
            backgroundImage: "url('/images/restaurante-digital-clic-menu.webp')",
            backgroundSize: "cover",
            backgroundPosition: {
              xs: "center center",
              md: "center center",
            },
            backgroundRepeat: "no-repeat",
            py: {
              xs: 6,
              sm: 7,
              md: 8,
              lg: 8.5,
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.45) 48%, rgba(0,0,0,0.20) 100%)",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />

          <Container
            sx={{
              position: "relative",
              zIndex: 2,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(0, 1.08fr) minmax(0, 0.92fr)",
              },
              gap: {
                xs: 4,
                md: 4,
                lg: 5,
              },
              alignItems: "center",
            }}
          >
            <Stack
              spacing={{
                xs: 1.8,
                sm: 2,
                md: 2.2,
              }}
              sx={{
                maxWidth: {
                  xs: 680,
                  md: 640,
                  lg: 690,
                },
                textAlign: {
                  xs: "center",
                  md: "left",
                },
                alignItems: {
                  xs: "center",
                  md: "flex-start",
                },
              }}
            >
              <Box
                sx={{
                  width: "fit-content",
                  px: 1.6,
                  py: 0.75,
                  borderRadius: landingColors.radiusXs,
                  bgcolor: "rgba(255, 255, 255, 0.92)",
                  color: landingColors.primary,
                  border: "1px solid rgba(255, 255, 255, 0.55)",
                  fontSize: {
                    xs: 11,
                    sm: 12,
                  },
                  fontWeight: 900,
                  letterSpacing: "0.11em",
                  textTransform: "uppercase",
                }}
              >
                Lanzamiento oficial en México
              </Box>

              <Typography
                component="h1"
                sx={{
                  ...landingTypography.landingTitleXL,
                  maxWidth: {
                    xs: 610,
                    md: 650,
                    lg: 680,
                  },
                  color: landingColors.white,
                  fontSize: {
                    xs: "clamp(32px, 9vw, 44px)",
                    sm: "clamp(40px, 6vw, 52px)",
                    md: "clamp(42px, 4vw, 56px)",
                    lg: "clamp(46px, 3.7vw, 60px)",
                  },
                  lineHeight: {
                    xs: 1.05,
                    md: 1.04,
                  },
                  letterSpacing: "-0.045em",
                }}
              >
                El control total
                <Box component="br" />
                de tu restaurante
                <Box component="br" />
                en un solo Clic.
              </Typography>

              <Typography
                sx={{
                  ...landingTypography.landingTextLG,
                  maxWidth: {
                    xs: 570,
                    md: 620,
                  },
                  color: "rgba(255, 255, 255, 0.92)",
                  fontSize: {
                    xs: 15,
                    sm: 16,
                    md: 17,
                  },
                  lineHeight: 1.55,
                }}
              >
                Unifica tu Punto de Venta (POS), Menú Digital QR, comandas,
                inventarios y reportes en una plataforma diseñada para
                restaurantes modernos.
              </Typography>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1.4}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "auto",
                  },
                  pt: {
                    xs: 0.8,
                    md: 1,
                  },
                }}
              >
                <Button
                  type="button"
                  onClick={handleRegister}
                  variant="contained"
                  sx={{
                    ...landingButtonSx.primary,
                    width: {
                      xs: "100%",
                      sm: "auto",
                    },
                    minWidth: {
                      sm: 240,
                    },
                    height: {
                      xs: 44,
                      md: 46,
                    },
                    px: {
                      xs: 2,
                      sm: 3,
                    },
                    fontSize: 14,
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  }}
                >
                  Probar gratis por 7 días
                </Button>

                <Button
                  type="button"
                  onClick={handleDemo}
                  variant="contained"
                  sx={{
                    ...landingButtonSx.primaryInverse,
                    width: {
                      xs: "100%",
                      sm: "auto",
                    },
                    minWidth: {
                      sm: 165,
                    },
                    height: {
                      xs: 44,
                      md: 46,
                    },
                    fontSize: 14,
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  }}
                >
                  Agendar demo
                </Button>
              </Stack>
            </Stack>

            <Box
              sx={{
                position: "relative",
                display: {
                  xs: "none",
                  md: "flex",
                },
                alignItems: "center",
                justifyContent: "center",
                minHeight: {
                  md: 400,
                  lg: 480,
                },
                overflow: "visible",
              }}
            >
              <Box
                component="img"
                src="/images/sistema-pos-menu-qr-restaurante-clic-menu.png"
                alt="Sistema punto de venta y menú QR para restaurantes con Clic Menu"
                loading="eager"
                sx={{
                  display: "block",
                  width: {
                    md: "540px",
                    lg: "680px",
                    xl: "760px",
                  },
                  maxWidth: "none",
                  height: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 26px 42px rgba(0, 0, 0, 0.30))",
                  transform: {
                    md: "translateX(18px)",
                    lg: "translateX(38px)",
                  },
                }}
              />
            </Box>
          </Container>
        </Box>

        <HomeSolutionsSection />
        <HomeBusinessTypesSection />
        <HomeDemoSection />
        <HomeThermalPrintingSection />
        <HomePlansPreviewSection />


        <HomeFaqSection />
        <LandingFooter />
      </Box>
    </>
  );
}