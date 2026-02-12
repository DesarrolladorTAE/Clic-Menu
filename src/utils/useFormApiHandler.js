/**
 * Mapea errores 422 del backend a React Hook Form:
 * - setError("field", { type: "server", message: "..." })
 *
 * Espera backend tipo Laravel:
 * {
 *   message: "...",
 *   errors: {
 *     field: ["msg1", "msg2"],
 *     other: ["..."]
 *   }
 * }
 */

export function handleFormApiError(error, setError, opts = {}) {
  const status = error?.response?.status;
  const data = error?.response?.data;

  // 422 validation
  if (status === 422 && data?.errors && typeof data.errors === "object") {
    Object.entries(data.errors).forEach(([field, messages]) => {
      const msg = Array.isArray(messages) ? messages[0] : String(messages || "");
      setError(field, { type: "server", message: msg });
    });

    if (opts?.onValidation) opts.onValidation(data);
    return true;
  }

  // 401/403
  if ((status === 401 || status === 403) && opts?.onAuth) {
    opts.onAuth(error);
    return true;
  }

  // Fallback toast/message
  if (opts?.onMessage) {
    const msg = data?.message || error?.message || "Error inesperado";
    opts.onMessage(msg);
    return true;
  }

  return false;
}
