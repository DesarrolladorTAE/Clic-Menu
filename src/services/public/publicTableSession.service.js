// src/services/public/publicTableSession.service.js
import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE_URL || "https://api.clicmenu.com.mx/api";

const publicApi = axios.create({
  baseURL: apiBase,
  headers: { Accept: "application/json" },
});

export async function scanTable(tableId, deviceIdentifier) {
  const { data } = await publicApi.post(`/public/tables/${tableId}/scan`, {
    device_identifier: deviceIdentifier,
  });
  // { ok, message, data: { session_id, remaining_seconds, expires_at, ... } }
  return data;
}

export async function getTableSession(sessionId, deviceIdentifier) {
  const { data } = await publicApi.get(`/public/table-sessions/${sessionId}`, {
    params: { device_identifier: deviceIdentifier },
  });
  return data;
}

export async function heartbeatTableSession(sessionId, deviceIdentifier) {
  const { data } = await publicApi.post(`/public/table-sessions/${sessionId}/heartbeat`, {
    device_identifier: deviceIdentifier,
  });
  return data;
}