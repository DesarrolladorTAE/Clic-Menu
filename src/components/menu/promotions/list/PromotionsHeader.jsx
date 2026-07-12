import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

export default function PromotionsHeader({
  branchName,
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
          Promociones
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: { xs: 14, md: 17 },
            lineHeight: 1.55,
          }}
        >
          Configura las promociones automáticas de{" "}
          <Box
            component="span"
            sx={{
              color: "primary.main",
              fontWeight: 800,
            }}
          >
            {branchName || "la sucursal seleccionada"}
          </Box>
          .
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ width: { xs: "100%", md: "auto" } }}
      >
        <Button
          type="button"
          onClick={onCreate}
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          sx={{
            minWidth: { xs: "100%", sm: 190 },
            height: 44,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          Crear promoción
        </Button>
      </Stack>
    </Stack>
  );
}