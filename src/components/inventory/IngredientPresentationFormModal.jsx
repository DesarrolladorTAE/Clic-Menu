import { useEffect, useMemo, useState } from "react";
import { normalizeErr } from "../../utils/err";
import { getSuppliers } from "../../services/inventory/suppliers/suppliers.service";
import SupplierWizard from "./SupplierWizard";

const YIELD_UNITS = [
  { value: "g", label: "g (gramos)" },
  { value: "kg", label: "kg (kilogramos)" },
  { value: "ml", label: "ml (mililitros)" },
  { value: "l", label: "l (litros)" },
  { value: "pz", label: "pz (piezas)" },
];

export default function IngredientPresentationFormModal({
  open,
  onClose,
  restaurantId,
  ingredient,
  editRow,
  onSaved,
  api, // { createPresentation, updatePresentation }
}) {
  const isEdit = !!editRow?.id;

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [purchase_cost, setPurchaseCost] = useState("");

  const [yield_qty, setYieldQty] = useState("");
  const [yield_unit, setYieldUnit] = useState("g");

  const [stock_min, setStockMin] = useState("");
  const [stock_max, setStockMax] = useState("");
  const [storage_location, setStorage] = useState("");
  const [status, setStatus] = useState("active");

  // suppliers
  const [suppliers, setSuppliers] = useState([]);
  const [supLoading, setSupLoading] = useState(false);
  const [openSupplierWizard, setOpenSupplierWizard] = useState(false);

  const loadSuppliers = async () => {
    setSupLoading(true);
    try {
      const res = await getSuppliers(restaurantId, { only_active: false, q: "" });
      setSuppliers(res?.data || []);
    } catch {
      setSuppliers([]);
    } finally {
      setSupLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadSuppliers();
    // eslint-disable-next-line
  }, [open, restaurantId]);

  useEffect(() => {
    if (!open) return;
    setErr("");

    if (isEdit) {
      setCode(editRow.code || "");
      setDescription(editRow.description || "");
      setSupplierId(editRow.supplier_id ? String(editRow.supplier_id) : "");
      setPurchaseCost(editRow.purchase_cost ?? "");
      setYieldQty(editRow.yield_qty ?? "");
      setYieldUnit(editRow.yield_unit || ingredient?.unit || "g");
      setStockMin(editRow.stock_min ?? "");
      setStockMax(editRow.stock_max ?? "");
      setStorage(editRow.storage_location ?? "");
      setStatus(editRow.status || "active");
    } else {
      setCode("");
      setDescription("");
      setSupplierId("");
      setPurchaseCost("");
      setYieldQty("");
      setYieldUnit(ingredient?.unit || "g");
      setStockMin("");
      setStockMax("");
      setStorage("");
      setStatus("active");
    }
    // eslint-disable-next-line
  }, [open, editRow?.id]);

  const title = isEdit ? "Editar presentación" : "Nueva presentación";

  const canSave = useMemo(() => {
    if (!description.trim()) return false;
    if (!purchase_cost || !Number.isFinite(Number(purchase_cost))) return false;
    if (!yield_qty || !Number.isFinite(Number(yield_qty))) return false;
    if (!yield_unit) return false;
    // supplier puede ser null, pero entonces quedará inactive (tu backend lo permite)
    return true;
  }, [description, purchase_cost, yield_qty, yield_unit]);

  const save = async () => {
    setErr("");

    const payload = {
      code: code.trim() || null,
      description: description.trim(),
      supplier_id: supplierId ? Number(supplierId) : null,
      purchase_cost: Number(purchase_cost),
      yield_qty: Number(yield_qty),
      yield_unit,
      stock_min: stock_min === "" ? null : Number(stock_min),
      stock_max: stock_max === "" ? null : Number(stock_max),
      storage_location: storage_location.trim() || null,
      status,
    };

    if (!Number.isFinite(payload.purchase_cost) || payload.purchase_cost <= 0) {
      return setErr("Costo de compra inválido.");
    }
    if (!Number.isFinite(payload.yield_qty) || payload.yield_qty <= 0) {
      return setErr("Rinde inválido.");
    }
    if (payload.stock_min !== null && !Number.isFinite(payload.stock_min)) return setErr("stock_min inválido.");
    if (payload.stock_max !== null && !Number.isFinite(payload.stock_max)) return setErr("stock_max inválido.");

    setSaving(true);
    try {
      if (isEdit) {
        await api.updatePresentation(restaurantId, ingredient.id, editRow.id, payload);
      } else {
        await api.createPresentation(restaurantId, ingredient.id, payload);
      }
      await onSaved?.();
    } catch (e) {
      setErr(normalizeErr(e, "No se pudo guardar"));
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
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 11000,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div style={{ width: "min(820px, 100%)", background: "#fff", borderRadius: 14, border: "1px solid #eee" }}>
        {/* Header */}
        <div style={{ padding: 14, borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Ingrediente: <strong>{ingredient?.name}</strong> · Base: <strong>{ingredient?.unit}</strong>
            </div>
          </div>

          <button onClick={onClose} style={{ padding: "8px 10px", cursor: "pointer" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 14 }}>
          {err && (
            <div style={{ marginBottom: 12, background: "#ffe5e5", padding: 10, whiteSpace: "pre-line", borderRadius: 10 }}>
              <strong>Error:</strong> {err}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Descripción *</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Bolsa 1kg"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Código (opcional)</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej. BOLSA1KG"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Proveedor</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  disabled={supLoading}
                  style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                >
                  <option value="">
                    {supLoading ? "Cargando proveedores…" : "Selecciona un proveedor"}
                  </option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setOpenSupplierWizard(true)}
                  title="Administrar proveedores"
                  style={{
                    padding: "0 14px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background: "#fafafa",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>
    
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Costo compra *</label>
              <input
                value={purchase_cost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                placeholder="Ej. 180"
                inputMode="decimal"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Rinde *</label>
              <input
                value={yield_qty}
                onChange={(e) => setYieldQty(e.target.value)}
                placeholder={ingredient?.unit === "g" ? "Ej. 1000" : "Ej. 1"}
                inputMode="decimal"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Unidad *</label>
              <select
                value={yield_unit}
                onChange={(e) => setYieldUnit(e.target.value)}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              >
                {YIELD_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Se valida conversión hacia <strong>{ingredient?.unit}</strong>.
              </div>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Stock min (opcional)</label>
              <input value={stock_min} onChange={(e) => setStockMin(e.target.value)} inputMode="decimal"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Stock max (opcional)</label>
              <input value={stock_max} onChange={(e) => setStockMax(e.target.value)} inputMode="decimal"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Ubicación (opcional)</label>
              <input value={storage_location} onChange={(e) => setStorage(e.target.value)}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900, fontSize: 13 }}>Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "10px 12px", cursor: "pointer" }}>
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={!canSave || saving}
              style={{
                padding: "10px 12px",
                cursor: !canSave || saving ? "not-allowed" : "pointer",
                background: "#111",
                color: "#fff",
                fontWeight: 900,
                borderRadius: 10,
                border: "1px solid #111",
                opacity: !canSave || saving ? 0.6 : 1,
              }}
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </div>

      <SupplierWizard
        open={openSupplierWizard}
        restaurantId={restaurantId}
        onClose={() => setOpenSupplierWizard(false)}
        onChanged={async () => {
          await loadSuppliers();
        }}
      />
    </div>
  );
}
