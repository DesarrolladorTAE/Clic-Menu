import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Chip, Paper, Stack, TextField, Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";

import { handleFormApiError } from "../../../utils/useFormApiHandler";

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

function SectionTitle({ title }) {
  return (
    <Typography
      sx={{
        fontSize: 15,
        fontWeight: 800,
        color: "primary.main",
        pt: 0.5,
      }}
    >
      {title}
    </Typography>
  );
}

export default function TaeAccountCard({
  restaurant,
  account,
  onSave,
  onDelete,
  showToast,
}) {
  const [saving, setSaving] = useState(false);

  const isEditMode = !!account?.id;
  const isConnected = !!account?.is_connected;

  const defaultValues = useMemo(
    () => ({
      email: account?.email || "",
      password: account?.password || "",
    }),
    [account]
  );

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const submit = async (form) => {
    setSaving(true);

    try {
      const payload = {
        email: String(form.email || "").trim(),
        password: String(form.password || ""),
      };

      const response = await onSave(payload);

      if (showToast) {
        showToast(
          response?.message ||
            (isEditMode
              ? "Conexión de Taeconta actualizada correctamente."
              : "Cuenta de Taeconta vinculada correctamente."),
          "success"
        );
      }
    } catch (e) {
      const handled = handleFormApiError(e, setError, {
        onMessage: (msg) => {
          if (showToast) showToast(msg, "error");
        },
      });

      if (!handled && showToast) {
        showToast(
          e?.response?.data?.message ||
            e?.message ||
            "No se pudo guardar la cuenta de Taeconta.",
          "error"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Cuenta y credenciales
            </Typography>

            <Chip
              label={
                isConnected
                  ? "Conectada"
                  : isEditMode
                  ? "Guardada sin conexión"
                  : "Sin cuenta"
              }
              size="small"
              color={isConnected ? "success" : "default"}
              variant={isConnected ? "filled" : "outlined"}
            />
          </Stack>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Captura las credenciales de Taeconta para{" "}
            {restaurant?.trade_name || "este restaurante"}.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <form onSubmit={handleSubmit(submit)}>
          <Stack spacing={2.5}>
            <SectionTitle title="Acceso Taeconta" />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FieldBlock
                label="Correo"
                input={
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "El correo es obligatorio.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Captura un correo válido.",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        disabled={saving}
                        placeholder="correo@taeconta.com"
                        autoComplete="username"
                      />
                    )}
                  />
                }
                help="Debe ser el correo con el que accedes a Taeconta."
                error={errors?.email?.message}
              />

              <FieldBlock
                label="Contraseña"
                input={
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: "La contraseña es obligatoria.",
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        disabled={saving}
                        placeholder="Contraseña de Taeconta"
                        type="password"
                        autoComplete="current-password"
                      />
                    )}
                  />
                }
                help={
                  isEditMode
                    ? "Si actualizas las credenciales, el sistema volverá a validar la conexión."
                    : "Se usará únicamente para validar la conexión con Taeconta."
                }
                error={errors?.password?.message}
              />
            </Stack>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: "1px solid",
                borderColor: isConnected ? "#B8E2C3" : "#F3D48B",
                backgroundColor: isConnected ? "#EAF8EE" : "#FFF7E8",
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#fff",
                    color: isConnected ? "success.main" : "#A75A00",
                    flexShrink: 0,
                  }}
                >
                  <LinkOutlinedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: isConnected ? "#1D6B2A" : "#8A5A00",
                    }}
                  >
                    {isConnected ? "Conexión validada" : "Conexión pendiente"}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: 13,
                      color: isConnected ? "#1D6B2A" : "#8A5A00",
                      lineHeight: 1.45,
                    }}
                  >
                    {isConnected
                      ? "Los datos fiscales ya fueron obtenidos desde Taeconta."
                      : "Guarda credenciales válidas para obtener el RFC, razón social, régimen fiscal e indicadores de la cuenta."}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              justifyContent="flex-end"
              spacing={1.5}
              pt={1}
            >
              {isEditMode ? (
                <Button
                  type="button"
                  onClick={onDelete}
                  disabled={saving}
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 180 },
                    height: 44,
                    fontWeight: 800,
                  }}
                >
                  Eliminar cuenta
                </Button>
              ) : null}

              <Button
                type="submit"
                disabled={saving}
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 210 },
                  height: 44,
                  fontWeight: 800,
                }}
              >
                {saving
                  ? "Guardando…"
                  : isEditMode
                  ? "Actualizar conexión"
                  : "Guardar conexión"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Paper>
  );
}