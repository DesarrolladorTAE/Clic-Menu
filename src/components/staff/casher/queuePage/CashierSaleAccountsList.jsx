import React from "react";
import {
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import CashierSaleAccountRow from "./CashierSaleAccountRow";

export default function CashierSaleAccountsList({
  checks = [],
  isMine = false,
  disabled = false,
  onOpenCheck,
  onReopenCheck,
}) {
  const safeChecks = Array.isArray(checks) ? checks : [];

  if (safeChecks.length === 0) return null;

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Cuentas
        </Typography>

        <Chip
          label={safeChecks.length}
          size="small"
          sx={{
            height: 23,
            fontWeight: 800,
            bgcolor: "#FFF3E0",
            color: "#A75A00",
          }}
        />
      </Stack>

       <Stack spacing={1}>
        {safeChecks.map((check) => {
          const checkId = Number(
            check?.order_check_id || check?.id || 0
          );

          return (
            <CashierSaleAccountRow
              key={
                checkId
                  ? `check:${checkId}`
                  : `sale:${Number(check?.sale_id || 0)}`
              }
              check={check}
              isMine={isMine}
              disabled={disabled}
              onOpen={onOpenCheck}
              onReopen={onReopenCheck}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
