import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

export default function MenuFormDialog({
  open,
  menu = null,
  onClose,
  onSave,
  onError,
}) {
  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down("sm")
  );

  const isEdit = !!menu?.id;

  const [saving, setSaving] =
    useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    reset({
      name: menu?.name || "",
      description:
        menu?.description || "",
    });
  }, [open, menu, reset]);

  const applyBackendErrors = (
    error
  ) => {
    const backendErrors =
      error?.response?.data?.errors ||
      {};

    ["name", "description"].forEach(
      (field) => {
        const message =
          backendErrors?.[field]?.[0];

        if (message) {
          setError(field, {
            type: "server",
            message,
          });
        }
      }
    );
  };

  const submit = async (form) => {
    setSaving(true);

    try {
      await onSave({
        name: String(
          form.name || ""
        ).trim(),

        description:
          String(
            form.description || ""
          ).trim() || null,
      });
    } catch (error) {
      applyBackendErrors(error);

      const backendErrors =
        error?.response?.data?.errors ||
        {};

      const firstError =
        Object.values(
          backendErrors
        ).flat()?.[0];

      onError?.(
        error?.response?.data
          ?.message ||
          firstError ||
          error?.message ||
          "No se pudo guardar el menú."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={
        saving ? undefined : onClose
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
              {isEdit
                ? "Editar menú"
                : "Nuevo menú"}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color:
                  "rgba(255,255,255,0.82)",
              }}
            >
              {isEdit
                ? "Actualiza el nombre y la descripción del menú."
                : "Registra un nuevo menú para la sucursal seleccionada."}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={saving}
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
        <form
          onSubmit={handleSubmit(submit)}
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
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: {
                      xs: 18,
                      sm: 20,
                    },
                    color: "text.primary",
                  }}
                >
                  Datos del menú
                </Typography>

                <FieldBlock
                  label="Nombre *"
                  error={
                    errors?.name?.message
                  }
                  input={
                    <TextField
                      fullWidth
                      placeholder="Ej. Menú principal"
                      disabled={saving}
                      error={
                        !!errors?.name
                      }
                      {...register("name", {
                        required:
                          "El nombre del menú es obligatorio.",
                      })}
                    />
                  }
                />

                <FieldBlock
                  label="Descripción"
                  help="Describe brevemente cuándo o dónde se utilizará este menú."
                  error={
                    errors?.description
                      ?.message
                  }
                  input={
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      placeholder="Ej. Menú general disponible durante todo el día."
                      disabled={saving}
                      error={
                        !!errors?.description
                      }
                      {...register(
                        "description"
                      )}
                    />
                  }
                />

                {!isEdit ? (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor:
                        "divider",
                      bgcolor:
                        "background.default",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        color:
                          "text.secondary",
                        lineHeight: 1.55,
                      }}
                    >
                      El menú se creará en
                      estado{" "}
                      <Typography
                        component="span"
                        sx={{
                          fontSize: 13,
                          color:
                            "primary.main",
                          fontWeight: 800,
                        }}
                      >
                        Borrador
                      </Typography>
                      . Después podrás
                      configurar su contenido
                      y sus canales.
                    </Typography>
                  </Box>
                ) : null}

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
                    onClick={onClose}
                    disabled={saving}
                    variant="outlined"
                    sx={{
                      minWidth: {
                        xs: "100%",
                        sm: 150,
                      },
                      height: 44,
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    disabled={saving}
                    variant="contained"
                    startIcon={
                      <SaveOutlinedIcon />
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
                    {saving
                      ? "Guardando…"
                      : "Guardar"}
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

function FieldBlock({
  label,
  input,
  help,
  error,
}) {
  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
      }}
    >
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

      {help && !error ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {help}
        </Typography>
      ) : null}

      {error ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            color: "error.main",
            fontWeight: 700,
            lineHeight: 1.45,
          }}
        >
          {error}
        </Typography>
      ) : null}
    </Box>
  );
}