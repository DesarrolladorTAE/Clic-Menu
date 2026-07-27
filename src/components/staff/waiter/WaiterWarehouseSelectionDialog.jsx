// src/components/staff/waiter/WaiterWarehouseSelectionDialog.jsx
import React, { useMemo } from "react";
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, Typography,
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
  
  const validWarehouseIds = useMemo(() => {
    return Array.from(
      new Set(
        (
          Array.isArray(context?.valid_warehouse_ids)
            ? context.valid_warehouse_ids
            : []
        )
          .map((id) => Number(id))
          .filter((id) => id > 0),
      ),
    );
  }, [context]);

  const allowedWarehouses = useMemo(() => {

    let applicableWarehouseIds = [];

    if (validWarehouseIds.length > 0) {
      applicableWarehouseIds = validWarehouseIds;
    } else if (
      Array.isArray(context?.allowed_warehouse_ids)
    ) {
      applicableWarehouseIds =
        context.allowed_warehouse_ids
          .map((id) => Number(id))
          .filter((id) => id > 0);
    } else if (
      Array.isArray(context?.allowed_warehouses)
    ) {
      applicableWarehouseIds =
        context.allowed_warehouses
          .map((warehouse) =>
            Number(warehouse?.id || 0),
          )
          .filter((id) => id > 0);
    } else if (
      Array.isArray(context?.selectable_warehouses)
    ) {
      /*
      * Compatibilidad con respuestas anteriores.
      */
      applicableWarehouseIds =
        context.selectable_warehouses
          .map((warehouse) =>
            Number(warehouse?.id || 0),
          )
          .filter((id) => id > 0);
    }

    applicableWarehouseIds = Array.from(
      new Set(applicableWarehouseIds),
    );

    if (applicableWarehouseIds.length === 0) {
      return [];
    }

    const applicableWarehouseIdSet = new Set(
      applicableWarehouseIds,
    );

    /*
    * Se combinan las colecciones que contienen los datos
    * completos de los almacenes.
    *
    * Posteriormente se filtran usando únicamente los IDs
    * aplicables al escenario actual.
    */
    const warehouseSources = [
      ...(
        Array.isArray(context?.selectable_warehouses)
          ? context.selectable_warehouses
          : []
      ),
      ...(
        Array.isArray(context?.allowed_warehouses)
          ? context.allowed_warehouses
          : []
      ),
    ];

    const seenWarehouseIds = new Set();

    return warehouseSources.filter((warehouse) => {
      const warehouseId = Number(
        warehouse?.id || 0,
      );

      if (
        warehouseId <= 0 ||
        !applicableWarehouseIdSet.has(warehouseId) ||
        seenWarehouseIds.has(warehouseId)
      ) {
        return false;
      }

      seenWarehouseIds.add(warehouseId);

      return true;
    });
  }, [context, validWarehouseIds]);

  const copy = useMemo(
    () => getModeCopy(context?.selection_mode),
    [context?.selection_mode]
  );

  const selectedWarehouse = useMemo(() => {
    return allowedWarehouses.find(
      (warehouse) =>
        Number(warehouse?.id) ===
        Number(selectedWarehouseId || 0),
    );
  }, [allowedWarehouses, selectedWarehouseId]);

  const selectedWarehouseIsAllowed =
    Boolean(selectedWarehouse);

  const selectedIsValid =
    selectedWarehouseIsAllowed &&
    validWarehouseIds.includes(
      Number(selectedWarehouse?.id || 0),
    );

  const safeSelectedWarehouseId =
    selectedWarehouseIsAllowed
      ? Number(selectedWarehouse?.id || 0)
      : "";

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
                label={`Permitidos: ${allowedWarehouses.length}`}
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
              value={safeSelectedWarehouseId}
              label="Almacén preferido"
              onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : "")}
              disabled={loading}
            >
              {allowedWarehouses.map((warehouse) => {
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
                  El almacén <strong>{selectedWarehouse.name}</strong> está
                  permitido como almacén preferido, pero no cubre completamente
                  toda la comanda. Cocina resolverá los productos por ítem cuando
                  sea necesario.
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
          onClick={() => {
            if (!selectedWarehouseIsAllowed) return;

            onConfirm?.();
          }}
          disabled={
            loading ||
            !selectedWarehouseId ||
            !selectedWarehouseIsAllowed
          }
        >
          {loading ? "Aceptando…" : "Aceptar comanda"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}