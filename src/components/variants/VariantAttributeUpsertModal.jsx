import { useEffect, useMemo, useState } from "react";

import {
  Alert, Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton,
  Stack, Switch, TextField, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";

import {
  createVariantAttribute,
  updateVariantAttribute,
} from "../../services/products/variants/variantAttributes.service";

function normalizeErr(e) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors).flat().join("\n")
      : "") ||
    "Ocurrió un error"
  );
}

export default function VariantAttributeUpsertModal({
  open,
  onClose,
  restaurantId,
  editing,
  onSaved,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isEdit = !!editing?.id;

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    name: "",
    status: "active",
  });

  const title = useMemo(
    () => (isEdit ? "Editar atributo" : "Crear atributo"),
    [isEdit]
  );

  useEffect(() => {
    if (!open) return;

    setErr("");
    setForm({
      name: editing?.name || "",
      status: editing?.status || "active",
    });
  }, [open, editing]);


  useEffect(() => {
    if (!err) return;

    const timer = setTimeout(() => {
        setErr("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [err]);


  const handleSave = async () => {
    setErr("");

    const name = form.name.trim();

    if (!name) {
      setErr("Escribe el nombre del atributo.");
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        await updateVariantAttribute(restaurantId, editing.id, {
          name,
          status: form.status,
        });
      } else {
        await createVariantAttribute(restaurantId, {
          name,
          status: form.status,
        });
      }

      await onSaved?.();
    } catch (e) {
      setErr(normalizeErr(e));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

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
              {isEdit
                ? "Actualiza el nombre y estado del atributo."
                : "Crea un nuevo atributo para organizar variantes."}
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
        <Stack spacing={2.5}>
          {err ? (
            <Alert
              severity="error"
              sx={{
                borderRadius: 1,
                alignItems: "flex-start",
                whiteSpace: "pre-line",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                  No se pudo completar la acción
                </Typography>
                <Typography variant="body2">{err}</Typography>
              </Box>
            </Alert>
          ) : null}

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
                  Datos del atributo
                </Typography>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "text.primary",
                      mb: 1,
                    }}
                  >
                    Nombre *
                  </Typography>

                  <TextField
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Ej. Tamaño"
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "text.primary",
                      mb: 1,
                    }}
                  >
                    Estado
                  </Typography>

                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Switch
                        checked={form.status === "active"}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            status: e.target.checked ? "active" : "inactive",
                          }))
                        }
                        color="primary"
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
                        {form.status === "active" ? "Activo" : "Inactivo"}
                      </Typography>
                    }
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="flex-end"
            spacing={1.5}
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
              type="button"
              onClick={handleSave}
              disabled={saving}
              variant="contained"
              startIcon={isEdit ? <SaveIcon /> : <AddIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {saving ? "Guardando…" : isEdit ? "Guardar" : "Crear atributo"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}