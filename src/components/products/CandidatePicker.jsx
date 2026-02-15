// src/pages/owner/products/components/CandidatePicker.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getComponentCandidates } from "../../services/products/catalog/productComponents.service";

function apiErrorToMessage(e, fallback) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join("\n") : "") ||
    fallback
  );
}

export default function CandidatePicker({
  restaurantId,
  productId,
  branchId,
  excludeIds = [],
  onPick,
}) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState([]);

  const params = useMemo(() => {
    return {
      branch_id: branchId,
      q: q.trim() || undefined,
      exclude_ids: excludeIds?.length ? excludeIds : undefined,
    };
  }, [branchId, q, excludeIds]);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await getComponentCandidates(restaurantId, productId, params);
      setData(res?.data || []);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo cargar candidatos"));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!branchId) return;
    load();
    // eslint-disable-next-line
  }, [branchId]);

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar producto vendible..."
          style={{ flex: 1, minWidth: 240, padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button
          onClick={load}
          style={{ padding: "10px 12px", cursor: "pointer" }}
          disabled={loading}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {err && (
        <div style={{ marginTop: 10, background: "#ffe5e5", padding: 10, whiteSpace: "pre-line" }}>
          {err}
        </div>
      )}

      <div style={{ marginTop: 10, maxHeight: 240, overflow: "auto", borderTop: "1px solid #f3f3f3" }}>
        {data.length === 0 ? (
          <div style={{ padding: 10, opacity: 0.75 }}>
            {loading ? "Cargando..." : "No hay candidatos."}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8, paddingTop: 10 }}>
            {data.map((p) => (
              <div
                key={p.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>{p.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    variantes: {p.has_variants ? `✅ (${p.variants_count})` : "❌"}
                  </div>
                </div>

                <button
                  onClick={() => onPick(p)}
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    borderRadius: 8,
                    fontWeight: 900,
                  }}
                  title="Agregar componente"
                >
                  + Agregar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        Solo aparecen productos <strong>activos</strong> y <strong>vendibles</strong> en esta sucursal/canales.
      </div>
    </div>
  );
}
