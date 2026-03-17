// src/services/products/catalog/productComponents.service.js
import api from "../../api";

function cleanObject(obj = {}) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  );
}

function normalizeParams(params = {}, productsMode) {
  const cleaned = cleanObject(params);

  if (productsMode === "global") {
    delete cleaned.branch_id;
  }

  return cleaned;
}

function normalizePayload(payload = {}, productsMode) {
  const cleaned = { ...payload };

  if (productsMode === "global") {
    delete cleaned.branch_id;
  }

  return cleanObject(cleaned);
}



export async function getProductComponents( restaurantId, productId, params = {}, productsMode ) {
  const finalParams = normalizeParams(params, productsMode);

  const { data } = await api.get( 
    `/restaurants/${restaurantId}/products/${productId}/components`, 
    { params: finalParams } 
  );
  return data;
}

export async function upsertProductComponents( restaurantId, productId, payload, productsMode) {
  const finalPayload = normalizePayload(payload, productsMode);

  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/components`,
    finalPayload
  );
  return data;
}

export async function getComponentCandidates( restaurantId, productId, params = {}, productsMode ) {
  const finalParams = normalizeParams(params, productsMode);

  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/components/candidates`,
    { params: finalParams }
  );
  return data;
}