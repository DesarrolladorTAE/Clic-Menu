import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import TableRestaurantOutlinedIcon from "@mui/icons-material/TableRestaurantOutlined";

export default function FloorPlanHeader({
  selectedBranch,
  zonesCount = 0,
  tablesCount = 0,
  onCreateZone,
  onCreateTable,
  onEditSettings,
  onManageQr,
  canManageQr = false,
}) {
  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", lg: "center" }}
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
            Diseño del salón
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: { xs: 14, md: 17 },
              lineHeight: 1.55,
            }}
          >
            Organiza las zonas y mesas de{" "}
            <Box
              component="span"
              sx={{ color: "primary.main", fontWeight: 800 }}
            >
              {selectedBranch?.name || "la sucursal seleccionada"}
            </Box>
            . Actualmente tienes{" "}
            <Box component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
              {zonesCount} zona{zonesCount === 1 ? "" : "s"}
            </Box>{" "}
            y{" "}
            <Box component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
              {tablesCount} mesa{tablesCount === 1 ? "" : "s"}
            </Box>
            .
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        useFlexGap
        flexWrap="wrap"
      >
        <Button
          onClick={onCreateZone}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            minWidth: { xs: "100%", sm: 180 },
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          Nueva zona
        </Button>

        <Button
          onClick={onCreateTable}
          variant="outlined"
          startIcon={<TableRestaurantOutlinedIcon />}
          sx={{
            minWidth: { xs: "100%", sm: 180 },
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          Nueva mesa
        </Button>

        <Button
          onClick={onEditSettings}
          variant="outlined"
          startIcon={<SettingsOutlinedIcon />}
          sx={{
            minWidth: { xs: "100%", sm: 220 },
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          Configuración operativa
        </Button>

        <Button
          onClick={onManageQr}
          variant={canManageQr ? "contained" : "outlined"}
          startIcon={<QrCode2OutlinedIcon />}
          sx={{
            minWidth: { xs: "100%", sm: 200 },
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          Administrar QRs
        </Button>
      </Stack>
    </Stack>
  );
}
