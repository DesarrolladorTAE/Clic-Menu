import { useEffect, useMemo, useState } from "react";

import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControlLabel,
  IconButton, MenuItem, Stack, Switch, TextField, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import AppAlert from "../../../components/common/AppAlert";

export default function ModifierGroupUpsertModal({
  open,
  onClose,
  restaurantId,
  requiresBranch,
  effectiveBranchId,
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

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [isRequired, setIsRequired] = useState(false);
  const [minSelect, setMinSelect] = useState("0");
  const [maxSelect, setMaxSelect] = useState("");
  const [appliesTo, setAppliesTo] = useState("product");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const title = useMemo(() => {
    return isEdit ? "Editar grupo" : "Nuevo grupo";
  }, [isEdit]);

  const appliesToHelp = useMemo(() => {
    if (appliesTo === "product") {
      return "Este grupo podrá usarse directamente en productos.";
    }

    if (appliesTo === "variant") {
      return "Este grupo podrá usarse en variantes, incluso cuando formen parte de un combo.";
    }

    if (appliesTo === "component") {
      return "Este grupo podrá usarse en productos incluidos dentro de un combo o producto compuesto.";
    }

    return "Este grupo podrá usarse en cualquiera de los casos anteriores.";
  }, [appliesTo]);

  const isSingleMode = selectionMode === "single";

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

    return errors[0] || data?.message || fallback;
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
      const currentMode = editing?.selection_mode || "multiple";
      const currentRequired = !!editing?.is_required;
      const currentMin = Number(editing?.min_select ?? 0);
      const currentMax = editing?.max_select === null || editing?.max_select === undefined
        ? ""
        : String(editing.max_select);

      setName(editing?.name || "");
      setDescription(editing?.description || "");
      setSelectionMode(currentMode);
      setIsRequired(currentRequired);

      if (currentMode === "single") {
        setMinSelect(currentRequired ? "1" : "0");
        setMaxSelect("1");
      } else {
        setMinSelect(String(currentMin));
        setMaxSelect(currentMax);
      }

      setAppliesTo(editing?.applies_to || "product");
      setSortOrder(String(editing?.sort_order ?? 0));
      setIsActive(!!editing?.is_active);
      return;
    }

    setName("");
    setDescription("");
    setSelectionMode("multiple");
    setIsRequired(false);
    setMinSelect("0");
    setMaxSelect("");
    setAppliesTo("product");
    setSortOrder("0");
    setIsActive(true);
  }, [open, isEdit, editing]);

  const handleSelectionModeChange = (value) => {
    setSelectionMode(value);

    if (value === "single") {
      setMinSelect(isRequired ? "1" : "0");
      setMaxSelect("1");
      return;
    }

    setMinSelect(isRequired ? "1" : "0");
    setMaxSelect("");
  };

  const handleRequiredChange = (checked) => {
    setIsRequired(checked);

    if (selectionMode === "single") {
      setMinSelect(checked ? "1" : "0");
      setMaxSelect("1");
      return;
    }

    if (checked) {
      const currentMin = Number(minSelect);
      setMinSelect(Number.isInteger(currentMin) && currentMin > 0 ? String(currentMin) : "1");
      return;
    }

    setMinSelect("0");
  };

  const handleMinSelectChange = (value) => {
    if (isSingleMode) return;

    setMinSelect(value);

    if (value === "") return;

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) return;

    if (parsed > 0 && !isRequired) {
      setIsRequired(true);
    }

    if (parsed === 0 && isRequired) {
      setIsRequired(false);
    }
  };

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    if (requiresBranch && !effectiveBranchId) return false;
    if (String(minSelect).trim() === "" || String(sortOrder).trim() === "") return false;

    const min = Number(minSelect);
    const sort = Number(sortOrder);
    const max = maxSelect === "" ? null : Number(maxSelect);

    if (!Number.isInteger(min) || min < 0) return false;
    if (!Number.isInteger(sort) || sort < 0) return false;

    if (isSingleMode) {
      if (max !== 1) return false;
      if (isRequired && min !== 1) return false;
      if (!isRequired && min !== 0) return false;
      return true;
    }

    if (isRequired && min < 1) return false;
    if (!isRequired && min !== 0) return false;

    if (max !== null) {
      if (!Number.isInteger(max) || max < 1) return false;
      if (max < min) return false;
    }

    return true;
  }, [
    name,
    requiresBranch,
    effectiveBranchId,
    minSelect,
    maxSelect,
    sortOrder,
    isSingleMode,
    isRequired,
  ]);

  const save = async () => {
    const min = Number(minSelect);
    const max = isSingleMode ? 1 : maxSelect === "" ? null : Number(maxSelect);
    const sort = Number(sortOrder);

    const payload = {
      branch_id: requiresBranch ? effectiveBranchId : null,
      name: name.trim(),
      description: description.trim() || null,
      selection_mode: selectionMode,
      is_required: isRequired,
      min_select: min,
      max_select: max,
      applies_to: appliesTo,
      sort_order: sort,
      is_active: isActive,
    };

    if (!payload.name) {
      showAlert({
        severity: "warning",
        title: "Dato requerido",
        message: "El nombre del grupo es obligatorio.",
      });
      return;
    }

    if (requiresBranch && !payload.branch_id) {
      showAlert({
        severity: "warning",
        title: "Sucursal requerida",
        message: "Selecciona una sucursal para continuar.",
      });
      return;
    }

    if (!Number.isInteger(payload.min_select) || payload.min_select < 0) {
      showAlert({
        severity: "error",
        title: "Cantidad inválida",
        message: "El mínimo de selección debe ser un número entero igual o mayor a 0.",
      });
      return;
    }

    if (!Number.isInteger(payload.sort_order) || payload.sort_order < 0) {
      showAlert({
        severity: "error",
        title: "Orden inválido",
        message: "El orden debe ser un número entero igual o mayor a 0.",
      });
      return;
    }

    if (isSingleMode) {
      if (payload.max_select !== 1) {
        showAlert({
          severity: "error",
          title: "Selección inválida",
          message: "Cuando se permite una sola opción, el máximo siempre debe ser 1.",
        });
        return;
      }

      if (payload.is_required && payload.min_select !== 1) {
        showAlert({
          severity: "error",
          title: "Selección inválida",
          message: "Un grupo obligatorio de una sola opción debe requerir exactamente una selección.",
        });
        return;
      }

      if (!payload.is_required && payload.min_select !== 0) {
        showAlert({
          severity: "error",
          title: "Selección inválida",
          message: "Un grupo opcional de una sola opción debe tener mínimo 0.",
        });
        return;
      }
    }

    if (!isSingleMode) {
      if (payload.is_required && payload.min_select < 1) {
        showAlert({
          severity: "error",
          title: "Selección inválida",
          message: "Un grupo obligatorio debe requerir al menos una selección.",
        });
        return;
      }

      if (!payload.is_required && payload.min_select !== 0) {
        showAlert({
          severity: "error",
          title: "Selección inválida",
          message: "Un grupo opcional debe tener mínimo de selección igual a 0.",
        });
        return;
      }

      if (
        payload.max_select !== null &&
        (!Number.isInteger(payload.max_select) || payload.max_select < 1)
      ) {
        showAlert({
          severity: "error",
          title: "Cantidad inválida",
          message: "El máximo debe ser un número entero mayor a 0 o quedar vacío.",
        });
        return;
      }

      if (payload.max_select !== null && payload.max_select < payload.min_select) {
        showAlert({
          severity: "error",
          title: "Selección inválida",
          message: "El máximo de selección no puede ser menor que el mínimo.",
        });
        return;
      }
    }

    setSaving(true);

    try {
      if (isEdit) {
        await api.updateModifierGroup(restaurantId, editing.id, payload);
      } else {
        await api.createModifierGroup(restaurantId, payload);
      }

      await onSaved?.();
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: getBackendMessage(e, "No se pudo guardar el grupo."),
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
                  ? "Actualiza las reglas de selección y organización del grupo."
                  : "Crea un grupo para organizar las opciones disponibles para tus productos."}
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
                  Datos del grupo
                </Typography>

                <Stack spacing={2}>
                  <FieldBlock
                    label="Nombre *"
                    input={
                      <TextField
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Extras"
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
                      label="Modo de selección *"
                      help={
                        isSingleMode
                          ? "El cliente podrá elegir como máximo una opción de este grupo."
                          : "El cliente podrá elegir varias opciones respetando el mínimo y máximo configurados."
                      }
                      input={
                        <TextField
                          select
                          value={selectionMode}
                          onChange={(e) => handleSelectionModeChange(e.target.value)}
                          disabled={saving}
                          fullWidth
                        >
                          <MenuItem value="single">Una sola opción</MenuItem>
                          <MenuItem value="multiple">Múltiples opciones</MenuItem>
                        </TextField>
                      }
                    />

                    <FieldBlock
                      label="Puede asignarse a *"
                      help={appliesToHelp}
                      input={
                        <TextField
                          select
                          value={appliesTo}
                          onChange={(e) => setAppliesTo(e.target.value)}
                          disabled={saving}
                          fullWidth
                        >
                          <MenuItem value="product">Producto</MenuItem>
                          <MenuItem value="variant">Variante</MenuItem>
                          <MenuItem value="component">Componente</MenuItem>
                          <MenuItem value="any">Cualquiera</MenuItem>
                        </TextField>
                      }
                    />
                  </Stack>

                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "background.default",
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={1}
                      >
                        <Box>
                          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                            Selección obligatoria
                          </Typography>

                          <Typography sx={{ mt: 0.25, fontSize: 12, color: "text.secondary" }}>
                            Indica si el cliente debe elegir al menos una opción.
                          </Typography>
                        </Box>

                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Switch
                              checked={isRequired}
                              onChange={(e) => handleRequiredChange(e.target.checked)}
                              color="primary"
                              disabled={saving}
                            />
                          }
                          label={
                            <Typography sx={switchLabelSx}>
                              {isRequired ? "Obligatorio" : "Opcional"}
                            </Typography>
                          }
                        />
                      </Stack>

                      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <FieldBlock
                          label="Mínimo de selección"
                          help={
                            isSingleMode
                              ? isRequired
                                ? "Al ser obligatorio y permitir una sola opción, el mínimo es 1."
                                : "Al ser opcional y permitir una sola opción, el mínimo es 0."
                              : isRequired
                              ? "Debe ser al menos 1."
                              : "Los grupos opcionales utilizan mínimo 0."
                          }
                          input={
                            <TextField
                              value={minSelect}
                              onChange={(e) => handleMinSelectChange(e.target.value)}
                              inputProps={{
                                inputMode: "numeric",
                                min: 0,
                                step: 1,
                              }}
                              disabled={saving || isSingleMode}
                              fullWidth
                            />
                          }
                        />

                        <FieldBlock
                          label="Máximo de selección"
                          help={
                            isSingleMode
                              ? "Cuando se permite una sola opción, el máximo siempre es 1."
                              : "Déjalo vacío si no deseas establecer un límite máximo."
                          }
                          input={
                            <TextField
                              value={isSingleMode ? "1" : maxSelect}
                              onChange={(e) => setMaxSelect(e.target.value)}
                              inputProps={{
                                inputMode: "numeric",
                                min: 1,
                                step: 1,
                              }}
                              placeholder={isSingleMode ? "1" : "Sin límite"}
                              disabled={saving || isSingleMode}
                              fullWidth
                            />
                          }
                        />
                      </Stack>
                    </Stack>
                  </Box>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Orden"
                      help="Entre más bajo sea el número, antes aparecerá el grupo."
                      input={
                        <TextField
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value)}
                          inputProps={{
                            inputMode: "numeric",
                            min: 0,
                            step: 1,
                          }}
                          placeholder="0"
                          disabled={saving}
                          fullWidth
                        />
                      }
                    />

                    {!isEdit ? (
                      <Box sx={{ flex: 1, width: "100%" }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
                          Estado inicial
                        </Typography>

                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Switch
                              checked={isActive}
                              onChange={(e) => setIsActive(e.target.checked)}
                              color="primary"
                              disabled={saving}
                            />
                          }
                          label={
                            <Typography sx={switchLabelSx}>
                              {isActive ? "Activo" : "Inactivo"}
                            </Typography>
                          }
                        />
                      </Box>
                    ) : (
                      <Typography
                        sx={{
                          flex: 1,
                          fontSize: 12,
                          color: "text.secondary",
                          lineHeight: 1.45,
                          pt: { xs: 0, md: 4 },
                        }}
                      >
                        El estado del grupo se controla desde la pantalla principal con el interruptor de la tabla.
                      </Typography>
                    )}
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