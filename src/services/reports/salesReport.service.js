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

export async function getSalesReportSummary(restaurantId, params = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/reports/summary`, {
    params: {
      ...cleanParams(params),
      _t: Date.now(),
    },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function getSalesReportTable(restaurantId, params = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/reports/sales`, {
    params: {
      ...cleanParams(params),
      _t: Date.now(),
    },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export function getSalesReportExcelUrl(restaurantId, params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();

  return `/restaurants/${restaurantId}/reports/export/excel${
    query ? `?${query}` : ""
  }`;
}

export function getSalesReportPdfUrl(restaurantId, params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();

  return `/restaurants/${restaurantId}/reports/export/pdf${
    query ? `?${query}` : ""
  }`;
}

export async function downloadSalesReportExcel(restaurantId, params = {}) {
  return api.get(getSalesReportExcelUrl(restaurantId, params), {
    responseType: "blob",
  });
}

export async function downloadSalesReportPdf(restaurantId, params = {}) {
  return api.get(getSalesReportPdfUrl(restaurantId, params), {
    responseType: "blob",
  });
}
