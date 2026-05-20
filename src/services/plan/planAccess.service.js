import api from "../api";
import staffApi from "../staffApi";

export async function getPlanAccess(restaurantId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/plan-access`
  );

  return data?.data ?? data;
}

export async function getStaffPlanAccess() {
  const { data } = await staffApi.get(
    "/staff/cashier/plan-access"
  );

  return data?.data ?? data;
}