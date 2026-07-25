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
  const isWeb = useMemo(() => String(data?.type) === "web", [data]);

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
     * El backend actual del QR web de WhatsApp ya entrega
     * directamente el menú predeterminado del canal:
     *
     * - data.menu
     * - data.menu_context
     * - data.sections
     * - data.sales_channel
     *
     * Cuando no existe menus_by_channel, data ya es el payload
     * activo y no deben eliminarse sus secciones.
     */
    if (!hasMenusByChannel) {
      return {
        ...data,
        sections: Array.isArray(data?.sections)
          ? data.sections
          : [],
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
        ui: data?.ui,
        table: data?.table,
        ordering_mode: data?.ordering_mode,
        table_service_mode: data?.table_service_mode,
        type: data?.type,
      };
    }

    /**
     * Las secciones pertenecen exclusivamente al payload
     * correspondiente al canal web seleccionado.
     */
    return {
      ...selectedPayload,
      sections: Array.isArray(selectedPayload?.sections)
        ? selectedPayload.sections
        : [],
      ui: data?.ui,
      table: data?.table,
      ordering_mode: data?.ordering_mode,
      table_service_mode: data?.table_service_mode,
      type: data?.type,
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

  const ui = useMemo(
    () => activeMenuPayload?.ui || {},
    [activeMenuPayload]
  );

  const hasTable = !!activeMenuPayload?.table?.id;

  const tableId = activeMenuPayload?.table?.id
    ? Number(activeMenuPayload.table.id)
    : null;

  const badgeUi = useMemo(() => {
    if (!ui?.ui_mode) {
      return {
        tone: "default",
        label: "Menú",
      };
    }

    if (ui.ui_mode === "selectable") {
      return {
        tone: "ok",
        label: "Seleccionable",
      };
    }

    return {
      tone: "default",
      label: "Solo lectura",
    };
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
     * En web, la configuración UI global ya fue integrada
     * dentro de activeMenuPayload.
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