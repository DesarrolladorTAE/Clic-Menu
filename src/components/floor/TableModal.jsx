import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { handleFormApiError } from "../../utils/useFormApiHandler";
import {
  createTable,
  updateTable,
  getAvailableWaiters,
} from "../../services/floor/tables.service";

// UI simple
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

const subtleNoteStyle = {
  marginTop: 10,
  fontSize: 12,
  opacity: 0.75,
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

const STATUS_OPTIONS = [
  { value: "available", label: "Disponible" },
  { value: "occupied", label: "Ocupado" },
  { value: "reserved", label: "Reservado" },
];

function makeRange(min, max) {
  const out = [];
  for (let i = min; i <= max; i++) out.push(i);
  return out;
}

function waiterLabel(w) {
  if (!w) return "";
  const parts = [w.name, w.last_name_paternal, w.last_name_maternal].filter(Boolean);
  const full = parts.join(" ").trim();
  const phone = w.phone ? ` · ${w.phone}` : "";
  return `${full}${phone}`.trim();
}

export default function TableModal({
  open,
  mode = "create", // create | edit
  restaurantId,
  branchId,
  zones = [], // [{id, name}]
  settings = null, // {min_seats, max_seats, table_service_mode}
  initialData = null, // edit: {id, zone_id, name, seats, status, assigned_waiter_id, zone?}
  onClose,
  onSaved,
  showToast,
}) {
  const [saving, setSaving] = useState(false);

  // ---- Meseros disponibles (solo selector)
  const [waitersLoading, setWaitersLoading] = useState(false);
  const [waiters, setWaiters] = useState([]);

  const isAssignedWaiterMode =
    String(settings?.table_service_mode || "") === "assigned_waiter";

  const minSeats = Number(settings?.min_seats ?? 1);
  const maxSeats = Number(settings?.max_seats ?? 6);

  const seatOptions = useMemo(() => {
    const min = Number.isFinite(minSeats) ? minSeats : 1;
    const max = Number.isFinite(maxSeats) ? maxSeats : 6;
    return makeRange(min, max);
  }, [minSeats, maxSeats]);

  const defaultValues = useMemo(() => {
    const firstZoneId = zones?.[0]?.id ?? "";
    const initialZoneId =
      initialData?.zone_id ?? initialData?.zone?.id ?? firstZoneId;

    const safeMin = seatOptions[0] ?? 1;
    const safeMax = seatOptions[seatOptions.length - 1] ?? 6;

    const initialSeats = Number(initialData?.seats);
    const seatsInRange =
      Number.isFinite(initialSeats) &&
      initialSeats >= safeMin &&
      initialSeats <= safeMax
        ? initialSeats
        : safeMin;

    const initialAssignedWaiterId =
      typeof initialData?.assigned_waiter_id === "number"
        ? initialData.assigned_waiter_id
        : initialData?.assigned_waiter_id
        ? Number(initialData.assigned_waiter_id)
        : null;

    return {
      zone_id: initialZoneId,
      name: initialData?.name ?? "",
      seats: seatsInRange,
      status: initialData?.status ?? "available",
      assigned_waiter_id: initialAssignedWaiterId ?? "",
    };
  }, [initialData, zones, seatOptions]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (!open) return;

    reset(defaultValues);

    // Si no aplica el modo, limpia el campo para evitar mandar basura
    if (!isAssignedWaiterMode) {
      setValue("assigned_waiter_id", "");
      setWaiters([]); // opcional: limpiar lista para que no se vea rara si abre/cierra
    }
  }, [open, reset, defaultValues, isAssignedWaiterMode, setValue]);

  // Cargar meseros al abrir (solo si aplica el modo)
  useEffect(() => {
    if (!open) return;
    if (!isAssignedWaiterMode) return;

    let alive = true;

    (async () => {
      setWaitersLoading(true);
      try {
        // Sin búsqueda: trae todo
        const list = await getAvailableWaiters(restaurantId, branchId, "");
        if (!alive) return;
        setWaiters(Array.isArray(list) ? list : []);
      } catch (e) {
        const msg =
          e?.response?.data?.message || e?.message || "No se pudieron cargar los meseros";
        if (showToast) showToast(msg, "error");
      } finally {
        if (alive) setWaitersLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, isAssignedWaiterMode, restaurantId, branchId, showToast]);

  if (!open) return null;

  const title = mode === "create" ? "Nueva mesa" : "Editar mesa";

  const onSubmit = async (form) => {
    setSaving(true);
    try {
      const assignedWaiterIdRaw = form.assigned_waiter_id;

      const payload = {
        zone_id: Number(form.zone_id),
        name: (form.name || "").trim(),
        seats: Number(form.seats),
        status: form.status || "available",
      };

      // Solo enviar assigned_waiter_id si el modo lo permite
      if (isAssignedWaiterMode) {
        payload.assigned_waiter_id =
          assignedWaiterIdRaw === "" ||
          assignedWaiterIdRaw === null ||
          typeof assignedWaiterIdRaw === "undefined"
            ? null
            : Number(assignedWaiterIdRaw);
      } else {
        payload.assigned_waiter_id = null; // limpiar en backend si aplica
      }

      const saved =
        mode === "create"
          ? await createTable(restaurantId, branchId, payload)
          : await updateTable(restaurantId, branchId, initialData.id, payload);

      if (showToast)
        showToast(mode === "create" ? "Mesa creada." : "Mesa actualizada.", "success");

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

  const currentSeats = watch("seats");

  return (
    <div style={overlayStyle} onMouseDown={onClose} role="dialog" aria-modal="true">
      <div style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Define zona, nombre, asientos, estado y (si aplica) mesero asignado.
            </div>
          </div>

          <button onClick={onClose} style={{ cursor: "pointer" }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={bodyStyle}>
            <div style={{ display: "grid", gap: 14 }}>
              {/* Zona */}
              <div>
                <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>Zona</div>
                <select
                  {...register("zone_id")}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.18)",
                  }}
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
                <FieldError message={errors?.zone_id?.message} />
              </div>

              {/* Nombre */}
              <div>
                <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>Nombre</div>
                <input
                  {...register("name")}
                  placeholder='Ej. "M01"'
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

              {/* Asientos */}
              <div>
                <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>Asientos</div>
                <select
                  {...register("seats")}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.18)",
                  }}
                >
                  {seatOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <FieldError message={errors?.seats?.message} />
                <div style={subtleNoteStyle}>
                  Rango permitido por sucursal: <strong>{minSeats}</strong> a{" "}
                  <strong>{maxSeats}</strong>. Seleccionado:{" "}
                  <strong>{Number(currentSeats)}</strong>.
                </div>
              </div>

              {/* Estatus */}
              <div>
                <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>Estatus</div>
                <select
                  {...register("status")}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.18)",
                  }}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <FieldError message={errors?.status?.message} />
              </div>

              {/* Mesero asignado (solo si aplica el modo) */}
              {isAssignedWaiterMode && (
                <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 2 }}>
                        Mesero asignado
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.75 }}>
                        Solo aparecen empleados con rol operativo{" "}
                        <strong>waiter/mesero</strong> activos.
                      </div>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>
                      {waitersLoading ? "Cargando..." : `${waiters.length} disponibles`}
                    </div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <select
                      {...register("assigned_waiter_id")}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.18)",
                      }}
                      disabled={waitersLoading}
                    >
                      <option value="">Sin mesero asignado</option>
                      {waiters.map((w) => (
                        <option key={w.id} value={w.id}>
                          {waiterLabel(w)}
                        </option>
                      ))}
                    </select>

                    <FieldError message={errors?.assigned_waiter_id?.message} />

                    <div style={subtleNoteStyle}>
                      Si el modo es <strong>Mesero asignado</strong>, puedes asignar uno aquí.
                      Si el modo cambia a <strong>Libre</strong>, el sistema lo ignorará.
                    </div>
                  </div>
                </div>
              )}
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
