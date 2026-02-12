import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { handleFormApiError } from "../../utils/useFormApiHandler";
import {
  createOperationalSettings,
  updateOperationalSettings,
} from "../../services/floor/operationalSettings.service";

// UI simple tipo tu estilo actual (sin librerías extra)
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
  maxWidth: 560,
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

const noticeStyle = {
  border: "1px solid rgba(0,0,0,0.12)",
  background: "#fff3cd",
  borderRadius: 12,
  padding: 12,
  fontSize: 13,
  lineHeight: 1.35,
};

function FieldError({ message }) {
  if (!message) return null;
  return (
    <div style={{ marginTop: 6, color: "#a10000", fontSize: 12, fontWeight: 700 }}>
      {message}
    </div>
  );
}

export default function OperationalSettingsModal({
  open,
  mode = "create", // create | edit
  restaurantId,
  branchId,
  initialData = null, // cuando edit
  onClose,
  onSaved,
  showToast, // opcional
}) {
  const [saving, setSaving] = useState(false);

  // Si NO hay registro, tu pantalla abre el modal en create.
  // Este flag controla el aviso.
  const showMissingConfigNotice = mode === "create" && !initialData;

  const defaultValues = useMemo(
    () => ({
      // valores en inglés para sistema
      ordering_mode: initialData?.ordering_mode ?? "waiter_only",
      table_service_mode: initialData?.table_service_mode ?? "free_for_all",
      is_qr_enabled: !!initialData?.is_qr_enabled,
    }),
    [initialData]
  );

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues });

  const isQrEnabled = watch("is_qr_enabled");

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
  }, [open, reset, defaultValues]);

  if (!open) return null;

  const title = mode === "create" ? "Configuración Operativa Inicial" : "Configuración Operativa";

  const onSubmit = async (form) => {
    setSaving(true);
    try {
      const payload = {
        // backend espera valores en inglés
        ordering_mode: form.ordering_mode || null,
        table_service_mode: form.table_service_mode || null,
        is_qr_enabled: !!form.is_qr_enabled,
      };

      const saved =
        mode === "create"
          ? await createOperationalSettings(restaurantId, branchId, payload)
          : await updateOperationalSettings(restaurantId, branchId, payload);

      if (showToast) showToast("Guardado correctamente.", "success");
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
              Define cómo se opera la sucursal antes de usar Zonas, Mesas y QR.
            </div>
          </div>

          <button onClick={onClose} style={{ cursor: "pointer" }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={bodyStyle}>
            <div style={{ display: "grid", gap: 14 }}>
              {/* ✅ AVISO SOLO CUANDO NO EXISTE REGISTRO */}
              {showMissingConfigNotice && (
                <div style={noticeStyle}>
                  <div style={{ fontWeight: 900, marginBottom: 4 }}>Importante</div>
                  Primero configura la parte operativa para poder continuar.
                </div>
              )}

              {/* ordering_mode */}
              <div>
                <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>
                  Modo de toma de pedidos
                </div>
                <select
                  {...register("ordering_mode")}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.18)",
                  }}
                >
                  <option value="waiter_only">Solo mesero</option>
                  <option value="customer_assisted">Cliente asistido</option>
                </select>
                <FieldError message={errors?.ordering_mode?.message} />
              </div>

              {/* table_service_mode */}
              <div>
                <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>
                  Modo de asignación de mesas
                </div>
                <select
                  {...register("table_service_mode")}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.18)",
                  }}
                >
                  <option value="free_for_all">Libre</option>
                  <option value="assigned_waiter">Mesero asignado</option>
                </select>
                <FieldError message={errors?.table_service_mode?.message} />
              </div>

              {/* is_qr_enabled */}
              <div
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>Habilitar QR</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    Si está desactivado, no se debe permitir generar ni resolver códigos QR.
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" {...register("is_qr_enabled")} />
                  <span style={{ fontWeight: 900, fontSize: 12 }}>
                    {isQrEnabled ? "Sí" : "No"}
                  </span>
                </label>
              </div>

              <div style={{ fontSize: 12, opacity: 0.75 }}>
                Nota: las validaciones vienen del backend (422) y se muestran en cada campo.
              </div>
            </div>
          </div>

          <div style={footerStyle}>
            <button type="button" onClick={onClose} style={{ cursor: "pointer" }}>
              Cerrar
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
