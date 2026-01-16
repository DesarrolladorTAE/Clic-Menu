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
