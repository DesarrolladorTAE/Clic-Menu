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

  const title = useMemo(
    () => (isEdit ? "Editar opción" : "Nueva opción"),
    [isEdit]
  );

  const activeGroups = useMemo(
    () => (Array.isArray(groups) ? groups.filter((g) => g?.id) : []),
    [groups]
  );

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
      setModifierGroupId(String(editing?.modifier_group_id || ""));
      setName(editing?.name || "");
      setDescription(editing?.description || "");
      setPrice(String(editing?.price ?? 0));
      setMaxQuantityPerSelection(
        String(editing?.max_quantity_per_selection ?? 1)
      );
      setIsDefault(!!editing?.is_default);
      setAffectsTotal(
        editing?.affects_total === undefined ? true : !!editing?.affects_total
      );
      setTrackInventory(!!editing?.track_inventory);
      setSortOrder(String(editing?.sort_order ?? 0));
      setIsActive(!!editing?.is_active);
    } else {
      setModifierGroupId(
        activeGroups?.[0]?.id ? String(activeGroups[0].id) : ""
      );
      setName("");
      setDescription("");
      setPrice("0");
      setMaxQuantityPerSelection("1");
      setIsDefault(false);
      setAffectsTotal(true);
      setTrackInventory(false);
      setSortOrder("0");
      setIsActive(true);
    }
  }, [open, isEdit, editing, activeGroups]);

  const canSave = useMemo(() => {
    if (!modifierGroupId) return false;
    if (!name.trim()) return false;

    const parsedPrice = Number(price);
    const parsedMaxQty = Number(maxQuantityPerSelection);
    const parsedSort = Number(sortOrder);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) return false;
    if (!Number.isFinite(parsedMaxQty) || parsedMaxQty < 1) return false;
    if (!Number.isFinite(parsedSort) || parsedSort < 0) return false;

    return true;
  }, [modifierGroupId, name, price, maxQuantityPerSelection, sortOrder]);

  const save = async () => {
    const groupId = Number(modifierGroupId);

    if (!groupId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona un grupo para continuar.",
      });
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      max_quantity_per_selection: Number(maxQuantityPerSelection),
      is_default: isDefault,
      affects_total: affectsTotal,
      track_inventory: trackInventory,
      sort_order: Number(sortOrder),
      is_active: isActive,
    };

    if (!payload.name) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "El nombre de la opción es obligatorio.",
      });
      return;
    }

    if (
      !Number.isFinite(payload.price) ||
      payload.price < 0 ||
      !Number.isFinite(payload.max_quantity_per_selection) ||
      payload.max_quantity_per_selection < 1 ||
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

    setSaving(true);

    try {
      if (isEdit) {
        await api.updateModifierOption(
          restaurantId,
          groupId,
          editing.id,
          payload
        );
      } else {
        await api.createModifierOption(restaurantId, groupId, payload);
      }

      await onSaved?.();
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo guardar la opción de modificador",
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
                  ? "Actualiza la información de la opción."
                  : "Agrega una opción dentro de uno de tus grupos de modificadores."}
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
                  Datos de la opción
                </Typography>

                <Stack spacing={2}>
                  <FieldBlock
                    label="Grupo *"
                    input={
                      <TextField
                        select
                        value={modifierGroupId}
                        onChange={(e) => setModifierGroupId(e.target.value)}
                      >
                        {activeGroups.map((group) => (
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
                      label="Precio extra"
                      help="Usa 0 si no modifica el total."
                      input={
                        <TextField
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          inputProps={{ inputMode: "decimal" }}
                          placeholder="0"
                        />
                      }
                    />

                    <FieldBlock
                      label="Cantidad máxima por selección"
                      input={
                        <TextField
                          value={maxQuantityPerSelection}
                          onChange={(e) =>
                            setMaxQuantityPerSelection(e.target.value)
                          }
                          inputProps={{ inputMode: "numeric" }}
                          placeholder="1"
                        />
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Orden"
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
                            />
                          }
                          label={
                            <Typography sx={switchLabelSx}>
                              {affectsTotal
                                ? "Afecta total"
                                : "No afecta total"}
                            </Typography>
                          }
                        />

                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Switch
                              checked={trackInventory}
                              onChange={(e) =>
                                setTrackInventory(e.target.checked)
                              }
                              color="primary"
                            />
                          }
                          label={
                            <Typography sx={switchLabelSx}>
                              {trackInventory
                                ? "Controla inventario"
                                : "Sin inventario"}
                            </Typography>
                          }
                        />

                        {!isEdit && (
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
                        )}
                      </Stack>
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