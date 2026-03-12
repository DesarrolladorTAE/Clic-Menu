import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

export default function ChannelProductConfigModal({
  open,
  onClose,
  onSave,
  saving = false,
  channelName = "",
  branchLabel = "",
  editing = null,
  initialForm = { is_enabled: false, price: "" },
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!open) return;
    setForm(initialForm);
  }, [open, initialForm]);

  if (!open) return null;

  const productName = editing?.product?.name || "Producto";

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
                fontSize: { xs: 19, sm: 22 },
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              Configurar producto
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              {productName} · {channelName || "Canal"} · {branchLabel}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={saving}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
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
        <Card
          sx={{
            borderRadius: 0,
            backgroundColor: "background.paper",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography sx={fieldLabelSx}>Estado en el canal</Typography>

                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Checkbox
                      checked={!!form.is_enabled}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          is_enabled: e.target.checked,
                          price: e.target.checked ? prev.price : "",
                        }))
                      }
                      sx={{
                        color: "primary.main",
                        "&.Mui-checked": {
                          color: "primary.main",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "text.primary",
                      }}
                    >
                      {form.is_enabled ? "Activo en este canal" : "No activo en este canal"}
                    </Typography>
                  }
                />
              </Box>

              <Box>
                <Typography sx={fieldLabelSx}>Precio (MXN)</Typography>

                <TextField
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                  placeholder="Ej. 30"
                  disabled={!form.is_enabled}
                  inputProps={{ inputMode: "decimal" }}
                  helperText={
                    form.is_enabled
                      ? "Obligatorio cuando el producto está activo."
                      : "Si está desactivado, el precio no se usa."
                  }
                />
              </Box>

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
              >
                <Button
                  onClick={onClose}
                  disabled={saving}
                  variant="outlined"
                  sx={{
                    minWidth: { xs: "100%", sm: 140 },
                    height: 44,
                    borderRadius: 2,
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  onClick={() => onSave(form)}
                  disabled={saving}
                  variant="contained"
                  startIcon={<SaveIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 170 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {saving ? "Guardando…" : "Guardar"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};