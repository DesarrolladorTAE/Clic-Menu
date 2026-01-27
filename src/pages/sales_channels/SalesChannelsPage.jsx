import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  getSalesChannels,
  createSalesChannel,
  updateSalesChannel,
  deleteSalesChannel,
} from "../../services/sales_channels.service";

const STATUS = {
  active: "active",
  inactive: "inactive",
};

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_"); // "A DOMICILIO" -> "A_DOMICILIO"
}

export default function SalesChannelsPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();
  const rid = Number(restaurantId);

  const [searchParams] = useSearchParams();
  const branchIdFromUrl = searchParams.get("branch_id"); // string | null

  const isBranchMode = useMemo(() => {
    return !!branchIdFromUrl && !Number.isNaN(Number(branchIdFromUrl));
  }, [branchIdFromUrl]);

  const effectiveBranchId = useMemo(() => {
    if (!isBranchMode) return null;
    return Number(branchIdFromUrl);
  }, [isBranchMode, branchIdFromUrl]);

  // filtros
  const [includeInactive, setIncludeInactive] = useState(false);

  // data
  const [rows, setRows] = useState([]);

  // ui
  const [loading, setLoading] = useState(true); // ✅ solo carga inicial
  const [refreshing, setRefreshing] = useState(false); // ✅ recargas sin tumbar pantalla
  const [err, setErr] = useState("");

  // form (sin branch_id visible)
  const [form, setForm] = useState({
    id: null,
    code: "",
    name: "",
    status: STATUS.active,
  });

  const params = useMemo(() => {
    const p = {};
    if (includeInactive) p.include_inactive = true;
    if (effectiveBranchId) p.branch_id = effectiveBranchId;
    return p;
  }, [includeInactive, effectiveBranchId]);

  // ✅ load con modo: initial vs refresh
  const load = async ({ silent = false } = {}) => {
    setErr("");
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const list = await getSalesChannels(rid, params);
      setRows(list);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar canales");
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  };

  // ✅ carga inicial (solo cuando cambia restaurantId)
  useEffect(() => {
    load({ silent: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rid]);

  // ✅ recargas por filtros/sucursal (sin pantalla "Cargando...")
  useEffect(() => {
    if (loading) return;
    load({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const resetForm = () => {
    setForm({
      id: null,
      code: "",
      name: "",
      status: STATUS.active,
    });
  };

  const onEdit = (ch) => {
    setErr("");
    setForm({
      id: ch.id,
      code: ch.code ?? "",
      name: ch.name ?? "",
      status: ch.status ?? STATUS.active,
    });
  };

  const validate = () => {
    const code = normalizeCode(form.code);
    if (!code) return "El code es requerido (ej. COMEDOR)";
    if (code.length > 30) return "code máximo 30 caracteres";
    if (!String(form.name || "").trim()) return "El nombre es requerido";
    if (String(form.name || "").trim().length > 80) return "name máximo 80 caracteres";
    if (![STATUS.active, STATUS.inactive].includes(form.status)) return "status inválido";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const msg = validate();
    if (msg) {
      setErr(msg);
      return;
    }

    const payload = {
      branch_id: effectiveBranchId ?? null,
      code: normalizeCode(form.code),
      name: String(form.name).trim(),
      status: form.status,
    };

    try {
      if (form.id) {
        await updateSalesChannel(rid, form.id, payload);
      } else {
        await createSalesChannel(rid, payload);
      }

      resetForm();
      await load({ silent: true }); // ✅ refresh sin tumbar UI
    } catch (e2) {
      const m =
        e2?.response?.data?.message ||
        (e2?.response?.data?.errors
          ? Object.values(e2.response.data.errors).flat().join("\n")
          : "No se pudo guardar el canal");
      setErr(m);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("¿Eliminar este canal?")) return;
    setErr("");
    try {
      await deleteSalesChannel(rid, id);
      if (form.id === id) resetForm();
      await load({ silent: true }); // ✅ refresh sin tumbar UI
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo eliminar");
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando canales...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Canales de venta</h2>

          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Restaurante: <strong>#{rid}</strong>
          </div>

          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Scope:{" "}
            <strong>
              {effectiveBranchId ? `Sucursal #${effectiveBranchId}` : "Global"}
            </strong>

            {refreshing && (
              <span style={{ marginLeft: 10, fontSize: 12, opacity: 0.7 }}>
                actualizando...
              </span>
            )}
          </div>

          {effectiveBranchId && (
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
              Estás en modo sucursal: el canal se guardará automáticamente en esta sucursal.
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => nav(-1)}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            ← Volver
          </button>

          <button
            onClick={resetForm}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            + Nuevo canal
          </button>
        </div>
      </div>

      {err && (
        <div
          style={{
            marginTop: 12,
            background: "#ffe5e5",
            padding: 10,
            whiteSpace: "pre-line",
          }}
        >
          {err}
        </div>
      )}

      <div
        style={{
          marginTop: 14,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          Incluir inactivos
        </label>
      </div>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "420px 1fr", gap: 14 }}>
        {/* Form */}
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            {form.id ? `Editar canal #${form.id}` : "Crear canal"}
          </div>

          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                Code (único por restaurante{effectiveBranchId ? " y sucursal" : ""})
              </div>
              <input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="Ej. COMEDOR"
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                Se normaliza a MAYÚSCULAS y con guiones bajos.
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                Nombre
              </div>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ej. Comedor"
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                Status
              </div>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                style={{ width: "100%", padding: 10, borderRadius: 8 }}
              >
                <option value={STATUS.active}>active</option>
                <option value={STATUS.inactive}>inactive</option>
              </select>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button
                type="submit"
                style={{ padding: "10px 12px", cursor: "pointer", borderRadius: 8 }}
              >
                Guardar
              </button>

              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ padding: "10px 12px", cursor: "pointer", borderRadius: 8 }}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Listado</div>

          {rows.length === 0 ? (
            <div style={{ opacity: 0.8 }}>No hay canales en este filtro.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {rows.map((ch) => (
                <div
                  key={ch.id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "start",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900 }}>
                      {ch.name}{" "}
                      <span style={{ fontSize: 12, opacity: 0.75 }}>
                        ({ch.code})
                      </span>
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                      status: <strong>{ch.status}</strong>
                      {" · "}
                      scope:{" "}
                      <strong>
                        {ch.branch_id ? `branch #${ch.branch_id}` : "global"}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => onEdit(ch)}
                      style={{ padding: "8px 10px", cursor: "pointer" }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(ch.id)}
                      style={{
                        padding: "8px 10px",
                        cursor: "pointer",
                        background: "#ffe5e5",
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
