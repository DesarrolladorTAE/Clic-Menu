import { useEffect, useRef } from "react";

const DEFAULT_DEBOUNCE_MS = 350;

function normalizeChannelType(value) {
  const type = String(value || "").trim().toLowerCase();
  return type === "public" || type === "private" ? type : "";
}

function normalizeEventName(value) {
  const event = String(value || "").trim();
  if (!event) return "";
  return event.startsWith(".") ? event : `.${event}`;
}

function normalizeDebounceMs(value) {
  const milliseconds = Number(value);
  if (!Number.isFinite(milliseconds)) return DEFAULT_DEBOUNCE_MS;
  return Math.max(0, Math.trunc(milliseconds));
}

/**
 * Escucha las invalidaciones de disponibilidad del menú.
 *
 * El backend debe entregar:
 *
 * data.realtime.channel_type
 * data.realtime.channel
 * data.realtime.event
 *
 * El hook solamente recibe la notificación y la entrega a la página.
 * No contiene reglas de productos, variantes, inventario ni carrito.
 */
export function useMenuAvailabilityRealtime({
  echo,
  data,
  enabled = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  onAvailabilityEvent,
  onError,
} = {}) {
  const realtime =
    data?.realtime && typeof data.realtime === "object"
      ? data.realtime
      : null;

  const channelType = normalizeChannelType(realtime?.channel_type);
  const channelName = String(realtime?.channel || "").trim();
  const eventName = normalizeEventName(realtime?.event);
  const resolvedDebounceMs = normalizeDebounceMs(debounceMs);

  const callbackRef = useRef(onAvailabilityEvent);
  const errorCallbackRef = useRef(onError);
  const timerRef = useRef(null);
  const pendingEventRef = useRef(null);
  const processingRef = useRef(false);

  useEffect(() => {
    callbackRef.current = onAvailabilityEvent;
  }, [onAvailabilityEvent]);

  useEffect(() => {
    errorCallbackRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!enabled || !echo || !channelType || !channelName || !eventName) {
      return undefined;
    }

    let disposed = false;
    let subscription = null;

    const reportError = (error, context = {}) => {
      if (typeof errorCallbackRef.current === "function") {
        errorCallbackRef.current(error, context);
        return;
      }

      console.error("No se pudo procesar la actualización del menú.", error);
    };

    const processPendingEvent = async () => {
      timerRef.current = null;

      if (disposed) return;

      /*
       * Si la página todavía está recargando el catálogo, se conserva
       * solamente el evento más reciente y se intenta nuevamente.
       */
      if (processingRef.current) {
        timerRef.current = window.setTimeout(
          processPendingEvent,
          resolvedDebounceMs,
        );
        return;
      }

      const pendingEvent = pendingEventRef.current;
      pendingEventRef.current = null;

      if (!pendingEvent) return;

      processingRef.current = true;

      try {
        await callbackRef.current?.(pendingEvent, {
          channel_type: channelType,
          channel: channelName,
          event: eventName,
        });
      } catch (error) {
        reportError(error, {
          phase: "event_callback",
          payload: pendingEvent,
          channel_type: channelType,
          channel: channelName,
          event: eventName,
        });
      } finally {
        processingRef.current = false;

        /*
         * Mientras se procesaba el evento pudo llegar otra invalidación.
         * Solo se conserva una pendiente: la más reciente.
         */
        if (!disposed && pendingEventRef.current) {
          if (timerRef.current) window.clearTimeout(timerRef.current);

          timerRef.current = window.setTimeout(
            processPendingEvent,
            resolvedDebounceMs,
          );
        }
      }
    };

    const queueEvent = (payload) => {
      if (disposed) return;

      /*
       * Cola de un solo evento pendiente.
       * Cada evento nuevo reemplaza al anterior todavía no procesado.
       */
      pendingEventRef.current = payload;

      if (timerRef.current) window.clearTimeout(timerRef.current);

      timerRef.current = window.setTimeout(
        processPendingEvent,
        resolvedDebounceMs,
      );
    };

    try {
      subscription =
        channelType === "private"
          ? echo.private(channelName)
          : echo.channel(channelName);

      subscription.listen(eventName, queueEvent);
    } catch (error) {
      reportError(error, {
        phase: "subscription",
        channel_type: channelType,
        channel: channelName,
        event: eventName,
      });
    }

    return () => {
      disposed = true;
      pendingEventRef.current = null;

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      try {
        subscription?.stopListening?.(eventName, queueEvent);
      } catch (error) {
        reportError(error, {
          phase: "stop_listening",
          channel_type: channelType,
          channel: channelName,
          event: eventName,
        });
      }

      try {
        if (typeof echo.leave === "function") {
          echo.leave(channelName);
        } else {
          echo.leaveChannel?.(channelName);
        }
      } catch (error) {
        reportError(error, {
          phase: "leave_channel",
          channel_type: channelType,
          channel: channelName,
          event: eventName,
        });
      }
    };
  }, [
    echo,
    enabled,
    channelType,
    channelName,
    eventName,
    resolvedDebounceMs,
  ]);

  return {
    isConfigured: Boolean(
      enabled && echo && channelType && channelName && eventName,
    ),
    channelType,
    channelName,
    eventName,
  };
}

export default useMenuAvailabilityRealtime;