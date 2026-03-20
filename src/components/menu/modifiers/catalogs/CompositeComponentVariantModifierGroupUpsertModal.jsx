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

import AppAlert from "../../../../components/common/AppAlert";

export default function CompositeComponentVariantModifierGroupUpsertModal({
  open,
  onClose,
  restaurantId,
  product,
  component,
  variant,
  requiresBranch,
  effectiveBranchId,
  availableGroups,
  availableComponents,
  availableVariants,
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

  const [componentProductId, setComponentProductId] = useState("");
  const [componentVariantId, setComponentVariantId] = useState("");
  const [modifierGroupId, setModifierGroupId] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const title = useMemo(
    () => (isEdit ? "Editar asignación" : "Asignar grupo"),
    [isEdit]
  );

  const filteredGroups = useMemo(() => {
    return Array.isArray(availableGroups)
      ? availableGroups.filter((g) => g?.id)
      : [];
  }, [availableGroups]);

  const filteredComponents = useMemo(() => {
    return Array.isArray(availableComponents)
      ? availableComponents.filter((c) => c?.component_product_id)
      : [];
  }, [availableComponents]);

  const filteredVariants = useMemo(() => {
    return Array.isArray(availableVariants)
      ? availableVariants.filter((v) => v?.variant?.id)
      : [];
  }, [availableVariants]);

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
      setComponentProductId(String(editing?.component_product_id || ""));
      setComponentVariantId(String(editing?.component_variant_id || ""));
      setModifierGroupId(String(editing?.modifier_group_id || ""));
      setSortOrder(String(editing?.sort_order ?? 0));
      setIsActive(!!editing?.is_active);
    } else {
      setComponentProductId(
        component?.id
          ? String(component.id)
          : filteredComponents?.[0]?.component_product_id
            ? String(filteredComponents[0].component_product_id)
            : ""
      );
      setComponentVariantId(
        variant?.id
          ? String(variant.id)
          : filteredVariants?.[0]?.variant?.id
            ? String(filteredVariants[0].variant.id)
            : ""
      );
      setModifierGroupId(
        filteredGroups?.[0]?.id ? String(filteredGroups[0].id) : ""
      );
      setSortOrder("0");
      setIsActive(true);
    }
  }, [
    open,
    isEdit,
    editing,
    filteredGroups,
    filteredComponents,
    filteredVariants,
    component,
    variant,
  ]);

  const canSave = useMemo(() => {
    if (!product?.id) return false;
    if (!componentProductId) return false;
    if (!componentVariantId) return false;
    if (!modifierGroupId) return false;

    const sort = Number(sortOrder);
    if (!Number.isFinite(sort) || sort < 0) return false;

    return true;
  }, [product, componentProductId, componentVariantId, modifierGroupId, sortOrder]);

  const save = async () => {
    if (!product?.id) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona un producto compuesto antes de continuar.",
      });
      return;
    }

    if (!componentProductId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona un componente para continuar.",
      });
      return;
    }

    if (!componentVariantId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una variante del componente para continuar.",
      });
      return;
    }

    if (!modifierGroupId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona un grupo para continuar.",
      });
      return;
    }

    const payload = {
      component_product_id: Number(componentProductId),
      component_variant_id: Number(componentVariantId),
      modifier_group_id: Number(modifierGroupId),
      sort_order: Number(sortOrder),
      is_active: isActive,
    };

    if (requiresBranch) {
      payload.branch_id = effectiveBranchId;
    }

    if (!Number.isFinite(payload.sort_order) || payload.sort_order < 0) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "El orden debe ser un número igual o mayor a 0.",
      });
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        await api.updateCompositeComponentVariantModifierGroup(
          restaurantId,
          product.id,
          editing.id,
          payload
        );
      } else {
        await api.createCompositeComponentVariantModifierGroup(
          restaurantId,
          product.id,
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
          "No se pudo guardar la asignación del grupo a la variante del componente",
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
                  ? "Actualiza el grupo asignado y su configuración dentro de la variante del componente."
                  : "Selecciona qué grupo de modificadores quieres asignar a una variante específica del componente."}
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
                  Datos de la asignación
                </Typography>

                {product ? (
                  <Box
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "#fff",
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
                      Producto compuesto
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

                    {component ? (
                      <Typography
                        sx={{
                          mt: 0.75,
                          fontSize: 14,
                          color: "text.secondary",
                          fontWeight: 700,
                        }}
                      >
                        Componente: {component.name}
                      </Typography>
                    ) : null}

                    {variant ? (
                      <Typography
                        sx={{
                          mt: 0.35,
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

                <Stack spacing={2}>
                  <FieldBlock
                    label="Componente *"
                    input={
                      <TextField
                        select
                        value={componentProductId}
                        onChange={(e) => setComponentProductId(e.target.value)}
                        disabled={filteredComponents.length === 0}
                      >
                        {filteredComponents.map((row) => (
                          <MenuItem
                            key={row.component_product_id}
                            value={String(row.component_product_id)}
                          >
                            {row.component_product?.name || "Componente sin nombre"}
                          </MenuItem>
                        ))}
                      </TextField>
                    }
                    help={
                      filteredComponents.length === 0
                        ? "Este producto compuesto no tiene componentes con variantes disponibles en este contexto."
                        : null
                    }
                  />

                  <FieldBlock
                    label="Variante del componente *"
                    input={
                      <TextField
                        select
                        value={componentVariantId}
                        onChange={(e) => setComponentVariantId(e.target.value)}
                        disabled={filteredVariants.length === 0}
                      >
                        {filteredVariants.map((row) => (
                          <MenuItem
                            key={row.variant.id}
                            value={String(row.variant.id)}
                          >
                            {row.variant.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    }
                    help={
                      filteredVariants.length === 0
                        ? "No hay variantes disponibles para este componente."
                        : null
                    }
                  />

                  <FieldBlock
                    label="Grupo *"
                    input={
                      <TextField
                        select
                        value={modifierGroupId}
                        onChange={(e) => setModifierGroupId(e.target.value)}
                        disabled={filteredGroups.length === 0}
                      >
                        {filteredGroups.map((group) => (
                          <MenuItem key={group.id} value={String(group.id)}>
                            {group.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    }
                    help={
                      filteredGroups.length === 0
                        ? "No hay grupos disponibles para asignar a variantes en este contexto."
                        : null
                    }
                  />

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
