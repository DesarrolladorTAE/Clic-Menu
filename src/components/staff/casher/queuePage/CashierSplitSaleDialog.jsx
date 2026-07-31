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
  TextField,
  Typography,
} from "@mui/material";
import CallSplitRoundedIcon from "@mui/icons-material/CallSplitRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DriveFileMoveRoundedIcon from "@mui/icons-material/DriveFileMoveRounded";

import { fetchCashierSaleChecks } from "../../../../services/staff/casher/cashierOrderCheck.service";

const OPERATION_CREATE = "create";
const OPERATION_EQUAL = "equal";
const OPERATION_MOVE = "move";
const OPERATION_QUANTITY = "quantity";

export default function CashierSplitSaleDialog({
  open,
  sale,
  initialCheckId = null,
  refreshKey = 0,
  onClose,
  onCreateCheck,
  onSplitEqualParts,
  onMoveItem,
  onMoveQuantity,
}) {
  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  const [operation, setOperation] = useState(OPERATION_CREATE);
  const [sourceCheckId, setSourceCheckId] = useState("");
  const [targetCheckId, setTargetCheckId] = useState("");
  const [itemId, setItemId] = useState("");

  const [checkName, setCheckName] = useState("");
  const [reason, setReason] = useState("");
  const [parts, setParts] = useState("2");
  const [quantity, setQuantity] = useState("");

  const saleId = Number(sale?.sale_id || 0);

  const loadChecks = async () => {
    if (!saleId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetchCashierSaleChecks(saleId);
      setSummary(response?.data || null);
    } catch (e) {
      setSummary(null);
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "No se pudieron consultar las cuentas de la venta."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    setOperation(OPERATION_CREATE);
    setSourceCheckId("");
    setTargetCheckId("");
    setItemId("");
    setCheckName("");
    setReason("");
    setParts("2");
    setQuantity("");
    setError("");

    loadChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, saleId, refreshKey]);

  const checks = useMemo(
    () => (Array.isArray(summary?.checks) ? summary.checks : []),
    [summary]
  );

  const activeChecks = useMemo(
    () =>
      checks.filter(
        (check) =>
          !["merged", "cancelled"].includes(
            String(check?.status || "").toLowerCase()
          )
      ),
    [checks]
  );

  const editableChecks = useMemo(
    () =>
      activeChecks.filter(
        (check) => check?.flags?.editable === true
      ),
    [activeChecks]
  );

  useEffect(() => {
    if (!open || editableChecks.length === 0) return;

    const requestedId = Number(initialCheckId || 0);
    const requestedExists = editableChecks.some(
      (check) => getCheckId(check) === requestedId
    );

    setSourceCheckId((current) => {
      const currentExists = editableChecks.some(
        (check) => getCheckId(check) === Number(current || 0)
      );

      if (currentExists) return current;
      if (requestedExists) return String(requestedId);

      return String(getCheckId(editableChecks[0]));
    });
  }, [open, initialCheckId, editableChecks]);

  useEffect(() => {
    setTargetCheckId("");
    setItemId("");
    setQuantity("");
  }, [sourceCheckId]);

  const sourceCheck = useMemo(
    () =>
      editableChecks.find(
        (check) => getCheckId(check) === Number(sourceCheckId || 0)
      ) || null,
    [editableChecks, sourceCheckId]
  );

  const targetChecks = useMemo(
    () =>
      editableChecks.filter(
        (check) => getCheckId(check) !== Number(sourceCheckId || 0)
      ),
    [editableChecks, sourceCheckId]
  );

  const sourceItems = useMemo(
    () => (Array.isArray(sourceCheck?.items) ? sourceCheck.items : []),
    [sourceCheck]
  );

  const busy = loading || busyAction !== "";

  const handleCreate = async () => {
    const checkId = Number(sourceCheckId || 0);

    if (!checkId) {
      setError("Selecciona una cuenta de referencia.");
      return;
    }

    setBusyAction(OPERATION_CREATE);
    setError("");

    try {
      const result = await onCreateCheck?.({
        checkId,
        payload: {
          name: checkName.trim() || null,
          reason: reason.trim() || null,
        },
      });

      if (result?.ok) {
        setCheckName("");
        setReason("");
        await loadChecks();
      }
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "No se pudo crear la cuenta."
      );
    } finally {
      setBusyAction("");
    }
  };

  const handleEqualParts = async () => {
    const checkId = Number(sourceCheckId || 0);
    const parsedParts = Number(parts);

    if (!checkId) {
      setError("Selecciona la cuenta que deseas dividir.");
      return;
    }

    if (!Number.isInteger(parsedParts) || parsedParts < 2) {
      setError("La cantidad de partes debe ser un número entero mayor o igual a 2.");
      return;
    }

    setBusyAction(OPERATION_EQUAL);
    setError("");

    try {
      const result = await onSplitEqualParts?.({
        checkId,
        payload: { parts: parsedParts },
      });

      if (result?.ok) onClose?.();
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "No se pudo dividir la cuenta."
      );
    } finally {
      setBusyAction("");
    }
  };

  const handleMove = async (partial = false) => {
    const checkId = Number(sourceCheckId || 0);
    const targetId = Number(targetCheckId || 0);
    const selectedItemId = Number(itemId || 0);
    const parsedQuantity = Number(quantity);

    if (!checkId || !targetId || !selectedItemId) {
      setError("Selecciona la cuenta origen, el producto y la cuenta destino.");
      return;
    }

    if (partial && (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0)) {
      setError("La cantidad debe ser mayor que cero.");
      return;
    }

    const action = partial ? OPERATION_QUANTITY : OPERATION_MOVE;
    setBusyAction(action);
    setError("");

    try {
      const args = {
        checkId,
        itemId: selectedItemId,
        payload: partial
          ? {
              target_check_id: targetId,
              quantity: parsedQuantity,
            }
          : {
              target_check_id: targetId,
            },
      };

      const result = partial
        ? await onMoveQuantity?.(args)
        : await onMoveItem?.(args);

      if (result?.ok) {
        setItemId("");
        setTargetCheckId("");
        setQuantity("");
        await loadChecks();
      }
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "No se pudo mover el producto."
      );
    } finally {
      setBusyAction("");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <CallSplitRoundedIcon color="primary" />

          <Box>
            <Typography sx={{ fontSize: 21, fontWeight: 800 }}>
              Dividir venta{saleId ? ` #${saleId}` : ""}
            </Typography>

            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Distribuye las partidas sin calcular importes manualmente.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <Tabs
          value={operation}
          onChange={(_, value) => {
            setOperation(value);
            setError("");
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value={OPERATION_CREATE} label="Crear cuenta" />
          <Tab value={OPERATION_EQUAL} label="Partes iguales" />
          <Tab value={OPERATION_MOVE} label="Mover producto" />
          <Tab value={OPERATION_QUANTITY} label="Mover cantidad" />
        </Tabs>
      </Box>

      <DialogContent dividers sx={{ minHeight: 380 }}>
        {loading ? (
          <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
            <Stack alignItems="center" spacing={1}>
              <CircularProgress />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Cargando cuentas y productos…
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            {editableChecks.length === 0 ? (
              <Alert severity="warning">
                No existen cuentas editables para realizar esta operación.
              </Alert>
            ) : null}

            <CheckSelect
              label="Cuenta origen"
              value={sourceCheckId}
              checks={editableChecks}
              onChange={setSourceCheckId}
              disabled={busy}
            />

            {operation === OPERATION_CREATE ? (
              <>
                <TextField
                  label="Nombre de la nueva cuenta"
                  value={checkName}
                  onChange={(event) =>
                    setCheckName(event.target.value.slice(0, 120))
                  }
                  inputProps={{ maxLength: 120 }}
                  helperText="Opcional. Si se deja vacío, el sistema asignará un nombre."
                  disabled={busy}
                  fullWidth
                />

                <TextField
                  label="Motivo"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value.slice(0, 255))
                  }
                  inputProps={{ maxLength: 255 }}
                  helperText={`${reason.length}/255 · Opcional`}
                  multiline
                  minRows={2}
                  disabled={busy}
                  fullWidth
                />
              </>
            ) : null}

            {operation === OPERATION_EQUAL ? (
              <TextField
                label="Número de partes"
                type="number"
                value={parts}
                onChange={(event) => setParts(event.target.value)}
                inputProps={{ min: 2, step: 1 }}
                helperText="El backend distribuirá los importes y los residuos de redondeo."
                disabled={busy}
                fullWidth
              />
            ) : null}

            {[OPERATION_MOVE, OPERATION_QUANTITY].includes(operation) ? (
              <>
                <ItemSelect
                  value={itemId}
                  items={sourceItems}
                  onChange={setItemId}
                  disabled={busy || !sourceCheck}
                />

                <CheckSelect
                  label="Cuenta destino"
                  value={targetCheckId}
                  checks={targetChecks}
                  onChange={setTargetCheckId}
                  disabled={busy || !sourceCheck}
                />

                {operation === OPERATION_QUANTITY ? (
                  <TextField
                    label="Cantidad a mover"
                    type="number"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    inputProps={{ min: 0.0001, step: 0.0001 }}
                    helperText="Debe ser mayor que cero y no superar la cantidad disponible."
                    disabled={busy}
                    fullWidth
                  />
                ) : null}
              </>
            ) : null}

            {summary?.limits ? (
              <Alert severity="info">
                Cuentas activas:{" "}
                {Number(summary.limits.active_checks_count || 0)} de{" "}
                {Number(summary.limits.max_checks_per_group || 0)}. Espacios
                disponibles: {Number(summary.limits.remaining_checks || 0)}.
              </Alert>
            ) : null}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          color="inherit"
          onClick={onClose}
          disabled={busy}
          sx={{ fontWeight: 800 }}
        >
          Cerrar
        </Button>

        {operation === OPERATION_CREATE ? (
          <ActionButton
            loading={busyAction === OPERATION_CREATE}
            disabled={busy || editableChecks.length === 0}
            icon={<AddRoundedIcon />}
            label="Crear cuenta"
            onClick={handleCreate}
          />
        ) : null}

        {operation === OPERATION_EQUAL ? (
          <ActionButton
            loading={busyAction === OPERATION_EQUAL}
            disabled={busy || editableChecks.length === 0}
            icon={<CallSplitRoundedIcon />}
            label="Dividir"
            onClick={handleEqualParts}
          />
        ) : null}

        {operation === OPERATION_MOVE ? (
          <ActionButton
            loading={busyAction === OPERATION_MOVE}
            disabled={busy || targetChecks.length === 0}
            icon={<DriveFileMoveRoundedIcon />}
            label="Mover producto"
            onClick={() => handleMove(false)}
          />
        ) : null}

        {operation === OPERATION_QUANTITY ? (
          <ActionButton
            loading={busyAction === OPERATION_QUANTITY}
            disabled={busy || targetChecks.length === 0}
            icon={<DriveFileMoveRoundedIcon />}
            label="Mover cantidad"
            onClick={() => handleMove(true)}
          />
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
  disabled = false,
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

function ItemSelect({
  value,
  items,
  onChange,
  disabled = false,
}) {
  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>Producto</InputLabel>

      <Select
        label="Producto"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {items.map((item) => {
          const label = [
            item.product_name || `Producto #${item.product_id}`,
            item.variant_name,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <MenuItem key={item.id} value={String(item.id)}>
              {label} · Cantidad {formatQuantity(item.quantity)}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

function ActionButton({
  loading,
  disabled,
  icon,
  label,
  onClick,
}) {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={disabled}
      startIcon={
        loading ? <CircularProgress size={17} color="inherit" /> : icon
      }
      sx={{
        minWidth: 145,
        borderRadius: 2,
        fontWeight: 800,
      }}
    >
      {loading ? "Procesando…" : label}
    </Button>
  );
}

function getCheckId(check) {
  return Number(check?.order_check_id || check?.id || 0);
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

function formatQuantity(value) {
  const safe = Number(value || 0);

  return Number.isInteger(safe)
    ? String(safe)
    : safe.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}
