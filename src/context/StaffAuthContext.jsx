// src/context/StaffAuthContext.jsx
import { createContext, useContext, useMemo, useState } from "react";
import * as staffAuth from "../services/staff/staffAuth.service";

const StaffAuthContext = createContext(null);

export function StaffAuthProvider({ children }) {
  const [staffUser, setStaffUser] = useState(() => staffAuth.getStaffUser());
  const [activeContext, setActiveContextState] = useState(() => staffAuth.getStaffActiveContext());
  const [contexts, setContexts] = useState(() => staffAuth.getStaffContexts());

  const value = useMemo(() => {
    const doLogout = async () => {
      try {
        await staffAuth.staffLogout();
      } finally {
        staffAuth.clearStaffLocal();
        setStaffUser(null);
        setActiveContextState(null);
        setContexts([]);
      }
    };

    const doExitContext = async () => {
      await staffAuth.staffExitContext();
      setActiveContextState(null);
      staffAuth.setStaffActiveContext(null);
    };

    // ✅ Helper: normaliza respuesta /staff/context al formato active_context
    const normalizeCtx = (ctx) => {
      if (!ctx) return null;
      return {
        work_session_id: ctx.work_session_id,
        restaurant: ctx.restaurant,
        branch: ctx.branch,
        role: ctx.role,
      };
    };

    return {
      staffUser,
      activeContext,
      contexts,
      isStaffAuthenticated: !!staffAuth.getStaffToken(),

      /**
       * ✅ LOGIN con "autoselect" defensivo:
       * - Si backend dice: requires_context_selection=false
       * - y contexts.length === 1
       * - pero NO viene active_context
       * entonces: llamamos /staff/select-context para forzar StaffWorkSession con token_id.
       */
      async login(email, password) {
        const res = await staffAuth.staffLogin({ email, password });

        setStaffUser(res?.user || null);
        const list = Array.isArray(res?.contexts) ? res.contexts : [];
        setContexts(list);

        // Caso normal: backend ya auto-seleccionó
        if (res?.active_context) {
          setActiveContextState(res.active_context);
          staffAuth.setStaffActiveContext(res.active_context);
          return res;
        }

        // Caso múltiple: el usuario elegirá
        if (res?.requires_context_selection) {
          setActiveContextState(null);
          staffAuth.setStaffActiveContext(null);
          return res;
        }

        // ✅ Caso raro (y el que te duele):
        // 1 solo contexto, pero backend no mandó active_context.
        // Forzamos selectContext para que exista StaffWorkSession (y token_id).
        if (list.length === 1) {
          const only = list[0];

          const sel = await staffAuth.staffSelectContext({
            restaurant_id: only.restaurant.id,
            branch_id: only.branch.id,
            role_id: only.role.id,
          });

          if (sel?.active_context) {
            setActiveContextState(sel.active_context);
            staffAuth.setStaffActiveContext(sel.active_context);
            // devolvemos una respuesta "completa" como si el login lo hubiera traído
            return { ...res, active_context: sel.active_context };
          }
        }

        // Si llega aquí: no hay contexto activo
        setActiveContextState(null);
        staffAuth.setStaffActiveContext(null);
        return res;
      },

      async selectContext(payload) {
        const res = await staffAuth.staffSelectContext(payload);
        if (res?.active_context) {
          setActiveContextState(res.active_context);
          staffAuth.setStaffActiveContext(res.active_context);
        }
        return res;
      },

      async refreshContext() {
        const res = await staffAuth.staffContext();
        const ctx = res?.data || null;

        if (ctx) {
          const normalized = normalizeCtx(ctx);
          setActiveContextState(normalized);
          staffAuth.setStaffActiveContext(normalized);
        }

        return res;
      },

      async logout() {
        await doLogout();
      },

      async exitContext() {
        await doExitContext();
      },

      /**
       * ✅ exitSmart (sin `this`)
       * - Si solo hay 1 contexto: salir = logout
       * - Si hay más: salir = exit-context
       *
       * NOTA: Para cocina multi-dispositivo, el backend ya borra SOLO el token actual,
       * por lo cual no tumba a los demás dispositivos.
       */
      async exitSmart() {
        const count = Array.isArray(contexts) ? contexts.length : 0;

        if (count <= 1) {
          await doLogout();
          return { mode: "logout" };
        }

        await doExitContext();
        return { mode: "exit" };
      },

      setActiveContext(next) {
        setActiveContextState(next);
        staffAuth.setStaffActiveContext(next);
      },

      clearStaff() {
        staffAuth.clearStaffLocal();
        setStaffUser(null);
        setActiveContextState(null);
        setContexts([]);
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffUser, activeContext, contexts]);

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
}

export function useStaffAuth() {
  return useContext(StaffAuthContext);
}