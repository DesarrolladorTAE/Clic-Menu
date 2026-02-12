import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { handleFormApiError } from "../../utils/useFormApiHandler";
import { createZone, updateZone } from "../../services/floor/zones.service";

// UI simple (sin librerías extra)
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 99999,
  padding: 16,
};

const modalStyle = {
  width: "100%",
  maxWidth: 520,
  background: "#fff",
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.12)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
  overflow: "hidden",
};

const headerStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const bodyStyle = { padding: 16 };

const footerStyle = {
  padding: "12px 16px",
  borderTop: "1px solid rgba(0,0,0,0.08)",
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};

function FieldError({ message }) {
  if (!message) return null;
  return (
    <div style={{ marginTop: 6, color: "#a10000", fontSize: 12, fontWeight: 700 }}>
      {message}
    </div>
  );
}

export default function ZoneModal({
  open,
  mode = "create", // create | edit
  restaurantId,
  branchId,
  initialData = null, // {id, name} cuando edit
  onClose,
  onSaved,
  showToast, // opcional
}) {
  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo(
    () => ({
      name: initialData?.name ?? "",
    }),
    [initialData]
  );

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
  }, [open, reset, defaultValues]);

  if (!open) return null;

  const title = mode === "create" ? "Nueva zona" : "Editar zona";

  const onSubmit = async (form) => {
    setSaving(true);
    try {
      const payload = { name: (form.name || "").trim() };

      const saved =
        mode === "create"
          ? await createZone(restaurantId, branchId, payload)
          : await updateZone(restaurantId, branchId, initialData.id, payload);

      if (showToast) showToast(mode === "create" ? "Zona creada." : "Zona actualizada.", "success");
      if (onSaved) onSaved(saved);
      onClose();
    } catch (e) {
      const handled = handleFormApiError(e, setError, {
        onMessage: (msg) => (showToast ? showToast(msg, "error") : alert(msg)),
      });

      if (!handled) {
        const msg = e?.response?.data?.message || e?.message || "No se pudo guardar";
        if (showToast) showToast(msg, "error");
        else alert(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlayStyle} onMouseDown={onClose} role="dialog" aria-modal="true">
      <div style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Las zonas son áreas físicas (ej. Terraza, Balcón).
            </div>
          </div>

          <button onClick={onClose} style={{ cursor: "pointer" }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={bodyStyle}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>
                Nombre de la zona
              </div>

              <input
                {...register("name")}
                placeholder='Ej. "Terraza"'
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.18)",
                  outline: "none",
                }}
              />

              <FieldError message={errors?.name?.message} />
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              Nota: no se permiten nombres duplicados por sucursal.
            </div>
          </div>

          <div style={footerStyle}>
            <button type="button" onClick={onClose} style={{ cursor: "pointer" }}>
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                cursor: saving ? "not-allowed" : "pointer",
                padding: "10px 14px",
                fontWeight: 900,
              }}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
