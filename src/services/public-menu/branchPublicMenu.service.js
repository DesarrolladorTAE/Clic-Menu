import api from "../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getBranchPublicMenuSetting(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/public-menu-setting`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data?.data ?? null;
}

export async function createBranchPublicMenuSetting(restaurantId, branchId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/public-menu-setting`,
    payload
  );

  return data?.data ?? null;
}

export async function updateBranchPublicMenuSetting(restaurantId, branchId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/public-menu-setting`,
    payload
  );

  return data?.data ?? null;
}

export async function uploadBranchPublicMenuCover(restaurantId, branchId, file) {
  const fd = new FormData();
  fd.append("image", file);

  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/public-menu/cover`,
    fd
  );

  return data?.data ?? null;
}

export async function deleteBranchPublicMenuCover(restaurantId, branchId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/public-menu/cover`
  );

  return data?.data ?? null;
}


//--------------------- Carrusel --------------------- 
export async function getBranchPublicMenuGallery(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/public-menu/gallery`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data?.data ?? [];
}

export async function uploadBranchPublicMenuGalleryImage(
  restaurantId,
  branchId,
  file,
  payload = {}
) {
  const fd = new FormData();
  fd.append("image", file);

  if (payload.sort_order !== undefined && payload.sort_order !== null) {
    fd.append("sort_order", payload.sort_order);
  }

  if (payload.is_active !== undefined && payload.is_active !== null) {
    fd.append("is_active", payload.is_active ? "1" : "0");
  }

  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/public-menu/gallery`,
    fd
  );

  return data?.data ?? null;
}

export async function updateBranchPublicMenuGalleryImage(
  restaurantId,
  branchId,
  imageId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/public-menu/gallery/${imageId}`,
    payload
  );

  return data?.data ?? null;
}

export async function deleteBranchPublicMenuGalleryImage(
  restaurantId,
  branchId,
  imageId
) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/public-menu/gallery/${imageId}`
  );

  return data;
}
