// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/auth.service";

const AuthContext = createContext(null);

function pickToken(res) {
  // soporta varios formatos típicos
  return (
    res?.token ||
    res?.access_token ||
    res?.data?.token ||
    res?.data?.access_token ||
    null
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await authService.me();
        setUser(res.user || null);

        if (res?.user?.id) sessionStorage.setItem("auth_user_id", String(res.user.id));
        else sessionStorage.removeItem("auth_user_id");
      } catch {
        setUser(null);
        sessionStorage.removeItem("auth_user_id");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo(() => {
    return {
      user,
      loading,
      isAuthenticated: !!user,

      clearAuth() {
        localStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_user_id");
        sessionStorage.removeItem("auth_from");
        setUser(null);
      },

      async login(email, password) {
        const prevUserId = sessionStorage.getItem("auth_user_id");

        const res = await authService.login({ email, password });

        // ✅ GUARDA TOKEN AQUÍ (lo que te está faltando)
        const token = pickToken(res);
        if (token) localStorage.setItem("auth_token", token);

        const nextUserId = res?.user?.id ? String(res.user.id) : "";
        setUser(res.user || null);

        if (nextUserId) sessionStorage.setItem("auth_user_id", nextUserId);
        else sessionStorage.removeItem("auth_user_id");

        const userChanged = !!prevUserId && !!nextUserId && prevUserId !== nextUserId;

        return { ...res, userChanged };
      },

      async logout() {
        await authService.logout();
        localStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_user_id");
        sessionStorage.removeItem("auth_from");
        setUser(null);
      },
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
