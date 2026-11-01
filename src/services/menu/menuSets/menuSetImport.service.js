//src/services/menu/menuSets/menuSetImport.service.js
import api from "../../api";

const importUrl = (restaurantId, branchId, menuSetId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}/import`;

function getDownloadFilename(disposition, fallback) {
  if (!disposition) return fallback;

  const encoded = disposition.match(/filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i);
  const regular = disposition.match(/filename\s*=\s*(?:"([^"]+)"|([^;]+))/i);

  let filename = encoded?.[1] || regular?.[1] || regular?.[2] || fallback;

  try {
    filename = decodeURIComponent(filename.trim().replace(/^["']|["']$/g, ""));
  } catch {
    filename = filename.trim().replace(/^["']|["']$/g, "");
  }

  return filename.replace(/[\\/]/g, "_") || fallback;
}

async function downloadFile(url, params, fallbackFilename) {
  try {
    const response = await api.get(url, { params, responseType: "blob" });

    const disposition = response.headers?.get?.("content-disposition")
      || response.headers?.["content-disposition"];

    return {
      blob: response.data,
      filename: getDownloadFilename(disposition, fallbackFilename),
    };
  } catch (error) {
    const responseData = error?.response?.data;

    if (responseData instanceof Blob) {
      let details = null;

      try {
        details = JSON.parse(await responseData.text());
      } catch {
        details = null;
      }

      if (details && typeof details === "object") {
        const fieldErrors = details.errors && typeof details.errors === "object"
          ? Object.values(details.errors).flat()
          : [];

        const message = fieldErrors.find((value) => typeof value === "string")
          || details.message || "No fue posible preparar la descarga.";

        const normalizedError = new Error(message);
        normalizedError.response = { ...error.response, data: details };
        throw normalizedError;
      }
    }

    throw error;
  }
}

function validateResponse(data, field, message) {
  if (!data || typeof data[field] !== "object" || data[field] === null) {
    throw new Error(message);
  }

  return data[field];
}

// Consultar el estado y el periodo comercial calculados por el servidor.
export async function getMenuSetImportCurrentStatus(
  restaurantId, branchId, menuSetId, targetWeekStart = null, signal = undefined
) {
  const params = targetWeekStart ? { target_week_start: targetWeekStart } : {};

  const { data } = await api.get(
    `${importUrl(restaurantId, branchId, menuSetId)}/current-status`,
    { params, signal }
  );

  return validateResponse(data, "data", "No se recibió el estado de actualización del conjunto.");
}

// Descargar plantilla para el periodo y la capacidad de la próxima importación.
export async function downloadMenuSetImportTemplate(
  restaurantId, branchId, menuSetId, format = "xlsx", targetWeekStart = null
) {
  const params = { format };

  if (targetWeekStart) {
    params.target_week_start = targetWeekStart;
  }

  const extension = format === "csv" ? "csv" : "xlsx";

  return downloadFile(
    `${importUrl(restaurantId, branchId, menuSetId)}/template`,
    params,
    `plantilla_conjunto_${menuSetId}.${extension}`
  );
}

// Descargar la configuración aplicable a una fecha de servicio.
export async function downloadMenuSetCurrentConfiguration(
  restaurantId, branchId, menuSetId, format = "xlsx", serviceDate = null
) {
  const params = { format };

  if (serviceDate) {
    params.service_date = serviceDate;
  }

  return downloadFile(
    `${importUrl(restaurantId, branchId, menuSetId)}/current`,
    params,
    `configuracion_conjunto_${menuSetId}.${format}`
  );
}

// Enviar un archivo para generar su vista previa.
export async function previewMenuSetImport(
  restaurantId, branchId, menuSetId, payload, signal = undefined
) {
  const { data } = await api.post(
    `${importUrl(restaurantId, branchId, menuSetId)}/preview`,
    payload,
    {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
    }
  );

  return data;
}

// Publicar una importación previamente revisada.
export async function publishMenuSetImport(
  restaurantId, branchId, menuSetId, importId, signal = undefined
) {
  const { data } = await api.post(
    `${importUrl(restaurantId, branchId, menuSetId)}/publish`,
    { import_id: Number(importId) },
    { signal }
  );

  return data;
}

// Consultar el historial de intentos con paginación de cinco registros.
export async function getMenuSetImportHistory(
  restaurantId, branchId, menuSetId, page = 1, perPageOrSignal = 5, signal = undefined
) {
  const perPage = typeof perPageOrSignal === "number" ? perPageOrSignal : 5;
  const requestSignal = typeof perPageOrSignal === "number"
    ? signal : (perPageOrSignal ?? signal);

  const { data } = await api.get(
    `${importUrl(restaurantId, branchId, menuSetId)}/history`,
    { params: { page, per_page: perPage }, signal: requestSignal }
  );

  return validateResponse(data, "data", "No se recibió el historial de importaciones.");
}

// Consultar el detalle de una importación.
export async function getMenuSetImportDetail(restaurantId, branchId, menuSetId, importId) {
  const { data } = await api.get(
    `${importUrl(restaurantId, branchId, menuSetId)}/history/${importId}`
  );

  return validateResponse(data, "data", "No se recibió el detalle de la importación.");
}

export async function downloadMenuSetImportCurrent(
  restaurantId, branchId, menuSetId, format, serviceDate, signal = undefined
) {
  const response = await api.get(
    `${importUrl(restaurantId, branchId, menuSetId)}/current`,
    {
      params: { format, service_date: serviceDate },
      responseType: "blob",
      signal,
    }
  );

  const disposition = String(response.headers?.["content-disposition"] || "");
  const encodedName = disposition.match(/filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i);
  const plainName = disposition.match(/filename\s*=\s*"?([^";]+)"?/i);
  let filename = "";

  try {
    if (encodedName) {
      filename = decodeURIComponent(encodedName[1].trim().replace(/^"|"$/g, ""));
    }
  } catch {
    filename = "";
  }

  if (!filename && plainName) filename = plainName[1].trim();

  const contentType = String(response.headers?.["content-type"] || "");
  const extension = contentType.includes("zip") ? "zip" : format;

  return {
    blob: response.data,
    filename: filename || `programacion_vigente_${serviceDate}.${extension}`,
  };
}

export async function getMenuSetImportHistoryDetail(
  restaurantId, branchId, menuSetId, importId, signal = undefined
) {
  const { data } = await api.get(
    `${importUrl(restaurantId, branchId, menuSetId)}/history/${importId}`,
    { signal }
  );

  return data?.data;
}

export async function getMenuSetPublicationHistory(
  restaurantId, branchId, menuSetId, page = 1, signal = undefined
) {
  const { data } = await api.get(
    `${importUrl(restaurantId, branchId, menuSetId)}/publications`,
    { params: { page, per_page: 5 }, signal }
  );

  return data?.data;
}