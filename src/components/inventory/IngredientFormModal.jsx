// src/components/inventory/ingredients/IngredientFormModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, Card, CardContent, Checkbox, Dialog, DialogContent, DialogTitle, FormControl,
  FormControlLabel, IconButton, MenuItem, Select, Stack, TextField, Tooltip, Typography,
  useMediaQuery, Alert,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import AppAlert from "../../components/common/AppAlert";

import { normalizeErr } from "../../utils/err";
import { getIngredientGroups } from "../../services/inventory/ingredients/ingredientsGroups.service";
import IngredientGroupWizard from "./IngredientsGroupWizard";


const UNITS = [
  { value: "g", label: "g (gramos)" },
  { value: "ml", label: "ml (mililitros)" },
  { value: "pz", label: "pz (piezas)" },
];

export default function IngredientFormModal({
  open,
  onClose,
  restaurantId,
  editRow,
  onSaved,
  api,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isEdit = !!editRow?.id;

  const [saving, setSaving] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("g");

  const [ingredientGroupId, setIngredientGroupId] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [openGroupWizard, setOpenGroupWizard] = useState(false);

  const [wastePercentage, setWastePercentage] = useState("");
  const [isStockItem, setIsStockItem] = useState(true);
  const [status, setStatus] = useState("active");

  const reqRef = useRef(0);

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

  const loadGroups = async () => {
    const myReq = ++reqRef.current;
    setGroupsLoading(true);

    try {
      const res = await getIngredientGroups(restaurantId);
      if (myReq !== reqRef.current) return;
      setGroups(res?.data || []);
    } catch {
      if (myReq !== reqRef.current) return;
      setGroups([]);
    } finally {
      if (myReq !== reqRef.current) return;
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadGroups();
    // eslint-disable-next-line
  }, [open, restaurantId]);

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      setCode(editRow.code || "");
      setName(editRow.name || "");
      setUnit(editRow.unit || "g");
      setIngredientGroupId(
        editRow.ingredient_group_id ? String(editRow.ingredient_group_id) : ""
      );
      setWastePercentage(editRow.waste_percentage ?? "");
      setIsStockItem(!!editRow.is_stock_item);
      setStatus(editRow.status || "active");
    } else {
      setCode("");
      setName("");
      setUnit("g");
      setIngredientGroupId("");
      setWastePercentage("");
      setIsStockItem(true);
      setStatus("active");
    }
  }, [open, isEdit, editRow]);

  const hasGroups = useMemo(() => {
    if (groupsLoading) return true;
    return Array.isArray(groups) && groups.length > 0;
  }, [groups, groupsLoading]);

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    if (!unit) return false;
    if (!hasGroups) return false;
    if (!ingredientGroupId) return false;
    return true;
  }, [name, unit, ingredientGroupId, hasGroups]);

  const title = isEdit ? "Editar ingrediente" : "Nuevo ingrediente";

  const save = async () => {
    if (!hasGroups) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "No hay grupos. Crea un grupo primero con el botón +.",
      });
      return;
    }

    if (!ingredientGroupId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona un grupo.",
      });
      return;
    }

    const payload = {
      code: code.trim() || null,
      name: name.trim(),
      unit,
      ingredient_group_id: Number(ingredientGroupId),
      is_stock_item: !!isStockItem,
      waste_percentage:
        wastePercentage === "" ? null : Number(wastePercentage),
      status,
    };

    if (!Number.isFinite(payload.ingredient_group_id)) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "Grupo inválido.",
      });
      return;
    }

    if (
      payload.waste_percentage !== null &&
      !Number.isFinite(payload.waste_percentage)
    ) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "Merma inválida.",
      });
      return;
    }

    if (
      payload.waste_percentage !== null &&
      (payload.waste_percentage < 0 || payload.waste_percentage > 100)
    ) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "La merma debe estar entre 0 y 100.",
      });
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        await api.updateIngredient(restaurantId, editRow.id, payload);
      } else {
        await api.createIngredient(restaurantId, payload);
      }

      await onSaved?.();
      onClose?.();
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo guardar"),
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
                  ? "Actualiza la información principal del ingrediente."
                  : "Crea un nuevo ingrediente y asígnale un grupo desde el inicio."}
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
            {!groupsLoading && groups.length === 0 && (
              <Alert
                severity="warning"
                sx={{
                  borderRadius: 1,
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                    Sin grupos disponibles
                  </Typography>
                  <Typography variant="body2">
                    Primero crea un grupo de ingredientes con el botón + para poder guardar.
                  </Typography>
                </Box>
              </Alert>
            )}

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
                    Datos del ingrediente
                  </Typography>

                  <Stack spacing={2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <FieldBlock
                        label="Nombre *"
                        input={
                          <TextField
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej. Queso"
                          />
                        }
                      />

                      <FieldBlock
                        label="Clave (opcional)"
                        input={
                          <TextField
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Ej. QSO001"
                          />
                        }
                      />
                    </Stack>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <FieldBlock
                        label="Unidad base *"
                        input={
                          <FormControl fullWidth>
                            <Select
                              value={unit}
                              onChange={(e) => setUnit(e.target.value)}
                              IconComponent={KeyboardArrowDownIcon}
                              sx={selectSx}
                            >
                              {UNITS.map((u) => (
                                <MenuItem key={u.value} value={u.value}>
                                  {u.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        }
                      />

                      <FieldBlock
                        label="Grupo *"
                        help="El grupo viene de ingredient_groups. Si no existe, debes crearlo."
                        input={
                          <Stack direction="row" spacing={1}>
                            <FormControl fullWidth>
                              <Select
                                value={ingredientGroupId}
                                onChange={(e) => setIngredientGroupId(e.target.value)}
                                disabled={groupsLoading || groups.length === 0}
                                displayEmpty
                                IconComponent={KeyboardArrowDownIcon}
                                sx={selectSx}
                              >
                                <MenuItem value="">
                                  {groupsLoading
                                    ? "Cargando grupos..."
                                    : groups.length === 0
                                    ? "No hay grupos"
                                    : "Selecciona un grupo"}
                                </MenuItem>

                                {groups.map((g) => (
                                  <MenuItem key={g.id} value={String(g.id)}>
                                    {g.name} {g.status === "inactive" ? "(Inactivo)" : ""}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            <Tooltip title="Administrar grupos">
                              <IconButton
                                type="button"
                                onClick={() => setOpenGroupWizard(true)}
                                sx={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 1.5,
                                  border: "1px solid",
                                  borderColor: "primary.main",
                                  bgcolor: "primary.main",
                                  color: "#fff",
                                  flexShrink: 0,
                                  "&:hover": {
                                    bgcolor: "primary.dark",
                                    borderColor: "primary.dark",
                                  },
                                  "&:disabled": {
                                    bgcolor: "action.disabledBackground",
                                    borderColor: "action.disabledBackground",
                                    color: "action.disabled",
                                  },
                                }}
                              >
                                <AddIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        }
                      />
                    </Stack>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <FieldBlock
                        label="Merma (%)"
                        help="Valor entre 0 y 100. Si lo dejas vacío, quedará como NULL."
                        input={
                          <TextField
                            value={wastePercentage}
                            onChange={(e) => setWastePercentage(e.target.value)}
                            placeholder="Ej. 5"
                            inputProps={{ inputMode: "decimal" }}
                          />
                        }
                      />

                      {!isEdit ? (
                        <FieldBlock
                          label="Estado"
                          input={
                            <FormControl fullWidth>
                              <Select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                IconComponent={KeyboardArrowDownIcon}
                                sx={selectSx}
                              >
                                <MenuItem value="active">Activo</MenuItem>
                                <MenuItem value="inactive">Inactivo</MenuItem>
                              </Select>
                            </FormControl>
                          }
                        />
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
                            Inventariable
                          </Typography>

                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={!!isStockItem}
                                onChange={(e) => setIsStockItem(e.target.checked)}
                                sx={{
                                  color: "primary.main",
                                  "&.Mui-checked": {
                                    color: "primary.main",
                                  },
                                }}
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
                                Este ingrediente se controla en inventario
                              </Typography>
                            }
                            sx={{ m: 0 }}
                          />
                        </Box>
                      )}
                    </Stack>

                    {!isEdit && (
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "text.primary",
                            mb: 1,
                          }}
                        >
                          Inventariable
                        </Typography>

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!isStockItem}
                              onChange={(e) => setIsStockItem(e.target.checked)}
                              sx={{
                                color: "primary.main",
                                "&.Mui-checked": {
                                  color: "primary.main",
                                },
                              }}
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
                              Este ingrediente se controla en inventario
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                      </Box>
                    )}

                    {isEdit && (
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "text.secondary",
                          lineHeight: 1.45,
                        }}
                      >
                        Nota: <code>last_cost</code> y <code>avg_cost</code> no se editan aquí. Se calculan con compras reales.
                      </Typography>
                    )}
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
          </Stack>
        </DialogContent>
      </Dialog>

      <IngredientGroupWizard
        open={openGroupWizard}
        restaurantId={restaurantId}
        onClose={() => setOpenGroupWizard(false)}
        onChanged={async (evt) => {
          const res = await getIngredientGroups(restaurantId);
          const next = res?.data || [];
          setGroups(next);

          if (evt?.type === "create" && evt?.created?.id) {
            setIngredientGroupId(String(evt.created.id));
          } else {
            if (
              ingredientGroupId &&
              !next.some((g) => String(g.id) === String(ingredientGroupId))
            ) {
              setIngredientGroupId("");
            }
          }
        }}
      />

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

const selectSx = {
  bgcolor: "#F4F4F4",
  borderRadius: 0,
  minHeight: 44,
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1.5px solid #FF9800",
  },
  "& .MuiSelect-select": {
    py: 1.25,
    px: 1.5,
    fontSize: 14,
    color: "text.primary",
  },
};