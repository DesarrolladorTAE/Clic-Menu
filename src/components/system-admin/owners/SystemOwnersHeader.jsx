import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function SystemOwnersHeader({ onCreate, refreshing = false }) {
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
          Propietarios
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: { xs: 15, md: 18 },
          }}
        >
          Administra las cuentas de propietarios registradas en el sistema.
        </Typography>

        {refreshing ? (
          <Typography
            sx={{
              mt: 1,
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Actualizando cambios…
          </Typography>
        ) : null}
      </Box>

      <Button
        onClick={onCreate}
        variant="contained"
        startIcon={<AddIcon />}
        sx={{
          minWidth: { xs: "100%", sm: 210 },
          height: 44,
          borderRadius: 2,
          fontWeight: 800,
        }}
      >
        Crear propietario
      </Button>
    </Stack>
  );
}