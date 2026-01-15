import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // para esperar /me al cargar

  // Al iniciar app: intenta recuperar sesión desde cookie (backend)
  useEffect(() => {
    (async () => {
      try {
        const res = await authService.me();
        setUser(res.user || null);
      } catch (e) {
        setUser(null);
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
      async login(email, password) {
        const res = await authService.login({ email, password });
        setUser(res.user);
        return res;
      },
      async logout() {
        await authService.logout();
        localStorage.removeItem("auth_token");
        setUser(null);
      },
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
