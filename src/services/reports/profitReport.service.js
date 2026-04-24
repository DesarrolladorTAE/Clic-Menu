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

export async function getProfitReportSummary(restaurantId, params = {}) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/reports/profit/summary`,
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

export async function getProfitReportTable(restaurantId, params = {}) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/reports/profit/table`,
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

export function getProfitReportExcelUrl(restaurantId, params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();

  return `/restaurants/${restaurantId}/reports/profit/export/excel${
    query ? `?${query}` : ""
  }`;
}

export function getProfitReportPdfUrl(restaurantId, params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();

  return `/restaurants/${restaurantId}/reports/profit/export/pdf${
    query ? `?${query}` : ""
  }`;
}

export async function downloadProfitReportExcel(restaurantId, params = {}) {
  return api.get(getProfitReportExcelUrl(restaurantId, params), {
    responseType: "blob",
  });
}

export async function downloadProfitReportPdf(restaurantId, params = {}) {
  return api.get(getProfitReportPdfUrl(restaurantId, params), {
    responseType: "blob",
  });
}
