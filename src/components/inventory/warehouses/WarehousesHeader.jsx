import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

export default function WarehousesHeader({
  inventoryMode,
  onCreate,
  onEnsureDefaults,
  ensuringDefaults = false,
}) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={2}
    >
      <Box>
        <Typography
          sx={{
            fontSize: { xs: 30, md: 42 },
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.1,
          }}
        >
          Almacenes
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: { xs: 14, md: 17 },
          }}
        >
          Administra los almacenes de tu inventario en modo{" "}
          <Box
            component="span"
            sx={{ color: "primary.main", fontWeight: 800 }}
          >
            {inventoryMode === "global" ? "global" : "por sucursal"}
          </Box>
          .
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ width: { xs: "100%", md: "auto" } }}
      >
        <Button
          onClick={onEnsureDefaults}
          variant="outlined"
          startIcon={<AutoFixHighIcon />}
          disabled={ensuringDefaults}
          sx={{
            minWidth: { xs: "100%", sm: 210 },
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          {ensuringDefaults ? "Verificando…" : "Asegurar bases"}
        </Button>

        <Button
          onClick={onCreate}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            minWidth: { xs: "100%", sm: 190 },
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          Nuevo almacén
        </Button>
      </Stack>
    </Stack>
  );
}