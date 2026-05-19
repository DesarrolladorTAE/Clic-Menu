// src/components/registro/TermsModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack,  Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { acceptTerms } from "../../services/auth/auth.service";
import { getClicmenuTerms } from "../../services/legal/legalDocuments.service";

export default function TermsModal({
  open,
  onClose,
  onAccepted,
  pendingTermsUser,
  mode = "login",
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [terms, setTerms] = useState(null);
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsError, setTermsError] = useState("");

  const isLoginMode = mode === "login";

  const userId = pendingTermsUser?.user_id ?? null;
  const email = pendingTermsUser?.email ?? null;

  const canSubmit = useMemo(() => {
    if (!isLoginMode) return true;
    return Boolean(userId) && Boolean(email);
  }, [isLoginMode, userId, email]);

  useEffect(() => {
    let mounted = true;

    const loadTerms = async () => {
      if (!open) return;

      setTermsLoading(true);
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
          setTermsLoading(false);
        }
      }
    };

    loadTerms();

    return () => {
      mounted = false;
    };
  }, [open]);

  const onAccept = async () => {
    setErr("");
    setBusy(true);

    try {
      if (!isLoginMode) {
        onAccepted?.({ accepted: true });
        onClose?.();
        return;
      }

      if (!canSubmit) {
        setErr(
          "No se pudo identificar al usuario para aceptar términos. Cierra el modal e intenta iniciar sesión de nuevo."
        );
        return;
      }

      await acceptTerms({
        accepted: true,
        user_id: userId,
        email,
      });

      onAccepted?.({ accepted: true });
      onClose?.();
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron aceptar los términos.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            backgroundColor: "background.paper",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: "#111111",
          color: "#fff",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: 19, sm: 24 },
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              {terms?.title || "Términos y Condiciones"}
            </Typography>

            <Typography
              sx={{
                mt: 0.6,
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,255,255,0.78)",
              }}
            >
              {terms?.version ? `Versión ${terms.version}` : "Documento legal"}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={busy}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 2,
              flexShrink: 0,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "background.default",
          overflow: "hidden",
        }}
      >
        <Stack 
          spacing={2.5}
          sx={{
            maxHeight: { xs: "calc(100vh - 32px)", sm: "calc(100vh - 140px)" },
            overflow: "hidden",
          }}
        >
          {(err || termsError) && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 1,
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                  Error
                </Typography>
                <Typography variant="body2">{err || termsError}</Typography>
              </Box>
            </Alert>
          )}

          {isLoginMode && !canSubmit && (
            <Alert
              severity="warning"
              sx={{
                borderRadius: 1,
                alignItems: "flex-start",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                No se encontró user_id/email para aceptar términos. Cierra el modal e
                intenta iniciar sesión de nuevo.
              </Typography>
            </Alert>
          )}

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 0,
              bgcolor: "background.paper",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "#fff",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: 17, sm: 19 },
                  color: "text.primary",
                }}
              >
                Revisa antes de continuar
              </Typography>

              <Typography
                sx={{
                  mt: 0.4,
                  fontSize: 13,
                  color: "text.secondary",
                  fontWeight: 600,
                }}
              >
                Al aceptar, confirmas que leíste y aceptas el uso de la plataforma.
              </Typography>
            </Box>

            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2.5,
                height: { xs: "calc(100vh - 350px)", sm: 380 },
                overflowY: "auto",
                overflowX: "hidden",
                bgcolor: "#fff",
              }}
            >
              {termsLoading ? (
                <Typography sx={{ fontWeight: 800, color: "text.primary" }}>
                  Cargando términos y condiciones...
                </Typography>
              ) : (
                <>
                  {Array.isArray(terms?.intro) &&
                    terms.intro.map((paragraph, index) => (
                      <Typography key={`intro-${index}`} sx={paragraphSx}>
                        {paragraph}
                      </Typography>
                    ))}

                  {Array.isArray(terms?.sections) &&
                    terms.sections.map((section) => (
                      <Box key={section.number} component="section" sx={sectionSx}>
                        <Typography sx={sectionTitleSx}>
                          {section.number}. {section.title}
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
                    ))}
                </>
              )}
            </Box>
          </Box>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="flex-end"
            spacing={1.5}
            sx={{
              pt: 1,
              flexShrink: 0,
            }}
          >
            <Button
              type="button"
              onClick={onClose}
              variant="outlined"
              disabled={busy}
              sx={{
                minWidth: { xs: "100%", sm: 130 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Cerrar
            </Button>

            <Button
              type="button"
              onClick={onAccept}
              variant="contained"
              disabled={busy || !canSubmit || termsLoading || !!termsError}
              startIcon={<CheckCircleRoundedIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 160 },
                height: 44,
                borderRadius: 2,
                fontWeight: 900,
              }}
            >
              {busy ? "Guardando..." : "Aceptar"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

const sectionSx = {
  mt: 3,
};

const sectionTitleSx = {
  mb: 1.2,
  fontSize: { xs: 16, sm: 18 },
  fontWeight: 900,
  color: "text.primary",
  lineHeight: 1.3,
};

const paragraphSx = {
  mb: 1.4,
  fontSize: { xs: 14, sm: 15 },
  lineHeight: 1.65,
  color: "text.secondary",
};

const listSx = {
  mt: 0.5,
  mb: 1.6,
  pl: 3,
};

const listItemSx = {
  mb: 0.8,
  fontSize: { xs: 14, sm: 15 },
  lineHeight: 1.55,
  color: "text.secondary",
};