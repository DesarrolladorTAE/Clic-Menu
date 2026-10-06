import { useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, Collapse, Divider, MenuItem, Stack, TextField,
  Typography,
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import {
  containerSx,
  FieldBlock,
  noticeSx,
  reqTextSx,
  reqTitleSx,
  resultCardSx,
  resultTextSx,
  sectionMiniTitleSx,
  subtitleSx,
  titleSx,
} from "./ModifierOptionConsumptionShared";

const EFFECT_OMIT = "omit";

export default function ModifierOptionConsumptionTestTab({
  trackInventory,
  consumptionId,
  branches,
  filteredWarehouses,
  requiresBranch,
  effectiveBranchId,
  testBranchId,
  testWarehouseId,
  testOptionQty,
  effect,
  resolveResult,
  testing,
  saving,
  deleting,
  busy,
  canTest,
  onBranchChange,
  onWarehouseChange,
  onOptionQtyChange,
  onResolve,
}) {
  const [detailOpen, setDetailOpen] = useState(false);

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

  const ingredientShortages = useMemo(() => {
    return Array.isArray(evaluation?.ingredient_shortages)
      ? evaluation.ingredient_shortages
      : [];
  }, [evaluation]);

  const productShortages = useMemo(() => {
    return Array.isArray(evaluation?.product_shortages)
      ? evaluation.product_shortages
      : [];
  }, [evaluation]);

  const shortageCount = ingredientShortages.length + productShortages.length;

  const warehouseName = useMemo(() => {
    if (evaluation?.warehouse?.name) return evaluation.warehouse.name;
    if (evaluation?.warehouse_id) return `Almacén ${evaluation.warehouse_id}`;
    return "Almacén no determinado";
  }, [evaluation]);

  const testState = useMemo(() => {
    if (!resolveResult) return null;

    if (resolveResult?.ok === false) {
      return {
        type: "error",
        title: "No se pudo completar la prueba",
        message: resolveResult?.message || "No fue posible evaluar esta configuración.",
        icon: <ErrorOutlineIcon />,
      };
    }

    if (!evaluation) {
      return {
        type: "neutral",
        title: "Prueba completada",
        message: resolveResult?.message || "La configuración se calculó correctamente.",
        icon: <Inventory2OutlinedIcon />,
      };
    }

    if (!evaluation?.warehouse_found) {
      return {
        type: "error",
        title: "No se encontró un almacén disponible",
        message: "No fue posible determinar un almacén para evaluar las existencias.",
        icon: <ErrorOutlineIcon />,
      };
    }

    if (evaluation?.can_fulfill) {
      return {
        type: "success",
        title: "Existencias suficientes",
        message: "Este almacén puede surtir la cantidad necesaria para esta opción.",
        icon: <CheckCircleOutlineIcon />,
      };
    }

    return {
      type: "error",
      title: "No hay existencias suficientes",
      message:
        shortageCount === 1
          ? "Este almacén tiene 1 insumo con existencias insuficientes."
          : `Este almacén tiene ${shortageCount} insumos con existencias insuficientes.`,
      icon: <ErrorOutlineIcon />,
    };
  }, [resolveResult, evaluation, shortageCount]);

  const ingredientShortageMap = useMemo(() => {
    const map = new Map();

    ingredientShortages.forEach((item) => {
      map.set(Number(item.ingredient_id), item);
    });

    return map;
  }, [ingredientShortages]);

  const productShortageMap = useMemo(() => {
    const map = new Map();

    productShortages.forEach((item) => {
      map.set(Number(item.product_id), item);
    });

    return map;
  }, [productShortages]);

  const handleResolve = () => {
    setDetailOpen(false);
    onResolve();
  };

  if (!trackInventory) {
    return (
      <Card sx={containerSx}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={noticeSx}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
              La prueba no está disponible
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
              Esta opción no controla inventario.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={containerSx}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography sx={titleSx}>Prueba de inventario</Typography>
            <Typography sx={subtitleSx}>
              Comprueba si el almacén puede cubrir las existencias necesarias antes de utilizar esta configuración.
            </Typography>
          </Box>

          {!consumptionId ? (
            <Box sx={noticeSx}>
              <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                Guarda primero el movimiento de inventario para poder realizar una prueba.
              </Typography>
            </Box>
          ) : null}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Sucursal *"
              input={
                <TextField
                  select
                  value={testBranchId}
                  onChange={(e) => onBranchChange(e.target.value)}
                  disabled={busy || (requiresBranch && !!effectiveBranchId)}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </TextField>
              }
            />

            <FieldBlock
              label="Cantidad de la opción"
              help="Ejemplo: si el cliente eligió esta opción 2 veces, escribe 2."
              input={
                <TextField
                  value={testOptionQty}
                  onChange={(e) => onOptionQtyChange(e.target.value)}
                  inputProps={{ inputMode: "decimal" }}
                  placeholder="1"
                  disabled={busy}
                />
              }
            />
          </Stack>

          <FieldBlock
            label="Almacén para la prueba"
            help="Puedes dejarlo sin seleccionar para que el sistema determine el almacén correspondiente."
            input={
              <TextField
                select
                value={testWarehouseId}
                onChange={(e) => onWarehouseChange(e.target.value)}
                disabled={busy || filteredWarehouses.length === 0}
              >
                <MenuItem value="">Sin preferencia</MenuItem>

                {filteredWarehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={String(warehouse.id)}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </TextField>
            }
          />

          <Button
            variant="outlined"
            startIcon={<PlayCircleOutlineIcon />}
            onClick={handleResolve}
            disabled={!canTest || testing || saving || deleting}
            sx={{
              alignSelf: { xs: "stretch", sm: "flex-start" },
              minWidth: { xs: "100%", sm: 190 },
              height: 44,
              fontWeight: 800,
            }}
          >
            {testing ? "Probando…" : "Realizar prueba"}
          </Button>

          {resolveResult ? (
            <>
              <Divider />

              <Stack spacing={2}>
                <ResultStatusCard
                  state={testState}
                  warehouseName={warehouseName}
                  evaluation={evaluation}
                />

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip
                    label={effect === EFFECT_OMIT ? "Acción: Omitir" : "Acción: Agregar"}
                    size="small"
                    sx={summaryChipSx}
                  />

                  <Chip
                    label={`Cantidad probada: ${testOptionQty || 1}`}
                    size="small"
                    sx={summaryChipSx}
                  />

                  {evaluation?.warehouse_found ? (
                    <Chip
                      icon={<StorefrontOutlinedIcon />}
                      label={warehouseName}
                      size="small"
                      sx={summaryChipSx}
                    />
                  ) : null}
                </Stack>

                {resolveResult?.ok !== false &&
                (ingredientRequirements.length > 0 || productRequirements.length > 0) ? (
                  <Box>
                    <Typography sx={sectionMiniTitleSx}>Existencias necesarias</Typography>

                    <Stack spacing={1.25} sx={{ mt: 1 }}>
                      {ingredientRequirements.map((item, index) => {
                        const shortage = ingredientShortageMap.get(Number(item.ingredient_id));

                        return (
                          <RequirementCard
                            key={`ingredient-${item.ingredient_id}-${index}`}
                            name={item.ingredient_name || "Ingrediente"}
                            type="Ingrediente"
                            required={item.qty}
                            unit={item.unit || ""}
                            shortage={shortage}
                            canFulfill={evaluation?.can_fulfill}
                          />
                        );
                      })}

                      {productRequirements.map((item, index) => {
                        const shortage = productShortageMap.get(Number(item.product_id));

                        return (
                          <RequirementCard
                            key={`product-${item.product_id}-${index}`}
                            name={item.product_name || "Producto"}
                            type="Producto"
                            required={item.qty}
                            unit=""
                            shortage={shortage}
                            canFulfill={evaluation?.can_fulfill}
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                ) : null}

                {evaluation && shortageCount > 0 ? (
                  <Box>
                    <Typography sx={sectionMiniTitleSx}>Resumen de faltantes</Typography>

                    <Stack spacing={1.25} sx={{ mt: 1 }}>
                      {ingredientShortages.map((item, index) => (
                        <ShortageCard
                          key={`shortage-ing-${item.ingredient_id}-${index}`}
                          name={item.ingredient_name || "Ingrediente"}
                          required={item.required_qty}
                          available={item.available_qty}
                          missing={item.missing_qty}
                          unit={item.unit || ""}
                        />
                      ))}

                      {productShortages.map((item, index) => (
                        <ShortageCard
                          key={`shortage-prod-${item.product_id}-${index}`}
                          name={item.product_name || "Producto"}
                          required={item.required_qty}
                          available={item.available_qty}
                          missing={item.missing_qty}
                          unit=""
                        />
                      ))}
                    </Stack>
                  </Box>
                ) : null}

                {traceRequirements.length > 0 ? (
                  <Box>
                    <Button
                      variant="text"
                      onClick={() => setDetailOpen((prev) => !prev)}
                      endIcon={
                        <ExpandMoreIcon
                          sx={{
                            transform: detailOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      }
                      sx={{
                        px: 0,
                        minHeight: 40,
                        fontWeight: 800,
                        color: "text.primary",
                        "&:hover": { bgcolor: "transparent", color: "primary.main" },
                      }}
                    >
                      {detailOpen ? "Ocultar detalle del cálculo" : "Ver detalle del cálculo"}
                    </Button>

                    <Collapse in={detailOpen} timeout="auto" unmountOnExit>
                      <Stack spacing={1} sx={{ pt: 1 }}>
                        {traceRequirements.map((item, index) => (
                          <Card key={`trace-${index}`} sx={resultCardSx}>
                            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                spacing={1}
                              >
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography sx={reqTitleSx}>
                                    {item.target_name || "Recurso"}
                                  </Typography>

                                  <Typography sx={reqTextSx}>
                                    Tipo: {resourceTypeLabel(item.target_type)}
                                  </Typography>

                                  <Typography sx={reqTextSx}>
                                    Origen: {item.source_label || "Configuración de la opción"}
                                  </Typography>
                                </Box>

                                <Box sx={traceQtySx}>
                                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: "text.secondary" }}>
                                    CANTIDAD
                                  </Typography>

                                  <Typography sx={{ mt: 0.25, fontSize: 15, fontWeight: 800, color: "text.primary" }}>
                                    {item.qty ?? "—"} {item.unit || ""}
                                  </Typography>
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </Collapse>
                  </Box>
                ) : null}

                {resolveResult?.ok === false && !evaluation ? (
                  <Box sx={neutralNoticeSx}>
                    <ErrorOutlineIcon sx={{ fontSize: 22, color: "text.secondary", flexShrink: 0 }} />

                    <Typography sx={resultTextSx}>
                      {resolveResult?.message || "No fue posible completar la prueba."}
                    </Typography>
                  </Box>
                ) : null}
              </Stack>
            </>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ResultStatusCard({ state, warehouseName, evaluation }) {
  if (!state) return null;

  const isSuccess = state.type === "success";
  const isError = state.type === "error";

  return (
    <Box
      sx={{
        width: "100%",
        p: { xs: 2, sm: 2.25 },
        border: "1px solid",
        borderColor: isSuccess ? "success.light" : isError ? "error.light" : "divider",
        bgcolor: isSuccess ? "#F1F8F4" : isError ? "#FFF5F5" : "#F8FAFC",
        borderRadius: 1,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Box
          sx={{
            width: 46,
            height: 46,
            flexShrink: 0,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: isSuccess ? "#DFF3E5" : isError ? "#FDE2E2" : "#ECEFF1",
            color: isSuccess ? "success.dark" : isError ? "error.main" : "text.secondary",
            "& svg": { fontSize: 27 },
          }}
        >
          {state.icon}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Typography
              sx={{
                fontSize: { xs: 17, sm: 19 },
                fontWeight: 800,
                color: isSuccess ? "success.dark" : isError ? "error.dark" : "text.primary",
              }}
            >
              {state.title}
            </Typography>

            {evaluation?.warehouse_found ? (
              <Chip
                label={evaluation?.can_fulfill ? "Puede surtir" : "No puede surtir"}
                size="small"
                sx={{
                  fontWeight: 800,
                  bgcolor: evaluation?.can_fulfill ? "#DFF3E5" : "#FDE2E2",
                  color: evaluation?.can_fulfill ? "success.dark" : "error.dark",
                }}
              />
            ) : null}
          </Stack>

          {evaluation?.warehouse_found ? (
            <Typography sx={{ mt: 0.5, fontSize: 14, fontWeight: 800, color: "text.primary" }}>
              {warehouseName}
            </Typography>
          ) : null}

          <Typography sx={{ mt: 0.35, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
            {state.message}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function RequirementCard({ name, type, required, unit, shortage, canFulfill }) {
  const hasShortage = !!shortage;
  const statusLabel = hasShortage ? "Faltante" : canFulfill ? "Disponible" : "Necesario";

  return (
    <Card sx={neutralResultCardSx}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack spacing={1.25}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={reqTitleSx}>{name}</Typography>
              <Typography sx={reqTextSx}>{type}</Typography>
            </Box>

            <Chip label={statusLabel} size="small" sx={neutralStatusChipSx} />
          </Stack>

          {hasShortage ? (
            <Box sx={quantityGridSx}>
              <QuantityValue label="Necesario" value={shortage.required_qty} unit={unit} />
              <QuantityValue label="Disponible" value={shortage.available_qty} unit={unit} />
              <QuantityValue label="Faltante" value={shortage.missing_qty} unit={unit} />
            </Box>
          ) : (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Box sx={requiredQtySx}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: "text.secondary" }}>
                  CANTIDAD NECESARIA
                </Typography>

                <Typography sx={{ mt: 0.25, fontSize: 16, fontWeight: 800, color: "text.primary" }}>
                  {required ?? "—"} {unit}
                </Typography>
              </Box>

              {canFulfill ? (
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.secondary" }}>
                    Sin faltantes detectados
                  </Typography>
                </Stack>
              ) : null}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ShortageCard({ name, required, available, missing, unit }) {
  return (
    <Card sx={neutralResultCardSx}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack spacing={1.25}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Typography sx={reqTitleSx}>{name}</Typography>
            <Chip label="Faltante" size="small" sx={neutralStatusChipSx} />
          </Stack>

          <Box sx={quantityGridSx}>
            <QuantityValue label="Necesario" value={required} unit={unit} />
            <QuantityValue label="Disponible" value={available} unit={unit} />
            <QuantityValue label="Faltante" value={missing} unit={unit} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function QuantityValue({ label, value, unit }) {
  return (
    <Box sx={quantityValueSx}>
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 800,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.35,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.3,
          fontSize: { xs: 14, sm: 15 },
          fontWeight: 800,
          color: "text.primary",
          wordBreak: "break-word",
        }}
      >
        {value ?? "—"} {unit}
      </Typography>
    </Box>
  );
}

function resourceTypeLabel(value) {
  if (value === "ingredient") return "Ingrediente";
  if (value === "product") return "Producto";
  return "Recurso";
}

const summaryChipSx = {
  fontWeight: 700,
  bgcolor: "#F1F1F1",
  color: "text.primary",
  "& .MuiChip-icon": {
    color: "primary.main",
  },
};

const neutralStatusChipSx = {
  fontWeight: 800,
  bgcolor: "#F1F1F1",
  color: "text.secondary",
};

const neutralResultCardSx = {
  width: "100%",
  borderRadius: 1,
  boxShadow: "none",
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
};

const quantityGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
  gap: 1,
  width: "100%",
};

const quantityValueSx = {
  minWidth: 0,
  p: 1.25,
  borderRadius: 1,
  bgcolor: "#F8FAFC",
  border: "1px solid",
  borderColor: "divider",
};

const requiredQtySx = {
  minWidth: { xs: "100%", sm: 150 },
  px: 1.25,
  py: 1,
  bgcolor: "#F8FAFC",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
};

const traceQtySx = {
  minWidth: { xs: "100%", sm: 120 },
  px: 1.25,
  py: 1,
  bgcolor: "#F8FAFC",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
};

const neutralNoticeSx = {
  width: "100%",
  display: "flex",
  alignItems: "flex-start",
  gap: 1,
  p: 1.5,
  bgcolor: "#F8FAFC",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
};