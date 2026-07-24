import {
  Box, Paper, Stack, Typography,
} from "@mui/material";

import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";

const ITEMS = [
  {
    key: "available",
    label: "Canales disponibles",
    helper:
      "Configurados en la sucursal.",
    icon:
      CampaignOutlinedIcon,
  },
  {
    key: "enabled",
    label: "Canales habilitados",
    helper:
      "Donde participa el menú.",
    icon:
      CheckCircleOutlineOutlinedIcon,
  },
  {
    key: "defaults",
    label: "Predeterminados",
    helper:
      "Canales que usan este menú por defecto.",
    icon:
      StarOutlineOutlinedIcon,
  },
  {
    key: "blocked",
    label: "Canales bloqueados",
    helper:
      "Requieren corregir su configuración.",
    icon:
      BlockOutlinedIcon,
  },
];

export default function MenuChannelsSummaryCards({
  summary,
}) {
  return (
    <Paper
      sx={{
        p: {
          xs: 2,
          sm: 2.5,
        },
        borderRadius: 1,
        backgroundColor:
          "background.paper",
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
          Configuración actual
        </Typography>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
        >
          {ITEMS.map(
            (item) => (
              <SummaryCard
                key={item.key}
                {...item}
                value={
                  summary?.[
                    item.key
                  ] || 0
                }
              />
            )
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  helper,
}) {
  return (
    <Box
      sx={{
        flex: "1 1 220px",
        minWidth: 210,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor:
          "background.default",
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
              width: 36,
              height: 36,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor:
                "rgba(255, 152, 0, 0.12)",
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
            fontSize: 24,
            fontWeight: 800,
            color: "primary.main",
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            minHeight: 34,
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {helper}
        </Typography>
      </Stack>
    </Box>
  );
}