import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

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

const ITEM_WAREHOUSE_SELECTION_FIELD =
  "selected_warehouse_id";

const PARENT_WAREHOUSE_SELECTION_FIELD =
  "selected_parent_warehouse_id";

function normalizeWarehouseId(value) {
  const id = Number(value || 0);
  return id > 0 ? id : null;
}

export default function KitchenWarehouseSelectorDialog({
  open,
  payload,
  inventoryContext = null,
  selectionField = null,
  initialSelectedWarehouseId = null,
  message = "",
  loading = false,
  onClose,
  onConfirm,
}) {
  const [selectedWarehouseId, setSelectedWarehouseId] =
    useState("");

  const validWarehouses = useMemo(() => {
    const rows = Array.isArray(
      payload?.valid_warehouses_for_item
    )
      ? payload.valid_warehouses_for_item
      : [];

    return rows.filter(
      (warehouse) =>
        normalizeWarehouseId(warehouse?.id) !== null
    );
  }, [payload]);

  const isParentSelection = useMemo(() => {
    return (
      selectionField ===
        PARENT_WAREHOUSE_SELECTION_FIELD ||
      String(inventoryContext || "") ===
        "composite_parent"
    );
  }, [inventoryContext, selectionField]);

  const isItemSelection = useMemo(() => {
    return (
      selectionField ===
        ITEM_WAREHOUSE_SELECTION_FIELD ||
      !isParentSelection
    );
  }, [isParentSelection, selectionField]);

  const dialogTitle = isParentSelection
    ? "Elegir almacén para extras del compuesto"
    : "Elegir almacén para iniciar";

  const contextDescription = isParentSelection
    ? "El almacén preferido no puede surtir los modificadores inventariables pendientes del producto compuesto. Cocina debe elegir un almacén válido para ese consumo."
    : "El almacén preferido no puede surtir este ítem completo. Cocina debe elegir uno de los almacenes válidos disponibles.";

  const emptyWarehousesMessage = isParentSelection
    ? "No hay almacenes válidos para consumir los modificadores pendientes del producto compuesto."
    : "No hay almacenes válidos para resolver este ítem.";

  useEffect(() => {
    if (!open) {
      setSelectedWarehouseId("");
      return;
    }

    const validWarehouseIds = validWarehouses
      .map((warehouse) =>
        normalizeWarehouseId(warehouse?.id)
      )
      .filter(Boolean);

    const initialId = normalizeWarehouseId(
      initialSelectedWarehouseId
    );

    if (
      initialId &&
      validWarehouseIds.includes(initialId)
    ) {
      setSelectedWarehouseId(String(initialId));
      return;
    }

    if (validWarehouseIds.length === 1) {
      setSelectedWarehouseId(
        String(validWarehouseIds[0])
      );
      return;
    }

    setSelectedWarehouseId("");
  }, [
    open,
    validWarehouses,
    initialSelectedWarehouseId,
    selectionField,
  ]);

  const selectedWarehouseIsValid = useMemo(() => {
    const selectedId = normalizeWarehouseId(
      selectedWarehouseId
    );

    if (!selectedId) {
      return false;
    }

    return validWarehouses.some(
      (warehouse) =>
        normalizeWarehouseId(warehouse?.id) ===
        selectedId
    );
  }, [selectedWarehouseId, validWarehouses]);

  const hasValidSelectionContext =
    isParentSelection || isItemSelection;

  const handleConfirm = () => {
    const selectedId = normalizeWarehouseId(
      selectedWarehouseId
    );

    if (
      !selectedId ||
      !selectedWarehouseIsValid ||
      !hasValidSelectionContext
    ) {
      return;
    }

    onConfirm?.(selectedId);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>{dialogTitle}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography
            sx={{
              fontSize: 14,
              color: "text.secondary",
            }}
          >
            {contextDescription}
          </Typography>

          {message ? (
            <Alert
              severity="warning"
              variant="outlined"
            >
              {message}
            </Alert>
          ) : null}

          {payload?.product_name ? (
            <Alert
              severity="info"
              variant="outlined"
            >
              {isParentSelection
                ? "Producto compuesto"
                : "Producto"}
              : <b> {payload.product_name}</b>
            </Alert>
          ) : null}

          {payload?.preferred_warehouse_id ? (
            <Alert
              severity="warning"
              variant="outlined"
            >
              Almacén preferido de la orden: #
              {payload.preferred_warehouse_id}
            </Alert>
          ) : null}

          <FormControl fullWidth>
            <Select
              value={
                selectedWarehouseIsValid
                  ? selectedWarehouseId
                  : ""
              }
              onChange={(event) => {
                setSelectedWarehouseId(
                  event.target.value
                );
              }}
              displayEmpty
              disabled={
                loading ||
                !validWarehouses.length
              }
            >
              <MenuItem value="">
                Selecciona un almacén
              </MenuItem>

              {validWarehouses.map(
                (warehouse) => (
                  <MenuItem
                    key={warehouse.id}
                    value={String(warehouse.id)}
                  >
                    {warehouse.name}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>

          {validWarehouses.length ? (
            <Stack spacing={1}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Opciones válidas
              </Typography>

              {validWarehouses.map(
                (warehouse) => (
                  <Alert
                    key={warehouse.id}
                    severity="success"
                    variant="outlined"
                  >
                    #{warehouse.id} ·{" "}
                    {warehouse.name}
                  </Alert>
                )
              )}
            </Stack>
          ) : (
            <Alert
              severity="error"
              variant="outlined"
            >
              {emptyWarehousesMessage}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={
            loading ||
            !selectedWarehouseIsValid ||
            !hasValidSelectionContext
          }
        >
          {loading
            ? "Iniciando…"
            : isParentSelection
            ? "Usar para extras"
            : "Usar almacén"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}