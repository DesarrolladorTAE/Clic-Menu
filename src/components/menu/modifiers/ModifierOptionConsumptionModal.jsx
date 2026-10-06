import { useEffect, useMemo, useState } from "react";
import {
  Box, Card, CardContent, Chip, CircularProgress, Dialog, DialogContent, DialogTitle,
  IconButton, Stack, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";

import AppAlert from "../../../components/common/AppAlert";
import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";
import {
  deleteModifierOptionConsumption,
  fetchCatalogIngredients,
  fetchCatalogProducts,
  fetchWarehousesByRestaurant,
  getModifierOptionConsumption,
  resolveModifierOptionConsumption,
  saveModifierOptionConsumption,
} from "../../../services/menu/modifiers/modifierOptionConsumption.service";

import ModifierOptionConsumptionTabs from "./ModifierOptionConsumptionTabs";
import ModifierOptionConsumptionMovementTab from "./ModifierOptionConsumptionMovementTab";
import ModifierOptionConsumptionTestTab from "./ModifierOptionConsumptionTestTab";
import { containerSx, optionNameSx, titleSx } from "./ModifierOptionConsumptionShared";

const EFFECT_ADD = "add";
const EFFECT_OMIT = "omit";
const TYPE_INGREDIENT = "ingredient";
const TYPE_PRODUCT = "product";

export default function ModifierOptionConsumptionModal({
  open,
  onClose,
  restaurantId,
  option,
  groupLabel,
  effectiveBranchId = null,
  requiresBranch = false,
  onSaved,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tab, setTab] = useState("movimiento");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testing, setTesting] = useState(false);

  const [ingredients, setIngredients] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [consumptionId, setConsumptionId] = useState(null);
  const [effect, setEffect] = useState(EFFECT_ADD);
  const [consumptionType, setConsumptionType] = useState(TYPE_INGREDIENT);
  const [ingredientId, setIngredientId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");

  const [testBranchId, setTestBranchId] = useState("");
  const [testWarehouseId, setTestWarehouseId] = useState("");
  const [testOptionQty, setTestOptionQty] = useState("1");
  const [resolveResult, setResolveResult] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const trackInventory = !!option?.track_inventory;
  const busy = saving || deleting || testing;

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const getErrorMessage = (e, fallback) => {
    const data = e?.response?.data || {};

    const messages = {
      MODIFIER_OMIT_REQUIRES_INGREDIENT: "Para omitir consumo debes seleccionar un ingrediente.",
      MODIFIER_INVENTORY_CONSUMPTION_REQUIRED: "Esta opción debe tener configurado un consumo de inventario.",
      MODIFIER_EFFECT_NOT_ALLOWED_BY_PLAN: "El plan actual no permite esta configuración de inventario.",
      INGREDIENT_NOT_STOCK_ITEM: "El ingrediente seleccionado no controla existencias.",
      INGREDIENT_INACTIVE: "El ingrediente seleccionado está inactivo.",
      PRODUCT_INACTIVE: "El producto seleccionado está inactivo.",
      INGREDIENT_NOT_FOUND: "El ingrediente seleccionado ya no está disponible.",
      PRODUCT_NOT_FOUND: "El producto seleccionado ya no está disponible.",
      WAREHOUSE_NOT_FOUND: "El almacén seleccionado ya no está disponible.",
    };

    return messages[data?.code] || data?.message || fallback;
  };

  const currentStatusLabel = useMemo(() => {
    if (!trackInventory) return "Sin control de inventario";
    return consumptionId ? "Configurado" : "Sin configurar";
  }, [trackInventory, consumptionId]);

  const currentStatusColor = useMemo(() => {
    if (!trackInventory) return { bg: "#ECEFF1", color: "#455A64" };
    if (!consumptionId) return { bg: "#FFF3E0", color: "#A75A00" };
    return { bg: "#E8F5E9", color: "#1B5E20" };
  }, [trackInventory, consumptionId]);

  const filteredWarehouses = useMemo(() => {
    const branchId = Number(testBranchId);
    if (!branchId) return [];

    return warehouses.filter((warehouse) => Number(warehouse.branch_id) === branchId);
  }, [warehouses, testBranchId]);

  const canSave = useMemo(() => {
    if (!trackInventory) return false;
    if (![EFFECT_ADD, EFFECT_OMIT].includes(effect)) return false;
    if (![TYPE_INGREDIENT, TYPE_PRODUCT].includes(consumptionType)) return false;
    if (effect === EFFECT_OMIT && consumptionType !== TYPE_INGREDIENT) return false;

    const numericQty = Number(qty);
    if (!Number.isFinite(numericQty) || numericQty <= 0) return false;
    if (consumptionType === TYPE_INGREDIENT && !ingredientId) return false;
    if (consumptionType === TYPE_PRODUCT && !productId) return false;

    return true;
  }, [trackInventory, effect, consumptionType, qty, ingredientId, productId]);

  const canTest = useMemo(() => {
    if (!trackInventory || !consumptionId) return false;

    const branchId = Number(testBranchId);
    const optionQty = Number(testOptionQty);

    if (!Number.isFinite(branchId) || branchId <= 0) return false;
    if (!Number.isFinite(optionQty) || optionQty <= 0) return false;

    return true;
  }, [trackInventory, consumptionId, testBranchId, testOptionQty]);

  const resetConsumption = () => {
    setConsumptionId(null);
    setEffect(EFFECT_ADD);
    setConsumptionType(TYPE_INGREDIENT);
    setIngredientId("");
    setProductId("");
    setQty("1");
    setStatus("active");
    setNotes("");
    setResolveResult(null);
  };

  const resetAll = () => {
    resetConsumption();
    setTab("movimiento");
    setTestBranchId("");
    setTestWarehouseId("");
    setTestOptionQty("1");
  };

  const applyConsumption = (row) => {
    if (!row) {
      resetConsumption();
      return;
    }

    const currentEffect = row?.effect === EFFECT_OMIT ? EFFECT_OMIT : EFFECT_ADD;
    const currentType = row?.consumption_type === TYPE_PRODUCT ? TYPE_PRODUCT : TYPE_INGREDIENT;

    setConsumptionId(row?.id ?? null);
    setEffect(currentEffect);
    setConsumptionType(currentEffect === EFFECT_OMIT ? TYPE_INGREDIENT : currentType);
    setIngredientId(row?.ingredient_id ? String(row.ingredient_id) : "");
    setProductId(currentEffect === EFFECT_OMIT ? "" : row?.product_id ? String(row.product_id) : "");
    setQty(row?.qty !== null && row?.qty !== undefined ? String(row.qty) : "1");
    setStatus(row?.status === "inactive" ? "inactive" : "active");
    setNotes(row?.notes || "");
    setResolveResult(null);
  };

  useEffect(() => {
    if (open) {
      setTab("movimiento");
      return;
    }

    resetAll();
    setIngredients([]);
    setProducts([]);
    setBranches([]);
    setWarehouses([]);
    setLoading(false);
    setSaving(false);
    setDeleting(false);
    setTesting(false);
  }, [open]);

  useEffect(() => {
    if (trackInventory) return;
    if (tab === "prueba") setTab("movimiento");
  }, [trackInventory, tab]);

  useEffect(() => {
    if (!open || !option?.id || !option?.modifier_group_id) return;

    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setResolveResult(null);
      setTestWarehouseId("");
      setTestOptionQty("1");

      try {
        const [consumption, ingredientRows, productRows, branchRows, warehouseRows] = await Promise.all([
          getModifierOptionConsumption(restaurantId, option.modifier_group_id, option.id),
          trackInventory
            ? fetchCatalogIngredients(restaurantId, { only_active: true, q: "" })
            : Promise.resolve([]),
          trackInventory ? fetchCatalogProducts(restaurantId) : Promise.resolve([]),
          trackInventory ? getBranchesByRestaurant(restaurantId).catch(() => []) : Promise.resolve([]),
          trackInventory ? fetchWarehousesByRestaurant(restaurantId).catch(() => []) : Promise.resolve([]),
        ]);

        if (!mounted) return;

        const safeIngredients = (Array.isArray(ingredientRows) ? ingredientRows : []).filter((item) => {
          if (item?.status && item.status !== "active") return false;
          if (item?.is_stock_item === false || Number(item?.is_stock_item) === 0) return false;
          return true;
        });

        const safeProducts = (Array.isArray(productRows) ? productRows : []).filter((item) => {
          return !item?.status || item.status === "active";
        });

        const safeBranches = Array.isArray(branchRows) ? branchRows : [];
        const safeWarehouses = Array.isArray(warehouseRows) ? warehouseRows : [];

        setIngredients(safeIngredients);
        setProducts(safeProducts);
        setBranches(safeBranches);
        setWarehouses(safeWarehouses);
        applyConsumption(consumption);

        const defaultBranchId =
          effectiveBranchId ||
          option?.branch_id ||
          option?.group?.branch_id ||
          safeBranches?.[0]?.id ||
          "";

        setTestBranchId(defaultBranchId ? String(defaultBranchId) : "");
      } catch (e) {
        if (!mounted) return;

        showAlert({
          severity: "error",
          title: "Error",
          message: getErrorMessage(e, "No se pudo cargar la configuración de inventario."),
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [open, restaurantId, option, effectiveBranchId, trackInventory]);

  useEffect(() => {
    if (!testBranchId) {
      setTestWarehouseId("");
      return;
    }

    const exists = filteredWarehouses.some(
      (warehouse) => String(warehouse.id) === String(testWarehouseId)
    );

    if (!exists) setTestWarehouseId("");
  }, [testBranchId, filteredWarehouses, testWarehouseId]);

  const handleEffectChange = (value) => {
    setEffect(value);
    setResolveResult(null);

    if (value === EFFECT_OMIT) {
      setConsumptionType(TYPE_INGREDIENT);
      setProductId("");
    }
  };

  const handleConsumptionTypeChange = (value) => {
    if (effect === EFFECT_OMIT && value !== TYPE_INGREDIENT) return;

    setConsumptionType(value);
    setResolveResult(null);

    if (value === TYPE_INGREDIENT) {
      setProductId("");
      return;
    }

    setIngredientId("");
  };

  const handleIngredientChange = (value) => {
    setIngredientId(value);
    setResolveResult(null);
  };

  const handleProductChange = (value) => {
    setProductId(value);
    setResolveResult(null);
  };

  const handleQtyChange = (value) => {
    setQty(value);
    setResolveResult(null);
  };

  const handleTestBranchChange = (value) => {
    setTestBranchId(value);
    setTestWarehouseId("");
    setResolveResult(null);
  };

  const handleTestWarehouseChange = (value) => {
    setTestWarehouseId(value);
    setResolveResult(null);
  };

  const handleTestOptionQtyChange = (value) => {
    setTestOptionQty(value);
    setResolveResult(null);
  };

  const handleSave = async () => {
    if (!option?.id || !option?.modifier_group_id) return;

    if (!trackInventory) {
      showAlert({
        severity: "warning",
        title: "No disponible",
        message: "Activa el control de inventario de la opción antes de configurar su consumo.",
      });
      return;
    }

    if (!canSave) {
      showAlert({
        severity: "warning",
        title: "Revisa la información",
        message: "Completa correctamente el tipo, recurso y cantidad.",
      });
      return;
    }

    const payload = {
      effect,
      consumption_type: consumptionType,
      qty: Number(qty),
      status,
      notes: notes.trim() || null,
    };

    if (consumptionType === TYPE_INGREDIENT) payload.ingredient_id = Number(ingredientId);
    if (consumptionType === TYPE_PRODUCT) payload.product_id = Number(productId);

    setSaving(true);

    try {
      const saved = await saveModifierOptionConsumption(
        restaurantId,
        option.modifier_group_id,
        option.id,
        payload
      );

      applyConsumption(saved);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Configuración de inventario guardada correctamente.",
      });

      await onSaved?.();
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: getErrorMessage(e, "No se pudo guardar la configuración de inventario."),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!option?.id || !option?.modifier_group_id || !consumptionId) return;

    const ok = window.confirm("¿Eliminar la configuración de inventario de esta opción?");
    if (!ok) return;

    setDeleting(true);

    try {
      await deleteModifierOptionConsumption(
        restaurantId,
        option.modifier_group_id,
        option.id
      );

      resetConsumption();
      setTab("movimiento");

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Configuración de inventario eliminada correctamente.",
      });

      await onSaved?.();
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: getErrorMessage(e, "No se pudo eliminar la configuración de inventario."),
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleResolve = async () => {
    if (!option?.id || !option?.modifier_group_id) return;

    if (!consumptionId) {
      showAlert({
        severity: "warning",
        title: "Guarda primero",
        message: "Guarda la configuración antes de realizar una prueba.",
      });
      return;
    }

    const branchId = Number(testBranchId);
    const optionQty = Number(testOptionQty);

    if (!Number.isFinite(branchId) || branchId <= 0) {
      showAlert({
        severity: "warning",
        title: "Sucursal requerida",
        message: "Selecciona una sucursal para realizar la prueba.",
      });
      return;
    }

    if (!Number.isFinite(optionQty) || optionQty <= 0) {
      showAlert({
        severity: "warning",
        title: "Cantidad inválida",
        message: "La cantidad de la opción debe ser mayor a 0.",
      });
      return;
    }

    setTesting(true);
    setResolveResult(null);

    try {
      const response = await resolveModifierOptionConsumption(
        restaurantId,
        option.modifier_group_id,
        option.id,
        {
          branch_id: branchId,
          effect,
          option_quantity: optionQty,
          warehouse_id: testWarehouseId ? Number(testWarehouseId) : undefined,
        }
      );

      setResolveResult(response);
    } catch (e) {
      const message = getErrorMessage(e, "No se pudo realizar la prueba con esta configuración.");

      setResolveResult({
        ok: false,
        message,
        data: e?.response?.data?.data || null,
      });

      showAlert({
        severity: "error",
        title: "No se pudo completar la prueba",
        message,
      });
    } finally {
      setTesting(false);
    }
  };

  if (!open || !option) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={busy ? undefined : onClose}
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
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "#111111", color: "#fff" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1.2,
                  color: "#fff",
                }}
              >
                Configuración de inventario
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                  wordBreak: "break-word",
                }}
              >
                Define cómo esta opción agrega o reduce el consumo de existencias.
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              disabled={busy}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.08)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default" }}>
          {loading ? (
            <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress color="primary" />
                <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                  Cargando configuración…
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              <Card sx={containerSx}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1.5}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={titleSx}>Opción</Typography>
                        <Typography sx={optionNameSx}>{option?.name}</Typography>
                      </Box>

                      <Chip
                        label={currentStatusLabel}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          bgcolor: currentStatusColor.bg,
                          color: currentStatusColor.color,
                        }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Chip label={`Grupo: ${groupLabel || "Sin grupo"}`} size="small" />
                      <Chip
                        label={trackInventory ? "Controla inventario" : "Sin control de inventario"}
                        size="small"
                      />

                      {trackInventory && consumptionId ? (
                        <Chip
                          label={effect === EFFECT_OMIT ? "Omite consumo" : "Agrega consumo"}
                          size="small"
                        />
                      ) : null}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <ModifierOptionConsumptionTabs
                tab={tab}
                onChange={setTab}
                testDisabled={!trackInventory}
              />

              {tab === "movimiento" ? (
                <ModifierOptionConsumptionMovementTab
                  trackInventory={trackInventory}
                  consumptionId={consumptionId}
                  ingredients={ingredients}
                  products={products}
                  effect={effect}
                  consumptionType={consumptionType}
                  ingredientId={ingredientId}
                  productId={productId}
                  qty={qty}
                  status={status}
                  notes={notes}
                  saving={saving}
                  deleting={deleting}
                  busy={busy}
                  canSave={canSave}
                  onEffectChange={handleEffectChange}
                  onConsumptionTypeChange={handleConsumptionTypeChange}
                  onIngredientChange={handleIngredientChange}
                  onProductChange={handleProductChange}
                  onQtyChange={handleQtyChange}
                  onStatusChange={setStatus}
                  onNotesChange={setNotes}
                  onSave={handleSave}
                  onDelete={handleDelete}
                />
              ) : (
                <ModifierOptionConsumptionTestTab
                  trackInventory={trackInventory}
                  consumptionId={consumptionId}
                  branches={branches}
                  filteredWarehouses={filteredWarehouses}
                  requiresBranch={requiresBranch}
                  effectiveBranchId={effectiveBranchId}
                  testBranchId={testBranchId}
                  testWarehouseId={testWarehouseId}
                  testOptionQty={testOptionQty}
                  effect={effect}
                  resolveResult={resolveResult}
                  testing={testing}
                  saving={saving}
                  deleting={deleting}
                  busy={busy}
                  canTest={canTest}
                  onBranchChange={handleTestBranchChange}
                  onWarehouseChange={handleTestWarehouseChange}
                  onOptionQtyChange={handleTestOptionQtyChange}
                  onResolve={handleResolve}
                />
              )}
            </Stack>
          )}
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