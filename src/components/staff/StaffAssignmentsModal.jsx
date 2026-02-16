import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { handleFormApiError } from "../../utils/useFormApiHandler";

import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../../services/staff/staffAssignments.service";

import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";
import { getRoles } from "../../services/staff/roles.service";

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "grid",
  placeItems: "center",
  zIndex: 60,
};

const modal = {
  width: "min(980px, 94vw)",
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #eaeaea",
  overflow: "hidden",
};

export default function StaffAssignmentsModal({ open, onClose, restaurantId, user }) {
  const userId = user?.id;

  const title = useMemo(() => `Asignaciones - ${user?.name || ""}`, [user?.name]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ msg SOLO para API / errores reales (no para conflictos)
  const [msg, setMsg] = useState("");

  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [rolesOp, setRolesOp] = useState([]);

  const [editing, setEditing] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      branch_id: "", // "" => null (todas)
      role_id: "",
      is_active: true,
    },
  });

  const wRoleId = watch("role_id");
  const wBranchId = watch("branch_id");
  const wIsActive = watch("is_active");

  // roles que ya están activos en "Todas"
  const allActiveRoleIds = useMemo(() => {
    const set = new Set();
    for (const it of items) {
      if (it?.is_active && it?.branch_id == null && it?.role_id) {
        set.add(String(it.role_id));
      }
    }
    // Si estás editando ese mismo registro "Todas", no te bloquees a ti mismo
    if (editing?.id && editing?.branch_id == null && editing?.role_id != null) {
      set.delete(String(editing.role_id));
    }
    return set;
  }, [items, editing]);

  // conflicto: rol ya activo en "Todas" + sucursal específica + activo
  const conflictsAllVsBranch = useMemo(() => {
    const roleIsAllActive = allActiveRoleIds.has(String(wRoleId || ""));
    const choosingSpecificBranch = wBranchId !== ""; // "" = Todas
    const wantsActive = !!wIsActive;
    return roleIsAllActive && choosingSpecificBranch && wantsActive;
  }, [allActiveRoleIds, wRoleId, wBranchId, wIsActive]);

  // ✅ TEXTO DERIVADO (NO se guarda en msg)
  const conflictText = useMemo(() => {
    if (!conflictsAllVsBranch) return "";
    const role = rolesOp.find((r) => String(r.id) === String(wRoleId));
    const roleLabel = role?.description || role?.name || "este rol";
    return `No puedes asignar ${roleLabel} por sucursal porque ya existe una asignación ACTIVA en "Todas" para el mismo rol.`;
  }, [conflictsAllVsBranch, rolesOp, wRoleId]);

  const load = async () => {
    if (!open || !restaurantId || !userId) return;

    setMsg("");
    setLoading(true);

    try {
      const [a, b, r] = await Promise.all([
        getAssignments(restaurantId, userId),
        getBranchesByRestaurant(restaurantId),
        getRoles({ scope: "operational" }),
      ]);

      setItems(Array.isArray(a) ? a : []);
      setBranches(Array.isArray(b) ? b : []);
      setRolesOp(Array.isArray(r) ? r : []);
    } catch (e) {
      setMsg(e?.response?.data?.message || "No se pudieron cargar las asignaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setEditing(null);
    setMsg("");
    reset({ branch_id: "", role_id: "", is_active: true });
    load();
    // eslint-disable-next-line
  }, [open, restaurantId, userId]);

  // ✅ Si el conflicto desaparece, limpia errores manuales relacionados
  useEffect(() => {
    if (!open) return;

    if (!conflictsAllVsBranch) {
      // si antes marcaste branch_id como error por conflicto, ya no aplica
      clearErrors("branch_id");
    }
    // eslint-disable-next-line
  }, [conflictsAllVsBranch, open]);

  if (!open) return null;

  const onEdit = (row) => {
    setMsg("");
    setEditing(row);
    reset({
      branch_id: row?.branch_id == null ? "" : String(row.branch_id),
      role_id: row?.role_id == null ? "" : String(row.role_id),
      is_active: !!row?.is_active,
    });
  };

  const onCancelEdit = () => {
    setEditing(null);
    setMsg("");
    reset({ branch_id: "", role_id: "", is_active: true });
  };

  const onDelete = async (row) => {
    if (!window.confirm("¿Eliminar esta asignación?")) return;

    try {
      await deleteAssignment(restaurantId, userId, row.id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo eliminar");
    }
  };

  const onSubmit = async (values) => {
    setMsg("");
    setSaving(true);

    try {
      const payload = {
        branch_id: values.branch_id === "" ? null : Number(values.branch_id),
        role_id: Number(values.role_id),
        is_active: !!values.is_active,
      };

      if (!payload.role_id || Number.isNaN(payload.role_id)) {
        setError("role_id", { type: "manual", message: "Selecciona un rol." });
        setSaving(false);
        return;
      }

      // ✅ bloqueo front: redundancia "Todas" vs sucursal
      if (conflictsAllVsBranch) {
        setError("branch_id", { type: "manual", message: conflictText });
        // ❌ ya NO hacemos setMsg(conflictText) porque eso lo vuelve pegajoso
        setSaving(false);
        return;
      }

      if (editing?.id) {
        await updateAssignment(restaurantId, userId, editing.id, payload);
      } else {
        await createAssignment(restaurantId, userId, payload);
      }

      onCancelEdit();
      await load();
    } catch (e) {
      handleFormApiError(e, setError, { onMessage: (m) => setMsg(m) });
    } finally {
      setSaving(false);
    }
  };

  // si rol está "bloqueado" por tener Todas activa, deshabilita sucursales específicas
  const disableSpecificBranches = allActiveRoleIds.has(String(wRoleId || "")) && !!wIsActive;

  // ✅ Banner: primero conflicto (si aplica), si no, msg (API)
  const bannerText = conflictText || msg;

  return (
    <div style={backdrop} onMouseDown={onClose}>
      <div style={modal} onMouseDown={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: 14,
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
            <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>
              Crea, edita o elimina asignaciones (Sucursal + Rol).
            </div>
          </div>

          <button onClick={onClose} style={{ ...btn, border: "1px solid #ddd" }}>
            ✕
          </button>
        </div>

        {bannerText && (
          <div style={{ padding: 12, background: "#fff3cd", borderBottom: "1px solid #ffeeba" }}>
            <strong>Nota:</strong> {bannerText}
          </div>
        )}

        <div style={{ padding: 14, display: "grid", gap: 14 }}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}
          >
            <div style={{ fontWeight: 900, marginBottom: 10 }}>
              {editing ? "Editar asignación" : "Nueva asignación"}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 140px",
                gap: 12,
                alignItems: "start",
              }}
            >
              <Field
                label="Sucursal"
                error={errors?.branch_id?.message}
                help={
                  disableSpecificBranches
                    ? 'Este rol ya está ACTIVO en "Todas". No se permiten sucursales específicas para el mismo rol.'
                    : null
                }
                input={
                  <select {...register("branch_id")}>
                    <option value="">Todas (sin sucursal)</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} disabled={disableSpecificBranches}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                }
              />

              <Field
                label="Rol operativo"
                error={errors?.role_id?.message}
                input={
                  <select {...register("role_id")}>
                    <option value="">Selecciona</option>
                    {rolesOp.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.description || r.name}
                      </option>
                    ))}
                  </select>
                }
              />

              <div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>Activo</div>
                <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
                  <input type="checkbox" {...register("is_active")} />
                  <span style={{ fontSize: 13 }}>Sí</span>
                </label>
                {errors?.is_active?.message && <div style={errText}>{errors.is_active.message}</div>}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
              {editing && (
                <button type="button" onClick={onCancelEdit} style={btn}>
                  Cancelar edición
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                style={{ ...btn, fontWeight: 900, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Guardando…" : editing ? "Guardar cambios" : "Agregar"}
              </button>
            </div>
          </form>

          <div style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "auto" }}>
            {loading ? (
              <div style={{ padding: 12 }}>Cargando asignaciones…</div>
            ) : items.length === 0 ? (
              <div style={{ padding: 12, opacity: 0.85 }}>Este empleado no tiene asignaciones registradas.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                <thead>
                  <tr style={{ background: "#f6f7ff" }}>
                    <Th>Sucursal</Th>
                    <Th>Rol</Th>
                    <Th>Activo</Th>
                    <Th style={{ textAlign: "right" }}>Acciones</Th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a) => (
                    <tr key={a.id} style={{ borderTop: "1px solid #eee" }}>
                      <Td>{a.branch_id ? (a.branch?.name || `#${a.branch_id}`) : "Todas"}</Td>
                      <Td>{a.role?.description || a.role?.name || `#${a.role_id}`}</Td>
                      <Td>{a.is_active ? "Sí" : "No"}</Td>
                      <Td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button onClick={() => onEdit(a)} style={btnMini}>
                          Editar
                        </button>{" "}
                        <button onClick={() => onDelete(a)} style={{ ...btnMini, color: "#a11" }}>
                          Eliminar
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Tip: Si un rol está ACTIVO en “Todas”, no se permite repetirlo por sucursal.
          </div>
        </div>
      </div>
    </div>
  );
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
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 10, padding: "10px 12px", background: "#fff" }}>
      <select {...node.props} style={{ width: "100%", border: "none", outline: "none", background: "transparent" }}>
        {node.props.children}
      </select>
    </div>
  );
}

function Th({ children, style }) {
  return (
    <th style={{ textAlign: "left", padding: 12, fontWeight: 800, fontSize: 13, ...style }}>
      {children}
    </th>
  );
}

function Td({ children, style }) {
  return <td style={{ padding: 12, fontSize: 13, ...style }}>{children}</td>;
}

const btn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

const btnMini = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

const errText = { marginTop: 6, color: "#a11", fontSize: 12 };
