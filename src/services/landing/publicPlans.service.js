// src/services/landing/publicPlans.service.js
import api from "../api";

export async function getPublicPlans() {
  const { data } = await api.get("/public/plans");
  return data?.data || [];
}