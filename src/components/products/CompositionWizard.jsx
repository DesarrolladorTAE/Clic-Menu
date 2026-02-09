// src/pages/owner/products/components/CompositionWizard.jsx
import React, { useMemo, useState } from "react";
import CandidatePicker from "./CandidatePicker";

export default function CompositionWizard({
  open,
  onClose,
  restaurantId,
  productId,
  productsMode,
  branchId,
  initialItems = [],
  onSave,
}) {
  const [rows, setRows] = useState(() => {
    // normalizar sort_order
    return (initialItems || []).map((x, idx) => ({
      ...x,
      qty: Number(x.qty || 1),
      sort_order: Number(x.sort_order ?? idx),
    }));
  });

  const [localErr, setLocalErr] = useState("");

  const canPickCandidates = useMemo(() => {
    // Candidates endpoint requiere branch_id en global y branch
    return !!branchId;
  }, [branchId]);

  const onAddCandidate = (c) => {
    setLocalErr("");

    if (!c?.id) return;

    if (rows.some((r) => Number(r.component_product_id) === Number(c.id))) {
      setLocalErr("Ese componente ya está agregado.");
      return;
    }

    setRows((prev) => [
      ...prev,
      {
        component_product_id: Number(c.id),
        name: c.name,
        qty: 1,
        allow_variant: !!c.has_variants, // default útil
        apply_variant_price: false,
        is_optional: false,
        sort_order: prev.length,
        notes: "",
      },
    ]);
  };

  const onRemove = (id) => {
    setRows((prev) => prev.filter((x) => Number(x.component_product_id) !== Number(id)));
  };

  const updateRow = (id, patch) => {
    setRows((prev) =>
      prev.map((x) => (Number(x.component_product_id) === Number(id) ? { ...x, ...patch } : x))
    );
  };

  const submit = async () => {
    setLocalErr("");

    if (!rows.length) {
      setLocalErr("Agrega al menos 1 componente.");
      return;
    }

    // Validación básica
    for (const r of rows) {
      if (!r.component_product_id) return setLocalErr("Hay un componente inválido.");
      if (!r.qty || Number(r.qty) <= 0) return setLocalErr("Cantidad inválida (debe ser > 0).");
    }

    await onSave(rows);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 50,
      }}
      onMouseDown={(e) => {
        // click afuera cierra
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={{ width: "min(980px, 100%)", background: "#fff", borderRadius: 14, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Editar composición</div>
            <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
              Modo: <strong>{productsMode}</strong> · branch_id: <strong>{branchId ?? "—"}</strong>
            </div>
          </div>

          <button onClick={onClose} style={{ padding: "8px 10px", cursor: "pointer" }}>
            Cerrar ✕
          </button>
        </div>

        {localErr && (
          <div style={{ marginTop: 10, background: "#ffe5e5", padding: 10, whiteSpace: "pre-line" }}>
            {localErr}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Agregar componente</div>

          {!canPickCandidates ? (
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Selecciona una sucursal para poder listar productos vendibles.
            </div>
          ) : (
            <CandidatePicker
              restaurantId={restaurantId}
              productId={productId}
              branchId={branchId}
              excludeIds={rows.map((x) => x.component_product_id)}
              onPick={onAddCandidate}
            />
          )}
        </div>

        <div style={{ marginTop: 14, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Componente</th>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Cantidad</th>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Permite variantes</th>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Precio extra</th>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Opcional</th>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.component_product_id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                    <div style={{ fontWeight: 800 }}>{r.name || `Producto ${r.component_product_id}`}</div>
                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                      {r.allow_variant
                        ? "✅ El comensal puede elegir variante en venta"
                        : "❌ Se usa producto base"}
                    </div>
                  </td>

                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                    <input
                      type="number"
                      min={1}
                      value={r.qty}
                      onChange={(e) => updateRow(r.component_product_id, { qty: Number(e.target.value) })}
                      style={{ width: 90, padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
                    />
                  </td>

                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={!!r.allow_variant}
                        onChange={(e) => updateRow(r.component_product_id, { allow_variant: e.target.checked })}
                      />
                      Sí
                    </label>
                  </td>

                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={!!r.apply_variant_price}
                        onChange={(e) => updateRow(r.component_product_id, { apply_variant_price: e.target.checked })}
                        disabled={!r.allow_variant}
                        title={!r.allow_variant ? "Activa 'Permite variantes' para usar precio de variante." : ""}
                      />
                      Sí
                    </label>
                  </td>

                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={!!r.is_optional}
                        onChange={(e) => updateRow(r.component_product_id, { is_optional: e.target.checked })}
                      />
                      Sí
                    </label>
                  </td>

                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                    <button
                      onClick={() => onRemove(r.component_product_id)}
                      style={{
                        padding: "8px 10px",
                        cursor: "pointer",
                        background: "#ffe5e5",
                        border: "1px solid #ffbcbc",
                        borderRadius: 8,
                      }}
                      title="Eliminar componente"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 12, opacity: 0.75 }}>
                    No hay componentes en el wizard.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "10px 12px", cursor: "pointer" }}>
            Cancelar
          </button>
          <button
            onClick={submit}
            style={{ padding: "10px 12px", cursor: "pointer", fontWeight: 900 }}
            title="Guardar composición"
          >
            💾 Guardar composición
          </button>
        </div>
      </div>
    </div>
  );
}
