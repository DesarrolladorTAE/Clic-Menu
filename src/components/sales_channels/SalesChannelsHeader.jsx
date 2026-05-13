import { Button, Stack, Tooltip, Typography, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";

export default function SalesChannelsHeader({
  title,
  restaurantId,
  nav,
  saving,
  canUseAdditionalSalesChannels,
  planMessage,
  onCreate,
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
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: { xs: 15, md: 18 },
          }}
        >
          Aquí defines los canales posibles del restaurante, sin sucursales ni productos.
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column-reverse", sm: "row" }}
        spacing={1.5}
        width={{ xs: "100%", md: "auto" }}
      >
        <Button
          onClick={() => nav(`/owner/restaurants/${restaurantId}/settings`)}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{
            minWidth: { xs: "100%", sm: 150 },
            height: 44,
            borderRadius: 2,
          }}
        >
          Volver
        </Button>

        <Tooltip
          title={!canUseAdditionalSalesChannels ? planMessage : "Crear canal"}
        >
          <span>
            <Button
              onClick={onCreate}
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!canUseAdditionalSalesChannels || saving}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Crear canal
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Stack>
  );
}