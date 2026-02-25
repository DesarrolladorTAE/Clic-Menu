// src/pages/public/hooks/usePublicMenuLoader.js
// carga del menú + polling cada 15s + manejo de errores públicos (QR desactivado / modo incorrecto)
// Objetivo: sacar del Page toda la lógica de fetch y refresco silencioso.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PUBLIC_QR_DISABLED_MSG,
  PUBLIC_QR_WRONG_MODE_MSG,
  isQrDisabledPublicError,
  isQrWrongModeError,
  safeHash,
} from "./publicMenu.utils";
import { fetchResolvedMenu } from "../../services/public/publicMenu.service";

export function usePublicMenuLoader({ token }) {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState(null);

  // WEB selector
  const [webChannelId, setWebChannelId] = useState("");

  // ✅ callLocked: si backend dice “CALL_DISABLED_ATTENDED”, se queda bloqueado hasta que payload diga call_waiter_enabled true
  const [callLocked, setCallLocked] = useState(false);

  const pollRef = useRef(null);
  const lastPayloadHashRef = useRef("");

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
        setErrorMsg("");
      }
      try {
        const payload = await fetchResolvedMenu(token);
        const normalized = payload;

        // WEB default
        if (String(normalized?.type) === "web") {
          const def = normalized?.default_channel_id
            ? String(normalized.default_channel_id)
            : "";
          setWebChannelId((prev) => prev || def);
        } else {
          setWebChannelId("");
        }

        const sectionsForHash =
          String(normalized?.type) === "web"
            ? normalized?.menus_by_channel?.[
                String(normalized?.default_channel_id || "")
              ]?.sections || []
            : normalized?.sections || [];

        const h = safeHash(sectionsForHash);
        if (h !== lastPayloadHashRef.current) {
          lastPayloadHashRef.current = h;
          setData(normalized);
        } else if (!data) {
          setData(normalized);
        }

        // ✅ Si estaba bloqueado el call y backend ya lo habilitó de nuevo, desbloquea
        if (callLocked) {
          const uiFromPayload =
            normalized?.ui ||
            normalized?.menus_by_channel?.[
              String(normalized?.default_channel_id || "")
            ]?.ui;
          if (uiFromPayload && uiFromPayload.call_waiter_enabled === true) {
            setCallLocked(false);
          }
        }
      } catch (e) {
        if (!silent) {
          if (isQrWrongModeError(e)) {
            setErrorMsg(PUBLIC_QR_WRONG_MODE_MSG);
            setData(null);
          } else if (isQrDisabledPublicError(e)) {
            setErrorMsg(PUBLIC_QR_DISABLED_MSG);
            setData(null);
          } else {
            const msg =
              e?.response?.data?.message ||
              e?.response?.data?.error ||
              e?.message ||
              "No se pudo cargar el menú.";
            setErrorMsg(msg);
            setData(null);
          }
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, data, callLocked],
  );

  // carga inicial
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // polling 15s solo cuando la pestaña está visible
  useEffect(() => {
    const start = () => {
      if (pollRef.current) return;
      pollRef.current = setInterval(() => {
        if (document.visibilityState === "visible") load({ silent: true });
      }, 15000);
    };
    const stop = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return {
    loading,
    errorMsg,
    data,
    load,
    webChannelId,
    setWebChannelId,
    callLocked,
    setCallLocked,
  };
}