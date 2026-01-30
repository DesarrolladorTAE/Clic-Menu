import { useEffect, useMemo, useRef, useState } from "react";
import { getVariantAttributes } from "../../services/variantAttributes.service";
import { getVariantAttributeValues } from "../../services/variantAttributeValues.service";
import { repairProductVariant } from "../../services/productVariants.service";

function normalizeErr(e) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join("\n") : "") ||
    "Ocurrió un error"
  );
}

// convierte row.attributes -> selections iniciales
function extractSelectionsFromRow(row) {
  // row.attributes = [{attribute_id, attribute_name, values:[{value_id, value_name}]}]
  const selections = [];
  for (const a of row?.attributes || []) {
    const aid = Number(a.attribute_id);
    const firstVal = a?.values?.[0]; // en tu data actual, cada atributo trae 1 value en variante
    const vid = Number(firstVal?.value_id);
    if (aid > 0 && vid > 0) selections.push({ attribute_id: aid, value_id: vid });
  }
  return selections;
}

export default function RepairVariantModal({
  open,
  onClose,
  restaurantId,
  productId,
  variantRow, // {variant, attributes}
  onRepaired, // callback para recargar
}) {
  const variant = variantRow?.variant;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [attributes, setAttributes] = useState([]); // activos
  const [selectedAttributeIds, setSelectedAttributeIds] = useState([]); // number[]
  const [valuesByAttribute, setValuesByAttribute] = useState({}); // { [aid]: {attribute, data} }
  const [selectedValueId, setSelectedValueId] = useState({}); // { [aid]: valueId }

  const [saving, setSaving] = useState(false);
  const [activateAfter, setActivateAfter] = useState(true);

  const reqRef = useRef(0);

  // inicializar desde la variante
  useEffect(() => {
    if (!open) return;
    setErr("");

    const initial = extractSelectionsFromRow(variantRow);
    const attrIds = initial.map((x) => Number(x.attribute_id));

    setSelectedAttributeIds(attrIds);

    const map = {};
    initial.forEach((x) => {
      map[Number(x.attribute_id)] = Number(x.value_id);
    });
    setSelectedValueId(map);
  }, [open, variantRow]);

  // cargar atributos activos
  useEffect(() => {
    if (!open) return;

    const myReq = ++reqRef.current;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const res = await getVariantAttributes(restaurantId, { only_active: true });
        if (myReq !== reqRef.current) return;
        setAttributes(res?.data || []);
      } catch (e) {
        if (myReq !== reqRef.current) return;
        setErr(normalizeErr(e));
      } finally {
        if (myReq !== reqRef.current) return;
        setLoading(false);
      }
    })();
  }, [open, restaurantId]);

  // cargar valores para atributos seleccionados
  useEffect(() => {
    if (!open) return;
    if (!selectedAttributeIds.length) return;

    const myReq = ++reqRef.current;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const ids = selectedAttributeIds.map(Number);
        const responses = await Promise.all(
          ids.map((aid) => getVariantAttributeValues(restaurantId, aid, { only_active: true })),
        );
        if (myReq !== reqRef.current) return;

        const map = {};
        responses.forEach((r) => {
          const attribute = r?.attribute;
          const data = r?.data || [];
          const aid = Number(attribute?.id);
          map[aid] = { attribute, data };
        });

        setValuesByAttribute(map);

        // si algún atributo no tiene selectedValueId, setear el primero disponible
        setSelectedValueId((prev) => {
          const next = { ...prev };
          for (const aid of ids) {
            if (!next[aid]) {
              const first = map[aid]?.data?.[0];
              if (first?.id) next[aid] = Number(first.id);
            }
          }
          return next;
        });
      } catch (e) {
        if (myReq !== reqRef.current) return;
        setErr(normalizeErr(e));
      } finally {
        if (myReq !== reqRef.current) return;
        setLoading(false);
      }
    })();
  }, [open, restaurantId, selectedAttributeIds]);

  const selectedAttributes = useMemo(() => {
    const setIds = new Set(selectedAttributeIds.map(Number));
    return attributes.filter((a) => setIds.has(Number(a.id)));
  }, [attributes, selectedAttributeIds]);

  const selectionsPayload = useMemo(() => {
    // backend espera: [{attribute_id, value_id}]
    const out = [];
    for (const aid of selectedAttributeIds.map(Number)) {
      const vid = Number(selectedValueId[aid] || 0);
      if (aid > 0 && vid > 0) out.push({ attribute_id: aid, value_id: vid });
    }
    return out;
  }, [selectedAttributeIds, selectedValueId]);

  const canSave = useMemo(() => {
    if (!variant?.id) return false;
    if (!selectedAttributeIds.length) return false;
    for (const aid of selectedAttributeIds.map(Number)) {
      if (!selectedValueId[aid]) return false;
    }
    return true;
  }, [variant?.id, selectedAttributeIds, selectedValueId]);

  const toggleAttr = (id) => {
    const n = Number(id);
    setSelectedAttributeIds((prev) => {
      const s = new Set(prev.map(Number));
      if (s.has(n)) s.delete(n);
      else s.add(n);
      return Array.from(s);
    });

    // si quitas atributo, también quita value seleccionado
    setSelectedValueId((prev) => {
      const next = { ...prev };
      delete next[n];
      return next;
    });
  };

  const changeValue = (attributeId, valueId) => {
    const aid = Number(attributeId);
    const vid = Number(valueId);
    setSelectedValueId((prev) => ({ ...prev, [aid]: vid }));
  };

  const doSave = async () => {
    if (!canSave) return;

    setSaving(true);
    setErr("");

    try {
      const payload = {
        selections: selectionsPayload,
        activate: !!activateAfter,
      };
      const res = await repairProductVariant(restaurantId, productId, variant.id, payload);
      await onRepaired?.(res);
      onClose?.();
    } catch (e) {
      setErr(normalizeErr(e));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 10000,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div style={{ width: "min(900px, 100%)", background: "#fff", borderRadius: 14, border: "1px solid #eee", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: 14, borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              Corregir variante {variant?.id ? `#${variant.id}` : ""}
            </div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              {variant?.name || "Variante"} {variant?.is_invalid ? "· (Inválida)" : ""}
            </div>
          </div>

          <button onClick={onClose} style={{ padding: "8px 10px", cursor: "pointer" }} disabled={saving}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 14 }}>
          {variant?.is_invalid && (
            <div style={{ marginBottom: 12, background: "#ffecec", border: "1px solid #ffd1d1", padding: 10, borderRadius: 12, whiteSpace: "pre-line" }}>
              <strong>⚠️ Motivo:</strong> {variant?.invalid_reason || "Variante inválida. Corrige o elimina."}
            </div>
          )}

          {err && (
            <div style={{ marginBottom: 12, background: "#ffe5e5", padding: 10, whiteSpace: "pre-line", borderRadius: 10 }}>
              <strong>Error:</strong> {err}
            </div>
          )}

          {loading ? (
            <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>Cargando...</div>
          ) : (
            <>
              {/* Selección de atributos */}
              <div style={{ fontWeight: 900, marginBottom: 8 }}>1) Elige atributos</div>
              {attributes.length === 0 ? (
                <div style={{ opacity: 0.85 }}>No hay atributos activos.</div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {attributes.map((a) => {
                    const checked = selectedAttributeIds.map(Number).includes(Number(a.id));
                    return (
                      <label
                        key={a.id}
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                          padding: 10,
                          border: "1px solid #eee",
                          borderRadius: 10,
                          cursor: "pointer",
                        }}
                      >
                        <input type="checkbox" checked={checked} onChange={() => toggleAttr(a.id)} />
                        <div style={{ fontWeight: 800 }}>{a.name}</div>
                        <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>{a.status}</div>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Selección de valores por atributo */}
              <div style={{ fontWeight: 900, marginTop: 16, marginBottom: 8 }}>2) Elige valor por atributo</div>

              {selectedAttributes.length === 0 ? (
                <div style={{ opacity: 0.85 }}>Selecciona al menos 1 atributo.</div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {selectedAttributes.map((a) => {
                    const aid = Number(a.id);
                    const pack = valuesByAttribute[aid];
                    const values = pack?.data || [];
                    const current = Number(selectedValueId[aid] || 0);

                    return (
                      <div key={aid} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ fontWeight: 900 }}>{a.name}</div>
                          <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
                            Selección actual: {current ? `#${current}` : "—"}
                          </div>
                        </div>

                        {values.length === 0 ? (
                          <div style={{ marginTop: 10, opacity: 0.85 }}>
                            Este atributo no tiene valores activos.
                          </div>
                        ) : (
                          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                            {values.map((v) => {
                              const isOn = Number(v.id) === current;
                              return (
                                <button
                                  key={v.id}
                                  onClick={() => changeValue(aid, v.id)}
                                  style={{
                                    padding: 10,
                                    borderRadius: 10,
                                    border: isOn ? "2px solid #111" : "1px solid #f0f0f0",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    background: isOn ? "#f6f6f6" : "#fff",
                                    fontWeight: 800,
                                  }}
                                >
                                  {v.value}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Activar al reparar */}
              <label style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
                <input type="checkbox" checked={activateAfter} onChange={(e) => setActivateAfter(e.target.checked)} />
                <div>
                  <div style={{ fontWeight: 900 }}>Activar variante al corregir</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    Si lo desactivas, se corrige pero queda inactiva hasta que la actives manualmente.
                  </div>
                </div>
              </label>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: 14, borderTop: "1px solid #f0f0f0", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 14px", cursor: "pointer" }} disabled={saving}>
            Cancelar
          </button>

          <button
            onClick={doSave}
            style={{ padding: "10px 14px", cursor: canSave ? "pointer" : "not-allowed", fontWeight: 900, opacity: canSave ? 1 : 0.55 }}
            disabled={!canSave || saving}
            title={!canSave ? "Selecciona al menos 1 atributo con valor" : "Guardar corrección"}
          >
            {saving ? "Guardando..." : "Guardar corrección"}
          </button>
        </div>
      </div>
    </div>
  );
}
