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

const noticesListStyle = {
  marginTop: 10,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "#fff",
  borderRadius: 12,
  padding: 12,
  fontSize: 13,
  lineHeight: 1.35,
};

const subtleNoteStyle = {
  marginTop: 10,
  fontSize: 12,
  opacity: 0.75,
  lineHeight: 1.35,
};

const helperStyle = {
  marginTop: 6,
  fontSize: 12,
  color: "rgba(0,0,0,0.70)",
  lineHeight: 1.35,
  fontWeight: 700, // negrito suave
};

// opciones fuera del componente (sin hooks, sin dramas)
const SEAT_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

function FieldError({ message }) {
  if (!message) return null;
  return (
    <div style={{ marginTop: 6, color: "#a10000", fontSize: 12, fontWeight: 700 }}>
      {message}
    </div>
  );
}

function HelperNote({ children }) {
  if (!children) return null;
  return <div style={helperStyle}>{children}</div>;
}

export default function OperationalSettingsModal({
  open,
  mode = "create", // create | edit
  restaurantId,
  branchId,
  initialData = null, // cuando edit (puede ser {data, ui, notices} o solo data)
  onClose,
  onSaved,
  showToast, // opcional
}) {
  const [saving, setSaving] = useState(false);
  const [serverNotices, setServerNotices] = useState([]);

  // initialData puede venir como:
  // - data directo (viejo)
  // - { data, ui, notices } (nuevo)
  const initial = useMemo(() => {
    if (!initialData) return null;
    if (initialData?.data) return initialData.data;
    return initialData;
  }, [initialData]);

  const initialNotices = useMemo(() => {
    if (!initialData) return [];
    return Array.isArray(initialData?.notices) ? initialData.notices : [];
  }, [initialData]);

  // Si NO hay registro,  abre el modal en create.
  const showMissingConfigNotice = mode === "create" && !initial;

  const defaultValues = useMemo(
    () => ({
      // valores en inglés para sistema
      ordering_mode: initial?.ordering_mode ?? "waiter_only",
      table_service_mode: initial?.table_service_mode ?? "free_for_all",
      is_qr_enabled: !!initial?.is_qr_enabled,

      // campos asientos (si tu backend los valida/guarda)
      min_seats: Number.isInteger(initial?.min_seats) ? initial.min_seats : 1,
      max_seats: Number.isInteger(initial?.max_seats) ? initial.max_seats : 6,
    }),
    [initial]
  );

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues });

  const orderingMode = watch("ordering_mode");
  const tableServiceMode = watch("table_service_mode");
  const isQrEnabled = watch("is_qr_enabled");
  const minSeats = watch("min_seats");
  const maxSeats = watch("max_seats");

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
    setServerNotices(initialNotices);
  }, [open, reset, defaultValues, initialNotices]);

  if (!open) return null;

  const title = mode === "create" ? "Configuración Operativa Inicial" : "Configuración Operativa";

  const orderingHelper =
    orderingMode === "waiter_only"
      ? "El cliente solo visualiza el menú. El mesero captura el pedido."
      : orderingMode === "customer_assisted"
      ? "El cliente puede seleccionar productos desde el QR (y opcional llamar mesero)."
      : "";

  const tableServiceHelper =
    tableServiceMode === "assigned_waiter"
      ? "Mesas asignadas a meseros específicos."
      : tableServiceMode === "free_for_all"
      ? "Cualquier mesero puede tomar una mesa disponible."
      : "";

  const onSubmit = async (form) => {
    setSaving(true);
    try {
      const payload = {
        ordering_mode: form.ordering_mode || null,
        table_service_mode: form.table_service_mode || null,
        is_qr_enabled: !!form.is_qr_enabled,

        // asientos (si backend lo soporta)
        min_seats: Number(form.min_seats),
        max_seats: Number(form.max_seats),
      };

      const saved =
        mode === "create"
          ? await createOperationalSettings(restaurantId, branchId, payload)
          : await updateOperationalSettings(restaurantId, branchId, payload);

      // saved => { data, ui, notices, message }
      setServerNotices(Array.isArray(saved?.notices) ? saved.notices : []);

      if (showToast) showToast(saved?.message || "Guardado correctamente.", "success");
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

                <HelperNote>{orderingHelper}</HelperNote>
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

                <HelperNote>{tableServiceHelper}</HelperNote>
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
                    Si está desactivado, no se debe permitir crear, administrar ni resolver códigos QR.
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" {...register("is_qr_enabled")} />
                  <span style={{ fontWeight: 900, fontSize: 12 }}>
                    {isQrEnabled ? "Sí" : "No"}
                  </span>
                </label>
              </div>

              {/* ASIENTOS */}
              <div
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Asientos</div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>
                      Mínimo
                    </div>

                    <select
                      {...register("min_seats")}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.18)",
                      }}
                    >
                      {SEAT_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>

                    <FieldError message={errors?.min_seats?.message} />
                  </div>

                  <div>
                    <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>
                      Máximo
                    </div>

                    <select
                      {...register("max_seats")}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.18)",
                      }}
                    >
                      {SEAT_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>

                    <FieldError message={errors?.max_seats?.message} />
                  </div>
                </div>

                <div style={subtleNoteStyle}>
                  No podrás crear mesas con menos de <strong>{Number(minSeats) || 1}</strong> ni más de{" "}
                  <strong>{Number(maxSeats) || 6}</strong> asientos.
                </div>
              </div>

              {/* NOTICES DEL BACKEND */}
              {Array.isArray(serverNotices) && serverNotices.length > 0 ? (
                <div style={noticesListStyle}>
                  <div style={{ fontWeight: 950, marginBottom: 8 }}>Avisos del sistema</div>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {serverNotices.map((n, idx) => (
                      <li key={idx} style={{ marginBottom: 6, fontWeight: 750 }}>
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
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
