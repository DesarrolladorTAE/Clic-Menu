//src/components/menu/menuSets/dashboard/OwnerDashboardProducts.jsx
import { useEffect, useState } from "react";
import {
  Box, Button, Chip, CircularProgress, MenuItem, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography,
} from "@mui/material";

import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";

import PaginationFooter from "../../../common/PaginationFooter";
import {
  getOwnerProductsDashboardAvailability,
} from "../../../../services/menu/menuSets/dashboard/ownerProductsDashboard.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 }, borderRadius: 1,
  border: "1px solid", borderColor: "divider",
  bgcolor: "background.paper", boxShadow: "none",
};

const statuses = {
  available: { label: "Disponible", color: "success" },
  inventory_exhausted: { label: "Sin inventario", color: "error" },
  configuration_unavailable: { label: "Configuración no disponible", color: "warning" },
  out_of_stock: { label: "Sin existencias", color: "error" },
  insufficient_stock: { label: "Existencias insuficientes", color: "warning" },
  recipe_missing: { label: "Sin receta", color: "warning" },
  inventory_blocked: { label: "Disponibilidad bloqueada", color: "warning" },
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "No cuantificada";
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("es-MX", { maximumFractionDigits: 3 }).format(number)
    : "No cuantificada";
};

function getErrorMessage(error) {
  const data = error?.response?.data;
  const messages = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat() : [];

  return messages.find((value) => typeof value === "string")
    || data?.message || error?.message || "No se pudo consultar la disponibilidad de productos.";
}

function displayReason(reason) {
  if (typeof reason !== "string" || !reason.trim()) return null;

  return reason
    .replace(/\bmodifiers\b/gi, "modificadores")
    .replace(/\bstock\b/gi, "existencias");
}

function inventoryLabel(value) {
  return {
    none: "Sin control de inventario",
    product: "Producto físico",
    ingredients: "Ingredientes",
  }[value] || "No informado";
}

function productTypeLabel(value) {
  return {
    simple: "Simple",
    composite: "Compuesto",
  }[value] || "No informado";
}

function StatusChip({ status }) {
  const config = statuses[status] || { label: "No informado", color: "default" };

  return (
    <Chip
      size="small"
      label={config.label}
      color={config.color}
      sx={{ maxWidth: "100%", "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
    />
  );
}

function SummaryMetric({ title, value }) {
  return (
    <Box sx={{
      p: 1.75, minHeight: 108, height: "100%", borderRadius: 1,
      border: "1px solid", borderColor: "divider",
      bgcolor: "background.default", display: "flex",
      flexDirection: "column", justifyContent: "space-between", gap: 1,
    }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 27, fontWeight: 800, color: "text.primary" }}>
        {formatNumber(value)}
      </Typography>
    </Box>
  );
}

function DashboardPagination({ pagination, onChange, itemLabel }) {
  if (!pagination || Number(pagination.total) === 0) return null;

  const currentPage = Number(pagination.current_page) || 1;
  const totalPages = Math.max(1, Number(pagination.last_page) || 1);

  return (
    <Box sx={{ mt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
      <PaginationFooter
        page={currentPage}
        totalPages={totalPages}
        startItem={pagination.from || 0}
        endItem={pagination.to || 0}
        total={Number(pagination.total) || 0}
        hasPrev={currentPage > 1}
        hasNext={currentPage < totalPages}
        onPrev={() => onChange(Math.max(1, currentPage - 1))}
        onNext={() => onChange(Math.min(totalPages, currentPage + 1))}
        itemLabel={itemLabel}
      />
    </Box>
  );
}

function ProductDetail({ product, onClose }) {
  const [variantPage, setVariantPage] = useState(1);
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const totalPages = Math.max(1, Math.ceil(variants.length / 5));
  const currentPage = Math.min(variantPage, totalPages);
  const visibleVariants = variants.slice((currentPage - 1) * 5, currentPage * 5);
  const reason = displayReason(product.reason);

  return (
    <Paper sx={panelSx}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 19, fontWeight: 800 }}>
              {product.name}
            </Typography>
            <Typography sx={{ mt: 0.4, fontSize: 12.5, color: "text.secondary" }}>
              {productTypeLabel(product.product_type)} · {inventoryLabel(product.inventory_type)}
            </Typography>
          </Box>

          <Button type="button" variant="outlined" onClick={onClose}
            startIcon={<ExpandLessOutlinedIcon />} sx={{ flexShrink: 0, alignSelf: "flex-start" }}>
            Cerrar detalle
          </Button>
        </Stack>

        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
          gap: 1.5,
        }}>
          <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Typography sx={{ mb: 1, fontSize: 12, color: "text.secondary" }}>Disponibilidad</Typography>
            <StatusChip status={product.availability_status} />
          </Box>
          <SummaryMetric title="Cantidad máxima disponible" value={product.max_available_qty} />
          <SummaryMetric title="Variantes disponibles" value={product.available_variants} />
        </Box>

        {reason ? (
          <Box sx={{
            p: 1.75, border: "1px solid", borderColor: "divider",
            borderRadius: 1, bgcolor: "background.default",
          }}>
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
              Motivo de disponibilidad
            </Typography>
            <Typography sx={{ mt: 0.65, fontSize: 13, lineHeight: 1.6 }}>
              {reason}
            </Typography>
          </Box>
        ) : null}

        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Variantes</Typography>
          <Typography sx={{ mt: 0.4, fontSize: 12.5, color: "text.secondary" }}>
            {product.total_variants || 0} registradas · {product.valid_variants || 0} válidas.
            Cada variante conserva su propia disponibilidad.
          </Typography>
        </Box>

        {variants.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Este producto no tiene variantes registradas.
          </Typography>
        ) : (
          <>
            <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    {["Variante", "Configuración", "Disponibilidad", "Cantidad máxima", "Motivo"].map((label) => (
                      <TableCell key={label} sx={{ fontSize: 12, fontWeight: 800 }}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleVariants.map((variant) => (
                    <TableRow hover key={variant.id}>
                      <TableCell sx={{ fontSize: 12.5, fontWeight: 800 }}>
                        Variante {variant.id}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={variant.is_valid ? "Válida" : "No válida"}
                          color={variant.is_valid ? "success" : "default"} />
                      </TableCell>
                      <TableCell><StatusChip status={variant.availability?.status} /></TableCell>
                      <TableCell sx={{ fontSize: 12.5 }}>
                        {formatNumber(variant.availability?.max_available_qty)}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12.5, minWidth: 180 }}>
                        {displayReason(variant.availability?.reason)
                          || (!variant.is_valid ? "La variante no está habilitada o tiene una configuración no válida." : "—")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{
              display: { xs: "grid", md: "none" },
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 1.5, alignItems: "stretch",
            }}>
              {visibleVariants.map((variant) => (
                <Box key={variant.id} sx={{
                  p: 1.75, border: "1px solid", borderColor: "divider",
                  borderRadius: 1, bgcolor: "background.default",
                  minHeight: 170, height: "100%",
                }}>
                  <Stack spacing={1.25}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800 }}>Variante {variant.id}</Typography>

                    <Stack direction="row" flexWrap="wrap" gap={0.75}>
                      <Chip size="small" label={variant.is_valid ? "Válida" : "No válida"}
                        color={variant.is_valid ? "success" : "default"} />
                      <StatusChip status={variant.availability?.status} />
                    </Stack>

                    <Typography sx={{ fontSize: 12.5 }}>
                      Cantidad máxima: <Box component="span" sx={{ fontWeight: 800 }}>
                        {formatNumber(variant.availability?.max_available_qty)}
                      </Box>
                    </Typography>

                    <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.55 }}>
                      {displayReason(variant.availability?.reason)
                        || (!variant.is_valid ? "La variante no está habilitada o tiene una configuración no válida." : "Sin restricciones informadas.")}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Box>

            <DashboardPagination
              pagination={{
                current_page: currentPage, last_page: totalPages, total: variants.length,
                from: (currentPage - 1) * 5 + 1,
                to: Math.min(currentPage * 5, variants.length),
              }}
              onChange={setVariantPage}
              itemLabel="variantes"
            />
          </>
        )}
      </Stack>
    </Paper>
  );
}

export default function OwnerDashboardProducts({ restaurantId, branchId, onAlert }) {
  const [inventoryType, setInventoryType] = useState("all");
  const [availabilityStatus, setAvailabilityStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [result, setResult] = useState(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [loading, setLoading] = useState(true);

  const requestKey = [
    restaurantId, branchId, inventoryType, availabilityStatus, page,
  ].join("|");

  useEffect(() => {
    setInventoryType("all");
    setAvailabilityStatus("all");
    setPage(1);
    setSelectedProductId(null);
    setResult(null);
    setLoadedKey("");
  }, [restaurantId, branchId]);

  useEffect(() => {
    if (!restaurantId || !branchId) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    setLoading(true);

    getOwnerProductsDashboardAvailability(restaurantId, branchId, {
      inventory_type: inventoryType,
      availability_status: availabilityStatus,
      page,
    }, controller.signal)
      .then((response) => {
        if (!active) return;

        if (page > Number(response.pagination.last_page || 1)) {
          setPage(Math.max(1, Number(response.pagination.last_page) || 1));
          return;
        }

        setResult(response);
        setLoadedKey(requestKey);
      })
      .catch((error) => {
        if (!active || controller.signal.aborted) return;
        setResult(null);
        setLoadedKey("");
        onAlert?.({ message: getErrorMessage(error) });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [restaurantId, branchId, inventoryType, availabilityStatus, page, requestKey, onAlert]);

  const data = loadedKey === requestKey
    && String(result?.context?.branch_id || "") === String(branchId)
    ? result : null;

  const selectedProduct = data?.rows?.find(
    (product) => String(product.id) === String(selectedProductId)
  ) || null;

  const updateFilter = (type, value) => {
    if (type === "inventory") setInventoryType(value);
    if (type === "availability") setAvailabilityStatus(value);
    setPage(1);
    setSelectedProductId(null);
  };

  const changePage = (nextPage) => {
    setPage(nextPage);
    setSelectedProductId(null);
  };

  const toggleDetail = (product) => {
    setSelectedProductId((current) =>
      String(current) === String(product.id) ? null : product.id
    );
  };

  const summary = data?.summary || {};
  const rows = data?.rows || [];

  return (
    <Stack spacing={2.5}>
      {/* Filtros */}
      <Paper sx={panelSx}>
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Disponibilidad de productos</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
              Consulta productos simples, variantes y compuestos con sus condiciones actuales de venta.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField select fullWidth size="small" label="Tipo de inventario"
              value={inventoryType} onChange={(event) => updateFilter("inventory", event.target.value)}>
              <MenuItem value="all">Todos los tipos</MenuItem>
              <MenuItem value="none">Sin control de inventario</MenuItem>
              <MenuItem value="product">Producto físico</MenuItem>
              <MenuItem value="ingredients">Ingredientes</MenuItem>
            </TextField>

            <TextField select fullWidth size="small" label="Disponibilidad"
              value={availabilityStatus} onChange={(event) => updateFilter("availability", event.target.value)}>
              <MenuItem value="all">Todos los estados</MenuItem>
              <MenuItem value="available">Disponible</MenuItem>
              <MenuItem value="inventory_exhausted">Sin inventario</MenuItem>
              <MenuItem value="configuration_unavailable">Configuración no disponible</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </Paper>

      {!data && loading ? (
        <Paper sx={{ ...panelSx, minHeight: 250, display: "grid", placeItems: "center" }}>
          <Stack alignItems="center" spacing={1.5}>
            <CircularProgress size={28} />
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Consultando disponibilidad…
            </Typography>
          </Stack>
        </Paper>
      ) : data ? (
        <>
          <Paper sx={panelSx}>
            <Stack spacing={1.5}>
              <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Resumen de productos</Typography>

              <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                gridAutoRows: "1fr", gap: 1.5,
              }}>
                <SummaryMetric title="Productos evaluados" value={summary.total_products} />
                <SummaryMetric title="Disponibles" value={summary.available_products} />
                <SummaryMetric title="Sin inventario" value={summary.inventory_exhausted_products} />
                <SummaryMetric title="Configuración no disponible" value={summary.configuration_unavailable_products} />
              </Box>
            </Stack>
          </Paper>

          <Paper sx={panelSx}>
            <Stack spacing={1.5}>
              <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Productos de la sucursal</Typography>

              {rows.length === 0 ? (
                <Typography sx={{ py: 3, fontSize: 13, color: "text.secondary" }}>
                  No hay productos que coincidan con los filtros seleccionados.
                </Typography>
              ) : (
                <>
                  <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "action.hover" }}>
                          {["Producto", "Tipo de inventario", "Disponibilidad", "Cantidad máxima", "Variantes", "Acciones"].map((label) => (
                            <TableCell key={label} sx={{ fontSize: 12, fontWeight: 800 }}>
                              {label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {rows.map((product) => (
                          <TableRow hover key={product.id}>
                            <TableCell sx={{ minWidth: 165 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{product.name}</Typography>
                              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                                {productTypeLabel(product.product_type)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: 12.5 }}>{inventoryLabel(product.inventory_type)}</TableCell>
                            <TableCell><StatusChip status={product.availability_status} /></TableCell>
                            <TableCell sx={{ fontSize: 12.5 }}>{formatNumber(product.max_available_qty)}</TableCell>
                            <TableCell sx={{ fontSize: 12.5 }}>
                              {product.available_variants || 0} / {product.total_variants || 0}
                            </TableCell>
                            <TableCell>
                              <Button type="button" size="small" variant="outlined"
                                endIcon={String(selectedProductId) === String(product.id)
                                  ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
                                onClick={() => toggleDetail(product)}>
                                {String(selectedProductId) === String(product.id) ? "Cerrar" : "Ver detalle"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{
                    display: { xs: "grid", md: "none" },
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                    gap: 1.5, alignItems: "stretch",
                  }}>
                    {rows.map((product) => (
                      <Box key={product.id} sx={{
                        p: 1.75, minHeight: 215, height: "100%",
                        border: "1px solid", borderColor: "divider",
                        borderRadius: 1, bgcolor: "background.default",
                      }}>
                        <Stack spacing={1.25} sx={{ height: "100%" }}>
                          <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{product.name}</Typography>
                            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                              {productTypeLabel(product.product_type)} · {inventoryLabel(product.inventory_type)}
                            </Typography>
                          </Box>

                          <Box><StatusChip status={product.availability_status} /></Box>

                          <Typography sx={{ fontSize: 12.5 }}>
                            Cantidad máxima: <Box component="span" sx={{ fontWeight: 800 }}>
                              {formatNumber(product.max_available_qty)}
                            </Box>
                          </Typography>

                          <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                            Variantes disponibles: {product.available_variants || 0} de {product.total_variants || 0}
                          </Typography>

                          <Box sx={{ mt: "auto !important" }}>
                            <Button type="button" fullWidth variant="outlined"
                              endIcon={String(selectedProductId) === String(product.id)
                                ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
                              onClick={() => toggleDetail(product)}>
                              {String(selectedProductId) === String(product.id) ? "Cerrar" : "Ver detalle"}
                            </Button>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              <DashboardPagination
                pagination={data.pagination}
                onChange={changePage}
                itemLabel="productos"
              />
            </Stack>
          </Paper>

          {selectedProduct ? (
            <ProductDetail
              key={selectedProduct.id}
              product={selectedProduct}
              onClose={() => setSelectedProductId(null)}
            />
          ) : null}
        </>
      ) : (
        <Paper sx={{ ...panelSx, py: 4, textAlign: "center" }}>
          <CategoryOutlinedIcon sx={{ fontSize: 40, color: "text.disabled" }} />
          <Typography sx={{ mt: 1, fontSize: 13, color: "text.secondary" }}>
            No hay información de productos para mostrar.
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}