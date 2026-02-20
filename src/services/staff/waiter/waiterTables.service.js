// src/services/staff/staffTables.service.js
import staffApi from "../../staffApi";

/**
 * GET /api/staff/waiter/tables/grid
 * Respuesta esperada:
 * {
 *  ok: true,
 *  meta: {...},
 *  data: [ { id, name, ui_state, actions, call, active_order, ... } ]
 * }
 */
export async function fetchStaffTablesGrid() {
  const res = await staffApi.get("/staff/waiter/tables/grid");
  return res?.data;
}

/**
 * POST /api/staff/waiter/tables/{table}/attend
 */
export async function attendTable(tableId) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/attend`);
  return res?.data;
}

/**
 * POST /api/staff/waiter/tables/{table}/finish-attention
 */
export async function finishAttention(tableId) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/finish-attention`);
  return res?.data;
}