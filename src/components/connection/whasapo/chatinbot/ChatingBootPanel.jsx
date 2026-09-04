import { useEffect, useRef, useState } from "react";
import { Stack } from "@mui/material";

import ChatingBootContextCard from "./ChatingBootContextCard";
import ChatingBootConnectionCard from "./ChatingBootConnectionCard";

import {
  createBranchWhatsappQrConnection,
  deleteBranchWhatsappQrConnection,
  getBranchWhatsappQrConnection,
  getBranchWhatsappQrConnectionStatus,
} from "../../../../services/connection/whatsapp/chatingBootConnection.service";

function connectionSignature(connection, reconnectRequired) {
  return [
    connection?.id || "",
    connection?.status || "",
    connection?.connected ? "1" : "0",
    connection?.phone_number || "",
    reconnectRequired ? "1" : "0",
  ].join("|");
}

function pollMilliseconds(connection) {
  if (!connection) return 0;
  if (connection.connected) return 30000;

  const status = String(connection.status || "").toLowerCase();

  if (status === "qr" || status === "qrcode" || status === "pending") {
    return 5000;
  }

  return 15000;
}

export default function ChatingBootPanel({
  restaurantId,
  branchId,
  selectedBranch,
  addonAvailable = false,
  onNotify,
  onConnectionChange,
}) {
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [connection, setConnection] = useState(null);
  const [reconnectRequired, setReconnectRequired] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const requestRef = useRef(0);
  const lastSignatureRef = useRef("");

  const notify = ({
    severity = "error",
    title = "Error",
    message = "",
  }) => {
    if (typeof onNotify === "function") {
      onNotify({ severity, title, message });
    }
  };

  const applyResponse = (payload, emitChange = true) => {
    const nextConnection = payload?.connection ?? null;
    const nextReconnectRequired = Boolean(payload?.reconnect_required);

    setConnection(nextConnection);
    setReconnectRequired(nextReconnectRequired);

    if (!emitChange || typeof onConnectionChange !== "function") return;

    const signature = connectionSignature(
      nextConnection,
      nextReconnectRequired
    );

    if (signature === lastSignatureRef.current) return;

    lastSignatureRef.current = signature;
    onConnectionChange(payload);
  };

  const loadConnection = async (silent = false) => {
    if (!restaurantId || !branchId) {
      setConnection(null);
      setReconnectRequired(false);
      return;
    }

    const requestId = ++requestRef.current;

    if (!silent) setLoading(true);

    try {
      const result = await getBranchWhatsappQrConnection(
        restaurantId,
        branchId
      );

      if (requestId !== requestRef.current) return;
      applyResponse(result);
    } catch (e) {
      if (requestId !== requestRef.current) return;

      if (!silent) {
        notify({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudo consultar la conexión de WhatsApp QR.",
        });
      }
    } finally {
      if (!silent && requestId === requestRef.current) {
        setLoading(false);
      }
    }
  };

  const refreshStatus = async (silent = true) => {
    if (!restaurantId || !branchId || !connection || !addonAvailable) return;

    try {
      const result = await getBranchWhatsappQrConnectionStatus(
        restaurantId,
        branchId
      );

      applyResponse(result);
    } catch (e) {
      if (!silent) {
        notify({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudo consultar el estado de la conexión.",
        });
      }

      if (e?.response?.status === 403 && typeof onConnectionChange === "function") {
        onConnectionChange(null);
      }
    }
  };

  useEffect(() => {
    requestRef.current += 1;
    lastSignatureRef.current = "";
    setConfirmingDelete(false);
    setConnection(null);
    setReconnectRequired(false);

    if (branchId) loadConnection();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, branchId]);

  useEffect(() => {
    if (!branchId || !connection || !addonAvailable) return undefined;

    const interval = pollMilliseconds(connection);
    if (!interval) return undefined;

    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      refreshStatus(true);
    }, interval);

    return () => window.clearInterval(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    restaurantId,
    branchId,
    addonAvailable,
    connection?.id,
    connection?.status,
    connection?.connected,
  ]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (!connection || !addonAvailable) return;

      refreshStatus(true);
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    restaurantId,
    branchId,
    addonAvailable,
    connection?.id,
  ]);

  const handleCreate = async () => {
    if (!branchId) {
      notify({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal antes de generar la conexión.",
      });
      return;
    }

    if (!addonAvailable) {
      notify({
        severity: "warning",
        title: "Complemento requerido",
        message:
          "Esta sucursal necesita tener vigente el complemento WhatsApp QR.",
      });
      return;
    }

    setWorking(true);
    setConfirmingDelete(false);

    try {
      const result = await createBranchWhatsappQrConnection(
        restaurantId,
        branchId
      );

      applyResponse(result);

      notify({
        severity: "success",
        title: "Hecho",
        message:
          result?.message ||
          "Conexión de WhatsApp QR generada correctamente.",
      });
    } catch (e) {
      notify({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo generar la conexión de WhatsApp QR.",
      });
    } finally {
      setWorking(false);
    }
  };

  const handleDelete = async () => {
    if (!branchId || !connection) return;

    setWorking(true);

    try {
      const result = await deleteBranchWhatsappQrConnection(
        restaurantId,
        branchId
      );

      setConnection(null);
      setReconnectRequired(false);
      setConfirmingDelete(false);

      lastSignatureRef.current = "";

      if (typeof onConnectionChange === "function") {
        onConnectionChange({
          connection: null,
          reconnect_required: false,
        });
      }

      notify({
        severity: "success",
        title: "Hecho",
        message:
          result?.message ||
          "La conexión de WhatsApp fue desvinculada correctamente.",
      });
    } catch (e) {
      notify({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo desvincular la conexión de WhatsApp.",
      });
    } finally {
      setWorking(false);
    }
  };

  return (
    <Stack spacing={3}>
      <ChatingBootContextCard
        selectedBranch={selectedBranch}
        addonAvailable={addonAvailable}
        connection={connection}
        reconnectRequired={reconnectRequired}
      />

      <ChatingBootConnectionCard
        addonAvailable={addonAvailable}
        connection={connection}
        reconnectRequired={reconnectRequired}
        loading={loading}
        working={working}
        confirmingDelete={confirmingDelete}
        onCreate={handleCreate}
        onRequestDelete={() => setConfirmingDelete(true)}
        onCancelDelete={() => setConfirmingDelete(false)}
        onDelete={handleDelete}
      />
    </Stack>
  );
}