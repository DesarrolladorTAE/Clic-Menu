import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_DURATION = 3000;

export function useTransientMessage(duration = DEFAULT_DURATION) {
  const [message, setMessageState] = useState("");
  const messageRef = useRef("");
  const timeoutRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current === null) {
      return;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const clearMessage = useCallback(() => {
    clearTimer();
    messageRef.current = "";
    setMessageState("");
  }, [clearTimer]);

  const setMessage = useCallback((nextValue) => {
    clearTimer();

    const resolvedValue =
      typeof nextValue === "function"
        ? nextValue(messageRef.current)
        : nextValue;

    const normalizedMessage = String(resolvedValue || "");

    messageRef.current = normalizedMessage;
    setMessageState(normalizedMessage);

    if (!normalizedMessage) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      messageRef.current = "";
      setMessageState("");
    }, duration);
  }, [clearTimer, duration]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return [
    message,
    setMessage,
    clearMessage,
  ];
}