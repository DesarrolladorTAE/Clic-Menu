import api from "../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getTaxProfile() {
  const { data } = await api.get("/tax-profile", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function updateTaxProfile(payload) {
  const { data } = await api.put("/tax-profile", payload, {
    headers: NO_CACHE_HEADERS,
  });

  return data;
}