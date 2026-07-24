import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography, useMediaQuery,
} from "@mui/material";

import { useMemo } from "react";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

export default function MenuActionDialog({
  open,
  type,
  menu,
  loading = false,
  onClose,
  onConfirm,
}) {
  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down("sm")
  );

  const isArchive =
    type === "archive";

  const archiveRestrictions =
    useMemo(() => {
      if (!menu || !isArchive) {
        return [];
      }

      const restrictions = [];

      if (
        menu?.administration
          ?.has_open_orders
      ) {
        restrictions.push(
          "El menú tiene órdenes abiertas."
        );
      }

      const enabledChannels =
        Number(
          menu?.channel_configuration
            ?.enabled_channels_count || 0
        );

      if (enabledChannels > 0) {
        restrictions.push(
          enabledChannels === 1
            ? "El menú todavía está habilitado en un canal de venta."
            : `El menú todavía está habilitado en ${enabledChannels} canales de venta.`
        );
      }

      const defaultChannels =
        Number(
          menu?.channel_configuration
            ?.default_channels_count || 0
        );

      if (defaultChannels > 0) {
        restrictions.push(
          defaultChannels === 1
            ? "El menú todavía es predeterminado en un canal."
            : `El menú todavía es predeterminado en ${defaultChannels} canales.`
        );
      }

      if (
        menu?.administration
          ?.can_archive === false &&
        restrictions.length === 0
      ) {
        restrictions.push(
          "La configuración actual del menú no permite archivarlo."
        );
      }

      return restrictions;
    }, [menu, isArchive]);

  const archiveBlocked =
    isArchive &&
    archiveRestrictions.length > 0;

  const title = isArchive
    ? archiveBlocked
      ? "No se puede archivar"
      : "Archivar menú"
    : "Activar menú";

  const confirmLabel = isArchive
    ? "Archivar"
    : "Activar";

  if (!open || !menu) return null;

  return (
    <Dialog
      open={open}
      onClose={
        loading ? undefined : onClose
      }
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            borderRadius: {
              xs: 0,
              sm: 1,
            },
            overflow: "hidden",
            backgroundColor:
              "background.paper",
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
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: {
                  xs: 20,
                  sm: 24,
                },
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color:
                  "rgba(255,255,255,0.82)",
              }}
            >
              Menú: {menu.name}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={loading}
            sx={{
              color: "#fff",
              bgcolor:
                "rgba(255,255,255,0.08)",
              "&:hover": {
                bgcolor:
                  "rgba(255,255,255,0.16)",
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
          bgcolor:
            "background.default",
        }}
      >
        <Card
          sx={{
            borderRadius: 1,
            backgroundColor:
              "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 3 },
            }}
          >
            <Stack spacing={2.5}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: archiveBlocked
                      ? "rgba(237, 108, 2, 0.12)"
                      : "rgba(255, 152, 0, 0.12)",
                    color: archiveBlocked
                      ? "warning.main"
                      : "primary.main",
                    flexShrink: 0,
                  }}
                >
                  {archiveBlocked ? (
                    <WarningAmberOutlinedIcon />
                  ) : isArchive ? (
                    <ArchiveOutlinedIcon />
                  ) : (
                    <CheckCircleOutlineOutlinedIcon />
                  )}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 800,
                      color:
                        "text.primary",
                    }}
                  >
                    {archiveBlocked
                      ? "Este menú todavía tiene dependencias"
                      : isArchive
                      ? "El menú dejará de estar disponible"
                      : "El menú será validado antes de activarse"}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.75,
                      fontSize: 14,
                      color:
                        "text.secondary",
                      lineHeight: 1.6,
                    }}
                  >
                    {archiveBlocked
                      ? "Corrige las siguientes restricciones antes de volver a intentarlo."
                      : isArchive
                      ? "Después de archivarlo ya no podrás modificar su información, contenido ni canales."
                      : "Se comprobará que el menú tenga contenido válido y canales compatibles."}
                  </Typography>
                </Box>
              </Stack>

              {archiveBlocked ? (
                <Stack spacing={1}>
                  {archiveRestrictions.map(
                    (restriction) => (
                      <Box
                        key={restriction}
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          border:
                            "1px solid",
                          borderColor:
                            "warning.light",
                          bgcolor:
                            "rgba(237, 108, 2, 0.06)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 13,
                            color:
                              "warning.dark",
                            fontWeight: 700,
                            lineHeight: 1.5,
                          }}
                        >
                          {restriction}
                        </Typography>
                      </Box>
                    )
                  )}
                </Stack>
              ) : (
                <Box>
                  <Chip
                    label={
                      isArchive
                        ? "Acción definitiva"
                        : "Validación automática"
                    }
                    color={
                      isArchive
                        ? "warning"
                        : "primary"
                    }
                    size="small"
                  />
                </Box>
              )}

              <Stack
                direction={{
                  xs: "column-reverse",
                  sm: "row",
                }}
                justifyContent="flex-end"
                spacing={1.5}
                pt={1}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={onClose}
                  disabled={loading}
                  sx={{
                    minWidth: {
                      xs: "100%",
                      sm: 150,
                    },
                    height: 44,
                  }}
                >
                  {archiveBlocked
                    ? "Cerrar"
                    : "Cancelar"}
                </Button>

                {!archiveBlocked ? (
                  <Button
                    type="button"
                    variant="contained"
                    color={
                      isArchive
                        ? "warning"
                        : "primary"
                    }
                    onClick={onConfirm}
                    disabled={loading}
                    startIcon={
                      isArchive ? (
                        <ArchiveOutlinedIcon />
                      ) : (
                        <CheckCircleOutlineOutlinedIcon />
                      )
                    }
                    sx={{
                      minWidth: {
                        xs: "100%",
                        sm: 180,
                      },
                      height: 44,
                      fontWeight: 800,
                    }}
                  >
                    {loading
                      ? "Procesando…"
                      : confirmLabel}
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}