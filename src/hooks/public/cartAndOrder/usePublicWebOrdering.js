//src/hooks/public/cartAndOrder/usePublicWebOrdering.js
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
  const whatsappSendingRef = useRef(false);
  const onlineOrderCreatingRef = useRef(false);

  const onlineOrderAttemptRef = useRef({
    signature: "",
    key: "",
  });

  const sendWhatsAppOrder = useCallback(async () => {
    if (whatsappSendingRef.current) {
      return { ok: false, alreadySending: true };
    }

    let whatsappWindow = null;

    try {
      const hasPreparedItems = cart.some(isPreparedItemLine);

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

      const items = normalizeItemsForApi(cart);

      if (items.length === 0) {
        setSendToast("⚠️ Agrega al menos un producto o Conjunto para continuar.");
        return { ok: false };
      }

      whatsappSendingRef.current = true;

      /*
      * Se reserva la ventana durante la pulsación del usuario.
      * Así evitamos que el navegador bloquee la apertura
      * después de consultar el importe del pedido.
      */
      try {
        whatsappWindow = window.open("", "_blank");
        if (whatsappWindow) {
          whatsappWindow.opener = null;
        }
      } catch {
        whatsappWindow = null;
      }

      const res = await sendPublicWhatsapp({
        token: String(token || ""),
        items,
      });

      if (res?.ok !== true) {
        if (whatsappWindow && !whatsappWindow.closed) {
          whatsappWindow.close();
        }

        setSendToast(res?.message || "No se pudo preparar el pedido para WhatsApp.");
        return { ok: false };
      }

      const url = String(
        res?.whatsapp_url || "",
      ).trim();

      if (!url) {
        if (whatsappWindow && !whatsappWindow.closed) {
          whatsappWindow.close();
        }

        setSendToast("No se pudo obtener el enlace de WhatsApp. Intenta nuevamente.");
        return { ok: false };
      }

      /*
      * Abrir el enlace autorizado por el servidor.
      * Si el navegador impidió crear otra pestaña,
      * utilizar la pestaña actual como alternativa.
      */
      let opened = false;

      if (whatsappWindow && !whatsappWindow.closed) {
        try {
          whatsappWindow.location.replace(url);
          opened = true;
        } catch {
          opened = false;
        }
      }

      if (!opened) {
        window.location.assign(url);
      }

      setCart([]);
      setSendOpen(false);
      setCustomerName("");
      setPartySize("");
      setAdultCount("");
      setChildCount("");

      setSendToast("Pedido preparado para enviar por WhatsApp.");

      return {
        ok: true,
        pricing:
          res?.pricing &&
          typeof res.pricing === "object"
            ? res.pricing
            : null,
      };
    } catch (error) {
      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.close();
      }

      if (error?.name === "MenuSetPayloadError") {
        setSendToast(`⚠️ ${error.message || "Revisa las selecciones del Conjunto."}`);
        return { ok: false };
      }

      const apiError = extractApiErrorInfo(error);

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
    } finally {
      whatsappSendingRef.current = false;
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

  const quoteOnlineOrder = useCallback(async (selection) => {
    if (!isOnlineOrderFlow) {
      return { ok: false, message: "Pedidos en línea no está disponible en este menú." };
    }

    if (hasInvalidCartItems) {
      return {
        ok: false,
        message: "Hay productos que ya no están disponibles. Revisa tu pedido para continuar.",
      };
    }

    setOnlineOrderQuoting(true);

    try {
      const items = normalizeOnlineOrderItemsForApi(cart);

      if (items.length === 0) {
        return { ok: false, message: "Agrega al menos un producto o Conjunto para continuar." };
      }

      const res = await quotePublicOnlineOrder({
        token: String(token || ""),
        payload: { ...(selection || {}), items },
      });

      const quote = res?.data &&
        typeof res.data === "object" &&
        !Array.isArray(res.data) &&
        res.data.total !== null &&
        res.data.total !== undefined &&
        Number.isFinite(Number(res.data.total))
          ? res.data
          : null;

      if (!quote) {
        return {
          ok: false,
          message: "No se pudo calcular el total del pedido. Intenta nuevamente.",
        };
      }

      return { ok: true, data: quote };
    } catch (error) {
      if (error?.name === "MenuSetPayloadError") {
        return {
          ok: false,
          message: error.message || "Revisa las selecciones de los Conjuntos.",
        };
      }

      const preparedError = await handlePreparedItemRequestError(error);
      if (preparedError) return preparedError;

      const apiError = extractApiErrorInfo(error);

      if (isAvailabilityErrorCode(apiError.code)) {
        markCartAvailabilityError(apiError);

        return {
          ok: false,
          availabilityError: true,
          message: buildAvailabilityErrorMessage(apiError),
        };
      }

      return {
        ok: false,
        message: buildOnlineOrderPublicErrorMessage(
          error,
          "No se pudo calcular el total del pedido. Intenta nuevamente.",
        ),
      };
    } finally {
      setOnlineOrderQuoting(false);
    }
  }, [
    isOnlineOrderFlow,
    hasInvalidCartItems,
    cart,
    token,
    markCartAvailabilityError,
    handlePreparedItemRequestError,
  ]);

  const createOnlineOrder = useCallback(async (selection) => {
    if (!isOnlineOrderFlow) {
      return { ok: false, message: "Pedidos en línea no está disponible en este menú." };
    }

    if (hasInvalidCartItems) {
      return {
        ok: false,
        message: "Hay productos que ya no están disponibles. Revisa tu pedido para continuar.",
      };
    }

    if (onlineOrderCreatingRef.current) {
      return {
        ok: false,
        alreadyCreating: true,
        message: "Tu pedido ya se está enviando.",
      };
    }

    onlineOrderCreatingRef.current = true;
    setOnlineOrderCreating(true);

    try {
      const items = normalizeOnlineOrderItemsForApi(cart);

      if (items.length === 0) {
        return { ok: false, message: "Agrega al menos un producto o Conjunto para continuar." };
      }

      const basePayload = { ...(selection || {}), items };
      const signature = JSON.stringify(basePayload);

      if (
        onlineOrderAttemptRef.current.signature !== signature ||
        !onlineOrderAttemptRef.current.key
      ) {
        onlineOrderAttemptRef.current = {
          signature,
          key: createOnlineOrderIdempotencyKey(),
        };
      }

      const payload = {
        idempotency_key: onlineOrderAttemptRef.current.key,
        ...basePayload,
      };

      const res = await createPublicOnlineOrder({
        token: String(token || ""),
        payload,
      });

      if (res?.ok !== true) {
        return {
          ok: false,
          message: String(res?.message || "No se pudo enviar el pedido. Intenta nuevamente."),
        };
      }

      const responseData = res?.data &&
        typeof res.data === "object"
          ? res.data
          : {};

      const created = {
        public_number: String(responseData?.public_number || ""),
        tracking_token: String(responseData?.tracking_token || ""),
        tracking_url: String(responseData?.tracking_url || ""),
        status: String(responseData?.status || ""),
        idempotent: Boolean(responseData?.idempotent),
        message: String(res?.message || "Pedido enviado correctamente."),
      };

      setOnlineOrderCreated(created);
      setCart([]);
      setPreparedCartMessage("");

      /*
      * La actualización de Preparación rápida es independiente.
      * Nunca debe convertir un pedido creado en un error de envío.
      */
      Promise.resolve()
        .then(() => refreshPreparedItemsPool?.())
        .catch(() => {});

      return { ok: true, data: created };
    } catch (error) {
      if (error?.name === "MenuSetPayloadError") {
        return {
          ok: false,
          message: error.message || "Revisa las selecciones de los Conjuntos.",
        };
      }

      const preparedError = await handlePreparedItemRequestError(error);
      if (preparedError) return preparedError;

      const apiError = extractApiErrorInfo(error);

      if (isAvailabilityErrorCode(apiError.code)) {
        markCartAvailabilityError(apiError);

        return {
          ok: false,
          availabilityError: true,
          message: buildAvailabilityErrorMessage(apiError),
        };
      }

      return {
        ok: false,
        message: buildOnlineOrderPublicErrorMessage(
          error,
          "No se pudo enviar el pedido. Intenta nuevamente.",
        ),
      };
    } finally {
      onlineOrderCreatingRef.current = false;
      setOnlineOrderCreating(false);
    }
  }, [
    isOnlineOrderFlow,
    hasInvalidCartItems,
    cart,
    token,
    markCartAvailabilityError,
    handlePreparedItemRequestError,
    refreshPreparedItemsPool,
    setCart,
    setPreparedCartMessage,
  ]);

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