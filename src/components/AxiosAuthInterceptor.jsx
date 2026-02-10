import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AxiosAuthInterceptor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth } = useAuth();

  const interceptorId = useRef(null);
  const redirecting = useRef(false);

  useEffect(() => {
    // Evita duplicados (React StrictMode monta/desmonta en dev)
    if (interceptorId.current !== null) return;

    interceptorId.current = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const reqUrl = (error?.config?.url || "").toString();

        // Si no hay status (network error), no hacemos nada aquí
        if (!status) return Promise.reject(error);

        // Ignora 401 de login/register (si credenciales mal, no queremos loop)
        const isAuthEndpoint =
          reqUrl.includes("/login") || reqUrl.includes("/register");

        const isAuthRoute =
          location.pathname.startsWith("/auth/login") ||
          location.pathname.startsWith("/auth/register");

        if (status === 401 && !isAuthEndpoint) {
          // Evita loops/reentradas
          if (redirecting.current) return Promise.reject(error);
          redirecting.current = true;

          // Limpia sesión local (token + user)
          try {
            clearAuth?.();
          } catch (e) {
            // por si algo falla, igual removemos token
            localStorage.removeItem("auth_token");
          }

          // Si ya estás en login/register, no redirijas otra vez
          if (!isAuthRoute) {
            navigate("/auth/login", {
              replace: true,
              state: { from: location.pathname },
            });
          }

          // libera el candado pronto
          setTimeout(() => {
            redirecting.current = false;
          }, 300);
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
    // OJO: location.pathname cambia, pero no queremos re-registrar interceptor.
    // Solo lo montamos una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
