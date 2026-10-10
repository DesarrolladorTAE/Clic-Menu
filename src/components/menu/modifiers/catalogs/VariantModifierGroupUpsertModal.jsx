import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControlLabel,
  IconButton, MenuItem, Stack, Switch, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import AppAlert from "../../../../components/common/AppAlert";
import ModifierAssignmentRulesFields from "./shared/ModifierAssignmentRulesFields";

const EMPTY_RULES = {
  required_override: null,
  min_selections_override: null,
  max_selections_override: null,
};

function nullableBoolean(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return value === true || value === 1 || value === "1";
}

function nullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function VariantModifierGroupUpsertModal({
  open,
  onClose,
  restaurantId,
  product,
  variant,
  requiresBranch,
  effectiveBranchId,
  availableGroups,
  editing,
  onSaved,
  api,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isEdit = !!editing?.id;

  const [saving, setSaving] = useState(false);
  const [modifierGroupId, setModifierGroupId] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [rules, setRules] = useState({ ...EMPTY_RULES });
  const [rulesValid, setRulesValid] = useState(true);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const title = useMemo(
    () => (isEdit ? "Editar asignación" : "Asignar grupo"),
    [isEdit]
  );

  const filteredGroups = useMemo(() => {
    return Array.isArray(availableGroups)
      ? availableGroups.filter((group) => group?.id)
      : [];
  }, [availableGroups]);

  const selectedGroup = useMemo(() => {
    return filteredGroups.find(
      (group) => String(group.id) === String(modifierGroupId)
    ) || null;
  }, [filteredGroups, modifierGroupId]);

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    setAlertState((prev) => ({ ...prev, open: false }));
    setRulesValid(true);

    if (isEdit) {
      setModifierGroupId(String(editing?.modifier_group_id || ""));
      setSortOrder(String(editing?.sort_order ?? 0));
      setIsActive(
        editing?.is_active === true ||
        editing?.is_active === 1 ||
        editing?.is_active === "1"
      );

      setRules({
        required_override: nullableBoolean(editing?.required_override),
        min_selections_override: nullableNumber(editing?.min_selections_override),
        max_selections_override: nullableNumber(editing?.max_selections_override),
      });

      return;
    }

    setModifierGroupId(
      filteredGroups?.[0]?.id
        ? String(filteredGroups[0].id)
        : ""
    );
    setSortOrder("0");
    setIsActive(true);
    setRules({ ...EMPTY_RULES });
  }, [open, isEdit, editing, filteredGroups]);

  const canSave = useMemo(() => {
    if (!product?.id || !variant?.id || !modifierGroupId || !rulesValid || saving) {
      return false;
    }

    if (requiresBranch && !effectiveBranchId) {
      return false;
    }

    if (sortOrder === "") {
      return false;
    }

    const sort = Number(sortOrder);

    if (!Number.isInteger(sort) || sort < 0) {
      return false;
    }

    return true;
  }, [
    product,
    variant,
    modifierGroupId,
    rulesValid,
    saving,
    requiresBranch,
    effectiveBranchId,
    sortOrder,
  ]);

  const handleGroupChange = (value) => {
    setModifierGroupId(value);
    setRules({ ...EMPTY_RULES });
    setRulesValid(true);
  };

  const handleSortOrderChange = (event) => {
    const nextValue = event.target.value;

    if (/^\d*$/.test(nextValue)) {
      setSortOrder(nextValue);
    }
  };

  const save = async () => {
    if (!product?.id) {
      showAlert({
        severity: "warning",
        title: "Aviso",
        message: "Selecciona un producto antes de continuar.",
      });
      return;
    }

    if (!variant?.id) {
      showAlert({
        severity: "warning",
        title: "Aviso",
        message: "Selecciona una variante antes de continuar.",
      });
      return;
    }

    if (!modifierGroupId) {
      showAlert({
        severity: "warning",
        title: "Aviso",
        message: "Selecciona un grupo antes de continuar.",
      });
      return;
    }

    if (requiresBranch && !effectiveBranchId) {
      showAlert({
        severity: "warning",
        title: "Aviso",
        message: "Selecciona una sucursal antes de continuar.",
      });
      return;
    }

    if (!rulesValid) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "Revisa las reglas de selección antes de guardar.",
      });
      return;
    }

    if (sortOrder === "") {
      showAlert({
        severity: "error",
        title: "Error",
        message: "Ingresa el orden de la asignación.",
      });
      return;
    }

    const parsedSortOrder = Number(sortOrder);

    if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 0) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "El orden debe ser un número entero igual o mayor a 0.",
      });
      return;
    }

    const payload = {
      modifier_group_id: Number(modifierGroupId),
      required_override: rules?.required_override ?? null,
      min_selections_override: rules?.min_selections_override ?? null,
      max_selections_override: rules?.max_selections_override ?? null,
      sort_order: parsedSortOrder,
      is_active: isActive,
    };

    if (requiresBranch && effectiveBranchId) {
      payload.branch_id = Number(effectiveBranchId);
    }

    setSaving(true);

    try {
      if (isEdit) {
        await api.updateVariantModifierGroup(
          restaurantId,
          product.id,
          variant.id,
          editing.id,
          payload
        );
      } else {
        await api.createVariantModifierGroup(
          restaurantId,
          product.id,
          variant.id,
          payload
        );
      }

      await onSaved?.();
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo guardar la asignación del grupo a la variante.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return null;
  }

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
                  ? "Actualiza el grupo asignado y sus reglas dentro de la variante."
                  : "Selecciona el grupo de modificadores que deseas asignar a esta variante."}
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
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
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
                  Datos de la asignación
                </Typography>

                {product ? (
                  <Box
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: 0.3,
                      }}
                    >
                      Producto seleccionado
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: 16,
                        fontWeight: 800,
                        color: "text.primary",
                      }}
                    >
                      {product.name}
                    </Typography>

                    {variant ? (
                      <Typography
                        sx={{
                          mt: 0.75,
                          fontSize: 14,
                          color: "text.secondary",
                          fontWeight: 700,
                        }}
                      >
                        Variante: {variant.name}
                      </Typography>
                    ) : null}
                  </Box>
                ) : null}

                <FieldBlock
                  label="Grupo *"
                  input={
                    <TextField
                      select
                      fullWidth
                      value={modifierGroupId}
                      onChange={(e) => handleGroupChange(e.target.value)}
                      disabled={!filteredGroups.length || saving}
                    >
                      {!filteredGroups.length ? (
                        <MenuItem value="" disabled>
                          No hay grupos disponibles
                        </MenuItem>
                      ) : null}

                      {filteredGroups.map((group) => (
                        <MenuItem key={group.id} value={String(group.id)}>
                          {group.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  }
                  help={
                    !filteredGroups.length
                      ? "No hay grupos disponibles para asignar a variantes."
                      : null
                  }
                />

                <ModifierAssignmentRulesFields
                  group={selectedGroup}
                  value={rules}
                  onChange={setRules}
                  disabled={saving || !selectedGroup}
                  onValidityChange={setRulesValid}
                />

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <FieldBlock
                    label="Orden"
                    help="Los valores menores aparecen primero."
                    input={
                      <TextField
                        fullWidth
                        type="text"
                        value={sortOrder}
                        onChange={handleSortOrderChange}
                        disabled={saving}
                        placeholder="0"
                        inputProps={{
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        }}
                      />
                    }
                  />

                  <Box sx={{ flex: 1, width: "100%" }}>
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
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          disabled={saving}
                          color="primary"
                        />
                      }
                      label={
                        <Typography sx={switchLabelSx}>
                          {isActive ? "Activo" : "Inactivo"}
                        </Typography>
                      }
                    />
                  </Box>
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
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="button"
                    onClick={save}
                    disabled={!canSave}
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{
                      minWidth: { xs: "100%", sm: 180 },
                      height: 44,
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
        autoHideDuration={3000}
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