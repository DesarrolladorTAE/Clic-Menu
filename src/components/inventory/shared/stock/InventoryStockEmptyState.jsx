import { Box, Button, Typography } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

export default function InventoryStockEmptyState({
  title = "No hay registros",
  description = "No se encontraron resultados para los filtros actuales.",
  actionLabel,
  onAction,
}) {
  return (
    <Box
      sx={{
        px: 3,
        py: 5,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          mx: "auto",
          mb: 2,
          borderRadius: 999,
          bgcolor: "rgba(255, 152, 0, 0.12)",
          color: "primary.main",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Inventory2OutlinedIcon sx={{ fontSize: 34 }} />
      </Box>

      <Typography
        sx={{
          fontSize: 20,
          fontWeight: 800,
          color: "text.primary",
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: "text.secondary",
          fontSize: 14,
          maxWidth: 560,
          mx: "auto",
        }}
      >
        {description}
      </Typography>

      {actionLabel && onAction ? (
        <Button
          onClick={onAction}
          variant="contained"
          sx={{
            mt: 2.5,
            minWidth: 220,
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  );
}
