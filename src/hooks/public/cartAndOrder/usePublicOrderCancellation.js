import {
  useCallback,
  useMemo,
  useState,
} from "react";
import { requestOrderCancellation } from "../../../services/public/publicMenu.service";
import { extractApiErrorInfo } from "../publicMenu.utils";
import { buildOrderCancellationSelectionPayload } from "../../../components/menu/shared/cancellation/OrderCancellationSelection";

/*
|--------------------------------------------------------------------------
| usePublicOrderCancellation
|--------------------------------------------------------------------------
| Administra la solicitud de cancelación del cliente QR.
| Solo registra partial/full pendientes para revisión del mesero.
|
| Usa:
| - publicMenu.service.js.
| - publicMenu.utils.js.
| - OrderCancellationSelection.jsx.
|
| Lo usa:
| - useCartAndOrder.js.
|--------------------------------------------------------------------------
*/

export function usePublicOrderCancellation({
  token,
  hasTable,
  orderingMode,
  isWebOrderingFlow,

  activeOrder,
  oldItems,

  pendingCancellation,
  setPendingCancellation,

  refreshOrder,
  setSendToast,
}) {
  const [
    cancellationSelection,
    setCancellationSelection,
  ] = useState({});

  const [
    cancellationActive,
    setCancellationActive,
  ] = useState(false);

  const [
    cancellationSubmitting,
    setCancellationSubmitting,
  ] = useState(false);

  const [
    cancellationError,
    setCancellationError,
  ] = useState("");

  const cancellationSummary =
    useMemo(() => {
      return buildOrderCancellationSelectionPayload(
        oldItems,
        cancellationSelection,
      );
    }, [
      oldItems,
      cancellationSelection,
    ]);

  const selectedCancellationItems =
    useMemo(() => {
      const selectedById =
        new Map(
          cancellationSummary.items.map(
            (item) => [
              Number(item.order_item_id),
              Number(item.quantity),
            ],
          ),
        );

      return oldItems
        .filter((item) =>
          selectedById.has(
            Number(
              item?.order_item_id ||
                item?.id ||
                0,
            ),
          ),
        )
        .map((item) => ({
          ...item,

          selected_quantity:
            selectedById.get(
              Number(
                item?.order_item_id ||
                  item?.id ||
                  0,
              ),
            ),
        }));
    }, [
      oldItems,
      cancellationSummary.items,
    ]);

  const isTableQrFlow =
    !isWebOrderingFlow &&
    Boolean(hasTable);

  const canRequestCancellation =
    isTableQrFlow &&
    String(
      orderingMode || "",
    ).toLowerCase() ===
      "customer_assisted" &&
    Boolean(activeOrder?.id) &&
    ["open", "ready"].includes(
      String(
        activeOrder?.status || "",
      ).toLowerCase(),
    ) &&
    !pendingCancellation;

  function startCancellation() {
    if (pendingCancellation) {
      const message =
        "Ya existe una solicitud de cancelación pendiente.";

      setCancellationError(message);

      return {
        ok: false,
        message,
      };
    }

    if (!canRequestCancellation) {
      const message =
        "La orden no permite solicitar una cancelación en este momento.";

      setCancellationError(message);

      return {
        ok: false,
        message,
      };
    }

    setCancellationSelection({});
    setCancellationError("");
    setCancellationActive(true);

    return {
      ok: true,
    };
  }

  function exitCancellation() {
    if (cancellationSubmitting) {
      return;
    }

    setCancellationSelection({});
    setCancellationError("");
    setCancellationActive(false);
  }

  function toggleCancellationItem(
    item,
    selected,
  ) {
    const orderItemId =
      Number(
        item?.order_item_id ||
          item?.id ||
          0,
      );

    const maxQuantity =
      Math.max(
        0,
        Math.floor(
          Number(
            item?.effective_quantity ??
              item?.quantity ??
              0,
          ),
        ),
      );

    if (
      !orderItemId ||
      maxQuantity <= 0
    ) {
      return;
    }

    setCancellationSelection(
      (previous) => {
        const next = {
          ...previous,
        };

        if (!selected) {
          delete next[orderItemId];

          return next;
        }

        const currentQuantity =
          Number(
            previous?.[orderItemId] ||
              1,
          );

        next[orderItemId] =
          Math.max(
            1,
            Math.min(
              maxQuantity,
              Math.floor(
                currentQuantity,
              ),
            ),
          );

        return next;
      },
    );
  }

  function setCancellationQuantity(
    item,
    quantity,
  ) {
    const orderItemId =
      Number(
        item?.order_item_id ||
          item?.id ||
          0,
      );

    const maxQuantity =
      Math.max(
        0,
        Math.floor(
          Number(
            item?.effective_quantity ??
              item?.quantity ??
              0,
          ),
        ),
      );

    const requestedQuantity =
      Number(quantity);

    if (
      !orderItemId ||
      maxQuantity <= 0 ||
      !Number.isFinite(
        requestedQuantity,
      )
    ) {
      return;
    }

    setCancellationSelection(
      (previous) => {
        if (
          !previous?.[orderItemId]
        ) {
          return previous;
        }

        return {
          ...previous,

          [orderItemId]:
            Math.max(
              1,
              Math.min(
                maxQuantity,
                Math.floor(
                  requestedQuantity,
                ),
              ),
            ),
        };
      },
    );
  }

  const requestCancellation =
    useCallback(
      async (resolution = {}) => {
        const orderId =
          Number(
            activeOrder?.id ||
              0,
          );

        if (
          !orderId ||
          !cancellationActive
        ) {
          const message =
            "No hay una solicitud de cancelación activa.";

          setCancellationError(message);

          return {
            ok: false,
            message,
          };
        }

        if (pendingCancellation) {
          const message =
            "Ya existe una solicitud de cancelación pendiente.";

          setCancellationError(message);

          return {
            ok: false,
            message,
          };
        }

        if (cancellationSubmitting) {
          return {
            ok: false,
            message:
              "La solicitud de cancelación ya se está enviando.",
          };
        }

        if (
          !cancellationSummary.can_continue ||
          !cancellationSummary.type
        ) {
          const message =
            "Selecciona al menos un producto para cancelar.";

          setCancellationError(message);

          return {
            ok: false,
            message,
          };
        }

        const reasonCode =
          String(
            resolution?.reason_code ||
              "",
          ).trim();

        if (!reasonCode) {
          const message =
            "Debes indicar el motivo de la solicitud.";

          setCancellationError(message);

          return {
            ok: false,
            message,
          };
        }

        setCancellationSubmitting(true);
        setCancellationError("");

        try {
          const res =
            await requestOrderCancellation({
              orderId,
              token:
                String(token || ""),

              type:
                cancellationSummary.type,

              items:
                cancellationSummary.items,

              reason_code:
                reasonCode,

              reason_note:
                String(
                  resolution?.reason_note ||
                    "",
                ).trim() ||
                null,
            });

          if (!res?.ok) {
            const message =
              res?.message ||
              "No fue posible enviar la solicitud de cancelación.";

            setCancellationError(message);

            return {
              ok: false,
              code:
                res?.code ||
                null,
              message,
              data:
                res?.data ||
                null,
            };
          }

          const responseData =
            res?.data &&
            typeof res.data === "object"
              ? res.data
              : {};

          setPendingCancellation({
            id:
              Number(
                responseData?.cancellation_id ||
                  0,
              ) ||
              null,

            type:
              String(
                responseData?.type ||
                  cancellationSummary.type,
              ),

            status:
              String(
                responseData?.status ||
                  "pending",
              ),

            reason_code:
              String(
                responseData?.reason_code ||
                  reasonCode,
              ),

            reason_note:
              responseData?.reason_note ||
              null,

            items:
              Array.isArray(
                responseData?.items,
              )
                ? responseData.items
                : [],
          });

          setCancellationSelection({});
          setCancellationActive(false);
          setCancellationError("");

          setSendToast(
            "✅ Solicitud de cancelación enviada.",
          );

          try {
            await refreshOrder(
              orderId,
            );
          } catch {
            /*
            * La solicitud ya fue creada. Conservamos el estado devuelto
            * por requestCancellation como respaldo si show() falla.
            */
          }

          return {
            ok: true,
            type:
              cancellationSummary.type,
            data:
              responseData,
            response:
              res,
          };
        } catch (error) {
          const apiError =
            extractApiErrorInfo(error);

          const message =
            apiError?.message ||
            "No fue posible enviar la solicitud de cancelación.";

          /*
          * Si el Backend informa que ya existe una pending, show() vuelve
          * a sincronizar el estado autoritativo.
          */
          try {
            await refreshOrder(
              orderId,
            );
          } catch {}

          setCancellationError(
            message,
          );

          return {
            ok: false,
            code:
              apiError?.code ||
              null,
            message,
            data:
              apiError?.data ||
              null,
          };
        } finally {
          setCancellationSubmitting(
            false,
          );
        }
      },
      [
        activeOrder?.id,
        cancellationActive,
        cancellationSubmitting,
        cancellationSummary,
        pendingCancellation,
        refreshOrder,
        token,
        setPendingCancellation,
        setSendToast,
      ],
    );

  function resetCancellation() {
    setPendingCancellation(null);
    setCancellationSelection({});
    setCancellationActive(false);
    setCancellationSubmitting(false);
    setCancellationError("");
  }

  return {
    pendingCancellation,

    cancellationSelection,
    cancellationSummary,
    selectedCancellationItems,

    cancellationActive,
    cancellationSubmitting,
    cancellationError,

    canRequestCancellation,

    startCancellation,
    exitCancellation,
    toggleCancellationItem,
    setCancellationQuantity,
    requestCancellation,

    resetCancellation,
  };
}