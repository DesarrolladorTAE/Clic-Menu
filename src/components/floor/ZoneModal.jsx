import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { handleFormApiError } from "../../utils/useFormApiHandler";
import { createZone, updateZone } from "../../services/floor/zones.service";

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

function FieldError({ message }) {
  if (!message) return null;

  return (
    <Typography
      sx={{
        mt: 0.75,
        fontSize: 12,
        color: "error.main",
        fontWeight: 700,
        lineHeight: 1.4,
      }}
    >
      {message}
    </Typography>
  );
}

function HelperNote({ children }) {
  if (!children) return null;

  return (
    <Typography
      sx={{
        mt: 0.75,
        fontSize: 12,
        color: "text.secondary",
        lineHeight: 1.45,
      }}
    >
      {children}
    </Typography>
  );
}

function FieldBlock({ label, input, help, error }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
          mb: 1,
        }}
      >
        {label}
      </Typography>

      {input}

      {help ? <HelperNote>{help}</HelperNote> : null}
      <FieldError message={error} />
    </Box>
  );
}

export default function ZoneModal({
  open,
  mode = "create",
  restaurantId,
  branchId,
  initialData = null,
  onClose,
  onSaved,
  showToast,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo(
    () => ({
      name: initialData?.name ?? "",
    }),
    [initialData]
  );

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
  }, [open, reset, defaultValues]);

  if (!open) return null;

  const title = mode === "create" ? "Nueva zona" : "Editar zona";

  const onSubmit = async (form) => {
    setSaving(true);
    try {
      const payload = { name: (form.name || "").trim() };

      const saved =
        mode === "create"
          ? await createZone(restaurantId, branchId, payload)
          : await updateZone(restaurantId, branchId, initialData.id, payload);

      if (showToast) {
        showToast(
          mode === "create" ? "Zona creada." : "Zona actualizada.",
          "success"
        );
      }

      if (onSaved) onSaved(saved);
      onClose();
    } catch (e) {
      const handled = handleFormApiError(e, setError, {
        onMessage: (msg) => (showToast ? showToast(msg, "error") : alert(msg)),
      });

      if (!handled) {
        const msg = e?.response?.data?.message || e?.message || "No se pudo guardar";
        if (showToast) showToast(msg, "error");
        else alert(msg);
      }
    } finally {
      setSaving(false);
    }
  };

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
                fontSize: { xs: 20, sm: 24 },
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
                color: "rgba(255,255,255,0.82)",
              }}
            >
              Las zonas representan áreas físicas como terraza, balcón o salón principal.
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card
            sx={{
              borderRadius: 0,
              backgroundColor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2.5}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: 18, sm: 20 },
                    color: "text.primary",
                  }}
                >
                  Datos de la zona
                </Typography>

                <FieldBlock
                  label="Nombre de la zona"
                  input={
                    <TextField
                      fullWidth
                      {...register("name")}
                      placeholder='Ej. "Terraza"'
                    />
                  }
                  help="No se permiten nombres duplicados dentro de la misma sucursal."
                  error={errors?.name?.message}
                />

                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  justifyContent="flex-end"
                  spacing={1.5}
                  pt={1}
                >
                  <Button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    variant="outlined"
                    sx={{
                      minWidth: { xs: "100%", sm: 150 },
                      height: 44,
                      borderRadius: 2,
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    disabled={saving}
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{
                      minWidth: { xs: "100%", sm: 180 },
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
        </form>
      </DialogContent>
    </Dialog>
  );
}