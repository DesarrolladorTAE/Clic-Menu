import {
  Box, Paper, Stack, Typography,
} from "@mui/material";

import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

const ITEMS = [
  {
    key: "sections",
    label: "Secciones",
    helper:
      "Secciones seleccionadas.",
    icon:
      ViewAgendaOutlinedIcon,
  },
  {
    key: "categories",
    label: "Categorías",
    helper:
      "Categorías incluidas.",
    icon:
      CategoryOutlinedIcon,
  },
  {
    key: "products",
    label: "Productos",
    helper:
      "Productos incluidos.",
    icon:
      RestaurantMenuOutlinedIcon,
  },
  {
    key: "schedules",
    label: "Horarios propios",
    helper:
      "Intervalos configurados.",
    icon:
      AccessTimeOutlinedIcon,
  },
];

export default function MenuContentSummaryCards({
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
          Contenido seleccionado
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
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          {helper}
        </Typography>
      </Stack>
    </Box>
  );
}