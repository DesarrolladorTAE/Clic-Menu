import { useCallback, useRef, useState } from "react";
import {
  createPublicOnlineOrder,
  quotePublicOnlineOrder,
  sendPublicWhatsapp,
} from "../../../services/public/publicMenu.service";
import {
  buildAvailabilityErrorMessage,
  extractApiErrorInfo,
  isAvailabilityErrorCode,
} from "../publicMenu.utils";
import { isPreparedItemLine } from "../../menu/preparedItem.utils";
import {
  buildOnlineOrderPublicErrorMessage,
  createOnlineOrderIdempotencyKey,
  normalizeItemsForApi,
  normalizeOnlineOrderItemsForApi,
} from "./publicCartAndOrder.utils";

/*
|--------------------------------------------------------------------------
| usePublicWebOrdering
|--------------------------------------------------------------------------
| Administra exclusivamente los flujos WEB del menú público:
| WhatsApp y ONLINE_ORDER.
|
| Usa:
| - publicMenu.service.js.
| - publicMenu.utils.js.
| - preparedItem.utils.js.
| - publicCartAndOrder.utils.js.
|
| Lo usa:
| - useCartAndOrder.js.
|--------------------------------------------------------------------------
*/

export function usePublicWebOrdering({
  token,
  isWhatsappFlow,
  isOnlineOrderFlow,

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
}) {
  const [onlineOrderQuoting, setOnlineOrderQuoting] = useState(false);
  const [onlineOrderCreating, setOnlineOrderCreating] = useState(false);
  const [onlineOrderCreated, setOnlineOrderCreated] = useState(null);

  const onlineOrderAttemptRef = useRef({
    signature: "",
    key: "",
  });

  const sendWhatsAppOrder = useCallback(async () => {
    try {
      const hasPreparedItems =
        cart.some(isPreparedItemLine);

      if (hasPreparedItems) {
        setSendToast(
          "⚠️ Preparación rápida no está disponible para pedidos por WhatsApp.",
        );

        return {
          ok: false,
          preparedItemBlocked: true,
        };
      }

      if (hasInvalidCartItems) {
        setSendToast(
          "⚠️ Hay productos que ya no están disponibles. Quítalos para continuar.",
        );

        return {
          ok: false,
          availabilityError: true,
        };
      }

      if (!isWhatsappFlow) {
        setSendToast(
          "Este menú no permite enviar pedidos por WhatsApp.",
        );

        return {
          ok: false,
        };
      }

      const items =
        normalizeItemsForApi(cart);

      const res = await sendPublicWhatsapp({
        token: String(token || ""),
        items,
      });

      if (res?.ok === false) {
        setSendToast(
          res?.message ||
            "No se pudo construir el mensaje de WhatsApp.",
        );

        return {
          ok: false,
        };
      }

      const url = String(
        res?.whatsapp_url || "",
      ).trim();

      if (!url) {
        setSendToast(
          "No se pudo abrir WhatsApp. Intenta nuevamente.",
        );

        return {
          ok: false,
        };
      }

      /*
      * Primero se abre el enlace calculado por backend.
      * Después se limpia el carrito local.
      */
      window.open(
        url,
        "_blank",
        "noopener,noreferrer",
      );

      setCart([]);
      setSendOpen(false);
      setCustomerName("");
      setPartySize("");
      setAdultCount("");
      setChildCount("");

      setSendToast(
        "Pedido preparado para enviar por WhatsApp.",
      );

      return {
        ok: true,
        pricing:
          res?.pricing &&
          typeof res.pricing === "object"
            ? res.pricing
            : null,
      };
    } catch (error) {
      const apiError =
        extractApiErrorInfo(error);

      if (isAvailabilityErrorCode(apiError.code)) {
        markCartAvailabilityError(apiError);

        setSendToast(
          `⚠️ ${buildAvailabilityErrorMessage(apiError)}`,
        );

        return {
          ok: false,
          availabilityError: true,
          data: apiError.data || null,
        };
      }

      const responseData =
        error?.response?.data &&
        typeof error.response.data === "object"
          ? error.response.data
          : {};

      const validationErrors =
        responseData?.errors &&
        typeof responseData.errors === "object"
          ? responseData.errors
          : null;

      if (validationErrors) {
        const firstKey =
          Object.keys(validationErrors)[0];

        const firstValue =
          validationErrors[firstKey];

        const firstMessage =
          Array.isArray(firstValue)
            ? firstValue[0]
            : firstValue;

        if (firstMessage) {
          setSendToast(
            `⚠️ ${String(firstMessage)}`,
          );

          return {
            ok: false,
          };
        }
      }

      setSendToast(
        responseData?.message ||
          "No se pudo construir el mensaje de WhatsApp.",
      );

      return {
        ok: false,
      };
    }
  }, [
    isWhatsappFlow,
    cart,
    token,
    hasInvalidCartItems,
    markCartAvailabilityError,
    setSendToast,
    setCart,
    setSendOpen,
    setCustomerName,
    setPartySize,
    setAdultCount,
    setChildCount,
  ]);

  const quoteOnlineOrder = useCallback(
    async (selection) => {
      if (!isOnlineOrderFlow) {
        return {
          ok: false,
          message:
            "Pedidos en línea no está disponible en este menú.",
        };
      }

      if (hasInvalidCartItems) {
        return {
          ok: false,
          message:
            "Hay productos que ya no están disponibles. Revisa tu pedido para continuar.",
        };
      }

      const items =
        normalizeOnlineOrderItemsForApi(cart);

      if (items.length === 0) {
        return {
          ok: false,
          message:
            "Agrega al menos un producto para continuar.",
        };
      }

      setOnlineOrderQuoting(true);

      try {
        const res =
          await quotePublicOnlineOrder({
            token: String(token || ""),
            payload: {
              ...(selection || {}),
              items,
            },
          });

        const quote =
          res?.data &&
          typeof res.data === "object"
            ? res.data
            : null;

        if (!quote) {
          return {
            ok: false,
            message:
              "No se pudo calcular el total del pedido. Intenta nuevamente.",
          };
        }

        return {
          ok: true,
          data: quote,
        };
      } catch (error) {
        const preparedError =
          await handlePreparedItemRequestError(error);

        if (preparedError) {
          return preparedError;
        }

        const apiError =
          extractApiErrorInfo(error);

        if (isAvailabilityErrorCode(apiError.code)) {
          markCartAvailabilityError(apiError);

          return {
            ok: false,
            availabilityError: true,
            message:
              buildAvailabilityErrorMessage(
                apiError,
              ),
          };
        }

        return {
          ok: false,
          message:
            buildOnlineOrderPublicErrorMessage(
              error,
              "No se pudo calcular el total del pedido. Intenta nuevamente.",
            ),
        };
      } finally {
        setOnlineOrderQuoting(false);
      }
    },
    [
      isOnlineOrderFlow,
      hasInvalidCartItems,
      cart,
      token,
      markCartAvailabilityError,
      handlePreparedItemRequestError,
    ],
  );

  const createOnlineOrder = useCallback(
    async (selection) => {
      if (!isOnlineOrderFlow) {
        return {
          ok: false,
          message:
            "Pedidos en línea no está disponible en este menú.",
        };
      }

      if (hasInvalidCartItems) {
        return {
          ok: false,
          message:
            "Hay productos que ya no están disponibles. Revisa tu pedido para continuar.",
        };
      }

      const items =
        normalizeOnlineOrderItemsForApi(cart);

      if (items.length === 0) {
        return {
          ok: false,
          message:
            "Agrega al menos un producto para continuar.",
        };
      }

      const basePayload = {
        ...(selection || {}),
        items,
      };

      const signature =
        JSON.stringify(basePayload);

      if (
        onlineOrderAttemptRef.current.signature !== signature ||
        !onlineOrderAttemptRef.current.key
      ) {
        onlineOrderAttemptRef.current = {
          signature,
          key:
            createOnlineOrderIdempotencyKey(),
        };
      }

      const payload = {
        idempotency_key:
          onlineOrderAttemptRef.current.key,
        ...basePayload,
      };

      setOnlineOrderCreating(true);

      try {
        const res =
          await createPublicOnlineOrder({
            token: String(token || ""),
            payload,
          });

        if (res?.ok !== true) {
          return {
            ok: false,
            message: String(
              res?.message ||
                "No se pudo enviar el pedido. Intenta nuevamente.",
            ),
          };
        }

        const responseData =
          res?.data &&
          typeof res.data === "object"
            ? res.data
            : {};

        const created = {
          public_number: String(
            responseData?.public_number || "",
          ),

          tracking_token: String(
            responseData?.tracking_token || "",
          ),

          tracking_url: String(
            responseData?.tracking_url || "",
          ),

          status: String(
            responseData?.status || "",
          ),

          idempotent: Boolean(
            responseData?.idempotent,
          ),

          message: String(
            res?.message ||
              "Pedido enviado correctamente.",
          ),
        };

        setOnlineOrderCreated(created);
        setCart([]);
        setPreparedCartMessage("");

        await refreshPreparedItemsPool();

        return {
          ok: true,
          data: created,
        };
      } catch (error) {
        const preparedError =
          await handlePreparedItemRequestError(error);

        if (preparedError) {
          return preparedError;
        }

        const apiError =
          extractApiErrorInfo(error);

        if (isAvailabilityErrorCode(apiError.code)) {
          markCartAvailabilityError(apiError);

          return {
            ok: false,
            availabilityError: true,
            message:
              buildAvailabilityErrorMessage(
                apiError,
              ),
          };
        }

        return {
          ok: false,
          message:
            buildOnlineOrderPublicErrorMessage(
              error,
              "No se pudo enviar el pedido. Intenta nuevamente.",
            ),
        };
      } finally {
        setOnlineOrderCreating(false);
      }
    },
    [
      isOnlineOrderFlow,
      hasInvalidCartItems,
      cart,
      token,
      markCartAvailabilityError,
      handlePreparedItemRequestError,
      refreshPreparedItemsPool,
      setCart,
      setPreparedCartMessage,
    ],
  );

  function resetWebOrdering() {
    setOnlineOrderQuoting(false);
    setOnlineOrderCreating(false);
    setOnlineOrderCreated(null);

    onlineOrderAttemptRef.current = {
      signature: "",
      key: "",
    };
  }

  return {
    onlineOrderQuoting,
    onlineOrderCreating,
    onlineOrderCreated,
    setOnlineOrderCreated,

    sendWhatsAppOrder,
    quoteOnlineOrder,
    createOnlineOrder,

    resetWebOrdering,
  };
}