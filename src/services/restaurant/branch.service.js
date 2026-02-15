import api from "../api";

// GET /restaurants/:restaurantId/branches
export async function getBranchesByRestaurant(restaurantId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/branches`);
  return data; // [] o lista de sucursales
}

// POST /restaurants/:restaurantId/branches
export async function createBranch(restaurantId, payload) {
  const { data } = await api.post(`/restaurants/${restaurantId}/branches`, payload);
  return data; // { message, branch }
}



// PUT /restaurants/:restaurantId/branches/:branchId
export async function updateBranch(restaurantId, branchId, payload) {
  const { data } = await api.put(`/restaurants/${restaurantId}/branches/${branchId}`, payload);
  return data;
}

// GET /restaurants/:restaurantId/branches/:branchId
export async function getBranch(restaurantId, branchId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/branches/${branchId}`);
  return data; // { ...branch } o { data: branch } según backend
}

// DELETE /restaurants/:restaurantId/branches/:branchId
export async function deleteBranch(restaurantId, branchId) {
  const { data } = await api.delete(`/restaurants/${restaurantId}/branches/${branchId}`);
  return data;
}
