import {
  Box, Button, Stack, Typography,
} from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

export default function MenusHeader({
  branchName,
  onCreate,
  disabled = false,
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
          Menús por sucursal
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: { xs: 14, md: 17 },
            lineHeight: 1.55,
          }}
        >
          Construye y administra los menús de{" "}
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

      <Button
        type="button"
        variant="contained"
        startIcon={<AddOutlinedIcon />}
        onClick={onCreate}
        disabled={disabled}
        sx={{
          minWidth: { xs: "100%", sm: 190 },
          width: { xs: "100%", md: "auto" },
          height: 44,
          fontWeight: 800,
        }}
      >
        Nuevo menú
      </Button>
    </Stack>
  );
}