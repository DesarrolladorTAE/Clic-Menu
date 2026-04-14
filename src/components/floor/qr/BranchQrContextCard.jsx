import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import TableRestaurantOutlinedIcon from "@mui/icons-material/TableRestaurantOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";

export default function BranchQrContextCard({
  selectedBranch,
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
            icon={<QrCode2OutlinedIcon fontSize="small" />}
            title="QRs registrados"
            value={`${contextData?.totalQrs || 0} QR(s)`}
            chipLabel={contextData?.totalQrs ? "Con datos" : "Vacío"}
            chipColor={contextData?.totalQrs ? "primary" : "default"}
          />

          <ContextMiniCard
            icon={<TableRestaurantOutlinedIcon fontSize="small" />}
            title="Mesas disponibles"
            value={`${contextData?.totalTables || 0} mesa(s)`}
            chipLabel="Sucursal"
            chipColor="success"
          />

          <ContextMiniCard
            icon={<CampaignOutlinedIcon fontSize="small" />}
            title="Canales"
            value={`${contextData?.totalChannels || 0} canal(es)`}
            chipLabel="Configurados"
            chipColor={contextData?.totalChannels ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<SettingsSuggestOutlinedIcon fontSize="small" />}
            title="QR habilitado"
            value={contextData?.enabledLabel || "Sin config"}
            chipLabel={contextData?.orderingMode || "Sin definir"}
            chipColor="primary"
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
            ? `La configuración y administración de códigos QR se aplicará únicamente a ${selectedBranch.name}.`
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