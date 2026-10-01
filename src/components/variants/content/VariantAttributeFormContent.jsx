import { useEffect, useState } from "react";

import {
  Box, Button, Card, CardContent, CircularProgress, FormControlLabel, Stack,
  Switch, TextField, Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";

import {
  createVariantAttribute,
  updateVariantAttribute,
} from "../../../services/products/variants/variantAttributes.service";

import PageContainer from "../../common/PageContainer";
import AppAlert from "../../common/AppAlert";
import { normalizeErr } from "../../../utils/err";

export default function VariantAttributeFormContent({
  restaurantId,
  productId,
  productName,
  editing = null,
  onBack,
  onSaved,
}) {
  const isEdit = !!editing?.id;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", status: "active" });

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const showAlert = ({ severity = "success", title = "", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    setForm({
      name: editing?.name || "",
      status: editing?.status || "active",
    });
  }, [editing]);

  const handleSave = async () => {
    const name = form.name.trim().replace(/\s+/g, " ");

    if (!name) {
      showAlert({
        severity: "warning",
        title: "Falta el nombre",
        message: "Escribe el nombre del atributo.",
      });
      return;
    }

    setSaving(true);

    try {
      let response;

      if (isEdit) {
        response = await updateVariantAttribute(
          restaurantId,
          productId,
          editing.id,
          { name, status: form.status }
        );
      } else {
        response = await createVariantAttribute(
          restaurantId,
          productId,
          { name, status: form.status }
        );
      }

      const savedAttribute = response?.data || null;

      showAlert({
        severity: "success",
        title: isEdit ? "Atributo actualizado" : "Atributo creado",
        message: isEdit
          ? "Los cambios se guardaron correctamente."
          : "El atributo se creó correctamente.",
      });

      await onSaved?.(savedAttribute);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "No se pudo guardar",
        message: normalizeErr(e, "No se pudo guardar el atributo."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer sx={{ py: 0, px: 0 }} innerSx={{ width: "100%" }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: 22, sm: 26 },
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            {isEdit ? "Editar atributo" : "Crear atributo"}
          </Typography>

          <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary", lineHeight: 1.5 }}>
            {isEdit
              ? `Actualiza el atributo${productName ? ` de ${productName}` : ""}.`
              : `Agrega un atributo para organizar las variantes${productName ? ` de ${productName}` : ""}.`}
          </Typography>
        </Box>

        <Card
          sx={{
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
            backgroundColor: "background.paper",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                  Datos del atributo
                </Typography>

                <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                  Cada producto puede tener uno o varios atributos, cada uno con sus propias opciones.
                </Typography>
              </Box>

              <Box>
                <Typography sx={labelSx}>Nombre</Typography>

                <TextField
                  fullWidth
                  value={form.name}
                  disabled={saving}
                  placeholder="Ej. Tamaño"
                  inputProps={{ maxLength: 120 }}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !saving) handleSave();
                  }}
                />
              </Box>

              <Box>
                <Typography sx={labelSx}>Estado</Typography>

                <FormControlLabel
                  sx={{ m: 0, mt: 0.5 }}
                  control={
                    <Switch
                      checked={form.status === "active"}
                      disabled={saving}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          status: e.target.checked ? "active" : "inactive",
                        }))
                      }
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                      {form.status === "active" ? "Activo" : "Inactivo"}
                    </Typography>
                  }
                />
              </Box>

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.25}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => onBack?.()}
                  disabled={saving}
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    minWidth: { sm: 140 },
                    height: 44,
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                  startIcon={
                    saving
                      ? <CircularProgress size={18} color="inherit" />
                      : isEdit
                        ? <SaveIcon />
                        : <AddIcon />
                  }
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    minWidth: { sm: 180 },
                    height: 44,
                    fontWeight: 800,
                  }}
                >
                  {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear atributo"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}

const labelSx = {
  mb: 1,
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};