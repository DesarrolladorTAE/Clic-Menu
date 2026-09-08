// src/services/staff/casher/cashierNetpayPayment.service.js

/*
 * Orquesta el flujo NetPay de caja entre Backend, React y Android:
 * cobro, persistencia de resultados, recovery por folio y reanudación segura.
 *
 * Usa:
 * - src/services/native/netpayBridge.service.js
 * - src/services/staff/casher/netpayTransaction.service.js
 * - src/services/staff/casher/netpayTerminal.service.js
 *
 * Lo usan:
 * - src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js
 * - src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js
 */
import {
  acknowledgeNetpayPendingOperation,
  createNetpayResultWaiter,
  getNetpayCapabilities,
  getNetpayPendingOperation,
  isNetpayBridgeAvailable,
  markNetpayPendingRecovery,
  startNetpayRecoveryByFolio,
  startNetpaySale,
} from "../../native/netpayBridge.service";

import {
  createNetpayTransaction,
  fetchUnresolvedNetpayTransaction,
  finalizeApprovedNetpayTransaction,
  previewNetpayTransaction,
  requestNetpayRecovery,
  storeNetpayRecoveryResult,
  storeNetpaySaleResult,
} from "./netpayTransaction.service";

import {
  syncCashierNetpayTerminal,
} from "./netpayTerminal.service";

const SALE_RESULT_FIELDS = [
  "event_uuid",
  "occurred_at",
  "execution_result",
  "netpay_order_id",
  "rrn_number",
  "transaction_id",
  "auth_code",
  "response_code",
  "reprint_module",
  "trans_type",
  "success",
  "message",
  "netpay_amount",
  "auth_amount",
  "netpay_tip_amount",
  "netpay_tip_less_amount",
  "netpay_transaction_at",
  "card_type",
  "card_brand",
  "last4",
  "bank_name",
  "store_id",
  "terminal_id",
  "affiliation",
  "sdk_version",
  "raw_response",
];

const RECOVERY_RESULT_FIELDS = [
  "event_uuid",
  "occurred_at",
  "success",
  "message",
  "reprint_module",
  "trans_type",
  "response_code",
  "netpay_order_id",
  "rrn_number",
  "transaction_id",
  "auth_code",
  "netpay_amount",
  "auth_amount",
  "netpay_tip_amount",
  "netpay_tip_less_amount",
  "netpay_transaction_at",
  "card_type",
  "card_brand",
  "last4",
  "bank_name",
  "store_id",
  "terminal_id",
  "affiliation",
  "sdk_version",
  "raw_response",
];

const FIELD_ALIASES = {
  event_uuid: ["event_uuid", "eventUuid"],
  occurred_at: ["occurred_at", "occurredAt"],
  execution_result: ["execution_result", "executionResult"],
  netpay_order_id: ["netpay_order_id", "netpayOrderId"],
  rrn_number: ["rrn_number", "rrnNumber"],
  transaction_id: ["transaction_id", "transactionId"],
  auth_code: ["auth_code", "authCode"],
  response_code: ["response_code", "responseCode"],
  reprint_module: ["reprint_module", "reprintModule"],
  trans_type: ["trans_type", "transType"],
  success: ["success"],
  message: ["message"],
  netpay_amount: ["netpay_amount", "netpayAmount"],
  auth_amount: ["auth_amount", "authAmount"],
  netpay_tip_amount: ["netpay_tip_amount", "netpayTipAmount"],
  netpay_tip_less_amount: ["netpay_tip_less_amount", "netpayTipLessAmount",],
  netpay_transaction_at: ["netpay_transaction_at", "netpayTransactionAt", ],
  card_type: ["card_type", "cardType"],
  card_brand: ["card_brand", "cardBrand"],
  last4: ["last4"],
  bank_name: ["bank_name", "bankName"],
  store_id: ["store_id", "storeId"],
  terminal_id: ["terminal_id", "terminalId"],
  affiliation: ["affiliation"],
  sdk_version: ["sdk_version", "sdkVersion"],
  raw_response: ["raw_response", "rawResponse"],
};

function createFlowError(code, message, data = null) {
  const error = new Error(message);
  error.code = code;
  error.data = data;
  return error;
}

function apiErrorPayload(error) {
  return error?.response?.data || null;
}

function apiErrorCode(error) {
  return (
    error?.response?.data?.code ||
    error?.code ||
    ""
  );
}

function pickMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function notifyStatus(onStatus, status, data = null) {
  if (typeof onStatus !== "function") return;

  onStatus({
    status,
    data,
  });
}

function positiveInteger(value, fieldName) {
  const normalized = Number(value);

  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw createFlowError("NETPAY_INVALID_IDENTIFIER", `${fieldName} no es válido.`);
  }

  return normalized;
}

function normalizeTip(value) {
  const normalized =
    value === "" ||
    value === null ||
    value === undefined
      ? 0
      : Number(value);

  if (!Number.isFinite(normalized) || normalized < 0) {
    throw createFlowError("NETPAY_INVALID_TIP", "La propina NetPay no es válida.");
  }

  return normalized;
}

function moneyString(value, fieldName) {
  const normalized = Number(value);

  if (!Number.isFinite(normalized) || normalized < 0) {
    throw createFlowError("NETPAY_INVALID_AMOUNT", `${fieldName} no contiene un importe NetPay válido.`);
  }

  return normalized.toFixed(2);
}

function generateIdempotencyKey(saleId) {
  let uniquePart = "";

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    uniquePart = crypto.randomUUID();
  } else if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const values = new Uint32Array(4);
    crypto.getRandomValues(values);

    uniquePart = Array.from(values)
      .map((value) => value.toString(16).padStart(8, "0"))
      .join("");
  } else {
    uniquePart =
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  return `clicmenu-netpay-${saleId}-${uniquePart}`.slice(0, 100);
}

function responseOrThrow(response, fallbackMessage) {
  if (!response || typeof response !== "object") {
    throw createFlowError(
      "NETPAY_INVALID_RESPONSE",
      fallbackMessage
    );
  }

  if (response.ok === false) {
    throw createFlowError(
      response.code || "NETPAY_OPERATION_FAILED",
      response.message || fallbackMessage,
      response
    );
  }

  return response;
}

function normalizedResultSources(result) {
  const sources = [];

  if (result && typeof result === "object" && !Array.isArray(result)) {
    if (result.data && typeof result.data === "object" && !Array.isArray(result.data)) {
      const backendPayload =
        result.data.backend_payload ??
        result.data.backendPayload ??
        null;

      if (backendPayload && typeof backendPayload === "object" && !Array.isArray(backendPayload)) {
        sources.push(backendPayload);
      }

      sources.push(result.data);
    }

    sources.push(result);
  }

  return sources;
}

function readResultField(result, field) {
  const aliases = FIELD_ALIASES[field] || [field];
  const sources = normalizedResultSources(result);

  for (const source of sources) {
    for (const alias of aliases) {
      if (Object.prototype.hasOwnProperty.call(source, alias)) {
        return {
          found: true,
          value: source[alias],
        };
      }
    }
  }

  return {
    found: false,
    value: undefined,
  };
}

function buildPayloadFromNormalizedResult(result, fields) {
  const payload = {};

  fields.forEach((field) => {
    const resolved = readResultField(result, field);

    if (!resolved.found) return;
    if (resolved.value === undefined) return;

    payload[field] = resolved.value;
  });

  return payload;
}

function buildSaleResultPayload(result) {
  const payload = buildPayloadFromNormalizedResult(
    result,
    SALE_RESULT_FIELDS
  );

  if (!payload.event_uuid) {
    throw createFlowError(
      "NETPAY_SALE_RESULT_EVENT_UUID_MISSING",
      "Android no devolvió event_uuid para el resultado NetPay.",
      result
    );
  }

  if (!payload.occurred_at) {
    throw createFlowError(
      "NETPAY_SALE_RESULT_OCCURRED_AT_MISSING",
      "Android no devolvió la fecha del resultado NetPay.",
      result
    );
  }

  if (!payload.execution_result) {
    throw createFlowError(
      "NETPAY_SALE_RESULT_EXECUTION_MISSING",
      "Android no devolvió execution_result para el resultado NetPay.",
      result
    );
  }

  return payload;
}

function buildRecoveryResultPayload(
  result,
  operationUuid
) {
  const payload = buildPayloadFromNormalizedResult(
    result,
    RECOVERY_RESULT_FIELDS
  );

  if (!payload.event_uuid) {
    throw createFlowError(
      "NETPAY_RECOVERY_RESULT_EVENT_UUID_MISSING",
      "Android no devolvió event_uuid para la recuperación NetPay.",
      result
    );
  }

  if (!payload.occurred_at) {
    throw createFlowError(
      "NETPAY_RECOVERY_RESULT_OCCURRED_AT_MISSING",
      "Android no devolvió la fecha de la recuperación NetPay.",
      result
    );
  }

  if (
    !Object.prototype.hasOwnProperty.call(
      payload,
      "success"
    )
  ) {
    throw createFlowError(
      "NETPAY_RECOVERY_RESULT_NOT_AVAILABLE",
      result?.message ||
        "Android no recibió una respuesta bancaria válida de recuperación.",
      result
    );
  }

  return {
    operation_uuid: operationUuid,
    ...payload,
  };
}

function transactionFromResponse(response) {
  const transaction = response?.data;

  return transaction &&
    typeof transaction === "object" &&
    !Array.isArray(transaction)
    ? transaction
    : null;
}

function normalizeUnresolvedRecovery(response, transaction) {
  const rawRecovery =
    response?.recovery &&
    typeof response.recovery === "object" &&
    !Array.isArray(response.recovery)
      ? response.recovery
      : null;

  const bankStatus = String(transaction?.bank_status || "").toLowerCase();
  const localStatus = String(transaction?.local_status || "").toLowerCase();
  const pendingReversal = bankStatus === "pending_reversal";
  const pendingRecovery = bankStatus === "pending_recovery";
  const createdPending = bankStatus === "created" && localStatus === "pending";

  const triggerId = Number(
    rawRecovery?.trigger_transaction_id ??
    rawRecovery?.triggerTransactionId ??
    0
  );

  /*
   * Si Backend ya envió recovery, su decisión es autoritativa.
   * El fallback existe únicamente para estados anteriores que ya eran
   * recuperables; pending_reversal NUNCA se habilita por fallback.
   */
  const recoveryRequired = rawRecovery
    ? rawRecovery.required === true
    : pendingReversal || pendingRecovery || createdPending;

  const recoveryAvailable = rawRecovery
    ? rawRecovery.allowed === true
    : !pendingReversal && (pendingRecovery || createdPending);

  return {
    recoveryRequired,
    recoveryAvailable,
    recoveryReason: String(rawRecovery?.reason || "").trim() || null,
    triggerTransactionId: Number.isInteger(triggerId) && triggerId > 0 ? triggerId : null,
    recovery: rawRecovery,
  };
}

function transactionRequiresImmediateRecovery(transaction) {
  return String(transaction?.bank_status || "").toLowerCase() === "pending_recovery";
}

function transactionIsPendingReversal(transaction) {
  return String(transaction?.bank_status || "").toLowerCase() === "pending_reversal";
}

function transactionIsFinanciallyUnresolved(transaction) {
  const bankStatus = String(transaction?.bank_status || "").toLowerCase();
  const localStatus = String(transaction?.local_status || "").toLowerCase();

  return bankStatus === "pending_recovery" ||
    bankStatus === "pending_reversal" ||
    (bankStatus === "created" && localStatus === "pending") ||
    (bankStatus === "approved" && ["pending", "error"].includes(localStatus));
}

function transactionIsFinalized(transaction) {
  return (
    String(transaction?.bank_status || "").toLowerCase() ===
      "approved" &&
    String(transaction?.local_status || "").toLowerCase() ===
      "finalized"
  );
}

function transactionCanBeAcknowledged(transaction) {
  const localStatus = String(
    transaction?.local_status || ""
  ).toLowerCase();

  return [
    "finalized",
    "not_required",
  ].includes(localStatus);
}

function resolveOutcome(transaction) {
  const bankStatus = String(
    transaction?.bank_status || ""
  ).toLowerCase();

  const localStatus = String(
    transaction?.local_status || ""
  ).toLowerCase();

  if (
    bankStatus === "approved" &&
    localStatus === "finalized"
  ) {
    return "finalized";
  }

  if (bankStatus === "declined") return "declined";
  if (bankStatus === "user_cancelled") return "user_cancelled";
  if (bankStatus === "cancelled") return "cancelled";
  if (bankStatus === "reversed") return "reversed";
  if (bankStatus === "no_record") return "no_record";

  if (
    bankStatus === "created" &&
    localStatus === "not_required"
  ) {
    return "not_sent";
  }

  if (bankStatus === "pending_reversal") {
    return "pending_reversal";
  }

  if (bankStatus === "pending_recovery") {
    return "pending_recovery";
  }

  if (
    bankStatus === "approved" &&
    localStatus === "error"
  ) {
    return "approved_local_error";
  }

  return "pending";
}

function acknowledgeAndroidOperation({
  netpayTransactionId,
  operationUuid = null,
}) {
  const response = acknowledgeNetpayPendingOperation({
    netpayTransactionId,
    operationUuid,
  });

  return responseOrThrow(
    response,
    "Android no pudo confirmar la operación NetPay procesada."
  );
}

function markAndroidOperationForRecovery({
  netpayTransactionId,
  operationUuid = null,
}) {
  const response = markNetpayPendingRecovery({
    netpayTransactionId,
    operationUuid,
  });

  return responseOrThrow(
    response,
    "Android no pudo marcar la operación NetPay como pendiente de recuperación."
  );
}

async function executeAuthorizedRecoveryOnAndroid({
  saleId,
  netpayTransactionId,
  recovery,
  onStatus = null,
  signal = null,
}) {
  const operationUuid = String(recovery?.operation_uuid || "").trim();
  const folio = String(recovery?.folio || "").trim();
  const environment = String(recovery?.environment || "").trim();

  if (!operationUuid || !folio || !environment) {
    throw createFlowError(
      "NETPAY_RECOVERY_DATA_INCOMPLETE",
      "No existen datos completos para ejecutar la recuperación NetPay en Android.",
      recovery
    );
  }

  const waiter = createNetpayResultWaiter({
    netpayTransactionId,
    operationUuid,
    signal,
  });

  notifyStatus(onStatus, "starting_recovery", recovery);

  const androidStart = startNetpayRecoveryByFolio({
    netpay_transaction_id: netpayTransactionId,
    sale_id: saleId,
    operation_uuid: operationUuid,
    folio,
    environment,
  });

  if (androidStart?.ok === false) {
    waiter.cancel();

    try {
      await waiter.promise;
    } catch {
      // Se cancela únicamente el listener local.
    }

    throw createFlowError(
      androidStart.code || "NETPAY_RECOVERY_START_FAILED",
      androidStart.message || "Android no pudo iniciar la recuperación NetPay.",
      androidStart
    );
  }

  notifyStatus(onStatus, "waiting_recovery_result", recovery);

  const normalizedResult = await waiter.promise;

  if (normalizedResult?.ok === false && !readResultField(normalizedResult, "success").found) {
    throw createFlowError(
      normalizedResult.code || "NETPAY_RECOVERY_RESULT_NOT_AVAILABLE",
      normalizedResult.message || "Smart PinPad no devolvió una respuesta bancaria válida de recuperación.",
      normalizedResult
    );
  }

  return processRecoveryNormalizedResult({
    saleId,
    netpayTransactionId,
    operationUuid,
    normalizedResult,
    onStatus,
  });
}

async function finalizeApprovedIfNeeded({
  saleId,
  transaction,
  backendResponse,
  onStatus,
}) {
  if (!transaction) {
    return {
      transaction,
      backendResponse,
    };
  }

  const bankStatus = String(
    transaction.bank_status || ""
  ).toLowerCase();

  const localStatus = String(
    transaction.local_status || ""
  ).toLowerCase();

  if (bankStatus !== "approved") {
    return {
      transaction,
      backendResponse,
    };
  }

  if (localStatus === "finalized") {
    return {
      transaction,
      backendResponse,
    };
  }

  notifyStatus(
    onStatus,
    "finalizing",
    transaction
  );

  const response =
    await finalizeApprovedNetpayTransaction(
      saleId,
      transaction.netpay_transaction_id
    );

  return {
    transaction:
      transactionFromResponse(response) || transaction,
    backendResponse: response,
  };
}

async function processSaleNormalizedResult({
  saleId,
  netpayTransactionId,
  normalizedResult,
  onStatus,
}) {
  const payload = buildSaleResultPayload(
    normalizedResult
  );

  notifyStatus(
    onStatus,
    "sending_sale_result",
    {
      netpay_transaction_id: netpayTransactionId,
      execution_result: payload.execution_result,
    }
  );

  let backendResponse;

  try {
    backendResponse = await storeNetpaySaleResult(
      saleId,
      netpayTransactionId,
      payload
    );
  } catch (error) {
    const code = apiErrorCode(error);

    if (
      code ===
      "NETPAY_AMOUNT_RECONCILIATION_FAILED"
    ) {
      markAndroidOperationForRecovery({
        netpayTransactionId,
      });
    }

    throw error;
  }

  let transaction =
    transactionFromResponse(backendResponse);

  if (
    transactionRequiresImmediateRecovery(transaction) ||
    payload.execution_result === "communication_error"
  ) {
    markAndroidOperationForRecovery({ netpayTransactionId });

    return {
      outcome: "recovery_required",
      requiresRecovery: true,
      financiallyUnresolved: true,
      transaction,
      backendResponse,
      normalizedResult,
    };
  }

  const finalized =
    await finalizeApprovedIfNeeded({
      saleId,
      transaction,
      backendResponse,
      onStatus,
    });

  transaction = finalized.transaction;
  backendResponse = finalized.backendResponse;

  if (transactionCanBeAcknowledged(transaction)) {
    acknowledgeAndroidOperation({
      netpayTransactionId,
    });
  }

  return {
    outcome: resolveOutcome(transaction),
    requiresRecovery: transactionRequiresImmediateRecovery(transaction),
    financiallyUnresolved: transactionIsFinanciallyUnresolved(transaction),
    transaction,
    backendResponse,
    normalizedResult,
  };
}

async function processRecoveryNormalizedResult({
  saleId,
  netpayTransactionId,
  operationUuid,
  normalizedResult,
  onStatus,
}) {
  const payload = buildRecoveryResultPayload(
    normalizedResult,
    operationUuid
  );

  notifyStatus(
    onStatus,
    "sending_recovery_result",
    {
      netpay_transaction_id: netpayTransactionId,
      operation_uuid: operationUuid,
    }
  );

  let backendResponse;

  try {
    backendResponse =
      await storeNetpayRecoveryResult(
        saleId,
        netpayTransactionId,
        payload
      );
  } catch (error) {
    const code = apiErrorCode(error);

    if (
      code ===
      "NETPAY_AMOUNT_RECONCILIATION_FAILED"
    ) {
      markAndroidOperationForRecovery({
        netpayTransactionId,
        operationUuid,
      });
    }

    throw error;
  }

  let transaction =
    transactionFromResponse(backendResponse);

  const finalized =
    await finalizeApprovedIfNeeded({
      saleId,
      transaction,
      backendResponse,
      onStatus,
    });

  transaction = finalized.transaction;
  backendResponse = finalized.backendResponse;

  if (transactionRequiresImmediateRecovery(transaction)) {
    markAndroidOperationForRecovery({ netpayTransactionId, operationUuid });

    return {
      outcome: resolveOutcome(transaction),
      requiresRecovery: true,
      financiallyUnresolved: true,
      transaction,
      backendResponse,
      normalizedResult,
      operationUuid,
    };
  }

  /*
   * PRV ya fue recibido por Android y persistido correctamente en Backend.
   * La Sale continúa pendiente de reverso, pero la PAX debe quedar libre
   * para permitir la siguiente transacción que disparará dicho reverso.
   */
  if (transactionIsPendingReversal(transaction)) {
    acknowledgeAndroidOperation({ netpayTransactionId, operationUuid });

    return {
      outcome: "pending_reversal",
      requiresRecovery: false,
      financiallyUnresolved: true,
      transaction,
      backendResponse,
      normalizedResult,
      operationUuid,
    };
  }

  const recoveryPurpose = String(
    backendResponse?.purpose || ""
  ).toLowerCase();

  const cancellationVerification =
    recoveryPurpose ===
    "cancellation_verification";

  const cancellationBankCancelled =
    cancellationVerification &&
    String(
      transaction?.bank_status || ""
    ).toLowerCase() === "cancelled";

  const cancellationLocallyApplied =
    cancellationBankCancelled &&
    (
      Boolean(
        backendResponse?.local_application
      ) ||
      backendResponse?.already_finalized === true
    );

  if (
    transactionCanBeAcknowledged(transaction) &&
    (
      !cancellationBankCancelled ||
      cancellationLocallyApplied
    )
  ) {
    acknowledgeAndroidOperation({
      netpayTransactionId,
      operationUuid,
    });
  }

  return {
    outcome: resolveOutcome(transaction),
    requiresRecovery: false,
    financiallyUnresolved: transactionIsFinanciallyUnresolved(transaction),
    transaction,
    backendResponse,
    normalizedResult,
    operationUuid,
  };
}

function normalizePendingOperation(operation) {
  if (!operation || typeof operation !== "object" || Array.isArray(operation))
  {
    return null;
  }

  const value = (snakeName, camelName) => {
    if (
      Object.prototype.hasOwnProperty.call(
        operation,
        snakeName
      )
    ) {
      return operation[snakeName];
    }

    return operation[camelName];
  };

  const transactionId = Number(
    value( "netpay_transaction_id", "netpayTransactionId") || 0
  );

  const saleId = Number(
    value("sale_id", "saleId") || 0
  );

  return {
    raw: operation,
    netpayTransactionId:
      Number.isInteger(transactionId) && transactionId > 0
        ? transactionId
        : null,
    saleId:
      Number.isInteger(saleId) && saleId > 0
        ? saleId
        : null,
    operationUuid: value("operation_uuid", "operationUuid") || null,
    operationType: value("operation_type", "operationType") || null,
    folio: value("folio", "folio") || null,
    netpayOrderId: value("netpay_order_id", "netpayOrderId") || null,
    environment: value("environment", "environment") || null,
    localState: value("local_state", "localState") || null,
    normalizedResult: resolvePendingNormalizedResult(operation),
  };
}

function resolvePendingNormalizedResult(operation) {
  const raw =
    operation?.normalized_result_json ??
    operation?.normalizedResultJson ??
    operation?.normalized_result ??
    operation?.normalizedResult ??
    null;

  if (!raw) return null;

  if (typeof raw === "object" && !Array.isArray(raw)) 
  {
    return raw;
  }

  if (typeof raw !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    return parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export async function resolveCashierNetpayTerminal() {
  if (!isNetpayBridgeAvailable()) {
    throw createFlowError(
      "NETPAY_BRIDGE_NOT_AVAILABLE",
      "NetPay solamente puede utilizarse desde una terminal PAX compatible."
    );
  }

  const capabilities = getNetpayCapabilities();

  if (!capabilities) {
    throw createFlowError(
      "NETPAY_CAPABILITIES_NOT_AVAILABLE",
      "No fue posible consultar las capacidades NetPay de esta terminal."
    );
  }

  const syncResponse =
    await syncCashierNetpayTerminal(
      capabilities
    );

  responseOrThrow(
    syncResponse,
    "No fue posible sincronizar la terminal NetPay."
  );

  const terminal = syncResponse?.data || null;

  if (!terminal?.netpay_terminal_id) {
    throw createFlowError(
      "NETPAY_TERMINAL_ID_MISSING",
      "Backend no devolvió la terminal NetPay sincronizada.",
      syncResponse
    );
  }

  if (terminal.can_use_netpay !== true) {
    throw createFlowError(
      "NETPAY_TERMINAL_NOT_AVAILABLE",
      "Esta terminal no tiene NetPay y Smart PinPad disponibles.",
      terminal
    );
  }

  return {
    capabilities,
    terminal,
    response: syncResponse,
  };
}

export async function previewCashierNetpayPayment({
  saleId,
  requestedPaymentMethodId,
  tip,
  taxOptionCode,
}) {
  const normalizedSaleId = positiveInteger(
    saleId,
    "sale_id"
  );

  const paymentMethodId = positiveInteger(
    requestedPaymentMethodId,
    "requested_payment_method_id"
  );

  if (!String(taxOptionCode || "").trim()) {
    throw createFlowError(
      "NETPAY_TAX_OPTION_REQUIRED",
      "Debes seleccionar una tasa de consumo antes de generar la vista previa NetPay."
    );
  }

  const resolved =
    await resolveCashierNetpayTerminal();

  const response = await previewNetpayTransaction(
    normalizedSaleId,
    {
      netpay_terminal_id:
        resolved.terminal.netpay_terminal_id,
      requested_payment_method_id:
        paymentMethodId,
      tip: normalizeTip(tip),
      tax_option_code:
        String(taxOptionCode).trim(),
    }
  );

  responseOrThrow(
    response,
    "No fue posible generar la vista previa NetPay."
  );

  return {
    terminal: resolved.terminal,
    capabilities: resolved.capabilities,
    preview: response?.data || null,
    response,
  };
}

export async function recoverCashierNetpayPayment({
  saleId,
  netpayTransactionId,
  onStatus = null,
  signal = null,
}) {
  const normalizedSaleId = positiveInteger(saleId, "sale_id");
  const transactionId = positiveInteger(netpayTransactionId, "netpay_transaction_id");

  /*
   * Antes de crear una nueva solicitud Backend revisamos Android.
   * Así no generamos operation_uuid que la PAX no pueda ejecutar.
   */
  const localPending = getCashierPendingNetpayOperation();

  if (localPending.hasPendingOperation) {
    const operation = localPending.operation;

    if (!operation || operation.netpayTransactionId !== transactionId) {
      throw createFlowError(
        "NETPAY_ANDROID_PENDING_OPERATION",
        "La terminal PAX tiene otra operación NetPay pendiente. Debe resolverse antes de iniciar esta recuperación.",
        operation?.raw || localPending.response
      );
    }

    const operationType = String(operation.operationType || "").toLowerCase();
    const localState = String(operation.localState || "").toLowerCase();

    if (
      operation.normalizedResult ||
      (operationType === "recovery" && localState === "requires_review")
    ) {
      return resumeCashierPendingNetpayOperation({
        saleId: normalizedSaleId,
        onStatus,
        signal,
      });
    }

    const canRequestNewRecovery =
      localState === "pending_recovery" &&
      ["sale", "recovery", "cancellation"].includes(operationType);

    if (!canRequestNewRecovery) {
      throw createFlowError(
        "NETPAY_ANDROID_OPERATION_NOT_READY_FOR_RECOVERY",
        "La operación NetPay local todavía no permite iniciar una nueva recuperación.",
        operation.raw
      );
    }
  }

  notifyStatus(onStatus, "requesting_recovery", {
    netpay_transaction_id: transactionId,
  });

  const recoveryResponse = await requestNetpayRecovery(
    normalizedSaleId,
    transactionId
  );

  responseOrThrow(
    recoveryResponse,
    "Backend no pudo autorizar la recuperación NetPay."
  );

  const recovery = recoveryResponse?.data || null;

  if (!recovery?.operation_uuid || !recovery?.folio || !recovery?.environment) {
    throw createFlowError(
      "NETPAY_RECOVERY_DATA_INCOMPLETE",
      "Backend no devolvió los datos completos para recuperar la operación NetPay.",
      recoveryResponse
    );
  }

  return executeAuthorizedRecoveryOnAndroid({
    saleId: normalizedSaleId,
    netpayTransactionId: transactionId,
    recovery,
    onStatus,
    signal,
  });
}

export async function executeCashierNetpayPayment({
  saleId,
  requestedPaymentMethodId,
  tip,
  taxOptionCode,
  idempotencyKey = null,
  onStatus = null,
  signal = null,
}) {
  const normalizedSaleId = positiveInteger(
    saleId,
    "sale_id"
  );

  const paymentMethodId = positiveInteger(
    requestedPaymentMethodId,
    "requested_payment_method_id"
  );

  if (!String(taxOptionCode || "").trim()) {
    throw createFlowError(
      "NETPAY_TAX_OPTION_REQUIRED",
      "Debes seleccionar una tasa de consumo antes de iniciar NetPay."
    );
  }

  /*
   * Preflight Android obligatorio antes de crear el intento Backend.
   * Una operación durable pendiente en la PAX tiene prioridad.
   */
  const localPending = getCashierPendingNetpayOperation();

  if (localPending.hasPendingOperation) {
    const operation = localPending.operation;

    if (!operation) {
      throw createFlowError(
        "NETPAY_ANDROID_PENDING_OPERATION_INVALID",
        "Android reportó una operación NetPay pendiente que no pudo interpretarse.",
        localPending.response
      );
    }

    const operationType = String(operation.operationType || "").toLowerCase();

    if (
      operation.saleId === normalizedSaleId &&
      ["sale", "recovery"].includes(operationType)
    ) {
      notifyStatus(onStatus, "resuming_pending_operation", operation);

      return resumeCashierPendingNetpayOperation({
        saleId: normalizedSaleId,
        onStatus,
        signal,
      });
    }

    throw createFlowError(
      "NETPAY_ANDROID_PENDING_OPERATION",
      operation.saleId && operation.saleId !== normalizedSaleId
        ? `La terminal PAX tiene una operación NetPay pendiente de la venta ${operation.saleId}. Debe resolverse antes de iniciar otro cobro.`
        : "La terminal PAX tiene otra operación NetPay pendiente. Debe resolverse antes de iniciar un nuevo cobro.",
      operation.raw
    );
  }

  notifyStatus(onStatus, "resolving_terminal");

  const resolved = await resolveCashierNetpayTerminal();

  notifyStatus(
    onStatus,
    "creating_intent",
    resolved.terminal
  );

  const intentResponse =
    await createNetpayTransaction(
      normalizedSaleId,
      {
        netpay_terminal_id:
          resolved.terminal.netpay_terminal_id,
        requested_payment_method_id:
          paymentMethodId,
        idempotency_key:
          idempotencyKey ||
          generateIdempotencyKey(
            normalizedSaleId
          ),
        tip: normalizeTip(tip),
        tax_option_code:
          String(taxOptionCode).trim(),
      }
    );

  responseOrThrow(
    intentResponse,
    "Backend no pudo crear el intento NetPay."
  );

  const transaction =
    transactionFromResponse(intentResponse);

  if (
    !transaction?.netpay_transaction_id ||
    !transaction?.folio ||
    !transaction?.environment
  ) {
    throw createFlowError(
      "NETPAY_TRANSACTION_DATA_INCOMPLETE",
      "Backend creó el intento NetPay pero no devolvió los datos necesarios para Smart PinPad.",
      intentResponse
    );
  }

  const transactionId =
    positiveInteger(
      transaction.netpay_transaction_id,
      "netpay_transaction_id"
    );

  const waiter = createNetpayResultWaiter({
    netpayTransactionId: transactionId,
    signal,
  });

  notifyStatus(
    onStatus,
    "starting_sale",
    transaction
  );

  const androidStart =
    startNetpaySale({
      netpay_transaction_id:
        transactionId,
      sale_id: normalizedSaleId,
      folio: transaction.folio,
      environment:
        transaction.environment,
      purchase_amount: moneyString(
        transaction.purchase_amount,
        "purchase_amount"
      ),
      tip_requested: moneyString(
        transaction.tip_requested,
        "tip_requested"
      ),
      expected_total: moneyString(
        transaction.expected_total,
        "expected_total"
      ),
    });

  const notSent =
    androidStart?.code ===
    "NETPAY_SALE_NOT_SENT";

  if (
    androidStart?.ok === false &&
    !notSent
  ) {
    waiter.cancel();

    try {
      await waiter.promise;
    } catch {
      // Se cancela únicamente el listener local.
    }

    throw createFlowError(
      androidStart.code ||
        "NETPAY_SALE_START_FAILED",
      androidStart.message ||
        "Android no pudo iniciar el cobro NetPay.",
      androidStart
    );
  }

  notifyStatus(
    onStatus,
    "waiting_sale_result",
    transaction
  );

  const normalizedResult =
    await waiter.promise;

  let processed;

  try {
    processed =
      await processSaleNormalizedResult({
        saleId: normalizedSaleId,
        netpayTransactionId:
          transactionId,
        normalizedResult,
        onStatus,
      });
  } catch (error) {
    if (
      apiErrorCode(error) ===
      "NETPAY_AMOUNT_RECONCILIATION_FAILED"
    ) {
      notifyStatus(
        onStatus,
        "recovery_required",
        apiErrorPayload(error)
      );

      return recoverCashierNetpayPayment({
        saleId: normalizedSaleId,
        netpayTransactionId:
          transactionId,
        onStatus,
        signal,
      });
    }

    throw error;
  }

  if (processed.requiresRecovery) {
    notifyStatus(
      onStatus,
      "recovery_required",
      processed.transaction
    );

    return recoverCashierNetpayPayment({
      saleId: normalizedSaleId,
      netpayTransactionId:
        transactionId,
      onStatus,
      signal,
    });
  }

  notifyStatus(
    onStatus,
    "completed",
    processed
  );

  return {
    ...processed,
    terminal: resolved.terminal,
    capabilities:
      resolved.capabilities,
    intentResponse,
  };
}

export function getCashierPendingNetpayOperation() {
  if (!isNetpayBridgeAvailable()) {
    return {
      hasPendingOperation: false,
      operation: null,
      response: null,
    };
  }

  const response =
    getNetpayPendingOperation();

  responseOrThrow(
    response,
    "No fue posible consultar la operación NetPay pendiente."
  );

  const hasPendingOperation =
    Boolean(
      response?.has_pending_operation
    );

  return {
    hasPendingOperation,
    operation: hasPendingOperation
      ? normalizePendingOperation(
          response?.data
        )
      : null,
    response,
  };
}

export async function getCashierUnresolvedNetpayPayment({ saleId }) {
  const normalizedSaleId = positiveInteger(saleId, "sale_id");
  const response = await fetchUnresolvedNetpayTransaction(normalizedSaleId);

  responseOrThrow(
    response,
    "No fue posible consultar la operación NetPay pendiente de la venta."
  );

  const transaction = transactionFromResponse(response);
  const recovery = normalizeUnresolvedRecovery(response, transaction);

  return {
    hasUnresolvedTransaction: Boolean(transaction),
    transaction,
    outcome: transaction ? resolveOutcome(transaction) : "none",
    financiallyUnresolved: transactionIsFinanciallyUnresolved(transaction),
    recoveryRequired: recovery.recoveryRequired,
    recoveryAvailable: recovery.recoveryAvailable,
    recoveryReason: recovery.recoveryReason,
    triggerTransactionId: recovery.triggerTransactionId,
    recovery: recovery.recovery,
    response,
  };
}

export async function resumeCashierUnresolvedNetpayPayment({
  saleId,
  onStatus = null,
  signal = null,
}) {
  const normalizedSaleId = positiveInteger(saleId, "sale_id");

  const unresolved = await getCashierUnresolvedNetpayPayment({
    saleId: normalizedSaleId,
  });

  if (!unresolved.transaction) {
    return {
      outcome: "none",
      requiresRecovery: false,
      recoveryRequired: false,
      recoveryAvailable: false,
      recoveryReason: null,
      triggerTransactionId: null,
      financiallyUnresolved: false,
      transaction: null,
      backendResponse: unresolved.response,
    };
  }

  const transaction = unresolved.transaction;
  const transactionId = positiveInteger(transaction.netpay_transaction_id, "netpay_transaction_id");
  const bankStatus = String(transaction.bank_status || "").toLowerCase();
  const localStatus = String(transaction.local_status || "").toLowerCase();

  /*
   * PRV significa que el banco todavía espera una transacción posterior
   * en la misma PAX. Backend decide cuándo esa evidencia ya existe.
   *
   * requiresRecovery permanece false porque NO debemos ejecutar recovery
   * automáticamente mientras recoveryAvailable sea false.
   */
  if (bankStatus === "pending_reversal" && !unresolved.recoveryAvailable) {
    return {
      outcome: "pending_reversal",
      requiresRecovery: false,
      recoveryRequired: unresolved.recoveryRequired,
      recoveryAvailable: false,
      recoveryReason: unresolved.recoveryReason,
      triggerTransactionId: unresolved.triggerTransactionId,
      financiallyUnresolved: true,
      transaction,
      backendResponse: unresolved.response,
    };
  }

  /*
   * Una aprobación pendiente/error primero intenta finalizarse localmente.
   * Solo un error de conciliación justifica volver a consultar al banco.
   */
  if (bankStatus === "approved" && ["pending", "error"].includes(localStatus)) {
    try {
      const finalized = await finalizeApprovedIfNeeded({
        saleId: normalizedSaleId,
        transaction,
        backendResponse: unresolved.response,
        onStatus,
      });

      return {
        outcome: resolveOutcome(finalized.transaction),
        requiresRecovery: false,
        recoveryRequired: false,
        recoveryAvailable: false,
        recoveryReason: null,
        triggerTransactionId: null,
        financiallyUnresolved: transactionIsFinanciallyUnresolved(finalized.transaction),
        transaction: finalized.transaction,
        backendResponse: finalized.backendResponse,
      };
    } catch (error) {
      if (apiErrorCode(error) !== "NETPAY_AMOUNT_RECONCILIATION_FAILED") throw error;
    }
  }

  /*
   * pending_reversal solamente llega aquí cuando Backend ya indicó
   * recoveryAvailable=true. Los demás estados recuperables conservan
   * su flujo existente. Backend sigue siendo la última barrera.
   */
  return recoverCashierNetpayPayment({
    saleId: normalizedSaleId,
    netpayTransactionId: transactionId,
    onStatus,
    signal,
  });
}

export async function resumeCashierPendingNetpayOperation({
  saleId,
  onStatus = null,
  signal = null,
}) {
  const normalizedSaleId = positiveInteger(
    saleId,
    "sale_id"
  );

  const pending =
    getCashierPendingNetpayOperation();

  if (
    !pending.hasPendingOperation ||
    !pending.operation
  ) {
    return {
      outcome: "none",
      pendingOperation: null,
    };
  }

  const operation =
    pending.operation;

  if (operation.saleId && operation.saleId !== normalizedSaleId) {
    return {
      outcome: "different_sale",
      pendingOperation: operation,
    };
  }

  if (!operation.netpayTransactionId) {
    throw createFlowError(
      "NETPAY_PENDING_TRANSACTION_ID_MISSING",
      "La operación NetPay pendiente no contiene su identificador de Backend.",
      operation.raw
    );
  }

  notifyStatus(
    onStatus,
    "resuming_pending_operation",
    operation
  );

  const operationType = String(operation.operationType || "").toLowerCase();

  if (operationType !== "sale" && operationType !== "recovery") {
    return {
      outcome: "different_operation_type",
      pendingOperation: operation,
    };
  }

  if (operation.normalizedResult) {
    if (operationType === "recovery") {
      return processRecoveryNormalizedResult({
        saleId: normalizedSaleId,
        netpayTransactionId:
          operation.netpayTransactionId,
        operationUuid:
          operation.operationUuid,
        normalizedResult:
          operation.normalizedResult,
        onStatus,
      });
    }

    const processed =
      await processSaleNormalizedResult({
        saleId: normalizedSaleId,
        netpayTransactionId:
          operation.netpayTransactionId,
        normalizedResult:
          operation.normalizedResult,
        onStatus,
      });

    if (processed.requiresRecovery) {
      return recoverCashierNetpayPayment({
        saleId: normalizedSaleId,
        netpayTransactionId:
          operation.netpayTransactionId,
        onStatus,
        signal,
      });
    }

    return processed;
  }

  const localState = String(operation.localState || "").toLowerCase();

  if (operationType === "recovery" && localState === "requires_review") {
    if (!operation.operationUuid || !operation.folio || !operation.environment) {
      throw createFlowError(
        "NETPAY_RECOVERY_REVIEW_DATA_INCOMPLETE",
        "La recuperación pendiente no conserva los datos necesarios para reintentarse.",
        operation.raw
      );
    }

    return executeAuthorizedRecoveryOnAndroid({
      saleId: normalizedSaleId,
      netpayTransactionId: operation.netpayTransactionId,
      recovery: {
        operation_uuid: operation.operationUuid,
        folio: operation.folio,
        environment: operation.environment,
      },
      onStatus,
      signal,
    });
  }

  if (localState === "pending_recovery" && operationType !== "recovery") {
    return recoverCashierNetpayPayment({
      saleId: normalizedSaleId,
      netpayTransactionId:
        operation.netpayTransactionId,
      onStatus,
      signal,
    });
  }

  return {
    outcome:
      operationType === "recovery"
        ? "recovery_pending_local"
        : "operation_pending_local",
    pendingOperation: operation,
  };
}

export function getCashierNetpayError(error) {
  return {
    code:
      apiErrorCode(error) ||
      "NETPAY_OPERATION_ERROR",
    message: pickMessage(
      error,
      "No fue posible completar la operación NetPay."
    ),
    data:
      apiErrorPayload(error) ||
      error?.data ||
      null,
    bankApproved: Boolean(
      error?.response?.data?.bank_approved
    ),
  };
}