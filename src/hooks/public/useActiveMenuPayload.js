// src/pages/public/hooks/useActiveMenuPayload.js
// deriva toda la data calculada del menú (web channels, payload activo, header, ui, sections, filtros base)
// Objetivo: sacar del Page el “mar de useMemo” sin cambiar el resultado.

import { useEffect, useMemo } from "react";

export function useActiveMenuPayload({
  data,
  webChannelId,
  setWebChannelId,
  resetOnChannelChange,
  setCallLocked,
}) {
  const isWeb = useMemo(() => String(data?.type) === "web", [data]);

  const webChannels = useMemo(() => {
    if (!isWeb) return [];
    return Array.isArray(data?.channels) ? data.channels : [];
  }, [data, isWeb]);

  const activeWebChannelId = useMemo(() => {
    if (!isWeb) return "";
    const chosen = String(webChannelId || "");
    if (chosen) return chosen;
    const def = data?.default_channel_id ? String(data.default_channel_id) : "";
    return def;
  }, [isWeb, webChannelId, data]);

  const activeMenuPayload = useMemo(() => {
    if (!data) return null;
    if (!isWeb) return data;

    const by = data?.menus_by_channel || {};
    const picked = by?.[String(activeWebChannelId)] || null;

    if (picked)
      return {
        ...picked,
        ui: data?.ui,
        table: data?.table,
        ordering_mode: data?.ordering_mode,
        table_service_mode: data?.table_service_mode,
        type: data?.type,
      };

    const def = data?.default_channel_id ? String(data.default_channel_id) : "";
    const fallback = def ? by?.[def] : null;

    return fallback
      ? {
          ...fallback,
          ui: data?.ui,
          table: data?.table,
          ordering_mode: data?.ordering_mode,
          table_service_mode: data?.table_service_mode,
          type: data?.type,
        }
      : { ...data, sections: [] };
  }, [data, isWeb, activeWebChannelId]);

  // limpiar filtros / carrito al cambiar canal WEB (igual que antes)
  useEffect(() => {
    if (!isWeb) return;
    resetOnChannelChange?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWebChannelId]);

  const header = useMemo(() => {
    if (!activeMenuPayload) return null;
    const r = activeMenuPayload.restaurant;
    const b = activeMenuPayload.branch;
    const sc = activeMenuPayload.sales_channel;
    const t = activeMenuPayload.table;

    return {
      restaurantName: r?.trade_name || "Restaurante",
      restaurantStatus: r?.status,
      branchName: b?.name || "Sucursal",
      branchStatus: b?.status,
      channelName: sc?.name || "Canal",
      tableName: t?.name || null,
      orderingMode: activeMenuPayload.ordering_mode || null,
      tableServiceMode: activeMenuPayload.table_service_mode || null,
    };
  }, [activeMenuPayload]);

  const ui = useMemo(() => activeMenuPayload?.ui || {}, [activeMenuPayload]);

  const hasTable = !!activeMenuPayload?.table?.id;
  const tableId = activeMenuPayload?.table?.id
    ? Number(activeMenuPayload.table.id)
    : null;

  const badgeUi = useMemo(() => {
    if (!ui?.ui_mode) return { tone: "default", label: "Menú" };
    if (ui.ui_mode === "selectable") return { tone: "ok", label: "Seleccionable" };
    return { tone: "default", label: "Solo lectura" };
  }, [ui]);

  const sections = useMemo(() => activeMenuPayload?.sections || [], [activeMenuPayload]);

  // ✅ esto lo tenías en load(), aquí lo dejamos “listo” para el Page: desbloqueo de callLocked si UI ya habilitó
  useEffect(() => {
    if (!activeMenuPayload) return;
    // en web, la ui viene global en data.ui (ya incluida arriba)
    if (ui?.call_waiter_enabled === true) setCallLocked?.(false);
  }, [activeMenuPayload, ui, setCallLocked]);

  return {
    isWeb,
    webChannels,
    activeWebChannelId,
    activeMenuPayload,
    header,
    ui,
    hasTable,
    tableId,
    badgeUi,
    sections,
    setWebChannelId, // por si lo ocupas directo
  };
}