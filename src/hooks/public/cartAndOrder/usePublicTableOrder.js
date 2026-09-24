import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  appendPublicOrderItems,
  createPublicOrder,
  getPublicOrder,
} from "../../../services/public/publicMenu.service";
import {
  buildAvailabilityErrorMessage,
  extractApiErrorInfo,
  isAvailabilityErrorCode,
} from "../publicMenu.utils";
import {
  isActiveOrderStatus,
  isPendingLikeStatus,
  mergeConfirmedOrderTotals,
  normalizeItemsForApi,
} from "./publicCartAndOrder.utils";

/*
|--------------------------------------------------------------------------
| usePublicTableOrder
|--------------------------------------------------------------------------
| Administra el ciclo de vida de la Order creada desde QR de mesa:
| pending, open, ready, paying, paid, refresh, append y realtime.
|
| Usa:
| - publicMenu.service.js.
| - publicMenu.utils.js.
| - publicCartAndOrder.utils.js.
|
| Lo usa:
| - useCartAndOrder.js.
|--------------------------------------------------------------------------
*/

export function usePublicTableOrder({
  token,

  cart,
  setCart,
  hasInvalidCartItems,

  markCartAvailabilityError,
  handlePreparedItemRequestError,
  refreshPreparedItemsPool,
  setPreparedCartMessage,

  setSendToast,
  setSendOpen,
  setCustomerName,
  setPartySize,
  setAdultCount,
  setChildCount,

  canStartCustomerOrder,
  customerOrderStartReason,
  customerOrderStartReasonCode,

  setPendingCancellation,
}) {
  const [pendingOrder, setPendingOrder] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [oldItems, setOldItems] = useState([]);

  const lastOrderIdRef = useRef(null);

  const currentOrderId = useMemo(() => {
    return Number(
      activeOrder?.id ||
        pendingOrder?.id ||
        lastOrderIdRef.current ||
        0,
    );
  }, [
    activeOrder?.id,
    pendingOrder?.id,
  ]);

  const canAppend =
    !!activeOrder?.id &&
    ["open", "ready"].includes(
      String(
        activeOrder?.status || "",
      ).toLowerCase(),
    );

  const reconcileOrderState = useCallback(
    (order) => {
      const o =
        order
          ? { ...order }
          : null;

      const status =
        String(
          o?.status || "",
        ).toLowerCase();

      const oid =
        Number(o?.id || 0);

      if (oid) {
        lastOrderIdRef.current = oid;
      }

      if (!o) {
        return;
      }

      /*
      * Cuando la orden ya entró a caja, la etapa anterior de
      * solicitud al mesero queda concluida.
      */
      if (status === "paying") {
        setPendingOrder(null);
        setSendToast("");

        setActiveOrder({
          ...o,
          id: oid || o?.id,
          status: "paying",

          customer_ui: {
            ...(o?.customer_ui || {}),
            show_payment_message: true,
            can_add_items: false,
            can_send_items: false,
          },

          bill_flow: {
            ...(o?.bill_flow || {}),
            can_request_bill: false,
            already_sent: false,
            request_status: null,
          },
        });

        return;
      }

      if (isActiveOrderStatus(status)) {
        setPendingOrder(null);
        setActiveOrder(o);

        return;
      }

      if (isPendingLikeStatus(status)) {
        setPendingOrder({
          ...o,
          id: oid || null,
          status:
            status ||
            "pending",
        });

        if (
          status === "pending" ||
          status === "pending_approval" ||
          status === "rejected" ||
          status === "expired" ||
          status === "cancelled"
        ) {
          setActiveOrder(null);
        }

        return;
      }

      setActiveOrder(o);
    },
    [setSendToast],
  );

  const refreshOrder = useCallback(
    async (orderId) => {
      const oid = Number(
        orderId ||
          activeOrder?.id ||
          pendingOrder?.id ||
          lastOrderIdRef.current ||
          0,
      );

      if (!oid) {
        return null;
      }

      const res =
        await getPublicOrder({
          orderId: oid,
          token: String(token || ""),
        });

      if (res?.ok) {
        const o =
          res?.data?.order ||
          null;

        const items =
          Array.isArray(res?.data?.items)
            ? res.data.items
            : [];

        const pendingCancellationResponse =
          res?.data?.pending_cancellation ||
          null;

        setPendingCancellation(
          pendingCancellationResponse,
        );

        if (o) {
          reconcileOrderState({
            ...o,
          });
        } else {
          setActiveOrder((previous) => ({
            ...(previous || {}),
            id: oid,
          }));
        }

        setOldItems(items);
        lastOrderIdRef.current = oid;

        return {
          order: o,
          items,
        };
      }

      return null;
    },
    [
      token,
      activeOrder?.id,
      pendingOrder?.id,
      reconcileOrderState,
      setPendingCancellation,
    ],
  );

  const createFirstOrder = useCallback(
    async (name, occupancyPayload) => {
      if (hasInvalidCartItems) {
        setSendToast(
          "⚠️ Hay productos que ya no están disponibles. Quítalos para continuar.",
        );

        return {
          ok: false,
          availabilityError: true,
        };
      }

      if (canStartCustomerOrder === false) {
        const message =
          customerOrderStartReason ||
          "No se pueden iniciar nuevos pedidos desde QR en este momento.";

        setSendToast(
          `⚠️ ${message}`,
        );

        return {
          ok: false,
          planBlocked: true,
          code:
            customerOrderStartReasonCode ||
            "QR_ORDERING_NOT_ALLOWED_BY_PLAN",
        };
      }

      const items =
        normalizeItemsForApi(cart);

      try {
        const res =
          await createPublicOrder({
            token:
              String(token || ""),

            customer_name:
              name,

            party_size:
              occupancyPayload.party_size,

            adult_count:
              occupancyPayload.adult_count,

            child_count:
              occupancyPayload.child_count,

            items,
          });

        if (res?.ok) {
          const responseData =
            res?.data &&
            typeof res.data === "object"
              ? res.data
              : {};

          const orderId =
            responseData?.order_id ||
            responseData?.id ||
            res?.order_id ||
            null;

          if (orderId) {
            const numericOrderId =
              Number(orderId);

            setPendingOrder((previous) =>
              mergeConfirmedOrderTotals(
                previous,
                responseData,
                {
                  id: numericOrderId,

                  status:
                    String(
                      responseData?.status ||
                        "",
                    ) ||
                    "pending",
                },
              ),
            );

            lastOrderIdRef.current =
              numericOrderId;

            try {
              await refreshOrder(
                numericOrderId,
              );
            } catch {
              /*
              * La orden ya fue creada.
              * Se conservan como respaldo los totales confirmados
              * de la respuesta de creación.
              */
            }
          } else {
            setPendingOrder({
              id: null,
              status: "pending",
            });
          }

          setCart([]);
          setCustomerName("");
          setPartySize("");
          setAdultCount("");
          setChildCount("");
          setSendOpen(false);

          setSendToast(
            "✅ Comanda enviada. En espera de aprobación.",
          );

          setPreparedCartMessage("");

          await refreshPreparedItemsPool();

          return {
            ok: true,
            orderId,
          };
        }

        setSendToast(
          `⚠️ ${
            res?.message ||
            "No se pudo crear la comanda."
          }`,
        );

        return {
          ok: false,
        };
      } catch (e) {
        const preparedError =
          await handlePreparedItemRequestError(e);

        if (preparedError) {
          setSendToast(
            preparedError.message,
          );

          return preparedError;
        }

        const apiError =
          extractApiErrorInfo(e);

        const apiErrorCode =
          String(
            apiError?.code || "",
          ).toUpperCase();

        if (
          apiError?.status === 403 &&
          apiErrorCode ===
            "QR_ORDERING_NOT_ALLOWED_BY_PLAN"
        ) {
          setSendToast(
            `⚠️ ${apiError.message}`,
          );

          return {
            ok: false,
            planBlocked: true,
            code: apiErrorCode,
          };
        }

        if (
          isAvailabilityErrorCode(
            apiError.code,
          )
        ) {
          markCartAvailabilityError(
            apiError,
          );

          setSendToast(
            `⚠️ ${buildAvailabilityErrorMessage(apiError)}`,
          );

          return {
            ok: false,
            availabilityError: true,
            data:
              apiError.data ||
              null,
          };
        }

        const validationErrors =
          apiError?.errors ||
          e?.response?.data?.errors ||
          null;

        if (
          validationErrors &&
          typeof validationErrors === "object"
        ) {
          const firstKey =
            Object.keys(
              validationErrors,
            )[0];

          const firstMessage =
            Array.isArray(
              validationErrors[firstKey],
            )
              ? validationErrors[firstKey][0]
              : validationErrors[firstKey];

          if (firstMessage) {
            setSendToast(
              `⚠️ ${firstMessage}`,
            );

            return {
              ok: false,
            };
          }
        }

        const msg =
          apiError?.message ||
          "No se pudo crear la comanda.";

        setSendToast(
          `⚠️ ${msg}`,
        );

        return {
          ok: false,
        };
      }
    },
    [
      cart,
      token,
      refreshOrder,
      hasInvalidCartItems,
      markCartAvailabilityError,
      canStartCustomerOrder,
      customerOrderStartReason,
      customerOrderStartReasonCode,
      handlePreparedItemRequestError,
      refreshPreparedItemsPool,
      setCart,
      setCustomerName,
      setPartySize,
      setAdultCount,
      setChildCount,
      setSendOpen,
      setSendToast,
      setPreparedCartMessage,
    ],
  );

  const appendToOpenOrder = useCallback(
    async (orderId) => {
      if (hasInvalidCartItems) {
        setSendToast(
          "⚠️ Hay productos que ya no están disponibles. Quítalos para continuar.",
        );

        return {
          ok: false,
          availabilityError: true,
        };
      }

      const items =
        normalizeItemsForApi(cart);

      try {
        const res =
          await appendPublicOrderItems({
            orderId:
              Number(orderId),

            token:
              String(token || ""),

            items,
          });

        if (res?.ok) {
          const responseData =
            res?.data &&
            typeof res.data === "object"
              ? res.data
              : {};

          setActiveOrder((previous) =>
            mergeConfirmedOrderTotals(
              previous,
              responseData,
              {
                id:
                  Number(orderId),

                status:
                  previous?.status ||
                  "open",
              },
            ),
          );

          setCart([]);

          setSendToast(
            "✅ Productos agregados a la orden.",
          );

          try {
            await refreshOrder(
              orderId,
            );
          } catch {
            /*
            * El append ya fue procesado.
            * Se conservan los totales confirmados de su respuesta.
            */
          }

          setPreparedCartMessage("");

          await refreshPreparedItemsPool();

          return {
            ok: true,
          };
        }

        setSendToast(
          `⚠️ ${
            res?.message ||
            "No se pudieron agregar productos."
          }`,
        );

        return {
          ok: false,
        };
      } catch (e) {
        const preparedError =
          await handlePreparedItemRequestError(e);

        if (preparedError) {
          setSendToast(
            preparedError.message,
          );

          return preparedError;
        }

        const apiError =
          extractApiErrorInfo(e);

        if (
          isAvailabilityErrorCode(
            apiError.code,
          )
        ) {
          markCartAvailabilityError(
            apiError,
          );

          setSendToast(
            `⚠️ ${buildAvailabilityErrorMessage(apiError)}`,
          );

          return {
            ok: false,
            availabilityError: true,
            data:
              apiError.data ||
              null,
          };
        }

        const msg =
          apiError?.message ||
          "No se pudieron agregar productos.";

        setSendToast(
          `⚠️ ${msg}`,
        );

        return {
          ok: false,
        };
      }
    },
    [
      cart,
      token,
      refreshOrder,
      hasInvalidCartItems,
      markCartAvailabilityError,
      handlePreparedItemRequestError,
      refreshPreparedItemsPool,
      setCart,
      setSendToast,
      setPreparedCartMessage,
    ],
  );

  const applyRealtimeOrderReason =
    useCallback(
      (reason, orderId) => {
        const rs =
          String(
            reason || "",
          ).toLowerCase();

        const oid = Number(
          orderId ||
            pendingOrder?.id ||
            activeOrder?.id ||
            lastOrderIdRef.current ||
            0,
        );

        if (!oid) {
          return;
        }

        lastOrderIdRef.current = oid;

        if (
          rs ===
          "pending_order_created"
        ) {
          setPendingOrder((previous) => ({
            ...(previous || {}),
            id: oid,
            status: "pending",
          }));

          return;
        }

        if (
          rs ===
          "pending_order_accepted"
        ) {
          setPendingOrder(null);

          setActiveOrder((previous) => ({
            ...(previous || {}),
            id: oid,
            status: "open",

            customer_ui: {
              ...(previous?.customer_ui || {}),
              can_add_items: true,
              can_send_items: true,
              show_payment_message: false,
            },
          }));

          return;
        }

        if (
          rs ===
          "order_items_appended"
        ) {
          setPendingOrder(null);

          setActiveOrder((previous) => ({
            ...(previous || {}),
            id: oid,

            status:
              [
                "ready",
                "paying",
                "paid",
              ].includes(
                String(
                  previous?.status || "",
                ).toLowerCase(),
              )
                ? previous?.status
                : "open",

            customer_ui: {
              ...(previous?.customer_ui || {}),
              can_add_items: true,
              can_send_items: true,
            },
          }));

          return;
        }

        if (
          rs ===
          "pending_order_rejected"
        ) {
          setPendingOrder({
            id: oid,
            status: "rejected",
          });

          setActiveOrder(null);

          return;
        }

        if (
          rs ===
          "ready_notice_read"
        ) {
          setPendingOrder(null);

          setActiveOrder((previous) => ({
            ...(previous || {}),
            id: oid,
            status: "ready",

            customer_ui: {
              ...(previous?.customer_ui || {}),
              can_add_items: true,
              can_send_items: true,
              show_payment_message: false,
            },

            bill_flow: {
              ...(previous?.bill_flow || {}),
              can_request_bill: true,
            },
          }));

          return;
        }

        if (
          rs ===
          "bill_requested"
        ) {
          setPendingOrder(null);

          setActiveOrder((previous) => {
            const currentStatus =
              String(
                previous?.status || "",
              ).toLowerCase();

            /*
            * Un evento atrasado de solicitud no debe reactivar
            * la etapa anterior cuando la cuenta ya está en caja.
            */
            if (
              currentStatus === "paying" ||
              currentStatus === "paid"
            ) {
              return previous;
            }

            return {
              ...(previous || {}),
              id: oid,

              bill_flow: {
                ...(previous?.bill_flow || {}),
                already_sent: true,
                request_status: "sent",
              },
            };
          });

          return;
        }

        if (
          rs ===
          "bill_request_read"
        ) {
          setPendingOrder(null);

          setActiveOrder((previous) => {
            const currentStatus =
              String(
                previous?.status || "",
              ).toLowerCase();

            /*
            * Si la orden ya está pagando o pagada, una lectura
            * atrasada no debe volver a mostrar la solicitud.
            */
            if (
              currentStatus === "paying" ||
              currentStatus === "paid"
            ) {
              return previous;
            }

            return {
              ...(previous || {}),
              id: oid,

              bill_flow: {
                ...(previous?.bill_flow || {}),
                already_sent: true,
                request_status: "read",
              },
            };
          });

          return;
        }

        if (
          rs ===
          "payment_started"
        ) {
          setPendingOrder(null);
          setSendToast("");

          setActiveOrder((previous) => ({
            ...(previous || {}),
            id: oid,
            status: "paying",

            customer_ui: {
              ...(previous?.customer_ui || {}),
              show_payment_message: true,
              can_add_items: false,
              can_send_items: false,
            },

            bill_flow: {
              ...(previous?.bill_flow || {}),
              can_request_bill: false,
              already_sent: false,
              request_status: null,
            },
          }));

          return;
        }

        if (
          rs ===
          "order_paid"
        ) {
          setPendingOrder(null);

          setActiveOrder((previous) => ({
            ...(previous || {}),
            id: oid,
            status: "paid",

            customer_ui: {
              ...(previous?.customer_ui || {}),
              show_payment_message: false,
              can_add_items: false,
              can_send_items: false,
            },

            bill_flow: {
              ...(previous?.bill_flow || {}),
              can_request_bill: false,
            },
          }));
        }
      },
      [
        pendingOrder?.id,
        activeOrder?.id,
        setSendToast,
      ],
    );

  const syncOrderStatusFromSession =
    useCallback(
      async (sessionOrderStatus) => {
        const st =
          String(
            sessionOrderStatus || "",
          ).toLowerCase();

        const oid =
          pendingOrder?.id ||
          activeOrder?.id ||
          lastOrderIdRef.current;

        if (!oid) {
          return;
        }

        if (
          st.includes("open") ||
          st.includes("ready")
        ) {
          setPendingOrder(null);

          setActiveOrder((previous) => ({
            ...(previous || {}),
            id: Number(oid),

            status:
              st.includes("ready")
                ? "ready"
                : "open",

            customer_ui: {
              ...(previous?.customer_ui || {}),
              can_add_items: true,
              can_send_items: true,
              show_payment_message: false,
            },
          }));

          await refreshOrder(oid);

          return;
        }

        if (
          st.includes("paying")
        ) {
          setPendingOrder(null);
          setSendToast("");

          setActiveOrder((previous) => ({
            ...(previous || {}),
            id: Number(oid),
            status: "paying",

            customer_ui: {
              ...(previous?.customer_ui || {}),
              show_payment_message: true,
              can_add_items: false,
              can_send_items: false,
            },

            bill_flow: {
              ...(previous?.bill_flow || {}),
              can_request_bill: false,
              already_sent: false,
              request_status: null,
            },
          }));

          await refreshOrder(oid);

          return;
        }

        if (
          st.includes("pending")
        ) {
          setPendingOrder((previous) => ({
            ...(previous || {}),
            id: Number(oid),
            status: "pending",
          }));

          return;
        }

        if (
          st.includes("rejected")
        ) {
          setPendingOrder({
            id: Number(oid),
            status: "rejected",
          });

          setActiveOrder(null);

          return;
        }

        if (
          st.includes("expired")
        ) {
          setPendingOrder({
            id: Number(oid),
            status: "expired",
          });

          setActiveOrder(null);
        }
      },
      [
        pendingOrder?.id,
        activeOrder?.id,
        refreshOrder,
        setSendToast,
      ],
    );

  function resetTableOrder() {
    setPendingOrder(null);
    setActiveOrder(null);
    setOldItems([]);

    lastOrderIdRef.current = null;
  }

  return {
    pendingOrder,
    activeOrder,
    oldItems,

    currentOrderId,
    canAppend,

    refreshOrder,
    createFirstOrder,
    appendToOpenOrder,

    syncOrderStatusFromSession,
    applyRealtimeOrderReason,

    resetTableOrder,
  };
}