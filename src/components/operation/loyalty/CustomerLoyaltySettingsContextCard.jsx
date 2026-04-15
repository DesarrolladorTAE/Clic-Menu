import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import StarsOutlinedIcon from "@mui/icons-material/StarsOutlined";
import RuleFolderOutlinedIcon from "@mui/icons-material/RuleFolderOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

export default function CustomerLoyaltySettingsContextCard({
  loyaltyData,
  restaurantName,
}) {
  const preview = loyaltyData?.preview || {};
  const isEnabled = Boolean(loyaltyData?.is_enabled);

  const earnRateAmount = Number(loyaltyData?.earn_rate_amount ?? 0);
  const pointsPerRate = Number(loyaltyData?.points_per_rate ?? 0);

  const currentRule =
    earnRateAmount > 0 && pointsPerRate > 0
      ? `${pointsPerRate} punto${pointsPerRate === 1 ? "" : "s"} por cada $${earnRateAmount}`
      : "Sin definir";

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Stack spacing={2}>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Contexto actual
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
        >
          <ContextMiniCard
            icon={<StarsOutlinedIcon fontSize="small" />}
            title="Estado del programa"
            value={isEnabled ? "Programa activo" : "Programa desactivado"}
            chipLabel={isEnabled ? "Activo" : "Inactivo"}
            chipColor={isEnabled ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<RuleFolderOutlinedIcon fontSize="small" />}
            title="Regla actual"
            value={currentRule}
            chipLabel={String(loyaltyData?.earn_mode || "amount_ratio")}
            chipColor="primary"
          />

          <ContextMiniCard
            icon={<ShoppingBagOutlinedIcon fontSize="small" />}
            title="Vista previa"
            value={`Venta ejemplo: ${preview?.points ?? 0} punto${
              Number(preview?.points ?? 0) === 1 ? "" : "s"
            }`}
            chipLabel={preview?.reason || "PREVIEW"}
            chipColor={preview?.reason === "OK" ? "success" : "default"}
          />
        </Stack>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          {restaurantName
            ? `La configuración que guardes se aplicará a todas las ventas de ${restaurantName}.`
            : "La configuración se aplicará a todas las ventas del restaurante seleccionado."}
        </Typography>
      </Stack>
    </Paper>
  );
}

function ContextMiniCard({ icon, title, value, chipLabel, chipColor = "default" }) {
  return (
    <Box
      sx={{
        flex: "1 1 240px",
        minWidth: 220,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            {title}
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: 14,
            color: "text.primary",
            lineHeight: 1.45,
            minHeight: 42,
          }}
        >
          {value}
        </Typography>

        <Box>
          <Chip
            label={chipLabel}
            size="small"
            color={chipColor}
            variant={chipColor === "default" ? "outlined" : "filled"}
          />
        </Box>
      </Stack>
    </Box>
  );
}
