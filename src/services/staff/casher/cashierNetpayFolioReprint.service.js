//src/services/staff/casher/cashierNetpayFolioReprint.service.js
/*
 * Consulta y reimpresión histórica de NetPay por folio.
 * No modifica estados financieros ni ejecuta recuperaciones de cobro.
 */
import {
  acknowledgeNetpayFolioReprintReview,
  acknowledgeNetpayPendingOperation,
  getNetpayCapabilities,
  getNetpayPendingOperation,
  getNetpayResultReference,
  isNetpayBridgeAvailable,
  startNetpayFolioReprint,
} from "../../native/netpayBridge.service";

import {
  closeNetpayFolioReprintReview,
  requestNetpayFolioReprint,
  storeNetpayFolioReprintResult,
} from "./netpayTransaction.service";

import { syncCashierNetpayTerminal } from "./netpayTerminal.service";

const OPERATION_TYPE = "folio_reprint";
const RESULT_TYPE = "folio_reprint_result";

let executionPromise = null;
let resumePromise = null;

function flowError(code, message, data = null) {
  const error = new Error(message);
  error.code = code;
  error.data = data;
  return error;
}

function positiveId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function requiredId(value, name) {
  const id = positiveId(value);

  if (!id) {
    throw flowError(
      "NETPAY_FOLIO_INVALID_REFERENCE",
      `No se pudo identificar ${name} de esta operación.`
    );
  }

  return id;
}

function requiredText(value, name) {
  const text = String(value ?? "").trim();

  if (!text) {
    throw flowError(
      "NETPAY_FOLIO_MISSING_REFERENCE",
      `No se recibió ${name} de esta operación.`
    );
  }

  return text;
}

function assertResponse(response, fallback) {
  if (!response || response.ok !== true) {
    throw flowError(
      response?.code || "NETPAY_FOLIO_REQUEST_FAILED",
      response?.message || fallback,
      response
    );
  }

  return response;
}

function createRequestUuid() {
  if (typeof window === "undefined" || !window.crypto?.getRandomValues) {
    throw flowError(
      "NETPAY_FOLIO_RANDOM_UNAVAILABLE",
      "Este dispositivo no puede generar un identificador seguro para la solicitud."
    );
  }

  if (typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function normalizePendingOperation(raw) {
  if (!raw || typeof raw !== "object") return null;

  return {
    netpayTransactionId: positiveId(raw.netpay_transaction_id ?? raw.netpayTransactionId),
    saleId: positiveId(raw.sale_id ?? raw.saleId),
    netpayTerminalId: positiveId(raw.netpay_terminal_id ?? raw.netpayTerminalId),
    operationUuid: raw.operation_uuid ?? raw.operationUuid ?? null,
    operationType: String(raw.operation_type ?? raw.operationType ?? "").toLowerCase(),
    localState: String(raw.local_state ?? raw.localState ?? "").toLowerCase(),
    folio: raw.folio ?? null,
    environment: raw.environment ?? null,
    resultEventUuid: raw.result_event_uuid ?? raw.resultEventUuid ?? null,
    normalizedResult: raw.normalized_result ?? raw.normalizedResult ?? null,
  };
}

function parseSavedResult(value) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : null;
}

export function getCashierPendingNetpayFolioReprint() {
  if (!isNetpayBridgeAvailable()) {
    return {
      available: false,
      hasPendingOperation: false,
      isFolioReprint: false,
      operation: null,
    };
  }

  const response = getNetpayPendingOperation();

  if (response?.ok === false) {
    throw flowError(
      response?.code || "NETPAY_FOLIO_PENDING_READ_ERROR",
      response?.message || "No se pudo consultar la operación pendiente en la terminal."
    );
  }

  const hasPendingOperation = response?.has_pending_operation === true;
  const operation = hasPendingOperation
    ? normalizePendingOperation(response?.data)
    : null;

  return {
    available: true,
    hasPendingOperation,
    isFolioReprint: operation?.operationType === OPERATION_TYPE,
    operation,
  };
}

async function resolveTerminal(environment) {
  if (!isNetpayBridgeAvailable()) {
    throw flowError(
      "NETPAY_FOLIO_DEVICE_REQUIRED",
      "La consulta y reimpresión requiere utilizar una terminal NetPay compatible."
    );
  }

  const capabilities = getNetpayCapabilities();

  if (!capabilities) {
    throw flowError(
      "NETPAY_FOLIO_CAPABILITIES_MISSING",
      "No se pudieron obtener las características de la terminal NetPay."
    );
  }

  if (String(capabilities.environment || "") !== String(environment || "")) {
    throw flowError(
      "NETPAY_FOLIO_ENVIRONMENT_MISMATCH",
      "La terminal utiliza una configuración diferente a la operación original."
    );
  }

  if (capabilities.netpay_available !== true || capabilities.smart_pinpad_available !== true) {
    throw flowError(
      "NETPAY_FOLIO_TERMINAL_UNAVAILABLE",
      "La terminal NetPay no está disponible para consultar esta operación."
    );
  }

  const syncResponse = assertResponse(
    await syncCashierNetpayTerminal(capabilities),
    "No fue posible sincronizar la terminal NetPay."
  );

  const terminal = syncResponse?.data || null;
  const netpayTerminalId = requiredId(
    terminal?.netpay_terminal_id,
    "la terminal NetPay"
  );

  if (terminal?.can_use_netpay !== true) {
    throw flowError(
      "NETPAY_FOLIO_TERMINAL_NOT_ALLOWED",
      "Esta terminal NetPay no está habilitada para realizar operaciones."
    );
  }

  return netpayTerminalId;
}

async function executeFolioReprint({ saleId, netpayTransactionId, environment }) {
  const validSaleId = requiredId(saleId, "la venta");
  const validTransactionId = requiredId(netpayTransactionId, "la transacción NetPay");
  const validEnvironment = requiredText(environment, "la configuración de NetPay");

  const pending = getCashierPendingNetpayFolioReprint();

  if (pending.hasPendingOperation) {
    throw flowError(
      "NETPAY_FOLIO_ANOTHER_OPERATION_PENDING",
      "La terminal tiene una operación NetPay pendiente. Debes resolverla antes de iniciar otra."
    );
  }

  const netpayTerminalId = await resolveTerminal(validEnvironment);

  // Se crea una sola autorización. Nunca se repite automáticamente una ejecución.
  const idempotencyKey = createRequestUuid();

  const authorization = assertResponse(
    await requestNetpayFolioReprint(validSaleId, validTransactionId, {
      netpay_terminal_id: netpayTerminalId,
      idempotency_key: idempotencyKey,
    }),
    "No fue posible autorizar la consulta NetPay por folio."
  );

  const data = authorization?.data || {};
  const operationUuid = requiredText(data.operation_uuid, "el identificador de la solicitud");

  const referenceMatches =
    positiveId(data.sale_id) === validSaleId &&
    positiveId(data.netpay_transaction_id) === validTransactionId &&
    positiveId(data.netpay_terminal_id) === netpayTerminalId &&
    String(data.environment || "") === validEnvironment;

  if (!referenceMatches) {
    throw flowError(
      "NETPAY_FOLIO_AUTHORIZATION_MISMATCH",
      "La autorización recibida no corresponde a la venta o terminal seleccionada."
    );
  }

  if (authorization.sdk_execution_allowed !== true) {
    return {
      outcome: "already_registered",
      operationUuid,
      message: authorization.message ||
        "Esta solicitud ya fue registrada y no puede ejecutarse nuevamente.",
    };
  }

  const folio = requiredText(data.folio, "el folio original");

  const startResponse = startNetpayFolioReprint({
    netpay_transaction_id: validTransactionId,
    sale_id: validSaleId,
    netpay_terminal_id: netpayTerminalId,
    operation_uuid: operationUuid,
    folio,
    environment: validEnvironment,
    sdk_execution_allowed: true,
  });

  if (startResponse?.ok !== true) {
    const current = getCashierPendingNetpayFolioReprint();
    const resultStored =
      current.isFolioReprint &&
      current.operation?.operationUuid === operationUuid &&
      current.operation?.localState === "result_pending_backend";

    return {
      outcome: resultStored ? "result_pending" : "review_pending",
      operationUuid,
      message: resultStored
        ? "La terminal guardó un resultado que debe registrarse antes de continuar."
        : startResponse?.message ||
          "No se pudo confirmar el inicio de la consulta. Revisa la terminal antes de repetirla.",
    };
  }

  return {
    outcome: "started",
    operationUuid,
    netpayTransactionId: validTransactionId,
    message: "La solicitud fue enviada a la terminal NetPay.",
  };
}

export function executeCashierNetpayFolioReprint(params) {
  if (executionPromise) {
    return Promise.reject(
      flowError(
        "NETPAY_FOLIO_EXECUTION_BUSY",
        "Ya se está preparando una consulta NetPay. No puedes iniciar otra al mismo tiempo."
      )
    );
  }

  executionPromise = executeFolioReprint(params).finally(() => {
    executionPromise = null;
  });

  return executionPromise;
}

async function resumePendingResult() {
  const pending = getCashierPendingNetpayFolioReprint();

  if (!pending.hasPendingOperation) {
    return { outcome: "none" };
  }

  if (!pending.isFolioReprint) {
    return { outcome: "different_operation_type" };
  }

  const operation = pending.operation;
  const operationUuid = requiredText(operation?.operationUuid, "la consulta pendiente");

  if (operation.localState === "requires_review") {
    return {
      outcome: "local_review_required",
      operationUuid,
      message: "La consulta fue interrumpida. Revisa la terminal y registra el resultado de la revisión.",
    };
  }

  if (operation.localState === "prepared") {
    return {
      outcome: "review_pending",
      operationUuid,
      message: "La consulta quedó preparada, pero no se confirmó su ejecución. Revisa la terminal antes de cerrar la revisión.",
    };
  }

  if (operation.localState !== "result_pending_backend") {
    return {
      outcome: "in_progress",
      operationUuid,
      message: "La terminal todavía no ha entregado un resultado para esta consulta.",
    };
  }

  const savedResult = parseSavedResult(operation.normalizedResult);
  const backendPayload = savedResult?.data?.backend_payload;
  const reference = getNetpayResultReference(savedResult);

  if (
    savedResult?.operation !== RESULT_TYPE ||
    !backendPayload ||
    typeof backendPayload !== "object" ||
    Array.isArray(backendPayload)
  ) {
    throw flowError(
      "NETPAY_FOLIO_SAVED_RESULT_INVALID",
      "El resultado guardado en la terminal no tiene un formato válido."
    );
  }

  const saleId = requiredId(operation.saleId, "la venta");
  const netpayTransactionId = requiredId(operation.netpayTransactionId, "la transacción NetPay");
  const netpayTerminalId = requiredId(operation.netpayTerminalId, "la terminal NetPay");

  const eventUuid = requiredText(backendPayload.event_uuid, "el resultado de la consulta");

  const referencesMatch =
    reference.netpayTransactionId === netpayTransactionId &&
    reference.operationUuid === operationUuid &&
    String(backendPayload.operation_uuid || "") === operationUuid &&
    positiveId(backendPayload.netpay_terminal_id) === netpayTerminalId &&
    String(operation.resultEventUuid || "") === eventUuid &&
    String(savedResult.event_uuid || "") === eventUuid &&
    positiveId(savedResult?.data?.sale_id) === saleId;

  if (!referencesMatch) {
    throw flowError(
      "NETPAY_FOLIO_SAVED_RESULT_MISMATCH",
      "La respuesta guardada no corresponde a la consulta NetPay pendiente."
    );
  }

  const backendResponse = assertResponse(
    await storeNetpayFolioReprintResult(
      saleId,
      netpayTransactionId,
      backendPayload
    ),
    "No fue posible registrar el resultado de la consulta NetPay."
  );

  // Confirmar Android solo después de obtener una respuesta satisfactoria.
  const acknowledgement = acknowledgeNetpayPendingOperation({
    netpayTransactionId,
    operationUuid,
  });

  assertResponse(
    acknowledgement,
    "El resultado se registró, pero no pudo liberarse de la terminal."
  );

  const reprintSuccess = backendResponse.reprint_success === true;
  const reviewRequired = backendResponse.review_required === true;

  return {
    outcome: reviewRequired
      ? "review_required"
      : reprintSuccess
      ? "reprinted"
      : "not_reprinted",
    operationUuid,
    eventUuid,
    saleId,
    netpayTransactionId,
    reprintSuccess,
    reviewRequired,
    observedStatus: backendResponse.observed_status || null,
    backendResponse,
    message: backendResponse.message ||
      "Se registró la respuesta de la consulta NetPay.",
  };
}

export function resumeCashierPendingNetpayFolioReprint() {
  if (!resumePromise) {
    resumePromise = resumePendingResult().finally(() => {
      resumePromise = null;
    });
  }

  return resumePromise;
}

export async function closeCashierNetpayFolioReprintReview({
  saleId,
  netpayTransactionId,
  operationUuid,
  resolution,
  terminalChecked,
  reason,
}) {
  const validSaleId = requiredId(saleId, "la venta");
  const validTransactionId = requiredId(netpayTransactionId, "la transacción NetPay");
  const validOperationUuid = requiredText(operationUuid, "la consulta pendiente");
  const validReason = requiredText(reason, "el motivo de la revisión");

  if (!["confirmed_printed", "confirmed_not_printed"].includes(resolution)) {
    throw flowError(
      "NETPAY_FOLIO_RESOLUTION_INVALID",
      "Debes indicar si se imprimió o no el comprobante."
    );
  }

  if (terminalChecked !== true) {
    throw flowError(
      "NETPAY_FOLIO_TERMINAL_NOT_CHECKED",
      "Debes confirmar que revisaste la terminal antes de cerrar la consulta."
    );
  }

  if (validReason.length < 10 || validReason.length > 500) {
    throw flowError(
      "NETPAY_FOLIO_REASON_INVALID",
      "El motivo de la revisión debe contener entre 10 y 500 caracteres."
    );
  }

  const pending = getCashierPendingNetpayFolioReprint();
  let releaseLocalOperation = false;

  if (pending.hasPendingOperation) {
    const sameOperation =
      pending.isFolioReprint &&
      pending.operation?.netpayTransactionId === validTransactionId &&
      pending.operation?.operationUuid === validOperationUuid;

    if (!sameOperation) {
      throw flowError(
        "NETPAY_FOLIO_DIFFERENT_OPERATION_PENDING",
        "La terminal tiene otra operación NetPay pendiente. Debes resolverla antes de continuar."
      );
    }

    if (pending.operation.localState === "result_pending_backend") {
      throw flowError(
        "NETPAY_FOLIO_RESULT_NOT_PROCESSED",
        "La terminal conserva una respuesta pendiente de registro. Debes procesarla antes de cerrar la revisión."
      );
    }

    if (pending.operation.localState === "sdk_in_progress") {
      throw flowError(
        "NETPAY_FOLIO_STILL_RUNNING",
        "La consulta todavía puede estar en curso. Revisa la terminal antes de continuar."
      );
    }

    releaseLocalOperation = pending.operation.localState === "requires_review";
  }

  const backendResponse = assertResponse(
    await closeNetpayFolioReprintReview(validSaleId, validTransactionId, {
      operation_uuid: validOperationUuid,
      resolution,
      terminal_checked: true,
      reason: validReason,
    }),
    "No fue posible registrar el cierre de la revisión NetPay."
  );

  let localReleasePending = false;

  if (releaseLocalOperation) {
    try {
      const acknowledgement = acknowledgeNetpayFolioReprintReview({
        netpayTransactionId: validTransactionId,
        operationUuid: validOperationUuid,
      });

      localReleasePending = acknowledgement?.ok !== true;
    } catch {
      localReleasePending = true;
    }
  }

  return {
    outcome: "closed",
    operationUuid: validOperationUuid,
    alreadyClosed: backendResponse.already_closed === true,
    localReleasePending,
    backendResponse,
    message: localReleasePending
      ? "La revisión fue registrada, pero no pudo liberarse de la terminal. Debes verificar la operación pendiente."
      : backendResponse.message || "La revisión quedó registrada correctamente.",
  };
}