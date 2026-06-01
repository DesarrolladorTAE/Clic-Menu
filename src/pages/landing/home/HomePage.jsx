import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { landingColors, landingTypography } from "../../../theme/landingTheme";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { useNavigate } from "react-router-dom";

import LandingMenu from "../../../components/landing/menu/LandingMenu";
import HomeBenefitsSection from "../../../components/landing/home/HomeBenefitsSection";
import HomeFeaturesSection from "../../../components/landing/home/HomeFeaturesSection";
import HomeFaqSection from "../../../components/landing/home/HomeFaqSection";
import LandingFooter from "../../../components/landing/footer/LandingFooter";

export default function HomePage() {
  const navigate = useNavigate();
  const nextSectionRef = useRef(null);
  const [scrollLocked, setScrollLocked] = useState(true);

  const handleRegister = () => {
    navigate("/auth/register");
  };

  const handleUnlockScroll = () => {
    setScrollLocked(false);

    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    setTimeout(() => {
      nextSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  useEffect(() => {
    if (scrollLocked) {
      window.history.scrollRestoration = "manual";

      window.requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    }

    document.body.style.overflow = scrollLocked ? "hidden" : "auto";
    document.documentElement.style.overflow = scrollLocked ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
      window.history.scrollRestoration = "auto";
    };
  }, [scrollLocked]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: landingColors.white,
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          height: "100svh",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <LandingMenu />

        <Box
          component="section"
          sx={{
            position: "relative",
            width: "100%",
            flex: 1,
            minHeight: 0,
            display: "flex",
            alignItems: "stretch",
            bgcolor: landingColors.orangeSoft,
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              minHeight: 0,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "48% 52%",
                lg: "44% 56%",
              },
              gridTemplateRows: {
                xs: "auto minmax(0, 1fr)",
                md: "1fr",
              },
              alignItems: {
                xs: "start",
                md: "center",
              },
              boxSizing: "border-box",
              pt: {
                xs: 2.5,
                sm: 3,
                md: 0,
              },
              pb: {
                xs: 3.5,
                sm: 4,
                md: 3,
              },
            }}
          >
            <Stack
              spacing={{ xs: 1.6, sm: 2, md: 3 }}
              sx={{
                position: "relative",
                zIndex: 3,
                width: "100%",
                maxWidth: {
                  xs: "100%",
                  md: 560,
                },
                px: {
                  xs: 2,
                  sm: 4,
                  md: 0,
                },
                ml: {
                  xs: 0,
                  md: "clamp(40px, 5vw, 80px)",
                  lg: "clamp(80px, 9vw, 170px)",
                },
              }}
            >
              <Typography
                component="h1"
                sx={{
                  ...landingTypography.landingTitleXL,
                  maxWidth: {
                    xs: 520,
                    md: 540,
                  },
                  fontSize: {
                    xs: "clamp(26px, 8vw, 34px)",
                    sm: 42,
                    md: "clamp(34px, 4vw, 46px)",
                    lg: 54,
                  },
                  lineHeight: 1.05,
                  color: landingColors.text,
                }}
              >
                Todo tu restaurante conectado en una sola plataforma
              </Typography>

              <Typography
                sx={{
                  ...landingTypography.landingTextLG,
                  maxWidth: {
                    xs: 520,
                    md: 500,
                  },
                  fontSize: {
                    xs: 14,
                    sm: 15,
                    md: 16,
                  },
                  lineHeight: 1.45,
                  color: landingColors.dark,
                }}
              >
                Controla pedidos, mesas, cocina y ventas en tiempo real desde
                cualquier dispositivo.
              </Typography>

              <Button
                type="button"
                onClick={handleRegister}
                variant="contained"
                sx={{
                  width: {
                    xs: "100%",
                    sm: 300,
                    md: 240,
                  },
                  height: {
                    xs: 44,
                    md: 48,
                  },
                  borderRadius: 999,
                  bgcolor: landingColors.white,
                  color: landingColors.dark,
                  boxShadow: "0 14px 28px rgba(62, 49, 35, 0.14)",
                  fontSize: 14,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  mt: {
                    xs: 0.4,
                    md: 1.5,
                  },
                  "&:hover": {
                    bgcolor: landingColors.white,
                    boxShadow: "0 18px 34px rgba(62, 49, 35, 0.18)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Registrate
              </Button>
            </Stack>

            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                width: "100%",
                height: "100%",
                minHeight: 0,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                overflow: "hidden",
                pl: {
                  xs: 1,
                  sm: 3,
                  md: 0,
                },
                pb: {
                  xs: 2.25,
                  sm: 2.25,
                  md: 2,
                },
              }}
            >
              <Box
                component="img"
                src="/images/inicio.png"
                alt="Clic Menu para restaurantes"
                sx={{
                  display: "block",
                  width: {
                    xs: "min(98vw, 420px)",
                    sm: "min(84vw, 560px)",
                    md: "min(48vw, 580px)",
                    lg: "min(54vw, 760px)",
                  },
                  maxHeight: {
                    xs: "44svh",
                    sm: "48svh",
                    md: "72svh",
                    lg: "82svh",
                  },
                  height: "auto",
                  objectFit: "contain",
                  objectPosition: "right bottom",
                  ml: "auto",
                  mr: 0,
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "100%",
              height: {
                xs: 16,
                md: 22,
              },
              bgcolor: "#FF741F",
              zIndex: 20,
            }}
          />

          {scrollLocked && (
            <Button
              type="button"
              onClick={handleUnlockScroll}
              aria-label="Ver más contenido"
              sx={{
                position: "absolute",
                left: "50%",
                bottom: 0,
                zIndex: 30,
                width: {
                  xs: 50,
                  md: 58,
                },
                minWidth: {
                  xs: 50,
                  md: 58,
                },
                height: {
                  xs: 50,
                  md: 58,
                },
                borderRadius: 999,
                bgcolor: "#FF741F",
                color: "#FFFFFF",
                transform: "translateX(-50%)",
                p: 0,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#FF741F",
                  boxShadow: "none",
                },
              }}
            >
              <KeyboardArrowDownRoundedIcon
                sx={{
                  width: {
                    xs: 32,
                    md: 36,
                  },
                  height: {
                    xs: 32,
                    md: 36,
                  },
                  color: "#FFFFFF",
                }}
              />
            </Button>
          )}
        </Box>
      </Box>

      <Box ref={nextSectionRef}>
        <HomeBenefitsSection />
      </Box>

      <HomeFeaturesSection />
      <HomeFaqSection />
      <LandingFooter />
    </Box>
  );
}