import {
  Box, Button, Chip, Stack, Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

export default function PromotionsHeader({
  branchName,
  onCreate,
}) {
  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", lg: "center" }}
        spacing={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            flexWrap="wrap"
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 1,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(255, 152, 0, 0.12)",
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <LocalOfferOutlinedIcon />
            </Box>

            <Typography
              sx={{
                fontSize: { xs: 30, md: 42 },
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.1,
              }}
            >
              Promociones
            </Typography>

            {branchName ? (
              <Chip
                label={branchName}
                size="small"
                color="primary"
                variant="outlined"
              />
            ) : null}
          </Stack>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: { xs: 14, md: 17 },
              lineHeight: 1.55,
            }}
          >
            Configura promociones automáticas por sucursal,
            canal, producto, fecha y horario.
          </Typography>
        </Box>

        <Button
          type="button"
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={onCreate}
          sx={{
            minWidth: { xs: "100%", sm: 190 },
            flexShrink: 0,
          }}
        >
          Crear promoción
        </Button>
      </Stack>
    </Stack>
  );
}
