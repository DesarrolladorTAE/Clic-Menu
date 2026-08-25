//src/services/native/netpayBridge.service.js

export function isNetpayBridgeAvailable() {
  if (typeof window === "undefined") return false;

  const bridge = window.NetpayBridge;

  return !!bridge && typeof bridge.getCapabilities === "function";
}

export function getNetpayCapabilities() {
  if (!isNetpayBridgeAvailable()) return null;

  const raw = window.NetpayBridge.getCapabilities();

  if (raw === null || raw === undefined || raw === "") {
    throw new Error("Android no devolvió las capacidades NetPay.");
  }

  let capabilities = raw;

  if (typeof raw === "string") {
    try {
      capabilities = JSON.parse(raw);
    } catch {
      throw new Error("Android devolvió una respuesta NetPay inválida.");
    }
  }

  if (!capabilities || typeof capabilities !== "object" || Array.isArray(capabilities)) {
    throw new Error("Las capacidades NetPay recibidas desde Android no son válidas.");
  }

  if (capabilities.ok === false) {
    throw new Error(capabilities.message || "Android no pudo obtener las capacidades NetPay.");
  }

  return capabilities;
}
