/// src/hooks/public/useTableQrSession.js
// sesión de mesa por QR (scan, tick 1s, poll 10s, heartbeat 30s, busy/unavailable/expired)

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getTableSession,
  heartbeatTableSession,
  scanTable,
} from "../../services/public/publicMenu.service";

export function useTableQrSession({ activeMenuPayload, hasTable, tableId }) {
  const [session, setSession] = useState(null);
  const [sessionBusy, setSessionBusy] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [remainingSec, setRemainingSec] = useState(0);

  // desactivado temporalmente por atención atendida (según backend)
  const [sessionUnavailable, setSessionUnavailable] = useState(null); // { message, code }

  const sessionPollRef = useRef(null);
  const tickRef = useRef(null);
  const heartbeatRef = useRef(null);

  const [callToast, setCallToast] = useState("");

  const startScanSession = useCallback(async () => {
    if (!tableId) return;

    setSessionLoading(true);
    setSessionBusy(null);
    setSessionUnavailable(null);
    setCallToast("");

    try {
      const res = await scanTable(tableId);
      const s = res?.data || null;

      if (s?.session_id) {
        setSession(s);
        setRemainingSec(Number(s.remaining_seconds || 0));
      } else {
        setSession(null);
        setRemainingSec(0);
      }
    } catch (e) {
      const status = e?.response?.status;
      const code = e?.response?.data?.code;

      if (status === 409 && code === "TABLE_BUSY") {
        const s = e?.response?.data?.data || {};
        setSessionBusy({ session_id: s.session_id, status: s.status });
        setSession(null);
        setRemainingSec(0);
      } else if (status === 409 && code === "SESSION_UNAVAILABLE") {
        const msg =
          e?.response?.data?.message ||
          "Sesión no disponible, intente más tarde.";
        setSessionUnavailable({ code, message: msg });
        setSession(null);
        setRemainingSec(0);
      } else {
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "No se pudo iniciar la sesión de mesa.";
        setCallToast(`⚠️ ${msg}`);
        setTimeout(() => setCallToast(""), 4500);
      }
    } finally {
      setSessionLoading(false);
    }
  }, [tableId]);

  // scan inicial
  useEffect(() => {
    if (!activeMenuPayload) return;
    if (!hasTable) return;
    if (String(activeMenuPayload?.type) !== "physical") return;
    startScanSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenuPayload?.table?.id, activeMenuPayload?.type]);

  // tick local 1s
  useEffect(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }

    tickRef.current = setInterval(() => {
      setRemainingSec((prev) => Math.max(0, Number(prev || 0) - 1));
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, []);

  // polling sesión 10s
  useEffect(() => {
    const stop = () => {
      if (sessionPollRef.current) clearInterval(sessionPollRef.current);
      sessionPollRef.current = null;
    };

    if (!session?.session_id) {
      stop();
      return;
    }

    if (sessionPollRef.current) return;

    sessionPollRef.current = setInterval(async () => {
      try {
        const res = await getTableSession(session.session_id);
        const s = res?.data || null;
        if (!s) return;

        setSession(s);
        setRemainingSec(Number(s.remaining_seconds || 0));
      } catch (e) {
        const status = e?.response?.status;
        const code = e?.response?.data?.code;

        if (status === 403 && code === "DEVICE_MISMATCH") {
          setSessionBusy({ session_id: session.session_id, status: "active" });
          setSession(null);
          setRemainingSec(0);
        }

        if (status === 410) {
          setSession((prev) =>
            prev ? { ...prev, status: "expired", remaining_seconds: 0 } : prev
          );
          setRemainingSec(0);
        }
      }
    }, 10000);

    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.session_id]);

  // heartbeat 30s
  useEffect(() => {
    const stop = () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    };

    if (!session?.session_id) {
      stop();
      return;
    }

    if (heartbeatRef.current) return;

    heartbeatRef.current = setInterval(async () => {
      try {
        await heartbeatTableSession(session.session_id);
      } catch {}
    }, 30000);

    return stop;
  }, [session?.session_id]);

  const sessionStatus = String(session?.status || "");
  const sessionExpired = hasTable && (sessionStatus === "expired" || remainingSec <= 0);
  const sessionActive = hasTable && !!session?.session_id && !sessionExpired;

  // ✅ NUEVO: derivar estatus de orden desde session (depende de tu backend)
  // soporta: session.order_status, session.active_order.status, session.order.status
  const sessionOrderStatus =
    String(session?.order_status || session?.active_order?.status || session?.order?.status || "");

  return {
    session,
    setSession,
    sessionBusy,
    setSessionBusy,
    sessionLoading,
    remainingSec,
    sessionUnavailable,
    setSessionUnavailable,
    sessionExpired,
    sessionActive,
    sessionStatus,
    sessionOrderStatus,
    callToast,
    setCallToast,
    startScanSession,
  };
}