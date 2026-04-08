import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function PurchasesHeader({ onCreate }) {
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
          Compras
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: { xs: 14, md: 17 },
          }}
        >
          Administra compras draft y completadas para ingredientes y productos
          con inventario directo.
        </Typography>
      </Box>

      <Button
        onClick={onCreate}
        variant="contained"
        startIcon={<AddIcon />}
        sx={{
          minWidth: { xs: "100%", sm: 190 },
          height: 44,
          borderRadius: 2,
          fontWeight: 800,
        }}
      >
        Nueva compra
      </Button>
    </Stack>
  );
}
