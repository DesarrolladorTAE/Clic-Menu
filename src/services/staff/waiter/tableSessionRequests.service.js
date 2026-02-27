// src/services/staff/waiter/tableSessionRequests.service.js
import staffApi from "../../staffApi";

export async function fetchTableSessionRequests() {
  const res = await staffApi.get("/staff/waiter/table-session-requests");
  return res?.data;
}

export async function approveTableSessionRequest(reqId) {
  const res = await staffApi.post(`/staff/waiter/table-session-requests/${reqId}/approve`);
  return res?.data;
}

export async function rejectTableSessionRequest(reqId) {
  const res = await staffApi.delete(`/staff/waiter/table-session-requests/${reqId}`);
  return res?.data;
}