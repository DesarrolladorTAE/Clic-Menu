import api from "../api";

export async function getAssignments(restaurantId, userId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/staff/${userId}/assignments`);
  return data?.data ?? [];
}

export async function createAssignment(restaurantId, userId, payload) {
  const { data } = await api.post(`/restaurants/${restaurantId}/staff/${userId}/assignments`, payload);
  return data;
}

export async function updateAssignment(restaurantId, userId, assignmentId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/staff/${userId}/assignments/${assignmentId}`,
    payload
  );
  return data;
}

export async function deleteAssignment(restaurantId, userId, assignmentId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/staff/${userId}/assignments/${assignmentId}`
  );
  return data;
}
