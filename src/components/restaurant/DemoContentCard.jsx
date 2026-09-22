import { useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogContent,
  DialogTitle, IconButton, Stack, Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { alpha, useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";

export default function DemoContentCard({
  branch,
  eliminando = false,
  onConfirmDelete,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [modalOpen, setModalOpen] = useState(false);

  if (!branch) {
    return null;
  }

  const handleClose = () => {
    if (eliminando) {
      return;
    }

    setModalOpen(false);
  };

  const handleConfirm = async () => {
    if (eliminando) {
      return;
    }

    const eliminado = await onConfirmDelete?.(branch);

    if (eliminado) {
      setModalOpen(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          mt: { xs: 5, md: 0 },
          borderRadius: 1,
          border: "1px solid",
          borderColor: alpha(theme.palette.secondary.main, 0.28),
          bgcolor: alpha(theme.palette.secondary.main, 0.08),
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.25, sm: 2.75, md: 3 },
            "&:last-child": {
              pb: { xs: 2.25, sm: 2.75, md: 3 },
            },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={{ xs: 2.5, md: 3 }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 19, sm: 21 },
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.2,
                  }}
                >
                  Contenido de demostración
                </Typography>

                <Chip
                  label="DATOS DE EJEMPLO"
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.secondary.main, 0.16),
                    color: "secondary.dark",
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  mt: 0.8,
                  color: "text.secondary",
                  fontSize: 14,
                  lineHeight: 1.55,
                  maxWidth: 720,
                }}
              >
                La sucursal <strong>{branch.name || "seleccionada"}</strong> conserva productos
                y datos de ejemplo creados automáticamente por Clic Menu. Cuando ya no los
                necesites, puedes retirarlos de forma controlada sin eliminar la sucursal ni
                tus productos propios.
              </Typography>
            </Box>

            <Box sx={{ flexShrink: 0, alignSelf: { xs: "flex-end", md: "center" } }}>
              <Tooltip title="Eliminar contenido de demostración">
                <span>
                  <IconButton
                    onClick={() => setModalOpen(true)}
                    disabled={eliminando}
                    aria-label="Eliminar contenido de demostración"
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 1.5,
                      bgcolor: "secondary.main",
                      color: "secondary.contrastText",
                      "&:hover": {
                        bgcolor: "secondary.dark",
                      },
                      "&.Mui-disabled": {
                        bgcolor: "action.disabledBackground",
                        color: "action.disabled",
                      },
                    }}
                  >
                    {eliminando
                      ? <CircularProgress size={19} color="inherit" />
                      : <DeleteSweepOutlinedIcon fontSize="small" />
                    }
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={modalOpen}
        onClose={eliminando ? undefined : handleClose}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              borderRadius: { xs: 0, sm: 1 },
              overflow: "hidden",
              bgcolor: "background.paper",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            bgcolor: "#111111",
            color: "#FFFFFF",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography
              sx={{
                fontSize: { xs: 20, sm: 23 },
                fontWeight: 800,
                lineHeight: 1.2,
                color: "#FFFFFF",
              }}
            >
              Eliminar contenido de demostración
            </Typography>

            <IconButton
              onClick={handleClose}
              disabled={eliminando}
              sx={{
                color: "#FFFFFF",
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
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 1,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: 16, sm: 17 },
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.5,
                  }}
                >
                  ¿Estás seguro de eliminar el contenido demo?
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 14,
                    color: "text.secondary",
                    lineHeight: 1.6,
                  }}
                >
                  La sucursal <strong>{branch.name || `#${branch.id}`}</strong> no será eliminada.
                  Tus productos y configuraciones creados posteriormente también se conservarán.
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="space-between"
                spacing={1.5}
                pt={0.5}
              >
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  disabled={eliminando}
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    minWidth: { sm: 140 },
                    height: 44,
                    borderRadius: 2,
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={handleConfirm}
                  disabled={eliminando}
                  startIcon={
                    eliminando
                      ? <CircularProgress size={18} color="inherit" />
                      : <DeleteSweepOutlinedIcon />
                  }
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    minWidth: { sm: 220 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {eliminando ? "Eliminando..." : "Sí, eliminar contenido"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}