import React, { useState } from "react";
import {
  AppBar, Box, Button, Container, Drawer, IconButton, Stack,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useNavigate } from "react-router-dom";

import { landingColors } from "../../../theme/landingTheme";

const menuItems = [
  { label: "Inicio", path: "/", enabled: true },
  { label: "Planes", path: "/planes", enabled: true },
  { label: "Sobre nosotros", path: "/sobre-nosotros", enabled: false },
  { label: "Contáctanos", path: "/contacto", enabled: true },
  {
    label: "Términos y condiciones",
    path: "/terminos-y-condiciones",
    enabled: true,
  },
];

const authItems = [
  { label: "Iniciar sesión", path: "/auth/login", type: "login" },
  { label: "Regístrate", path: "/auth/register", type: "register" },
];

export default function LandingMenu() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (item) => {
    if (!item.enabled) return;

    setMobileOpen(false);
    navigate(item.path);
  };

  const handleAuthNavigate = (item) => {
    setMobileOpen(false);
    navigate(item.path);
  };

  return (
    <>
      <AppBar
        position="relative"
        elevation={0}
        sx={{
          bgcolor: landingColors.white,
          color: landingColors.dark,
          borderBottom: `1px solid rgba(63, 61, 58, 0.08)`,
          boxShadow: "0 8px 26px rgba(62, 49, 35, 0.055)",
          zIndex: 100,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: 3,
            background: `linear-gradient(90deg, ${landingColors.orangeLine}, ${landingColors.yellow}, ${landingColors.terracotta})`,
            pointerEvents: "none",
          }}
        />

        <Container
            maxWidth={false}
            disableGutters
            sx={{
                width: "100%",
                px: {
                xs: 2,
                sm: 2.5,
                md: 4,
                lg: 5,
                },
            }}
        >
          <Box
            sx={{
              height: {
                xs: 72,
                md: 84,
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={() => navigate("/")}
              sx={{
                p: 0,
                m: 0,
                border: 0,
                bgcolor: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                lineHeight: 0,
                transition: "transform 0.2s ease, opacity 0.2s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  opacity: 0.92,
                },
              }}
            >
              <Box
                component="img"
                src="/images/clicmenu-naranja.png"
                alt="Clic Menu"
                sx={{
                  display: "block",
                  width: {
                    xs: 132,
                    sm: 152,
                    md: 178,
                  },
                  height: "auto",
                }}
              />
            </Box>

            <Stack
              direction="row"
              spacing={{
                lg: 2,
                xl: 2.6,
              }}
              alignItems="center"
              sx={{
                display: {
                  xs: "none",
                  lg: "flex",
                },
              }}
            >
              <Stack
                component="nav"
                direction="row"
                spacing={{
                  lg: 1.8,
                  xl: 2.6,
                }}
                alignItems="center"
              >
                {menuItems.map((item) => (
                  <Button
                    key={item.label}
                    type="button"
                    onClick={() => handleNavigate(item)}
                    disabled={!item.enabled}
                    sx={{
                      position: "relative",
                      minHeight: 38,
                      px: 0,
                      py: 0.5,
                      borderRadius: 0,
                      bgcolor: "transparent",
                      color: landingColors.dark,
                      fontSize: {
                        md: 13,
                        lg: 15,
                      },
                      fontWeight: 900,
                      textTransform: "none",
                      whiteSpace: "nowrap",
                      opacity: item.enabled ? 1 : 0.86,
                      boxShadow: "none",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 2,
                        mx: "auto",
                        width: item.enabled ? "70%" : 0,
                        height: 3,
                        borderRadius: 999,
                        bgcolor: landingColors.orangeLine,
                        transition: "width 0.22s ease",
                      },
                      "&.Mui-disabled": {
                        color: landingColors.dark,
                        opacity: 0.86,
                        cursor: "default",
                      },
                      "&:hover": {
                        bgcolor: "transparent",
                        color: landingColors.terracotta,
                        transform: "translateY(-1px)",
                        boxShadow: "none",
                      },
                      "&:hover::after": {
                        width: "70%",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                {authItems.map((item) => (
                  <Button
                    key={item.label}
                    type="button"
                    onClick={() => handleAuthNavigate(item)}
                    variant={item.type === "register" ? "contained" : "outlined"}
                    sx={{
                      minHeight: 40,
                      height: 40,
                      px: item.type === "register" ? 2.4 : 2,
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                      textTransform: "none",
                      boxShadow: "none",
                      bgcolor:
                        item.type === "register"
                          ? landingColors.orangeLine
                          : "#FFF7EC",
                      color:
                        item.type === "register"
                          ? landingColors.white
                          : landingColors.terracotta,
                      border:
                        item.type === "register"
                          ? `1px solid ${landingColors.orangeLine}`
                          : `1.5px solid ${landingColors.terracotta}`,
                      boxShadow:
                        item.type === "register"
                          ? "none"
                          : "0 8px 18px rgba(207, 109, 78, 0.12)",
                      "&:hover": {
                        bgcolor:
                          item.type === "register"
                            ? landingColors.terracotta
                            : "#FFE8DC",
                        color:
                          item.type === "register"
                            ? landingColors.white
                            : landingColors.orangeLine,
                        border:
                          item.type === "register"
                            ? `1px solid ${landingColors.terracotta}`
                            : `1.5px solid ${landingColors.orangeLine}`,
                        boxShadow:
                          item.type === "register"
                            ? "none"
                            : "0 10px 22px rgba(255, 116, 31, 0.18)",
                      },
                      
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>
            </Stack>

            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                display: {
                  xs: "inline-flex",
                  lg: "none",
                },
                width: 44,
                height: 44,
                borderRadius: 2,
                color: landingColors.dark,
                bgcolor: "#FFF7EC",
                border: `1px solid rgba(207, 109, 78, 0.18)`,
                boxShadow: "0 8px 18px rgba(62, 49, 35, 0.08)",
                "&:hover": {
                  bgcolor: "#FFF1E8",
                },
              }}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Box>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: {
              xs: "86vw",
              sm: 360,
            },
            maxWidth: 380,
            bgcolor: landingColors.white,
            borderRadius: "24px 0 0 24px",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: landingColors.white,
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: 4,
              background: `linear-gradient(90deg, ${landingColors.orangeLine}, ${landingColors.yellow}, ${landingColors.terracotta})`,
            }}
          />

          <Box
            sx={{
              p: 2.5,
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
              flex: 1,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: -80,
                top: 80,
                width: 190,
                height: 190,
                borderRadius: "50%",
                bgcolor: "rgba(246, 199, 122, 0.22)",
                pointerEvents: "none",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                left: -110,
                bottom: -90,
                width: 220,
                height: 220,
                borderRadius: "50%",
                bgcolor: "rgba(207, 109, 78, 0.10)",
                pointerEvents: "none",
              }}
            />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                mb: 4,
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box
                component="button"
                type="button"
                onClick={() => handleNavigate(menuItems[0])}
                sx={{
                  p: 0,
                  m: 0,
                  border: 0,
                  bgcolor: "transparent",
                  cursor: "pointer",
                  lineHeight: 0,
                }}
              >
                <Box
                  component="img"
                  src="/images/clicmenu-naranja.png"
                  alt="Clic Menu"
                  sx={{
                    width: 146,
                    height: "auto",
                  }}
                />
              </Box>

              <IconButton
                onClick={() => setMobileOpen(false)}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  color: landingColors.dark,
                  bgcolor: "#FFF7EC",
                  border: `1px solid rgba(207, 109, 78, 0.16)`,
                  "&:hover": {
                    bgcolor: "#FFF1E8",
                  },
                }}
              >
                <CloseRoundedIcon />
              </IconButton>
            </Stack>

            <Stack
              component="nav"
              spacing={1.3}
              sx={{
                position: "relative",
                zIndex: 1,
              }}
            >
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavigate(item)}
                  disabled={!item.enabled}
                  fullWidth
                  sx={{
                    position: "relative",
                    justifyContent: "flex-start",
                    minHeight: 48,
                    px: 0,
                    borderRadius: 0,
                    color: landingColors.dark,
                    bgcolor: "transparent",
                    fontSize: 16,
                    fontWeight: 900,
                    textTransform: "none",
                    boxShadow: "none",
                    opacity: item.enabled ? 1 : 0.62,
                    "&::before": {
                      content: '""',
                      width: item.enabled ? 8 : 0,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: landingColors.orangeLine,
                      mr: item.enabled ? 1.4 : 0,
                      transition: "all 0.2s ease",
                    },
                    "&.Mui-disabled": {
                      color: landingColors.dark,
                      opacity: 0.62,
                    },
                    "&:hover": {
                      bgcolor: "transparent",
                      color: landingColors.terracotta,
                      transform: "translateX(4px)",
                      boxShadow: "none",
                    },
                    "&:hover::before": {
                      width: 8,
                      mr: 1.4,
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            <Box
              sx={{
                mt: "auto",
                pt: 3,
                position: "relative",
                zIndex: 1,
              }}
            >
              <Stack spacing={1.4}>
                {authItems.map((item) => (
                  <Button
                    key={item.label}
                    type="button"
                    fullWidth
                    onClick={() => handleAuthNavigate(item)}
                    variant={item.type === "register" ? "contained" : "outlined"}
                    sx={{
                      height: 50,
                      borderRadius: 999,
                      fontSize: 15,
                      fontWeight: 900,
                      textTransform: "none",

                      bgcolor:
                        item.type === "register"
                          ? landingColors.orangeLine
                          : "#FFF7EC",

                      color:
                        item.type === "register"
                          ? landingColors.white
                          : landingColors.terracotta,

                      border:
                        item.type === "register"
                          ? `1px solid ${landingColors.orangeLine}`
                          : `1.5px solid ${landingColors.terracotta}`,

                      boxShadow:
                        item.type === "register"
                          ? "0 12px 26px rgba(255, 116, 31, 0.25)"
                          : "0 8px 18px rgba(207, 109, 78, 0.12)",

                      "&:hover": {
                        bgcolor:
                          item.type === "register"
                            ? landingColors.terracotta
                            : "#FFE8DC",

                        color:
                          item.type === "register"
                            ? landingColors.white
                            : landingColors.orangeLine,

                        border:
                          item.type === "register"
                            ? `1px solid ${landingColors.terracotta}`
                            : `1.5px solid ${landingColors.orangeLine}`,

                        boxShadow:
                          item.type === "register"
                            ? "0 14px 30px rgba(207, 109, 78, 0.28)"
                            : "0 10px 22px rgba(255, 116, 31, 0.18)",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>

              <Box
                sx={{
                  mt: 3,
                  width: 92,
                  height: 4,
                  borderRadius: 999,
                  bgcolor: landingColors.orangeLine,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}