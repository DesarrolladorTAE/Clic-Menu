//src/components/menu/menuSets/dashboard/OwnerDashboardInventory.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box, Chip, CircularProgress, FormControlLabel, MenuItem, Paper,
  Stack, Switch, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography,
} from "@mui/material";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaginationFooter from "../../../common/PaginationFooter";
import {
  getOwnerInventoryDashboardItems,
} from "../../../../services/menu/menuSets/dashboard/ownerInventoryDashboard.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 }, borderRadius: 1,
  border: "1px solid", borderColor: "divider",
  bgcolor: "background.paper", boxShadow: "none",
};

const summaryFields = [
  ["warehouse_count", "Almacenes"],
  ["total_resources", "Recursos"],
  ["total_ingredients", "Ingredientes"],
  ["total_products", "Productos"],
  ["total_rows", "Registros"],
  ["available_rows", "Disponibles"],
  ["out_of_stock_rows", "Sin existencias"],
  ["without_stock_record_rows", "Sin registro de existencias"],
  ["rows_with_reservations", "Con reservas"],
  ["negative_available_rows", "Disponibilidad negativa"],
  ["not_operational_rows", "No operativos"],
];

const stockStatuses = {
  available: { label: "Disponible", color: "success" },
  out_of_stock: { label: "Sin existencias", color: "error" },
  without_stock_record: { label: "Sin registro", color: "warning" },
  not_operational: { label: "No operativo", color: "default" },
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("es-MX", { maximumFractionDigits: 3 }).format(number)
    : "—";
};

const resourceLabel = (value) => value === "ingredient" ? "Ingrediente"
  : value === "product" ? "Producto" : "No informado";

const scopeLabel = (value) => value === "global" ? "Global"
  : value === "branch" ? "Sucursal" : "No informado";

function getErrorMessage(error) {
  const data = error?.response?.data;
  const messages = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat() : [];

  return messages.find((value) => typeof value === "string")
    || data?.message || error?.message || "No se pudo consultar el inventario.";
}

function SummaryCard({ title, value }) {
  return (
    <Box sx={{
      p: 1.75, border: "1px solid", borderColor: "divider",
      borderRadius: 1, bgcolor: "background.default",
      minHeight: 106, height: "100%", display: "flex",
      flexDirection: "column", justifyContent: "space-between", gap: 1,
    }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
        {title}
      </Typography>
      <Typography sx={{
        fontSize: 26, fontWeight: 800, color: "text.primary",
        fontVariantNumeric: "tabular-nums",
      }}>
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
    <Box sx={{ mt: 2, borderTop: "1px solid", borderColor: "divider" }}>
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

function WarehouseBreakdown({ title, description, rows, columns, page, onPageChange, itemLabel }) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / 5));
  const currentPage = Math.min(page, totalPages);
  const visibleRows = rows.slice((currentPage - 1) * 5, currentPage * 5);

  return (
    <Paper sx={panelSx}>
      <Stack spacing={1.5}>
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800 }}>{title}</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
            {description}
          </Typography>
        </Box>

        {total === 0 ? (
          <Typography sx={{ py: 2, fontSize: 13, color: "text.secondary" }}>
            No hay registros para los filtros seleccionados.
          </Typography>
        ) : (
          <>
            <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
              <Table size="small" sx={{ minWidth: 760 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    {columns.map((column) => (
                      <TableCell key={column.key} sx={{ fontWeight: 800, fontSize: 12 }}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRows.map((row, index) => (
                    <TableRow hover key={`${row.warehouse_id}-${row.resource_type}-${row.unit}-${index}`}>
                      {columns.map((column) => (
                        <TableCell key={column.key} sx={{ fontSize: 12.5 }}>
                          {column.render(row)}
                        </TableCell>
                      ))}
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
              {visibleRows.map((row, index) => (
                <Box key={`${row.warehouse_id}-${row.resource_type}-${row.unit}-${index}`} sx={{
                  border: "1px solid", borderColor: "divider",
                  borderRadius: 1, p: 1.75, minHeight: 180, height: "100%",
                  bgcolor: "background.default",
                }}>
                  <Stack spacing={1.2}>
                    {columns.map((column) => (
                      <Stack key={column.key} direction="row" justifyContent="space-between" spacing={1.5}>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                          {column.label}
                        </Typography>
                        <Typography sx={{
                          fontSize: 12.5, fontWeight: 800,
                          textAlign: "right", overflowWrap: "anywhere",
                        }}>
                          {column.render(row)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Box>

            <DashboardPagination
              pagination={{
                current_page: currentPage, last_page: totalPages, total,
                from: (currentPage - 1) * 5 + 1,
                to: Math.min(currentPage * 5, total),
              }}
              onChange={onPageChange}
              itemLabel={itemLabel}
            />
          </>
        )}
      </Stack>
    </Paper>
  );
}

export default function OwnerDashboardInventory({ restaurantId, branchId, onAlert }) {
  const [warehouseId, setWarehouseId] = useState("");
  const [resourceType, setResourceType] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [warehouses, setWarehouses] = useState([]);

  const [page, setPage] = useState(1);
  const [stockPage, setStockPage] = useState(1);
  const [reservationPage, setReservationPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [loading, setLoading] = useState(true);

  const requestKey = [
    restaurantId, branchId, warehouseId, resourceType,
    stockStatus, includeInactive, page,
  ].join("|");

  useEffect(() => {
    setWarehouseId("");
    setResourceType("all");
    setStockStatus("all");
    setIncludeInactive(false);
    setWarehouses([]);
    setPage(1);
    setStockPage(1);
    setReservationPage(1);
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

    getOwnerInventoryDashboardItems(restaurantId, branchId, {
      warehouse_id: warehouseId,
      resource_type: resourceType,
      stock_status: stockStatus,
      include_inactive: includeInactive,
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

        if (!warehouseId && Array.isArray(response.context.warehouses)) {
          setWarehouses(response.context.warehouses);
        }
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
  }, [
    restaurantId, branchId, warehouseId, resourceType,
    stockStatus, includeInactive, page, requestKey, onAlert,
  ]);

  const data = loadedKey === requestKey
    && String(result?.context?.branch_id || "") === String(branchId)
    ? result : null;

  const updateFilters = (field, value) => {
    if (field === "warehouse") setWarehouseId(value);
    if (field === "resource") setResourceType(value);
    if (field === "status") setStockStatus(value);
    if (field === "inactive") setIncludeInactive(value);
    setPage(1);
    setStockPage(1);
    setReservationPage(1);
  };

  const stockColumns = useMemo(() => [
    { key: "warehouse", label: "Almacén", render: (row) => row.warehouse_name },
    { key: "type", label: "Recurso", render: (row) => resourceLabel(row.resource_type) },
    { key: "unit", label: "Unidad", render: (row) => row.unit || "—" },
    { key: "rows", label: "Registros", render: (row) => formatNumber(row.resource_rows) },
    { key: "physical", label: "Existencia física", render: (row) => formatNumber(row.on_hand) },
    { key: "reserved", label: "Reservado", render: (row) => formatNumber(row.active_reserved_qty) },
    { key: "available", label: "Disponible", render: (row) => formatNumber(row.available_to_sell) },
  ], []);

  const reservationColumns = useMemo(() => [
    { key: "warehouse", label: "Almacén", render: (row) => row.warehouse_name },
    { key: "type", label: "Recurso", render: (row) => resourceLabel(row.resource_type) },
    { key: "unit", label: "Unidad", render: (row) => row.unit || "—" },
    { key: "rows", label: "Recursos con reservas", render: (row) => formatNumber(row.reserved_resource_rows) },
    { key: "reserved", label: "Cantidad reservada", render: (row) => formatNumber(row.active_reserved_qty) },
    { key: "insufficient", label: "Reservas superiores a existencias", render: (row) => formatNumber(row.insufficient_stock_rows) },
  ], []);

  const rows = data?.rows || [];
  const summary = data?.summary || {};

  return (
    <Stack spacing={2.5}>
      {/* Filtros */}
      <Paper sx={panelSx}>
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Inventario</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
              Consulta existencias físicas, reservas y disponibilidad por almacén.
            </Typography>
          </Box>

          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
            gap: 1.5,
          }}>
            <TextField select fullWidth size="small" label="Almacén"
              value={warehouseId} onChange={(event) => updateFilters("warehouse", event.target.value)}>
              <MenuItem value="">Todos los almacenes</MenuItem>
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse.id} value={String(warehouse.id)}>
                  {warehouse.name} ({scopeLabel(warehouse.scope)})
                </MenuItem>
              ))}
            </TextField>

            <TextField select fullWidth size="small" label="Tipo de recurso"
              value={resourceType} onChange={(event) => updateFilters("resource", event.target.value)}>
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="ingredient">Ingredientes</MenuItem>
              <MenuItem value="product">Productos</MenuItem>
            </TextField>

            <TextField select fullWidth size="small" label="Disponibilidad"
              value={stockStatus} onChange={(event) => updateFilters("status", event.target.value)}>
              <MenuItem value="all">Todos los estados</MenuItem>
              <MenuItem value="available">Disponible</MenuItem>
              <MenuItem value="out_of_stock">Sin existencias</MenuItem>
              <MenuItem value="without_stock_record">Sin registro de existencias</MenuItem>
              <MenuItem value="not_operational">No operativo</MenuItem>
            </TextField>
          </Box>

          <FormControlLabel
            sx={{ m: 0 }}
            control={
              <Switch size="small" checked={includeInactive}
                onChange={(event) => updateFilters("inactive", event.target.checked)} />
            }
            label={<Typography sx={{ fontSize: 13, fontWeight: 700 }}>Incluir recursos no operativos</Typography>}
          />
        </Stack>
      </Paper>

      {!data && loading ? (
        <Paper sx={{ ...panelSx, minHeight: 250, display: "grid", placeItems: "center" }}>
          <Stack alignItems="center" spacing={1.5}>
            <CircularProgress size={28} />
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Consultando inventario…
            </Typography>
          </Stack>
        </Paper>
      ) : data ? (
        <>
          {/* Indicadores */}
          <Paper sx={panelSx}>
            <Stack spacing={1.5}>
              <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Resumen de inventario</Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Los indicadores corresponden a los filtros seleccionados y consideran todos los registros, no solamente esta página.
              </Typography>

              <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                gridAutoRows: "1fr", gap: 1.5,
              }}>
                {summaryFields.map(([key, label]) => (
                  <SummaryCard key={key} title={label} value={summary[key]} />
                ))}
              </Box>
            </Stack>
          </Paper>

          {/* Inventario por recurso */}
          <Paper sx={panelSx}>
            <Stack spacing={1.5}>
              <Box>
                <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                  Recursos por almacén
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                  Existencia física y cantidad reservada de cada recurso.
                </Typography>
              </Box>

              {rows.length === 0 ? (
                <Typography sx={{ py: 3, fontSize: 13, color: "text.secondary" }}>
                  No hay recursos que coincidan con los filtros seleccionados.
                </Typography>
              ) : (
                <>
                  <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
                    <Table size="small" sx={{ minWidth: 920 }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "action.hover" }}>
                          {["Recurso", "Almacén", "Unidad", "Existencia", "Reservado", "Disponible", "Estado"].map((label) => (
                            <TableCell key={label} sx={{ fontSize: 12, fontWeight: 800 }}>
                              {label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {rows.map((row) => {
                          const status = stockStatuses[row.stock_status]
                            || { label: "No informado", color: "default" };

                          return (
                            <TableRow hover key={`${row.resource_type}-${row.resource_id}-${row.warehouse_id}`}>
                              <TableCell>
                                <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{row.resource_name}</Typography>
                                <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                                  {resourceLabel(row.resource_type)}{row.resource_code ? ` · ${row.resource_code}` : ""}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ fontSize: 12.5 }}>{row.warehouse_name}</TableCell>
                              <TableCell sx={{ fontSize: 12.5 }}>{row.unit || "—"}</TableCell>
                              <TableCell sx={{ fontSize: 12.5 }}>{formatNumber(row.on_hand)}</TableCell>
                              <TableCell sx={{ fontSize: 12.5 }}>{formatNumber(row.active_reserved_qty)}</TableCell>
                              <TableCell sx={{ fontSize: 12.5, fontWeight: 800 }}>
                                {formatNumber(row.available_to_sell)}
                              </TableCell>
                              <TableCell><Chip size="small" color={status.color} label={status.label} /></TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{
                    display: { xs: "grid", md: "none" },
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                    gap: 1.5, alignItems: "stretch",
                  }}>
                    {rows.map((row) => {
                      const status = stockStatuses[row.stock_status]
                        || { label: "No informado", color: "default" };

                      return (
                        <Box key={`${row.resource_type}-${row.resource_id}-${row.warehouse_id}`} sx={{
                          p: 1.75, minHeight: 218, height: "100%",
                          border: "1px solid", borderColor: "divider",
                          borderRadius: 1, bgcolor: "background.default",
                        }}>
                          <Stack spacing={1.3}>
                            <Box>
                              <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{row.resource_name}</Typography>
                              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                                {resourceLabel(row.resource_type)} · {row.warehouse_name}
                              </Typography>
                            </Box>
                            <Box><Chip size="small" color={status.color} label={status.label} /></Box>
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1 }}>
                              {[
                                ["Existencia", row.on_hand],
                                ["Reservado", row.active_reserved_qty],
                                ["Disponible", row.available_to_sell],
                              ].map(([label, value]) => (
                                <Box key={label}>
                                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{label}</Typography>
                                  <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{formatNumber(value)}</Typography>
                                </Box>
                              ))}
                            </Box>
                            <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                              Unidad: {row.unit || "No informada"}
                            </Typography>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Box>
                </>
              )}

              <DashboardPagination
                pagination={data.pagination}
                onChange={setPage}
                itemLabel="registros"
              />
            </Stack>
          </Paper>

          {/* Desgloses oficiales: cantidades separadas por unidad */}
          <WarehouseBreakdown
            title="Existencias por almacén"
            description="Cantidades agrupadas por almacén, tipo de recurso y unidad de medida."
            rows={data.stock_breakdown}
            columns={stockColumns}
            page={stockPage}
            onPageChange={setStockPage}
            itemLabel="grupos"
          />

          <WarehouseBreakdown
            title="Reservas por almacén"
            description="Reservas activas y recursos donde las reservas superan las existencias físicas."
            rows={data.reservation_breakdown}
            columns={reservationColumns}
            page={reservationPage}
            onPageChange={setReservationPage}
            itemLabel="grupos"
          />
        </>
      ) : (
        <Paper sx={panelSx}>
          <Stack alignItems="center" spacing={1.5} sx={{ py: 4 }}>
            <Inventory2OutlinedIcon sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
              No hay información de inventario para mostrar.
            </Typography>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}