//Estructura de MisRestaurantes
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyRestaurants,
  deleteRestaurant,
} from "../../services/restaurant.service";
import { useAuth } from "../../context/AuthContext";

export default function MyRestaurants() {
  const nav = useNavigate();
  const {user, logout}=useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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

  //Constante para eliminar 
  const onDelete = async (id) => {
    if (!confirm("¿Eliminar este restaurante?")) return;
    try {
      await deleteRestaurant(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo eliminar");
    }
  };

  //Constante para cerrar sesion
  const onLogout = async () => {
    try {
        await logout(); // esto llama a authService.logout() y limpia user
    } finally {
        nav("/auth/login", { replace: true });
    }
  };

  //Constante para Nombre propietario
  const ownerName = user
    ? [user.name, user.last_name_paternal, user.last_name_maternal]
        .filter(Boolean)
        .join(" ")
    : "";



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
          {items.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 14,
                marginBottom: 12,
              }}
            >
               {/* Datos a mostrar */}  
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    {r.trade_name || "Sin nombre"}
                  </div>
                  <div style={{ opacity: 0.8, marginTop: 4 }}>
                    {r.contact_phone || "Sin teléfono"} ·{" "}
                    {r.contact_email || "Sin email"}
                  </div>
                  {r.description && (
                    <div style={{ marginTop: 6 }}>{r.description}</div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                  <button
                    onClick={() => nav(`/owner/restaurants/${r.id}/edit`)}
                    style={{ padding: "8px 10px", cursor: "pointer" }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(r.id)}
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
            </div>
          ))}
        </div>
      )}
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
