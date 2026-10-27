import React from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogContent,
  DialogTitle, IconButton, Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import StickyNote2RoundedIcon from "@mui/icons-material/StickyNote2Rounded";

export default function NoteEditorModal({
  open,
  item,
  value,
  setValue,
  onClose,
  onSave,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const productName = String(
    item?.display_name ||
    item?.product_name ||
    item?.name ||
    "Producto"
  ).trim();

  const variantName = String(item?.variant_name || "").trim();
  const currentValue = String(value ?? "");

  const handleSave = () => {
    onSave?.(currentValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      aria-labelledby="cm-note-dialog-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            bgcolor: "background.paper",
            maxHeight: { xs: "100dvh", sm: "90dvh" },
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
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              id="cm-note-dialog-title"
              sx={{
                fontSize: { xs: 20, sm: 24 },
                fontWeight: 800,
                lineHeight: 1.2,
                color: "#FFFFFF",
              }}
            >
              Nota del producto
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              Agrega o modifica las indicaciones de este producto.
            </Typography>
          </Box>

          <IconButton
            type="button"
            onClick={onClose}
            aria-label="Cerrar nota del producto"
            sx={{
              flexShrink: 0,
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

      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          pt: 0,
          pb: { xs: 2, sm: 3 },
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          "&.MuiDialogContent-root": { pt: 0 },
        }}
      >
        <Card
          sx={{
            flex: "1 0 auto",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            minWidth: 0,
            borderRadius: 0,
            boxShadow: "none",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
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
                <Typography
                  sx={{
                    fontSize: { xs: 18, sm: 21 },
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.3,
                    overflowWrap: "anywhere",
                  }}
                >
                  {productName}
                </Typography>

                {variantName && !productName.includes(variantName) ? (
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 13,
                      color: "text.secondary",
                      overflowWrap: "anywhere",
                    }}
                  >
                    Variante: <strong>{variantName}</strong>
                  </Typography>
                ) : null}
              </Box>

              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
                  <StickyNote2RoundedIcon sx={{ fontSize: 20, color: "#C2410C" }} />

                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "text.primary",
                    }}
                  >
                    Indicaciones del producto
                  </Typography>
                </Stack>

                <TextField
                  fullWidth
                  multiline
                  minRows={5}
                  maxRows={9}
                  value={currentValue}
                  onChange={(event) => setValue?.(event.target.value)}
                  placeholder="Ej. Sin cebolla, poco chile, separado, bien cocido..."
                  autoFocus={!isMobile}
                  inputProps={{ maxLength: 500 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      alignItems: "flex-start",
                      borderRadius: 1.5,
                      bgcolor: "#FFFFFF",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: 14,
                      lineHeight: 1.6,
                    },
                  }}
                />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                  sx={{ mt: 1 }}
                >
                  <Typography
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 12,
                      color: "text.secondary",
                      lineHeight: 1.45,
                    }}
                  >
                    Estas indicaciones se guardarán únicamente en este producto.
                  </Typography>

                  <Typography
                    sx={{
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "text.secondary",
                    }}
                  >
                    {currentValue.length}/500
                  </Typography>
                </Stack>
              </Box>

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
                sx={{ pt: 1 }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={onClose}
                  sx={{
                    minWidth: { xs: "100%", sm: 150 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 700,
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  startIcon={<SaveRoundedIcon />}
                  onClick={handleSave}
                  sx={{
                    minWidth: { xs: "100%", sm: 180 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Guardar nota
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}