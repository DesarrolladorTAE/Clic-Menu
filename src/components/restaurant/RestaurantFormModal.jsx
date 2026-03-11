import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField,
  Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";

import {
  createRestaurant,
  updateRestaurant,
} from "../../services/restaurant/restaurant.service";

export default function RestaurantFormModal({
  open,
  mode = "create",
  restaurant = null,
  onClose,
  onSaved,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isEdit = mode === "edit";
  const title = isEdit ? "Editar restaurante" : "Registrar restaurante";

  const [serverMsg, setServerMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const defaults = useMemo(
    () => ({
      trade_name: restaurant?.trade_name ?? "",
      description: restaurant?.description ?? "",
      contact_phone: restaurant?.contact_phone ?? "",
      contact_email: restaurant?.contact_email ?? "",
    }),
    [restaurant]
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: defaults,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!open) return;
    setServerMsg("");
    clearErrors();
    reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaults]);

  const mapBackendErrors = (e) => {
    const data = e?.response?.data;
    const bag = data?.errors;

    if (bag && typeof bag === "object") {
      Object.entries(bag).forEach(([field, arr]) => {
        const first = Array.isArray(arr) ? arr[0] : String(arr);
        setError(field, { type: "server", message: first });
      });
      setServerMsg("");
      return;
    }

    setServerMsg(data?.message || "No se pudo guardar. Intenta de nuevo.");
  };

  const onSubmit = async (values) => {
    setServerMsg("");
    setBusy(true);

    try {
      let payload;

      if (isEdit) {
        const rid = restaurant?.id;
        payload = await updateRestaurant(rid, values);
      } else {
        payload = await createRestaurant(values);
      }

      onSaved?.(payload);
      onClose?.();
    } catch (e) {
      if (e?.response?.status === 422) {
        mapBackendErrors(e);
      } else {
        setServerMsg(e?.response?.data?.message || "No se pudo guardar.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
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
              {isEdit
                ? "Actualiza la información general del restaurante."
                : "Registra un nuevo restaurante para comenzar su configuración."}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={busy}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 2,
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
        <Stack spacing={2.5}>
          {serverMsg && (
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
                <Typography variant="body2">{serverMsg}</Typography>
              </Box>
            </Alert>
          )}

          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 0,
              bgcolor: "background.paper",
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <Stack spacing={2}>
                <FieldBlock
                  label="Nombre comercial"
                  input={
                    <TextField
                      {...register("trade_name")}
                      placeholder="Ej. Restaurante Ensigna"
                      error={!!errors.trade_name}
                      helperText={errors.trade_name?.message || " "}
                    />
                  }
                />

                <FieldBlock
                  label="Descripción"
                  input={
                    <TextField
                      {...register("description")}
                      placeholder="Describe brevemente tu restaurante"
                      error={!!errors.description}
                      helperText={errors.description?.message || " "}
                      multiline
                      minRows={3}
                    />
                  }
                />

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <FieldBlock
                    label="Teléfono"
                    input={
                      <TextField
                        {...register("contact_phone")}
                        placeholder="Ej. 5512345678"
                        inputMode="tel"
                        error={!!errors.contact_phone}
                        helperText={errors.contact_phone?.message || " "}
                      />
                    }
                  />

                  <FieldBlock
                    label="Correo electrónico"
                    input={
                      <TextField
                        {...register("contact_email")}
                        type="email"
                        placeholder="correo@ejemplo.com"
                        inputMode="email"
                        error={!!errors.contact_email}
                        helperText={errors.contact_email?.message || " "}
                      />
                    }
                  />
                </Stack>

                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  justifyContent="space-between"
                  spacing={1.5}
                  pt={1}
                >
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="outlined"
                    disabled={busy}
                    sx={{
                      minWidth: { xs: "100%", sm: 140 },
                      height: 44,
                      borderRadius: 2,
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={busy || (isEdit && !isDirty)}
                    startIcon={isEdit ? <SaveIcon /> : <AddBusinessIcon />}
                    sx={{
                      minWidth: { xs: "100%", sm: 180 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    {busy ? "Guardando..." : isEdit ? "Guardar cambios" : "Guardar"}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({ label, input }) {
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
    </Box>
  );
}