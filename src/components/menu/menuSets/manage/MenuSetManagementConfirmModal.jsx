
import {
  Box, Button, Card, CardContent, CircularProgress, Dialog,
  DialogContent, DialogTitle, IconButton, Stack, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

export default function MenuSetManagementConfirmModal({
  open,
  onClose,
  onConfirm,
  managementMode,
  saving = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMassImport = managementMode === "mass_import";

  if (!open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
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
      {/* Encabezado negro */}
      <DialogTitle sx={{
        px: { xs: 2, sm: 3 },
        py: 2,
        bgcolor: "#111111",
        color: "#fff",
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontWeight: 800,
              fontSize: { xs: 20, sm: 24 },
              lineHeight: 1.2,
              color: "#fff",
            }}>
              Confirmar cambio de administración
            </Typography>

            <Typography sx={{
              mt: 0.5,
              fontSize: 13,
              color: "rgba(255,255,255,0.82)",
            }}>
              Revisa la modalidad seleccionada antes de guardar los cambios.
            </Typography>
          </Box>

          <IconButton
            aria-label="Cerrar"
            onClick={onClose}
            disabled={saving}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* Fondo del modal: sin espacio superior */}
      <DialogContent sx={{
        px: { xs: 2, sm: 3 },
        pt: "0 !important",
        pb: { xs: 2, sm: 3 },
        bgcolor: "background.default",
      }}>
        {/* Contenedor blanco desde el inicio del contenido */}
        <Card sx={{
          borderRadius: 0,
          backgroundColor: "background.paper",
        }}>
          <CardContent sx={{
            p: { xs: 2, sm: 3 },
            "&:last-child": { pb: { xs: 2, sm: 3 } },
          }}>
            <Stack spacing={2.5}>
              <Typography sx={{
                fontWeight: 800,
                fontSize: { xs: 18, sm: 20 },
                color: "text.primary",
              }}>
                {isMassImport
                  ? "Activar importación masiva"
                  : "Activar administración manual"}
              </Typography>

              <Stack spacing={2}>
                <Typography sx={{
                  fontSize: 14,
                  color: "text.primary",
                  lineHeight: 1.6,
                }}>
                  {isMassImport
                    ? "Este conjunto pasará a administración masiva. Puedes realizar el cambio cualquier día, independientemente del día de actualización seleccionado."
                    : "Este conjunto pasará a administración manual. Se utilizará la configuración efectiva correspondiente y se conservará el historial de publicaciones."}
                </Typography>

                <Box sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.default",
                }}>
                  <Typography sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    lineHeight: 1.6,
                  }}>
                    {isMassImport
                      ? "La configuración manual se conservará como respaldo hasta que exista una publicación masiva aplicable."
                      : "El regreso a manual está sujeto a la compatibilidad de las publicaciones, operaciones y capacidades comprometidas."}
                  </Typography>
                </Box>

                <Typography sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.55,
                }}>
                  {isMassImport
                    ? "El día de actualización regulará los cambios estructurales posteriores. La publicación de archivos seguirá sus propias reglas comerciales y operativas."
                    : "Las publicaciones históricas no se eliminarán al cambiar de modalidad."}
                </Typography>
              </Stack>

              {/* Acciones */}
              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
                pt={1}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={onClose}
                  disabled={saving}
                  sx={{
                    minWidth: { xs: "100%", sm: 150 },
                    height: 44,
                    borderRadius: 2,
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  onClick={onConfirm}
                  disabled={saving}
                  startIcon={saving
                    ? <CircularProgress size={18} color="inherit" />
                    : <SaveOutlinedIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 180 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {saving ? "Guardando…" : "Confirmar cambio"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}