import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import SaveIcon from "@mui/icons-material/Save";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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

const CONSUMPTION_TYPE_NONE = "none";
const CONSUMPTION_TYPE_INGREDIENT = "ingredient";
const CONSUMPTION_TYPE_PRODUCT = "product";

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

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testing, setTesting] = useState(false);

  const [ingredients, setIngredients] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [consumptionId, setConsumptionId] = useState(null);
  const [consumptionType, setConsumptionType] = useState(CONSUMPTION_TYPE_NONE);
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

  const currentStatusLabel = useMemo(() => {
    if (!trackInventory) return "No aplica";
    if (consumptionType === CONSUMPTION_TYPE_NONE || !consumptionId) {
      return "Sin configurar";
    }
    return "Configurado";
  }, [trackInventory, consumptionType, consumptionId]);

  const currentStatusColor = useMemo(() => {
    if (!trackInventory) return { bg: "#ECEFF1", color: "#455A64" };
    if (consumptionType === CONSUMPTION_TYPE_NONE || !consumptionId) {
      return { bg: "#FFF3E0", color: "#A75A00" };
    }
    return { bg: "#E8F5E9", color: "#1B5E20" };
  }, [trackInventory, consumptionType, consumptionId]);

  const selectedIngredient = useMemo(
    () =>
      ingredients.find((item) => Number(item.id) === Number(ingredientId)) ||
      null,
    [ingredients, ingredientId]
  );

  const selectedProduct = useMemo(
    () => products.find((item) => Number(item.id) === Number(productId)) || null,
    [products, productId]
  );

  const evaluation = useMemo(() => {
    return resolveResult?.data?.evaluation ?? null;
  }, [resolveResult]);

  const ingredientRequirements = useMemo(() => {
    return resolveResult?.data?.resolved_requirements?.ingredients ?? [];
  }, [resolveResult]);

  const productRequirements = useMemo(() => {
    return resolveResult?.data?.resolved_requirements?.products ?? [];
  }, [resolveResult]);

  const traceRequirements = useMemo(() => {
    return resolveResult?.data?.resolved_requirements?.trace ?? [];
  }, [resolveResult]);

  const filteredWarehouses = useMemo(() => {
    const numericBranchId = Number(testBranchId);
    if (!numericBranchId) return [];
    return warehouses.filter(
      (warehouse) => Number(warehouse.branch_id) === numericBranchId
    );
  }, [warehouses, testBranchId]);

  const canSave = useMemo(() => {
    if (!trackInventory) return false;

    if (consumptionType === CONSUMPTION_TYPE_NONE) return true;

    const numericQty = Number(qty);
    if (!Number.isFinite(numericQty) || numericQty <= 0) return false;

    if (consumptionType === CONSUMPTION_TYPE_INGREDIENT && !ingredientId) {
      return false;
    }

    if (consumptionType === CONSUMPTION_TYPE_PRODUCT && !productId) {
      return false;
    }

    return true;
  }, [trackInventory, consumptionType, qty, ingredientId, productId]);

  const resetForm = () => {
    setConsumptionId(null);
    setConsumptionType(CONSUMPTION_TYPE_NONE);
    setIngredientId("");
    setProductId("");
    setQty("1");
    setStatus("active");
    setNotes("");

    setTestBranchId("");
    setTestWarehouseId("");
    setTestOptionQty("1");

    setResolveResult(null);
  };

  // Limpia completamente cuando el modal se cierra
  useEffect(() => {
    if (open) return;

    resetForm();
    setIngredients([]);
    setProducts([]);
    setBranches([]);
    setWarehouses([]);
    setLoading(false);
    setSaving(false);
    setDeleting(false);
    setTesting(false);
  }, [open]);

  // Limpia resultados previos cuando cambia la opción
  useEffect(() => {
    setResolveResult(null);
    setTestWarehouseId("");
    setTestOptionQty("1");
  }, [option?.id]);

  useEffect(() => {
    if (!open || !option?.id || !option?.modifier_group_id) return;

    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setResolveResult(null);
      setTestWarehouseId("");
      setTestOptionQty("1");

      try {
        const [
          consumption,
          ingredientRows,
          productRows,
          branchRows,
          warehouseRows,
        ] = await Promise.all([
          getModifierOptionConsumption(
            restaurantId,
            option.modifier_group_id,
            option.id
          ),
          fetchCatalogIngredients(restaurantId, {
            only_active: false,
            q: "",
          }),
          fetchCatalogProducts(restaurantId),
          getBranchesByRestaurant(restaurantId).catch(() => []),
          fetchWarehousesByRestaurant(restaurantId).catch(() => []),
        ]);

        if (!mounted) return;

        const safeBranches = Array.isArray(branchRows) ? branchRows : [];
        const safeWarehouses = Array.isArray(warehouseRows) ? warehouseRows : [];

        setIngredients(Array.isArray(ingredientRows) ? ingredientRows : []);
        setProducts(Array.isArray(productRows) ? productRows : []);
        setBranches(safeBranches);
        setWarehouses(safeWarehouses);

        const defaultBranchId =
          effectiveBranchId ||
          option?.branch_id ||
          option?.group?.branch_id ||
          safeBranches?.[0]?.id ||
          "";

        if (consumption) {
          setConsumptionId(consumption.id ?? null);
          setConsumptionType(
            consumption?.consumption_type || CONSUMPTION_TYPE_NONE
          );
          setIngredientId(
            consumption?.ingredient_id ? String(consumption.ingredient_id) : ""
          );
          setProductId(
            consumption?.product_id ? String(consumption.product_id) : ""
          );
          setQty(
            consumption?.qty !== null && consumption?.qty !== undefined
              ? String(consumption.qty)
              : "1"
          );
          setStatus(consumption?.status || "active");
          setNotes(consumption?.notes || "");
          setTestBranchId(defaultBranchId ? String(defaultBranchId) : "");
        } else {
          resetForm();
          setTestBranchId(defaultBranchId ? String(defaultBranchId) : "");
        }
      } catch (e) {
        if (!mounted) return;

        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudo cargar la configuración de consumo.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [open, restaurantId, option, effectiveBranchId]);

  useEffect(() => {
    if (!testBranchId) {
      setTestWarehouseId("");
      return;
    }

    const stillExists = filteredWarehouses.some(
      (warehouse) => String(warehouse.id) === String(testWarehouseId)
    );

    if (!stillExists) {
      setTestWarehouseId("");
    }
  }, [testBranchId, filteredWarehouses, testWarehouseId]);

  const handleConsumptionTypeChange = (value) => {
    setConsumptionType(value);
    setResolveResult(null);

    if (value === CONSUMPTION_TYPE_NONE) {
      setIngredientId("");
      setProductId("");
      setQty("1");
      return;
    }

    if (value === CONSUMPTION_TYPE_INGREDIENT) {
      setProductId("");
      return;
    }

    if (value === CONSUMPTION_TYPE_PRODUCT) {
      setIngredientId("");
    }
  };

  const handleSave = async () => {
    if (!option?.id || !option?.modifier_group_id) return;

    if (!trackInventory) {
      showAlert({
        severity: "warning",
        title: "No aplica",
        message:
          "Esta opción no controla inventario, así que no necesita consumo configurado.",
      });
      return;
    }

    if (!canSave) {
      showAlert({
        severity: "warning",
        title: "Revisa el formulario",
        message:
          "Completa correctamente el tipo de consumo y la cantidad requerida.",
      });
      return;
    }

    const payload = {
      consumption_type: consumptionType,
      status,
      notes: notes.trim() || null,
    };

    if (consumptionType === CONSUMPTION_TYPE_INGREDIENT) {
      payload.ingredient_id = Number(ingredientId);
      payload.qty = Number(qty);
    }

    if (consumptionType === CONSUMPTION_TYPE_PRODUCT) {
      payload.product_id = Number(productId);
      payload.qty = Number(qty);
    }

    setSaving(true);

    try {
      const saved = await saveModifierOptionConsumption(
        restaurantId,
        option.modifier_group_id,
        option.id,
        payload
      );

      setConsumptionId(saved?.id ?? null);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Consumo guardado correctamente.",
      });

      await onSaved?.();
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo guardar la configuración de consumo.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!option?.id || !option?.modifier_group_id) return;

    const ok = window.confirm(
      "¿Eliminar la configuración de consumo de esta opción?"
    );
    if (!ok) return;

    setDeleting(true);

    try {
      await deleteModifierOptionConsumption(
        restaurantId,
        option.modifier_group_id,
        option.id
      );

      resetForm();

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Consumo eliminado correctamente.",
      });

      await onSaved?.();
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo eliminar la configuración de consumo.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleResolve = async () => {
    if (!option?.id || !option?.modifier_group_id) return;

    if (!trackInventory) {
      showAlert({
        severity: "warning",
        title: "No aplica",
        message: "Esta opción no controla inventario.",
      });
      return;
    }

    const numericBranchId = Number(testBranchId);
    const numericOptionQty = Number(testOptionQty);

    if (!Number.isFinite(numericBranchId) || numericBranchId <= 0) {
      showAlert({
        severity: "warning",
        title: "Sucursal requerida",
        message: "Selecciona una sucursal para probar el consumo.",
      });
      return;
    }

    if (!Number.isFinite(numericOptionQty) || numericOptionQty <= 0) {
      showAlert({
        severity: "warning",
        title: "Cantidad inválida",
        message: "La cantidad de prueba debe ser mayor a 0.",
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
          branch_id: numericBranchId,
          option_quantity: numericOptionQty,
          warehouse_id: testWarehouseId ? Number(testWarehouseId) : undefined,
        }
      );

      setResolveResult(response);
    } catch (e) {
      const data = e?.response?.data || {};

      setResolveResult({
        ok: false,
        code: data?.code || null,
        message:
          data?.message || "No se pudo resolver el consumo para esta opción.",
        data: data?.data || null,
      });

      showAlert({
        severity: "error",
        title: "Prueba fallida",
        message:
          data?.message || "No se pudo resolver el consumo para esta opción.",
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
        onClose={saving || deleting || testing ? undefined : onClose}
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
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1.2,
                  color: "#fff",
                }}
              >
                Consumo de opción
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                  wordBreak: "break-word",
                }}
              >
                Configura qué descuenta esta opción cuando se selecciona.
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              disabled={saving || deleting || testing}
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
          {loading ? (
            <Box
              sx={{
                minHeight: 320,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Stack spacing={2} alignItems="center">
                <CircularProgress color="primary" />
                <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                  Cargando configuración de consumo…
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              <Card
                sx={{
                  borderRadius: 0,
                  backgroundColor: "background.paper",
                  boxShadow: "none",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                      spacing={1.5}
                    >
                      <Box>
                        <Typography sx={titleSx}>Encabezado</Typography>
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

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={`Grupo: ${groupLabel || "Sin grupo"}`}
                        size="small"
                      />
                      <Chip
                        label={
                          trackInventory
                            ? "track_inventory: true"
                            : "track_inventory: false"
                        }
                        size="small"
                      />
                      <Chip
                        label={`Estado: ${status || "active"}`}
                        size="small"
                      />
                    </Stack>

                    {!trackInventory ? (
                      <Alert severity="info" sx={{ borderRadius: 1 }}>
                        Esta opción tiene <strong>track_inventory = false</strong>.
                        Por eso el consumo no aplica aquí.
                      </Alert>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: 0,
                  backgroundColor: "background.paper",
                  boxShadow: "none",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack spacing={2.5}>
                    <Typography sx={titleSx}>Formulario</Typography>

                    <FieldBlock
                      label="Tipo de consumo *"
                      input={
                        <TextField
                          select
                          value={consumptionType}
                          onChange={(e) =>
                            handleConsumptionTypeChange(e.target.value)
                          }
                          disabled={!trackInventory}
                        >
                          <MenuItem value={CONSUMPTION_TYPE_NONE}>
                            Ninguno
                          </MenuItem>
                          <MenuItem value={CONSUMPTION_TYPE_INGREDIENT}>
                            Ingrediente
                          </MenuItem>
                          <MenuItem value={CONSUMPTION_TYPE_PRODUCT}>
                            Producto
                          </MenuItem>
                        </TextField>
                      }
                    />

                    {consumptionType === CONSUMPTION_TYPE_INGREDIENT ? (
                      <Stack spacing={2}>
                        <FieldBlock
                          label="Ingrediente *"
                          input={
                            <TextField
                              select
                              value={ingredientId}
                              onChange={(e) => setIngredientId(e.target.value)}
                              disabled={!trackInventory}
                            >
                              {ingredients.map((item) => (
                                <MenuItem
                                  key={item.id}
                                  value={String(item.id)}
                                >
                                  {item.name}
                                  {item.unit ? ` (${item.unit})` : ""}
                                  {item.status && item.status !== "active"
                                    ? ` · ${item.status}`
                                    : ""}
                                </MenuItem>
                              ))}
                            </TextField>
                          }
                        />

                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                          <FieldBlock
                            label="Cantidad *"
                            input={
                              <TextField
                                value={qty}
                                onChange={(e) => setQty(e.target.value)}
                                inputProps={{ inputMode: "decimal" }}
                                placeholder="1"
                                disabled={!trackInventory}
                              />
                            }
                          />

                          <FieldBlock
                            label="Notas"
                            input={
                              <TextField
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Opcional"
                                disabled={!trackInventory}
                              />
                            }
                          />
                        </Stack>

                        {selectedIngredient ? (
                          <InfoPill
                            icon={<ScienceOutlinedIcon fontSize="small" />}
                            text={`Ingrediente seleccionado: ${selectedIngredient.name}${selectedIngredient.unit ? ` · Unidad: ${selectedIngredient.unit}` : ""}`}
                          />
                        ) : null}
                      </Stack>
                    ) : null}

                    {consumptionType === CONSUMPTION_TYPE_PRODUCT ? (
                      <Stack spacing={2}>
                        <FieldBlock
                          label="Producto *"
                          input={
                            <TextField
                              select
                              value={productId}
                              onChange={(e) => setProductId(e.target.value)}
                              disabled={!trackInventory}
                            >
                              {products.map((item) => (
                                <MenuItem
                                  key={item.id}
                                  value={String(item.id)}
                                >
                                  {item.name}
                                  {item.status && item.status !== "active"
                                    ? ` · ${item.status}`
                                    : ""}
                                </MenuItem>
                              ))}
                            </TextField>
                          }
                        />

                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                          <FieldBlock
                            label="Cantidad *"
                            input={
                              <TextField
                                value={qty}
                                onChange={(e) => setQty(e.target.value)}
                                inputProps={{ inputMode: "decimal" }}
                                placeholder="1"
                                disabled={!trackInventory}
                              />
                            }
                          />

                          <FieldBlock
                            label="Notas"
                            input={
                              <TextField
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Opcional"
                                disabled={!trackInventory}
                              />
                            }
                          />
                        </Stack>

                        {selectedProduct ? (
                          <InfoPill
                            icon={<Inventory2OutlinedIcon fontSize="small" />}
                            text={`Producto seleccionado: ${selectedProduct.name}`}
                          />
                        ) : null}
                      </Stack>
                    ) : null}

                    {consumptionType === CONSUMPTION_TYPE_NONE ? (
                      <Alert severity="info" sx={{ borderRadius: 1 }}>
                        Esta opción quedará sin consumo asociado. Al guardar, se
                        limpian ingrediente, producto y cantidad.
                      </Alert>
                    ) : null}

                    <FieldBlock
                      label="Estado del registro"
                      input={
                        <TextField
                          select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          disabled={!trackInventory}
                        >
                          <MenuItem value="active">Activo</MenuItem>
                          <MenuItem value="inactive">Inactivo</MenuItem>
                        </TextField>
                      }
                    />

                    <Stack
                      direction={{ xs: "column-reverse", sm: "row" }}
                      justifyContent="space-between"
                      spacing={1.5}
                    >
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={handleDelete}
                        disabled={
                          !trackInventory || !consumptionId || deleting || saving
                        }
                        sx={{
                          minWidth: { xs: "100%", sm: 170 },
                          height: 44,
                          borderRadius: 2,
                        }}
                      >
                        {deleting ? "Eliminando…" : "Eliminar consumo"}
                      </Button>

                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={!canSave || saving}
                        sx={{
                          minWidth: { xs: "100%", sm: 180 },
                          height: 44,
                          borderRadius: 2,
                          fontWeight: 800,
                        }}
                      >
                        {saving ? "Guardando…" : "Guardar consumo"}
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: 0,
                  backgroundColor: "background.paper",
                  boxShadow: "none",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack spacing={2.5}>
                    <Typography sx={titleSx}>Probar consumo</Typography>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <FieldBlock
                        label="Sucursal *"
                        input={
                          <TextField
                            select
                            value={testBranchId}
                            onChange={(e) => setTestBranchId(e.target.value)}
                            disabled={!trackInventory}
                          >
                            {branches.map((branch) => (
                              <MenuItem
                                key={branch.id}
                                value={String(branch.id)}
                              >
                                {branch.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        }
                      />

                      <FieldBlock
                        label="Cantidad de la opción"
                        input={
                          <TextField
                            value={testOptionQty}
                            onChange={(e) => setTestOptionQty(e.target.value)}
                            inputProps={{ inputMode: "decimal" }}
                            placeholder="1"
                            disabled={!trackInventory}
                          />
                        }
                        help="Ejemplo: si eligieron 2 veces esta opción, aquí puedes probar 2."
                      />
                    </Stack>

                    <FieldBlock
                      label="Almacén preferido"
                      input={
                        <TextField
                          select
                          value={testWarehouseId}
                          onChange={(e) => setTestWarehouseId(e.target.value)}
                          disabled={!trackInventory || filteredWarehouses.length === 0}
                        >
                          <MenuItem value="">Sin preferencia</MenuItem>
                          {filteredWarehouses.map((warehouse) => (
                            <MenuItem
                              key={warehouse.id}
                              value={String(warehouse.id)}
                            >
                              {warehouse.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      }
                      help="Aquí eliges un almacén real de la sucursal para probar evaluación puntual. Este endpoint no devuelve almacenes válidos por sí solo."
                    />

                    <Button
                      variant="outlined"
                      startIcon={<PlayCircleOutlineIcon />}
                      onClick={handleResolve}
                      disabled={!trackInventory || testing}
                      sx={{
                        alignSelf: "flex-start",
                        minWidth: { xs: "100%", sm: 190 },
                        height: 44,
                        borderRadius: 2,
                        fontWeight: 800,
                      }}
                    >
                      {testing ? "Probando…" : "Probar consumo"}
                    </Button>

                    {resolveResult ? (
                      <>
                        <Divider />

                        <Stack spacing={1.5}>
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={1}
                            alignItems={{ xs: "flex-start", md: "center" }}
                          >
                            <Chip
                              label={resolveResult?.ok ? "Disponible" : "No disponible"}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                bgcolor: resolveResult?.ok ? "#E8F5E9" : "#FDECEA",
                                color: resolveResult?.ok ? "#1B5E20" : "#B42318",
                              }}
                            />

                            {resolveResult?.code ? (
                              <Chip
                                label={resolveResult.code}
                                size="small"
                                variant="outlined"
                              />
                            ) : null}
                          </Stack>

                          <Typography sx={resultTitleSx}>
                            Resultado de la prueba
                          </Typography>

                          <Typography sx={resultTextSx}>
                            {resolveResult?.message || "Sin mensaje del backend."}
                          </Typography>

                          {ingredientRequirements.length > 0 ||
                          productRequirements.length > 0 ? (
                            <Box>
                              <Typography sx={sectionMiniTitleSx}>
                                Requerimientos resueltos
                              </Typography>

                              <Stack spacing={1} sx={{ mt: 1 }}>
                                {ingredientRequirements.map((item, idx) => (
                                  <Card
                                    key={`ingredient-${item.ingredient_id}-${idx}`}
                                    sx={{
                                      borderRadius: 1,
                                      boxShadow: "none",
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  >
                                    <CardContent sx={{ p: 1.5 }}>
                                      <Stack spacing={0.5}>
                                        <Typography sx={reqTitleSx}>
                                          {item.ingredient_name || "Ingrediente"}
                                        </Typography>
                                        <Typography sx={reqTextSx}>
                                          Tipo: Ingrediente
                                        </Typography>
                                        <Typography sx={reqTextSx}>
                                          Cantidad requerida: {item.qty ?? "—"}{" "}
                                          {item.unit || ""}
                                        </Typography>
                                      </Stack>
                                    </CardContent>
                                  </Card>
                                ))}

                                {productRequirements.map((item, idx) => (
                                  <Card
                                    key={`product-${item.product_id}-${idx}`}
                                    sx={{
                                      borderRadius: 1,
                                      boxShadow: "none",
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  >
                                    <CardContent sx={{ p: 1.5 }}>
                                      <Stack spacing={0.5}>
                                        <Typography sx={reqTitleSx}>
                                          {item.product_name || "Producto"}
                                        </Typography>
                                        <Typography sx={reqTextSx}>
                                          Tipo: Producto
                                        </Typography>
                                        <Typography sx={reqTextSx}>
                                          Cantidad requerida: {item.qty ?? "—"}
                                        </Typography>
                                      </Stack>
                                    </CardContent>
                                  </Card>
                                ))}
                              </Stack>
                            </Box>
                          ) : null}

                          {traceRequirements.length > 0 ? (
                            <Box>
                              <Typography sx={sectionMiniTitleSx}>
                                Traza de resolución
                              </Typography>

                              <Stack spacing={1} sx={{ mt: 1 }}>
                                {traceRequirements.map((item, idx) => (
                                  <Card
                                    key={`trace-${idx}`}
                                    sx={{
                                      borderRadius: 1,
                                      boxShadow: "none",
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  >
                                    <CardContent sx={{ p: 1.5 }}>
                                      <Stack spacing={0.5}>
                                        <Typography sx={reqTitleSx}>
                                          {item.target_name || "Destino"}
                                        </Typography>
                                        <Typography sx={reqTextSx}>
                                          Origen: {item.source_label || item.source_type || "—"}
                                        </Typography>
                                        <Typography sx={reqTextSx}>
                                          Tipo destino: {item.target_type || "—"}
                                        </Typography>
                                        <Typography sx={reqTextSx}>
                                          Cantidad: {item.qty ?? "—"} {item.unit || ""}
                                        </Typography>
                                      </Stack>
                                    </CardContent>
                                  </Card>
                                ))}
                              </Stack>
                            </Box>
                          ) : null}

                          {evaluation ? (
                            <Box>
                              <Typography sx={sectionMiniTitleSx}>
                                Evaluación del almacén
                              </Typography>

                              <Stack spacing={1} sx={{ mt: 1 }}>
                                <Typography sx={reqTextSx}>
                                  Almacén evaluado: {evaluation.warehouse_id ?? "—"}
                                </Typography>

                                <Typography sx={reqTextSx}>
                                  ¿Puede surtirlo?: {evaluation.can_fulfill ? "Sí" : "No"}
                                </Typography>

                                {Array.isArray(evaluation.ingredient_shortages) &&
                                evaluation.ingredient_shortages.length > 0 ? (
                                  <Box>
                                    <Typography sx={reqTitleSx}>
                                      Faltantes de ingredientes
                                    </Typography>

                                    <Stack spacing={1} sx={{ mt: 1 }}>
                                      {evaluation.ingredient_shortages.map((item, idx) => (
                                        <Card
                                          key={`shortage-ing-${item.ingredient_id}-${idx}`}
                                          sx={{
                                            borderRadius: 1,
                                            boxShadow: "none",
                                            border: "1px solid",
                                            borderColor: "divider",
                                          }}
                                        >
                                          <CardContent sx={{ p: 1.5 }}>
                                            <Typography sx={reqTitleSx}>
                                              {item.ingredient_name}
                                            </Typography>
                                            <Typography sx={reqTextSx}>
                                              Requerido: {item.required_qty} {item.unit}
                                            </Typography>
                                            <Typography sx={reqTextSx}>
                                              Disponible: {item.available_qty} {item.unit}
                                            </Typography>
                                            <Typography sx={reqTextSx}>
                                              Faltante: {item.missing_qty} {item.unit}
                                            </Typography>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </Stack>
                                  </Box>
                                ) : null}

                                {Array.isArray(evaluation.product_shortages) &&
                                evaluation.product_shortages.length > 0 ? (
                                  <Box>
                                    <Typography sx={reqTitleSx}>
                                      Faltantes de productos
                                    </Typography>

                                    <Stack spacing={1} sx={{ mt: 1 }}>
                                      {evaluation.product_shortages.map((item, idx) => (
                                        <Card
                                          key={`shortage-prod-${item.product_id}-${idx}`}
                                          sx={{
                                            borderRadius: 1,
                                            boxShadow: "none",
                                            border: "1px solid",
                                            borderColor: "divider",
                                          }}
                                        >
                                          <CardContent sx={{ p: 1.5 }}>
                                            <Typography sx={reqTitleSx}>
                                              {item.product_name}
                                            </Typography>
                                            <Typography sx={reqTextSx}>
                                              Requerido: {item.required_qty}
                                            </Typography>
                                            <Typography sx={reqTextSx}>
                                              Disponible: {item.available_qty}
                                            </Typography>
                                            <Typography sx={reqTextSx}>
                                              Faltante: {item.missing_qty}
                                            </Typography>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </Stack>
                                  </Box>
                                ) : null}
                              </Stack>
                            </Box>
                          ) : null}
                        </Stack>
                      </>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
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

function InfoPill({ icon, text }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        px: 1.25,
        py: 1,
        borderRadius: 1,
        bgcolor: "#F8FAFC",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
      <Typography sx={{ fontSize: 13, color: "text.primary" }}>
        {text}
      </Typography>
    </Stack>
  );
}

const titleSx = {
  fontWeight: 800,
  fontSize: { xs: 18, sm: 20 },
  color: "text.primary",
};

const optionNameSx = {
  mt: 0.5,
  fontSize: { xs: 16, sm: 18 },
  fontWeight: 800,
  color: "text.primary",
  wordBreak: "break-word",
};

const resultTitleSx = {
  fontSize: 15,
  fontWeight: 800,
  color: "text.primary",
};

const resultTextSx = {
  fontSize: 14,
  color: "text.primary",
  lineHeight: 1.6,
};

const sectionMiniTitleSx = {
  fontSize: 13,
  fontWeight: 800,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

const reqTitleSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};

const reqTextSx = {
  fontSize: 13,
  color: "text.secondary",
};