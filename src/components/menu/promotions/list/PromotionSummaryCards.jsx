import {
  Box, Chip, Paper, Stack, Typography,
} from "@mui/material";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";

const ITEMS = [
  {
    key: "total",
    label: "Promociones totales",
    helper: "Registradas en este tipo.",
    chipLabel: "Total",
    chipColor: "primary",
    icon: LocalOfferOutlinedIcon,
  },
  {
    key: "active",
    label: "Promociones activas",
    helper: "Habilitadas para aplicarse.",
    chipLabel: "Activas",
    chipColor: "success",
    icon: CheckCircleOutlineOutlinedIcon,
  },
  {
    key: "inactive",
    label: "Promociones inactivas",
    helper: "Guardadas, pero no disponibles.",
    chipLabel: "Inactivas",
    chipColor: "default",
    icon: PauseCircleOutlineOutlinedIcon,
  },
  {
    key: "current",
    label: "Vigentes hoy",
    helper: "Activas dentro de su fecha.",
    chipLabel: "Vigentes",
    chipColor: "info",
    icon: EventAvailableOutlinedIcon,
  },
];

export default function PromotionSummaryCards({
  summary,
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
          {ITEMS.map((item) => (
            <SummaryCard
              key={item.key}
              {...item}
              value={summary?.[item.key] || 0}
            />
          ))}
        </Stack>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          El resumen corresponde al tipo de promoción seleccionado.
        </Typography>
      </Stack>
    </Paper>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  helper,
  chipLabel,
  chipColor,
}) {
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
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <Icon fontSize="small" />
          </Box>

          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            {label}
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

        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {helper}
        </Typography>

        <Box>
          <Chip
            label={chipLabel}
            size="small"
            color={chipColor}
            variant={
              chipColor === "default"
                ? "outlined"
                : "filled"
            }
          />
        </Box>
      </Stack>
    </Box>
  );
}