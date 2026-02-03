import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getProductVariants,
  toggleProductVariant,
  setDefaultProductVariant,
  deleteProductVariant,
} from "../../../services/productVariants.service";

import VariantWizardModal from "../../../components/variants/VariantWizardModal";
import { normalizeErr } from "../../../utils/err";

import RepairVariantModal from "../../../components/variants/RepairVariantModal";

import VariantChannelsModal from "../../../components/variants/VariantChannelsModal";



function money(n) {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n);
  return num.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function buildAttrSummary(attributes) {
  // attributes = [{attribute_name, values:[{value_name}]}]
  if (!attributes?.length) return "—";
  const parts = attributes.map((a) => {
    const vals = (a.values || []).map((v) => v.value_name).join(", ");
    return `${a.attribute_name}: ${vals}`;
  });
  return parts.join(" | ");
}

export default function ProductVariantsPage() {
  const nav = useNavigate();
  const { restaurantId, productId } = useParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");

  const [product, setProduct] = useState(null);
  const [preconditions, setPreconditions] = useState(null);
  const [basePrice, setBasePrice] = useState(null);

  const [rows, setRows] = useState([]); // data del backend: [{variant, attributes}]
  const [wizardOpen, setWizardOpen] = useState(false);

  // placeholder: cuál variante quieres "editar" (para futuro repair)
  const [editTarget, setEditTarget] = useState(null);

  //Modal reparar (2)
  const [repairOpen, setRepairOpen] = useState(false);
  const [repairTarget, setRepairTarget] = useState(null); 

  //Modal productos variantes
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [channelsTarget, setChannelsTarget] = useState(null);



  // anti race-conditions
  const reqRef = useRef(0);

  const titleName = product?.name || `Producto ${productId}`;
  const canCreateVariants = !!preconditions?.has_any_channel_price;

  const isEmpty = !loading && rows.length === 0;

  const basePriceLabel = useMemo(() => {
    if (!basePrice) return "—";
    const min = basePrice?.min;
    const max = basePrice?.max;
    if (min == null && max == null) return "—";
    if (min === max) return money(min);
    return `${money(min)} - ${money(max)}`;
  }, [basePrice]);

  const load = async (opts = { initial: false }) => {
    const myReq = ++reqRef.current;
    setErr("");

    if (opts.initial) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await getProductVariants(restaurantId, productId);
      if (myReq !== reqRef.current) return;

      setProduct(data?.product || null);
      setPreconditions(data?.preconditions || null);
      setBasePrice(data?.base_price || null);
      setRows(data?.data || []);
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e, "No se pudieron cargar variantes"));
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load({ initial: true });
    // eslint-disable-next-line
  }, [restaurantId, productId]);

  // --------- TOGGLE (optimistic) ----------
  const onToggle = async (variantId, nextEnabled) => {
    setErr("");

    const row = rows.find((x) => x?.variant?.id === variantId);
    const v = row?.variant;

    // 🚫 si es inválida, no hacemos nada
    if (v?.is_invalid) {
      return;
    }

    // optimistic patch
    const snapshot = rows;
    setRows((prev) =>
      prev.map((r) =>
        r.variant.id === variantId
          ? { ...r, variant: { ...r.variant, is_enabled: !!nextEnabled } }
          : r,
      ),
    );

    try {
      await toggleProductVariant(restaurantId, productId, variantId, nextEnabled);
    } catch (e) {
      setRows(snapshot); // rollback
      setErr(normalizeErr(e, "No se pudo actualizar estado"));
    }
  };

  // --------- DEFAULT (optimistic) ----------
  const onDefault = async (variantId, nextDefault) => {
    setErr("");

    const row = rows.find((x) => x?.variant?.id === variantId);
    const v = row?.variant;

    // 🚫 default tampoco aplica a inválidas
    if (v?.is_invalid) {
      setErr("No puedes marcar como default una variante inválida. Corrige o elimina la variante.");
      return;
    }

    const snapshot = rows;

    // optimistic: si pongo default, quito los otros
    setRows((prev) =>
      prev.map((r) => {
        if (r.variant.id === variantId) {
          const forceEnabled = nextDefault ? true : r.variant.is_enabled;
          return {
            ...r,
            variant: {
              ...r.variant,
              is_default: !!nextDefault,
              is_enabled: forceEnabled,
            },
          };
        }
        return nextDefault
          ? { ...r, variant: { ...r.variant, is_default: false } }
          : r;
      }),
    );

    try {
      await setDefaultProductVariant(restaurantId, productId, variantId, nextDefault);
    } catch (e) {
      setRows(snapshot);
      setErr(normalizeErr(e, "No se pudo actualizar default"));
    }
  };

  // --------- DELETE (optimistic + rollback + recarga segura) ----------
  const onDelete = async (variantId, variantName) => {
    setErr("");

    const ok = confirm(
      `¿Eliminar esta variante?\n\n${variantName || "Variante"}\n\nEsto borrará también sus valores relacionados.`,
    );
    if (!ok) return;

    const snapshot = rows;

    // optimistic: quitarla de la tabla
    setRows((prev) => prev.filter((r) => r.variant.id !== variantId));

    try {
      await deleteProductVariant(restaurantId, productId, variantId);

      // recarga segura
      await load({ initial: false });
    } catch (e) {
      setRows(snapshot);
      setErr(normalizeErr(e, "No se pudo eliminar la variante"));
    }
  };

  // --------- EDIT (placeholder) ----------
  const onEdit = (variantRow) => {
    // Placeholder: por ahora solo guardas target + abres wizard
    // En el futuro este modal será "RepairVariantModal" con selección de valores.
    setEditTarget(variantRow);
    setWizardOpen(true);
  };

  if (loading) {
    return <div style={{ padding: 16 }}>Cargando variantes...</div>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Variantes — {titleName}</h2>
          <div style={{ marginTop: 6, opacity: 0.85, fontSize: 13 }}>
            Restaurante: <strong>{restaurantId}</strong> · Producto: <strong>{productId}</strong>
            {refreshing && <span style={{ marginLeft: 10, fontSize: 12, opacity: 0.75 }}>actualizando…</span>}
          </div>
          <div style={{ marginTop: 6, opacity: 0.85, fontSize: 13 }}>
            Precio base heredado: <strong>{basePriceLabel}</strong>{" "}
            <span style={{ fontSize: 12, opacity: 0.75 }}>(desde product_channel)</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => nav(`/owner/restaurants/${restaurantId}/products`)}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            ← Volver a productos
          </button>

          <button
            onClick={() => {
              setEditTarget(null);
              setWizardOpen(true);
            }}
            style={{ padding: "10px 14px", cursor: "pointer", fontWeight: 900 }}
            disabled={!canCreateVariants}
            title={!canCreateVariants ? "Configura al menos un precio por canal antes" : "Crear variantes"}
          >
            + Crear variante
          </button>
        </div>
      </div>

      {/* Error persistente */}
      {err && (
        <div style={{ marginTop: 12, background: "#ffe5e5", padding: 10, whiteSpace: "pre-line", borderRadius: 10 }}>
          <strong>Error:</strong> {err}
        </div>
      )}

      {!canCreateVariants && (
        <div style={{ marginTop: 12, background: "#fff3cd", border: "1px solid #ffeeba", padding: 10, borderRadius: 10 }}>
          Este producto no tiene ningún precio habilitado por canal. Configura <code>product_channel</code> antes de crear variantes.
        </div>
      )}

      {/* Estado vacío */}
      {isEmpty ? (
        <div style={{ marginTop: 16, border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Este producto no tiene variantes.</div>
          <div style={{ marginTop: 8, opacity: 0.85 }}>
            Las variantes permiten vender el producto con combinaciones como Tamaño o Sabor.
          </div>

          <button
            onClick={() => {
              setEditTarget(null);
              setWizardOpen(true);
            }}
            style={{ marginTop: 12, padding: "10px 14px", cursor: "pointer", fontWeight: 900 }}
            disabled={!canCreateVariants}
          >
            + Crear variante
          </button>
        </div>
      ) : (
        /* Tabla viva */
        <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: 12, borderBottom: "1px solid #eee", fontWeight: 900 }}>Variantes</div>

          <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Variante</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Atributos</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Estado</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Precio base</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => {
                  const v = r.variant;
                  const attrs = r.attributes;

                  const isInvalid = !!v.is_invalid;
                  const invalidReason = v.invalid_reason || "";

                  const canOpenChannels = !isInvalid && !!v.is_enabled;

                  return (
                    <tr key={v.id} style={isInvalid ? { background: "#fff7f7" } : undefined}>
                      {/* Variante */}
                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <div style={{ fontWeight: 900 }}>{v.name}</div>

                          {v.is_default && (
                            <span
                              style={{
                                fontSize: 12,
                                padding: "2px 8px",
                                borderRadius: 999,
                                background: "#e8f5e9",
                                border: "1px solid #c8e6c9",
                              }}
                            >
                              Default
                            </span>
                          )}

                          {isInvalid && (
                            <span
                              style={{
                                fontSize: 12,
                                padding: "2px 8px",
                                borderRadius: 999,
                                background: "#ffe5e5",
                                border: "1px solid #ffb3b3",
                                fontWeight: 900,
                              }}
                              title="Esta variante quedó inválida porque se borró un atributo/valor"
                            >
                              Inválida
                            </span>
                          )}
                        </div>

                        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>
                          ID: {v.id}
                        </div>

                        {/* Mensaje visual */}
                        {isInvalid && (
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 12,
                              color: "#8a0000",
                              background: "#ffecec",
                              border: "1px solid #ffd1d1",
                              padding: "6px 8px",
                              borderRadius: 10,
                              whiteSpace: "pre-line",
                            }}
                          >
                            ⚠️ {invalidReason || "Esta variante quedó inválida. Corrige o elimínala."}
                          </div>
                        )}
                      </td>

                      {/* Atributos */}
                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ fontSize: 13, opacity: 0.9 }}>
                          {buildAttrSummary(attrs)}
                        </div>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <input
                            type="checkbox"
                            checked={!!v.is_enabled}
                            disabled={isInvalid} // ✅ switch bloqueado
                            onChange={(e) => onToggle(v.id, e.target.checked)}
                            title={isInvalid ? "Variante inválida: corrige o elimina" : "Cambiar estado"}
                          />
                          <span style={{ fontWeight: 800, color: v.is_enabled ? "#0a7a0a" : "#a10000" }}>
                            {v.is_enabled ? "Activa" : "Inactiva"}
                          </span>
                        </label>

                        <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
                          <input
                            type="checkbox"
                            checked={!!v.is_default}
                            disabled={isInvalid} // ✅ default bloqueado si inválida
                            onChange={(e) => onDefault(v.id, e.target.checked)}
                            title={isInvalid ? "No puedes marcar default una inválida" : "Marcar default"}
                          />
                          <span style={{ fontWeight: 800 }}>Default</span>
                        </label>

                        {isInvalid && (
                          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                            No se puede activar hasta corregir.
                          </div>
                        )}
                      </td>

                      {/* Precio base */}
                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ fontWeight: 900 }}>{basePriceLabel}</div>
                        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>
                          Hereda del producto
                        </div>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          

                          <button
                            onClick={() => {
                              setChannelsTarget(v);
                              setChannelsOpen(true);
                            }}
                            disabled={!canOpenChannels}
                            title={
                              !canOpenChannels
                                ? isInvalid
                                  ? "Variante inválida: corrige o elimina"
                                  : "Variante inactiva: actívala para configurar canales"
                                : "Configurar precio por canal (override)"
                            }
                            style={{
                              padding: "8px 10px",
                              cursor: canOpenChannels ? "pointer" : "not-allowed",
                              opacity: canOpenChannels ? 1 : 0.6,
                              fontWeight: 900,
                            }}
                          >
                            💲 Canales
                          </button>


                          {/* ✅ Editar habilitado SOLO si inválida (placeholder) */}
                          <button
                            onClick={() => onEdit(r)}
                            disabled={!isInvalid}
                            title={!isInvalid ? "Editar no aplica (nombre compuesto)" : "Corregir variante (próximo paso)"}
                            style={{
                              padding: "8px 10px",
                              cursor: isInvalid ? "pointer" : "not-allowed",
                              opacity: isInvalid ? 1 : 0.5,
                            }}
                          >
                            ✏️
                          </button>

                          <button
                            onClick={() => onDelete(v.id, v.name)}
                            style={{ padding: "8px 10px", cursor: "pointer", background: "#ffe5e5" }}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: 10, fontSize: 12, opacity: 0.75 }}>
            Nota: Si una variante se vuelve inválida por borrar un atributo/valor, queda inactiva y no puede reactivarse hasta corregirla o eliminarla.
          </div>
        </div>
      )}

      {/* Wizard */}
      <VariantWizardModal
        open={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          setEditTarget(null);
        }}
        restaurantId={restaurantId}
        productId={productId}
        productName={titleName}
        disabledByPrecondition={!canCreateVariants}
        onGenerated={async () => {
          await load({ initial: false });
        }}
      />

      {/* debug opcional del target */}
      {editTarget && (
        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          Edit target (placeholder): variante #{editTarget?.variant?.id}
        </div>
      )}


      <RepairVariantModal
        open={repairOpen}
        onClose={() => {
          setRepairOpen(false);
          setRepairTarget(null);
        }}
        restaurantId={restaurantId}
        productId={productId}
        variantRow={repairTarget}
        onRepaired={async () => {
          await load({ initial: false });
        }}
      />


      <VariantChannelsModal
        open={channelsOpen}
        onClose={() => {
          setChannelsOpen(false);
          setChannelsTarget(null);
        }}
        restaurantId={restaurantId}
        productId={productId}
        variant={channelsTarget}
      />


    </div>
  );
}
