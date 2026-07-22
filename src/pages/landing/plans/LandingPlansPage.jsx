// src/pages/landing/plans/LandingPlansPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, CircularProgress, Container, Paper, Stack, Typography,
} from "@mui/material";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import LandingMenu from "../../../components/landing/menu/LandingMenu";
import LandingFooter from "../../../components/landing/footer/LandingFooter";
import SEO from "../../../components/seo/SEO";

import {
  landingColors,
  landingTypography,
} from "../../../theme/landingTheme";

import { getPublicPlans } from "../../../services/landing/publicPlans.service";

const recommendedSlug = "gestion";

const planIcons = {
  digital: <RestaurantRoundedIcon />,
  gestion: <StorefrontRoundedIcon />,
  total: <InsightsRoundedIcon />,
};


const billingOptions = [
  {
    key: "monthly",
    label: "Mensual",
    helper: "Pagas 1 mes",
    visible: true,
  },
  {
    key: "semester",
    label: "Semestral",
    helper: "Pagas 5 y recibes 6",
    visible: false,
  },
  {
    key: "annual",
    label: "Anual",
    helper: "Pagas 10 y recibes 12",
    visible: false,
  },
];

const billingConfig = {
  monthly: {
    suffix: "/ mes",
    note: "Pago mensual",
    multiplier: 1,
  },
  semester: {
    suffix: "/ semestre",
    note: "Paga 5 meses y recibe 6",
    multiplier: 5,
  },
  annual: {
    suffix: "/ año",
    note: "Paga 10 meses y recibe 12",
    multiplier: 10,
  },
};

export default function LandingPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plansError, setPlansError] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  useEffect(() => {
    let mounted = true;

    const loadPlans = async () => {
      setLoading(true);
      setPlansError("");

      try {
        const data = await getPublicPlans();

        if (!mounted) return;

        setPlans(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;

        setPlans([]);
        setPlansError(
          e?.response?.data?.message ||
            e?.message ||
            "No se pudieron cargar los planes."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPlans();

    return () => {
      mounted = false;
    };
  }, []);

  const orderedPlans = useMemo(() => {
    return [...plans]
      .filter((plan) => plan?.slug !== "demo")
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  }, [plans]);

  if (loading) {
    return (
      <>
        <SEO
          title="Planes Clic Menu | Software para Restaurantes a tu Medida"
          description="Conoce los planes de Clic Menu y elige las herramientas que necesita tu restaurante: menú QR, ventas, inventarios, reportes y más."
          keywords="planes software restaurante, precio punto de venta restaurante, sistema restaurante mensual, menú digital qr precio"
          url="https://clicmenu.com.mx/planes"
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
            sx={{
              minHeight: {
                xs: "calc(100vh - 72px)",
                md: "calc(100vh - 84px)",
              },
              display: "grid",
              placeItems: "center",
              px: 2,
              bgcolor: landingColors.bg,
            }}
          >
            <LoadingCard />
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Planes Clic Menu | Software para Restaurantes a tu Medida"
        description="Conoce los planes de Clic Menu y elige las herramientas que necesita tu restaurante: menú QR, ventas, inventarios, reportes y más."
        keywords="planes software restaurante, precio punto de venta restaurante, sistema restaurante mensual, menú digital qr precio"
        url="https://clicmenu.com.mx/planes"
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
              xs: 5,
              sm: 6,
              md: 7,
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -140,
              right: -150,
              width: { xs: 280, md: 460 },
              height: { xs: 280, md: 460 },
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
              width: { xs: 280, md: 430 },
              height: { xs: 280, md: 430 },
              borderRadius: "50%",
              bgcolor: "rgba(207, 109, 78, 0.12)",
              pointerEvents: "none",
            }}
          />

          <Container sx={{ position: "relative", zIndex: 1 }}>
            <Stack
              spacing={2.5}
              alignItems="center"
              sx={{
                maxWidth: 860,
                mx: "auto",
                textAlign: "center",
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
                Planes Clic Menu
              </Box>

              <Typography
                component="h1"
                sx={{
                  ...landingTypography.landingTitleXL,
                  maxWidth: 850,
                  color: landingColors.title,
                  fontSize: {
                    xs: 42,
                    sm: 54,
                    md: 72,
                  },
                  lineHeight: 0.98,
                }}
              >
                Elige cómo quieres operar tu restaurante
              </Typography>

              <Typography
                sx={{
                  ...landingTypography.landingTextLG,
                  maxWidth: 720,
                  color: landingColors.text,
                }}
              >
                Tenemos opciones para empezar fácil, vender mejor y crecer con control.
                Revisa cada plan y elige el que se adapta a tu forma de trabajar.
              </Typography>
            </Stack>
          </Container>
        </Box>

        <Box
          component="section"
          sx={{
            pt: {
              xs: 2,
              sm: 3,
              md: 4,
            },
            pb: {
              xs: 6,
              sm: 7,
              md: 9,
            },
            bgcolor: landingColors.bg,
          }}
        >
          <Container>
            {plansError ? (
              <ErrorCard message={plansError} />
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: {
                      xs: 3,
                      md: 4,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      p: 0.75,
                      borderRadius: 3,
                      border: `1px solid ${landingColors.border}`,
                      bgcolor: landingColors.white,
                      boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
                    }}
                  >
                    {billingOptions
                      .filter((option) => option.visible)
                      .map((option) => {
                      const selected = billingPeriod === option.key;

                      return (
                        <Box
                          key={option.key}
                          component="button"
                          type="button"
                          onClick={() => setBillingPeriod(option.key)}
                          sx={{
                            border: 0,
                            minWidth: {
                              xs: 92,
                              sm: 132,
                            },
                            cursor: "pointer",
                            px: {
                              xs: 1.5,
                              sm: 2,
                            },
                            py: 1.15,
                            borderRadius: 2,
                            bgcolor: selected ? landingColors.orangeLine : "transparent",
                            color: selected ? landingColors.white : landingColors.muted,
                            fontWeight: 900,
                            fontSize: {
                              xs: 12,
                              sm: 14,
                            },
                            lineHeight: 1,
                            transform: selected ? "translateY(-1px)" : "translateY(0)",
                            boxShadow: selected
                              ? "0 10px 22px rgba(255,116,31,0.28)"
                              : "none",
                            transition:
                              "background-color 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
                            "&:hover": {
                              bgcolor: selected ? landingColors.terracotta : "#FFF1E8",
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          <Stack spacing={0.35} alignItems="center">
                            <Box component="span">{option.label}</Box>

                            <Box
                              component="span"
                              sx={{
                                display: {
                                  xs: "none",
                                  sm: "block",
                                },
                                fontSize: 10,
                                fontWeight: 800,
                                opacity: 0.78,
                              }}
                            >
                              {option.helper}
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: {
                      xs: 2.5,
                      md: 3,
                    },
                    alignItems: "stretch",
                  }}
                >
                  {orderedPlans.map((plan) => (
                    <LandingPlanCard
                      key={plan.id || plan.slug}
                      plan={plan}
                      recommended={plan.slug === recommendedSlug}
                      billingPeriod={billingPeriod}
                    />
                  ))}
                </Box>

                <Paper
                  sx={{
                    mt: {
                      xs: 4,
                      md: 5,
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
                        ¿No sabes qué plan elegir?
                      </Typography>

                      <Typography
                        sx={{
                          ...landingTypography.landingText,
                          mt: 1,
                          maxWidth: 640,
                          color: "rgba(255,255,255,0.72)",
                        }}
                      >
                        Escríbenos y te ayudamos a identificar el plan adecuado
                        según el tamaño y operación de tu restaurante.
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
                          sm: 250,
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
                      Hablar por WhatsApp
                    </Button>
                  </Stack>
                </Paper>
              </>
            )}
          </Container>
        </Box>

        <LandingFooter />
      </Box>
    </>
  );
}

function LandingPlanCard({ plan, recommended = false, billingPeriod = "monthly" }) {
  const includedFeatures = Array.isArray(plan?.features?.included)
    ? plan.features.included
    : Array.isArray(plan?.includes)
    ? plan.includes
    : [];

  const excludedFeatures = Array.isArray(plan?.features?.excluded)
    ? plan.features.excluded
    : [];
  const baseAmount = Number(plan?.price?.amount || plan?.monthly_price || 0);
  const selectedBilling = billingConfig[billingPeriod] || billingConfig.monthly;
  const amount =
    plan?.billing_prices?.[billingPeriod] ??
    baseAmount * selectedBilling.multiplier;

  const currency = plan?.price?.currency || plan?.currency || "MXN";
  const icon = planIcons[plan?.slug] || <RestaurantRoundedIcon />;

  return (
    <Paper
      component="article"
      sx={{
        position: "relative",
        height: "100%",
        overflow: "hidden",
        borderRadius: {
          xs: `${landingColors.radiusMd}px`,
          md: `${landingColors.radiusLg}px`,
        },
        border: recommended
          ? `2px solid ${landingColors.orangeLine}`
          : `1px solid ${landingColors.border}`,
        bgcolor: recommended ? landingColors.dark : landingColors.white,
        color: recommended ? landingColors.white : landingColors.text,
        boxShadow: recommended ? landingColors.shadow : landingColors.shadowSoft,
        transition: "transform 0.24s ease, box-shadow 0.24s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: landingColors.shadow,
        },
      }}
    >
      <Box
        sx={{
          height: 7,
          width: "100%",
          background: recommended
            ? `linear-gradient(90deg, ${landingColors.orangeLine}, ${landingColors.yellow})`
            : `linear-gradient(90deg, ${landingColors.orangeLine}, ${landingColors.orangeSoft})`,
        }}
      />

      {recommended ? (
        <Box
          sx={{
            position: "absolute",
            top: 18,
            right: 18,
            px: 1.5,
            py: 0.7,
            borderRadius: 999,
            bgcolor: landingColors.orangeLine,
            color: landingColors.white,
            fontSize: 12,
            fontWeight: 900,
            zIndex: 2,
          }}
        >
          Recomendado
        </Box>
      ) : null}

      <Stack
        spacing={2.5}
        sx={{
          p: {
            xs: 2.5,
            sm: 3,
            md: 3.5,
          },
          height: "100%",
        }}
      >
        <Box
          sx={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: recommended ? "rgba(255,255,255,0.1)" : "#FFF1E8",
            color: recommended ? landingColors.yellow : landingColors.orangeLine,
            "& svg": {
              fontSize: 28,
            },
          }}
        >
          {icon}
        </Box>

        <Stack spacing={1.2}>
          <Typography
            component="h3"
            sx={{
              ...landingTypography.landingCardTitle,
              color: recommended ? landingColors.white : landingColors.title,
              fontSize: {
                xs: 25,
                md: 27,
              },
            }}
          >
            {plan?.name || "Plan"}
          </Typography>

          <Typography
            sx={{
              ...landingTypography.landingText,
              color: recommended
                ? "rgba(255,255,255,0.74)"
                : landingColors.muted,
              minHeight: {
                md: 74,
              },
            }}
          >
            {plan?.description ||
              "Plan para restaurantes que buscan digitalizar su operación."}
          </Typography>
        </Stack>

        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: 44,
                sm: 50,
              },
              fontWeight: 900,
              lineHeight: 1,
              color: recommended ? landingColors.white : landingColors.dark,
            }}
          >
            ${amount.toLocaleString("es-MX")}
            <Typography
              component="span"
              sx={{
                ml: 0.7,
                fontSize: 17,
                fontWeight: 800,
                color: recommended
                  ? "rgba(255,255,255,0.72)"
                  : landingColors.muted,
              }}
            >
              {currency} {selectedBilling.suffix}
            </Typography>
          </Typography>
          
          <Typography
            sx={{
              mt: 1,
              fontSize: 13,
              fontWeight: 900,
              color: recommended
                ? landingColors.yellow
                : landingColors.terracotta,
            }}
          >
            {selectedBilling.note}
          </Typography>
        </Box>

        <Box
          sx={{
            pt: 2,
            mt: "auto",
            borderTop: recommended
              ? "1px solid rgba(255,255,255,0.14)"
              : `1px solid ${landingColors.border}`,
          }}
        >
          <Stack spacing={2}>
            <FeatureSectionTitle text="Incluye" recommended={recommended} />

            <Stack spacing={1.15}>
              {includedFeatures.length > 0 ? (
                includedFeatures.map((item, index) => (
                  <FeatureRow
                    key={`${plan?.slug}-included-${index}`}
                    text={item}
                    recommended={recommended}
                    variant="included"
                  />
                ))
              ) : (
                <FeatureRow
                  text="Sin beneficios listados"
                  recommended={recommended}
                  variant="included"
                />
              )}
            </Stack>

            {excludedFeatures.length > 0 ? (
              <Box
                sx={{
                  pt: 1.5,
                  borderTop: recommended
                    ? "1px solid rgba(255,255,255,0.12)"
                    : `1px solid ${landingColors.border}`,
                }}
              >
                <Stack spacing={1.15}>
                  <FeatureSectionTitle text="No incluye" recommended={recommended} />

                  {excludedFeatures.map((item, index) => (
                    <FeatureRow
                      key={`${plan?.slug}-excluded-${index}`}
                      text={item}
                      recommended={recommended}
                      variant="excluded"
                    />
                  ))}
                </Stack>
              </Box>
            ) : null}
          </Stack>
        </Box>

      </Stack>
    </Paper>
  );
}

function FeatureSectionTitle({ text, recommended }) {
  return (
    <Typography
      sx={{
        fontSize: 13,
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: recommended ? "rgba(255,255,255,0.72)" : landingColors.muted,
      }}
    >
      {text}
    </Typography>
  );
}

function FeatureRow({ text, recommended, variant = "included" }) {
  const isExcluded = variant === "excluded";
  const Icon = isExcluded ? CancelRoundedIcon : CheckCircleRoundedIcon;

  return (
    <Stack direction="row" spacing={1.15} alignItems="flex-start">
      <Icon
        sx={{
          fontSize: 18,
          mt: "2px",
          color: recommended
            ? isExcluded
              ? "rgba(255,255,255,0.45)"
              : "#2eae18"
            : isExcluded
            ? "#D14343"
            : "#2eae18",
          flexShrink: 0,
        }}
      />

      <Typography
        sx={{
          fontSize: 14,
          lineHeight: 1.5,
          color: recommended
            ? isExcluded
              ? "rgba(255,255,255,0.56)"
              : "rgba(255,255,255,0.84)"
            : isExcluded
            ? landingColors.muted
            : landingColors.text,
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}

function LoadingCard() {
  return (
    <Paper
      sx={{
        minHeight: 320,
        width: "min(100%, 520px)",
        display: "grid",
        placeItems: "center",
        borderRadius: `${landingColors.radiusLg}px`,
        border: `1px solid ${landingColors.border}`,
        bgcolor: landingColors.white,
        boxShadow: landingColors.shadowSoft,
        p: 4,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 800,
            color: landingColors.text,
          }}
        >
          Cargando planes...
        </Typography>
      </Stack>
    </Paper>
  );
}

function ErrorCard({ message }) {
  return (
    <Alert
      severity="error"
      sx={{
        borderRadius: `${landingColors.radiusMd}px`,
        border: `1px solid rgba(211, 47, 47, 0.18)`,
        bgcolor: "#FFF0EE",
        alignItems: "flex-start",
      }}
    >
      <Box>
        <Typography sx={{ fontWeight: 900, mb: 0.5 }}>
          No se pudieron cargar los planes
        </Typography>
        <Typography variant="body2">{message}</Typography>
      </Box>
    </Alert>
  );
}