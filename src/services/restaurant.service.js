//Punto de acceso para restaurant
import api from "./api";

//GET /restautants
export async function getMyRestaurants() {
    const {data} = await api.get("/restaurants");
    return data; 
}

//POST /restaurants
export async function createRestaurant(payload) {
    const {data} = await api.post("/restaurants", payload);
    return data;
}

// GET /restaurants/:id
export async function getRestaurant(id) {
  const { data } = await api.get(`/restaurants/${id}`);
  return data;
}

//PUT /restaurant/:id 
export async function updateRestaurant(id, payload) {
  const { data } = await api.put(`/restaurants/${id}`, payload);
  return data;
}

// DELETE /restaurants/:id
export async function deleteRestaurant(id) {
  const { data } = await api.delete(`/restaurants/${id}`);
  return data;
}


// GET /api/restaurants/:id/subscription
export async function getRestaurantSubscriptionStatus(restaurantId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/subscription`);
  return data;
}

// POST /api/restaurants/:id/subscription
export async function subscribeRestaurant(restaurantId, payload) {
  const res = await api.post(`/restaurants/${restaurantId}/subscribe`, payload);
  return res.data?.data ?? res.data;
}

//PUT  /restaurants/${restaurantId}/main-branch
export async function setRestaurantMainBranch(restaurantId, mainBranchId) {
  const { data } = await api.put(`/restaurants/${restaurantId}/main-branch`, {
    main_branch_id: mainBranchId,
  });
  return data;
}