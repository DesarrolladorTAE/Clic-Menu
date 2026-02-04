// src/pages/inventory/IngredientsPage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../../services/inventory/ingredients/ingredients.service";

import { normalizeErr } from "../../utils/err";
import IngredientFormModal from "../../components/ingredients/IngredientFormModal";

function pct(v) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return `${n}%`;
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

export default function IngredientsPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");

  const [rows, setRows] = useState([]);

  // filtros
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  // modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const reqRef = useRef(0);

  const filteredCount = rows.length;

  const load = async ({ initial = false } = {}) => {
    const myReq = ++reqRef.current;
    setErr("");

    if (initial) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await getIngredients(restaurantId, { only_active: onlyActive, q });
      if (myReq !== reqRef.current) return;
      setRows(res?.data || []);
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e, "No se pudieron cargar los insumos"));
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load({ initial: true });
    // eslint-disable-next-line
  }, [restaurantId]);

  // recarga por filtros (debounce simple)
  useEffect(() => {
    const t = setTimeout(() => load({ initial: false }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [q, onlyActive]);

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
    const ok = confirm(`¿Eliminar ingrediente?\n\n${row.name}\n\nSi ya tiene presentaciones, tu backend lo bloqueará.`);
    if (!ok) return;

    const snapshot = rows;
    setRows((prev) => prev.filter((x) => x.id !== row.id));

    try {
      await deleteIngredient(restaurantId, row.id);
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
      await updateIngredient(restaurantId, row.id, { status: next });
    } catch (e) {
      setRows(snapshot);
      setErr(normalizeErr(e, "No se pudo actualizar estado"));
    }
  };

  const onPresentations = (row) => {
    nav(`/owner/restaurants/${restaurantId}/settings/ingredients/${row.id}/presentations`);
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando insumos...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Configuración → Ingredientes</h2>
          <div style={{ marginTop: 6, opacity: 0.85, fontSize: 13 }}>
            Restaurante: <strong>{restaurantId}</strong>
            {refreshing && <span style={{ marginLeft: 10, fontSize: 12, opacity: 0.75 }}>actualizando…</span>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => nav(`/owner/restaurants`)} style={{ padding: "10px 14px", cursor: "pointer" }}>
            ← Volver
          </button>

          <button onClick={onNew} style={{ padding: "10px 14px", cursor: "pointer", fontWeight: 900 }}>
            ➕ Nuevo ingrediente
          </button>
        </div>
      </div>

      {err && (
        <div style={{ marginTop: 12, background: "#ffe5e5", padding: 10, whiteSpace: "pre-line", borderRadius: 10 }}>
          <strong>Error:</strong> {err}
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
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o clave…"
          style={{ flex: 1, minWidth: 220, padding: "10px 10px", borderRadius: 10, border: "1px solid #ddd" }}
        />

        <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800 }}>
          <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
          Solo activos
        </label>

        <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.75 }}>
          Mostrando: <strong>{filteredCount}</strong>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #eee", fontWeight: 900 }}>Catálogo de ingredientes</div>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Nombre</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Unidad base</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Grupo</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Merma</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Inventariable</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Estado</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 14, opacity: 0.8 }}>
                    No hay insumos todavía. Crea el primero.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const groupLabel = r.group_name || "—";
                  const groupMissing = !r.ingredient_group_id || !r.group_name;

                  return (
                    <tr key={r.id}>
                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ fontWeight: 900 }}>{r.name}</div>
                        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>
                          {r.code ? `Clave: ${r.code}` : "Sin clave"} · ID: {r.id}
                        </div>
                      </td>

                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0", fontWeight: 800 }}>{r.unit}</td>

                      {/* ✅ Grupo actualizado */}
                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                        {groupMissing ? (
                          <span style={pill("#fff3cd", "#ffeeba")} title="No tiene grupo asignado (revisa migración/datos)">
                            ⚠️ Sin grupo
                          </span>
                        ) : (
                          <span style={pill("#eef2ff", "#c7d2fe")} title={`Grupo ID: ${r.ingredient_group_id}`}>
                            {groupLabel}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>{pct(r.waste_percentage)}</td>

                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                        {r.is_stock_item ? (
                          <span style={pill("#e8f5e9", "#c8e6c9")}>✅ Sí</span>
                        ) : (
                          <span style={pill("#fff3cd", "#ffeeba")}>— No</span>
                        )}
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
                          <button onClick={() => onEdit(r)} style={{ padding: "8px 10px", cursor: "pointer" }}>
                            ✏️
                          </button>

                          <button
                            onClick={() => onDelete(r)}
                            style={{ padding: "8px 10px", cursor: "pointer", background: "#ffe5e5" }}
                            title="Eliminar"
                          >
                            🗑️
                          </button>

                          <button onClick={() => onPresentations(r)} style={{ padding: "8px 10px", cursor: "pointer" }} title="Presentaciones (8.2)">
                            📦
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
                          >
                            {r.status === "active" ? "⏸" : "▶️"}
                          </button>
                        </div>
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
      <IngredientFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurantId}
        editRow={editRow}
        onSaved={async () => {
          setModalOpen(false);
          await load({ initial: false });
        }}
        api={{
          createIngredient,
          updateIngredient,
        }}
      />
    </div>
  );
}
