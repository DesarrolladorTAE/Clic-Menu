//src/components/menu/menuSets/dashboard/OwnerDashboardOverview.jsx
import { useMemo } from "react";

import {
  Box, LinearProgress, Paper, Skeleton, Stack, Typography,
} from "@mui/material";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
};

const numberFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 3,
});

const INVENTORY_LABELS = {
  total: "Total", count: "Registros",
  total_resources: "Recursos inventariables",
  total_items: "Registros de inventario",
  total_rows: "Registros de inventario",
  total_warehouses: "Almacenes",
  total_ingredients: "Ingredientes",
  total_products: "Productos",
  ingredients: "Ingredientes",
  products: "Productos",
  resources: "Recursos",
  warehouses: "Almacenes",
  available: "Disponibles",
  out_of_stock: "Sin existencias",
  without_stock_record: "Sin registro de existencias",
  not_operational: "No operativos",
  total_on_hand: "Existencia física total",
  total_active_reserved_qty: "Reservas activas totales",
  total_available_to_sell: "Disponibilidad total para venta",
  on_hand: "Existencia física",
  active_reserved_qty: "Cantidad reservada",
  available_to_sell: "Disponible para venta",
  available_rows: "Registros disponibles",
  out_of_stock_rows: "Registros sin existencias",
  without_stock_record_rows: "Registros sin existencias registradas",
  not_operational_rows: "Registros no operativos",
  reserved: "Reservado",
  consumed: "Consumido",
  committed: "Comprometido",
  remaining: "Restante",
  quantity: "Cantidad",
};

const INVENTORY_WORDS = {
  total: "Total", count: "cantidad", items: "registros",
  rows: "registros", resource: "recurso", resources: "recursos",
  ingredient: "ingrediente", ingredients: "ingredientes",
  product: "producto", products: "productos",
  warehouse: "almacén", warehouses: "almacenes",
  inventory: "inventario", stock: "existencias",
  available: "disponibles", reserved: "reservadas",
  active: "activas", on: "en", hand: "existencia",
  to: "para", sell: "venta", qty: "cantidad",
  quantity: "cantidad", physical: "física",
  records: "registros", record: "registro",
  without: "sin", out: "sin", of: "de",
  not: "no", operational: "operativos",
  exhausted: "agotados", low: "bajos",
  zero: "cero", negative: "negativos",
  current: "actuales", pending: "pendientes",
  missing: "faltantes", enabled: "habilitados",
  disabled: "deshabilitados", sum: "suma",
};

function formatNumber(value) {
  if (value === null || value === undefined || value === "" || typeof value === "boolean") {
    return "—";
  }

  const number = Number(value);
  return Number.isFinite(number) ? numberFormatter.format(number) : "—";
}

function isNumericValue(value) {
  return typeof value === "number" && Number.isFinite(value)
    || typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value));
}

function inventoryLabel(path, index) {
  const key = path[path.length - 1];
  const prefix = path.slice(0, -1)
    .map((part) => INVENTORY_LABELS[part] || null)
    .filter(Boolean);

  let label = INVENTORY_LABELS[key];

  if (!label) {
    const words = key.split("_");
    label = words.every((word) => INVENTORY_WORDS[word])
      ? words.map((word) => INVENTORY_WORDS[word]).join(" ")
      : `Indicador de inventario ${index + 1}`;
  }

  return [...prefix, label].join(" · ");
}

function getInventoryMetrics(inventory) {
  const metrics = [];

  const collect = (source, path = []) => {
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      return;
    }

    Object.entries(source).forEach(([key, value]) => {
      const nextPath = [...path, key];

      if (isNumericValue(value)) {
        metrics.push({
          key: nextPath.join("."),
          label: inventoryLabel(nextPath, metrics.length),
          value,
        });
      } else if (value && typeof value === "object" && !Array.isArray(value) && path.length < 2) {
        collect(value, nextPath);
      }
    });
  };

  collect(inventory);
  return metrics;
}

function buildMetrics(source, definitions) {
  return definitions.map(([key, label]) => ({
    key, label, value: source?.[key],
  }));
}

function MetricCard({ label, value }) {
  return (
    <Box sx={{
      minWidth: 0, minHeight: 118, height: "100%",
      p: 1.75, border: "1px solid",
      borderColor: "divider", borderRadius: 1,
      bgcolor: "background.default",
    }}>
      <Stack spacing={1.5} sx={{ height: "100%" }}>
        <Typography sx={{
          fontSize: 12, fontWeight: 800,
          color: "text.secondary", lineHeight: 1.5,
          overflowWrap: "anywhere",
        }}>
          {label}
        </Typography>

        <Typography sx={{
          mt: "auto !important",
          fontSize: { xs: 23, sm: 27 },
          fontWeight: 800, lineHeight: 1.15,
          color: "text.primary", overflowWrap: "anywhere",
          fontVariantNumeric: "tabular-nums",
        }}>
          {formatNumber(value)}
        </Typography>
      </Stack>
    </Box>
  );
}

function MetricSection({ title, description, icon, metrics }) {
  return (
    <Paper sx={panelSx}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box sx={{
            width: 42, height: 42, flexShrink: 0,
            display: "grid", placeItems: "center",
            borderRadius: 1, bgcolor: "action.hover",
            color: "primary.main",
          }}>
            {icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontSize: 18, fontWeight: 800, color: "text.primary",
            }}>
              {title}
            </Typography>

            <Typography sx={{
              mt: 0.4, fontSize: 12, lineHeight: 1.55,
              color: "text.secondary",
            }}>
              {description}
            </Typography>
          </Box>
        </Stack>

        {metrics.length > 0 ? (
          <Box sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gridAutoRows: "1fr",
            gap: 1.5,
            alignItems: "stretch",
          }}>
            {metrics.map((metric) => (
              <MetricCard
                key={metric.key}
                label={metric.label}
                value={metric.value}
              />
            ))}
          </Box>
        ) : (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            No se recibieron indicadores para este apartado.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default function OwnerDashboardOverview({ data, loading = false }) {
  const inventoryMetrics = useMemo(
    () => getInventoryMetrics(data?.inventory),
    [data?.inventory]
  );

  if (!data && loading) {
    return (
      <Stack spacing={2.5}>
        {[1, 2, 3].map((item) => (
          <Paper key={item} sx={panelSx}>
            <Skeleton variant="text" width="35%" height={32} />
            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
              gap: 1.5, mt: 1.5,
            }}>
              {[1, 2, 3, 4].map((number) => (
                <Skeleton key={number} variant="rounded" height={118} />
              ))}
            </Box>
          </Paper>
        ))}
      </Stack>
    );
  }

  if (!data) {
    return (
      <Paper sx={{ ...panelSx, py: 5, textAlign: "center" }}>
        <AssessmentOutlinedIcon sx={{ fontSize: 42, color: "text.disabled" }} />

        <Typography sx={{ mt: 1, fontSize: 18, fontWeight: 800 }}>
          No hay información para mostrar
        </Typography>

        <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary" }}>
          Selecciona una sucursal y una fecha de servicio válidas.
        </Typography>
      </Paper>
    );
  }

  const productMetrics = buildMetrics(data.products, [
    ["total_products", "Productos evaluados"],
    ["available_products", "Productos disponibles"],
    ["inventory_exhausted_products", "Productos sin inventario"],
    ["configuration_unavailable_products", "Productos con configuración no disponible"],
  ]);

  const menuSetMetrics = buildMetrics(data.menu_sets, [
    ["total_menu_sets", "Conjuntos registrados"],
    ["active_menu_sets", "Conjuntos activos"],
    ["sellable_menu_sets", "Disponibles para venta"],
    ["unsellable_menu_sets", "No disponibles para venta"],
    ["capacity_exhausted_menu_sets", "Sin cupo"],
    ["inventory_exhausted_menu_sets", "Sin inventario"],
    ["both_exhausted_menu_sets", "Sin cupo ni inventario"],
    ["configuration_unavailable_menu_sets", "Configuración no disponible"],
    ["mass_import_menu_sets", "Administración masiva"],
  ]);

  const importMetrics = buildMetrics(data.import_updates, [
    ["total_menu_sets", "Conjuntos con administración masiva"],
    ["updated_menu_sets", "Actualizados"],
    ["pending_menu_sets", "Actualización pendiente"],
    ["overdue_menu_sets", "Actualización vencida"],
    ["updates_due", "Actualización requerida"],
    ["inherited_publications", "Programación heredada"],
    ["configuration_unavailable_menu_sets", "Configuración no disponible"],
  ]);

  const reminderMetrics = buildMetrics(data.reminders, [
    ["total_reminders", "Avisos registrados"],
    ["sent_reminders", "Avisos enviados"],
    ["failed_reminders", "Avisos fallidos"],
    ["processing_reminders", "Avisos en proceso"],
  ]);

  return (
    <Stack spacing={2.5}>
      {loading ? <LinearProgress sx={{ height: 3, borderRadius: 1 }} /> : null}

      <Paper sx={panelSx}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <AssessmentOutlinedIcon sx={{ color: "primary.main", fontSize: 25 }} />

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 800 }}>
              Estado general de la sucursal
            </Typography>

            <Typography sx={{
              mt: 0.5, fontSize: 13, lineHeight: 1.6, color: "text.secondary",
            }}>
              Inventario y productos muestran su disponibilidad actual.
              Conjuntos y actualizaciones consideran la fecha de servicio seleccionada.
              Los avisos corresponden a los periodos de actualización consultados.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <MetricSection
        title="Inventario"
        description="Existencias físicas, reservas y disponibilidad actual registradas en la sucursal."
        icon={<Inventory2OutlinedIcon />}
        metrics={inventoryMetrics}
      />

      <MetricSection
        title="Productos"
        description="Disponibilidad general de productos, considerando su configuración y existencias."
        icon={<CategoryOutlinedIcon />}
        metrics={productMetrics}
      />

      <MetricSection
        title="Conjuntos"
        description="Estado operativo para la fecha de servicio. Un conjunto activo no necesariamente está disponible para venderse."
        icon={<LayersOutlinedIcon />}
        metrics={menuSetMetrics}
      />

      <MetricSection
        title="Actualizaciones"
        description="Seguimiento del siguiente periodo comercial de los conjuntos administrados mediante archivos."
        icon={<UpdateOutlinedIcon />}
        metrics={importMetrics}
      />

      <MetricSection
        title="Avisos"
        description="Resultados de los recordatorios registrados para los periodos comerciales correspondientes."
        icon={<NotificationsNoneOutlinedIcon />}
        metrics={reminderMetrics}
      />
    </Stack>
  );
}