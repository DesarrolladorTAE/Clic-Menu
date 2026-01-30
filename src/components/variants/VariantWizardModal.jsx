// src/components/variants/VariantWizardModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { getVariantAttributes } from "../../services/variantAttributes.service";
import { getVariantAttributeValues } from "../../services/variantAttributeValues.service";
import { generateProductVariants } from "../../services/productVariantGenerator.service";
import VariantAttributesAdminModal from "./VariantAttributesAdminModal";

function normalizeErr(e) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors).flat().join("\n")
      : "") ||
    "Ocurrió un error"
  );
}

function buildSelections(selectedAttributeIds, selectedValueIds) {
  // backend espera: selections: [{ attribute_id, value_ids }]
  const selections = selectedAttributeIds
    .map((aid) => ({
      attribute_id: Number(aid),
      value_ids: (selectedValueIds[Number(aid)] || []).map(Number),
    }))
    .filter((x) => x.attribute_id > 0 && x.value_ids.length > 0);

  return selections;
}

function cartesianPreview(
  attributesInOrder,
  valuesByAttribute,
  selectedValueIds,
  maxPreview = 20,
) {
  // genera combos con nombres humanos solo para preview en UI (NO inserta)
  let combos = [[]];

  for (const attr of attributesInOrder) {
    const aid = Number(attr.id);
    const pack = valuesByAttribute[aid];
    const selected = new Set((selectedValueIds[aid] || []).map(Number));
    const values = (pack?.data || []).filter((v) => selected.has(Number(v.id)));

    const newCombos = [];
    for (const base of combos) {
      for (const v of values) {
        newCombos.push([
          ...base,
          {
            attribute_id: aid,
            attribute_name: attr.name,
            value_id: Number(v.id),
            value_name: v.value,
          },
        ]);
        if (newCombos.length >= maxPreview) break;
      }
      if (newCombos.length >= maxPreview) break;
    }
    combos = newCombos;
    if (combos.length >= maxPreview) break;
  }

  return combos;
}

export default function VariantWizardModal({
  open,
  onClose,
  restaurantId,
  productId,
  productName,
  disabledByPrecondition = false,
  onGenerated, // callback -> recargar lista afuera
}) {
  const [step, setStep] = useState(2); // 2, 3, 4
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Step 2
  const [attributes, setAttributes] = useState([]); // activos
  const [selectedAttributeIds, setSelectedAttributeIds] = useState([]); // number[]

  // Step 3
  const [valuesByAttribute, setValuesByAttribute] = useState({}); // { [aid]: {attribute, data} }
  const [selectedValueIds, setSelectedValueIds] = useState({}); // { [aid]: number[] }

  // Step 4
  const [replace, setReplace] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  // Admin modal
  const [adminOpen, setAdminOpen] = useState(false);

  const reqRef = useRef(0);

  const selectedAttributes = useMemo(() => {
    const setIds = new Set(selectedAttributeIds.map(Number));
    // respeta orden alfabético (ya viene ordenado del backend)
    return attributes.filter((a) => setIds.has(Number(a.id)));
  }, [attributes, selectedAttributeIds]);

  const canContinueStep2 = selectedAttributeIds.length >= 1;

  const canContinueStep3 = useMemo(() => {
    if (selectedAttributeIds.length < 1) return false;
    for (const aid of selectedAttributeIds) {
      const list = selectedValueIds[Number(aid)] || [];
      if (!list.length) return false;
    }
    return true;
  }, [selectedAttributeIds, selectedValueIds]);

  const selections = useMemo(() => {
    return buildSelections(selectedAttributeIds, selectedValueIds);
  }, [selectedAttributeIds, selectedValueIds]);

  const previewCombos = useMemo(() => {
    if (step !== 4) return [];
    return cartesianPreview(selectedAttributes, valuesByAttribute, selectedValueIds, 30);
  }, [step, selectedAttributes, valuesByAttribute, selectedValueIds]);

  const previewCount = useMemo(() => {
    // conteo real (sin limitar) para mostrar en Step 4
    // count = producto de cantidades por atributo
    if (!canContinueStep3) return 0;
    let count = 1;
    for (const aid of selectedAttributeIds.map(Number)) {
      const n = (selectedValueIds[aid] || []).length;
      count *= n;
    }
    return count;
  }, [canContinueStep3, selectedAttributeIds, selectedValueIds]);

  const resetAll = () => {
    setStep(2);
    setErr("");
    setLoading(false);
    setAttributes([]);
    setSelectedAttributeIds([]);
    setValuesByAttribute({});
    setSelectedValueIds({});
    setReplace(false);
    setGenerating(false);
    setResult(null);
    setAdminOpen(false);
  };

  const reloadAttributes = async () => {
    const myReq = ++reqRef.current;
    setLoading(true);
    setErr("");
    try {
      const res = await getVariantAttributes(restaurantId, { only_active: true });
      if (myReq !== reqRef.current) return;

      const list = res?.data || [];
      setAttributes(list);

      // Limpia selección si alguien desactivó/eliminó atributos desde admin
      setSelectedAttributeIds((prev) => {
        const activeIds = new Set(list.map((x) => Number(x.id)));
        return prev.map(Number).filter((id) => activeIds.has(id));
      });
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e));
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  // load attrs on open
  useEffect(() => {
    if (!open) return;
    if (disabledByPrecondition) return;
    reloadAttributes();
    // eslint-disable-next-line
  }, [open, restaurantId, disabledByPrecondition]);

  useEffect(() => {
    if (!open) resetAll();
    // eslint-disable-next-line
  }, [open]);

  const toggleAttr = (id) => {
    setErr("");
    setResult(null);
    const n = Number(id);
    setSelectedAttributeIds((prev) => {
      const s = new Set(prev.map(Number));
      if (s.has(n)) s.delete(n);
      else s.add(n);
      return Array.from(s);
    });
  };

  const goStep3 = async () => {
    if (!canContinueStep2) return setErr("Selecciona al menos 1 atributo.");

    setErr("");
    setResult(null);
    setLoading(true);

    const myReq = ++reqRef.current;

    try {
      const ids = selectedAttributeIds.map(Number);

      const responses = await Promise.all(
        ids.map((aid) => getVariantAttributeValues(restaurantId, aid, { only_active: true })),
      );

      if (myReq !== reqRef.current) return;

      const map = {};
      const sel = {};
      responses.forEach((r) => {
        const attribute = r?.attribute;
        const data = r?.data || [];
        const aid = Number(attribute?.id);

        map[aid] = { attribute, data };
        sel[aid] = [];
      });

      setValuesByAttribute(map);
      setSelectedValueIds(sel);
      setStep(3);
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e));
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  const toggleValue = (attributeId, valueId) => {
    setErr("");
    setResult(null);
    const aid = Number(attributeId);
    const vid = Number(valueId);

    setSelectedValueIds((prev) => {
      const cur = new Set((prev[aid] || []).map(Number));
      if (cur.has(vid)) cur.delete(vid);
      else cur.add(vid);
      return { ...prev, [aid]: Array.from(cur) };
    });
  };

  const backToStep2 = () => {
    setErr("");
    setResult(null);
    setStep(2);
    setValuesByAttribute({});
    setSelectedValueIds({});
  };

  const goStep4 = () => {
    if (!canContinueStep3) return setErr("Selecciona al menos 1 valor por cada atributo.");
    setErr("");
    setResult(null);
    setStep(4);
  };

  const backToStep3 = () => {
    setErr("");
    setResult(null);
    setStep(3);
  };

  const doGenerate = async () => {
    if (!canContinueStep3) return setErr("Selección inválida.");
    if (!selections.length) return setErr("Debes seleccionar al menos 1 atributo con valores.");

    setErr("");
    setResult(null);
    setGenerating(true);

    try {
      const payload = { replace: !!replace, selections };
      const res = await generateProductVariants(restaurantId, productId, payload);
      setResult(res);

      await onGenerated?.(res);
    } catch (e) {
      setErr(normalizeErr(e));
    } finally {
      setGenerating(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          zIndex: 9999,
        }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div
          style={{
            width: "min(980px, 100%)",
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
            }}
          >
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>
                Crear variantes — {productName || `Producto ${productId}`}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Paso {step} de 4</div>
            </div>

            <button onClick={onClose} style={{ padding: "8px 10px", cursor: "pointer" }}>
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: 14 }}>
            {disabledByPrecondition ? (
              <div
                style={{
                  background: "#fff3cd",
                  border: "1px solid #ffeeba",
                  padding: 12,
                  borderRadius: 10,
                }}
              >
                Primero configura al menos un precio habilitado por canal en el producto (
                <code>product_channel</code>).
              </div>
            ) : (
              <>
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

                {loading ? (
                  <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
                    Cargando...
                  </div>
                ) : step === 2 ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>Paso 2: Selecciona los atributos</div>

                      <button
                        onClick={() => setAdminOpen(true)}
                        style={{
                          marginLeft: "auto",
                          padding: "8px 10px",
                          cursor: "pointer",
                          fontWeight: 900,
                          borderRadius: 10,
                          border: "1px solid #eee",
                          background: "#f7f7f7",
                        }}
                        title="Crear/editar atributos y sus valores"
                      >
                        Administrar atributos
                      </button>
                    </div>

                    {attributes.length === 0 ? (
                      <div style={{ opacity: 0.85 }}>
                        No hay atributos activos en este restaurante.
                      </div>
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
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleAttr(a.id)}
                              />
                              <div style={{ fontWeight: 800 }}>{a.name}</div>
                              <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
                                {a.status}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : step === 3 ? (
                  <>
                    <div style={{ fontWeight: 900, marginBottom: 8 }}>
                      Paso 3: Selecciona valores por atributo
                    </div>

                    {selectedAttributes.length === 0 ? (
                      <div style={{ opacity: 0.85 }}>No hay atributos seleccionados.</div>
                    ) : (
                      <div style={{ display: "grid", gap: 14 }}>
                        {selectedAttributes.map((a) => {
                          const aid = Number(a.id);
                          const pack = valuesByAttribute[aid];
                          const values = pack?.data || [];
                          const selected = new Set((selectedValueIds[aid] || []).map(Number));

                          return (
                            <div
                              key={aid}
                              style={{
                                border: "1px solid #eee",
                                borderRadius: 12,
                                padding: 12,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ fontWeight: 900 }}>{a.name}</div>
                                <div style={{ fontSize: 12, opacity: 0.75 }}>
                                  Selecciona mínimo 1 valor
                                </div>
                                <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
                                  {(selectedValueIds[aid] || []).length} seleccionados
                                </div>
                              </div>

                              {values.length === 0 ? (
                                <div style={{ marginTop: 10, opacity: 0.85 }}>
                                  Este atributo no tiene valores activos.
                                </div>
                              ) : (
                                <div
                                  style={{
                                    marginTop: 10,
                                    display: "grid",
                                    gridTemplateColumns:
                                      "repeat(auto-fill, minmax(180px, 1fr))",
                                    gap: 10,
                                  }}
                                >
                                  {values.map((v) => {
                                    const checked = selected.has(Number(v.id));
                                    return (
                                      <label
                                        key={v.id}
                                        style={{
                                          display: "flex",
                                          gap: 10,
                                          alignItems: "center",
                                          padding: 10,
                                          border: "1px solid #f0f0f0",
                                          borderRadius: 10,
                                          cursor: "pointer",
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => toggleValue(aid, v.id)}
                                        />
                                        <div style={{ fontWeight: 800 }}>{v.value}</div>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 900, marginBottom: 8 }}>
                      Paso 4: Generación automática
                    </div>

                    <div style={{ display: "grid", gap: 10 }}>
                      <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
                        <div style={{ fontWeight: 900 }}>Resumen</div>
                        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                          Combinaciones totales: <strong>{previewCount}</strong>
                          {previewCount > 500 && (
                            <span style={{ marginLeft: 8, color: "#a10000", fontWeight: 800 }}>
                              (El backend bloqueará si &gt; 500)
                            </span>
                          )}
                        </div>

                        <label
                          style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}
                        >
                          <input
                            type="checkbox"
                            checked={replace}
                            onChange={(e) => setReplace(e.target.checked)}
                            disabled={generating}
                          />
                          <div>
                            <div style={{ fontWeight: 900 }}>Reemplazar existentes</div>
                            <div style={{ fontSize: 12, opacity: 0.75 }}>
                              Si está activo, borra variantes actuales del producto antes de generar.
                            </div>
                          </div>
                        </label>
                      </div>

                      <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
                        <div style={{ fontWeight: 900, marginBottom: 8 }}>Preview (máx 30)</div>
                        {previewCombos.length === 0 ? (
                          <div style={{ opacity: 0.85 }}>No hay combinaciones para mostrar.</div>
                        ) : (
                          <div style={{ display: "grid", gap: 8 }}>
                            {previewCombos.map((combo, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: 10,
                                  border: "1px solid #f0f0f0",
                                  borderRadius: 10,
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 8,
                                  alignItems: "center",
                                }}
                              >
                                <span style={{ fontWeight: 900 }}>Variante:</span>
                                <span style={{ fontWeight: 800 }}>
                                  {(productName || "Producto") +
                                    " " +
                                    combo.map((x) => x.value_name).join(" ")}
                                </span>

                                <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.75 }}>
                                  {combo
                                    .map((x) => `${x.attribute_name}: ${x.value_name}`)
                                    .join(" | ")}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {result && (
                        <div
                          style={{
                            padding: 12,
                            border: "1px solid #d1e7dd",
                            background: "#d1e7dd",
                            borderRadius: 12,
                          }}
                        >
                          <div style={{ fontWeight: 900 }}>Resultado</div>
                          <div style={{ marginTop: 6 }}>
                            {result?.message || "Variantes generadas"} · Creadas:{" "}
                            <strong>{result?.data?.created_count ?? "?"}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: 14,
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            <button onClick={onClose} style={{ padding: "10px 14px", cursor: "pointer" }} disabled={generating}>
              Cancelar
            </button>

            {step === 3 && (
              <button onClick={backToStep2} style={{ padding: "10px 14px", cursor: "pointer" }} disabled={generating}>
                ← Atrás
              </button>
            )}

            {step === 4 && (
              <button onClick={backToStep3} style={{ padding: "10px 14px", cursor: "pointer" }} disabled={generating}>
                ← Atrás
              </button>
            )}

            {step === 2 ? (
              <button
                onClick={goStep3}
                style={{ padding: "10px 14px", cursor: "pointer", fontWeight: 900 }}
                disabled={disabledByPrecondition || !canContinueStep2 || loading || generating}
                title={!canContinueStep2 ? "Selecciona al menos 1 atributo" : "Continuar"}
              >
                Continuar →
              </button>
            ) : step === 3 ? (
              <button
                onClick={goStep4}
                style={{ padding: "10px 14px", cursor: "pointer", fontWeight: 900 }}
                disabled={disabledByPrecondition || !canContinueStep3 || loading || generating}
                title={!canContinueStep3 ? "Selecciona mínimo 1 valor por atributo" : "Preview y generar"}
              >
                Generar variantes →
              </button>
            ) : (
              <button
                onClick={doGenerate}
                style={{ padding: "10px 14px", cursor: "pointer", fontWeight: 900 }}
                disabled={disabledByPrecondition || generating || previewCount === 0 || previewCount > 500}
                title={previewCount > 500 ? "Reduce combinaciones (max 500)" : "Crear en backend"}
              >
                {generating ? "Generando..." : "Confirmar y crear"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin modal */}
      <VariantAttributesAdminModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        restaurantId={restaurantId}
        onDone={async () => {
          // al cerrar, recargamos los atributos activos del wizard
          await reloadAttributes();
        }}
      />
    </>
  );
}
