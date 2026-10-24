import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, ButtonBase, Chip, CircularProgress, MenuItem,
  Paper, Stack, TextField, Tooltip, Typography,
} from "@mui/material";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import PaginationFooter from "../../../../common/PaginationFooter";
import usePagination from "../../../../../hooks/usePagination";

import { updateMenuSet } from "../../../../../services/menu/menuSets/menuSet.service";
import { getMenuSetStages } from "../../../../../services/menu/menuSets/menuSetStage.service";
import {
  getMenuSetStageProducts,
  updateMenuSetStageProduct,
} from "../../../../../services/menu/menuSets/menuSetProduct.service";

const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

const CAPACITY_OPTIONS = [
  {
    value: "none",
    label: "Sin límite",
    description: "Los productos no tendrán límites de capacidad comercial.",
  },
  {
    value: "daily",
    label: "Diaria",
    description: "Define una cantidad disponible para cada producto y día.",
  },
  {
    value: "weekly",
    label: "Semanal",
    description: "Define una cantidad semanal disponible para cada producto.",
  },
];

const panelSx = {
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
  overflow: "hidden",
};

const MAX_CAPACITY = 4294967295;

function normalizeDays(days) {
  if (!Array.isArray(days)) return [];

  return [...new Set(days.map((day) => {
    if (day && typeof day === "object") {
      return Number(day.day_of_week ?? day.value ?? day.id);
    }

    return Number(day);
  }))].filter((day) => Number.isInteger(day) && day >= 1 && day <= 7)
    .sort((a, b) => a - b);
}

function normalizeDailyCapacities(capacities) {
  if (!capacities || typeof capacities !== "object") return {};

  if (Array.isArray(capacities)) {
    return Object.fromEntries(capacities.map((item) => [
      String(item.day_of_week ?? item.day),
      item.capacity === null || item.capacity === undefined
        ? "" : String(item.capacity),
    ]));
  }

  return Object.fromEntries(Object.entries(capacities).map(([day, value]) => [
    String(day),
    value === null || value === undefined ? "" : String(value),
  ]));
}

function mapStageProduct(stage, option) {
  return {
    id: Number(option.id),
    productId: Number(option.product_id),
    name: option.name || option.product?.name || "Producto sin nombre",
    stageId: Number(stage.id),
    stageName: stage.name || stage.stage_definition?.name || "Etapa",
    stageOrder: Number(stage.sort_order ?? 0),
    sortOrder: Number(option.sort_order ?? 0),
    days: normalizeDays(option.service_days),
    weeklyCapacity: option.weekly_capacity,
    dailyCapacities: normalizeDailyCapacities(option.daily_capacities),
    canEditCapacity: option.can_edit_capacity === true,
    capacityBlockReason: option.edit_capacity_block_reason
      || option.capacity_block_reason || "",
  };
}

function buildInputs(products) {
  return Object.fromEntries(products.map((product) => [
    product.id,
    {
      weekly_capacity: product.weeklyCapacity === null || product.weeklyCapacity === undefined
        ? "" : String(product.weeklyCapacity),
      daily_capacities: { ...product.dailyCapacities },
    },
  ]));
}

function isValidCapacity(value) {
  const normalized = String(value ?? "").trim();

  return /^\d+$/.test(normalized)
    && Number.isSafeInteger(Number(normalized))
    && Number(normalized) <= MAX_CAPACITY;
}

function hasProductChanges(product, mode, inputs) {
  const current = inputs[product.id] || {};

  if (mode === "weekly") {
    return String(current.weekly_capacity ?? "")
      !== String(product.weeklyCapacity ?? "");
  }

  if (mode === "daily") {
    return product.days.some((day) => (
      String(current.daily_capacities?.[day] ?? "")
      !== String(product.dailyCapacities?.[day] ?? "")
    ));
  }

  return false;
}

function buildCapacityLimits(mode, products, inputs) {
  const result = {};

  if (mode === "none") return result;

  products.forEach((product) => {
    const current = inputs[product.id] || {};

    if (mode === "weekly") {
      result[product.id] = {
        weekly_capacity: Number(current.weekly_capacity),
      };
    }

    if (mode === "daily") {
      const dailyCapacities = {};

      product.days.forEach((day) => {
        dailyCapacities[day] = Number(current.daily_capacities?.[day]);
      });

      result[product.id] = {
        daily_capacities: dailyCapacities,
      };
    }
  });

  return result;
}

function validateCapacities(mode, products, inputs) {
  if (mode === "none") return null;

  for (const product of products) {
    const current = inputs[product.id] || {};

    if (mode === "weekly") {
      if (!isValidCapacity(current.weekly_capacity)) {
        return `Indica una capacidad semanal válida para ${product.name}, en la etapa ${product.stageName}.`;
      }
    }

    if (mode === "daily") {
      for (const day of product.days) {
        const value = current.daily_capacities?.[day];

        if (!isValidCapacity(value)) {
          const dayName = DAYS[day - 1].label;

          return `Indica una capacidad válida para ${product.name}, el día ${dayName}, en la etapa ${product.stageName}.`;
        }
      }
    }
  }

  return null;
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  const errors = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat()
    : [];

  return errors.find((message) => typeof message === "string")
    || data?.message || error?.message || fallback;
}

function SectionTitle({ title, description }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 15, fontWeight: 800, color: "primary.main" }}>
        {title}
      </Typography>

      {description ? (
        <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}

function CapacityProductCard({ product, mode, values, disabled, onChange }) {
  const current = values || {};
  const availableDays = DAYS.filter((day) => product.days.includes(day.value));

  return (
    <Paper sx={{
      p: { xs: 2, sm: 2.5 },
      height: "100%",
      minWidth: 0,
      border: "1.5px solid",
      borderColor: "#E5A67F",
      borderRadius: 1,
      bgcolor: "background.paper",
      boxShadow: "none",
    }}>
      <Stack spacing={2}>
        <Box>
          <Typography sx={{
            fontSize: 16, fontWeight: 800,
            color: "text.primary", lineHeight: 1.4,
            overflowWrap: "anywhere",
          }}>
            {product.name}
          </Typography>

          <Typography sx={{ mt: 0.35, fontSize: 12, color: "text.secondary" }}>
            Etapa: {product.stageName}
          </Typography>
        </Box>

        {mode === "weekly" ? (
          <Box>
            <Typography sx={{
              mb: 1, fontSize: 14,
              fontWeight: 800, color: "text.primary",
            }}>
              Capacidad semanal
            </Typography>

            <TextField
              fullWidth
              type="text"
              value={current.weekly_capacity ?? ""}
              onChange={(event) => {
                const value = event.target.value;

                if (/^\d*$/.test(value) && value.length <= 10) {
                  onChange(product.id, "weekly_capacity", value);
                }
              }}
              placeholder="Ej. 50"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                "aria-label": `Capacidad semanal de ${product.name}`,
              }}
              disabled={disabled}
            />
          </Box>
        ) : null}

        {mode === "daily" ? (
          availableDays.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
              Este producto todavía no tiene días de servicio configurados.
            </Typography>
          ) : (
            <Box sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}>
              {availableDays.map((day, index) => {
                const isLastOdd = availableDays.length % 2 === 1
                  && index === availableDays.length - 1;

                return (
                  <Box key={day.value} sx={{
                    minWidth: 0,
                    gridColumn: {
                      xs: "auto",
                      sm: isLastOdd ? "1 / -1" : "auto",
                    },
                  }}>
                    <Typography sx={{
                      mb: 1, fontSize: 14,
                      fontWeight: 800, color: "text.primary",
                    }}>
                      {day.label}
                    </Typography>

                    <TextField
                      fullWidth
                      type="text"
                      value={current.daily_capacities?.[day.value] ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;

                        if (/^\d*$/.test(value) && value.length <= 10) {
                          onChange(product.id, "daily_capacity", value, day.value);
                        }
                      }}
                      placeholder="0"
                      inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        "aria-label": `Capacidad de ${product.name} para ${day.label}`,
                      }}
                      disabled={disabled}
                    />
                  </Box>
                );
              })}
            </Box>
          )
        ) : null}

        {disabled && product.capacityBlockReason ? (
          <Typography sx={{
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.5,
          }}>
            {product.capacityBlockReason}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}

export default function MenuSetCapacityTab({
  restaurantId,
  branchId,
  menuSet,
  onUpdated,
  onAlert,
}) {
  const menuSetId = menuSet?.id;
  const currentMode = menuSet?.capacity_mode || "none";

  const [mode, setMode] = useState(currentMode);
  const [savedMode, setSavedMode] = useState(currentMode);

  const [stages, setStages] = useState([]);
  const [products, setProducts] = useState([]);
  const [inputs, setInputs] = useState({});

  const [stageFilter, setStageFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const mountedRef = useRef(false);
  const savingRef = useRef(false);

  const canChangeCapacity = menuSet?.can_change_capacity_mode === true;
  const modeChanged = mode !== savedMode;

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setMode(currentMode);
    setSavedMode(currentMode);
  }, [menuSetId, currentMode]);

  const loadProducts = useCallback(async () => {
    const stageRows = await getMenuSetStages(restaurantId, branchId, menuSetId);
    const validStages = (Array.isArray(stageRows) ? stageRows : [])
      .filter((stage) => Number(stage.id) > 0)
      .sort((a, b) => {
        const difference = Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
        return difference || Number(a.id) - Number(b.id);
      });

    const results = await Promise.all(validStages.map((stage) => (
      getMenuSetStageProducts(restaurantId, branchId, menuSetId, stage.id)
    )));

    const rows = validStages.flatMap((stage, index) => {
      const options = Array.isArray(results[index]?.options)
        ? results[index].options : [];

      return options
        .filter((option) => Number(option.id) > 0)
        .map((option) => mapStageProduct(stage, option));
    });

    rows.sort((a, b) => (
      a.stageOrder - b.stageOrder
      || a.stageId - b.stageId
      || a.sortOrder - b.sortOrder
      || a.id - b.id
    ));

    return { stages: validStages, products: rows };
  }, [restaurantId, branchId, menuSetId]);

  useEffect(() => {
    if (!restaurantId || !branchId || !menuSetId) {
      setLoading(false);
      setLoadFailed(true);
      return undefined;
    }

    let active = true;

    const loadConfiguration = async () => {
      setLoading(true);
      setLoadFailed(false);

      try {
        const result = await loadProducts();

        if (!active) return;

        setStages(result.stages);
        setProducts(result.products);
        setInputs(buildInputs(result.products));
      } catch (error) {
        if (!active) return;

        setStages([]);
        setProducts([]);
        setInputs({});
        setLoadFailed(true);

        onAlert?.({
          severity: "error",
          title: "Error",
          message: getErrorMessage(error, "No se pudieron consultar las capacidades de los productos."),
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadConfiguration();

    return () => {
      active = false;
    };
  }, [restaurantId, branchId, menuSetId, loadProducts, onAlert]);

  const filteredProducts = useMemo(() => {
    if (stageFilter === "all") return products;

    return products.filter((product) => String(product.stageId) === stageFilter);
  }, [products, stageFilter]);

  const pagination = usePagination({
    items: filteredProducts,
    pageSize: 4,
    resetKey: `${menuSetId}|${stageFilter}|${mode}`,
  });

  const modifiedProducts = useMemo(() => {
    if (modeChanged || mode === "none") return [];

    return products.filter((product) => hasProductChanges(product, mode, inputs));
  }, [products, mode, inputs, modeChanged]);

  const hasChanges = modeChanged || modifiedProducts.length > 0;

  const handleModeChange = (nextMode) => {
    if (saving || !canChangeCapacity) return;
    setMode(nextMode);
  };

  const handleCapacityChange = (productId, field, value, day = null) => {
    if (saving) return;

    setInputs((current) => {
      const previous = current[productId] || {};

      if (field === "weekly_capacity") {
        return {
          ...current,
          [productId]: { ...previous, weekly_capacity: value },
        };
      }

      return {
        ...current,
        [productId]: {
          ...previous,
          daily_capacities: {
            ...(previous.daily_capacities || {}),
            [day]: value,
          },
        },
      };
    });
  };

  const handleDiscard = () => {
    if (saving) return;

    setMode(savedMode);
    setInputs(buildInputs(products));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasChanges || saving || savingRef.current) return;

    if (modeChanged && !canChangeCapacity) {
      onAlert?.({
        severity: "error",
        title: "No disponible",
        message: menuSet?.capacity_mode_block_reason || "No puedes cambiar la modalidad de capacidad actualmente.",
      });
      return;
    }

    const productsToValidate = modeChanged ? products : modifiedProducts;
    const validationError = validateCapacities(mode, productsToValidate, inputs);

    if (validationError) {
      onAlert?.({
        severity: "error",
        title: "Revisa las capacidades",
        message: validationError,
      });
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      if (modeChanged) {
        const payload = { capacity_mode: mode };

        if (mode !== "none" && products.length > 0) {
          payload.capacity_limits = buildCapacityLimits(mode, products, inputs);
        }

        const response = await updateMenuSet(restaurantId, branchId, menuSetId, payload);
        const updatedSet = response?.menu_set;

        if (!updatedSet?.id) {
          throw new Error("No se recibió la información actualizada del conjunto.");
        }

        const updatedProducts = products.map((product) => {
          const current = inputs[product.id] || {};
          const dailyCapacities = {};

          if (mode === "daily") {
            product.days.forEach((day) => {
              dailyCapacities[day] = String(Number(current.daily_capacities?.[day]));
            });
          }

          return {
            ...product,
            weeklyCapacity: mode === "weekly" ? Number(current.weekly_capacity) : null,
            dailyCapacities,
          };
        });

        setProducts(updatedProducts);
        setInputs(buildInputs(updatedProducts));
        setSavedMode(mode);
        onUpdated?.(updatedSet);

        // Sincronizar la información actual sin recargar la pantalla.
        try {
          const refreshed = await loadProducts();

          if (mountedRef.current) {
            setStages(refreshed.stages);
            setProducts(refreshed.products);
            setInputs(buildInputs(refreshed.products));
          }
        } catch {
          // Los cambios guardados permanecen visibles.
        }

        onAlert?.({
          severity: "success",
          title: "Hecho",
          message: response?.message || "Modalidad y capacidades actualizadas correctamente.",
        });
      } else {
        for (const product of modifiedProducts) {
          const current = inputs[product.id] || {};
          const payload = {};

          if (mode === "weekly") {
            payload.weekly_capacity = Number(current.weekly_capacity);
          }

          if (mode === "daily") {
            payload.daily_capacities = {};

            product.days.forEach((day) => {
              payload.daily_capacities[day] = Number(current.daily_capacities?.[day]);
            });
          }

          const response = await updateMenuSetStageProduct(
            restaurantId, branchId, menuSetId, product.stageId, product.id, payload
          );

          if (!response?.option?.id) {
            throw new Error(`No se pudo confirmar la capacidad de ${product.name}.`);
          }

          const updatedProduct = mapStageProduct({
            id: product.stageId,
            name: product.stageName,
            sort_order: product.stageOrder,
          }, response.option);

          setProducts((currentProducts) => currentProducts.map((item) => (
            item.id === product.id ? updatedProduct : item
          )));

          setInputs((currentInputs) => ({
            ...currentInputs,
            [product.id]: buildInputs([updatedProduct])[product.id],
          }));
        }

        onAlert?.({
          severity: "success",
          title: "Hecho",
          message: "Capacidades actualizadas correctamente.",
        });
      }
    } catch (error) {
      onAlert?.({
        severity: "error",
        title: "Error",
        message: getErrorMessage(error, "No se pudieron guardar todas las capacidades."),
      });
    } finally {
      savingRef.current = false;

      if (mountedRef.current) {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <Paper sx={{ ...panelSx, p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={2} alignItems="center" sx={{ py: 5 }}>
          <CircularProgress color="primary" />
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            Cargando capacidades del conjunto…
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (loadFailed) {
    return (
      <Paper sx={{ ...panelSx, p: 4, textAlign: "center" }}>
        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
          Capacidades no disponibles
        </Typography>

        <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary" }}>
          No se pudo consultar la configuración de los productos.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={panelSx}>
      <Stack spacing={3} sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
          Configuración de capacidades
        </Typography>

        {/* Modalidad de capacidad */}
        <SectionTitle
          title="Modalidad de capacidad"
          description="Define cómo se controlarán las cantidades disponibles de los productos del conjunto."
        />

        <Box sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
          },
          gridAutoRows: "1fr",
          gap: 1.5,
        }}>
          {CAPACITY_OPTIONS.map((option) => {
            const selected = mode === option.value;

            return (
              <ButtonBase
                key={option.value}
                type="button"
                disabled={saving || !canChangeCapacity}
                onClick={() => handleModeChange(option.value)}
                aria-pressed={selected}
                sx={{
                  width: "100%",
                  minHeight: 130,
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: selected ? "secondary.main" : "divider",
                  bgcolor: selected ? "rgba(214, 122, 58, 0.10)" : "background.default",
                  textAlign: "left",
                  alignItems: "stretch",
                  transition: "border-color 0.18s ease, background-color 0.18s ease",
                  "&:hover": {
                    borderColor: "secondary.main",
                    bgcolor: "rgba(214, 122, 58, 0.07)",
                  },
                }}
              >
                <Stack spacing={1} sx={{ width: "100%" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Typography sx={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: selected ? "secondary.main" : "text.primary",
                    }}>
                      {option.label}
                    </Typography>

                    {selected ? (
                      <Chip size="small" label="Seleccionada" color="secondary" />
                    ) : null}
                  </Stack>

                  <Typography sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    lineHeight: 1.5,
                  }}>
                    {option.description}
                  </Typography>
                </Stack>
              </ButtonBase>
            );
          })}
        </Box>

        {!canChangeCapacity && menuSet?.capacity_mode_block_reason ? (
          <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
            {menuSet.capacity_mode_block_reason}
          </Typography>
        ) : null}

        {/* Capacidades por producto */}
        {mode !== "none" ? (
          <>
            <SectionTitle
              title="Capacidades de los productos"
              description={mode === "daily"
                ? "Establece las cantidades disponibles para cada producto y día de servicio."
                : "Establece la cantidad semanal disponible para cada producto."}
            />

            <Box>
              <Typography sx={{
                mb: 1, fontSize: 14,
                fontWeight: 800, color: "text.primary",
              }}>
                Filtrar por etapa
              </Typography>

              <TextField
                select
                fullWidth
                value={stageFilter}
                onChange={(event) => setStageFilter(event.target.value)}
                disabled={saving}
                SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              >
                <MenuItem value="all">Todas las etapas</MenuItem>

                {stages.map((stage) => (
                  <MenuItem key={stage.id} value={String(stage.id)}>
                    {stage.name || stage.stage_definition?.name || "Etapa"}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {filteredProducts.length === 0 ? (
              <Box sx={{
                p: 4,
                textAlign: "center",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.default",
              }}>
                <Inventory2OutlinedIcon sx={{
                  fontSize: 36, color: "primary.main", mb: 1,
                }} />

                <Typography sx={{ fontSize: 17, fontWeight: 800, color: "text.primary" }}>
                  No hay productos para configurar
                </Typography>

                <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary" }}>
                  Agrega productos a las etapas del conjunto para establecer sus capacidades.
                </Typography>
              </Box>
            ) : (
              <Box sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gridAutoRows: "1fr",
                gap: 1.5,
              }}>
                {pagination.paginatedItems.map((product) => {
                  const editable = modeChanged
                    ? canChangeCapacity
                    : product.canEditCapacity;

                  return (
                    <Tooltip
                      key={product.id}
                      title={!editable && !modeChanged
                        ? product.capacityBlockReason || ""
                        : ""}
                      arrow
                      placement="top"
                    >
                      <Box sx={{ minWidth: 0, height: "100%" }}>
                        <CapacityProductCard
                          product={product}
                          mode={mode}
                          values={inputs[product.id]}
                          disabled={saving || !editable}
                          onChange={handleCapacityChange}
                        />
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            )}

            {filteredProducts.length > 0 ? (
              <Box sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                overflow: "hidden",
              }}>
                <PaginationFooter
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  startItem={pagination.startItem}
                  endItem={pagination.endItem}
                  total={pagination.total}
                  hasPrev={pagination.hasPrev}
                  hasNext={pagination.hasNext}
                  onPrev={pagination.prevPage}
                  onNext={pagination.nextPage}
                  itemLabel="productos"
                />
              </Box>
            ) : null}
          </>
        ) : (
          modeChanged && products.length > 0 ? (
            <Box sx={{
              p: 1.75,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.default",
            }}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <InfoOutlinedIcon sx={{
                  color: "primary.main",
                  fontSize: 20,
                  flexShrink: 0,
                }} />

                <Typography sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.55,
                }}>
                  Al guardar esta modalidad, se retirarán los límites de capacidad configurados para los productos.
                </Typography>
              </Stack>
            </Box>
          ) : null
        )}

        {/* Acciones */}
        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          justifyContent="flex-end"
          spacing={1.5}
          pt={1}
        >
          <Button
            type="button"
            variant="outlined"
            startIcon={<RestartAltRoundedIcon />}
            onClick={handleDiscard}
            disabled={!hasChanges || saving}
            sx={{
              minWidth: { xs: "100%", sm: 190 },
              height: 44,
              fontWeight: 800,
            }}
          >
            Descartar cambios
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={!hasChanges || saving}
            startIcon={saving
              ? <CircularProgress size={18} color="inherit" />
              : <SaveOutlinedIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 190 },
              height: 44,
              fontWeight: 800,
            }}
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}