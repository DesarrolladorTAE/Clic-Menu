import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import KitchenRoundedIcon from "@mui/icons-material/KitchenRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

export default function CashierDirectHeaderCard({
  title = "Venta directa",
  subtitle = "Selecciona productos para crear una venta directa desde caja.",
  menuData = null,
  cashSession = null,
  cartCount = 0,
  cartTotal = 0,
  q = "",
  onSearchChange,
  totalVisible = 0,
  onBack,
  onOpenCart,
  onRefresh,
  syncing = false,
}) {
  const branchName =
    menuData?.branch?.name ||
    menuData?.header?.branchName ||
    menuData?.branch_name ||
    "Sucursal";

  const restaurantName =
    menuData?.restaurant?.trade_name ||
    menuData?.restaurant?.name ||
    menuData?.header?.restaurantName ||
    "Restaurante";

  const warehouseId =
    cashSession?.warehouse_id ||
    menuData?.cash_session?.warehouse_id ||
    cashSession?.cash_register?.warehouse_id ||
    null;

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.25}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", lg: "flex-start" }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                <Chip
                  icon={<PointOfSaleRoundedIcon />}
                  label="Caja directa"
                  size="small"
                  sx={{
                    fontWeight: 800,
                    bgcolor: "#E7F8EB",
                    color: "#0A7A2F",
                  }}
                />

                <Chip
                  icon={<KitchenRoundedIcon />}
                  label={resolveKitchenFlowLabel(menuData)}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    bgcolor: "#FFF4D9",
                    color: "#8A6D3B",
                  }}
                />

                <Chip
                  label={syncing ? "Sincronizando…" : "Menú activo"}
                  size="small"
                  sx={{
                    fontWeight: 800,
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  fontSize: { xs: 28, md: 40 },
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.06,
                }}
              >
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: { xs: 14, md: 16 },
                  lineHeight: 1.55,
                  maxWidth: 860,
                }}
              >
                {subtitle}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              sx={{ width: { xs: "100%", lg: "auto" } }}
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={onRefresh}
                startIcon={<RefreshRoundedIcon />}
                disabled={syncing}
                sx={{
                  minWidth: { xs: "100%", sm: 150 },
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                {syncing ? "Cargando…" : "Recargar"}
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                onClick={onBack}
                startIcon={<ArrowBackRoundedIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 150 },
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Volver
              </Button>

              <Button
                variant="contained"
                onClick={onOpenCart}
                startIcon={<ShoppingCartRoundedIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 180 },
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Carrito ({cartCount})
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
            }}
          >
            <MetricCard
              icon={<RestaurantMenuRoundedIcon />}
              label="Restaurante"
              value={restaurantName}
              helper={branchName}
            />

            <MetricCard
              icon={<PointOfSaleRoundedIcon />}
              label="Caja"
              value={
                cashSession?.cash_register?.name ||
                cashSession?.cash_register_name ||
                cashSession?.cash_register_id
                  ? `Caja #${cashSession?.cash_register_id}`
                  : "Caja activa"
              }
              helper={`Sesión #${cashSession?.id || menuData?.cash_session?.id || "—"}`}
            />

            <MetricCard
              icon={<KitchenRoundedIcon />}
              label="Almacén"
              value={warehouseId ? `#${warehouseId}` : "Sin almacén"}
              helper="Stock validado al cobrar"
            />

            <MetricCard
              icon={<ShoppingCartRoundedIcon />}
              label="Carrito"
              value={formatCurrency(cartTotal)}
              helper={`${cartCount} producto${cartCount === 1 ? "" : "s"}`}
            />
          </Box>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#FCFCFC",
              p: 1.5,
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                    mb: 1,
                  }}
                >
                  Buscar producto
                </Typography>

                <TextField
                  fullWidth
                  value={q}
                  onChange={(event) => onSearchChange?.(event.target.value)}
                  placeholder="Buscar por nombre, categoría o descripción"
                  InputProps={{
                    startAdornment: (
                      <SearchRoundedIcon
                        sx={{ mr: 1, color: "text.secondary" }}
                      />
                    ),
                  }}
                />
              </Box>

              <Box
                sx={{
                  minWidth: { xs: "100%", md: 190 },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: "#fff",
                  p: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  Resultados visibles
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 24,
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1,
                  }}
                >
                  {Number(totalVisible || 0)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function MetricCard({ icon, label, value, helper }) {
  return (
    <Box
      sx={{
        minHeight: 116,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor: "#fff",
        p: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: "rgba(255, 152, 0, 0.10)",
            color: "primary.main",
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 800,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Box sx={{ mt: 2, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 17,
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.15,
            wordBreak: "break-word",
          }}
        >
          {value || "—"}
        </Typography>

        <Typography
          sx={{
            mt: 0.75,
            fontSize: 13,
            color: "text.secondary",
            wordBreak: "break-word",
          }}
        >
          {helper || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

function resolveKitchenFlowLabel(menuData) {
  const mode =
    menuData?.cashier_direct_mode ||
    menuData?.kitchen_flow ||
    menuData?.branch_operational_setting?.cashier_direct_mode ||
    "";

  if (String(mode) === "without_kitchen") return "Sin cocina";
  if (String(mode) === "with_kitchen") return "Con cocina";

  return "Caja directa";
}

function formatCurrency(value) {
  const safe = Number(value || 0);

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
}