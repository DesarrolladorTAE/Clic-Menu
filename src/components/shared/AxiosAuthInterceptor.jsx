// src/components/AxiosAuthInterceptor.jsx
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function AxiosAuthInterceptor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth } = useAuth();

  const interceptorId = useRef(null);
  const redirecting = useRef(false);

  useEffect(() => {
    if (interceptorId.current !== null) return;

    interceptorId.current = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const reqUrl = (error?.config?.url || "").toString();
        const msg = String(error?.response?.data?.message || "");

        if (!status) return Promise.reject(error);

        const isAuthEndpoint = reqUrl.includes("/login") || reqUrl.includes("/register");
        const isAuthRoute =
          location.pathname.startsWith("/auth/login") ||
          location.pathname.startsWith("/auth/register");

        const from = location.pathname + location.search;

        // ✅ Caso A: 401 => login
        if (status === 401 && !isAuthEndpoint) {
          if (redirecting.current) return Promise.reject(error);
          redirecting.current = true;

          sessionStorage.setItem("auth_from", from);
          clearAuth?.();

          if (!isAuthRoute) {
            navigate("/auth/login", { replace: true, state: { from } });
          }

          setTimeout(() => (redirecting.current = false), 300);
          return Promise.reject(error);
        }

        // ✅ Caso B: 403 => si NO hay token, entonces sí parece sesión muerta => login

        if (status === 403 && !isAuthEndpoint) {
          const token = localStorage.getItem("auth_token");
          const lowerMsg = msg.toLowerCase();

          const isActuallyUnauth =
            !token || lowerMsg.includes("unauthenticated");

          if (isActuallyUnauth) {
            if (redirecting.current) return Promise.reject(error);
            redirecting.current = true;

            sessionStorage.setItem("auth_from", from);
            clearAuth?.();

            if (!isAuthRoute) {
              navigate("/auth/login", { replace: true, state: { from } });
            }

            setTimeout(() => (redirecting.current = false), 300);
            return Promise.reject(error);
          }

          // 🔥 Token existe: NO es “no logueado”, es “no permitido”.
          // Mantén sesión y llévalo a un lugar válido para ese usuario.
          navigate("/owner/restaurants", {
            replace: true,
            state: { notice: "No tienes permisos para acceder a ese recurso." },
          });

          return Promise.reject(error);
        }


        return Promise.reject(error);
      }
    );

    return () => {
      if (interceptorId.current !== null) {
        api.interceptors.response.eject(interceptorId.current);
        interceptorId.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
