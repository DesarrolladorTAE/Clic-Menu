import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { normalizeErr } from "../../utils/err";

import {
  getIngredientPresentations,
  createIngredientPresentation,
  updateIngredientPresentation,
  deleteIngredientPresentation,
} from "../../services/inventory/ingredients/ingredientPresentations.service";

import IngredientPresentationFormModal from "../../components/inventory/IngredientPresentationFormModal";
import SupplierWizard from "../../components/inventory/SupplierWizard";

function money(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function pill(bg, border) {
  return {
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    background: bg,
    border: `1px solid ${border}`,
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
  };
}

export default function IngredientPresentationsPage() {
  const nav = useNavigate();
  const { restaurantId, ingredientId } = useParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");

  const [ingredient, setIngredient] = useState(null);
  const [rows, setRows] = useState([]);

  const [onlyActive, setOnlyActive] = useState(false);

  // modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // supplier wizard shortcut (for “Falta elegir proveedor”)
  const [openSupplierWizard, setOpenSupplierWizard] = useState(false);

  const reqRef = useRef(0);

  const load = async ({ initial = false } = {}) => {
    const myReq = ++reqRef.current;
    setErr("");

    if (initial) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await getIngredientPresentations(restaurantId, ingredientId, { only_active: onlyActive });
      if (myReq !== reqRef.current) return;

      setIngredient(res?.ingredient || null);
      setRows(res?.data || []);
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e, "No se pudieron cargar presentaciones"));
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load({ initial: true });
    // eslint-disable-next-line
  }, [restaurantId, ingredientId]);

  useEffect(() => {
    const t = setTimeout(() => load({ initial: false }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [onlyActive]);

  const onNew = () => {
    setEditRow(null);
    setModalOpen(true);
  };

  const onEdit = (row) => {
    setEditRow(row);
    setModalOpen(true);
  };

  const onDelete = async (row) => {
    setErr("");
    const ok = confirm(
      `¿Eliminar presentación?\n\n${row.description}\n`
    );
    if (!ok) return;

    const snapshot = rows;
    setRows((prev) => prev.filter((x) => x.id !== row.id));

    try {
      const res = await deleteIngredientPresentation(restaurantId, ingredientId, row.id);
      // Si fue inactivada, recargamos para verla en tabla si onlyActive=false
      if (res?.mode === "inactivated") {
        await load({ initial: false });
      }
    } catch (e) {
      setRows(snapshot);
      setErr(normalizeErr(e, "No se pudo eliminar"));
    }
  };

  const onToggleStatus = async (row) => {
    setErr("");
    const next = row.status === "active" ? "inactive" : "active";

    const snapshot = rows;
    setRows((prev) => prev.map((x) => (x.id === row.id ? { ...x, status: next } : x)));

    try {
      await updateIngredientPresentation(restaurantId, ingredientId, row.id, { status: next });
    } catch (e) {
      setRows(snapshot);
      setErr(normalizeErr(e, "No se pudo actualizar estado"));
    }
  };

  const hasOrphans = useMemo(() => rows.some((r) => Number(r.needs_supplier) === 1), [rows]);

  if (loading) return <div style={{ padding: 16 }}>Cargando presentaciones…</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>
            Configuración → Insumos → <span style={{ opacity: 0.9 }}>{ingredient?.name || `Ingrediente ${ingredientId}`}</span>
          </h2>
          <div style={{ marginTop: 6, opacity: 0.85, fontSize: 13 }}>
            Restaurante: <strong>{restaurantId}</strong> · Base: <strong>{ingredient?.unit || "—"}</strong>
            {refreshing && <span style={{ marginLeft: 10, fontSize: 12, opacity: 0.75 }}>actualizando…</span>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={() => nav(-1)} style={{ padding: "10px 14px", cursor: "pointer" }}>
            ← Volver
          </button>

          <button onClick={onNew} style={{ padding: "10px 14px", cursor: "pointer", fontWeight: 900 }}>
            ➕ Nueva presentación
          </button>
        </div>
      </div>

      {err && (
        <div style={{ marginTop: 12, background: "#ffe5e5", padding: 10, whiteSpace: "pre-line", borderRadius: 10 }}>
          <strong>Error:</strong> {err}
        </div>
      )}

      {hasOrphans && (
        <div style={{ marginTop: 12, background: "#fff3cd", padding: 10, borderRadius: 10, border: "1px solid #ffeeba" }}>
          <strong>Atención:</strong> Hay presentaciones sin proveedor .
        </div>
      )}

      {/* Filtros */}
      <div
        style={{
          marginTop: 14,
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 12,
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800 }}>
          <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
          Solo activos
        </label>

        <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.75 }}>
          Mostrando: <strong>{rows.length}</strong>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #eee", fontWeight: 900 }}>
          Presentaciones
        </div>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Presentación</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Proveedor</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Costo compra</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Rinde</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Unidad</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Estado</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 14, opacity: 0.8 }}>
                    No hay presentaciones todavía. Crea la primera.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const isOrphan = Number(r.needs_supplier) === 1;
                  return (
                    <tr key={r.id} style={{ background: isOrphan ? "#fff9e6" : "#fff" }}>
                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ fontWeight: 900 }}>{r.description}</div>
                        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>
                          {r.code ? `Clave: ${r.code}` : "Sin clave"} · ID: {r.id}
                        </div>
                      </td>

                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ fontWeight: 800 }}>
                          {r.supplier_name || "—"}
                          {isOrphan && (
                            <span style={{ marginLeft: 8, ...pill("#fff3cd", "#ffeeba") }}>⚠️ Falta</span>
                          )}
                        </div>
                        {isOrphan && (
                          <div style={{ marginTop: 6 }}>
                            <button
                              onClick={() => onEdit(r)}
                              style={{ padding: "6px 10px", cursor: "pointer", fontWeight: 900 }}
                              title="Editar para elegir proveedor"
                            >
                              Elegir proveedor
                            </button>
                          </div>
                        )}
                      </td>

                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0", fontWeight: 900 }}>
                        {money(r.purchase_cost)}
                      </td>

                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0", fontWeight: 800 }}>
                        {r.yield_qty}
                      </td>

                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0", fontWeight: 800 }}>
                        {r.yield_unit}
                      </td>

                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                        {r.status === "active" ? (
                          <span style={pill("#e8f5e9", "#c8e6c9")}>Activo</span>
                        ) : (
                          <span style={pill("#ffe5e5", "#ffb3b3")}>Inactivo</span>
                        )}
                      </td>

                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button onClick={() => onEdit(r)} style={{ padding: "8px 10px", cursor: "pointer" }} title="Editar">
                            ✏️
                          </button>

                          <button
                            onClick={() => onDelete(r)}
                            style={{ padding: "8px 10px", cursor: "pointer", background: "#ffe5e5" }}
                            title="Eliminar"
                          >
                            🗑️
                          </button>

                          <button
                            onClick={() => onToggleStatus(r)}
                            style={{
                              padding: "8px 10px",
                              cursor: "pointer",
                              background: r.status === "active" ? "#fff3cd" : "#e8f5e9",
                              fontWeight: 900,
                            }}
                            title="Activar / Desactivar"
                            disabled={isOrphan} // huérfana no debería activarse sin proveedor
                          >
                            {r.status === "active" ? "⏸" : "▶️"}
                          </button>
                        </div>
                        {isOrphan && (
                          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                            No puedes activarla hasta asignar proveedor.
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: 10, borderTop: "1px solid #eee", display: "flex", gap: 10 }}>
          <button
            onClick={() => load({ initial: false })}
            style={{
              padding: "10px 12px",
              cursor: "pointer",
              borderRadius: 10,
              border: "1px solid #eee",
              background: "#f7f7f7",
              fontWeight: 900,
              flex: 1,
            }}
          >
            ↻ Recargar
          </button>
        </div>
      </div>

      {/* Modal CRUD */}
      <IngredientPresentationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurantId}
        ingredient={ingredient || { id: Number(ingredientId), name: `Ingrediente ${ingredientId}`, unit: "g" }}
        editRow={editRow}
        onSaved={async () => {
          setModalOpen(false);
          await load({ initial: false });
        }}
        api={{
          createPresentation: createIngredientPresentation,
          updatePresentation: updateIngredientPresentation,
        }}
      />

      <SupplierWizard
        open={openSupplierWizard}
        restaurantId={restaurantId}
        onClose={() => setOpenSupplierWizard(false)}
        onChanged={async () => {
          await load({ initial: false });
        }}
      />
    </div>
  );
}
