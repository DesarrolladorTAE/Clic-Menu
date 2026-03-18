import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getTableSession,
  heartbeatTableSession,
  scanTable,
  createJoinRequest,
  getJoinRequestStatus,
} from "../../services/public/publicMenu.service";

function normalizeSessionPayload(raw) {
  if (!raw) return null;

  const sessionId = Number(raw.session_id || raw.id || 0);

  return {
    ...raw,
    session_id: sessionId || null,
    id: sessionId || null,
    table_id: raw.table_id ? Number(raw.table_id) : null,
    order_id: raw.order_id ? Number(raw.order_id) : null,
    status: String(raw.status || ""),
    remaining_seconds: Number(raw.remaining_seconds || 0),
  };
}

export function useTableQrSession({ activeMenuPayload, hasTable, tableId }) {
  const [session, setSession] = useState(null);
  const [sessionBusy, setSessionBusy] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [remainingSec, setRemainingSec] = useState(0);

  const [sessionUnavailable, setSessionUnavailable] = useState(null);

  const sessionPollRef = useRef(null);
  const tickRef = useRef(null);
  const heartbeatRef = useRef(null);

  const [callToast, setCallToast] = useState("");

  const [takeover, setTakeover] = useState(null);
  const [joinReq, setJoinReq] = useState(null);

  const joinPollRef = useRef(null);

  const stopJoinPoll = useCallback(() => {
    if (joinPollRef.current) clearInterval(joinPollRef.current);
    joinPollRef.current = null;
  }, []);

  const startJoinPoll = useCallback(
    (tid) => {
      if (!tid) return;
      if (joinPollRef.current) return;

      joinPollRef.current = setInterval(async () => {
        try {
          const res = await getJoinRequestStatus(tid);
          const st = String(res?.data?.status || "").toLowerCase();

          if (st === "pending") {
            setJoinReq((p) => ({ ...(p || {}), status: "pending" }));
            return;
          }

          if (st === "approved") {
            setJoinReq({ status: "approved", message: res?.message || "Aprobado." });
            stopJoinPoll();
            setTimeout(() => {
              startScanSession();
            }, 250);
            return;
          }

          if (st === "rejected") {
            setJoinReq({ status: "rejected", message: res?.message || "No fuiste aprobado." });
            stopJoinPoll();
            return;
          }

          if (st === "closed") {
            setJoinReq({ status: "closed", message: res?.message || "La sesión ya fue cerrada." });
            stopJoinPoll();
            return;
          }

          setJoinReq({ status: "unavailable", message: res?.message || "No disponible." });
          stopJoinPoll();
        } catch (e) {
          const msg = e?.response?.data?.message || e?.message || "Error consultando aprobación.";
          const code = String(e?.response?.data?.code || "").toUpperCase();
          const st = e?.response?.status;

          if (
            st === 409 &&
            (code.includes("REJECT") ||
              String(msg).toLowerCase().includes("no fuiste aprobado"))
          ) {
            setJoinReq({ status: "rejected", message: msg });
            stopJoinPoll();
          }
        }
      }, 1500);
    },
    [stopJoinPoll],
  );

  const startScanSession = useCallback(async () => {
    if (!tableId) return;

    setSessionLoading(true);
    setSessionBusy(null);
    setSessionUnavailable(null);
    setCallToast("");
    setTakeover(null);
    setJoinReq(null);
    stopJoinPoll();

    try {
      const res = await scanTable(tableId);
      const s = normalizeSessionPayload(res?.data || null);

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
        const hasDevice = !!s?.has_device || !!s?.device_identifier;

        if (!hasDevice && (s?.order_id || s?.active_order_id)) {
          setTakeover({
            available: true,
            table_id: Number(tableId),
            session_id: s?.session_id ? Number(s.session_id) : null,
            order_id: s?.order_id ? Number(s.order_id) : Number(s.active_order_id),
            message:
              "Esta mesa tiene una cuenta abierta, pero no hay un dispositivo vinculado.\n¿Deseas retomar la cuenta?",
          });
          setSessionBusy(null);
          setSession(null);
          setRemainingSec(0);
          return;
        }

        setSessionBusy({
          session_id: s?.session_id ? Number(s.session_id) : null,
          status: String(s?.status || "active"),
        });
        setSession(null);
        setRemainingSec(0);
        return;
      }

      if (status === 409 && code === "SESSION_UNAVAILABLE") {
        const msg =
          e?.response?.data?.message || "Sesión no disponible, intente más tarde.";
        setSessionUnavailable({ code, message: msg });
        setSession(null);
        setRemainingSec(0);
        return;
      }

      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo iniciar la sesión de mesa.";

      setCallToast(`⚠️ ${msg}`);
      setTimeout(() => setCallToast(""), 4500);
    } finally {
      setSessionLoading(false);
    }
  }, [tableId, stopJoinPoll]);

  useEffect(() => {
    if (!activeMenuPayload) return;
    if (!hasTable) return;
    if (String(activeMenuPayload?.type) !== "physical") return;
    startScanSession();
  }, [activeMenuPayload?.table?.id, activeMenuPayload?.type, hasTable, startScanSession]);

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

  useEffect(() => {
    const stop = () => {
      if (sessionPollRef.current) clearInterval(sessionPollRef.current);
      sessionPollRef.current = null;
    };

    if (!session?.session_id) {
      stop();
      return;
    }

    stop();

    sessionPollRef.current = setInterval(async () => {
      try {
        const res = await getTableSession(session.session_id);
        const s = normalizeSessionPayload(res?.data || null);
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
          return;
        }

        if (status === 410) {
          setSession((prev) =>
            prev
              ? {
                  ...prev,
                  status: "expired",
                  remaining_seconds: 0,
                }
              : prev,
          );
          setRemainingSec(0);
        }
      }
    }, 10000);

    return stop;
  }, [session?.session_id]);

  useEffect(() => {
    const stop = () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    };

    if (!session?.session_id) {
      stop();
      return;
    }

    stop();

    heartbeatRef.current = setInterval(async () => {
      try {
        await heartbeatTableSession(session.session_id);
      } catch {}
    }, 30000);

    return stop;
  }, [session?.session_id]);

  const sessionStatus = String(session?.status || "").toLowerCase();

  const sessionExpired =
    hasTable &&
    (sessionStatus === "expired" ||
      (!!session?.expires_at && Number(remainingSec || 0) <= 0));

  const sessionActive =
    hasTable &&
    !!session?.session_id &&
    ["active", "pending"].includes(sessionStatus) &&
    !sessionExpired;

  const sessionOrderStatus = String(
    session?.order_status ||
      session?.active_order?.status ||
      session?.order?.status ||
      "",
  );

  const requestJoin = useCallback(async () => {
    if (!tableId) return { ok: false };

    setJoinReq({ status: "pending", message: "Enviando solicitud..." });

    try {
      const res = await createJoinRequest(tableId);
      const requestId = res?.data?.request_id || null;

      setJoinReq({
        status: "pending",
        request_id: requestId,
        message: res?.message || "Solicitud enviada. Espera aprobación del mesero.",
      });

      startJoinPoll(tableId);
      return { ok: true, request_id: requestId };
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo solicitar retomar la cuenta.";

      setJoinReq({ status: "unavailable", message: msg });
      return { ok: false };
    }
  }, [tableId, startJoinPoll]);

  const clearTakeover = useCallback(() => {
    setTakeover(null);
    setJoinReq(null);
    stopJoinPoll();
  }, [stopJoinPoll]);

  return useMemo(
    () => ({
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
      takeover,
      joinReq,
      requestJoin,
      clearTakeover,
    }),
    [
      session,
      sessionBusy,
      sessionLoading,
      remainingSec,
      sessionUnavailable,
      sessionExpired,
      sessionActive,
      sessionStatus,
      sessionOrderStatus,
      callToast,
      startScanSession,
      takeover,
      joinReq,
      requestJoin,
      clearTakeover,
    ],
  );
}