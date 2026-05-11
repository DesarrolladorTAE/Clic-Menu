// src/context/SystemAdminAuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as systemAdminAuth from "../services/system-admin/systemAdminAuth.service";

const SystemAdminAuthContext = createContext(null);

export function SystemAdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() =>
    systemAdminAuth.getSystemAdminUser()
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const token = systemAdminAuth.getSystemAdminToken();

        if (!token) {
          if (mounted) setAdminUser(null);
          return;
        }

        const res = await systemAdminAuth.systemAdminMe();

        if (mounted) {
          setAdminUser(res?.user || null);
        }
      } catch {
        systemAdminAuth.clearSystemAdminLocal();

        if (mounted) {
          setAdminUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => {
    return {
      adminUser,
      loading,
      isSystemAdminAuthenticated: !!adminUser,

      async login(email, password) {
        const res = await systemAdminAuth.systemAdminLogin({
          email,
          password,
        });

        setAdminUser(res?.user || null);

        return res;
      },

      async logout() {
        try {
          await systemAdminAuth.systemAdminLogout();
        } finally {
          systemAdminAuth.clearSystemAdminLocal();
          setAdminUser(null);
        }
      },

      clearSystemAdmin() {
        systemAdminAuth.clearSystemAdminLocal();
        setAdminUser(null);
      },
    };
  }, [adminUser, loading]);

  return (
    <SystemAdminAuthContext.Provider value={value}>
      {children}
    </SystemAdminAuthContext.Provider>
  );
}

export function useSystemAdminAuth() {
  return useContext(SystemAdminAuthContext);
}