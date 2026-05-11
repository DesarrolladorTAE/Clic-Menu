import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack, Switch,
  TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import AppAlert from "../../../common/AppAlert";
import { normalizeErr } from "../../../../utils/err";

export default function SystemOwnerRestaurantUpsertModal({
  open,
  editing,
  onClose,
  onSave,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isEdit = !!editing?.id;

  const [saving, setSaving] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const [tradeName, setTradeName] = useState("");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState("active");

  const [inventoryMode, setInventoryMode] = useState("branch");
  const [productsMode, setProductsMode] = useState("global");
  const [recipeMode, setRecipeMode] = useState("global");

  const title = useMemo(
    () => (isEdit ? "Editar restaurante" : "Nuevo restaurante"),
    [isEdit]
  );

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      setTradeName(editing?.trade_name || "");
      setDescription(editing?.description || "");
      setContactPhone(editing?.contact_phone || "");
      setContactEmail(editing?.contact_email || "");
      setStatus(editing?.status || "active");

      setInventoryMode(editing?.settings?.inventory_mode || "branch");
      setProductsMode(editing?.settings?.products_mode || "global");
      setRecipeMode(editing?.settings?.recipe_mode || "global");
    } else {
      setTradeName("");
      setDescription("");
      setContactPhone("");
      setContactEmail("");
      setStatus("active");

      setInventoryMode("branch");
      setProductsMode("global");
      setRecipeMode("global");
    }
  }, [open, isEdit, editing]);

  const canSave = useMemo(() => {
    if (!tradeName.trim()) return false;
    return true;
  }, [tradeName]);

  const save = async () => {
    const payload = {
      trade_name: tradeName.trim(),
      description: description.trim() || null,
      contact_phone: contactPhone.trim() || null,
      contact_email: contactEmail.trim() || null,
      ...(isEdit ? {} : { status }),
      ...(!isEdit
        ? {
            settings: {
              inventory_mode: inventoryMode,
              products_mode: productsMode,
              recipe_mode: recipeMode,
            },
          }
        : {}),
    };

    if (!payload.trade_name) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "El nombre comercial es obligatorio.",
      });
      return;
    }

    setSaving(true);

    try {
      await onSave?.(payload, editing);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo guardar el restaurante."),
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={saving ? undefined : onClose}
        fullScreen={isMobile}
        fullWidth={false}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "100%", sm: 720 },
              height: { xs: "100%", sm: "auto" },
              maxHeight: { xs: "100%", sm: "88vh" },
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
                  ? "Actualiza los datos principales del restaurante."
                  : "Crea un nuevo restaurante para este propietario."}
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              disabled={saving}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: 1,
                "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
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
            overflowY: "auto",
          }}
        >
          <Stack spacing={2}>
            <Card sx={{ borderRadius: 0, backgroundColor: "background.paper" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={2.5}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: 18, sm: 20 },
                      color: "text.primary",
                    }}
                  >
                    Datos del restaurante
                  </Typography>

                  <Stack spacing={2}>
                    <FieldBlock
                      label="Nombre comercial *"
                      input={
                        <TextField
                          value={tradeName}
                          onChange={(e) => setTradeName(e.target.value)}
                          placeholder="Ej. Taquería El Centro"
                        />
                      }
                    />

                    <FieldBlock
                      label="Descripción"
                      input={
                        <TextField
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Opcional"
                          multiline
                          minRows={3}
                        />
                      }
                    />

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <FieldBlock
                        label="Teléfono de contacto"
                        input={
                          <TextField
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="7441234567"
                            inputProps={{ inputMode: "numeric" }}
                          />
                        }
                      />

                      <FieldBlock
                        label="Correo de contacto"
                        input={
                          <TextField
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="correo@restaurante.com"
                            type="email"
                          />
                        }
                      />
                    </Stack>

                    {!isEdit && (
                      <Box sx={{ flex: 1, width: "100%" }}>
                        <Typography sx={fieldLabelSx}>Estado</Typography>

                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Switch
                              checked={status === "active"}
                              onChange={(e) =>
                                setStatus(e.target.checked ? "active" : "inactive")
                              }
                              color="primary"
                            />
                          }
                          label={
                            <Typography sx={switchLabelSx}>
                              {status === "active" ? "Activo" : "Inactivo"}
                            </Typography>
                          }
                        />
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {!isEdit && (
              <Card sx={{ borderRadius: 0, backgroundColor: "background.paper" }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack spacing={2.5}>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: 18, sm: 20 },
                        color: "text.primary",
                      }}
                    >
                      Configuración inicial
                    </Typography>

                    <Stack spacing={2}>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <FieldBlock
                          label="Inventario"
                          input={
                            <TextField
                              select
                              value={inventoryMode}
                              onChange={(e) => setInventoryMode(e.target.value)}
                            >
                              <MenuItem value="branch">Por sucursal</MenuItem>
                              <MenuItem value="global">Global</MenuItem>
                            </TextField>
                          }
                        />

                        <FieldBlock
                          label="Productos"
                          input={
                            <TextField
                              select
                              value={productsMode}
                              onChange={(e) => setProductsMode(e.target.value)}
                            >
                              <MenuItem value="global">Global</MenuItem>
                              <MenuItem value="branch">Por sucursal</MenuItem>
                            </TextField>
                          }
                        />
                      </Stack>

                      <FieldBlock
                        label="Recetas"
                        input={
                          <TextField
                            select
                            value={recipeMode}
                            onChange={(e) => setRecipeMode(e.target.value)}
                          >
                            <MenuItem value="global">Global</MenuItem>
                            <MenuItem value="branch">Por sucursal</MenuItem>
                          </TextField>
                        }
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            )}

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
                type="button"
                onClick={save}
                disabled={!canSave || saving}
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
        </DialogContent>
      </Dialog>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {input}

      {help && (
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
      )}
    </Box>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};