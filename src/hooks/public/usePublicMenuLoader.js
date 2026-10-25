// src/hooks/public/usePublicMenuLoader.js
// carga del menú sin polling visible.
// Ahora la resincronización principal ocurre por WS desde el Page.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  PUBLIC_QR_DISABLED_MSG,
  PUBLIC_QR_WRONG_MODE_MSG,
  isQrDisabledPublicError,
  isQrWrongModeError,
} from "./publicMenu.utils";
import {
  CATALOG_MODE_NORMAL,
  normalizeCatalogMode,
  normalizeMenuSetCatalog,
} from "../menu/menu-sets/menuSet.utils";
import {
  fetchResolvedMenu,
  fetchPublicMenuSets,
} from "../../services/public/publicMenu.service";

const EMPTY_MENU_SETS = [];

export function usePublicMenuLoader({ token }) {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState(null);
  const [menuSetCatalog, setMenuSetCatalog] = useState(null);

  const [webChannelId, setWebChannelId] = useState("");
  const [callLocked, setCallLocked] = useState(false);

  const requestSequenceRef = useRef(0);
  const lastMenuSignatureRef = useRef("");
  const lastSetsSignatureRef = useRef("");
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    requestSequenceRef.current += 1;
    lastMenuSignatureRef.current = "";
    lastSetsSignatureRef.current = "";
    hasLoadedRef.current = false;

    setLoading(true);
    setErrorMsg("");
    setData(null);
    setMenuSetCatalog(null);
    setWebChannelId("");
    setCallLocked(false);
  }, [token]);

  const load = useCallback(async ({ silent = false } = {}) => {
    const requestId = ++requestSequenceRef.current;

    if (!silent) {
      setLoading(true);
      setErrorMsg("");
    }

    try {
      const payload = await fetchResolvedMenu(token);

      if (requestId !== requestSequenceRef.current) return null;

      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("No se recibió un menú válido.");
      }

      const catalogMode = normalizeCatalogMode(payload.catalog_mode);

      if (!catalogMode) {
        throw new Error("No se pudo identificar la modalidad de este menú.");
      }

      let setsPayload = {
        catalog_mode: catalogMode,
        menu_sets: [],
      };

      if (catalogMode !== CATALOG_MODE_NORMAL) {
        setsPayload = await fetchPublicMenuSets(token);

        if (requestId !== requestSequenceRef.current) return null;

        if (!setsPayload || typeof setsPayload !== "object" || Array.isArray(setsPayload)) {
          throw new Error("No se pudo obtener la información de los Conjuntos.");
        }

        if (normalizeCatalogMode(setsPayload.catalog_mode) !== catalogMode) {
          throw new Error("El menú está cambiando. Inténtalo nuevamente.");
        }

        const menuId = Number(payload.menu_context?.menu_id ?? payload.menu?.id ?? 0);
        const setsMenuId = Number(setsPayload.menu_id ?? 0);

        if (menuId > 0 && setsMenuId > 0 && menuId !== setsMenuId) {
          throw new Error("El menú está cambiando. Inténtalo nuevamente.");
        }

        const channelId = Number(payload.sales_channel?.id ?? 0);
        const setsChannelId = Number(setsPayload.sales_channel_id ?? 0);

        if (channelId > 0 && setsChannelId > 0 && channelId !== setsChannelId) {
          throw new Error("El canal de este menú ha cambiado. Inténtalo nuevamente.");
        }
      }

      const normalizedCatalog = normalizeMenuSetCatalog(setsPayload);
      const menuSignature = JSON.stringify(payload);
      const setsSignature = JSON.stringify(setsPayload);

      if (menuSignature !== lastMenuSignatureRef.current) {
        lastMenuSignatureRef.current = menuSignature;
        setData(payload);
      }

      if (setsSignature !== lastSetsSignatureRef.current) {
        lastSetsSignatureRef.current = setsSignature;
        setMenuSetCatalog(normalizedCatalog);
      }

      const qrType = String(payload.qr_type || payload.type || "").trim().toLowerCase();

      if (qrType === "web") {
        const menusByChannel = payload.menus_by_channel &&
          typeof payload.menus_by_channel === "object" &&
          !Array.isArray(payload.menus_by_channel)
          ? payload.menus_by_channel
          : {};

        const channelKeys = Object.keys(menusByChannel);
        const defaultChannelId = String(payload.default_channel_id ?? "");
        const resolvedChannelId = String(
          payload.sales_channel?.id ?? payload.default_channel_id ?? "",
        );

        setWebChannelId((previous) => {
          const chosen = String(previous || "");

          if (channelKeys.length === 0) {
            return chosen === resolvedChannelId ? previous : resolvedChannelId;
          }

          if (channelKeys.includes(chosen)) return previous;
          if (channelKeys.includes(defaultChannelId)) return defaultChannelId;

          return "";
        });
      } else {
        setWebChannelId((previous) => previous ? "" : previous);
      }

      const defaultChannelId = String(payload.default_channel_id || "");
      const activeUi = payload.ui ||
        payload.menus_by_channel?.[defaultChannelId]?.ui ||
        null;

      if (activeUi?.call_waiter_enabled === true) {
        setCallLocked((previous) => previous ? false : previous);
      }

      hasLoadedRef.current = true;
      setErrorMsg((previous) => previous ? "" : previous);

      return {
        menu: payload,
        menuSetCatalog: normalizedCatalog,
      };
    } catch (error) {
      if (requestId !== requestSequenceRef.current) return null;

      // Una actualización silenciosa fallida no elimina el menú que ya está visible.
      if (!silent || !hasLoadedRef.current) {
        let message = "";

        if (isQrWrongModeError(error)) {
          message = PUBLIC_QR_WRONG_MODE_MSG;
        } else if (isQrDisabledPublicError(error)) {
          message = PUBLIC_QR_DISABLED_MSG;
        } else {
          message = error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "No se pudo cargar el menú.";
        }

        setErrorMsg(String(message));
        setData(null);
        setMenuSetCatalog(null);
        lastMenuSignatureRef.current = "";
        lastSetsSignatureRef.current = "";
        hasLoadedRef.current = false;
      }

      return null;
    } finally {
      if (requestId === requestSequenceRef.current) {
        setLoading(false);
      }
    }
  }, [token]);

  return {
    loading,
    errorMsg,
    data,
    load,
    menuSetCatalog,
    menuSets: menuSetCatalog?.menuSets ?? EMPTY_MENU_SETS,
    webChannelId,
    setWebChannelId,
    callLocked,
    setCallLocked,
    setLoading,
  };
}