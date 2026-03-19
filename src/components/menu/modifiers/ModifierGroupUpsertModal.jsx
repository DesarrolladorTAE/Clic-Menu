import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
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

  const title = useMemo(
    () => (isEdit ? "Editar grupo" : "Nuevo grupo"),
    [isEdit]
  );

  const isSingleMode = selectionMode === "single";

  const showAlert = ({
    severity = "error",
    title = "Error",
    message = "",
  }) => {
    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      const currentSelectionMode = editing?.selection_mode || "multiple";
      const currentMin = String(editing?.min_select ?? 0);
      const currentMax =
        editing?.max_select === null || editing?.max_select === undefined
          ? ""
          : String(editing?.max_select);

      setName(editing?.name || "");
      setDescription(editing?.description || "");
      setSelectionMode(currentSelectionMode);
      setIsRequired(!!editing?.is_required);
      setMinSelect(currentSelectionMode === "single"
        ? (currentMin === "1" ? "1" : "0")
        : currentMin
      );
      setMaxSelect(currentSelectionMode === "single" ? "1" : currentMax);
      setAppliesTo(editing?.applies_to || "product");
      setSortOrder(String(editing?.sort_order ?? 0));
      setIsActive(!!editing?.is_active);
    } else {
      setName("");
      setDescription("");
      setSelectionMode("multiple");
      setIsRequired(false);
      setMinSelect("0");
      setMaxSelect("");
      setAppliesTo("product");
      setSortOrder("0");
      setIsActive(true);
    }
  }, [open, isEdit, editing]);

  useEffect(() => {
    if (!isSingleMode) return;

    setMaxSelect("1");

    if (!["0", "1"].includes(String(minSelect))) {
      setMinSelect("0");
    }
  }, [isSingleMode, minSelect]);

  useEffect(() => {
    if (!isSingleMode) return;

    setMinSelect(isRequired ? "1" : "0");
  }, [isRequired, isSingleMode]);

  const handleSelectionModeChange = (value) => {
    setSelectionMode(value);

    if (value === "single") {
      setMaxSelect("1");
      setMinSelect(isRequired ? "1" : "0");
    }
  };

  const handleMinSelectChange = (value) => {
    if (isSingleMode) {
      if (value === "" || value === "0") {
        setMinSelect("0");
        return;
      }

      if (value === "1") {
        setMinSelect("1");
      }
      return;
    }

    setMinSelect(value);
  };

  const handleIsRequiredChange = (checked) => {
    setIsRequired(checked);

    if (isSingleMode) {
      setMinSelect(checked ? "1" : "0");
    }
  };

  const canSave = useMemo(() => {
    if (!name.trim()) return false;

    const min = Number(minSelect);
    const sort = Number(sortOrder);
    const max = maxSelect === "" ? null : Number(maxSelect);

    if (!Number.isFinite(min) || min < 0) return false;
    if (!Number.isFinite(sort) || sort < 0) return false;

    if (isSingleMode) {
      if (![0, 1].includes(min)) return false;
      if (max !== 1) return false;
      return true;
    }

    if (max !== null && (!Number.isFinite(max) || max < 0)) return false;
    if (max !== null && max < min) return false;

    return true;
  }, [name, minSelect, maxSelect, sortOrder, isSingleMode]);

  const save = async () => {
    const payload = {
      branch_id: requiresBranch ? effectiveBranchId : null,
      name: name.trim(),
      description: description.trim() || null,
      selection_mode: selectionMode,
      is_required: isRequired,
      min_select: Number(minSelect),
      max_select: isSingleMode ? 1 : maxSelect === "" ? null : Number(maxSelect),
      applies_to: appliesTo,
      sort_order: Number(sortOrder),
      is_active: isActive,
    };

    if (!payload.name) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "El nombre del grupo es obligatorio.",
      });
      return;
    }

    if (requiresBranch && !payload.branch_id) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal para continuar.",
      });
      return;
    }

    if (
      !Number.isFinite(payload.min_select) ||
      payload.min_select < 0 ||
      !Number.isFinite(payload.sort_order) ||
      payload.sort_order < 0
    ) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "Revisa los campos numéricos del formulario.",
      });
      return;
    }

    if (isSingleMode && ![0, 1].includes(payload.min_select)) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          "Cuando el modo es una sola opción, el mínimo solo puede ser 0 o 1.",
      });
      return;
    }

    if (
      !isSingleMode &&
      payload.max_select !== null &&
      (!Number.isFinite(payload.max_select) ||
        payload.max_select < payload.min_select)
    ) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          "El máximo de selección no puede ser menor que el mínimo.",
      });
      return;
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
        message:
          e?.response?.data?.message ||
          "No se pudo guardar el grupo de modificadores",
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
                  ? "Actualiza la configuración del grupo de modificadores."
                  : "Crea un grupo para organizar opciones como extras, tamaños o variantes."}
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
                      label="Modo de selección *"
                      input={
                        <TextField
                          select
                          value={selectionMode}
                          onChange={(e) =>
                            handleSelectionModeChange(e.target.value)
                          }
                        >
                          <MenuItem value="single">Una sola opción</MenuItem>
                          <MenuItem value="multiple">Múltiples opciones</MenuItem>
                        </TextField>
                      }
                    />

                    <FieldBlock
                      label="Aplica para *"
                      input={
                        <TextField
                          select
                          value={appliesTo}
                          onChange={(e) => setAppliesTo(e.target.value)}
                        >
                          <MenuItem value="product">Producto</MenuItem>
                          <MenuItem value="variant">Variante</MenuItem>
                          <MenuItem value="component">Componente</MenuItem>
                          <MenuItem value="any">Cualquiera</MenuItem>
                        </TextField>
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Mínimo de selección"
                      help={
                        isSingleMode
                          ? "Cuando es una sola opción, el mínimo solo puede ser 0 o 1."
                          : "0 significa que no es obligatorio."
                      }
                      input={
                        <TextField
                          value={minSelect}
                          onChange={(e) => handleMinSelectChange(e.target.value)}
                          inputProps={{
                            inputMode: "numeric",
                            min: 0,
                            max: isSingleMode ? 1 : undefined,
                          }}
                          placeholder="0"
                        />
                      }
                    />

                    <FieldBlock
                      label="Máximo de selección"
                      help={
                        isSingleMode
                          ? "Cuando es una sola opción, el máximo siempre será 1."
                          : "Déjalo vacío si no quieres limitar el máximo."
                      }
                      input={
                        <TextField
                          value={isSingleMode ? "1" : maxSelect}
                          onChange={(e) => setMaxSelect(e.target.value)}
                          inputProps={{ inputMode: "numeric" }}
                          placeholder="Opcional"
                          disabled={isSingleMode}
                        />
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Orden"
                      help="Entre más bajo, aparece primero."
                      input={
                        <TextField
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value)}
                          inputProps={{ inputMode: "numeric" }}
                          placeholder="0"
                        />
                      }
                    />

                    {!isEdit ? (
                      <Box sx={{ flex: 1, width: "100%" }}>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "text.primary",
                            mb: 1,
                          }}
                        >
                          Estado inicial
                        </Typography>

                        <Stack spacing={1.25}>
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Switch
                                checked={isRequired}
                                onChange={(e) =>
                                  handleIsRequiredChange(e.target.checked)
                                }
                                color="primary"
                              />
                            }
                            label={
                              <Typography sx={switchLabelSx}>
                                {isRequired ? "Obligatorio" : "Opcional"}
                              </Typography>
                            }
                          />

                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Switch
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                color="primary"
                              />
                            }
                            label={
                              <Typography sx={switchLabelSx}>
                                {isActive ? "Activo" : "Inactivo"}
                              </Typography>
                            }
                          />
                        </Stack>
                      </Box>
                    ) : (
                      <Box sx={{ flex: 1, width: "100%" }}>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "text.primary",
                            mb: 1,
                          }}
                        >
                          Configuración
                        </Typography>

                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Switch
                              checked={isRequired}
                              onChange={(e) =>
                                handleIsRequiredChange(e.target.checked)
                              }
                              color="primary"
                            />
                          }
                          label={
                            <Typography sx={switchLabelSx}>
                              {isRequired ? "Obligatorio" : "Opcional"}
                            </Typography>
                          }
                        />
                      </Box>
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
        autoHideDuration={4000}
      />
    </>
  );
}

function FieldBlock({ label, input, help }) {
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

      {help ? (
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
    </Box>
  );
}

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};