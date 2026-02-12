import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyRestaurants,
  deleteRestaurant,
  getRestaurantSubscriptionStatus,
  setRestaurantMainBranch,
} from "../../services/restaurant.service";

import { getBranchesByRestaurant, deleteBranch } from "../../services/branch.service";
import { getRestaurantSettings } from "../../services/restaurantSettings.service";

import { useAuth } from "../../context/AuthContext";
import { handleRestaurantApiError } from "../../utils/subscriptionGuards";

import RestaurantFormModal from "../../components/restaurant/RestaurantFormModal";

// ✅ Toast simple sin librerías (porque la vida es dura)
function Toast({ open, message, type = "info", onClose }) {
  if (!open) return null;

  const bg =
    type === "success"
      ? "#e6ffed"
      : type === "warning"
      ? "#fff3cd"
      : type === "error"
      ? "#ffe5e5"
      : "#eef2ff";

  const border =
    type === "success"
      ? "#8ae99c"
      : type === "warning"
      ? "#ffe08a"
      : type === "error"
      ? "#ffb3b3"
      : "#cfcfff";

  const color =
    type === "success"
      ? "#0a7a2f"
      : type === "warning"
      ? "#8a6d3b"
      : type === "error"
      ? "#a10000"
      : "#2d2d7a";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 99999,
        maxWidth: 420,
        background: bg,
        border: `1px solid ${border}`,
        color,
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
        cursor: "pointer",
        whiteSpace: "pre-line",
      }}
      title="Clic para cerrar"
    >
      <div style={{ fontWeight: 900, marginBottom: 6 }}>
        {type === "warning"
          ? "Ojo"
          : type === "error"
          ? "Error"
          : type === "success"
          ? "Listo"
          : "Aviso"}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.35 }}>{message}</div>
      <div style={{ marginTop: 8, fontSize: 11, opacity: 0.75 }}>
        (clic para cerrar)
      </div>
    </div>
  );
}

export default function MyRestaurants() {
  const nav = useNavigate();
  const { user, logout } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // cache de sucursales por restaurantId
  const [branchesMap, setBranchesMap] = useState({});
  const [openRestaurantId, setOpenRestaurantId] = useState(null);

  // Estado operativo por restaurante
  const [statusMap, setStatusMap] = useState({});

  // Estado para sucursal principal por restaurante
  const [mainBranchMap, setMainBranchMap] = useState({});

  // settings cache por restaurante (para products_mode)
  const [settingsMap, setSettingsMap] = useState({}); // { [restaurantId]: { products_mode } }

  // ✅ MODAL create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // ✅ TOAST
  const [toast, setToast] = useState({ open: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ open: true, message, type });
    // auto-cierre
    setTimeout(() => setToast((t) => ({ ...t, open: false })), 5000);
  };
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const openCreate = () => {
    setSelectedRestaurant(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEdit = (restaurant) => {
    setSelectedRestaurant(restaurant || null);
    setModalMode("edit");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRestaurant(null);
  };

  const load = async () => {
    setErr("");
    setLoading(true);

    try {
      const res = await getMyRestaurants();
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setItems(list);

      // main branch map
      const mainMap = {};
      list.forEach((r) => {
        mainMap[r.id] = r.main_branch_id ?? null;
      });
      setMainBranchMap(mainMap);

      // Carga estado operativo por restaurante
      try {
        const pairs = await Promise.all(
          list.map(async (r) => {
            const st = await getRestaurantSubscriptionStatus(r.id);
            return [r.id, st];
          })
        );
        setStatusMap(Object.fromEntries(pairs));
      } catch (e) {
        console.log("No se pudieron cargar estados de suscripción", {
          message: e?.message,
          status: e?.response?.status,
          data: e?.response?.data,
        });
      }

      // Cargar settings mínimos (products_mode)
      try {
        const settingsPairs = await Promise.all(
          list.map(async (r) => {
            const st = await getRestaurantSettings(r.id);
            return [r.id, st];
          })
        );
        setSettingsMap(Object.fromEntries(settingsPairs));
      } catch (e) {
        console.log("No se pudieron cargar settings de restaurantes", e?.response?.data || e?.message);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar restaurantes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ownerName = user
    ? [user.name, user.last_name_paternal, user.last_name_maternal].filter(Boolean).join(" ")
    : "";

  const onDelete = async (id) => {
    if (!confirm("¿Eliminar este restaurante?")) return;
    try {
      await deleteRestaurant(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo eliminar");
    }
  };

  const toggleBranches = async (restaurantId) => {
    if (openRestaurantId === restaurantId) {
      setOpenRestaurantId(null);
      return;
    }

    setOpenRestaurantId(restaurantId);

    if (branchesMap[restaurantId]) return;

    try {
      const list = await getBranchesByRestaurant(restaurantId);
      setBranchesMap((prev) => ({ ...prev, [restaurantId]: list }));
    } catch (e) {
      const redirected = handleRestaurantApiError(e, nav, restaurantId);
      if (!redirected) {
        alert(e?.response?.data?.message || "No se pudieron cargar sucursales");
      }
    }
  };

  const onDeleteBranch = async (restaurantId, branchId) => {
    if (!confirm("¿Eliminar esta sucursal?")) return;
    try {
      await deleteBranch(restaurantId, branchId);

      const list = await getBranchesByRestaurant(restaurantId);
      setBranchesMap((prev) => ({ ...prev, [restaurantId]: list }));
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo eliminar sucursal");
    }
  };

  // Cambiar sucursal principal
  const onSetMainBranch = async (restaurantId, branchId) => {
    try {
      await setRestaurantMainBranch(restaurantId, branchId);

      // UI inmediata
      setMainBranchMap((prev) => ({ ...prev, [restaurantId]: branchId }));

      // refrescar sucursales (por si backend ajustó status)
      const list = await getBranchesByRestaurant(restaurantId);
      setBranchesMap((prev) => ({ ...prev, [restaurantId]: list }));
    } catch (e) {
      const redirected = handleRestaurantApiError(e, nav, restaurantId);
      if (!redirected) {
        alert(e?.response?.data?.message || "No se pudo actualizar la sucursal principal");
      }
    }
  };

  // Antes de ir al form, checa si puede crear
  const onClickCreateBranch = async (restaurantId) => {
    try {
      // 1) Asegurar status
      let st = statusMap[restaurantId];
      if (!st) {
        st = await getRestaurantSubscriptionStatus(restaurantId);
        setStatusMap((prev) => ({ ...prev, [restaurantId]: st }));
      }

      // 2) Si NO operativo: manda a planes directo
      if (st?.is_operational !== true) {
        nav(`/owner/restaurants/${restaurantId}/plans`, {
          state: {
            notice: "Este restaurante está bloqueado. Contrata un plan para operar.",
            code: st?.code || "SUBSCRIPTION_REQUIRED",
          },
        });
        return;
      }

      // 3) Si hay límite de sucursales (max_branches !== null), validar contra activas
      const max = st?.subscription?.plan?.max_branches ?? null; // null = ilimitado
      if (max !== null) {
        let branches = branchesMap[restaurantId];

        // si no están cargadas, las pedimos
        if (!branches) {
          branches = await getBranchesByRestaurant(restaurantId);
          setBranchesMap((prev) => ({ ...prev, [restaurantId]: branches }));
        }

        const activeCount = (branches || []).filter((b) => b.status === "active").length;

        if (activeCount >= Number(max)) {
          nav(`/owner/restaurants/${restaurantId}/plans`, {
            state: {
              notice: "Excedió su límite máximo de sucursales. Actualice su plan para crear más.",
              code: "BRANCH_LIMIT_REACHED",
              meta: { max_branches: Number(max), active_branches: activeCount },
            },
          });
          return;
        }
      }

      // 4) OK
      nav(`/owner/restaurants/${restaurantId}/branches/new`);
    } catch (e) {
      nav(`/owner/restaurants/${restaurantId}/branches/new`);
    }
  };

  // ir al Catálogo de la sucursal (Paso 2)
  const onGoCatalog = async (restaurantId, branchId) => {
    try {
      // asegurar status y bloquear si no operativo
      let st = statusMap[restaurantId];
      if (!st) {
        st = await getRestaurantSubscriptionStatus(restaurantId);
        setStatusMap((prev) => ({ ...prev, [restaurantId]: st }));
      }

      if (st?.is_operational !== true) {
        nav(`/owner/restaurants/${restaurantId}/plans`, {
          state: {
            notice: "Este restaurante está bloqueado. Contrata un plan para operar.",
            code: st?.code || "SUBSCRIPTION_REQUIRED",
          },
        });
        return;
      }

      // settings
      let cfg = settingsMap[restaurantId];
      if (!cfg) {
        cfg = await getRestaurantSettings(restaurantId);
        setSettingsMap((prev) => ({ ...prev, [restaurantId]: cfg }));
      }

      nav(`/owner/restaurants/${restaurantId}/branches/${branchId}/catalog`, {
        state: { products_mode: cfg?.products_mode || "global" },
      });
    } catch (e) {
      nav(`/owner/restaurants/${restaurantId}/branches/${branchId}/catalog`);
    }
  };

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      nav("/auth/login", { replace: true });
    }
  };

  const onModalSaved = async (payload) => {
    // refrescar lista
    await load();

    // ✅ warnings => toast (bonito) NO alert
    const w = payload?.warnings;
    if (Array.isArray(w) && w.length) {
      const txt = w.map((x) => `• ${x?.message || "Dato repetido"}`).join("\n");
      showToast(`Se guardó, pero ojo:\n${txt}`, "warning");
    } else {
      showToast("Guardado correctamente.", "success");
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando restaurantes...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={closeToast} />

      <RestaurantFormModal
        open={modalOpen}
        mode={modalMode}
        restaurant={selectedRestaurant}
        onClose={closeModal}
        onSaved={onModalSaved}
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Mis restaurantes</h2>

          {ownerName && (
            <div style={{ marginTop: 6, opacity: 0.85 }}>
              Propietario: <strong>{ownerName}</strong>
            </div>
          )}
        </div>

        <button onClick={openCreate} style={{ padding: "10px 14px", cursor: "pointer" }}>
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
            const rid = r.id;
            const isOpen = openRestaurantId === rid;
            const branches = branchesMap[rid] || [];

            const st = statusMap[rid];
            const isOperational = st?.is_operational === true;
            const code = st?.code;

            const maxBranches = st?.subscription?.plan?.max_branches ?? null;
            const isSingleBranchPlan = maxBranches === 1;

            const badgeText = !st
              ? "Verificando plan..."
              : isOperational
              ? "Operativo"
              : code === "RESTAURANT_SUSPENDED"
              ? "Suspendido"
              : "Bloqueado";

            const badgeBg = !st
              ? "#eee"
              : isOperational
              ? "#e6ffed"
              : code === "RESTAURANT_SUSPENDED"
              ? "#fff3cd"
              : "#ffe5e5";

            const badgeColor = !st
              ? "#333"
              : isOperational
              ? "#0a7a2f"
              : code === "RESTAURANT_SUSPENDED"
              ? "#8a6d3b"
              : "#a10000";

            const mainId = mainBranchMap[rid] ?? null;
            const productsMode = settingsMap[rid]?.products_mode || "global";

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
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      {r.trade_name || "Sin nombre"}
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: badgeBg,
                          color: badgeColor,
                          border: "1px solid rgba(0,0,0,0.08)",
                        }}
                      >
                        {badgeText}
                      </span>

                      {isSingleBranchPlan && (
                        <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.85 }}>
                          (Plan 1 sucursal: la principal es la operativa)
                        </span>
                      )}

                      <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.85 }}>
                        Modo productos: <strong>{productsMode}</strong>
                      </span>
                    </div>

                    <div style={{ opacity: 0.8, marginTop: 4 }}>
                      {r.contact_phone || "Sin teléfono"} · {r.contact_email || "Sin email"}
                    </div>
                    {r.description && <div style={{ marginTop: 6 }}>{r.description}</div>}
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                    <button
                      onClick={() => openEdit(r)}
                      style={{ padding: "8px 10px", cursor: "pointer" }}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => nav(`/owner/restaurants/${rid}/settings`)}
                      style={{ padding: "8px 10px", cursor: "pointer" }}
                    >
                      Administrar
                    </button>

                    <button
                      onClick={() => nav(`/owner/restaurants/${rid}/menu`)}
                      style={{ padding: "8px 10px", cursor: "pointer" }}
                    >
                      Menú
                    </button>

                    <button
                      onClick={() => nav(`/owner/restaurants/${rid}/settings/ingredients`)}
                      style={{ padding: "8px 10px", cursor: "pointer" }}
                    >
                      Ingredientes
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

                    <button
                      onClick={() => nav(`/owner/restaurants/${rid}/plans`)}
                      style={{ padding: "8px 10px", cursor: "pointer" }}
                    >
                      {isOperational ? "Cambiar plan" : "Ver planes / Contratar"}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #eee" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <h3 style={{ margin: 0 }}>Sucursales</h3>

                      <button
                        onClick={() => onClickCreateBranch(rid)}
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
                        {branches.map((b) => {
                          const isMain = mainId === b.id;

                          return (
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
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>
                                  {b.name || "Sucursal sin nombre"}
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    gap: 8,
                                    alignItems: "center",
                                    marginTop: 6,
                                  }}
                                >
                                  {isMain ? (
                                    <span
                                      style={{
                                        fontSize: 12,
                                        padding: "3px 8px",
                                        borderRadius: 999,
                                        background: "#e6ffed",
                                        border: "1px solid #8ae99c",
                                        fontWeight: 700,
                                      }}
                                    >
                                      Principal
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => onSetMainBranch(rid, b.id)}
                                      style={{
                                        padding: "6px 10px",
                                        cursor: "pointer",
                                        background: "#f0f0ff",
                                        border: "1px solid #cfcfff",
                                        borderRadius: 8,
                                      }}
                                    >
                                      Hacer principal
                                    </button>
                                  )}

                                  {b.status && (
                                    <span style={{ fontSize: 12, opacity: 0.85 }}>
                                      Estado: <strong>{b.status}</strong>
                                    </span>
                                  )}
                                </div>

                                <div style={{ opacity: 0.8, marginTop: 6 }}>
                                  {(b.phone || "Sin teléfono")} · {(b.address || "Sin dirección")}
                                </div>
                                <div style={{ opacity: 0.8, marginTop: 4 }}>
                                  {b.open_time ? `Abre: ${b.open_time}` : "Sin hora apertura"} {" · "}
                                  {b.close_time ? `Cierra: ${b.close_time}` : "Sin hora cierre"}
                                </div>
                              </div>

                              <div style={{ display: "flex", gap: 8, alignItems: "start", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                <button
                                  onClick={() => onGoCatalog(rid, b.id)}
                                  style={{
                                    padding: "8px 10px",
                                    cursor: "pointer",
                                    background: "#f3f3ff",
                                    border: "1px solid #d8d8ff",
                                  }}
                                  title={
                                    productsMode === "global"
                                      ? "Define qué productos globales vende esta sucursal"
                                      : "Define qué productos de esta sucursal se venden"
                                  }
                                >
                                  Catálogo
                                </button>

                                <button
                                  onClick={() => nav(`/owner/restaurants/${rid}/branches/${b.id}/sales-channels`)}
                                  style={{
                                    padding: "8px 10px",
                                    cursor: "pointer",
                                    background: "#f0f0ff",
                                    border: "1px solid #cfcfff",
                                    borderRadius: 8,
                                    fontWeight: 700,
                                  }}
                                >
                                  Canales de venta
                                </button>

                                <button
                                  onClick={() => nav(`/owner/restaurants/${rid}/branches/${b.id}/tables`)}
                                  style={{
                                    padding: "8px 10px",
                                    cursor: "pointer",
                                    background: "#eef2ff",
                                    border: "1px solid #cfcfff",
                                    borderRadius: 8,
                                    fontWeight: 900,
                                  }}
                                >
                                  Mesas
                                </button>


                                <button
                                  onClick={() => nav(`/owner/restaurants/${rid}/branches/${b.id}/edit`)}
                                  style={{ padding: "8px 10px", cursor: "pointer" }}
                                >
                                  Editar
                                </button>

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
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={onLogout} style={{ padding: "10px 14px", cursor: "pointer" }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
