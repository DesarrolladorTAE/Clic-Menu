// src/hooks/public/useActiveMenuPayload.js
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
  const isWeb = useMemo(() => {
    const qrType = String(data?.qr_type || data?.type || "").trim().toLowerCase();
    return qrType === "web";
  }, [data]);

  const webChannels = useMemo(() => {
    if (!isWeb) return [];

    return Array.isArray(data?.channels) ? data.channels : [];
  }, [data, isWeb]);

  const activeWebChannelId = useMemo(() => {
    if (!isWeb) return "";

    const chosen = String(webChannelId || "");

    if (chosen) {
      return chosen;
    }

    const defaultChannelId = data?.default_channel_id
      ? String(data.default_channel_id)
      : "";

    return defaultChannelId;
  }, [isWeb, webChannelId, data]);

  const activeMenuPayload = useMemo(() => {
    if (!data) return null;

    /**
     * Los menús físicos y delivery ya llegan resueltos
     * directamente por el backend.
     */
    if (!isWeb) {
      return data;
    }

    const menusByChannel =
      data?.menus_by_channel &&
      typeof data.menus_by_channel === "object" &&
      !Array.isArray(data.menus_by_channel)
        ? data.menus_by_channel
        : {};

    const hasMenusByChannel =
      Object.keys(menusByChannel).length > 0;

    /**
     * El backend actual de los QR web ya entrega directamente
     * el menú resuelto para su canal, tanto WHATSAPP como ONLINE_ORDER:
     *
     * - data.menu
     * - data.menu_context
     * - data.sections
     * - data.sales_channel
     * - data.public_flow
     * - data.sales_channel_code
     *
     * ONLINE_ORDER también puede incluir:
     * - data.online_order_checkout
     *
     * Cuando no existe menus_by_channel, data ya es el payload
     * activo y no deben eliminarse sus secciones.
     */
    if (!hasMenusByChannel) {
      return {
        ...data,
        sections: Array.isArray(data?.sections) ? data.sections : [],
      };
    }

    /**
     * Compatibilidad con la estructura anterior, en la que
     * el backend podía entregar varios payloads web agrupados
     * por canal.
     */
    const selectedPayload =
      menusByChannel?.[String(activeWebChannelId)] || null;

    /**
     * Cuando existe una respuesta multicanal, pero no existe
     * payload para el canal seleccionado, no se debe utilizar
     * accidentalmente el menú de otro canal.
     */
    if (!selectedPayload) {
      return {
        ...data,
        sections: [],
        ui: data?.ui || {},
        table: data?.table || null,
        ordering_mode: data?.ordering_mode ?? null,
        table_service_mode: data?.table_service_mode ?? null,
        type: data?.type || null,
        qr_type: data?.qr_type || data?.type || null,
        sales_channel_code: data?.sales_channel_code || null,
        public_flow: data?.public_flow || "catalog_only",
        online_order_checkout: data?.online_order_checkout ?? null,
      };
    }

    /**
     * Las secciones pertenecen exclusivamente al payload
     * correspondiente al canal web seleccionado.
     */
    return {
      ...selectedPayload,
      sections: Array.isArray(selectedPayload?.sections) ? selectedPayload.sections : [],
      ui: selectedPayload?.ui || data?.ui || {},
      table: selectedPayload?.table ?? data?.table ?? null,
      ordering_mode: selectedPayload?.ordering_mode ?? data?.ordering_mode ?? null,
      table_service_mode:
        selectedPayload?.table_service_mode ?? data?.table_service_mode ?? null,
      type: selectedPayload?.type || data?.type || null,
      qr_type:
        selectedPayload?.qr_type ||
        data?.qr_type ||
        selectedPayload?.type ||
        data?.type ||
        null,
      sales_channel_code:
        selectedPayload?.sales_channel_code || data?.sales_channel_code || null,
      public_flow:
        selectedPayload?.public_flow || data?.public_flow || "catalog_only",
      online_order_checkout:
        selectedPayload?.online_order_checkout ?? data?.online_order_checkout ?? null,
    };
  }, [data, isWeb, activeWebChannelId]);

  const header = useMemo(() => {
    if (!activeMenuPayload) return null;

    const restaurant = activeMenuPayload.restaurant;
    const branch = activeMenuPayload.branch;
    const salesChannel = activeMenuPayload.sales_channel;
    const table = activeMenuPayload.table;

    return {
      restaurantName: restaurant?.trade_name || "Restaurante",
      restaurantStatus: restaurant?.status,
      branchName: branch?.name || "Sucursal",
      branchStatus: branch?.status,
      channelName: salesChannel?.name || "Canal",
      tableName: table?.name || null,
      tableSeats: table?.seats ? Number(table.seats) : null,
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
    const uiMode = String(ui?.ui_mode || "").trim().toLowerCase();
    const canSelectProducts = ui?.can_select_products === true;

    if (!uiMode) {
      return { tone: "default", label: "Menú" };
    }

    if (
      canSelectProducts &&
      ["selectable", "whatsapp_order", "online_order"].includes(uiMode)
    ) {
      return { tone: "ok", label: "Seleccionable" };
    }

    return { tone: "default", label: "Solo lectura" };
  }, [ui]);

  /**
   * Las secciones siempre salen del payload activo.
   * No existe respaldo con data.sections.
   */
  const sections = useMemo(() => {
    return Array.isArray(activeMenuPayload?.sections)
      ? activeMenuPayload.sections
      : [];
  }, [activeMenuPayload]);

  /**
   * Esto anteriormente se ejecutaba dentro de load().
   * Aquí se deja preparado para la página.
   */
  useEffect(() => {
    if (!activeMenuPayload) return;

    /**
   * La configuración UI correspondiente al payload activo
   * ya fue integrada dentro de activeMenuPayload.
   */
    if (ui?.call_waiter_enabled === true) {
      setCallLocked?.(false);
    }
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
    setWebChannelId,
  };
}