import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box, Chip, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";

import PaymentMethodsCard from "./PaymentMethodsCard";
import TransferSettingsCard from "./TransferSettingsCard";

import {
  getOnlineOrderPaymentSettings,
  getOnlineOrderTransferSetting,
  saveOnlineOrderPaymentSetting,
  updateOnlineOrderTransferSetting,
} from "../../../../services/operation/online-orders/onlineOrderPayments.service";

const TYPES = ["cash", "transfer", "terminal"];

const DEFAULT_PAYMENTS = {
  cash: {
    payment_type: "cash",
    is_enabled: false,
    instructions: "",
  },
  transfer: {
    payment_type: "transfer",
    is_enabled: false,
    instructions: "",
  },
  terminal: {
    payment_type: "terminal",
    is_enabled: false,
    instructions: "",
  },
};

const EMPTY_TRANSFER = {
  bank_name: "",
  beneficiary_name: "",
  account_number: "",
  clabe: "",
  instructions: "",
};

function normalizePayment(row, type) {
  return {
    ...DEFAULT_PAYMENTS[type],
    ...(row || {}),
    payment_type: type,
    is_enabled: !!row?.is_enabled,
    instructions: row?.instructions || "",
  };
}

function buildPaymentMap(rows = []) {
  return TYPES.reduce((result, type) => {
    const row = rows.find((item) => item?.payment_type === type);
    result[type] = normalizePayment(row, type);
    return result;
  }, {});
}

function normalizeTransfer(row) {
  return {
    ...(row || {}),
    bank_name: row?.bank_name || "",
    beneficiary_name: row?.beneficiary_name || "",
    account_number: row?.account_number || "",
    clabe: row?.clabe || "",
    instructions: row?.instructions || "",
  };
}

function comparablePayment(row) {
  return {
    payment_type: row?.payment_type || "",
    is_enabled: !!row?.is_enabled,
    instructions: row?.instructions || "",
  };
}

function comparableTransfer(row) {
  return {
    bank_name: row?.bank_name || "",
    beneficiary_name: row?.beneficiary_name || "",
    account_number: row?.account_number || "",
    clabe: row?.clabe || "",
    instructions: row?.instructions || "",
  };
}

function hasTransferData(row) {
  return Object.values(comparableTransfer(row)).some(
    (value) => String(value || "").trim() !== ""
  );
}

function getFirstError(error, fallback) {
  const errors = error?.response?.data?.errors || {};
  const firstError = Object.values(errors).flat()?.[0];

  return (
    firstError ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default function OnlineOrderPaymentsTab({
  restaurantId,
  branchId,
  branchName,
  onAlert,
}) {
  const [loading, setLoading] = useState(true);
  const [savingPayments, setSavingPayments] = useState(false);
  const [savingTransfer, setSavingTransfer] = useState(false);

  const [savedPayments, setSavedPayments] = useState(() => buildPaymentMap());
  const [payments, setPayments] = useState(() => buildPaymentMap());

  const [savedTransfer, setSavedTransfer] = useState(() => normalizeTransfer(null));
  const [transfer, setTransfer] = useState(() => normalizeTransfer(null));

  const loadConfiguration = useCallback(async () => {
    if (!restaurantId || !branchId) return;

    setLoading(true);

    try {
      const [paymentRows, transferRow] = await Promise.all([
        getOnlineOrderPaymentSettings(restaurantId, branchId),
        getOnlineOrderTransferSetting(restaurantId, branchId),
      ]);

      const paymentMap = buildPaymentMap(paymentRows);
      const transferSetting = normalizeTransfer(transferRow);

      setSavedPayments(paymentMap);
      setPayments(paymentMap);
      setSavedTransfer(transferSetting);
      setTransfer(transferSetting);
    } catch (error) {
      setSavedPayments(buildPaymentMap());
      setPayments(buildPaymentMap());
      setSavedTransfer(normalizeTransfer(null));
      setTransfer(normalizeTransfer(null));

      onAlert?.({
        severity: "error",
        title: "Error",
        message: getFirstError(
          error,
          "No se pudo cargar la configuración de pagos."
        ),
      });
    } finally {
      setLoading(false);
    }
  }, [restaurantId, branchId, onAlert]);

  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  const hasPaymentChanges = useMemo(() => {
    return TYPES.some(
      (type) =>
        JSON.stringify(comparablePayment(payments[type])) !==
        JSON.stringify(comparablePayment(savedPayments[type]))
    );
  }, [payments, savedPayments]);

  const hasTransferChanges = useMemo(() => {
    return (
      JSON.stringify(comparableTransfer(transfer)) !==
      JSON.stringify(comparableTransfer(savedTransfer))
    );
  }, [transfer, savedTransfer]);

  const enabledCount = useMemo(
    () => TYPES.filter((type) => payments[type]?.is_enabled).length,
    [payments]
  );

  const transferEnabled = !!payments.transfer?.is_enabled;
  const terminalEnabled = !!payments.terminal?.is_enabled;
  const transferDataConfigured = hasTransferData(transfer);

  const contextItems = [
    {
      title: "Sucursal",
      value: branchName || "No seleccionada",
      chipLabel: branchId ? "Seleccionada" : "Pendiente",
      chipColor: branchId ? "primary" : "default",
      icon: <StorefrontRoundedIcon fontSize="small" />,
    },
    {
      title: "Métodos de pago",
      value: `${enabledCount} de 3 habilitados`,
      chipLabel: enabledCount > 0 ? "Configurados" : "Pendiente",
      chipColor: enabledCount > 0 ? "primary" : "default",
      icon: <PaymentsRoundedIcon fontSize="small" />,
    },
    {
      title: "Transferencia",
      value: transferEnabled ? "Disponible para el cliente" : "No disponible",
      chipLabel: transferEnabled ? "Habilitada" : "Inactiva",
      chipColor: transferEnabled ? "success" : "default",
      icon: <AccountBalanceRoundedIcon fontSize="small" />,
    },
    {
      title: "Terminal física",
      value: terminalEnabled ? "Disponible para el cliente" : "No disponible",
      chipLabel: terminalEnabled ? "Habilitada" : "Inactiva",
      chipColor: terminalEnabled ? "primary" : "default",
      icon: <PointOfSaleRoundedIcon fontSize="small" />,
    },
  ];

  const handlePaymentChange = (type, field, value) => {
    setPayments((current) => ({
      ...current,
      [type]: {
        ...current[type],
        [field]: value,
      },
    }));
  };

  const handleTransferChange = (field, value) => {
    setTransfer((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const savePayments = async () => {
    if (!restaurantId || !branchId || !hasPaymentChanges) return;

    const changedTypes = TYPES.filter(
      (type) =>
        JSON.stringify(comparablePayment(payments[type])) !==
        JSON.stringify(comparablePayment(savedPayments[type]))
    );

    const orderedTypes = [...changedTypes].sort((a, b) => {
      const aEnabled = payments[a]?.is_enabled ? 1 : 0;
      const bEnabled = payments[b]?.is_enabled ? 1 : 0;
      return bEnabled - aEnabled;
    });

    setSavingPayments(true);

    try {
      const nextSaved = { ...savedPayments };
      const nextPayments = { ...payments };

      for (const type of orderedTypes) {
        const row = payments[type];

        const response = await saveOnlineOrderPaymentSetting(
          restaurantId,
          branchId,
          {
            payment_type: type,
            is_enabled: !!row.is_enabled,
            instructions: row.instructions.trim() || null,
          }
        );

        const normalized = normalizePayment(response?.data, type);
        nextSaved[type] = normalized;
        nextPayments[type] = normalized;
      }

      setSavedPayments(nextSaved);
      setPayments(nextPayments);

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message: "Los métodos de pago se guardaron correctamente.",
      });
    } catch (error) {
      try {
        const rows = await getOnlineOrderPaymentSettings(restaurantId, branchId);
        const paymentMap = buildPaymentMap(rows);

        setSavedPayments(paymentMap);
        setPayments(paymentMap);
      } catch {
        // Si no puede sincronizar nuevamente, se conserva la vista actual.
      }

      onAlert?.({
        severity: "error",
        title: "Error",
        message: getFirstError(
          error,
          "No se pudieron guardar los métodos de pago."
        ),
      });
    } finally {
      setSavingPayments(false);
    }
  };

  const saveTransfer = async () => {
    if (!restaurantId || !branchId || !hasTransferChanges) return;

    setSavingTransfer(true);

    try {
      const response = await updateOnlineOrderTransferSetting(
        restaurantId,
        branchId,
        {
          bank_name: transfer.bank_name.trim() || null,
          beneficiary_name: transfer.beneficiary_name.trim() || null,
          account_number: transfer.account_number.trim() || null,
          clabe: transfer.clabe.trim() || null,
          instructions: transfer.instructions.trim() || null,
        }
      );

      const normalized = normalizeTransfer(response?.data);

      setSavedTransfer(normalized);
      setTransfer(normalized);

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message:
          response?.message ||
          "Los datos para transferencia se guardaron correctamente.",
      });
    } catch (error) {
      onAlert?.({
        severity: "error",
        title: "Error",
        message: getFirstError(
          error,
          "No se pudieron guardar los datos para transferencia."
        ),
      });
    } finally {
      setSavingTransfer(false);
    }
  };

  const discardPayments = () => {
    setPayments(savedPayments);
  };

  const discardTransfer = () => {
    setTransfer(savedTransfer);
  };

  if (loading) {
    return (
      <Paper
        sx={{
          p: 4,
          borderRadius: 1,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />

          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            Cargando métodos de pago…
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 1,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Stack spacing={2}>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
            Contexto actual
          </Typography>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            useFlexGap
            flexWrap="wrap"
          >
            {contextItems.map((item) => (
              <ContextMiniCard key={item.title} {...item} />
            ))}
          </Stack>

          <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>
            {branchName
              ? `Los métodos de pago que guardes se aplicarán únicamente a ${branchName}.`
              : "Selecciona una sucursal para continuar."}
          </Typography>
        </Stack>
      </Paper>

      <PaymentMethodsCard
        payments={payments}
        saving={savingPayments}
        hasChanges={hasPaymentChanges}
        onChange={handlePaymentChange}
        onSave={savePayments}
        onDiscard={discardPayments}
      />

      {transferEnabled ? (
        <TransferSettingsCard
          form={transfer}
          saving={savingTransfer}
          hasChanges={hasTransferChanges}
          onChange={handleTransferChange}
          onSave={saveTransfer}
          onDiscard={discardTransfer}
        />
      ) : null}

      {!transferEnabled && transferDataConfigured ? (
        <Paper
          sx={{
            p: 1.75,
            borderRadius: 1,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
            Los datos de transferencia guardados se conservarán mientras este método permanezca deshabilitado.
          </Typography>
        </Paper>
      ) : null}
    </Stack>
  );
}

function ContextMiniCard({
  icon,
  title,
  value,
  chipLabel,
  chipColor = "default",
}) {
  return (
    <Box
      sx={{
        flex: "1 1 220px",
        minWidth: { xs: "100%", sm: 220 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
      }}
    >
      <Stack spacing={1} height="100%">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
            {title}
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: 14,
            color: "text.primary",
            lineHeight: 1.45,
            minHeight: 42,
          }}
        >
          {value}
        </Typography>

        <Box sx={{ mt: "auto" }}>
          <Chip
            label={chipLabel}
            size="small"
            color={chipColor}
            variant={chipColor === "default" ? "outlined" : "filled"}
          />
        </Box>
      </Stack>
    </Box>
  );
}
