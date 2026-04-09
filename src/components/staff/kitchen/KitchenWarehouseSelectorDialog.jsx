import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

export default function KitchenWarehouseSelectorDialog({
  open,
  payload,
  loading = false,
  onClose,
  onConfirm,
}) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");

  const validWarehouses = useMemo(() => {
    const arr = payload?.valid_warehouses_for_item || [];
    return Array.isArray(arr) ? arr : [];
  }, [payload]);

  useEffect(() => {
    if (!open) {
      setSelectedWarehouseId("");
      return;
    }

    if (validWarehouses.length === 1) {
      setSelectedWarehouseId(String(validWarehouses[0]?.id || ""));
      return;
    }

    setSelectedWarehouseId("");
  }, [open, validWarehouses]);

  const handleConfirm = () => {
    if (!selectedWarehouseId) return;
    onConfirm?.(Number(selectedWarehouseId));
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Elegir almacén para iniciar</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            El almacén propuesto no puede surtir este ítem. Cocina debe elegir
            uno de los almacenes válidos disponibles.
          </Typography>

          {payload?.product_name ? (
            <Alert severity="info" variant="outlined">
              Producto: <b>{payload.product_name}</b>
            </Alert>
          ) : null}

          {payload?.preferred_warehouse_id ? (
            <Alert severity="warning" variant="outlined">
              Almacén propuesto por mesero: #{payload.preferred_warehouse_id}
            </Alert>
          ) : null}

          <FormControl fullWidth>
            <Select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Selecciona un almacén</MenuItem>
              {validWarehouses.map((warehouse) => (
                <MenuItem key={warehouse.id} value={String(warehouse.id)}>
                  {warehouse.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {validWarehouses.length ? (
            <Stack spacing={1}>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                Opciones válidas
              </Typography>

              {validWarehouses.map((warehouse) => (
                <Alert key={warehouse.id} severity="success" variant="outlined">
                  #{warehouse.id} · {warehouse.name}
                </Alert>
              ))}
            </Stack>
          ) : (
            <Alert severity="error" variant="outlined">
              No hay almacenes válidos para resolver este ítem.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={loading || !selectedWarehouseId}
        >
          {loading ? "Iniciando…" : "Usar almacén"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
