import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import MergeRoundedIcon from "@mui/icons-material/MergeRounded";

const MODE_CHECKS = "checks";
const MODE_TABLES = "tables";

export default function CashierMergeSaleDialog({
  open,
  sale,
  mySales = [],
  submitting = false,
  onClose,
  onMergeChecks,
  onMergeTables,
}) {
  const canMergeChecks =
    sale?.permissions?.can_merge_checks === true;

  const canMergeTables =
    sale?.permissions?.can_merge_tables === true;

  const [mode, setMode] = useState(MODE_CHECKS);
  const [sourceCheckId, setSourceCheckId] = useState("");
  const [targetCheckId, setTargetCheckId] = useState("");
  const [sourceTableId, setSourceTableId] = useState("");
  const [targetTableId, setTargetTableId] = useState("");
  const [error, setError] = useState("");

  const checks = useMemo(
    () =>
      (Array.isArray(sale?.checks) ? sale.checks : []).filter(
        (check) => check?.flags?.editable === true
      ),
    [sale]
  );

  const sourceTables = useMemo(
    () => getSaleTables(sale),
    [sale]
  );

  const targetTables = useMemo(() => {
    const rows = [];
    const seen = new Set();

    (Array.isArray(mySales) ? mySales : []).forEach((candidateSale) => {
      const samePackage =
        getPackageKey(candidateSale) === getPackageKey(sale);

      if (
        samePackage ||
        candidateSale?.permissions?.can_merge_tables !== true
      ) {
        return;
      }

      getSaleTables(candidateSale).forEach((table) => {
        const tableId = Number(table?.id || 0);

        if (!tableId || seen.has(tableId)) return;

        seen.add(tableId);

        rows.push({
          id: tableId,
          name: table?.name || `Mesa #${tableId}`,
          package_key: getPackageKey(candidateSale),
          sale_id: Number(candidateSale?.sale_id || 0),
        });
      });
    });

    return rows;
  }, [mySales, sale]);

  useEffect(() => {
    if (!open) return;

    const initialMode = canMergeChecks
      ? MODE_CHECKS
      : MODE_TABLES;

    setMode(initialMode);
    setSourceCheckId("");
    setTargetCheckId("");
    setSourceTableId("");
    setTargetTableId("");
    setError("");
  }, [open, canMergeChecks]);

  useEffect(() => {
    if (!open || mode !== MODE_CHECKS || checks.length === 0) return;

    setSourceCheckId((current) =>
      checks.some((check) => getCheckId(check) === Number(current || 0))
        ? current
        : String(getCheckId(checks[0]))
    );
  }, [open, mode, checks]);

  useEffect(() => {
    if (!open || mode !== MODE_TABLES || sourceTables.length === 0) return;

    setSourceTableId((current) =>
      sourceTables.some((table) => Number(table.id) === Number(current || 0))
        ? current
        : String(sourceTables[0].id)
    );
  }, [open, mode, sourceTables]);

  useEffect(() => {
    if (
      Number(sourceCheckId || 0) === Number(targetCheckId || 0)
    ) {
      setTargetCheckId("");
    }
  }, [sourceCheckId, targetCheckId]);

  const targetChecks = checks.filter(
    (check) => getCheckId(check) !== Number(sourceCheckId || 0)
  );

  const handleMergeChecks = async () => {
    const sourceId = Number(sourceCheckId || 0);
    const targetId = Number(targetCheckId || 0);

    if (!sourceId || !targetId || sourceId === targetId) {
      setError("Selecciona cuentas de origen y destino diferentes.");
      return;
    }

    setError("");

    try {
      const result = await onMergeChecks?.({
        sourceCheckId: sourceId,
        targetCheckId: targetId,
        payload: {},
      });

      if (result?.ok) onClose?.();
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "No se pudieron juntar las cuentas."
      );
    }
  };

  const handleMergeTables = async () => {
    const sourceId = Number(sourceTableId || 0);
    const targetId = Number(targetTableId || 0);

    if (!sourceId || !targetId || sourceId === targetId) {
      setError("Selecciona mesas de origen y destino diferentes.");
      return;
    }

    setError("");

    try {
      const result = await onMergeTables?.({
        sourceTableId: sourceId,
        targetTableId: targetId,
        payload: {},
      });

      if (result?.ok) onClose?.();
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "No se pudieron juntar las mesas."
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <MergeRoundedIcon color="primary" />

          <Box>
            <Typography sx={{ fontSize: 21, fontWeight: 800 }}>
              Juntar cuentas o mesas
            </Typography>

            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              El backend validará propiedad, pagos, tickets y autorizaciones.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      {canMergeChecks && canMergeTables ? (
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <Tabs
            value={mode}
            onChange={(_, value) => {
              setMode(value);
              setError("");
            }}
            variant="fullWidth"
          >
            <Tab value={MODE_CHECKS} label="Juntar cuentas" />
            <Tab value={MODE_TABLES} label="Juntar mesas" />
          </Tabs>
        </Box>
      ) : null}

      <DialogContent dividers>
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          {!canMergeChecks && !canMergeTables ? (
            <Alert severity="warning">
              Esta venta no tiene operaciones de unión habilitadas.
            </Alert>
          ) : null}

          {mode === MODE_CHECKS && canMergeChecks ? (
            <>
              <CheckSelect
                label="Cuenta origen"
                value={sourceCheckId}
                checks={checks}
                onChange={setSourceCheckId}
                disabled={submitting}
              />

              <CheckSelect
                label="Cuenta destino"
                value={targetCheckId}
                checks={targetChecks}
                onChange={setTargetCheckId}
                disabled={submitting}
              />

              <Alert severity="info">
                La cuenta origen se integrará en la cuenta destino.
              </Alert>
            </>
          ) : null}

          {mode === MODE_TABLES && canMergeTables ? (
            <>
              <TableSelect
                label="Mesa origen"
                value={sourceTableId}
                tables={sourceTables}
                onChange={setSourceTableId}
                disabled={submitting}
              />

              <TableSelect
                label="Mesa destino"
                value={targetTableId}
                tables={targetTables}
                onChange={setTargetTableId}
                disabled={submitting}
              />

              {targetTables.length === 0 ? (
                <Alert severity="warning">
                  No hay otras mesas tomadas por esta caja que puedan
                  seleccionarse como destino.
                </Alert>
              ) : null}
            </>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          color="inherit"
          onClick={onClose}
          disabled={submitting}
          sx={{ fontWeight: 800 }}
        >
          Cancelar
        </Button>

        {mode === MODE_CHECKS && canMergeChecks ? (
          <Button
            variant="contained"
            onClick={handleMergeChecks}
            disabled={
              submitting ||
              !sourceCheckId ||
              !targetCheckId
            }
            startIcon={
              submitting ? (
                <CircularProgress size={17} color="inherit" />
              ) : (
                <MergeRoundedIcon />
              )
            }
            sx={{ minWidth: 150, borderRadius: 2, fontWeight: 800 }}
          >
            {submitting ? "Juntando…" : "Juntar cuentas"}
          </Button>
        ) : null}

        {mode === MODE_TABLES && canMergeTables ? (
          <Button
            variant="contained"
            onClick={handleMergeTables}
            disabled={
              submitting ||
              !sourceTableId ||
              !targetTableId
            }
            startIcon={
              submitting ? (
                <CircularProgress size={17} color="inherit" />
              ) : (
                <MergeRoundedIcon />
              )
            }
            sx={{ minWidth: 150, borderRadius: 2, fontWeight: 800 }}
          >
            {submitting ? "Juntando…" : "Juntar mesas"}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

function CheckSelect({
  label,
  value,
  checks,
  onChange,
  disabled,
}) {
  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>{label}</InputLabel>

      <Select
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {checks.map((check) => {
          const checkId = getCheckId(check);

          return (
            <MenuItem key={checkId} value={String(checkId)}>
              {check.name || check.code || `Cuenta #${checkId}`} ·{" "}
              {formatCurrency(check.total)}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

function TableSelect({
  label,
  value,
  tables,
  onChange,
  disabled,
}) {
  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>{label}</InputLabel>

      <Select
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {tables.map((table) => (
          <MenuItem key={table.id} value={String(table.id)}>
            {normalizeTableName(table.name, table.id)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function getSaleTables(sale) {
  const rows = Array.isArray(sale?.tables)
    ? sale.tables
    : sale?.table
    ? [sale.table]
    : [];

  const seen = new Set();

  return rows.filter((table) => {
    const id = Number(table?.id || 0);

    if (!id || seen.has(id)) return false;

    seen.add(id);
    return true;
  });
}

function getPackageKey(sale) {
  return (
    sale?.package_key ||
    `sale:${Number(sale?.sale_id || 0)}`
  );
}

function getCheckId(check) {
  return Number(check?.order_check_id || check?.id || 0);
}

function normalizeTableName(name, id) {
  const resolved = String(name || "").trim();

  if (!resolved) return `Mesa #${id}`;
  if (resolved.toLowerCase().startsWith("mesa")) return resolved;

  return `Mesa ${resolved}`;
}

function formatCurrency(value) {
  const safe = Number(value || 0);

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
}
