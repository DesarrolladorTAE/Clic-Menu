import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

export default function PreparedItemContextCard({
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          <ContextMiniCard
            icon={<AccessTimeOutlinedIcon fontSize="small" />}
            title="Tiempo general"
            value={`${contextData?.defaultMinutes || 0} minuto(s)`}
            chipLabel="Sucursal"
            chipColor="primary"
          />

          <ContextMiniCard
            icon={<Inventory2OutlinedIcon fontSize="small" />}
            title="Productos listados"
            value={`${contextData?.totalProducts || 0} producto(s)`}
            chipLabel="Catálogo"
          />

          <ContextMiniCard
            icon={<CheckCircleOutlineOutlinedIcon fontSize="small" />}
            title="Reutilizables"
            value={`${contextData?.reusableProducts || 0} producto(s)`}
            chipLabel="Habilitados"
            chipColor="success"
          />

          <ContextMiniCard
            icon={<TuneOutlinedIcon fontSize="small" />}
            title="Tiempo particular"
            value={`${contextData?.customMinutesProducts || 0} producto(s)`}
            chipLabel="Personalizados"
            chipColor="primary"
          />
        </Box>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          {selectedBranch?.name
            ? `Esta configuración pertenece únicamente a ${selectedBranch.name}.`
            : "Selecciona una sucursal para consultar su configuración."}
        </Typography>
      </Stack>
    </Paper>
  );
}

function ContextMiniCard({
  icon,
  title,
  value,
  chipLabel,
  chipColor = "default",
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        minHeight: 150,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
      }}
    >
      <Stack spacing={1} sx={{ height: "100%" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
              flexShrink: 0,
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
            flex: 1,
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