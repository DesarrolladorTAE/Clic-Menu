import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getPlans } from "../../services/owner/plan.service";
import {
  getRestaurantSubscriptionStatus,
  subscribeRestaurant,
} from "../../services/restaurant/restaurant.service";

export default function RestaurantPlans() {
  const nav = useNavigate();
  const { restaurantId } = useParams();
  const location = useLocation();

  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyPlanId, setBusyPlanId] = useState(null);
  const [err, setErr] = useState("");

  // ✅ NUEVO: aviso que viene desde MyRestaurants (location.state)
  const notice = location?.state?.notice || "";
  const noticeCode = location?.state?.code || null;
  const noticeMeta = location?.state?.meta || null;

  const isOperational = status?.is_operational === true;
  const currentPlanSlug = status?.subscription?.plan?.slug || null;
  const currentEndsAt = status?.subscription?.ends_at || null;

  const canChangeNow = useMemo(() => {
    // Solo deja cambiar antes de vencer si es DEMO.
    if (!status?.subscription?.plan?.slug) return true;
    return status.subscription.plan.slug === "demo";
  }, [status]);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const [plansRes, stRes] = await Promise.all([
        getPlans(),
        getRestaurantSubscriptionStatus(restaurantId),
      ]);
      setPlans(plansRes || []);
      setStatus(stRes || null);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar los planes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [restaurantId]);

  // ✅ NUEVO: limpiar el state del notice después de mostrarlo
  // (para que si recargas o vuelves, no siga ahí)
  useEffect(() => {
    if (notice) {
      nav(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo al montar

  const onSubscribe = async (planId) => {
    setErr("");
    setBusyPlanId(planId);
    try {
      await subscribeRestaurant(restaurantId, {
        plan_id: planId,
        provider: "manual",
        months_paid: 1,
        months_granted: 1,
      });

      // refrescar estado y lista
      await load();

      // Si ya quedó operativo, lo regresamos a Mis restaurantes
      const newStatus = await getRestaurantSubscriptionStatus(restaurantId);
      if (newStatus?.is_operational) {
        nav("/owner/restaurants", { replace: true });
      }
    } catch (e) {
      const code = e?.response?.data?.code;
      const msg =
        e?.response?.data?.message ||
        (code === "PLAN_CHANGE_NOT_ALLOWED_UNTIL_EXPIRES"
          ? "No puedes cambiar de plan hasta que termine tu suscripción actual."
          : "No se pudo contratar el plan.");
      setErr(msg);
    } finally {
      setBusyPlanId(null);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando planes...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Planes del restaurante</h2>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Restaurante ID: <strong>{restaurantId}</strong>
          </div>
        </div>

        <button
          onClick={() => nav("/owner/restaurants")}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          ← Volver
        </button>
      </div>

      {/* ✅ NUEVO: Aviso por límite / bloqueado */}
      {notice && (
        <div
          style={{
            marginTop: 14,
            background: "#fff3cd",
            border: "1px solid rgba(0,0,0,0.08)",
            padding: 12,
            borderRadius: 10,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6 }}>
            Atención
          </div>
          <div style={{ opacity: 0.95 }}>{notice}</div>

          {/* opcional: mostrar contexto si viene meta */}
          {noticeCode === "BRANCH_LIMIT_REACHED" && noticeMeta && (
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
              Límite actual: <strong>{noticeMeta.max_branches}</strong> · Activas:{" "}
              <strong>{noticeMeta.active_branches}</strong>
            </div>
          )}
        </div>
      )}

      {/* Estado */}
      <div
        style={{
          marginTop: 14,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 10,
        }}
      >
        <div style={{ fontWeight: 700 }}>
          Estado:{" "}
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 999,
              fontSize: 12,
              border: "1px solid rgba(0,0,0,0.08)",
              background: isOperational ? "#e6ffed" : "#ffe5e5",
              color: isOperational ? "#0a7a2f" : "#a10000",
            }}
          >
            {isOperational ? "Operativo" : "Bloqueado"}
          </span>
        </div>

        <div style={{ marginTop: 8, opacity: 0.9 }}>
          Plan actual: <strong>{currentPlanSlug || "Ninguno"}</strong>
          {currentEndsAt ? (
            <>
              {" "}
              · Vence: <strong>{String(currentEndsAt)}</strong>
            </>
          ) : null}
        </div>

        {!canChangeNow && (
          <div
            style={{
              marginTop: 10,
              background: "#fff3cd",
              padding: 10,
              borderRadius: 8,
            }}
          >
            Tu plan actual <strong>no es DEMO</strong>. Solo podrás cambiar de plan cuando
            termine la duración.
          </div>
        )}
      </div>

      {err && (
        <div style={{ marginTop: 14, background: "#ffe5e5", padding: 10 }}>
          {err}
        </div>
      )}

      {/* Lista planes */}
      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {plans.map((p) => {
          const isCurrent = p.slug === currentPlanSlug;
          const isDisabled =
            busyPlanId !== null ||
            isCurrent ||
            (!canChangeNow && currentPlanSlug && currentPlanSlug !== "demo");

          return (
            <div
              key={p.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>
                    {p.name}{" "}
                    <span style={{ opacity: 0.7, fontWeight: 600 }}>({p.slug})</span>
                  </div>
                  {p.description && <div style={{ marginTop: 6 }}>{p.description}</div>}
                  <div style={{ marginTop: 8, opacity: 0.9 }}>
                    Sucursales:{" "}
                    <strong>
                      {p.max_branches === null ? "Ilimitadas" : p.max_branches}
                    </strong>
                    {" · "}
                    Precio:{" "}
                    <strong>
                      {p.monthly_price === null ? "Desde" : `$${p.monthly_price}`}{" "}
                      {p.currency || "MXN"}
                    </strong>
                  </div>

                  {Array.isArray(p.includes) && p.includes.length > 0 && (
                    <ul style={{ marginTop: 10 }}>
                      {p.includes.map((it, idx) => (
                        <li key={idx}>{it}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div style={{ minWidth: 160, display: "flex", flexDirection: "column", gap: 8 }}>
                  {isCurrent ? (
                    <button
                      disabled
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: "#eee",
                        cursor: "not-allowed",
                      }}
                    >
                      Plan actual
                    </button>
                  ) : (
                    <button
                      onClick={() => onSubscribe(p.id)}
                      disabled={isDisabled}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        opacity: isDisabled ? 0.6 : 1,
                      }}
                    >
                      {busyPlanId === p.id ? "Contratando..." : "Contratar"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
