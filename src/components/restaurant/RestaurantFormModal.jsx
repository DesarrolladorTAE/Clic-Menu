import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { createRestaurant, updateRestaurant } from "../../services/restaurant/restaurant.service";

export default function RestaurantFormModal({
  open,
  mode = "create", // "create" | "edit"
  restaurant = null, // objeto restaurante (para edit)
  onClose,
  onSaved, // (payload) => void
}) {
  const isEdit = mode === "edit";
  const title = isEdit ? "Editar restaurante" : "Registrar restaurante";

  // ✅ Solo para errores NO 422 (red, 500, etc). En 422 NO mostramos banner global.
  const [serverMsg, setServerMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const defaults = useMemo(() => {
    return {
      trade_name: restaurant?.trade_name ?? "",
      description: restaurant?.description ?? "",
      contact_phone: restaurant?.contact_phone ?? "",
      contact_email: restaurant?.contact_email ?? "",
    };
  }, [restaurant]);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: defaults,
    mode: "onSubmit", // mensajes vienen del backend
  });

  useEffect(() => {
    if (!open) return;
    setServerMsg("");
    clearErrors();
    reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaults]);

  if (!open) return null;

  const mapBackendErrors = (e) => {
    const data = e?.response?.data;
    const bag = data?.errors;

    // Laravel typical: { message, errors: { field: [msg] } }
    if (bag && typeof bag === "object") {
      Object.entries(bag).forEach(([field, arr]) => {
        const first = Array.isArray(arr) ? arr[0] : String(arr);
        setError(field, { type: "server", message: first });
      });

      // ✅ Importante: NO ponemos banner global para 422
      setServerMsg("");
      return;
    }

    // si no hay bag, ya es algo raro: sí mostramos un mensaje general
    setServerMsg(data?.message || "No se pudo guardar. Intenta de nuevo.");
  };

  const onSubmit = async (values) => {
    setServerMsg("");
    setBusy(true);

    try {
      let payload;

      if (isEdit) {
        const rid = restaurant?.id;
        payload = await updateRestaurant(rid, values);
      } else {
        payload = await createRestaurant(values);
      }

      // ✅ warnings NO se muestran aquí (no banner, no alert). Se pasan al parent.
      onSaved?.(payload);
      onClose?.();
    } catch (e) {
      if (e?.response?.status === 422) {
        mapBackendErrors(e);
      } else {
        setServerMsg(e?.response?.data?.message || "No se pudo guardar.");
      }
    } finally {
      setBusy(false);
    }
  };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  };

  const modalStyle = {
    width: "100%",
    maxWidth: 560,
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
    overflow: "hidden",
  };

  const headerStyle = {
    padding: 14,
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  };

  const bodyStyle = { padding: 14 };

  const labelStyle = { display: "block", fontWeight: 700, marginBottom: 6 };
  const inputStyle = {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
  };
  const errorTextStyle = { marginTop: 6, color: "#a10000", fontSize: 12, fontWeight: 700 };

  const btnStyle = {
    padding: "10px 12px",
    cursor: "pointer",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
  };

  const primaryBtnStyle = {
    ...btnStyle,
    border: "1px solid #cfcfff",
    background: "#f0f0ff",
    fontWeight: 800,
  };

  return (
    <div style={overlayStyle} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div style={{ fontWeight: 900 }}>{title}</div>

          <button
            onClick={onClose}
            style={{ ...btnStyle, borderRadius: 999, padding: "8px 12px" }}
            disabled={busy}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div style={bodyStyle}>
          {/* ✅ Solo para errores NO 422 */}
          {serverMsg && (
            <div style={{ background: "#ffe5e5", padding: 10, borderRadius: 10, marginBottom: 12 }}>
              {serverMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Nombre comercial</label>
              <input
                {...register("trade_name")}
                style={inputStyle}
                required
                autoComplete="off"
                inputMode="text"
              />
              {/* ✅ Error solo debajo del input */}
              {errors.trade_name?.message && <div style={errorTextStyle}>{errors.trade_name.message}</div>}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Descripción</label>
              <input
                {...register("description")}
                style={inputStyle}
                autoComplete="off"
                inputMode="text"
              />
              {errors.description?.message && <div style={errorTextStyle}>{errors.description.message}</div>}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Teléfono</label>
              <input
                {...register("contact_phone")}
                style={inputStyle}
                autoComplete="off"
                inputMode="tel"
              />
              {errors.contact_phone?.message && (
                <div style={errorTextStyle}>{errors.contact_phone.message}</div>
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Email</label>
              <input
                {...register("contact_email")}
                style={inputStyle}
                type="email"
                autoComplete="off"
                inputMode="email"
              />
              {errors.contact_email?.message && (
                <div style={errorTextStyle}>{errors.contact_email.message}</div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
              <button type="button" onClick={onClose} style={btnStyle} disabled={busy}>
                Cancelar
              </button>

              <button
                type="submit"
                style={primaryBtnStyle}
                disabled={busy || (isEdit && !isDirty)}
                title={isEdit && !isDirty ? "No hay cambios" : "Guardar"}
              >
                {busy ? "Guardando..." : isEdit ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
