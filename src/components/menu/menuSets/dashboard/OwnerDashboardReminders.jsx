//src/components/menu/menuSets/dashboard/OwnerDashboardReminders.jsx
import { Box, Paper, Stack, Typography } from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";

import ReminderPreview from "./reminders/ReminderPreview";
import ReminderHistory from "./reminders/ReminderHistory";
import ReminderChannelStatus from "./reminders/ReminderChannelStatus";

const panelSx = {
  p: { xs: 2, sm: 2.5 }, border: "1px solid",
  borderColor: "divider", borderRadius: 1,
  bgcolor: "background.paper", boxShadow: "none",
};

export default function OwnerDashboardReminders({ restaurantId, branchId, onAlert }) {
  return (
    <Stack spacing={2.5}>
      <Paper sx={panelSx}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box sx={{
            width: 44, height: 44, flexShrink: 0,
            display: "grid", placeItems: "center",
            borderRadius: 1, bgcolor: "action.hover", color: "primary.main",
          }}>
            <NotificationsNoneOutlinedIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 19, fontWeight: 800 }}>
              Avisos automáticos
            </Typography>

            <Typography sx={{
              mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.6,
            }}>
              Consulta el canal de WhatsApp de la sucursal, simula los avisos
              programados y revisa los resultados históricos de envío.
              La simulación es exclusivamente informativa.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <ReminderChannelStatus
        restaurantId={restaurantId}
        branchId={branchId}
        onAlert={onAlert}
      />

      <ReminderPreview
        restaurantId={restaurantId}
        branchId={branchId}
        onAlert={onAlert}
      />

      <ReminderHistory
        restaurantId={restaurantId}
        branchId={branchId}
        onAlert={onAlert}
      />
    </Stack>
  );
}