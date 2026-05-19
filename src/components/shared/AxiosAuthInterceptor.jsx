// src/components/AxiosAuthInterceptor.jsx
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import api from "../../services/api"; // OWNER api (tu actual)
import staffApi from "../../services/staffApi"; // STAFF api (ajusta si tu ruta es distinta)

import { useAuth } from "../../context/AuthContext";
import { useStaffAuth } from "../../context/StaffAuthContext"; // ajusta si tu contexto está en otra ruta

export default function AxiosAuthInterceptor() {
  const navigate = useNavigate();
  const location = useLocation();

  const { clearAuth } = useAuth();
  const { clearStaff } = useStaffAuth() || {};

  // Interceptors ids
  const ownerInterceptorId = useRef(null);
  const staffInterceptorId = useRef(null);

  // Evitar loops de redirección
  const redirectingOwner = useRef(false);
  const redirectingStaff = useRef(false);

  useEffect(() => {
    // ---------------------------------------
    // OWNER interceptor (tu lógica + pulida)
    // ---------------------------------------
    if (ownerInterceptorId.current === null) {
      ownerInterceptorId.current = api.interceptors.response.use(
        (response) => response,
        (error) => {
          const status = error?.response?.status;
          const reqUrl = (error?.config?.url || "").toString();
          const msg = String(error?.response?.data?.message || "");

          if (!status) return Promise.reject(error);

          const isAuthEndpoint =
            reqUrl.includes("/login") ||
            reqUrl.includes("/register") ||
            reqUrl.includes("/password/") ||
            reqUrl.includes("/terms/accept");

          const isAuthRoute =
            location.pathname.startsWith("/auth/login") ||
            location.pathname.startsWith("/auth/register");

          const from = location.pathname + location.search;

          // ✅ Caso A: 401 => login (OWNER)
          if (status === 401 && !isAuthEndpoint) {
            if (redirectingOwner.current) return Promise.reject(error);
            redirectingOwner.current = true;

            sessionStorage.setItem("auth_from", from);
            clearAuth?.();

            if (!isAuthRoute) {
              navigate("/auth/login", { replace: true, state: { from } });
            }

            setTimeout(() => (redirectingOwner.current = false), 300);
            return Promise.reject(error);
          }

          // ✅ Caso B: 403 => si NO hay token o dice unauthenticated => login
          if (status === 403 && !isAuthEndpoint) {
            const token = localStorage.getItem("auth_token");
            const lowerMsg = msg.toLowerCase();

            const isActuallyUnauth = !token || lowerMsg.includes("unauthenticated");

            if (isActuallyUnauth) {
              if (redirectingOwner.current) return Promise.reject(error);
              redirectingOwner.current = true;

              sessionStorage.setItem("auth_from", from);
              clearAuth?.();

              if (!isAuthRoute) {
                navigate("/auth/login", { replace: true, state: { from } });
              }

              setTimeout(() => (redirectingOwner.current = false), 300);
              return Promise.reject(error);
            }

            // 🔥 Token existe => No es sesión muerta, es NO PERMITIDO
            navigate("/owner/restaurants-home", {
              replace: true,
              state: { notice: "No tienes permisos para acceder a ese recurso." },
            });

            return Promise.reject(error);
          }

          return Promise.reject(error);
        }
      );
    }

    // ---------------------------------------
    // STAFF interceptor (MISMA IDEA, OTRO TOKEN, OTRA RUTA)
    // ---------------------------------------
    if (staffInterceptorId.current === null) {
      staffInterceptorId.current = staffApi.interceptors.response.use(
        (response) => response,
        (error) => {
          const status = error?.response?.status;
          const reqUrl = (error?.config?.url || "").toString();
          const msg = String(error?.response?.data?.message || "");
          const data = error?.response?.data;

          if (!status) return Promise.reject(error);

          const isStaffEndpoint =
            reqUrl.includes("/staff/login") ||
            reqUrl.includes("/staff/logout");

          const isStaffRoute = location.pathname.startsWith("/staff/");

          const from = location.pathname + location.search;

          // ✅ Caso A: 401 => login staff
          if (status === 401 && !isStaffEndpoint) {
            if (redirectingStaff.current) return Promise.reject(error);
            redirectingStaff.current = true;

            // Solo guarda from si estabas en zona staff
            if (isStaffRoute) sessionStorage.setItem("staff_from", from);

            // Limpia token y cache staff
            localStorage.removeItem("staff_token");
            sessionStorage.removeItem("staff_user");
            sessionStorage.removeItem("staff_active_context");
            clearStaff?.();

            // Redirige a login staff (si no estás ya ahí)
            if (!location.pathname.startsWith("/staff/login")) {
              navigate("/staff/login", { replace: true, state: { from: isStaffRoute ? from : "/staff/app" } });
            }

            setTimeout(() => (redirectingStaff.current = false), 300);
            return Promise.reject(error);
          }

          // ✅ Caso B: 403 => si NO hay token o dice unauthenticated => login staff
          if (status === 403 && !isStaffEndpoint) {
            const token = localStorage.getItem("staff_token");
            const lowerMsg = msg.toLowerCase();

            const isActuallyUnauth = !token || lowerMsg.includes("unauthenticated");

            if (isActuallyUnauth) {
              if (redirectingStaff.current) return Promise.reject(error);
              redirectingStaff.current = true;

              if (isStaffRoute) sessionStorage.setItem("staff_from", from);

              localStorage.removeItem("staff_token");
              sessionStorage.removeItem("staff_user");
              sessionStorage.removeItem("staff_active_context");
              clearStaff?.();

              if (!location.pathname.startsWith("/staff/login")) {
                navigate("/staff/login", { replace: true, state: { from: isStaffRoute ? from : "/staff/app" } });
              }

              setTimeout(() => (redirectingStaff.current = false), 300);
              return Promise.reject(error);
            }

            // 🔥 Token existe => es “no permitido” dentro de staff.
            // Casos típicos:
            // - staff.branch faltante (a veces backend puede responder 403)
            // - no assigned / no waiter
            // Para esos casos, mandamos al selector o a login según code.
            const code = String(data?.code || "").toUpperCase();

            if (code === "NO_WAITER_ASSIGNMENT") {
              // No tiene asignación, lo sacamos al login staff con mensaje (si tienes UI)
              navigate("/staff/login", { replace: true });
              return Promise.reject(error);
            }

            // Si está en staff, intenta llevarlo a un lugar “válido”
            // Si el problema es contexto/sucursal, lo mandamos a seleccionar.
            if (isStaffRoute) {
              navigate("/staff/select-branch", {
                replace: true,
                state: { notice: "Selecciona una sucursal para continuar." },
              });
            } else {
              // si estaba fuera de staff, no lo muevas
            }

            return Promise.reject(error);
          }

          // ✅ Caso C (opcional pero útil): 409 = NO_ACTIVE_CONTEXT -> selector
          if (status === 409 && isStaffRoute && !isStaffEndpoint) {
            // backend manda 409 si no hay turno activo
            navigate("/staff/select-branch", { replace: true });
            return Promise.reject(error);
          }

          return Promise.reject(error);
        }
      );
    }

    return () => {
      // Limpiar ambos interceptors
      if (ownerInterceptorId.current !== null) {
        api.interceptors.response.eject(ownerInterceptorId.current);
        ownerInterceptorId.current = null;
      }
      if (staffInterceptorId.current !== null) {
        staffApi.interceptors.response.eject(staffInterceptorId.current);
        staffInterceptorId.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}