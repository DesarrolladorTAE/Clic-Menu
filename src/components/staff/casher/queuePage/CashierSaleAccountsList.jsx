// src/components/staff/casher/queuePage/CashierSaleAccountsList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import CashierSaleAccountRow from "./CashierSaleAccountRow";

const PAGE_SIZE = 2;

export default function CashierSaleAccountsList({
  checks = [],
  isMine = false,
  disabled = false,
  onOpenCheck,
  onReopenCheck,
}) {
  const [page, setPage] = useState(1);

  const safeChecks = useMemo(() => (Array.isArray(checks) ? checks : []), [checks]);
  const totalPages = Math.max(1, Math.ceil(safeChecks.length / PAGE_SIZE));
  const checksKey = safeChecks.map((check) => check?.order_check_id || check?.id || 0).join(",");

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [checksKey]);

  if (safeChecks.length === 0) return null;

  const start = (page - 1) * PAGE_SIZE;
  const visibleChecks = safeChecks.slice(start, start + PAGE_SIZE);

  return (
    <Box sx={{ display: "grid", gap: 1.25 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>Cuentas</Typography>
        <Chip label={safeChecks.length} size="small" color="secondary" variant="outlined" />
      </Stack>

      <Stack spacing={1}>
        {visibleChecks.map((check) => {
          const checkId = Number(check?.order_check_id || check?.id || 0);

          return (
            <CashierSaleAccountRow
              key={checkId ? `check:${checkId}` : `sale:${Number(check?.sale_id || 0)}`}
              check={check}
              isMine={isMine}
              disabled={disabled}
              onOpen={onOpenCheck}
              onReopen={onReopenCheck}
            />
          );
        })}
      </Stack>

      {totalPages > 1 ? (
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={page <= 1 || disabled}
            onClick={() => setPage((current) => current - 1)}
            startIcon={<ChevronLeftRoundedIcon />}
          >
            Anterior
          </Button>

          <Typography sx={{ minWidth: 58, textAlign: "center", fontSize: 12, fontWeight: 700, color: "text.primary" }}>
            {page} / {totalPages}
          </Typography>

          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={page >= totalPages || disabled}
            onClick={() => setPage((current) => current + 1)}
            endIcon={<ChevronRightRoundedIcon />}
          >
            Siguiente
          </Button>
        </Stack>
      ) : null}
    </Box>
  );
}
