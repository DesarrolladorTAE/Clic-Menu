import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import AppAlert from "../../components/common/AppAlert";
import { normalizeErr } from "../../utils/err";
import { getSuppliers } from "../../services/inventory/suppliers/suppliers.service";
import SupplierWizard from "./SupplierWizard";

const YIELD_UNITS = [
  { value: "g", label: "g (gramos)" },
  { value: "kg", label: "kg (kilogramos)" },
  { value: "ml", label: "ml (mililitros)" },
  { value: "l", label: "l (litros)" },
  { value: "pz", label: "pz (piezas)" },
];

export default function IngredientPresentationFormModal({
  open,
  onClose,
  restaurantId,
  ingredient,
  editRow,
  onSaved,
  api, // { createPresentation, updatePresentation }
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
  const [description, setDescription] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");

  const [yieldQty, setYieldQty] = useState("");
  const [yieldUnit, setYieldUnit] = useState("g");

  const [stockMin, setStockMin] = useState("");
  const [stockMax, setStockMax] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [status, setStatus] = useState("active");

  const [suppliers, setSuppliers] = useState([]);
  const [supLoading, setSupLoading] = useState(false);
  const [openSupplierWizard, setOpenSupplierWizard] = useState(false);

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

  const loadSuppliers = async () => {
    setSupLoading(true);
    try {
      const res = await getSuppliers(restaurantId, {
        only_active: false,
        q: "",
      });
      setSuppliers(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setSuppliers([]);
    } finally {
      setSupLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, restaurantId]);

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      setCode(editRow.code || "");
      setDescription(editRow.description || "");
      setSupplierId(editRow.supplier_id ? String(editRow.supplier_id) : "");
      setPurchaseCost(editRow.purchase_cost ?? "");
      setYieldQty(editRow.yield_qty ?? "");
      setYieldUnit(editRow.yield_unit || ingredient?.unit || "g");
      setStockMin(editRow.stock_min ?? "");
      setStockMax(editRow.stock_max ?? "");
      setStorageLocation(editRow.storage_location ?? "");
      setStatus(editRow.status || "active");
    } else {
      setCode("");
      setDescription("");
      setSupplierId("");
      setPurchaseCost("");
      setYieldQty("");
      setYieldUnit(ingredient?.unit || "g");
      setStockMin("");
      setStockMax("");
      setStorageLocation("");
      setStatus("active");
    }
  }, [open, isEdit, editRow, ingredient]);

  const title = isEdit ? "Editar presentación" : "Nueva presentación";

  const canSave = useMemo(() => {
    if (!description.trim()) return false;
    if (!purchaseCost || !Number.isFinite(Number(purchaseCost))) return false;
    if (!yieldQty || !Number.isFinite(Number(yieldQty))) return false;
    if (!yieldUnit) return false;
    return true;
  }, [description, purchaseCost, yieldQty, yieldUnit]);

  const save = async () => {
    const payload = {
      code: code.trim() || null,
      description: description.trim(),
      supplier_id: supplierId ? Number(supplierId) : null,
      purchase_cost: Number(purchaseCost),
      yield_qty: Number(yieldQty),
      yield_unit: yieldUnit,
      stock_min: stockMin === "" ? null : Number(stockMin),
      stock_max: stockMax === "" ? null : Number(stockMax),
      storage_location: storageLocation.trim() || null,
      status,
    };

    if (!Number.isFinite(payload.purchase_cost) || payload.purchase_cost <= 0) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "Costo de compra inválido.",
      });
      return;
    }

    if (!Number.isFinite(payload.yield_qty) || payload.yield_qty <= 0) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "Rinde inválido.",
      });
      return;
    }

    if (payload.stock_min !== null && !Number.isFinite(payload.stock_min)) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "Stock mínimo inválido.",
      });
      return;
    }

    if (payload.stock_max !== null && !Number.isFinite(payload.stock_max)) {
      showAlert({
        severity: "error",
        title: "Error",
        message: "Stock máximo inválido.",
      });
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        await api.updatePresentation(
          restaurantId,
          ingredient.id,
          editRow.id,
          payload
        );
      } else {
        await api.createPresentation(restaurantId, ingredient.id, payload);
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
                Ingrediente: <strong>{ingredient?.name || "—"}</strong> · Base:{" "}
                <strong>{ingredient?.unit || "—"}</strong>
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
                  Datos de la presentación
                </Typography>

                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Descripción *"
                      input={
                        <TextField
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Ej. Bolsa 1kg"
                        />
                      }
                    />

                    <FieldBlock
                      label="Código (opcional)"
                      input={
                        <TextField
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="Ej. BOLSA1KG"
                        />
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Proveedor"
                      help="Puedes guardar sin proveedor, pero esa presentación no debería activarse hasta asignarlo."
                      input={
                        <Stack direction="row" spacing={1}>
                          <FormControl fullWidth>
                            <Select
                              value={supplierId}
                              onChange={(e) => setSupplierId(e.target.value)}
                              disabled={supLoading}
                              displayEmpty
                              IconComponent={KeyboardArrowDownIcon}
                              sx={selectSx}
                            >
                              <MenuItem value="">
                                {supLoading
                                  ? "Cargando proveedores…"
                                  : "Selecciona un proveedor"}
                              </MenuItem>

                              {suppliers.map((s) => (
                                <MenuItem key={s.id} value={String(s.id)}>
                                  {s.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <Tooltip title="Administrar proveedores">
                            <IconButton
                              type="button"
                              onClick={() => setOpenSupplierWizard(true)}
                              sx={supplierActionSx}
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      }
                    />

                    <FieldBlock
                      label="Costo compra *"
                      input={
                        <TextField
                          value={purchaseCost}
                          onChange={(e) => setPurchaseCost(e.target.value)}
                          placeholder="Ej. 180"
                          inputProps={{ inputMode: "decimal" }}
                        />
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Rinde *"
                      input={
                        <TextField
                          value={yieldQty}
                          onChange={(e) => setYieldQty(e.target.value)}
                          placeholder={
                            ingredient?.unit === "g" ? "Ej. 1000" : "Ej. 1"
                          }
                          inputProps={{ inputMode: "decimal" }}
                        />
                      }
                    />

                    <FieldBlock
                      label="Unidad *"
                      help={`Se valida conversión hacia ${ingredient?.unit || "la unidad base"}.`}
                      input={
                        <FormControl fullWidth>
                          <Select
                            value={yieldUnit}
                            onChange={(e) => setYieldUnit(e.target.value)}
                            IconComponent={KeyboardArrowDownIcon}
                            sx={selectSx}
                          >
                            {YIELD_UNITS.map((u) => (
                              <MenuItem key={u.value} value={u.value}>
                                {u.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Stock mínimo (opcional)"
                      input={
                        <TextField
                          value={stockMin}
                          onChange={(e) => setStockMin(e.target.value)}
                          inputProps={{ inputMode: "decimal" }}
                          placeholder="Ej. 2"
                        />
                      }
                    />

                    <FieldBlock
                      label="Stock máximo (opcional)"
                      input={
                        <TextField
                          value={stockMax}
                          onChange={(e) => setStockMax(e.target.value)}
                          inputProps={{ inputMode: "decimal" }}
                          placeholder="Ej. 10"
                        />
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Ubicación (opcional)"
                      input={
                        <TextField
                          value={storageLocation}
                          onChange={(e) => setStorageLocation(e.target.value)}
                          placeholder="Ej. Estante frío 2"
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
                    ) : (
                      <Box sx={{ flex: 1, width: "100%" }} />
                    )}
                  </Stack>

                  {isEdit ? (
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "text.secondary",
                        lineHeight: 1.45,
                      }}
                    >
                      El estado de esta presentación se controla desde la pantalla principal con el switch de la tabla.
                    </Typography>
                  ) : null}
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

      <SupplierWizard
        open={openSupplierWizard}
        restaurantId={restaurantId}
        onClose={() => setOpenSupplierWizard(false)}
        onChanged={async () => {
          await loadSuppliers();
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

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};

const supplierActionSx = {
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
};