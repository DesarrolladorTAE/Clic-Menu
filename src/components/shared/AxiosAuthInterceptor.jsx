// src/components/shared/AxiosAuthInterceptor.jsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import staffApi from "../../services/staffApi";

import { useAuth } from "../../context/AuthContext";
import { useStaffAuth } from "../../context/StaffAuthContext";

export default function AxiosAuthInterceptor() {
  const navigate = useNavigate();

  const { clearAuth } = useAuth();
  const { clearStaff } = useStaffAuth() || {};

  const ownerInterceptorId = useRef(null);
  const staffInterceptorId = useRef(null);

  const redirectingOwner = useRef(false);
  const redirectingStaff = useRef(false);

  useEffect(() => {
    if (ownerInterceptorId.current === null) {
      ownerInterceptorId.current = api.interceptors.response.use(
        (response) => response,
        (error) => {
          const status = Number(error?.response?.status || 0);
          const reqUrl = String(error?.config?.url || "");
          const message = String(
            error?.response?.data?.message || ""
          ).toLowerCase();

          if (!status) {
            return Promise.reject(error);
          }

          const isAuthEndpoint =
            reqUrl.includes("/login") ||
            reqUrl.includes("/register") ||
            reqUrl.includes("/password/") ||
            reqUrl.includes("/terms/accept");

          const token = localStorage.getItem("auth_token");

          const sessionIsInvalid =
            status === 401 ||
            (status === 403 &&
              (!token || message.includes("unauthenticated")));

          if (sessionIsInvalid && !isAuthEndpoint) {
            if (redirectingOwner.current) {
              return Promise.reject(error);
            }

            redirectingOwner.current = true;

            const pathname = window.location.pathname;
            const from = pathname + window.location.search;
            const isAuthRoute =
              pathname.startsWith("/auth/login") ||
              pathname.startsWith("/auth/register");

            sessionStorage.setItem("auth_from", from);
            clearAuth?.();

            if (!isAuthRoute) {
              navigate("/auth/login", {
                replace: true,
                state: { from },
              });
            }

            setTimeout(() => {
              redirectingOwner.current = false;
            }, 300);
          }

          /*
           * Los 403 de permisos y los 409 de negocio no deben
           * cerrar sesión ni provocar redirecciones globales.
           * Cada pantalla debe procesarlos según su operación.
           */
          return Promise.reject(error);
        }
      );
    }

    if (staffInterceptorId.current === null) {
      staffInterceptorId.current =
        staffApi.interceptors.response.use(
          (response) => response,
          (error) => {
            const status = Number(
              error?.response?.status || 0
            );

            const reqUrl = String(
              error?.config?.url || ""
            );

            const message = String(
              error?.response?.data?.message || ""
            ).toLowerCase();

            if (!status) {
              return Promise.reject(error);
            }

            const isStaffAuthEndpoint =
              reqUrl.includes("/staff/login") ||
              reqUrl.includes("/staff/logout");

            const token =
              localStorage.getItem("staff_token");

            const sessionIsInvalid =
              status === 401 ||
              (status === 403 &&
                (!token ||
                  message.includes("unauthenticated")));

            if (
              sessionIsInvalid &&
              !isStaffAuthEndpoint
            ) {
              if (redirectingStaff.current) {
                return Promise.reject(error);
              }

              redirectingStaff.current = true;

              const pathname =
                window.location.pathname;

              const from =
                pathname + window.location.search;

              const isStaffRoute =
                pathname.startsWith("/staff/");

              if (isStaffRoute) {
                sessionStorage.setItem(
                  "staff_from",
                  from
                );
              }

              localStorage.removeItem("staff_token");
              sessionStorage.removeItem("staff_user");
              sessionStorage.removeItem(
                "staff_active_context"
              );

              clearStaff?.();

              if (
                !pathname.startsWith("/staff/login")
              ) {
                navigate("/staff/login", {
                  replace: true,
                  state: {
                    from: isStaffRoute
                      ? from
                      : "/staff/app",
                  },
                });
              }

              setTimeout(() => {
                redirectingStaff.current = false;
              }, 300);
            }

            /*
             * No redirigir globalmente por:
             *
             * - 403 de permisos operativos.
             * - 409 de conflictos de negocio.
             * - paquetes parcialmente pagados.
             * - cuentas que ya no admiten ajustes.
             *
             * La pantalla que hizo la petición debe decidir
             * cómo presentar el error.
             */
            return Promise.reject(error);
          }
        );
    }

    return () => {
      if (ownerInterceptorId.current !== null) {
        api.interceptors.response.eject(
          ownerInterceptorId.current
        );

        ownerInterceptorId.current = null;
      }

      if (staffInterceptorId.current !== null) {
        staffApi.interceptors.response.eject(
          staffInterceptorId.current
        );

        staffInterceptorId.current = null;
      }
    };
  }, [clearAuth, clearStaff, navigate]);

  return null;
}