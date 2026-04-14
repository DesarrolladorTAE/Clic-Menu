import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import TableRestaurantOutlinedIcon from "@mui/icons-material/TableRestaurantOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";

export default function FloorPlanContextCard({
  selectedBranch,
  settings,
  settingsSummary,
  contextData,
}) {
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
            icon={<GridViewOutlinedIcon fontSize="small" />}
            title="Zonas registradas"
            value={`${contextData?.zonesCount || 0} zona(s)`}
            chipLabel={selectedBranch?.name ? "Activa" : "Sin sucursal"}
            chipColor={selectedBranch?.name ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<TableRestaurantOutlinedIcon fontSize="small" />}
            title="Mesas registradas"
            value={`${contextData?.tablesCount || 0} mesa(s)`}
            chipLabel={contextData?.tablesCount ? "Con datos" : "Vacío"}
            chipColor={contextData?.tablesCount ? "primary" : "default"}
          />

          <ContextMiniCard
            icon={<SettingsSuggestOutlinedIcon fontSize="small" />}
            title="Modo operativo"
            value={
              settingsSummary
                ? `${settingsSummary.tableServiceLabel}${
                    settingsSummary.strategyLabel
                      ? ` · ${settingsSummary.strategyLabel}`
                      : ""
                  }`
                : "Sin configuración"
            }
            chipLabel={settings ? "Configurado" : "Pendiente"}
            chipColor={settings ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<QrCode2OutlinedIcon fontSize="small" />}
            title="QR para mesas"
            value={settingsSummary?.qrLabel || "Sin configuración"}
            chipLabel={contextData?.canManageQr ? "Disponible" : "Bloqueado"}
            chipColor={contextData?.canManageQr ? "success" : "default"}
          />
        </Stack>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          {selectedBranch?.name
            ? `La administración que realices aquí se aplicará únicamente a ${selectedBranch.name}.`
            : "Selecciona una sucursal para continuar."}
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
