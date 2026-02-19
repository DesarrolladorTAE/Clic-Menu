import { createContext, useContext, useMemo, useState } from "react";
import * as staffAuth from "../services/staff/staffAuth.service";

const StaffAuthContext = createContext(null);

export function StaffAuthProvider({ children }) {
  const [staffUser, setStaffUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem("staff_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [activeContext, setActiveContext] = useState(() => {
    try {
      const raw = sessionStorage.getItem("staff_active_context");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const value = useMemo(() => {
    return {
      staffUser,
      activeContext,
      isStaffAuthenticated: !!staffAuth.getStaffToken(),

      async login(email, password) {
        const res = await staffAuth.staffLogin({ email, password });

        setStaffUser(res?.user || null);
        sessionStorage.setItem("staff_user", JSON.stringify(res?.user || null));

        if (res?.active_context) {
          setActiveContext(res.active_context);
          sessionStorage.setItem("staff_active_context", JSON.stringify(res.active_context));
        } else {
          setActiveContext(null);
          sessionStorage.removeItem("staff_active_context");
        }

        return res;
      },

      async logout() {
        try {
          await staffAuth.staffLogout();
        } finally {
          staffAuth.clearStaffLocal();
          setStaffUser(null);
          setActiveContext(null);
        }
      },

      async exitBranch() {
        await staffAuth.staffExitBranch();
        setActiveContext(null);
      },

      setActiveContext(next) {
        setActiveContext(next);
        if (next) sessionStorage.setItem("staff_active_context", JSON.stringify(next));
        else sessionStorage.removeItem("staff_active_context");
      },

      clearStaff() {
        staffAuth.clearStaffLocal();
        setStaffUser(null);
        setActiveContext(null);
      },
    };
  }, [staffUser, activeContext]);

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
}

export function useStaffAuth() {
  return useContext(StaffAuthContext);
}