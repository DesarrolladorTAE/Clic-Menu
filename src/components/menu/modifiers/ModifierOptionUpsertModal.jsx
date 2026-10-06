import { useEffect, useMemo, useState } from "react";

import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControlLabel,
  IconButton, MenuItem, Stack, Switch, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import AppAlert from "../../../components/common/AppAlert";

export default function ModifierOptionUpsertModal({
  open,
  onClose,
  restaurantId,
  groups,
  editing,
  onSaved,
  api,
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

  const [modifierGroupId, setModifierGroupId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [maxQuantityPerSelection, setMaxQuantityPerSelection] = useState("1");
  const [isDefault, setIsDefault] = useState(false);
  const [affectsTotal, setAffectsTotal] = useState(true);
  const [trackInventory, setTrackInventory] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const title = useMemo(() => {
    return isEdit ? "Editar opción" : "Nueva opción";
  }, [isEdit]);

  const availableGroups = useMemo(() => {
    return [...(Array.isArray(groups) ? groups : [])].sort((a, b) => {
      const byOrder = Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
      if (byOrder !== 0) return byOrder;
      return (a.name || "").localeCompare(b.name || "", "es", { sensitivity: "base" });
    });
  }, [groups]);

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const getBackendMessage = (e, fallback) => {
    const data = e?.response?.data;
    const errors = data?.errors && typeof data.errors === "object"
      ? Object.values(data.errors).flat().filter(Boolean)
      : [];

    if (errors[0]) return errors[0];

    switch (data?.code) {
      case "MODIFIER_INVENTORY_CONFIGURATION_REQUIRED_BEFORE_ACTIVATION":
        return "Configura primero el consumo físico de la opción y después actívala.";
      case "MODIFIER_EFFECT_NOT_ALLOWED_BY_PLAN":
        return "Tu plan actual no permite activar esta configuración de inventario.";
      case "DUPLICATE_MODIFIER_OPTION_NAME":
        return "Ya existe una opción con ese nombre dentro del grupo.";
      default:
        return data?.message || fallback;
    }
  };

  useEffect(() => {
    if (!open) return;

    setAlertState({
      open: false,
      severity: "error",
      title: "",
      message: "",
    });

    if (isEdit) {
      setModifierGroupId(String(editing?.modifier_group_id || ""));
      setName(editing?.name || "");
      setDescription(editing?.description || "");
      setPrice(String(editing?.price ?? 0));
      setMaxQuantityPerSelection(String(editing?.max_quantity_per_selection ?? 1));
      setIsDefault(!!editing?.is_default);
      setAffectsTotal(editing?.affects_total === undefined ? true : !!editing?.affects_total);
      setTrackInventory(!!editing?.track_inventory);
      setSortOrder(String(editing?.sort_order ?? 0));
      setIsActive(!!editing?.is_active);
      return;
    }

    setModifierGroupId(availableGroups?.[0]?.id ? String(availableGroups[0].id) : "");
    setName("");
    setDescription("");
    setPrice("0");
    setMaxQuantityPerSelection("1");
    setIsDefault(false);
    setAffectsTotal(true);
    setTrackInventory(false);
    setSortOrder("0");
    setIsActive(true);
  }, [open, isEdit, editing, availableGroups]);

  const handleTrackInventoryChange = (checked) => {
    setTrackInventory(checked);

    if (!checked) return;

    if (!isEdit || !editing?.track_inventory) {
      setIsActive(false);
    }
  };

  const willRequireConsumptionBeforeActivation = useMemo(() => {
    if (!trackInventory) return false;
    if (!isEdit) return true;
    return !editing?.track_inventory;
  }, [trackInventory, isEdit, editing]);

  const canSave = useMemo(() => {
    if (!modifierGroupId || !name.trim()) return false;
    if (String(price).trim() === "" || String(maxQuantityPerSelection).trim() === "" || String(sortOrder).trim() === "") {
      return false;
    }

    const parsedPrice = Number(price);
    const parsedMaxQty = Number(maxQuantityPerSelection);
    const parsedSort = Number(sortOrder);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) return false;
    if (!Number.isInteger(parsedMaxQty) || parsedMaxQty < 1) return false;
    if (!Number.isInteger(parsedSort) || parsedSort < 0) return false;

    return true;
  }, [modifierGroupId, name, price, maxQuantityPerSelection, sortOrder]);

  const save = async () => {
    const groupId = Number(modifierGroupId);

    if (!groupId) {
      showAlert({
        severity: "warning",
        title: "Grupo requerido",
        message: "Selecciona un grupo para continuar.",
      });
      return;
    }

    if (!name.trim()) {
      showAlert({
        severity: "warning",
        title: "Dato requerido",
        message: "El nombre de la opción es obligatorio.",
      });
      return;
    }

    const parsedPrice = Number(price);
    const parsedMaxQty = Number(maxQuantityPerSelection);
    const parsedSort = Number(sortOrder);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      showAlert({
        severity: "error",
        title: "Precio inválido",
        message: "El precio debe ser un número igual o mayor a 0.",
      });
      return;
    }

    if (!Number.isInteger(parsedMaxQty) || parsedMaxQty < 1) {
      showAlert({
        severity: "error",
        title: "Cantidad inválida",
        message: "La cantidad máxima por selección debe ser un número entero de al menos 1.",
      });
      return;
    }

    if (!Number.isInteger(parsedSort) || parsedSort < 0) {
      showAlert({
        severity: "error",
        title: "Orden inválido",
        message: "El orden debe ser un número entero igual o mayor a 0.",
      });
      return;
    }

    const forceInactive = trackInventory && (!isEdit || !editing?.track_inventory);

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: parsedPrice,
      max_quantity_per_selection: parsedMaxQty,
      is_default: isDefault,
      affects_total: affectsTotal,
      track_inventory: trackInventory,
      sort_order: parsedSort,
      is_active: forceInactive ? false : isActive,
    };

    setSaving(true);

    try {
      if (isEdit) {
        await api.updateModifierOption(restaurantId, groupId, editing.id, payload);
      } else {
        await api.createModifierOption(restaurantId, groupId, payload);
      }

      await onSaved?.();
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: getBackendMessage(e, "No se pudo guardar la opción."),
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
        fullWidth
        maxWidth="md"
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
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
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

              <Typography sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
                {isEdit
                  ? "Actualiza la información y configuración de la opción."
                  : "Agrega una nueva opción dentro de uno de tus grupos."}
              </Typography>
            </Box>

            <IconButton
              aria-label="Cerrar"
              onClick={onClose}
              disabled={saving}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.08)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.16)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default" }}>
          <Card
            sx={{
              borderRadius: 1,
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
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
                  Datos de la opción
                </Typography>

                <Stack spacing={2}>
                  <FieldBlock
                    label="Grupo *"
                    help={isEdit ? "La opción permanece dentro del grupo donde fue creada." : null}
                    input={
                      <TextField
                        select
                        value={modifierGroupId}
                        onChange={(e) => setModifierGroupId(e.target.value)}
                        disabled={saving || isEdit}
                        fullWidth
                      >
                        {availableGroups.map((group) => (
                          <MenuItem key={group.id} value={String(group.id)}>
                            {group.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    }
                  />

                  <FieldBlock
                    label="Nombre *"
                    input={
                      <TextField
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Queso extra"
                        disabled={saving}
                        inputProps={{ maxLength: 120 }}
                        fullWidth
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
                        disabled={saving}
                        fullWidth
                      />
                    }
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Precio"
                      help="Es el importe configurado para esta opción."
                      input={
                        <TextField
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          inputProps={{ inputMode: "decimal", min: 0 }}
                          placeholder="0.00"
                          disabled={saving}
                          fullWidth
                        />
                      }
                    />

                    <FieldBlock
                      label="Máximo de esta opción"
                      help="Indica cuántas veces puede elegir esta misma opción el cliente."
                      input={
                        <TextField
                          value={maxQuantityPerSelection}
                          onChange={(e) => setMaxQuantityPerSelection(e.target.value)}
                          inputProps={{ inputMode: "numeric", min: 1, step: 1 }}
                          placeholder="1"
                          disabled={saving}
                          fullWidth
                        />
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Orden"
                      help="Entre más bajo sea el número, antes aparecerá la opción."
                      input={
                        <TextField
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value)}
                          inputProps={{ inputMode: "numeric", min: 0, step: 1 }}
                          placeholder="0"
                          disabled={saving}
                          fullWidth
                        />
                      }
                    />

                    <Box sx={{ flex: 1, width: "100%" }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
                        Configuración
                      </Typography>

                      <Stack spacing={1}>
                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Switch
                              checked={isDefault}
                              onChange={(e) => setIsDefault(e.target.checked)}
                              color="primary"
                              disabled={saving}
                            />
                          }
                          label={
                            <Typography sx={switchLabelSx}>
                              {isDefault ? "Predeterminada" : "No predeterminada"}
                            </Typography>
                          }
                        />

                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Switch
                              checked={affectsTotal}
                              onChange={(e) => setAffectsTotal(e.target.checked)}
                              color="primary"
                              disabled={saving}
                            />
                          }
                          label={
                            <Typography sx={switchLabelSx}>
                              {affectsTotal ? "Se suma al total" : "No se suma al total"}
                            </Typography>
                          }
                        />

                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Switch
                              checked={trackInventory}
                              onChange={(e) => handleTrackInventoryChange(e.target.checked)}
                              color="primary"
                              disabled={saving}
                            />
                          }
                          label={
                            <Typography sx={switchLabelSx}>
                              {trackInventory ? "Controla inventario" : "Sin control de inventario"}
                            </Typography>
                          }
                        />

                        {!isEdit ? (
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Switch
                                checked={trackInventory ? false : isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                color="primary"
                                disabled={saving || trackInventory}
                              />
                            }
                            label={
                              <Typography sx={switchLabelSx}>
                                {trackInventory ? "Inactiva hasta configurar su consumo" : isActive ? "Activo" : "Inactivo"}
                              </Typography>
                            }
                          />
                        ) : null}
                      </Stack>

                      {willRequireConsumptionBeforeActivation ? (
                        <Typography
                          sx={{
                            mt: 1,
                            fontSize: 12,
                            lineHeight: 1.45,
                            color: "text.secondary",
                          }}
                        >
                          Al controlar inventario, esta opción se guardará inactiva. Después configura su consumo desde la lista y actívala cuando esté lista.
                        </Typography>
                      ) : null}

                      {isEdit ? (
                        <Typography
                          sx={{
                            mt: 1,
                            fontSize: 12,
                            lineHeight: 1.45,
                            color: "text.secondary",
                          }}
                        >
                          El estado activo o inactivo se controla desde la lista principal.
                        </Typography>
                      ) : null}
                    </Box>
                  </Stack>
                </Stack>

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
                    sx={{ minWidth: { xs: "100%", sm: 150 }, height: 44 }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="button"
                    onClick={save}
                    disabled={!canSave || saving}
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{ minWidth: { xs: "100%", sm: 180 }, height: 44, fontWeight: 800 }}
                  >
                    {saving ? "Guardando…" : "Guardar"}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
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
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
        {label}
      </Typography>

      {input}

      {help ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};