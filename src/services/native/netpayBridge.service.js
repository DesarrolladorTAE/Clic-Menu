// src/services/native/netpayBridge.service.js

export const NETPAY_RESULT_EVENT = "clicmenu:netpay-result";

function createBridgeError(code, message, data = null) {
  const error = new Error(message);
  error.code = code;
  error.data = data;
  return error;
}

function getBridge() {
  if (typeof window === "undefined") return null;
  return window.NetpayBridge || null;
}

function requireBridgeMethod(methodName) {
  const bridge = getBridge();

  if (!bridge) {
    throw createBridgeError(
      "NETPAY_BRIDGE_NOT_AVAILABLE",
      "La integración Android de NetPay no está disponible en este dispositivo."
    );
  }

  if (typeof bridge[methodName] !== "function") {
    throw createBridgeError(
      "NETPAY_BRIDGE_METHOD_NOT_AVAILABLE",
      `Android no expone la función NetPay ${methodName}.`,
      { method: methodName }
    );
  }

  return bridge;
}

function parseBridgeResponse(raw, fallbackMessage) {
  if (raw === null || raw === undefined || raw === "") {
    throw createBridgeError(
      "NETPAY_BRIDGE_EMPTY_RESPONSE",
      fallbackMessage
    );
  }

  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw;
  }

  if (typeof raw !== "string") {
    throw createBridgeError(
      "NETPAY_BRIDGE_INVALID_RESPONSE",
      fallbackMessage
    );
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Respuesta inválida");
    }

    return parsed;
  } catch {
    throw createBridgeError(
      "NETPAY_BRIDGE_INVALID_RESPONSE",
      fallbackMessage
    );
  }
}

function callBridgeJsonMethod(methodName, payload, fallbackMessage) {
  const bridge = requireBridgeMethod(methodName);

  const raw =
    payload === undefined
      ? bridge[methodName]()
      : bridge[methodName](JSON.stringify(payload));

  return parseBridgeResponse(raw, fallbackMessage);
}

function findField(result, names = []) {
  const sources = [];

  if (result && typeof result === "object" && !Array.isArray(result)) {
    sources.push(result);

    if (
      result.data &&
      typeof result.data === "object" &&
      !Array.isArray(result.data)
    ) {
      sources.push(result.data);
    }
  }

  for (const source of sources) {
    for (const name of names) {
      if (
        Object.prototype.hasOwnProperty.call(source, name) &&
        source[name] !== null &&
        source[name] !== undefined &&
        source[name] !== ""
      ) {
        return source[name];
      }
    }
  }

  return null;
}

export function getNetpayResultReference(result) {
  const transactionId = Number(
    findField(result, [
      "netpay_transaction_id",
      "netpayTransactionId",
    ]) || 0
  );

  const operationUuid = findField(result, [
    "operation_uuid",
    "operationUuid",
  ]);

  return {
    netpayTransactionId:
      Number.isInteger(transactionId) && transactionId > 0
        ? transactionId
        : null,
    operationUuid:
      typeof operationUuid === "string" && operationUuid.trim()
        ? operationUuid.trim()
        : null,
  };
}

export function isNetpayBridgeAvailable() {
  const bridge = getBridge();

  return !!bridge &&
    typeof bridge.getCapabilities === "function";
}

export function getNetpayCapabilities() {
  if (!isNetpayBridgeAvailable()) return null;

  const capabilities = callBridgeJsonMethod(
    "getCapabilities",
    undefined,
    "Android devolvió una respuesta NetPay inválida."
  );

  if (capabilities.ok === false) {
    throw createBridgeError(
      capabilities.code || "NETPAY_CAPABILITIES_ERROR",
      capabilities.message ||
        "Android no pudo obtener las capacidades NetPay.",
      capabilities
    );
  }

  return capabilities;
}

export function startNetpaySale(payload) {
  return callBridgeJsonMethod(
    "sale",
    payload,
    "Android no devolvió una respuesta válida al iniciar el cobro NetPay."
  );
}

export function startNetpayRecoveryByFolio(payload) {
  return callBridgeJsonMethod(
    "recoverByFolio",
    payload,
    "Android no devolvió una respuesta válida al iniciar la recuperación NetPay."
  );
}

export function getNetpayPendingOperation() {
  return callBridgeJsonMethod(
    "getPendingOperation",
    undefined,
    "Android no devolvió una respuesta válida al consultar la operación NetPay pendiente."
  );
}

export function acknowledgeNetpayPendingOperation({
  netpayTransactionId,
  operationUuid = null,
}) {
  return callBridgeJsonMethod(
    "acknowledgePendingOperation",
    {
      netpay_transaction_id: Number(netpayTransactionId),
      operation_uuid: operationUuid || null,
    },
    "Android no devolvió una respuesta válida al confirmar la operación NetPay pendiente."
  );
}

export function markNetpayPendingRecovery({
  netpayTransactionId,
  operationUuid = null,
}) {
  return callBridgeJsonMethod(
    "markPendingRecovery",
    {
      netpay_transaction_id: Number(netpayTransactionId),
      operation_uuid: operationUuid || null,
    },
    "Android no devolvió una respuesta válida al marcar la operación NetPay para recuperación."
  );
}

export function subscribeNetpayResult(listener) {
  if (typeof window === "undefined") {
    return () => {};
  }

  if (typeof listener !== "function") {
    throw createBridgeError(
      "NETPAY_RESULT_LISTENER_INVALID",
      "El listener de resultados NetPay no es válido."
    );
  }

  const handler = (event) => {
    const raw = event?.detail;

    if (!raw) return;

    let result = raw;

    if (typeof raw === "string") {
      try {
        result = JSON.parse(raw);
      } catch {
        return;
      }
    }

    if (!result || typeof result !== "object" || Array.isArray(result)) {
      return;
    }

    listener(result, event);
  };

  window.addEventListener(NETPAY_RESULT_EVENT, handler);

  return () => {
    window.removeEventListener(NETPAY_RESULT_EVENT, handler);
  };
}

export function createNetpayResultWaiter({
  netpayTransactionId,
  operationUuid = null,
  signal = null,
} = {}) {
  const expectedTransactionId = Number(netpayTransactionId || 0);
  const expectedOperationUuid =
    typeof operationUuid === "string" && operationUuid.trim()
      ? operationUuid.trim()
      : null;

  let settled = false;
  let unsubscribe = () => {};
  let abortHandler = null;
  let resolvePromise;
  let rejectPromise;

  const cleanup = () => {
    unsubscribe();

    if (signal && abortHandler) {
      signal.removeEventListener("abort", abortHandler);
    }
  };

  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;

    unsubscribe = subscribeNetpayResult((result) => {
      if (settled) return;

      const reference = getNetpayResultReference(result);

      if (
        expectedTransactionId > 0 &&
        reference.netpayTransactionId !== expectedTransactionId
      ) {
        return;
      }

      if (
        expectedOperationUuid &&
        reference.operationUuid !== expectedOperationUuid
      ) {
        return;
      }

      settled = true;
      cleanup();
      resolve(result);
    });

    if (signal) {
      abortHandler = () => {
        if (settled) return;

        settled = true;
        cleanup();

        reject(
          createBridgeError(
            "NETPAY_RESULT_WAIT_ABORTED",
            "La espera del resultado NetPay fue cancelada."
          )
        );
      };

      if (signal.aborted) {
        abortHandler();
        return;
      }

      signal.addEventListener("abort", abortHandler, {
        once: true,
      });
    }
  });

  const cancel = () => {
    if (settled) return;

    settled = true;
    cleanup();

    rejectPromise(
      createBridgeError(
        "NETPAY_RESULT_WAIT_CANCELLED",
        "La espera del resultado NetPay fue cancelada."
      )
    );
  };

  return {
    promise,
    cancel,
  };
}

export function waitForNetpayResult(options = {}) {
  return createNetpayResultWaiter(options).promise;
}
