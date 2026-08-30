// src/services/staff/casher/cashierNetpayVoucherReprint.service.js

/*
 * Orquesta la reimpresión del voucher bancario NetPay.
 * Usa netpayBridge.service.js para comunicarse con Android,
 * netpayTransaction.service.js para registrar la solicitud/resultado en Backend
 * y cashierNetpayPayment.service.js para reutilizar terminal y operación pendiente.
 *
 * Está destinado a los flujos de ticket postpago y de acciones/historial de tickets.
 * No modifica Sale, SalePayment ni estados financieros.
 */

import {
  acknowledgeNetpayPendingOperation,
  createNetpayResultWaiter,
  startNetpayVoucherReprint,
} from "../../native/netpayBridge.service";

import {
  requestNetpayVoucherReprint,
  storeNetpayVoucherReprintResult,
} from "./netpayTransaction.service";

import {
  getCashierPendingNetpayOperation,
  resolveCashierNetpayTerminal,
} from "./cashierNetpayPayment.service";

const VOUCHER_OPERATION_TYPE = "voucher_reprint";
const VOUCHER_RESULT_OPERATION = "voucher_reprint_result";

const BACKEND_PROCESSED_INVALID_CODES = [
  "NETPAY_VOUCHER_REPRINT_ORDER_ID_MISMATCH",
  "NETPAY_VOUCHER_REPRINT_RESPONSE_INVALID",
];

function createVoucherError(code, message, data = null) {
  const error = new Error(message);
  error.code = code;
  error.data = data;
  return error;
}

function apiErrorCode(error) {
  return error?.response?.data?.code || error?.code || "";
}

function apiErrorPayload(error) {
  return error?.response?.data || error?.data || null;
}

function pickMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function positiveInteger(value, fieldName) {
  const normalized = Number(value);

  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw createVoucherError(
      "NETPAY_VOUCHER_INVALID_IDENTIFIER",
      `${fieldName} no es válido.`
    );
  }

  return normalized;
}

function normalizeText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function notifyStatus(onStatus, status, data = null) {
  if (typeof onStatus !== "function") return;
  onStatus({ status, data });
}

function responseOrThrow(response, fallbackMessage) {
  if (!response || typeof response !== "object") {
    throw createVoucherError(
      "NETPAY_VOUCHER_INVALID_RESPONSE",
      fallbackMessage
    );
  }

  if (response.ok === false) {
    throw createVoucherError(
      response.code || "NETPAY_VOUCHER_OPERATION_FAILED",
      response.message || fallbackMessage,
      response
    );
  }

  return response;
}

function normalizeOperationType(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeLocalState(value) {
  return String(value || "").trim().toLowerCase();
}

function ensureVoucherNormalizedResult(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw createVoucherError(
      "NETPAY_VOUCHER_RESULT_INVALID",
      "Android no devolvió un resultado válido para la reimpresión del voucher.",
      result
    );
  }

  if (normalizeOperationType(result.operation) !== VOUCHER_RESULT_OPERATION) {
    throw createVoucherError(
      "NETPAY_VOUCHER_RESULT_OPERATION_MISMATCH",
      "El resultado recibido desde Android no corresponde a una reimpresión de voucher NetPay.",
      result
    );
  }

  const backendPayload = result?.data?.backend_payload;

  if (!backendPayload || typeof backendPayload !== "object" || Array.isArray(backendPayload)) {
    throw createVoucherError(
      "NETPAY_VOUCHER_BACKEND_PAYLOAD_MISSING",
      "Android no devolvió backend_payload para registrar el resultado de la reimpresión.",
      result
    );
  }

  return backendPayload;
}

function acknowledgeVoucherOperation({
  netpayTransactionId,
  operationUuid,
}) {
  const response = acknowledgeNetpayPendingOperation({
    netpayTransactionId,
    operationUuid,
  });

  return responseOrThrow(
    response,
    "Android no pudo confirmar la reimpresión NetPay ya procesada por Backend."
  );
}

async function cancelWaiterSilently(waiter) {
  waiter.cancel();

  try {
    await waiter.promise;
  } catch {
    // Se elimina únicamente el listener local.
  }
}

function resolveVoucherOutcome(backendResponse, backendPayload) {
  if (backendResponse?.reprint_success === true) return "reprinted";

  const executionResult = String(
    backendPayload?.execution_result || ""
  ).toLowerCase();

  if (executionResult === "communication_error") return "communication_error";
  if (executionResult === "not_sent") return "not_sent";

  return "not_reprinted";
}

function validateVoucherAuthorization({
  response,
  saleId,
  netpayTransactionId,
}) {
  responseOrThrow(
    response,
    "Backend no pudo autorizar la reimpresión del voucher NetPay."
  );

  const voucher = response?.data;

  if (!voucher || typeof voucher !== "object" || Array.isArray(voucher)) {
    throw createVoucherError(
      "NETPAY_VOUCHER_AUTHORIZATION_DATA_MISSING",
      "Backend no devolvió los datos necesarios para reimprimir el voucher NetPay.",
      response
    );
  }

  const responseTransactionId = Number(voucher.netpay_transaction_id || 0);
  const operationUuid = normalizeText(voucher.operation_uuid);
  const netpayOrderId = normalizeText(voucher.netpay_order_id);
  const environment = normalizeText(voucher.environment);

  if (
    !Number.isInteger(responseTransactionId) ||
    responseTransactionId !== netpayTransactionId ||
    !operationUuid ||
    !netpayOrderId ||
    !environment
  ) {
    throw createVoucherError(
      "NETPAY_VOUCHER_AUTHORIZATION_DATA_INCOMPLETE",
      "Backend autorizó la reimpresión, pero devolvió datos incompletos o inconsistentes para Android.",
      response
    );
  }

  return {
    netpayTransactionId: responseTransactionId,
    saleId,
    operationUuid,
    netpayOrderId,
    environment,
    raw: voucher,
  };
}

function validatePendingVoucherReference({
  operation,
  saleId,
  netpayTransactionId,
}) {
  if (!operation) {
    throw createVoucherError(
      "NETPAY_VOUCHER_PENDING_OPERATION_MISSING",
      "No existe una reimpresión NetPay pendiente en Android."
    );
  }

  if (normalizeOperationType(operation.operationType) !== VOUCHER_OPERATION_TYPE) {
    throw createVoucherError(
      "NETPAY_PENDING_OPERATION_EXISTS",
      "Existe otra operación NetPay pendiente. Debe resolverse antes de reimprimir un voucher.",
      operation.raw
    );
  }

  if (operation.saleId !== saleId || operation.netpayTransactionId !== netpayTransactionId) {
    throw createVoucherError(
      "NETPAY_VOUCHER_PENDING_REFERENCE_MISMATCH",
      "La reimpresión NetPay pendiente pertenece a otra venta u operación.",
      operation.raw
    );
  }

  if (!normalizeText(operation.operationUuid)) {
    throw createVoucherError(
      "NETPAY_VOUCHER_PENDING_OPERATION_UUID_MISSING",
      "La reimpresión NetPay pendiente no contiene operation_uuid.",
      operation.raw
    );
  }

  return operation;
}

async function processVoucherNormalizedResult({
  saleId,
  netpayTransactionId,
  operationUuid,
  normalizedResult,
  onStatus,
}) {
  const backendPayload = ensureVoucherNormalizedResult(normalizedResult);

  const payloadOperationUuid = normalizeText(backendPayload.operation_uuid);

  if (!payloadOperationUuid || payloadOperationUuid !== operationUuid) {
    throw createVoucherError(
      "NETPAY_VOUCHER_RESULT_OPERATION_UUID_MISMATCH",
      "El resultado Android no corresponde a la operación de reimpresión esperada.",
      normalizedResult
    );
  }

  notifyStatus(onStatus, "sending_voucher_result", {
    netpay_transaction_id: netpayTransactionId,
    operation_uuid: operationUuid,
    execution_result: backendPayload.execution_result || null,
  });

  let backendResponse;

  try {
    backendResponse = await storeNetpayVoucherReprintResult(
      saleId,
      netpayTransactionId,
      backendPayload
    );
  } catch (error) {
    const code = apiErrorCode(error);

    /*
     * Estos dos errores se generan DESPUÉS de que Backend registra
     * EVENT_REPRINT_RESPONSE. Por ello Android ya puede recibir ACK.
     */
    if (BACKEND_PROCESSED_INVALID_CODES.includes(code)) {
      acknowledgeVoucherOperation({
        netpayTransactionId,
        operationUuid,
      });

      return {
        outcome: "invalid_response",
        reprintSuccess: false,
        backendProcessed: true,
        backendResponse: apiErrorPayload(error),
        normalizedResult,
      };
    }

    throw error;
  }

  responseOrThrow(
    backendResponse,
    "Backend no pudo registrar el resultado de la reimpresión NetPay."
  );

  acknowledgeVoucherOperation({
    netpayTransactionId,
    operationUuid,
  });

  return {
    outcome: resolveVoucherOutcome(backendResponse, backendPayload),
    reprintSuccess: backendResponse?.reprint_success === true,
    backendProcessed: true,
    eventReplay: backendResponse?.event_replay === true,
    idempotentReplay: backendResponse?.idempotent_replay === true,
    backendResponse,
    normalizedResult,
  };
}

async function startPersistedVoucherOperation({
  operation,
  onStatus,
  signal,
}) {
  const saleId = positiveInteger(operation.saleId, "sale_id");
  const netpayTransactionId = positiveInteger(
    operation.netpayTransactionId,
    "netpay_transaction_id"
  );

  const operationUuid = normalizeText(operation.operationUuid);
  const netpayOrderId = normalizeText(operation.netpayOrderId);
  const environment = normalizeText(operation.environment);

  if (!operationUuid || !netpayOrderId || !environment) {
    throw createVoucherError(
      "NETPAY_VOUCHER_PENDING_DATA_INCOMPLETE",
      "La reimpresión NetPay pendiente no conserva operation_uuid, orderId o environment.",
      operation.raw
    );
  }

  const waiter = createNetpayResultWaiter({
    netpayTransactionId,
    operationUuid,
    signal,
  });

  notifyStatus(onStatus, "starting_pending_voucher_reprint", operation);

  const androidStart = startNetpayVoucherReprint({
    netpay_transaction_id: netpayTransactionId,
    sale_id: saleId,
    operation_uuid: operationUuid,
    netpay_order_id: netpayOrderId,
    environment,
  });

  const notSent =
    androidStart?.code === "NETPAY_VOUCHER_REPRINT_NOT_SENT";

  if (androidStart?.ok === false && !notSent) {
    await cancelWaiterSilently(waiter);

    throw createVoucherError(
      androidStart.code || "NETPAY_VOUCHER_REPRINT_START_FAILED",
      androidStart.message || "Android no pudo iniciar la reimpresión del voucher NetPay.",
      androidStart
    );
  }

  /*
   * NETPAY_VOUCHER_REPRINT_NOT_SENT es especial:
   * Android ya persistió y emitió voucher_reprint_result con
   * execution_result=not_sent. No cancelamos el waiter.
   */
  notifyStatus(onStatus, "waiting_voucher_result", operation);

  const normalizedResult = await waiter.promise;

  return processVoucherNormalizedResult({
    saleId,
    netpayTransactionId,
    operationUuid,
    normalizedResult,
    onStatus,
  });
}

export async function resumeCashierPendingNetpayVoucherReprint({
  saleId,
  netpayTransactionId,
  onStatus = null,
  signal = null,
}) {
  const normalizedSaleId = positiveInteger(saleId, "sale_id");
  const transactionId = positiveInteger(
    netpayTransactionId,
    "netpay_transaction_id"
  );

  const pending = getCashierPendingNetpayOperation();

  if (!pending.hasPendingOperation || !pending.operation) {
    return {
      outcome: "none",
      pendingOperation: null,
    };
  }

  const operation = validatePendingVoucherReference({
    operation: pending.operation,
    saleId: normalizedSaleId,
    netpayTransactionId: transactionId,
  });

  notifyStatus(onStatus, "resuming_voucher_reprint", operation);

  if (operation.normalizedResult) {
    return processVoucherNormalizedResult({
      saleId: normalizedSaleId,
      netpayTransactionId: transactionId,
      operationUuid: normalizeText(operation.operationUuid),
      normalizedResult: operation.normalizedResult,
      onStatus,
    });
  }

  const localState = normalizeLocalState(operation.localState);

  if (localState === "sdk_in_progress") {
    return {
      outcome: "voucher_in_progress",
      pendingOperation: operation,
    };
  }

  if (localState === "result_pending_backend") {
    throw createVoucherError(
      "NETPAY_VOUCHER_PENDING_RESULT_MISSING",
      "Android indica que existe un resultado de voucher pendiente, pero no devolvió el resultado persistido.",
      operation.raw
    );
  }

  if (localState === "prepared" || localState === "requires_review") {
    return startPersistedVoucherOperation({
      operation,
      onStatus,
      signal,
    });
  }

  throw createVoucherError(
    "NETPAY_VOUCHER_PENDING_STATE_NOT_SUPPORTED",
    `La reimpresión NetPay pendiente está en un estado que no puede continuarse automáticamente: ${localState || "desconocido"}.`,
    operation.raw
  );
}

export async function executeCashierNetpayVoucherReprint({
  saleId,
  netpayTransactionId,
  onStatus = null,
  signal = null,
}) {
  const normalizedSaleId = positiveInteger(saleId, "sale_id");
  const transactionId = positiveInteger(
    netpayTransactionId,
    "netpay_transaction_id"
  );

  /*
   * Android admite una sola operación NetPay pendiente.
   * Si ya existe exactamente este voucher, retomamos la misma operación.
   * Si es otra operación, no generamos una segunda solicitud Backend.
   */
  const pending = getCashierPendingNetpayOperation();

  if (pending.hasPendingOperation && pending.operation) {
    const operationType = normalizeOperationType(
      pending.operation.operationType
    );

    const sameVoucher =
      operationType === VOUCHER_OPERATION_TYPE &&
      pending.operation.saleId === normalizedSaleId &&
      pending.operation.netpayTransactionId === transactionId;

    if (sameVoucher) {
      return resumeCashierPendingNetpayVoucherReprint({
        saleId: normalizedSaleId,
        netpayTransactionId: transactionId,
        onStatus,
        signal,
      });
    }

    throw createVoucherError(
      "NETPAY_PENDING_OPERATION_EXISTS",
      "Existe otra operación NetPay pendiente. Debe resolverse antes de iniciar una nueva reimpresión.",
      pending.operation.raw
    );
  }

  notifyStatus(onStatus, "resolving_terminal");

  const resolved = await resolveCashierNetpayTerminal();

  notifyStatus(onStatus, "requesting_voucher_reprint", {
    sale_id: normalizedSaleId,
    netpay_transaction_id: transactionId,
    netpay_terminal_id: resolved.terminal.netpay_terminal_id,
  });

  const requestResponse = await requestNetpayVoucherReprint(
    normalizedSaleId,
    transactionId,
    {
      netpay_terminal_id: resolved.terminal.netpay_terminal_id,
    }
  );

  const authorization = validateVoucherAuthorization({
    response: requestResponse,
    saleId: normalizedSaleId,
    netpayTransactionId: transactionId,
  });

  /*
   * El waiter se crea ANTES de llamar a Android para no perder
   * un voucher_reprint_result emitido inmediatamente.
   */
  const waiter = createNetpayResultWaiter({
    netpayTransactionId: transactionId,
    operationUuid: authorization.operationUuid,
    signal,
  });

  notifyStatus(onStatus, "starting_voucher_reprint", authorization.raw);

  const androidStart = startNetpayVoucherReprint({
    netpay_transaction_id: transactionId,
    sale_id: normalizedSaleId,
    operation_uuid: authorization.operationUuid,
    netpay_order_id: authorization.netpayOrderId,
    environment: authorization.environment,
  });

  const notSent =
    androidStart?.code === "NETPAY_VOUCHER_REPRINT_NOT_SENT";

  if (androidStart?.ok === false && !notSent) {
    await cancelWaiterSilently(waiter);

    throw createVoucherError(
      androidStart.code || "NETPAY_VOUCHER_REPRINT_START_FAILED",
      androidStart.message || "Android no pudo iniciar la reimpresión del voucher NetPay.",
      androidStart
    );
  }

  /*
   * En NETPAY_VOUCHER_REPRINT_NOT_SENT Android sí genera,
   * persiste y emite voucher_reprint_result. Por eso esperamos
   * el evento en vez de cancelar el listener.
   */
  notifyStatus(onStatus, "waiting_voucher_result", authorization.raw);

  const normalizedResult = await waiter.promise;

  const processed = await processVoucherNormalizedResult({
    saleId: normalizedSaleId,
    netpayTransactionId: transactionId,
    operationUuid: authorization.operationUuid,
    normalizedResult,
    onStatus,
  });

  notifyStatus(onStatus, "completed", processed);

  return {
    ...processed,
    terminal: resolved.terminal,
    capabilities: resolved.capabilities,
    requestResponse,
    androidStart,
  };
}

export function getCashierNetpayVoucherReprintError(error) {
  return {
    code: apiErrorCode(error) || "NETPAY_VOUCHER_REPRINT_ERROR",
    message: pickMessage(
      error,
      "No fue posible completar la reimpresión del voucher NetPay."
    ),
    data: apiErrorPayload(error),
  };
}
