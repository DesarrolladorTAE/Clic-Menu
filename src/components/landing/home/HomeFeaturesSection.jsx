import React, { useEffect, useRef, useState } from "react";
import {
  Box, Button, Chip, Container, IconButton, Stack, Typography,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import {
  landingColors,
  landingTypography,
} from "../../../theme/landingTheme";

const features = [
  {
    title: "Administra uno o múltiples restaurantes desde un solo panel",
    text: "Controla sucursales, empleados, ventas y configuraciones desde cualquier lugar con una plataforma centralizada.",
    chips: ["Multi sucursal", "Roles y permisos", "Reportes", "Control remoto"],
    image: "/images/home_feature_1.png",
    imageAlt: "Administración de restaurantes y sucursales",
  },
    {
    title: "Reduce errores y acelera tu operación",
    text: "Meseros, cocina y caja trabajan conectados en tiempo real para brindar un servicio más rápido y organizado.",
    chips: [
      "Comandas digitales",
      "Cocina en tiempo real",
      "Control de mesas",
      "Menos errores",
    ],
    image: "/images/home_feature_2.png",
    imageAlt: "Operación conectada entre meseros cocina y caja",
  },
  {
    title: "Administra tu catálogo fácilmente",
    text: "Organiza productos, categorías, precios e imágenes desde una interfaz sencilla y rápida de usar.",
    chips: ["Productos", "Categorías", "Precios", "Imágenes"],
    image: "/images/home_feature_3.png",
    imageAlt: "Administración de catálogo de productos",
  },
  {
    title: "Menú digital moderno para tus clientes",
    text: "Tus clientes pueden consultar el menú desde su celular, visualizar fotografías y ordenar de forma más cómoda.",
    chips: [
      "Menú QR",
      "Fotos de platillos",
      "Extras y variantes",
      "Compatible con celular",
    ],
    image: "/images/home_feature_4.png",
    imageAlt: "Menú digital QR para clientes",
  },
  {
    title: "Toma decisiones con datos reales",
    text: "Consulta ventas, productos más vendidos y métricas operativas para hacer crecer tu restaurante.",
    chips: ["Ventas", "Top productos", "Estadísticas", "Excel y PDF"],
    image: "/images/home_feature_5.png",
    imageAlt: "Reportes y métricas de ventas",
  },
  {
    title: "Mantente conectado con tus clientes",
    text: "Envía tickets digitales y crea una experiencia más moderna, práctica y profesional para cada visita.",
    chips: ["WhatsApp", "Tickets digitales", "Programa de puntos", "Fidelización"],
    image: "/images/home_feature_6.png",
    imageAlt: "Ticket digital y fidelización por WhatsApp",
  },
];

export default function HomeFeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const activeFeature = features[activeIndex];

  const clearCarouselTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const restartCarouselTimer = () => {
    clearCarouselTimer();

    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
    }, 2000);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));
    restartCarouselTimer();
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
    restartCarouselTimer();
  };

  const handleGoToSlide = (index) => {
    setActiveIndex(index);
    restartCarouselTimer();
  };

  useEffect(() => {
    restartCarouselTimer();

    return () => {
      clearCarouselTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        py: {
          xs: 7,
          sm: 8,
          md: 12,
        },
        bgcolor: landingColors.bg,
        overflow: "hidden",
      }}
    >
      <Container>
        <Stack
          spacing={2}
          alignItems="center"
          sx={{
            maxWidth: 760,
            mx: "auto",
            mb: {
              xs: 5,
              md: 7,
            },
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              ...landingTypography.landingEyebrow,
            }}
          >
            Funciones principales
          </Typography>

          <Typography
            component="h2"
            sx={{
              ...landingTypography.landingTitleLG,
              color: landingColors.title,
            }}
          >
            Todo lo que necesitas para operar tu restaurante
          </Typography>

          <Typography
            sx={{
              ...landingTypography.landingText,
              color: landingColors.muted,
            }}
          >
            Desde la toma de pedidos hasta los reportes de ventas, Clic Menu
            conecta todas las áreas de tu negocio en una sola plataforma.
          </Typography>
        </Stack>

        <Box
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          sx={{
            position: "relative",
            border: `1px solid ${landingColors.border}`,
            borderRadius: {
              xs: `${landingColors.radiusMd}px`,
              md: `${landingColors.radiusLg}px`,
            },
            bgcolor: landingColors.white,
            boxShadow: landingColors.shadow,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              minHeight: {
                xs: "auto",
                md: 520,
              },
            }}
          >
            <Box
              sx={{
                order: {
                  xs: 2,
                  md: 1,
                },
                p: {
                  xs: 3,
                  sm: 4,
                  md: 6,
                },
                display: "flex",
                alignItems: "center",
              }}
            >
              <Stack spacing={3} sx={{ maxWidth: 520 }}>
                <Chip
                  label={`0${activeIndex + 1} / 0${features.length}`}
                  sx={{
                    width: "fit-content",
                    bgcolor: landingColors.orangeSoft,
                    color: landingColors.dark,
                    fontWeight: 900,
                  }}
                />

                <Typography
                  component="h3"
                  sx={{
                    ...landingTypography.landingTitleMD,
                    color: landingColors.title,
                  }}
                >
                  {activeFeature.title}
                </Typography>

                <Typography
                  sx={{
                    ...landingTypography.landingTextLG,
                    color: landingColors.text,
                    maxWidth: 500,
                  }}
                >
                  {activeFeature.text}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{ pt: 0.5 }}
                >
                  {activeFeature.chips.map((chip) => (
                    <Chip
                      key={chip}
                      label={chip}
                      sx={{
                        bgcolor: "#FFF1E8",
                        color: landingColors.text,
                        border: `1px solid ${landingColors.border}`,
                        fontWeight: 800,
                      }}
                    />
                  ))}
                </Stack>

                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ pt: 1 }}
                >
                  <IconButton
                    onClick={handlePrev}
                    sx={{
                      width: 44,
                      height: 44,
                      border: `1px solid ${landingColors.border}`,
                      bgcolor: landingColors.white,
                      color: landingColors.dark,
                      "&:hover": {
                        bgcolor: "#FFF1E8",
                      },
                    }}
                  >
                    <ArrowBackIosNewRoundedIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    onClick={handleNext}
                    sx={{
                      width: 44,
                      height: 44,
                      border: `1px solid ${landingColors.border}`,
                      bgcolor: landingColors.yellow,
                      color: landingColors.dark,
                      "&:hover": {
                        bgcolor: landingColors.yellowHover,
                      },
                    }}
                  >
                    <ArrowForwardIosRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>

            <Box
              sx={{
                order: {
                  xs: 1,
                  md: 2,
                },
                minHeight: {
                  xs: 300,
                  sm: 390,
                  md: "100%",
                },
                bgcolor: landingColors.orangeSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: {
                  xs: 3,
                  sm: 4,
                  md: 5,
                },
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: {
                    xs: 280,
                    sm: 390,
                    md: 520,
                  },
                  height: {
                    xs: 280,
                    sm: 390,
                    md: 520,
                  },
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.46)",
                }}
              />

              <Box
                component="img"
                src={activeFeature.image}
                alt={activeFeature.imageAlt}
                loading="lazy"
                sx={{
                  position: "relative",
                  zIndex: 1,
                  display: "block",
                  width: {
                    xs: "min(82vw, 300px)",
                    sm: 360,
                    md: 430,
                    lg: 470,
                  },
                  maxWidth: "100%",
                  maxHeight: {
                    xs: 300,
                    sm: 360,
                    md: 430,
                    lg: 470,
                  },
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Box>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{
            mt: {
              xs: 3,
              md: 4,
            },
          }}
        >
          {features.map((item, index) => (
            <Button
              key={item.title}
              type="button"
              onClick={() => handleGoToSlide(index)}
              aria-label={`Ver función ${index + 1}`}
              sx={{
                minWidth: 0,
                width: activeIndex === index ? 34 : 12,
                height: 12,
                minHeight: 12,
                p: 0,
                borderRadius: 999,
                bgcolor:
                  activeIndex === index
                    ? landingColors.terracotta
                    : "rgba(207, 109, 78, 0.24)",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: landingColors.terracotta,
                  transform: "none",
                },
              }}
            />
          ))}
        </Stack>
      </Container>
    </Box>
  );
}