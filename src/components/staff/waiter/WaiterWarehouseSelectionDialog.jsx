// src/components/staff/waiter/WaiterWarehouseSelectionDialog.jsx
import React, { useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

function getModeCopy(selectionMode) {
  switch (String(selectionMode || "")) {
    case "single_valid_option":
      return {
        title: "Confirmar almacén",
        severity: "success",
        message:
          "Se encontró un único almacén válido para surtir completamente esta comanda. Solo confirma para continuar.",
      };

    case "multiple_valid_options":
      return {
        title: "Selecciona un almacén",
        severity: "info",
        message:
          "Hay varios almacenes válidos para esta comanda. Elige cuál se usará como almacén preferido.",
      };

    case "no_fully_valid_warehouse":
      return {
        title: "Selecciona almacén preferido",
        severity: "warning",
        message:
          "Ningún almacén puede surtir completamente toda la comanda. Debes seleccionar un almacén preferido para continuar.",
      };

    default:
      return {
        title: "Selecciona un almacén",
        severity: "info",
        message:
          "Debes seleccionar un almacén preferido antes de aceptar la comanda.",
      };
  }
}

export default function WaiterWarehouseSelectionDialog({
  open,
  loading = false,
  orderId = null,
  tableName = "",
  context = null,
  selectedWarehouseId = "",
  onChange,
  onClose,
  onConfirm,
}) {
  const selectableWarehouses = Array.isArray(context?.selectable_warehouses)
    ? context.selectable_warehouses
    : [];

  const validWarehouseIds = Array.isArray(context?.valid_warehouse_ids)
    ? context.valid_warehouse_ids.map((id) => Number(id))
    : [];

  const copy = useMemo(
    () => getModeCopy(context?.selection_mode),
    [context?.selection_mode]
  );

  const selectedWarehouse = useMemo(() => {
    return selectableWarehouses.find(
      (warehouse) => Number(warehouse?.id) === Number(selectedWarehouseId || 0)
    );
  }, [selectableWarehouses, selectedWarehouseId]);

  const selectedIsValid =
    !!selectedWarehouse &&
    validWarehouseIds.includes(Number(selectedWarehouse.id));

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack spacing={0.75}>
          <Typography sx={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>
            {copy.title}
          </Typography>

          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Mesa: <strong>{tableName || "—"}</strong> · Comanda:{" "}
            <strong>#{orderId || "—"}</strong>
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2}>
          <Alert severity={copy.severity}>{copy.message}</Alert>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "background.default",
              p: 1.5,
            }}
          >
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip
                label={`Modo: ${context?.inventory_mode || "—"}`}
                sx={{ fontWeight: 800 }}
              />
              <Chip
                label={`Seleccionables: ${selectableWarehouses.length}`}
                sx={{ fontWeight: 800 }}
              />
              <Chip
                label={`Válidos: ${validWarehouseIds.length}`}
                color={validWarehouseIds.length > 0 ? "success" : "warning"}
                sx={{ fontWeight: 800 }}
              />
            </Stack>
          </Box>

          <FormControl fullWidth>
            <InputLabel id="warehouse-select-label">
              Almacén preferido
            </InputLabel>
            <Select
              labelId="warehouse-select-label"
              value={selectedWarehouseId || ""}
              label="Almacén preferido"
              onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : "")}
              disabled={loading}
            >
              {selectableWarehouses.map((warehouse) => {
                const isValid = validWarehouseIds.includes(Number(warehouse.id));
                return (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                    {warehouse?.branch?.name ? ` · ${warehouse.branch.name}` : ""}
                    {isValid ? " · válido" : " · parcial"}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {selectedWarehouse ? (
            <Alert severity={selectedIsValid ? "success" : "warning"}>
              {selectedIsValid ? (
                <>
                  El almacén <strong>{selectedWarehouse.name}</strong> puede
                  surtir completamente esta comanda.
                </>
              ) : (
                <>
                  El almacén <strong>{selectedWarehouse.name}</strong> es
                  seleccionable, pero no cubre completamente toda la comanda.
                </>
              )}
            </Alert>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading || !selectedWarehouseId}
        >
          {loading ? "Aceptando…" : "Aceptar comanda"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}