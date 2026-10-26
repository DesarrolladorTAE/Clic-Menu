//src/components/menu/shared/menu-sets/MenuSetNotesModal.jsx
import React from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogContent,
  DialogTitle, IconButton, Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { alpha, darken, useTheme } from "@mui/material/styles";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

function getSafeColor(theme, color) {
  if (/^#[0-9A-Fa-f]{6}$/.test(String(color || ""))) return color;
  const primary = theme.palette.primary.main;
  return /^#[0-9A-Fa-f]{6}$/.test(primary) ? primary : "#FF7A00";
}

export default function MenuSetNotesModal({
  open = false,
  productName = "",
  value = "",
  onChange,
  onClose,
  onSave,
  themeColor,
  readOnly = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const color = getSafeColor(theme, themeColor);
  const notes = String(value ?? "");

  const handleChange = (event) => {
    if (readOnly) return;
    onChange?.(event.target.value.slice(0, 500));
  };

  const handleSave = () => {
    if (readOnly) return;
    onSave?.();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      aria-labelledby="cm-menu-set-notes-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            backgroundColor: "background.paper",
            display: "flex",
            flexDirection: "column",
            maxHeight: { xs: "100dvh", sm: "calc(100dvh - 40px)" },
          },
        },
      }}
    >
      {/* Encabezado negro */}
      <DialogTitle
        id="cm-menu-set-notes-title"
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: "#111111",
          color: "#FFFFFF",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontWeight: 800, fontSize: { xs: 20, sm: 24 },
              lineHeight: 1.2, color: "#FFFFFF", overflowWrap: "anywhere",
            }}>
              Indicaciones del producto
            </Typography>

            {productName ? (
              <Typography sx={{
                mt: 0.5, fontSize: 13,
                color: "rgba(255,255,255,0.82)",
                overflowWrap: "anywhere",
              }}>
                {productName}
              </Typography>
            ) : null}
          </Box>

          <IconButton
            type="button"
            onClick={onClose}
            aria-label="Cerrar indicaciones del producto"
            sx={{
              width: 40, height: 40, flexShrink: 0,
              color: "#FFFFFF",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* Fondo exterior gris, como en el modal de cajas */}
      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "background.default",
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          flex: "1 1 auto",
        }}
      >
        {/* Contenedor blanco: campos y botones pertenecen a la misma tarjeta */}
        <Card
          sx={{
            width: "100%",
            borderRadius: 0,
            bgcolor: "background.paper",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 3 },
              "&:last-child": { pb: { xs: 2, sm: 3 } },
            }}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography sx={{
                  fontWeight: 800, fontSize: { xs: 18, sm: 20 },
                  color: "text.primary",
                }}>
                  Indicaciones especiales
                </Typography>

                <Typography sx={{
                  mt: 0.75, fontSize: 13,
                  color: "text.secondary", lineHeight: 1.5,
                }}>
                  Escribe cualquier indicación que deba considerarse al preparar este producto.
                </Typography>
              </Box>

              <Box sx={{ width: "100%", minWidth: 0 }}>
                <TextField
                  multiline
                  fullWidth
                  variant="outlined"
                  minRows={5}
                  maxRows={10}
                  value={notes}
                  onChange={handleChange}
                  disabled={readOnly}
                  inputProps={{
                    maxLength: 500,
                    "aria-label": "Indicaciones especiales del producto",
                  }}
                  placeholder="Ej. Sin cebolla, salsa aparte, poco picante..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "background.default",
                      borderRadius: 1,
                      alignItems: "flex-start",
                      "& fieldset": { borderColor: "divider" },
                      "&:hover fieldset": { borderColor: alpha(color, 0.5) },
                      "&.Mui-focused fieldset": { borderColor: color, borderWidth: 2 },
                    },
                    "& .MuiInputBase-inputMultiline": {
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "text.primary",
                    },
                  }}
                />

                <Typography sx={{
                  mt: 0.75,
                  fontSize: 11.5,
                  color: "text.secondary",
                  textAlign: "right",
                }}>
                  {notes.length} / 500 caracteres
                </Typography>
              </Box>

              {/* Botones dentro del contenedor blanco */}
              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
                pt={1}
              >
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outlined"
                  sx={{
                    minWidth: { xs: "100%", sm: 150 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                    textTransform: "none",
                    color,
                    borderColor: color,
                    "&:hover": {
                      borderColor: color,
                      bgcolor: alpha(color, 0.07),
                    },
                  }}
                >
                  {readOnly ? "Cerrar" : "Cancelar"}
                </Button>

                {!readOnly ? (
                  <Button
                    type="button"
                    onClick={handleSave}
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    sx={{
                      minWidth: { xs: "100%", sm: 180 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                      textTransform: "none",
                      color: "#FFFFFF",
                      bgcolor: color,
                      boxShadow: `0 5px 15px ${alpha(color, 0.2)}`,
                      "&:hover": {
                        bgcolor: darken(color, 0.12),
                        boxShadow: `0 6px 18px ${alpha(color, 0.25)}`,
                      },
                    }}
                  >
                    Guardar nota
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