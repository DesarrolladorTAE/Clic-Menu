// src/components/variants/VariantAttributesAdminModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getVariantAttributes,
  createVariantAttribute,
  updateVariantAttribute,
  deleteVariantAttribute,
} from "../../services/products/variants/variantAttributes.service";

import {
  getVariantAttributeValues,
  createVariantAttributeValue,
  updateVariantAttributeValue,
  deleteVariantAttributeValue,
} from "../../services/products/variants/variantAttributeValues.service";

function normalizeErr(e) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors).flat().join("\n")
      : "") ||
    "Ocurrió un error"
  );
}

function pillStyle(bg, border) {
  return {
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    background: bg,
    border: `1px solid ${border}`,
    fontWeight: 800,
  };
}

function inputStyle(disabled = false) {
  return {
    padding: "10px 10px",
    borderRadius: 10,
    border: "1px solid #ddd",
    opacity: disabled ? 0.6 : 1,
    width: "100%",
  };
}

function btnStyle({ bg = "#f7f7f7", danger = false, disabled = false } = {}) {
  return {
    padding: "8px 10px",
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 10,
    border: "1px solid #eee",
    background: danger ? "#ffe5e5" : bg,
    fontWeight: 900,
    opacity: disabled ? 0.6 : 1,
  };
}

export default function VariantAttributesAdminModal({
  open,
  onClose,
  restaurantId,
  onDone,
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // attributes list
  const [attributes, setAttributes] = useState([]);

  // create/edit attribute
  const [newAttrName, setNewAttrName] = useState("");
  const [creatingAttr, setCreatingAttr] = useState(false);

  // edit state for attribute rows
  const [editingAttrId, setEditingAttrId] = useState(null);
  const [editingAttrName, setEditingAttrName] = useState("");

  // -------- Values admin selector (KEY CHANGE) ----------
  const [valuesAttrId, setValuesAttrId] = useState(""); // <select> value
  const valuesAttr = useMemo(() => {
    const id = Number(valuesAttrId);
    return attributes.find((a) => Number(a.id) === id) || null;
  }, [attributes, valuesAttrId]);

  // values panel
  const [valuesLoading, setValuesLoading] = useState(false);
  const [values, setValues] = useState([]);
  const [attrInfo, setAttrInfo] = useState(null);

  // create value
  const [newValue, setNewValue] = useState("");
  const [creatingValue, setCreatingValue] = useState(false);

  // edit value
  const [editingValueId, setEditingValueId] = useState(null);
  const [editingValueText, setEditingValueText] = useState("");
  const [editingValueOrder, setEditingValueOrder] = useState("");

  // anti race conditions
  const reqRef = useRef(0);
  const reqValuesRef = useRef(0);

  const loadAttributes = async () => {
    const myReq = ++reqRef.current;
    setLoading(true);
    setErr("");
    try {
      const res = await getVariantAttributes(restaurantId, { only_active: false });
      if (myReq !== reqRef.current) return;

      const list = res?.data || [];
      setAttributes(list);

      // si no hay atributo seleccionado para valores, auto elige el primero
      if (!valuesAttrId && list.length) {
        setValuesAttrId(String(list[0].id));
      } else if (valuesAttrId) {
        // si borraron el seleccionado, elige otro
        const exists = list.some((x) => Number(x.id) === Number(valuesAttrId));
        if (!exists && list.length) setValuesAttrId(String(list[0].id));
        if (!exists && !list.length) setValuesAttrId("");
      }
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e));
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  const loadValues = async (attributeId) => {
    if (!attributeId) {
      setValues([]);
      setAttrInfo(null);
      return;
    }
    const myReq = ++reqValuesRef.current;
    setValuesLoading(true);
    setErr("");
    try {
      const res = await getVariantAttributeValues(restaurantId, attributeId, { only_active: false });
      if (myReq !== reqValuesRef.current) return;

      setAttrInfo(res?.attribute || null);

      // aseguramos orden por sort_order (backend ya lo ordena, pero no confío en nadie)
      const list = (res?.data || []).slice().sort((a, b) => {
        const ao = Number(a.sort_order ?? 0);
        const bo = Number(b.sort_order ?? 0);
        if (ao !== bo) return ao - bo;
        return String(a.value || "").localeCompare(String(b.value || ""));
      });

      setValues(list);
    } catch (e) {
      if (myReq !== reqValuesRef.current) return;
      setErr(normalizeErr(e));
    } finally {
      if (myReq !== reqValuesRef.current) return;
      setValuesLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    setErr("");
    setNewAttrName("");
    setNewValue("");
    setEditingAttrId(null);
    setEditingValueId(null);
    setEditingValueText("");
    setEditingValueOrder("");

    loadAttributes();
    // eslint-disable-next-line
  }, [open, restaurantId]);

  // cada que cambia selector de atributo para valores, recarga valores
  useEffect(() => {
    if (!open) return;
    if (!valuesAttrId) {
      setValues([]);
      setAttrInfo(null);
      return;
    }
    loadValues(valuesAttrId);
    // eslint-disable-next-line
  }, [valuesAttrId, open]);

  const close = async () => {
    onClose?.();
    await onDone?.();
  };

  // ---------------- ATTRIBUTES CRUD ----------------
  const createAttr = async () => {
    const name = newAttrName.trim();
    if (!name) return setErr("Escribe el nombre del atributo.");
    setErr("");
    setCreatingAttr(true);
    try {
      await createVariantAttribute(restaurantId, { name, status: "active" });
      setNewAttrName("");
      await loadAttributes();
    } catch (e) {
      setErr(normalizeErr(e));
    } finally {
      setCreatingAttr(false);
    }
  };

  const startEditAttr = (row) => {
    setErr("");
    setEditingAttrId(Number(row.id));
    setEditingAttrName(String(row.name || ""));
  };

  const cancelEditAttr = () => {
    setEditingAttrId(null);
    setEditingAttrName("");
  };

  const saveEditAttr = async (attrId) => {
    const name = editingAttrName.trim();
    if (!name) return setErr("El nombre no puede ir vacío.");
    setErr("");
    try {
      await updateVariantAttribute(restaurantId, attrId, { name });
      cancelEditAttr();
      await loadAttributes();

      // si estás viendo valores de ese atributo, refresca panel derecho
      if (Number(valuesAttrId) === Number(attrId)) {
        await loadValues(attrId);
      }
    } catch (e) {
      setErr(normalizeErr(e));
    }
  };

  const toggleAttrStatus = async (row) => {
    const next = row.status === "active" ? "inactive" : "active";
    setErr("");
    try {
      await updateVariantAttribute(restaurantId, row.id, { status: next });
      await loadAttributes();
      if (Number(valuesAttrId) === Number(row.id)) {
        await loadValues(row.id);
      }
    } catch (e) {
      setErr(normalizeErr(e));
    }
  };

  const removeAttr = async (row) => {
    setErr("");
    const ok = confirm(
      `¿Eliminar atributo "${row.name}"?\n\nEsto invalidará variantes relacionadas (según tu backend).`,
    );
    if (!ok) return;

    try {
      await deleteVariantAttribute(restaurantId, row.id);
      await loadAttributes();
    } catch (e) {
      setErr(normalizeErr(e));
    }
  };

  // ---------------- VALUES CRUD + sort_order ----------------

  const getNextSortOrder = () => {
    // toma el mayor sort_order actual y suma 1
    if (!values?.length) return 1;
    const max = Math.max(...values.map((x) => Number(x.sort_order ?? 0)));
    return (Number.isFinite(max) ? max : 0) + 1;
  };

  const createValue = async () => {
    const v = newValue.trim();
    if (!valuesAttrId) return setErr("Selecciona un atributo para asignar valores.");
    if (!v) return setErr("Escribe un valor.");
    setErr("");
    setCreatingValue(true);
    try {
      await createVariantAttributeValue(restaurantId, valuesAttrId, {
        value: v,
        status: "active",
        sort_order: getNextSortOrder(),
      });
      setNewValue("");
      await loadValues(valuesAttrId);
    } catch (e) {
      setErr(normalizeErr(e));
    } finally {
      setCreatingValue(false);
    }
  };

  const startEditValue = (row) => {
    setErr("");
    setEditingValueId(Number(row.id));
    setEditingValueText(String(row.value || ""));
    setEditingValueOrder(String(row.sort_order ?? 0));
  };

  const cancelEditValue = () => {
    setEditingValueId(null);
    setEditingValueText("");
    setEditingValueOrder("");
  };

  const saveEditValue = async (valueRowId) => {
    const v = editingValueText.trim();
    const order = Number(editingValueOrder);

    if (!valuesAttrId) return setErr("Selecciona un atributo para valores.");
    if (!v) return setErr("El valor no puede ir vacío.");
    if (!Number.isFinite(order) || order < 0) return setErr("sort_order debe ser un número >= 0.");

    setErr("");
    try {
      await updateVariantAttributeValue(restaurantId, valuesAttrId, valueRowId, {
        value: v,
        sort_order: order,
      });
      cancelEditValue();
      await loadValues(valuesAttrId);
    } catch (e) {
      setErr(normalizeErr(e));
    }
  };

  const toggleValueStatus = async (row) => {
    if (!valuesAttrId) return setErr("Selecciona un atributo para valores.");
    const next = row.status === "active" ? "inactive" : "active";
    setErr("");
    try {
      await updateVariantAttributeValue(restaurantId, valuesAttrId, row.id, { status: next });
      await loadValues(valuesAttrId);
    } catch (e) {
      setErr(normalizeErr(e));
    }
  };

  const removeValue = async (row) => {
    setErr("");
    if (!valuesAttrId) return setErr("Selecciona un atributo para valores.");

    const ok = confirm(
      `¿Eliminar valor "${row.value}"?\n\nEsto invalidará variantes que lo usen (según tu backend).`,
    );
    if (!ok) return;

    try {
      await deleteVariantAttributeValue(restaurantId, valuesAttrId, row.id);
      await loadValues(valuesAttrId);
    } catch (e) {
      setErr(normalizeErr(e));
    }
  };

  // reordenamiento simple: swap con vecino actual (sin endpoints extra)
  const swapOrder = async (row, direction /* -1 up, +1 down */) => {
    if (!valuesAttrId) return;

    const list = values.slice().sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
    const idx = list.findIndex((x) => Number(x.id) === Number(row.id));
    if (idx < 0) return;

    const otherIdx = idx + direction;
    if (otherIdx < 0 || otherIdx >= list.length) return;

    const a = list[idx];
    const b = list[otherIdx];

    // optimistic: swap local
    const snapshot = values;
    const swapped = values.map((x) => {
      if (Number(x.id) === Number(a.id)) return { ...x, sort_order: Number(b.sort_order ?? 0) };
      if (Number(x.id) === Number(b.id)) return { ...x, sort_order: Number(a.sort_order ?? 0) };
      return x;
    });
    setValues(swapped);

    try {
      // persiste ambos updates
      await Promise.all([
        updateVariantAttributeValue(restaurantId, valuesAttrId, a.id, {
          sort_order: Number(b.sort_order ?? 0),
        }),
        updateVariantAttributeValue(restaurantId, valuesAttrId, b.id, {
          sort_order: Number(a.sort_order ?? 0),
        }),
      ]);

      await loadValues(valuesAttrId);
    } catch (e) {
      setValues(snapshot); // rollback
      setErr(normalizeErr(e));
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 10000,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        style={{
          width: "min(1100px, 100%)",
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #eee",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 14,
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Administrar atributos y valores</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Restaurante: <strong>{restaurantId}</strong>
            </div>
          </div>

          <button onClick={close} style={{ padding: "8px 10px", cursor: "pointer" }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 14 }}>
          {err && (
            <div
              style={{
                marginBottom: 12,
                background: "#ffe5e5",
                padding: 10,
                whiteSpace: "pre-line",
                borderRadius: 10,
              }}
            >
              <strong>Error:</strong> {err}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 14 }}>
            {/* Left: Attributes */}
            <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: 12, borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ fontWeight: 900 }}>Atributos</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                  Crea/edita/activa/desactiva. Eliminar invalida variantes relacionadas.
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <input
                    value={newAttrName}
                    onChange={(e) => setNewAttrName(e.target.value)}
                    placeholder="Ej. Tamaño"
                    style={{ ...inputStyle(false), flex: 1 }}
                  />
                  <button
                    onClick={createAttr}
                    disabled={creatingAttr}
                    style={btnStyle({ disabled: creatingAttr })}
                  >
                    + Crear
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: 460, overflow: "auto" }}>
                {loading ? (
                  <div style={{ padding: 12 }}>Cargando atributos…</div>
                ) : attributes.length === 0 ? (
                  <div style={{ padding: 12, opacity: 0.8 }}>No hay atributos. Crea el primero.</div>
                ) : (
                  <div style={{ display: "grid" }}>
                    {attributes.map((a) => {
                      const isEditing = Number(editingAttrId) === Number(a.id);

                      return (
                        <div
                          key={a.id}
                          style={{
                            padding: 10,
                            borderBottom: "1px solid #f0f0f0",
                            background: Number(valuesAttrId) === Number(a.id) ? "#f7fbff" : "#fff",
                          }}
                        >
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {isEditing ? (
                              <input
                                value={editingAttrName}
                                onChange={(e) => setEditingAttrName(e.target.value)}
                                style={{ ...inputStyle(false), flex: 1, padding: "8px 10px" }}
                              />
                            ) : (
                              <div style={{ fontWeight: 900, flex: 1 }}>{a.name}</div>
                            )}

                            <span
                              style={
                                a.status === "active"
                                  ? pillStyle("#e8f5e9", "#c8e6c9")
                                  : pillStyle("#fff3cd", "#ffeeba")
                              }
                            >
                              {a.status}
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                            <button
                              onClick={() => setValuesAttrId(String(a.id))}
                              style={btnStyle({ bg: "#eef5ff" })}
                              title="Usar este atributo para administrar sus valores"
                            >
                              🎯 Administrar valores
                            </button>

                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveEditAttr(a.id)}
                                  style={btnStyle({ bg: "#e8f5e9" })}
                                >
                                  Guardar
                                </button>
                                <button onClick={cancelEditAttr} style={btnStyle()}>
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEditAttr(a)} style={btnStyle()}>
                                  ✏️ Editar
                                </button>

                                <button
                                  onClick={() => toggleAttrStatus(a)}
                                  style={btnStyle({
                                    bg: a.status === "active" ? "#fff3cd" : "#e8f5e9",
                                  })}
                                  title="Activar/Desactivar"
                                >
                                  {a.status === "active" ? "⏸ Desactivar" : "▶️ Activar"}
                                </button>

                                <button onClick={() => removeAttr(a)} style={btnStyle({ danger: true })}>
                                  🗑 Eliminar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ padding: 12, borderTop: "1px solid #f0f0f0" }}>
                <button onClick={loadAttributes} style={{ ...btnStyle(), width: "100%" }}>
                  ↻ Recargar
                </button>
              </div>
            </div>

            {/* Right: Values */}
            <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: 12, borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontWeight: 900 }}>Valores</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    (primero selecciona el atributo)
                  </div>
                </div>

                {/* SELECTOR (KEY CHANGE) */}
                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 160px", gap: 10 }}>
                  <select
                    value={valuesAttrId}
                    onChange={(e) => setValuesAttrId(e.target.value)}
                    style={{
                      padding: "10px 10px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                      background: "#fff",
                      fontWeight: 800,
                    }}
                  >
                    <option value="">Selecciona atributo…</option>
                    {attributes.map((a) => (
                      <option key={a.id} value={String(a.id)}>
                        {a.name} ({a.status})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => loadValues(valuesAttrId)}
                    disabled={!valuesAttrId}
                    style={btnStyle({ disabled: !valuesAttrId })}
                  >
                    ↻ Recargar
                  </button>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder={valuesAttr ? `Ej. ${valuesAttr.name} → Chico` : "Selecciona un atributo"}
                    disabled={!valuesAttr}
                    style={{ ...inputStyle(!valuesAttr), flex: 1 }}
                  />
                  <button
                    onClick={createValue}
                    disabled={!valuesAttr || creatingValue}
                    style={btnStyle({ disabled: !valuesAttr || creatingValue })}
                  >
                    + Agregar
                  </button>
                </div>

                {attrInfo && attrInfo.status !== "active" && (
                  <div
                    style={{
                      marginTop: 10,
                      background: "#fff3cd",
                      border: "1px solid #ffeeba",
                      padding: 10,
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                  >
                    Este atributo está <strong>{attrInfo.status}</strong>. Puedes editar valores, pero no saldrá en el wizard si filtras “activos”.
                  </div>
                )}

                {valuesAttr && (
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                    Orden: se controla con <strong>sort_order</strong>. Nuevo valor se crea con el siguiente número disponible.
                  </div>
                )}
              </div>

              <div style={{ maxHeight: 460, overflow: "auto" }}>
                {valuesLoading ? (
                  <div style={{ padding: 12 }}>Cargando valores…</div>
                ) : !valuesAttr ? (
                  <div style={{ padding: 12, opacity: 0.8 }}>
                    Selecciona un atributo en el selector de arriba.
                  </div>
                ) : values.length === 0 ? (
                  <div style={{ padding: 12, opacity: 0.8 }}>
                    No hay valores para este atributo. Agrega el primero.
                  </div>
                ) : (
                  <div style={{ display: "grid" }}>
                    {values.map((v, idx) => {
                      const isEditing = Number(editingValueId) === Number(v.id);

                      return (
                        <div
                          key={v.id}
                          style={{
                            padding: 10,
                            borderBottom: "1px solid #f0f0f0",
                            background: "#fff",
                          }}
                        >
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            {/* sort order */}
                            <div style={{ width: 92 }}>
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editingValueOrder}
                                  onChange={(e) => setEditingValueOrder(e.target.value)}
                                  style={{ ...inputStyle(false), padding: "8px 10px" }}
                                  title="sort_order"
                                />
                              ) : (
                                <div style={{ fontSize: 12, opacity: 0.8 }}>
                                  <strong>#{Number(v.sort_order ?? 0)}</strong>
                                </div>
                              )}
                            </div>

                            {/* value */}
                            <div style={{ flex: 1 }}>
                              {isEditing ? (
                                <input
                                  value={editingValueText}
                                  onChange={(e) => setEditingValueText(e.target.value)}
                                  style={{ ...inputStyle(false), padding: "8px 10px" }}
                                />
                              ) : (
                                <div style={{ fontWeight: 900 }}>{v.value}</div>
                              )}
                            </div>

                            <span
                              style={
                                v.status === "active"
                                  ? pillStyle("#e8f5e9", "#c8e6c9")
                                  : pillStyle("#fff3cd", "#ffeeba")
                              }
                            >
                              {v.status}
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                            {/* reorder buttons */}
                            <button
                              onClick={() => swapOrder(v, -1)}
                              disabled={idx === 0}
                              style={btnStyle({ disabled: idx === 0 })}
                              title="Subir (swap con el anterior)"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => swapOrder(v, +1)}
                              disabled={idx === values.length - 1}
                              style={btnStyle({ disabled: idx === values.length - 1 })}
                              title="Bajar (swap con el siguiente)"
                            >
                              ↓
                            </button>

                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveEditValue(v.id)}
                                  style={btnStyle({ bg: "#e8f5e9" })}
                                >
                                  Guardar
                                </button>
                                <button onClick={cancelEditValue} style={btnStyle()}>
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEditValue(v)} style={btnStyle()}>
                                  ✏️ Editar
                                </button>

                                <button
                                  onClick={() => toggleValueStatus(v)}
                                  style={btnStyle({
                                    bg: v.status === "active" ? "#fff3cd" : "#e8f5e9",
                                  })}
                                  title="Activar/Desactivar"
                                >
                                  {v.status === "active" ? "⏸ Desactivar" : "▶️ Activar"}
                                </button>

                                <button onClick={() => removeValue(v)} style={btnStyle({ danger: true })}>
                                  🗑 Eliminar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: 12,
                  borderTop: "1px solid #f0f0f0",
                  display: "flex",
                  gap: 10,
                }}
              >
                <button onClick={close} style={{ ...btnStyle({ bg: "#111" }), color: "#fff", flex: 1 }}>
                  Listo
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Tip: desactivar es “menos destructivo” que eliminar. Pero como tú sí quieres borrar, tu backend ya invalida variantes afectadas, así que al menos no explota todo.
          </div>
        </div>
      </div>
    </div>
  );
}
