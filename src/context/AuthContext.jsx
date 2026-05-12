// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/auth/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUserSession = (nextUser) => {
    if (nextUser?.id) {
      sessionStorage.setItem("auth_user_id", String(nextUser.id));
    } else {
      sessionStorage.removeItem("auth_user_id");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await authService.me();
        const nextUser = res.user || null;

        setUser(nextUser);
        syncUserSession(nextUser);
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

      updateUser(nextUser) {
        const normalizedUser = nextUser || null;
        setUser(normalizedUser);
        syncUserSession(normalizedUser);
      },

      clearAuth() {
        localStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_user_id");
        sessionStorage.removeItem("auth_from");
        setUser(null);
      },

      async login(email, password) {
        const prevUserId = sessionStorage.getItem("auth_user_id");

        const res = await authService.login({ email, password });

        const nextUser = res.user || null;
        const nextUserId = nextUser?.id ? String(nextUser.id) : "";

        setUser(nextUser);
        syncUserSession(nextUser);

        const userChanged =
          !!prevUserId && !!nextUserId && prevUserId !== nextUserId;

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