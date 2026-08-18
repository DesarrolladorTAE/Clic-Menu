import React from "react";
import { Button, Stack, Typography } from "@mui/material";

export default function KitchenTopbar({ ctx, busy, onExit }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      spacing={2}
    >
      <Stack spacing={0.4} sx={{ minWidth: 0 }}>
        <Typography
          variant="h5"
          sx={{
            fontSize: { xs: 24, sm: 28 },
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.2,
          }}
        >
          Monitor de Cocina (KDS)
        </Typography>

        <Typography sx={{ fontSize: 13, color: "text.secondary", wordBreak: "break-word" }}>
          {ctx?.restaurant?.trade_name || ctx?.restaurant?.name || "—"}
          <span style={{ opacity: 0.6 }}> · </span>
          {ctx?.branch?.name || "—"}
        </Typography>
      </Stack>

      <Button
        type="button"
        variant="contained"
        color="primary"
        disabled={busy}
        onClick={onExit}
        sx={{
          minWidth: { xs: "100%", sm: 110 },
          alignSelf: { xs: "stretch", sm: "center" },
        }}
      >
        Salir
      </Button>
    </Stack>
  );
} 