import api from "../api";

// GET /restaurants/:restaurantId/demo-content
export async function getDemoContentStatus(restaurantId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/demo-content`);
  return data;
}

// DELETE /restaurants/:restaurantId/branches/:branchId/demo-content
export async function deleteDemoContent(restaurantId, branchId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/demo-content`,
    {
      data: {
        confirm: true,
      },
    }
  );

  return data;
}