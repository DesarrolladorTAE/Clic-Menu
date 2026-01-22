import api from "./api"; 


export async function getPlans() {
  const res = await api.get("/plans");
  return res.data?.data ?? res.data;
}
