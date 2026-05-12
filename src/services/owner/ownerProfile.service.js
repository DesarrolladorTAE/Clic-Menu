// src/services/owner/ownerProfile.service.js
import api from "../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getOwnerProfile() {
  const { data } = await api.get("/owner/profile", {
    params: {
      _t: Date.now(),
    },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function updateOwnerProfile(payload) {
  const { data } = await api.put("/owner/profile", payload, {
    headers: NO_CACHE_HEADERS,
  });

  return data;
}