import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Stack,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useNavigate } from "react-router-dom";

import { landingColors } from "../../../theme/landingTheme";

const menuItems = [
  { label: "Inicio", path: "/", enabled: true },
  { label: "Planes", path: "/planes", enabled: true },
  { label: "Contáctanos", path: "/contacto", enabled: true },
  {
    label: "Términos y condiciones",
    path: "/terminos-y-condiciones",
    enabled: true,
  },
];

const authItems = [
  { label: "Iniciar sesión", path: "/auth/login", type: "login" },
  { label: "Probar gratis", path: "/auth/register", type: "register" },
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
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          bgcolor: "rgba(255, 255, 255, 0.94)",
          color: landingColors.dark,
          borderBottom: `1px solid ${landingColors.borderSoft}`,
          boxShadow: "0 6px 22px rgba(17, 24, 32, 0.06)",
          backdropFilter: "blur(14px)",
          zIndex: 1200,
        }}
      >
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
                xs: 68,
                md: 76,
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
              aria-label="Ir al inicio"
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
                  opacity: 0.94,
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
                    xs: 130,
                    sm: 148,
                    md: 170,
                  },
                  height: "auto",
                }}
              />
            </Box>

            <Stack
              direction="row"
              spacing={{
                lg: 2.6,
                xl: 3.2,
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
                  lg: 2,
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
                      color: landingColors.title,
                      fontSize: 14,
                      fontWeight: 800,
                      textTransform: "none",
                      whiteSpace: "nowrap",
                      opacity: item.enabled ? 1 : 0.55,
                      boxShadow: "none",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 1,
                        mx: "auto",
                        width: 0,
                        height: 2,
                        borderRadius: 999,
                        bgcolor: landingColors.primary,
                        transition: "width 0.22s ease",
                      },
                      "&.Mui-disabled": {
                        color: landingColors.title,
                        opacity: 0.55,
                        cursor: "default",
                      },
                      "&:hover": {
                        bgcolor: "transparent",
                        color: landingColors.primary,
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

              <Stack direction="row" spacing={1.1} alignItems="center">
                {authItems.map((item) => {
                  const isRegister = item.type === "register";

                  return (
                    <Button
                      key={item.label}
                      type="button"
                      onClick={() => handleAuthNavigate(item)}
                      variant={isRegister ? "contained" : "outlined"}
                      sx={{
                        minHeight: 42,
                        height: 42,
                        px: isRegister ? 2.5 : 2.2,
                        borderRadius: landingColors.radiusXs,
                        fontSize: 13,
                        fontWeight: 900,
                        whiteSpace: "nowrap",
                        textTransform: "none",
                        bgcolor: isRegister
                          ? landingColors.primary
                          : landingColors.white,
                        color: isRegister
                          ? landingColors.white
                          : landingColors.blue,
                        border: isRegister
                          ? `1px solid ${landingColors.primary}`
                          : `1.5px solid ${landingColors.blue}`,
                        boxShadow: isRegister
                          ? landingColors.shadowButton
                          : "none",
                        "&:hover": {
                          bgcolor: isRegister
                            ? landingColors.primaryHover
                            : landingColors.blueSoft,
                          color: isRegister
                            ? landingColors.white
                            : landingColors.blueHover,
                          border: isRegister
                            ? `1px solid ${landingColors.primaryHover}`
                            : `1.5px solid ${landingColors.blueHover}`,
                          boxShadow: isRegister
                            ? "0 16px 30px rgba(201, 90, 59, 0.34)"
                            : "none",
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Stack>
            </Stack>

            <IconButton
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              sx={{
                display: {
                  xs: "inline-flex",
                  lg: "none",
                },
                width: 44,
                height: 44,
                borderRadius: landingColors.radiusXs,
                color: landingColors.title,
                bgcolor: landingColors.primarySoft,
                border: `1px solid rgba(201, 90, 59, 0.16)`,
                boxShadow: "0 8px 18px rgba(17, 24, 32, 0.08)",
                "&:hover": {
                  bgcolor: landingColors.terracottaSoft,
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
              sm: 370,
            },
            maxWidth: 390,
            bgcolor: landingColors.white,
            borderRadius: "26px 0 0 26px",
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
              height: 5,
              background: `linear-gradient(90deg, ${landingColors.primary}, ${landingColors.orangeSoft}, ${landingColors.brownSoft})`,
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
                right: -90,
                top: 84,
                width: 210,
                height: 210,
                borderRadius: "50%",
                bgcolor: "rgba(201, 90, 59, 0.10)",
                pointerEvents: "none",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                left: -120,
                bottom: -90,
                width: 240,
                height: 240,
                borderRadius: "50%",
                bgcolor: "rgba(244, 163, 127, 0.16)",
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
                aria-label="Ir al inicio"
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
                    width: 148,
                    height: "auto",
                  }}
                />
              </Box>

              <IconButton
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: landingColors.radiusXs,
                  color: landingColors.title,
                  bgcolor: landingColors.primarySoft,
                  border: `1px solid rgba(201, 90, 59, 0.14)`,
                  "&:hover": {
                    bgcolor: landingColors.terracottaSoft,
                  },
                }}
              >
                <CloseRoundedIcon />
              </IconButton>
            </Stack>

            <Stack
              component="nav"
              spacing={1.35}
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
                    minHeight: 50,
                    px: 0,
                    borderRadius: 0,
                    color: landingColors.title,
                    bgcolor: "transparent",
                    fontSize: 16,
                    fontWeight: 900,
                    textTransform: "none",
                    boxShadow: "none",
                    opacity: item.enabled ? 1 : 0.55,
                    "&::before": {
                      content: '""',
                      width: item.enabled ? 8 : 0,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: landingColors.primary,
                      mr: item.enabled ? 1.4 : 0,
                      transition: "all 0.2s ease",
                    },
                    "&.Mui-disabled": {
                      color: landingColors.title,
                      opacity: 0.55,
                    },
                    "&:hover": {
                      bgcolor: "transparent",
                      color: landingColors.primary,
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
                {authItems.map((item) => {
                  const isRegister = item.type === "register";

                  return (
                    <Button
                      key={item.label}
                      type="button"
                      fullWidth
                      onClick={() => handleAuthNavigate(item)}
                      variant={isRegister ? "contained" : "outlined"}
                      sx={{
                        height: 50,
                        borderRadius: landingColors.radiusXs,
                        fontSize: 15,
                        fontWeight: 900,
                        textTransform: "none",
                        bgcolor: isRegister
                          ? landingColors.primary
                          : landingColors.white,
                        color: isRegister
                          ? landingColors.white
                          : landingColors.blue,
                        border: isRegister
                          ? `1px solid ${landingColors.primary}`
                          : `1.5px solid ${landingColors.blue}`,
                        boxShadow: isRegister
                          ? landingColors.shadowButton
                          : "none",
                        "&:hover": {
                          bgcolor: isRegister
                            ? landingColors.primaryHover
                            : landingColors.blueSoft,
                          color: isRegister
                            ? landingColors.white
                            : landingColors.blueHover,
                          border: isRegister
                            ? `1px solid ${landingColors.primaryHover}`
                            : `1.5px solid ${landingColors.blueHover}`,
                          boxShadow: isRegister
                            ? "0 16px 30px rgba(201, 90, 59, 0.34)"
                            : "none",
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Stack>

              <Box
                sx={{
                  mt: 3,
                  width: 96,
                  height: 4,
                  borderRadius: landingColors.radiusXs,
                  bgcolor: landingColors.primary,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}