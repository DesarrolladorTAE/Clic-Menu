// src/hooks/public/usePublicMenuLoader.js
// carga del menú sin polling visible.
// Ahora la resincronización principal ocurre por WS desde el Page.

import { useCallback, useRef, useState } from "react";
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

  const [webChannelId, setWebChannelId] = useState("");

  const [callLocked, setCallLocked] = useState(false);

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
        lastPayloadHashRef.current = h;

        // importante:
        // aunque las sections no cambien, sí queremos refrescar ui/table/flags globales
        setData(normalized);

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
    [token, callLocked],
  );

  return {
    loading,
    errorMsg,
    data,
    load,
    webChannelId,
    setWebChannelId,
    callLocked,
    setCallLocked,
    setLoading,
  };
}