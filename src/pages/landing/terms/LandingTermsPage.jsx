// src/pages/landing/terms/LandingTermsPage.jsx
import React, { useEffect, useState } from "react";
import {
  Alert, Box, CircularProgress, Container, Paper, Stack, Typography,
} from "@mui/material";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";

import LandingMenu from "../../../components/landing/menu/LandingMenu";
import LandingFooter from "../../../components/landing/footer/LandingFooter";

import {
  landingColors,
  landingTypography,
} from "../../../theme/landingTheme";

import { getClicmenuTerms } from "../../../services/legal/legalDocuments.service";

export default function LandingTermsPage() {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [termsError, setTermsError] = useState("");

    useEffect(() => {
        let mounted = true;

        const loadTerms = async () => {
        setLoading(true);
        setTermsError("");

        try {
            const data = await getClicmenuTerms();

            if (!mounted) return;

            setTerms(data || null);
        } catch (e) {
            if (!mounted) return;

            setTerms(null);
            setTermsError(
            e?.response?.data?.message ||
                e?.message ||
                "No se pudieron cargar los términos y condiciones."
            );
        } finally {
            if (mounted) {
            setLoading(false);
            }
        }
        };

        loadTerms();

        return () => {
        mounted = false;
        };
    }, []);

    if (loading) {
        return (
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
        );
    }

  return (
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
          bgcolor: landingColors.dark,
          color: landingColors.white,
          py: {
            xs: 7,
            sm: 8,
            md: 10,
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -120,
            right: -120,
            width: {
              xs: 260,
              md: 420,
            },
            height: {
              xs: 260,
              md: 420,
            },
            borderRadius: "50%",
            bgcolor: "rgba(246, 199, 122, 0.14)",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            bottom: -150,
            left: -150,
            width: {
              xs: 280,
              md: 460,
            },
            height: {
              xs: 280,
              md: 460,
            },
            borderRadius: "50%",
            bgcolor: "rgba(207, 109, 78, 0.16)",
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
            alignItems="center"
            sx={{
              maxWidth: 820,
              mx: "auto",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 62,
                height: 62,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: landingColors.orangeLine,
                color: landingColors.white,
                boxShadow: "0 16px 32px rgba(255, 116, 31, 0.28)",
              }}
            >
              <GavelRoundedIcon sx={{ fontSize: 32 }} />
            </Box>

            <Typography
              sx={{
                ...landingTypography.landingEyebrow,
                color: landingColors.yellow,
              }}
            >
              Documento legal
            </Typography>

            <Typography
              component="h1"
              sx={{
                ...landingTypography.landingTitleXL,
                color: landingColors.white,
                maxWidth: 760,
              }}
            >
              {terms?.title || "Términos y Condiciones"}
            </Typography>

            <Typography
              sx={{
                ...landingTypography.landingTextLG,
                color: "rgba(255,255,255,0.74)",
                maxWidth: 720,
              }}
            >
              Consulta las condiciones de uso de Clic Menu. Esta página es
              únicamente informativa.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              justifyContent="center"
              useFlexGap
              flexWrap="wrap"
              sx={{ pt: 1 }}
            >
              <HeroBadge
                icon={<ArticleRoundedIcon fontSize="small" />}
                label={terms?.version ? `Versión ${terms.version}` : "Versión vigente"}
              />

              <HeroBadge
                icon={<VerifiedUserRoundedIcon fontSize="small" />}
                label="Uso de plataforma"
              />
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          py: {
            xs: 6,
            sm: 7,
            md: 9,
          },
          bgcolor: landingColors.bg,
        }}
      >
        <Container>
          {termsError ? (
            <ErrorCard message={termsError} />
          ) : (
            <Paper
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: {
                  xs: `${landingColors.radiusMd}px`,
                  md: `${landingColors.radiusLg}px`,
                },
                border: `1px solid ${landingColors.border}`,
                bgcolor: landingColors.white,
                boxShadow: landingColors.shadow,
              }}
            >
              <Box
                sx={{
                  height: 6,
                  width: "100%",
                  background: `linear-gradient(90deg, ${landingColors.orangeLine}, ${landingColors.yellow}, ${landingColors.terracotta})`,
                }}
              />

              <Box
                sx={{
                  p: {
                    xs: 2.5,
                    sm: 4,
                    md: 5,
                  },
                  borderBottom: `1px solid ${landingColors.border}`,
                  bgcolor: landingColors.white,
                }}
              >
                <Stack spacing={1.2}>
                  <Typography
                    component="h2"
                    sx={{
                      ...landingTypography.landingTitleMD,
                      color: landingColors.title,
                    }}
                  >
                    Revisión del documento
                  </Typography>

                  <Typography
                    sx={{
                      ...landingTypography.landingText,
                      maxWidth: 820,
                      color: landingColors.muted,
                    }}
                  >
                    Lee cuidadosamente la información. El contenido se muestra
                    desde el documento legal vigente configurado para la
                    plataforma.
                  </Typography>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: {
                    xs: 2.5,
                    sm: 4,
                    md: 5,
                  },
                }}
              >
                {Array.isArray(terms?.intro) && terms.intro.length > 0 ? (
                  <Box
                    sx={{
                      mb: {
                        xs: 4,
                        md: 5,
                      },
                      p: {
                        xs: 2,
                        sm: 2.5,
                        md: 3,
                      },
                      borderRadius: `${landingColors.radiusMd}px`,
                      border: `1px solid rgba(207, 109, 78, 0.18)`,
                      bgcolor: "#FFF1E8",
                    }}
                  >
                    {terms.intro.map((paragraph, index) => (
                      <Typography key={`intro-${index}`} sx={introParagraphSx}>
                        {paragraph}
                      </Typography>
                    ))}
                  </Box>
                ) : null}

                <Stack spacing={{ xs: 3, md: 3.5 }}>
                  {Array.isArray(terms?.sections) &&
                    terms.sections.map((section) => (
                      <Box
                        key={section.number}
                        component="section"
                        sx={sectionSx}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="flex-start"
                        >
                          <Box
                            sx={{
                              width: {
                                xs: 34,
                                sm: 40,
                              },
                              height: {
                                xs: 34,
                                sm: 40,
                              },
                              borderRadius: "50%",
                              bgcolor: landingColors.orangeLine,
                              color: landingColors.white,
                              display: "grid",
                              placeItems: "center",
                              fontSize: {
                                xs: 13,
                                sm: 14,
                              },
                              fontWeight: 900,
                              flexShrink: 0,
                              mt: 0.2,
                            }}
                          >
                            {section.number}
                          </Box>

                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography component="h3" sx={sectionTitleSx}>
                              {section.title}
                            </Typography>

                            {Array.isArray(section.content) &&
                              section.content.map((block, index) => {
                                if (block?.type === "paragraph") {
                                  return (
                                    <Typography
                                      key={`block-${section.number}-${index}`}
                                      sx={paragraphSx}
                                    >
                                      {block.text}
                                    </Typography>
                                  );
                                }

                                if (block?.type === "list") {
                                  return (
                                    <Box
                                      key={`block-${section.number}-${index}`}
                                      component="ul"
                                      sx={listSx}
                                    >
                                      {Array.isArray(block.items) &&
                                        block.items.map((item, itemIndex) => (
                                          <Box
                                            key={`item-${section.number}-${index}-${itemIndex}`}
                                            component="li"
                                            sx={listItemSx}
                                          >
                                            {item}
                                          </Box>
                                        ))}
                                    </Box>
                                  );
                                }

                                return null;
                              })}
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                </Stack>
              </Box>
            </Paper>
          )}
        </Container>
      </Box>

      <LandingFooter />
    </Box>
  );
}

function HeroBadge({ icon, label }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        px: 1.75,
        py: 1,
        borderRadius: 999,
        bgcolor: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "rgba(255,255,255,0.84)",
        fontSize: 13,
        fontWeight: 800,
      }}
    >
      {icon}
      <Box component="span">{label}</Box>
    </Stack>
  );
}

function LoadingCard() {
  return (
    <Paper
      sx={{
        minHeight: 360,
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
          Cargando términos y condiciones...
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
          No se pudo cargar el documento
        </Typography>
        <Typography variant="body2">{message}</Typography>
      </Box>
    </Alert>
  );
}

const sectionSx = {
  position: "relative",
  p: {
    xs: 2,
    sm: 2.5,
    md: 3,
  },
  border: `1px solid ${landingColors.border}`,
  borderRadius: `${landingColors.radiusMd}px`,
  bgcolor: landingColors.white,
  boxShadow: "0 8px 22px rgba(62, 49, 35, 0.04)",
};

const sectionTitleSx = {
  mb: 1.5,
  fontSize: {
    xs: 18,
    sm: 20,
    md: 22,
  },
  fontWeight: 900,
  color: landingColors.title,
  lineHeight: 1.25,
};

const introParagraphSx = {
  mb: 1.4,
  fontSize: {
    xs: 14,
    sm: 15,
    md: 16,
  },
  lineHeight: 1.7,
  color: landingColors.text,
  "&:last-of-type": {
    mb: 0,
  },
};

const paragraphSx = {
  mb: 1.45,
  fontSize: {
    xs: 14,
    sm: 15,
  },
  lineHeight: 1.72,
  color: landingColors.muted,
  "&:last-of-type": {
    mb: 0,
  },
};

const listSx = {
  mt: 0.5,
  mb: 1.7,
  pl: {
    xs: 2.5,
    sm: 3,
  },
};

const listItemSx = {
  mb: 0.9,
  fontSize: {
    xs: 14,
    sm: 15,
  },
  lineHeight: 1.6,
  color: landingColors.muted,
  "&::marker": {
    color: landingColors.orangeLine,
  },
};