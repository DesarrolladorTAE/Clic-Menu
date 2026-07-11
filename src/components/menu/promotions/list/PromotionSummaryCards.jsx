import {
  Box, Chip, Stack, Typography,
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
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))",
        },
        gap: 2,
      }}
    >
      {ITEMS.map((item) => (
        <SummaryCard
          key={item.key}
          {...item}
          value={summary?.[item.key] || 0}
        />
      ))}
    </Box>
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
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.paper",
        minHeight: 160,
        height: "100%",
      }}
    >
      <Stack spacing={1.25} sx={{ height: "100%" }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
        >
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
            fontSize: 28,
            fontWeight: 900,
            color: "text.primary",
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
            minHeight: 34,
          }}
        >
          {helper}
        </Typography>

        <Box sx={{ mt: "auto" }}>
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
