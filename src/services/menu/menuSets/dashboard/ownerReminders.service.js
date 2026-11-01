//src/services/menu/menuSets/dashboard/ownerReminders.service.js
import api from "../../../api";

const reminderUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/operational-dashboard/reminders`;

const branchUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}`;

// Consultar una simulación sin registrar ni enviar recordatorios.
export async function getOwnerReminderPreview(
  restaurantId, branchId, filters = {}, signal = undefined
) {
  const params = {};

  if (filters.reference_at) {
    params.reference_at = filters.reference_at;
  }

  if (filters.reminder_type && filters.reminder_type !== "all") {
    params.reminder_type = filters.reminder_type;
  }

  const { data } = await api.get(`${reminderUrl(restaurantId, branchId)}/preview`, {
    params, signal,
  });

  const result = data?.data;

  if (data?.ok !== true || !result?.branch || !result?.summary
    || !Array.isArray(result?.candidates) || !Array.isArray(result?.groups)) {
    throw new Error("No se recibió la simulación de los avisos.");
  }

  return result;
}

// Consultar los intentos históricos, paginados de cinco en cinco.
export async function getOwnerReminderHistory(
  restaurantId, branchId, filters = {}, signal = undefined
) {
  const params = {
    page: Math.max(1, Number(filters.page) || 1),
    per_page: 5,
  };

  if (filters.reminder_type && filters.reminder_type !== "all") {
    params.reminder_type = filters.reminder_type;
  }

  if (filters.status && filters.status !== "all") {
    params.status = filters.status;
  }

  const { data } = await api.get(reminderUrl(restaurantId, branchId), {
    params, signal,
  });

  const result = data?.data;

  if (data?.ok !== true || !Array.isArray(result?.data)
    || result?.current_page === undefined || result?.total === undefined
    || result?.last_page === undefined) {
    throw new Error("No se recibió el historial de los avisos.");
  }

  return result;
}

// Consultar la configuración efectiva sin devolver credenciales.
export async function getReminderWhatsappSetting(
  restaurantId, branchId, signal = undefined
) {
  const { data } = await api.get(
    `${branchUrl(restaurantId, branchId)}/whasapo-setting`,
    { signal }
  );

  const result = data?.data;
  const setting = result?.whasapo_setting;

  if (data?.ok !== true || !result?.branch || !setting) {
    throw new Error("No se recibió la configuración de WhatsApp de la sucursal.");
  }

  return {
    branch: {
      id: result.branch.id,
      name: result.branch.name,
    },
    setting: {
      use_custom_token: Boolean(setting.use_custom_token),
      has_custom_token: Boolean(setting.has_custom_token),
      preferred_channel: setting.preferred_channel,
      effective_channel: setting.effective_channel,
      can_choose_channel: Boolean(setting.can_choose_channel),
      whasapo_available: Boolean(setting.whasapo_available),
      addon_whatsapp_qr_available: Boolean(setting.addon_whatsapp_qr_available),
      qr_connection_status: setting.qr_connection_status,
      qr_connected: Boolean(setting.qr_connected),
      reconnect_required: Boolean(setting.reconnect_required),
      using_system_fallback: Boolean(setting.using_system_fallback),
    },
  };
}

// Consultar únicamente el estado almacenado de la conexión QR.
export async function getReminderWhatsappQrConnection(
  restaurantId, branchId, signal = undefined
) {
  const { data } = await api.get(
    `${branchUrl(restaurantId, branchId)}/whatsapp-qr-connection`,
    { signal }
  );

  if (data?.ok !== true || !Object.prototype.hasOwnProperty.call(data, "connection")) {
    throw new Error("No se recibió el estado de la conexión WhatsApp QR.");
  }

  const connection = data.connection;

  return {
    reconnect_required: Boolean(data.reconnect_required),
    connection: connection ? {
      id: connection.id,
      name: connection.name,
      status: connection.status,
      phone_number: connection.phone_number,
      last_synced_at: connection.last_synced_at,
      connected: Boolean(connection.connected),
    } : null,
  };
}