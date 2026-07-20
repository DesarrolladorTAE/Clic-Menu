import React, { useEffect, useMemo, useState } from "react";
import {
  getInitialWarehouseSelectionId,
} from "../../../hooks/public/publicMenu.utils";
import { Badge, Modal, PillButton } from "../../../pages/public/publicMenu.ui";

function translateSelectionMode(mode) {
  const v = String(mode || "").toLowerCase();

  const map = {
    single_valid_option: "Un almacén válido",
    multiple_valid_options: "Varios almacenes válidos",
    no_fully_valid_warehouse: "Sin almacén totalmente válido",
  };

  return map[v] || "Selección manual";
}

export default function WaiterWarehouseCreateDialog({
  open,
  loading = false,
  customerName = "",
  selection = null,
  onClose,
  onConfirm,
}) {
  const [warehouseId, setWarehouseId] = useState("");

  const allowedWarehouses = useMemo(() => {
    if (Array.isArray(selection?.allowed_warehouses)) {
      return selection.allowed_warehouses;
    }

    const allowedIds = Array.isArray(
      selection?.allowed_warehouse_ids,
    )
      ? selection.allowed_warehouse_ids
          .map((id) => Number(id))
          .filter((id) => id > 0)
      : [];

    if (allowedIds.length === 0) {
      return [];
    }

    const allowedIdSet = new Set(allowedIds);

    const selectable = Array.isArray(
      selection?.selectable_warehouses,
    )
      ? selection.selectable_warehouses
      : [];

    return selectable.filter((warehouse) =>
      allowedIdSet.has(Number(warehouse?.id || 0)),
    );
  }, [selection]);

  const validWarehouseIds = useMemo(() => {
    return Array.isArray(selection?.valid_warehouse_ids)
      ? selection.valid_warehouse_ids.map((id) => Number(id))
      : [];
  }, [selection]);

  const allowedWarehouseIds = useMemo(() => {
    return allowedWarehouses
      .map((warehouse) => Number(warehouse?.id || 0))
      .filter((id) => id > 0);
  }, [allowedWarehouses]);

  const selectedWarehouseIsAllowed =
    allowedWarehouseIds.includes(
      Number(warehouseId || 0),
    );

  useEffect(() => {
    if (!open) {
      setWarehouseId("");
      return;
    }

    const initialWarehouseId =
      getInitialWarehouseSelectionId(selection);

    const initialId = Number(
      initialWarehouseId || 0,
    );

    if (
      initialId > 0 &&
      allowedWarehouseIds.includes(initialId)
    ) {
      setWarehouseId(String(initialId));
      return;
    }

    if (allowedWarehouses.length === 1) {
      setWarehouseId(
        String(allowedWarehouses[0]?.id || ""),
      );
      return;
    }

    setWarehouseId("");
  }, [
    open,
    selection,
    allowedWarehouses,
    allowedWarehouseIds,
  ]);

  const selectionMode = String(selection?.selection_mode || "").toLowerCase();
  const requiresAttention = selectionMode === "no_fully_valid_warehouse";

  return (
    <Modal
      open={open}
      title="Seleccionar almacén"
      onClose={() => {
        if (!loading) onClose?.();
      }}
      actions={
        <>
          <PillButton
            tone="default"
            disabled={loading}
            onClick={onClose}
            title="Cancelar"
          >
            Cancelar
          </PillButton>

          <PillButton
            tone="orange"
            disabled={
              loading ||
              !warehouseId ||
              !selectedWarehouseIsAllowed
            }
            onClick={() => {
              if (!selectedWarehouseIsAllowed) return;

              onConfirm?.(Number(warehouseId));
            }}
            title="Confirmar almacén"
          >
            {loading ? "⏳ Creando..." : "✅ Confirmar almacén"}
          </PillButton>
        </>
      }
    >
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ fontSize: 13, opacity: 0.82 }}>
          Cliente: <strong>{customerName || "Sin nombre"}</strong>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge tone={requiresAttention ? "warn" : "default"}>
            {translateSelectionMode(selectionMode)}
          </Badge>

          {selection?.inventory_mode ? (
            <Badge tone="default">
              Inventario: <strong style={{ marginLeft: 6 }}>{selection.inventory_mode}</strong>
            </Badge>
          ) : null}
        </div>

        {requiresAttention ? (
          <div
            style={{
              border: "1px solid rgba(245, 158, 11, 0.26)",
              background: "#fff7ed",
              color: "#B45309",
              borderRadius: 14,
              padding: 10,
              fontSize: 13,
              fontWeight: 800,
              whiteSpace: "pre-line",
            }}
          >
            Ningún almacén puede surtir completa la comanda en este momento.
            Aun así debes elegir un almacén preferido para que cocina pueda
            resolver por ítem si es necesario.
          </div>
        ) : (
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.10)",
              background: "#fff",
              borderRadius: 14,
              padding: 10,
              fontSize: 13,
              opacity: 0.84,
            }}
          >
            Selecciona el almacén preferido con el que quedará ligada la comanda.
          </div>
        )}

        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 900, fontSize: 13 }}>Almacén preferido</div>

          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              outline: "none",
              fontWeight: 800,
              background: "#fff",
            }}
          >
            <option value="">Selecciona un almacén</option>
            {allowedWarehouses.map((warehouse) => {
              const isValid = validWarehouseIds.includes(Number(warehouse?.id));
              return (
                <option key={warehouse?.id} value={String(warehouse?.id)}>
                  {warehouse?.name}
                  {isValid ? " · válido" : " · preferido"}
                </option>
              );
            })}
          </select>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {allowedWarehouses.map((warehouse) => {
            const isValid = validWarehouseIds.includes(Number(warehouse?.id));

            return (
              <div
                key={warehouse?.id}
                style={{
                  border: "1px solid rgba(0,0,0,0.10)",
                  background: isValid ? "#f0fdf4" : "#fff",
                  borderRadius: 14,
                  padding: 10,
                  display: "grid",
                  gap: 6,
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 13 }}>
                  {warehouse?.name}
                </div>

                <div style={{ fontSize: 12, opacity: 0.82 }}>
                  Código: <strong>{warehouse?.code || "—"}</strong>
                  {warehouse?.scope ? ` · Scope: ${warehouse.scope}` : ""}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge tone={isValid ? "ok" : "warn"}>
                    {isValid ? "Surtido completo" : "Cocina resolverá por ítem"}
                  </Badge>

                  {warehouse?.is_default ? (
                    <Badge tone="default">Default</Badge>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
