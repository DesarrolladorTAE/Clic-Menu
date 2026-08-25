import { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import NetpayInstructionsCard from "../../../components/connection/netpay/NetpayInstructionsCard";
import NetpayTerminalsCard from "../../../components/connection/netpay/NetpayTerminalsCard";

import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";
import {
  getRestaurantNetpayTerminals,
  updateRestaurantNetpayTerminal,
} from "../../../services/connection/netpay/netpayTerminal.service";

function normalizeRows(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.terminals)) return response.terminals;
  if (Array.isArray(response)) return response;
  return [];
}

function normalizeTerminal(response) {
  const terminal = response?.data || response?.terminal || response;

  if (!terminal || typeof terminal !== "object" || Array.isArray(terminal)) {
    return null;
  }

  return terminal;
}

function getTerminalId(terminal) {
  return Number(terminal?.netpay_terminal_id ?? terminal?.id ?? 0);
}

function sortTerminals(rows) {
  return [...rows].sort((a, b) => {
    const activeDiff = Number(!!b?.is_active) - Number(!!a?.is_active);
    if (activeDiff !== 0) return activeDiff;

    const aName = String(a?.name || a?.branch?.name || "");
    const bName = String(b?.name || b?.branch?.name || "");

    return aName.localeCompare(bName, "es", { sensitivity: "base" });
  });
}

export default function NetpayConnectionPage() {
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [terminals, setTerminals] = useState([]);
  const [branches, setBranches] = useState([]);
  const [savingTerminalId, setSavingTerminalId] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const pollRef = useRef(null);

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const showToast = (message, type = "info") => {
    showAlert({
      severity:
        type === "success"
          ? "success"
          : type === "warning"
            ? "warning"
            : type === "info"
              ? "info"
              : "error",
      title:
        type === "success"
          ? "Hecho"
          : type === "warning"
            ? "Nota"
            : type === "info"
              ? "Aviso"
              : "Error",
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const extractErrorMessage = (error, fallback) => {
    const errors = error?.response?.data?.errors;
    const firstError =
      errors && typeof errors === "object"
        ? Object.values(errors)?.flat()?.[0]
        : null;

    return (
      firstError ||
      error?.response?.data?.message ||
      error?.message ||
      fallback
    );
  };

  const loadInitialData = async () => {
    if (!restaurantId) return;

    setLoading(true);

    try {
      const [terminalResponse, branchResponse] = await Promise.all([
        getRestaurantNetpayTerminals(restaurantId),
        getBranchesByRestaurant(restaurantId),
      ]);

      setTerminals(sortTerminals(normalizeRows(terminalResponse)));
      setBranches(normalizeRows(branchResponse));
    } catch (error) {
      setTerminals([]);
      setBranches([]);

      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          error,
          "No se pudo cargar la información de las terminales NetPay."
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const synchronizeTerminals = async () => {
    if (!restaurantId) return;

    try {
      const response = await getRestaurantNetpayTerminals(restaurantId);
      setTerminals(sortTerminals(normalizeRows(response)));
    } catch {
      // La consulta automática es silenciosa para no interrumpir al usuario.
    }
  };

  useEffect(() => {
    loadInitialData();

    pollRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        synchronizeTerminals();
      }
    }, 15000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const handleUpdateTerminal = async (terminal, payload) => {
    const terminalId = getTerminalId(terminal);

    if (!terminalId) {
      showToast("No se pudo identificar la terminal seleccionada.", "warning");
      return null;
    }

    setSavingTerminalId(terminalId);

    try {
      const response = await updateRestaurantNetpayTerminal(
        restaurantId,
        terminalId,
        payload
      );

      const saved = normalizeTerminal(response);
      const selectedBranch = branches.find(
        (branch) => Number(branch.id) === Number(payload?.branch_id)
      );

      const updated = saved || {
        ...terminal,
        ...payload,
        branch_id:
          payload?.branch_id !== undefined
            ? Number(payload.branch_id)
            : terminal?.branch_id,
        branch:
          payload?.branch_id !== undefined
            ? selectedBranch || terminal?.branch
            : terminal?.branch,
      };

      setTerminals((prev) =>
        sortTerminals(
          prev.map((row) =>
            getTerminalId(row) === terminalId ? updated : row
          )
        )
      );

      showToast(
        response?.message || "Terminal NetPay actualizada correctamente.",
        "success"
      );

      return updated;
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message: extractErrorMessage(
          error,
          "No se pudo actualizar la terminal NetPay."
        ),
      });

      return null;
    } finally {
      setSavingTerminalId(null);
    }
  };

  const handleToggleStatus = async (terminal) => {
    if (!terminal) return;

    await handleUpdateTerminal(terminal, {
      is_active: !terminal.is_active,
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "60vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />

            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando terminales NetPay…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 30, md: 42 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.1,
            }}
          >
            Conexión con NetPay
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: { xs: 14, md: 17 },
              lineHeight: 1.5,
            }}
          >
            Administra las terminales PAX NetPay registradas para este restaurante.
          </Typography>
        </Box>

        <NetpayInstructionsCard />

        <NetpayTerminalsCard
          terminals={terminals}
          branches={branches}
          savingTerminalId={savingTerminalId}
          onUpdate={handleUpdateTerminal}
          onToggleStatus={handleToggleStatus}
        />
      </Stack>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}