import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getStaff, deleteStaff } from "../../services/staff/staff.service";

import StaffUpsertModal from "../../components/staff/StaffUpsertModal";
import StaffAssignmentsModal from "../../components/staff/StaffAssignmentsModal";

const CHIP = {
  active: { bg: "#e6ffed", border: "#8ae99c", label: "Activo" },
  inactive: { bg: "#ffe5e5", border: "#ff9b9b", label: "Inactivo" },
};

export default function StaffPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  // modales
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUser, setAssignUser] = useState(null);

  const title = useMemo(() => `Empleados`, [restaurantId]);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const list = await getStaff(restaurantId);
      setItems(list);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar los empleados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [restaurantId]);

  const onCreate = () => {
    setEditing(null);
    setUpsertOpen(true);
  };

  const onEdit = (row) => {
    setEditing(row);
    setUpsertOpen(true);
  };

  const onAssignments = (row) => {
    setAssignUser(row);
    setAssignOpen(true);
  };

  const onDelete = async (row) => {
    const ok = window.confirm(`¿Eliminar a ${row?.name || "este empleado"}?`);
    if (!ok) return;

    try {
      await deleteStaff(restaurantId, row.id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo eliminar");
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Crea cuentas de staff y administra sus asignaciones por sucursal.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => nav(`/owner/restaurants/${restaurantId}/settings`)}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            ← Volver
          </button>

          <button onClick={onCreate} style={{ padding: "10px 14px", cursor: "pointer" }}>
            + Crear empleado
          </button>
        </div>
      </div>

      {err && (
        <div style={{ marginTop: 12, background: "#ffe5e5", padding: 10, borderRadius: 10 }}>
          <strong>Error:</strong> {err}
        </div>
      )}

      <div style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 10, overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: 14 }}>Cargando empleados…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 14, opacity: 0.85 }}>No se tienen empleados registrados.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 880 }}>
            <thead>
              <tr style={{ background: "#f6f7ff" }}>
                <Th>Nombre</Th>
                <Th>Apellido paterno</Th>
                <Th>Apellido materno</Th>
                <Th>Teléfono</Th>
                <Th>Email</Th>
                <Th>Estatus</Th>
                <Th style={{ textAlign: "right" }}>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => {
                const chip = CHIP[r.status] || CHIP.active;
                return (
                  <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
                    <Td>{r.name}</Td>
                    <Td>{r.last_name_paternal}</Td>
                    <Td>{r.last_name_maternal || "—"}</Td>
                    <Td>{r.phone}</Td>
                    <Td>{r.email}</Td>
                    <Td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: chip.bg,
                          border: `1px solid ${chip.border}`,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {chip.label}
                      </span>
                    </Td>
                    <Td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button onClick={() => onAssignments(r)} style={btnMini}>
                        Asignación
                      </button>{" "}
                      <button onClick={() => onEdit(r)} style={btnMini}>
                        Editar
                      </button>{" "}
                      <button onClick={() => onDelete(r)} style={{ ...btnMini, color: "#a11" }}>
                        Borrar
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear/editar staff (1/2 + 2/2 dentro) */}
      <StaffUpsertModal
        open={upsertOpen}
        onClose={() => setUpsertOpen(false)}
        restaurantId={restaurantId}
        editing={editing}
        onSaved={async () => {
          setUpsertOpen(false);
          await load();
        }}
      />

      {/* Modal asignaciones */}
      <StaffAssignmentsModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        restaurantId={restaurantId}
        user={assignUser}
      />
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

const btnMini = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};
