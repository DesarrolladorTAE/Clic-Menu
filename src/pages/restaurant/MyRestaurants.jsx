//Estructura de MisRestaurantes
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyRestaurants,
  deleteRestaurant,
} from "../../services/restaurant.service";
import { getBranchesByRestaurant, deleteBranch } from "../../services/branch.service";
import { useAuth } from "../../context/AuthContext";

export default function MyRestaurants() {
  const nav = useNavigate();
  const {user, logout}=useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // cache de sucursales por restaurantId
  const [branchesMap, setBranchesMap] = useState({});
  const [openRestaurantId, setOpenRestaurantId] = useState(null);

  //Constante para cargar/ cargando
  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await getMyRestaurants();
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setItems(list);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar restaurantes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  //Constante para Nombre propietario
  const ownerName = user
    ? [user.name, user.last_name_paternal, user.last_name_maternal]
        .filter(Boolean)
        .join(" ")
    : "";

  //Constante para eliminar Restaurante
  const onDelete = async (id) => {
    if (!confirm("¿Eliminar este restaurante?")) return;
    try {
      await deleteRestaurant(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo eliminar");
    }
  };

  //Constante para Barrita de sucursales
  const toggleBranches = async (restaurantId) => {
    // cerrar si ya está abierto
    if (openRestaurantId === restaurantId) {
      setOpenRestaurantId(null);
      return;
    }

    setOpenRestaurantId(restaurantId);

    // si ya estan en cache, no vuelvo a pedir
    if (branchesMap[restaurantId]) return;

    try {
      const list = await getBranchesByRestaurant(restaurantId);
      setBranchesMap((prev) => ({ ...prev, [restaurantId]: list }));
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudieron cargar sucursales");
    }
  };

  //Constante para eliminar sucursales
  const onDeleteBranch = async (restaurantId, branchId) => {
    if (!confirm("¿Eliminar esta sucursal?")) return;
    try {
      await deleteBranch(restaurantId, branchId);
      // refrescar solo ese restaurant
      const list = await getBranchesByRestaurant(restaurantId);
      setBranchesMap((prev) => ({ ...prev, [restaurantId]: list }));
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo eliminar sucursal");
    }
  };


  //Constante para cerrar sesion
  const onLogout = async () => {
    try {
        await logout(); // Llama a authService.logout() y limpia user
    } finally {
        nav("/auth/login", { replace: true });
    }
  };



  if (loading) return <div style={{ padding: 16 }}>Cargando restaurantes...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
                <h2 style={{ margin: 0 }}>Mis restaurantes</h2>

                {ownerName && (
                <div style={{ marginTop: 6, opacity: 0.85 }}>
                    Propietario: <strong>{ownerName}</strong>
                </div>
                )}
            </div>

            <button
                onClick={() => nav("/owner/restaurants/new")}
                style={{ padding: "10px 14px", cursor: "pointer" }}
            >
                + Registrar restaurante
            </button>
         </div>


      {err && (
        <div style={{ background: "#ffe5e5", padding: 10, marginTop: 10 }}>
          {err}
        </div>
      )}

      {items.length === 0 ? (
        <div
          style={{
            marginTop: 18,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 10,
          }}
        >
          <h3>Aún no tienes restaurantes registrados</h3>
          <p>Registra tu primer restaurante para comenzar.</p>
    
        </div>
      ) : (


        <div style={{ marginTop: 18 }}>
            {items.map((r) => {
              const rid = r.id; // id del restaurante
              const isOpen = openRestaurantId === rid;
              const branches = branchesMap[rid] || [];

              return (
                <div
                  key={rid}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 12,
                  }}
                >
                  {/* Header restaurante */}
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>
                        {r.trade_name || "Sin nombre"}
                      </div>
                      <div style={{ opacity: 0.8, marginTop: 4 }}>
                        {r.contact_phone || "Sin teléfono"} ·{" "}
                        {r.contact_email || "Sin email"}
                      </div>
                      {r.description && <div style={{ marginTop: 6 }}>{r.description}</div>}
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                      <button
                        onClick={() => nav(`/owner/restaurants/${rid}/edit`)}
                        style={{ padding: "8px 10px", cursor: "pointer" }}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => onDelete(rid)}
                        style={{
                          padding: "8px 10px",
                          cursor: "pointer",
                          background: "#ffe5e5",
                        }}
                      >
                        Eliminar
                      </button>

                      <button
                        onClick={() => toggleBranches(rid)}
                        style={{ padding: "8px 10px", cursor: "pointer" }}
                      >
                        {isOpen ? "Ocultar sucursales" : "Ver sucursales"}
                      </button>
                    </div>
                  </div>

                  {/* Panel sucursales */}
                  {isOpen && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #eee" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <h3 style={{ margin: 0 }}>Sucursales</h3>

                        <button
                          onClick={() => nav(`/owner/restaurants/${rid}/branches/new`)}
                          style={{ padding: "8px 10px", cursor: "pointer" }}
                        >
                          + Registrar sucursal
                        </button>
                      </div>

                      {branches.length === 0 ? (
                        <div
                          style={{
                            marginTop: 12,
                            padding: 12,
                            border: "1px dashed #ccc",
                            borderRadius: 10,
                          }}
                        >
                          Aún no cuenta con sucursales registradas.
                        </div>
                      ) : (
                        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                          {branches.map((b) => (
                            <div
                              key={b.id}
                              style={{
                                padding: 12,
                                border: "1px solid #ddd",
                                borderRadius: 10,
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 700 }}>
                                  {b.name || "Sucursal sin nombre"}
                                </div>
                                <div style={{ opacity: 0.8, marginTop: 4 }}>
                                  {(b.phone || "Sin teléfono")} ·{" "}
                                  {(b.address || "Sin dirección")}
                                </div>
                                <div style={{ opacity: 0.8, marginTop: 4 }}>
                                  {b.open_time ? `Abre: ${b.open_time}` : "Sin hora apertura"}{" "}
                                  {" · "}
                                  {b.close_time ? `Cierra: ${b.close_time}` : "Sin hora cierre"}
                                </div>
                              </div>


                              {/* Editar sucursales */}
                              <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                                <button
                                  onClick={() =>
                                    nav(`/owner/restaurants/${rid}/branches/${b.id}/edit`)
                                  }
                                  style={{ padding: "8px 10px", cursor: "pointer" }}
                                >
                                  Editar
                                </button>

                                 {/* Eliminar sucursales */}
                                <button
                                  onClick={() => onDeleteBranch(rid, b.id)}
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
                  )}
                </div>
              );
            })}
 

        </div>
      )}


       {/* Boton cerrar sesion */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button
                onClick={onLogout}
                style={{ padding: "10px 14px", cursor: "pointer" }}
            >
                Cerrar sesión
            </button>
      </div>

    </div>
    
  );
}
