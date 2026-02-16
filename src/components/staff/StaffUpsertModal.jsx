import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { handleFormApiError } from "../../utils/useFormApiHandler";
import { getByPath } from "../../utils/getByPath";

import { createStaff, updateStaff } from "../../services/staff/staff.service";
import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";
import { getRoles } from "../../services/staff/roles.service";

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "grid",
  placeItems: "center",
  zIndex: 50,
};

const modal = {
  width: "min(820px, 92vw)",
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #eaeaea",
  overflow: "hidden",
};

export default function StaffUpsertModal({ open, onClose, restaurantId, editing, onSaved }) {
  const isEdit = !!editing?.id;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [branches, setBranches] = useState([]);
  const [rolesOp, setRolesOp] = useState([]);

  const title = useMemo(() => (isEdit ? "Editar empleado" : "Crear empleado"), [isEdit]);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      last_name_paternal: "",
      last_name_maternal: "",
      phone: "",
      email: "",
      password: "",
      status: "active",
      new_password: "",
      assignment: { branch_id: "", role_id: "", is_active: true },
    },
  });

  useEffect(() => {
    if (!open) return;

    (async () => {
      setMsg("");
      try {
        const [b, r] = await Promise.all([
          getBranchesByRestaurant(restaurantId),
          getRoles({ scope: "operational" }),
        ]);
        setBranches(Array.isArray(b) ? b : []);
        setRolesOp(Array.isArray(r) ? r : []);
      } catch (e) {
        setMsg(e?.response?.data?.message || "No se pudieron cargar catálogos (sucursales/roles)");
      }
    })();
  }, [open, restaurantId]);

  useEffect(() => {
    if (!open) return;

    setStep(1);
    setMsg("");

    if (isEdit) {
      reset({
        name: editing?.name ?? "",
        last_name_paternal: editing?.last_name_paternal ?? "",
        last_name_maternal: editing?.last_name_maternal ?? "",
        phone: editing?.phone ?? "",
        email: editing?.email ?? "",
        status: editing?.status ?? "active",
        new_password: "",
        assignment: { branch_id: "", role_id: "", is_active: true },
      });
    } else {
      reset({
        name: "",
        last_name_paternal: "",
        last_name_maternal: "",
        phone: "",
        email: "",
        password: "",
        status: "active",
        assignment: { branch_id: "", role_id: "", is_active: true },
      });
    }
  }, [open, isEdit, editing, reset]);

  if (!open) return null;

  const goNext = () => {
    setMsg("");
    if (!isEdit) setStep(2);
  };

  const goBack = () => {
    setMsg("");
    setStep(1);
  };

  const onSubmit = async (values) => {
    setMsg("");
    setSaving(true);

    try {
      if (isEdit) {
        const payload = {
          name: values.name,
          last_name_paternal: values.last_name_paternal,
          last_name_maternal: values.last_name_maternal || null,
          phone: values.phone,
          email: values.email,
          status: values.status,
          ...(values.new_password ? { new_password: values.new_password } : {}),
        };

        await updateStaff(restaurantId, editing.id, payload);
        onSaved?.();
        return;
      }

      const payload = {
        name: values.name,
        last_name_paternal: values.last_name_paternal,
        last_name_maternal: values.last_name_maternal || null,
        phone: values.phone,
        email: values.email,
        password: values.password,
        status: values.status,
        assignment: {
          branch_id: values.assignment.branch_id === "" ? null : Number(values.assignment.branch_id),
          role_id: Number(values.assignment.role_id),
          is_active: !!values.assignment.is_active,
        },
      };

      if (!payload.assignment.role_id || Number.isNaN(payload.assignment.role_id)) {
        setError("assignment.role_id", { type: "manual", message: "Selecciona un rol operativo." });
        setSaving(false);
        setStep(2);
        return;
      }

      await createStaff(restaurantId, payload);
      onSaved?.();
    } catch (e) {
      const mapped = handleFormApiError(e, setError, { onMessage: (m) => setMsg(m) });
      if (!mapped) setMsg(e?.response?.data?.message || "No se pudo guardar");

      if (!isEdit && e?.response?.status === 422) {
        const hasAssignErr =
          !!e?.response?.data?.errors?.["assignment.role_id"] ||
          !!e?.response?.data?.errors?.["assignment.branch_id"] ||
          !!e?.response?.data?.errors?.["assignment.is_active"];
        if (hasAssignErr) setStep(2);
      }
    } finally {
      setSaving(false);
    }
  };

  const rolePicked = watch("assignment.role_id");
  const branchPicked = watch("assignment.branch_id");
  const isActivePicked = watch("assignment.is_active");

  const err = (path) => getByPath(errors, path)?.message;

  const advisory =
    !isEdit && step === 2 && isActivePicked && rolePicked && branchPicked !== ""
      ? "Si más adelante asignas este mismo rol como ACTIVO en “Todas”, ya no podrás repetirlo por sucursal."
      : "";

  return (
    <div style={backdrop} onMouseDown={onClose}>
      <div style={modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ padding: 14, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
            {!isEdit && <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>Paso {step}/2</div>}
          </div>
          <button onClick={onClose} style={{ ...btn, border: "1px solid #ddd" }}>✕</button>
        </div>

        {msg && (
          <div style={{ padding: 12, background: "#fff3cd", borderBottom: "1px solid #ffeeba" }}>
            <strong>Nota:</strong> {msg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 14, display: "grid", gap: 12 }}>
          {step === 1 && (
            <>
              <TwoCols>
                <Field label="Nombre" error={err("name")} input={<input {...register("name")} />} />
                <Field label="Teléfono" error={err("phone")} input={<input {...register("phone")} placeholder="10 dígitos" />} />
              </TwoCols>

              <TwoCols>
                <Field label="Apellido paterno" error={err("last_name_paternal")} input={<input {...register("last_name_paternal")} />} />
                <Field label="Apellido materno" error={err("last_name_maternal")} input={<input {...register("last_name_maternal")} />} />
              </TwoCols>

              <TwoCols>
                <Field label="Email" error={err("email")} input={<input {...register("email")} />} />
                <Field
                  label="Estatus"
                  error={err("status")}
                  input={
                    <select {...register("status")}>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  }
                />
              </TwoCols>

              {!isEdit ? (
                <Field label="Contraseña" error={err("password")} input={<input type="password" {...register("password")} />} />
              ) : (
                <Field
                  label="Contraseña nueva (opcional)"
                  error={err("new_password")}
                  input={<input type="password" {...register("new_password")} />}
                  help="Si lo dejas vacío, no se cambia."
                />
              )}
            </>
          )}

          {!isEdit && step === 2 && (
            <>
              <div style={card}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Asignación inicial (obligatoria)</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Evita cuentas staff sin staff_assignments.</div>
              </div>

              {advisory && (
                <div style={{ padding: 10, borderRadius: 10, background: "#eef2ff", border: "1px solid #dfe3ff", fontSize: 12 }}>
                  {advisory}
                </div>
              )}

              <TwoCols>
                <Field
                  label="Sucursal"
                  error={err("assignment.branch_id")}
                  input={
                    <select {...register("assignment.branch_id")}>
                      <option value="">Todas (sin sucursal)</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  }
                />

                <Field
                  label="Rol operativo"
                  error={err("assignment.role_id")}
                  input={
                    <select {...register("assignment.role_id")}>
                      <option value="">Selecciona</option>
                      {rolesOp.map((r) => (
                        <option key={r.id} value={r.id}>{r.description || r.name}</option>
                      ))}
                    </select>
                  }
                />
              </TwoCols>

              <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="checkbox" {...register("assignment.is_active")} defaultChecked />
                <span>Asignación activa</span>
              </label>
              {err("assignment.is_active") && <div style={errText}>{err("assignment.is_active")}</div>}

              {rolePicked === "" && (
                <div style={{ fontSize: 12, opacity: 0.7 }}>Selecciona un rol operativo para poder guardar.</div>
              )}
            </>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 6 }}>
            <div>
              {!isEdit && step === 2 ? (
                <button type="button" onClick={goBack} style={btn}>← Atrás</button>
              ) : (
                <button type="button" onClick={onClose} style={btn}>Cancelar</button>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {!isEdit && step === 1 ? (
                <button type="button" onClick={goNext} style={{ ...btn, fontWeight: 800 }}>Siguiente →</button>
              ) : (
                <button type="submit" disabled={saving} style={{ ...btn, fontWeight: 900, opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function TwoCols({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}

function Field({ label, input, error, help }) {
  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 13 }}>{label}</div>
      <div style={{ marginTop: 6 }}>{wrapInput(input)}</div>
      {help && <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>{help}</div>}
      {error && <div style={errText}>{error}</div>}
    </div>
  );
}

function wrapInput(node) {
  const isSelect = node.type === "select";
  const Comp = isSelect ? "select" : "input";

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 10, padding: "10px 12px", background: "#fff" }}>
      <Comp {...node.props} style={{ width: "100%", border: "none", outline: "none", background: "transparent" }}>
        {isSelect ? node.props.children : null}
      </Comp>
    </div>
  );
}

const btn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

const card = {
  background: "#f6f7ff",
  border: "1px solid #dfe3ff",
  borderRadius: 12,
  padding: 12,
};

const errText = { marginTop: 6, color: "#a11", fontSize: 12 };
