// src/services/staff/casher/cashierNetpayCancellation.service.js

import {
  acknowledgeNetpayPendingOperation,
  createNetpayResultWaiter,
  markNetpayPendingRecovery,
  startNetpayCancellation,
} from "../../native/netpayBridge.service";

import {
  getCashierPendingNetpayOperation,
  recoverCashierNetpayPayment,
  resolveCashierNetpayTerminal,
} from "./cashierNetpayPayment.service";

import {
  finalizeNetpayCancellation,
  requestNetpayCancellation,
  storeNetpayCancellationResult,
} from "./netpayTransaction.service";

/**
 * Coordina la cancelación bancaria total de una venta NetPay.
 *
 * Usa:
 * - netpayBridge.service.js para Android / Smart PinPad.
 * - netpayTransaction.service.js para Backend.
 * - cashierNetpayPayment.service.js para terminal y recovery por folio.
 *
 * Lo usa:
 * - CashierRefundsHistoryPage.jsx.
 *
 * Backend mantiene la autoridad financiera y aplica la devolución local.
 */
const CANCELLATION_RESULT_FIELDS = [
  "operation_uuid",
  "event_uuid",
  "occurred_at",
  "execution_result",
  "success",
  "message",
  "netpay_order_id",
  "auth_code",
  "response_code",
  "reprint_module",
  "trans_type",
  "card_type",
  "last4",
  "raw_response",
];

function createFlowError(
  code,
  message,
  data = null
) {
  const error = new Error(message);
  error.code = code;
  error.data = data;
  return error;
}

function positiveInteger(
  value,
  fieldName
) {
  const normalized = Number(value);

  if (
    !Number.isInteger(normalized) ||
    normalized <= 0
  ) {
    throw createFlowError(
      "NETPAY_INVALID_IDENTIFIER",
      `${fieldName} no es válido.`
    );
  }

  return normalized;
}

function requiredText(
  value,
  fieldName
) {
  const normalized =
    String(value || "").trim();

  if (!normalized) {
    throw createFlowError(
      "NETPAY_REQUIRED_VALUE_MISSING",
      `${fieldName} es obligatorio.`
    );
  }

  return normalized;
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

function responseOrThrow(
  response,
  fallbackMessage
) {
  if (
    !response ||
    typeof response !== "object"
  ) {
    throw createFlowError(
      "NETPAY_INVALID_RESPONSE",
      fallbackMessage
    );
  }

  if (response.ok === false) {
    throw createFlowError(
      response.code ||
        "NETPAY_OPERATION_FAILED",
      response.message ||
        fallbackMessage,
      response
    );
  }

  return response;
}

function notifyStatus(
  onStatus,
  status,
  data = null
) {
  if (typeof onStatus !== "function") {
    return;
  }

  onStatus({
    status,
    data,
  });
}

function transactionFromResponse(
  response
) {
  const transaction = response?.data;

  return transaction &&
    typeof transaction === "object" &&
    !Array.isArray(transaction)
    ? transaction
    : null;
}

function transactionBankStatus(
  transaction
) {
  return String(
    transaction?.bank_status || ""
  ).toLowerCase();
}

function buildCancellationResultPayload(
  normalizedResult,
  operationUuid
) {
  const operation = String(
    normalizedResult?.operation || ""
  ).toLowerCase();

  if (
    operation &&
    operation !== "cancellation_result"
  ) {
    throw createFlowError(
      "NETPAY_CANCELLATION_RESULT_TYPE_MISMATCH",
      "Android devolvió un resultado que no corresponde a una cancelación NetPay.",
      normalizedResult
    );
  }

  const source =
    normalizedResult?.data
      ?.backend_payload ??
    normalizedResult?.data
      ?.backendPayload ??
    null;

  if (
    !source ||
    typeof source !== "object" ||
    Array.isArray(source)
  ) {
    throw createFlowError(
      "NETPAY_CANCELLATION_BACKEND_PAYLOAD_MISSING",
      "Android no devolvió backend_payload para la cancelación NetPay.",
      normalizedResult
    );
  }

  const payload = {};

  CANCELLATION_RESULT_FIELDS.forEach(
    (field) => {
      if (
        !Object.prototype.hasOwnProperty.call(
          source,
          field
        )
      ) {
        return;
      }

      if (source[field] === undefined) {
        return;
      }

      payload[field] = source[field];
    }
  );

  const receivedOperationUuid =
    String(
      payload.operation_uuid || ""
    ).trim();

  if (
    receivedOperationUuid &&
    receivedOperationUuid !==
      operationUuid
  ) {
    throw createFlowError(
      "NETPAY_CANCELLATION_OPERATION_UUID_MISMATCH",
      "El operation_uuid recibido desde Android no coincide con la cancelación autorizada por Backend.",
      normalizedResult
    );
  }

  payload.operation_uuid =
    operationUuid;

  if (!payload.event_uuid) {
    throw createFlowError(
      "NETPAY_CANCELLATION_EVENT_UUID_MISSING",
      "Android no devolvió event_uuid para la cancelación NetPay.",
      normalizedResult
    );
  }

  if (!payload.occurred_at) {
    throw createFlowError(
      "NETPAY_CANCELLATION_OCCURRED_AT_MISSING",
      "Android no devolvió la fecha del resultado de cancelación NetPay.",
      normalizedResult
    );
  }

  if (!payload.execution_result) {
    throw createFlowError(
      "NETPAY_CANCELLATION_EXECUTION_MISSING",
      "Android no devolvió execution_result para la cancelación NetPay.",
      normalizedResult
    );
  }

  return payload;
}

function acknowledgeAndroidOperation({
  netpayTransactionId,
  operationUuid,
}) {
  const response =
    acknowledgeNetpayPendingOperation({
      netpayTransactionId,
      operationUuid,
    });

  return responseOrThrow(
    response,
    "Android no pudo confirmar la cancelación NetPay procesada."
  );
}

function markAndroidOperationForRecovery({
  netpayTransactionId,
  operationUuid,
}) {
  const response =
    markNetpayPendingRecovery({
      netpayTransactionId,
      operationUuid,
    });

  return responseOrThrow(
    response,
    "Android no pudo marcar la cancelación NetPay para recuperación."
  );
}

function pendingOperationForTransaction(netpayTransactionId) {
  const pending = getCashierPendingNetpayOperation();

  if (!pending.hasPendingOperation || !pending.operation) {
    return null;
  }

  if ( pending.operation .netpayTransactionId !== netpayTransactionId) {
    return null;
  }

  return pending.operation;
}

function pendingCancellationForExecution(saleId, netpayTransactionId) {
  const pending = getCashierPendingNetpayOperation();

  if (!pending?.hasPendingOperation || !pending?.operation) return null;

  const operation = pending.operation;
  const sameCancellation =
    operation.netpayTransactionId === netpayTransactionId &&
    operation.saleId === saleId &&
    String(operation.operationType || "").toLowerCase() === "cancellation";

  if (!sameCancellation) {
    throw createFlowError(
      "NETPAY_OTHER_OPERATION_PENDING",
      "Existe otra operación NetPay pendiente en esta terminal. Debe resolverse antes de iniciar la cancelación.",
      operation.raw
    );
  }

  return operation;
}


async function finalizeCancelledLocally({
  saleId,
  netpayTransactionId,
  operationUuid = null,
  onStatus = null,
}) {
  notifyStatus(
    onStatus,
    "finalizing_cancellation",
    {
      netpay_transaction_id:
        netpayTransactionId,
    }
  );

  const response =
    await finalizeNetpayCancellation(
      saleId,
      netpayTransactionId
    );

  responseOrThrow(
    response,
    "Clic Menu no pudo finalizar localmente la cancelación NetPay."
  );

  if (operationUuid) {
    acknowledgeAndroidOperation({
      netpayTransactionId,
      operationUuid,
    });
  }

  return {
    outcome: "cancelled",
    requiresRecovery: false,
    transaction:
      transactionFromResponse(response),
    backendResponse: response,
    message:
      response?.message ||
      "La cancelación NetPay quedó aplicada correctamente.",
  };
}

async function recoverCancellationVerification({
  saleId,
  netpayTransactionId,
  onStatus = null,
  signal = null,
}) {
  notifyStatus(
    onStatus,
    "recovering_cancellation",
    {
      netpay_transaction_id:
        netpayTransactionId,
    }
  );

  try {
    const recovered =
      await recoverCashierNetpayPayment({
        saleId,
        netpayTransactionId,
        onStatus,
        signal,
      });

    const bankStatus = transactionBankStatus(recovered?.transaction);

    /*
     * PRV no significa que la cancelación haya fallado ni que debamos
     * consultar nuevamente de inmediato.
     *
     * Backend conserva la operación pendiente, Android ya puede quedar libre
     * y una transacción bancaria posterior deberá disparar el reverso.
     */
    if (bankStatus === "pending_reversal") {
      return {
        ...recovered,
        outcome: "pending_reversal",
        requiresRecovery: false,
        financiallyPending: true,
        message:
          recovered?.backendResponse?.message ||
          "NetPay reportó un reverso pendiente. Debe realizarse otra transacción en la terminal antes de volver a consultar esta operación.",
      };
    }

    if (recovered?.requiresRecovery || bankStatus === "pending_recovery") {
      return {
        ...recovered,
        outcome: "recovery_required",
        requiresRecovery: true,
        message:
          recovered?.backendResponse?.message ||
          "La cancelación NetPay continúa pendiente de verificación.",
      };
    }

    const purpose = String(recovered?.backendResponse?.purpose || "").toLowerCase();

    if (purpose && purpose !== "cancellation_verification") {
      throw createFlowError(
        "NETPAY_RECOVERY_PURPOSE_MISMATCH",
        "Backend devolvió una recuperación que no corresponde a la verificación de cancelación.",
        recovered
      );
    }

    if (bankStatus !== "cancelled") {
      return {
        ...recovered,
        outcome: "not_cancelled",
        message:
          recovered?.backendResponse?.message ||
          "La recuperación no confirmó una cancelación bancaria.",
      };
    }

    const localAlreadyApplied =
      Boolean(
        recovered?.backendResponse
          ?.local_application
      ) ||
      recovered?.backendResponse
        ?.already_finalized === true;

    if (localAlreadyApplied) {
      return {
        ...recovered,
        outcome: "cancelled",
        message:
          recovered?.backendResponse
            ?.message ||
          "La recuperación confirmó la cancelación NetPay.",
      };
    }

    const pending =
      pendingOperationForTransaction(
        netpayTransactionId
      );

    const recoveryOperationUuid =
      String(
        pending?.operationType || ""
      ).toLowerCase() === "recovery"
        ? pending?.operationUuid || null
        : null;

    return finalizeCancelledLocally({
      saleId,
      netpayTransactionId,
      operationUuid:
        recoveryOperationUuid,
      onStatus,
    });
  } catch (error) {
    const body =
      apiErrorPayload(error);

    if (
      apiErrorCode(error) ===
        "NETPAY_CANCELLED_LOCAL_FINALIZATION_FAILED" &&
      body?.bank_cancelled === true
    ) {
      const pending =
        pendingOperationForTransaction(
          netpayTransactionId
        );

      const recoveryOperationUuid =
        String(
          pending?.operationType || ""
        ).toLowerCase() === "recovery"
          ? pending?.operationUuid || null
          : null;

      return finalizeCancelledLocally({
        saleId,
        netpayTransactionId,
        operationUuid:
          recoveryOperationUuid,
        onStatus,
      });
    }

    throw error;
  }
}

async function processCancellationNormalizedResult({
  saleId,
  netpayTransactionId,
  operationUuid,
  normalizedResult,
  onStatus = null,
  signal = null,
}) {
  const payload =
    buildCancellationResultPayload(
      normalizedResult,
      operationUuid
    );

  notifyStatus(
    onStatus,
    "sending_cancellation_result",
    {
      netpay_transaction_id:
        netpayTransactionId,
      operation_uuid:
        operationUuid,
      execution_result:
        payload.execution_result,
    }
  );

  let backendResponse;

  try {
    backendResponse =
      await storeNetpayCancellationResult(
        saleId,
        netpayTransactionId,
        payload
      );

    responseOrThrow(
      backendResponse,
      "Backend no pudo procesar el resultado de cancelación NetPay."
    );
  } catch (error) {
    const code =
      apiErrorCode(error);

    const body =
      apiErrorPayload(error);

    if (
      code ===
        "NETPAY_CANCELLATION_RESPONSE_INCONSISTENT" ||
      body?.recovery_required === true
    ) {
      markAndroidOperationForRecovery({
        netpayTransactionId,
        operationUuid,
      });

      return recoverCancellationVerification({
        saleId,
        netpayTransactionId,
        onStatus,
        signal,
      });
    }

    if (
      code ===
        "NETPAY_CANCELLED_LOCAL_FINALIZATION_FAILED" &&
      body?.bank_cancelled === true
    ) {
      return finalizeCancelledLocally({
        saleId,
        netpayTransactionId,
        operationUuid,
        onStatus,
      });
    }

    throw error;
  }

  const transaction =
    transactionFromResponse(
      backendResponse
    );

  const bankStatus =
    transactionBankStatus(
      transaction
    );

  if (bankStatus === "pending_reversal") {
    acknowledgeAndroidOperation({
      netpayTransactionId,
      operationUuid,
    });

    return {
      outcome: "pending_reversal",
      requiresRecovery: false,
      financiallyPending: true,
      transaction,
      backendResponse,
      normalizedResult,
      message:
        backendResponse?.message ||
        "NetPay reportó un reverso pendiente. La operación seguirá bloqueada en Backend hasta que pueda verificarse nuevamente.",
    };
  }

  if (backendResponse?.recovery_required === true || bankStatus === "pending_recovery") {
    markAndroidOperationForRecovery({
      netpayTransactionId,
      operationUuid,
    });

    return recoverCancellationVerification({
      saleId,
      netpayTransactionId,
      onStatus,
      signal,
    });
  }

  if (
    backendResponse
      ?.bank_cancelled === true
  ) {
    acknowledgeAndroidOperation({
      netpayTransactionId,
      operationUuid,
    });

    return {
      outcome: "cancelled",
      requiresRecovery: false,
      transaction,
      backendResponse,
      normalizedResult,
      message:
        backendResponse?.message ||
        "NetPay confirmó la cancelación bancaria.",
    };
  }

  if (bankStatus === "cancelled") {
    return finalizeCancelledLocally({
      saleId,
      netpayTransactionId,
      operationUuid,
      onStatus,
    });
  }

  acknowledgeAndroidOperation({
    netpayTransactionId,
    operationUuid,
  });

  return {
    outcome: "not_cancelled",
    requiresRecovery: false,
    transaction,
    backendResponse,
    normalizedResult,
    message:
      backendResponse?.message ||
      "NetPay no confirmó la cancelación bancaria.",
  };
}

export async function executeCashierNetpayCancellation({
  saleId,
  netpayTransactionId,
  reason,
  onStatus = null,
  signal = null,
}) {
  const normalizedSaleId = positiveInteger(saleId, "sale_id");

  const transactionId = positiveInteger(netpayTransactionId, "netpay_transaction_id");

  const normalizedReason = requiredText(reason, "reason");

  /*
   * Preflight Android ANTES de pedir una nueva autorización Backend.
   *
   * Si existe una operación local, no debemos crear otra operación bancaria
   * que esta PAX no pueda ejecutar.
   */
  const existingCancellation = pendingCancellationForExecution(
    normalizedSaleId,
    transactionId
  );

  let cancellationResponse = null;
  let cancellation = null;

  if (existingCancellation) {
    const existingOperationUuid = requiredText(
      existingCancellation.operationUuid,
      "operation_uuid"
    );

    if (existingCancellation.normalizedResult) {
      return processCancellationNormalizedResult({
        saleId: normalizedSaleId,
        netpayTransactionId: transactionId,
        operationUuid: existingOperationUuid,
        normalizedResult: existingCancellation.normalizedResult,
        onStatus,
        signal,
      });
    }

    const localState = String(existingCancellation.localState || "").toLowerCase();

    if (localState === "pending_recovery") {
      return recoverCancellationVerification({
        saleId: normalizedSaleId,
        netpayTransactionId: transactionId,
        onStatus,
        signal,
      });
    }

    if (localState !== "prepared") {
      return {
        outcome: "operation_pending_local",
        pendingOperation: existingCancellation,
        message: "La cancelación NetPay ya se encuentra pendiente en Android.",
      };
    }

    /*
     * La operación estaba preparada localmente pero Smart SDK todavía no había
     * sido iniciado. No pedimos otra autorización Backend: reutilizamos la ya
     * persistida en Android.
     */
    cancellation = {
      netpay_transaction_id: transactionId,
      operation_uuid: existingOperationUuid,
      netpay_order_id: requiredText(existingCancellation.netpayOrderId, "netpay_order_id"),
      environment: requiredText(existingCancellation.environment, "environment"),
    };
  } else {
    notifyStatus(onStatus, "resolving_terminal");

    const resolved = await resolveCashierNetpayTerminal();

    notifyStatus(onStatus, "requesting_cancellation", {
      netpay_transaction_id: transactionId,
    });

    cancellationResponse = await requestNetpayCancellation(
      normalizedSaleId,
      transactionId,
      {
        netpay_terminal_id: resolved.terminal.netpay_terminal_id,
        reason: normalizedReason,
      }
    );

    responseOrThrow(
      cancellationResponse,
      "Backend no pudo autorizar la cancelación NetPay."
    );

    if (cancellationResponse?.already_cancelled === true) {
      return finalizeCancelledLocally({
        saleId: normalizedSaleId,
        netpayTransactionId: transactionId,
        onStatus,
      });
    }

    cancellation = cancellationResponse?.data || null;
  }

  const responseTransactionId = positiveInteger(
    cancellation?.netpay_transaction_id,
    "netpay_transaction_id"
  );

  if (responseTransactionId !== transactionId) {
    throw createFlowError(
      "NETPAY_CANCELLATION_TRANSACTION_MISMATCH",
      "Backend devolvió una cancelación para otra operación NetPay.",
      cancellationResponse || cancellation
    );
  }

  const operationUuid = requiredText(
    cancellation?.operation_uuid,
    "operation_uuid"
  );

  const netpayOrderId = requiredText(
    cancellation?.netpay_order_id,
    "netpay_order_id"
  );

  const environment = requiredText(
    cancellation?.environment,
    "environment"
  );

  const waiter =
    createNetpayResultWaiter({
      netpayTransactionId:
        transactionId,
      operationUuid,
      signal,
    });

  notifyStatus(
    onStatus,
    "starting_cancellation",
    cancellation
  );

  const androidStart =
    startNetpayCancellation({
      netpay_transaction_id:
        transactionId,
      sale_id:
        normalizedSaleId,
      operation_uuid:
        operationUuid,
      netpay_order_id:
        netpayOrderId,
      environment,
    });

  const notSent =
    androidStart?.code ===
    "NETPAY_CANCELLATION_NOT_SENT";

  if (
    androidStart?.ok === false &&
    !notSent
  ) {
    waiter.cancel();

    try {
      await waiter.promise;
    } catch {
      // Solo se cancela el listener local.
    }

    throw createFlowError(
      androidStart?.code ||
        "NETPAY_CANCELLATION_START_FAILED",
      androidStart?.message ||
        "Android no pudo iniciar la cancelación NetPay.",
      androidStart
    );
  }

  notifyStatus(
    onStatus,
    "waiting_cancellation_result",
    cancellation
  );

  const normalizedResult =
    await waiter.promise;

  return processCancellationNormalizedResult({
    saleId:
      normalizedSaleId,
    netpayTransactionId:
      transactionId,
    operationUuid,
    normalizedResult,
    onStatus,
    signal,
  });
}

export async function resumeCashierPendingNetpayCancellation({
  onStatus = null,
  signal = null,
} = {}) {
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

  const operationType =
    String(
      operation.operationType || ""
    ).toLowerCase();

  if (
    operationType !==
    "cancellation"
  ) {
    return {
      outcome:
        "different_operation_type",
      pendingOperation:
        operation,
    };
  }

  const saleId =
    positiveInteger(
      operation.saleId,
      "sale_id"
    );

  const netpayTransactionId =
    positiveInteger(
      operation
        .netpayTransactionId,
      "netpay_transaction_id"
    );

  const operationUuid =
    requiredText(
      operation.operationUuid,
      "operation_uuid"
    );

  notifyStatus(
    onStatus,
    "resuming_cancellation",
    operation
  );

  if (
    operation.normalizedResult
  ) {
    return processCancellationNormalizedResult({
      saleId,
      netpayTransactionId,
      operationUuid,
      normalizedResult:
        operation.normalizedResult,
      onStatus,
      signal,
    });
  }

  const localState =
    String(
      operation.localState || ""
    ).toLowerCase();

  if (
    localState ===
    "pending_recovery"
  ) {
    return recoverCancellationVerification({
      saleId,
      netpayTransactionId,
      onStatus,
      signal,
    });
  }

  return {
    outcome: "operation_pending_local",
    pendingOperation: operation,
    message:
      localState ===
      "requires_review"
        ? "La cancelación NetPay pendiente requiere revisión antes de continuar."
        : "Existe una cancelación NetPay pendiente en Android.",
  };
}