import React, { useEffect, useMemo, useState } from "react";

import WaiterCancellationRequestModalShell from "./cancellation-request/WaiterCancellationRequestModalShell";
import WaiterCancellationRequestReview from "./cancellation-request/WaiterCancellationRequestReview";
import WaiterCancellationRequestApproval from "./cancellation-request/WaiterCancellationRequestApproval";

import {
  buildRequestedItems,
  getPhysicalResolutionItems,
  normalizeAuthorizers,
  requiresRequestAuthorization,
} from "./cancellation-request/waiterCancellationRequest.utils";

export default function WaiterCancellationRequestDialog({
  open,
  request = null,
  context = null,
  loading = false,
  onClose,
  onReject,
  onApprove,
}) {
  const [view, setView] = useState("review");
  const [action, setAction] = useState(null);

  const requestedItems = useMemo(() => {
    return buildRequestedItems(request, context);
  }, [request, context]);

  const hasStaleItems = useMemo(() => {
    return requestedItems.some((item) => Boolean(item?.stale));
  }, [requestedItems]);

  const physicalItems = useMemo(() => {
    return getPhysicalResolutionItems(requestedItems);
  }, [requestedItems]);

  const requiresAuthorization = useMemo(() => {
    return requiresRequestAuthorization(request, context, requestedItems);
  }, [request, context, requestedItems]);

  const authorizers = useMemo(() => {
    return normalizeAuthorizers(context);
  }, [context]);

  const requiresApprovalFlow = physicalItems.length > 0 || requiresAuthorization;
  const busy = loading || action !== null;

  useEffect(() => {
    if (!open) {
      return;
    }

    setView("review");
    setAction(null);
  }, [open, request?.id, context]);

  const runReject = async () => {
    if (busy) {
      return;
    }

    setAction("reject");

    try {
      return await onReject?.();
    } finally {
      setAction(null);
    }
  };

  const runApprove = async (payload = {}) => {
    if (busy) {
      return;
    }

    setAction("approve");

    try {
      return await onApprove?.(payload);
    } finally {
      setAction(null);
    }
  };

  const handleReviewApprove = async () => {
    if (busy || hasStaleItems || requestedItems.length === 0) {
      return;
    }

    /*
     * Si Backend exige decisiones físicas o autorización todavía NO se
     * resuelve la solicitud. Solamente avanzamos a la segunda vista.
     */
    if (requiresApprovalFlow) {
      setView("approval");
      return;
    }

    /*
     * No existe ninguna información adicional pendiente.
     * En este caso approve:true ya es una respuesta completa.
     */
    await runApprove({});
  };

  const handleApprovalBack = () => {
    if (busy) {
      return;
    }

    setView("review");
  };

  const handleClose = () => {
    if (busy) {
      return;
    }

    onClose?.();
  };

  if (!open) {
    return null;
  }

  return (
    <WaiterCancellationRequestModalShell
      open={open}
      title={view === "review" ? "Revisar solicitud" : "Aprobar solicitud"}
      subtitle={
        view === "review"
          ? "Solicitud de cancelación enviada por el cliente."
          : "Completa la resolución necesaria antes de enviar la aprobación."
      }
      closeDisabled={busy}
      onClose={handleClose}
    >
      {view === "review" ? (
        <WaiterCancellationRequestReview
          request={request}
          items={requestedItems}
          hasStaleItems={hasStaleItems}
          loading={busy}
          action={action}
          onReject={runReject}
          onApprove={handleReviewApprove}
        />
      ) : (
        <WaiterCancellationRequestApproval
          items={requestedItems}
          requiresAuthorization={requiresAuthorization}
          authorizers={authorizers}
          loading={busy}
          onBack={handleApprovalBack}
          onConfirm={runApprove}
        />
      )}
    </WaiterCancellationRequestModalShell>
  );
}