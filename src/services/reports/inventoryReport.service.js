import api from "../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== undefined && value !== null && value !== "";
    })
  );
}

export async function getInventoryReportSummary(restaurantId, params = {}) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/reports/inventory/summary`,
    {
      params: {
        ...cleanParams(params),
        _t: Date.now(),
      },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}

export async function getInventoryReportTable(restaurantId, params = {}) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/reports/inventory/table`,
    {
      params: {
        ...cleanParams(params),
        _t: Date.now(),
      },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}

export function getInventoryReportExcelUrl(restaurantId, params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();
  return `/restaurants/${restaurantId}/reports/inventory/export/excel${
    query ? `?${query}` : ""
  }`;
}

export function getInventoryReportPdfUrl(restaurantId, params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();
  return `/restaurants/${restaurantId}/reports/inventory/export/pdf${
    query ? `?${query}` : ""
  }`;
}

export async function downloadInventoryReportExcel(restaurantId, params = {}) {
  const response = await api.get(getInventoryReportExcelUrl(restaurantId, params), {
    responseType: "blob",
  });

  return response;
}

export async function downloadInventoryReportPdf(restaurantId, params = {}) {
  const response = await api.get(getInventoryReportPdfUrl(restaurantId, params), {
    responseType: "blob",
  });

  return response;
}