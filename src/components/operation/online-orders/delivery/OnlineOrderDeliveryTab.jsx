import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box, Chip, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";

import DeliveryMethodsCard from "./DeliveryMethodsCard";
import DeliveryConceptsCard from "./DeliveryConceptsCard";
import ScheduledPointsCard from "./ScheduledPointsCard";

import {
  getOnlineOrderFulfillments,
  saveOnlineOrderFulfillment,
} from "../../../../services/operation/online-orders/onlineOrders.service";

const TYPES = [
  "pickup",
  "home_delivery",
  "internal_location",
  "scheduled_point",
];

const DEFAULTS = {
  pickup: {
    fulfillment_type: "pickup",
    is_enabled: false,
    minimum_order_amount: "",
    allows_asap: false,
    allows_scheduling: false,
    minimum_lead_minutes: "",
  },
  home_delivery: {
    fulfillment_type: "home_delivery",
    is_enabled: false,
    minimum_order_amount: "",
    allows_asap: false,
    allows_scheduling: false,
    minimum_lead_minutes: "",
  },
  internal_location: {
    fulfillment_type: "internal_location",
    is_enabled: false,
    minimum_order_amount: "",
    allows_asap: false,
    allows_scheduling: false,
    minimum_lead_minutes: "",
  },
  scheduled_point: {
    fulfillment_type: "scheduled_point",
    is_enabled: false,
    minimum_order_amount: "",
    allows_asap: false,
    allows_scheduling: true,
    minimum_lead_minutes: "",
  },
};

function normalizeRow(row, type) {
  const base = DEFAULTS[type];

  return {
    ...base,
    ...(row || {}),
    fulfillment_type: type,
    is_enabled: !!row?.is_enabled,
    minimum_order_amount:
      row?.minimum_order_amount === null || row?.minimum_order_amount === undefined
        ? ""
        : String(row.minimum_order_amount),
    allows_asap: type === "scheduled_point" ? false : !!row?.allows_asap,
    allows_scheduling: type === "scheduled_point" ? true : !!row?.allows_scheduling,
    minimum_lead_minutes:
      row?.minimum_lead_minutes === null || row?.minimum_lead_minutes === undefined
        ? ""
        : String(row.minimum_lead_minutes),
  };
}

function buildMap(rows = []) {
  return TYPES.reduce((result, type) => {
    const row = rows.find((item) => item?.fulfillment_type === type);
    result[type] = normalizeRow(row, type);
    return result;
  }, {});
}

function comparableRow(row) {
  return {
    fulfillment_type: row.fulfillment_type,
    is_enabled: !!row.is_enabled,
    minimum_order_amount: String(row.minimum_order_amount ?? ""),
    allows_asap: !!row.allows_asap,
    allows_scheduling: !!row.allows_scheduling,
    minimum_lead_minutes: String(row.minimum_lead_minutes ?? ""),
  };
}

export default function OnlineOrderDeliveryTab({
  restaurantId,
  branchId,
  branchName,
  onAlert,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedItems, setSavedItems] = useState(() => buildMap());
  const [items, setItems] = useState(() => buildMap());

  const loadFulfillments = useCallback(async () => {
    if (!restaurantId || !branchId) return;

    setLoading(true);

    try {
      const rows = await getOnlineOrderFulfillments(restaurantId, branchId);
      const normalized = buildMap(rows);

      setSavedItems(normalized);
      setItems(normalized);
    } catch (error) {
      setSavedItems(buildMap());
      setItems(buildMap());

      onAlert?.({
        severity: "error",
        title: "Error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "No se pudieron cargar las formas de entrega.",
      });
    } finally {
      setLoading(false);
    }
  }, [restaurantId, branchId, onAlert]);

  useEffect(() => {
    loadFulfillments();
  }, [loadFulfillments]);

  const hasChanges = useMemo(() => {
    return TYPES.some((type) => {
      const current = items[type];
      const saved = savedItems[type];

      if (!saved?.id && current?.id) return false;
      if (!saved?.id) {
        return JSON.stringify(comparableRow(current)) !==
          JSON.stringify(comparableRow(DEFAULTS[type]));
      }

      return JSON.stringify(comparableRow(current)) !==
        JSON.stringify(comparableRow(saved));
    });
  }, [items, savedItems]);

  const enabledCount = useMemo(
    () => TYPES.filter((type) => items[type]?.is_enabled).length,
    [items]
  );

  const asapCount = useMemo(
    () =>
      TYPES.filter(
        (type) => items[type]?.is_enabled && items[type]?.allows_asap
      ).length,
    [items]
  );

  const scheduledCount = useMemo(
    () =>
      TYPES.filter(
        (type) => items[type]?.is_enabled && items[type]?.allows_scheduling
      ).length,
    [items]
  );

  const contextItems = [
    {
      title: "Sucursal",
      value: branchName || "No seleccionada",
      chipLabel: branchId ? "Seleccionada" : "Pendiente",
      chipColor: branchId ? "primary" : "default",
      icon: <StorefrontRoundedIcon fontSize="small" />,
    },
    {
      title: "Formas de entrega",
      value: `${enabledCount} de 4 habilitadas`,
      chipLabel: enabledCount > 0 ? "Configuradas" : "Pendiente",
      chipColor: enabledCount > 0 ? "primary" : "default",
      icon: <LocalShippingRoundedIcon fontSize="small" />,
    },
    {
      title: "Entrega inmediata",
      value:
        asapCount > 0
          ? `Disponible en ${asapCount} modalidad${asapCount === 1 ? "" : "es"}`
          : "No disponible",
      chipLabel: asapCount > 0 ? "Disponible" : "Sin configurar",
      chipColor: asapCount > 0 ? "success" : "default",
      icon: <AccessTimeRoundedIcon fontSize="small" />,
    },
    {
      title: "Pedidos programados",
      value:
        scheduledCount > 0
          ? `Disponible en ${scheduledCount} modalidad${scheduledCount === 1 ? "" : "es"}`
          : "No disponible",
      chipLabel: scheduledCount > 0 ? "Disponible" : "Sin configurar",
      chipColor: scheduledCount > 0 ? "primary" : "default",
      icon: <EventAvailableRoundedIcon fontSize="small" />,
    },
  ];

  const handleChange = (type, field, value) => {
    setItems((current) => ({
      ...current,
      [type]: {
        ...current[type],
        [field]: value,
      },
    }));
  };

  const validate = () => {
    for (const type of TYPES) {
      const row = items[type];

      if (
        row.minimum_order_amount !== "" &&
        !/^\d+(\.\d{1,2})?$/.test(String(row.minimum_order_amount))
      ) {
        return "El pedido mínimo debe ser un importe válido con máximo dos decimales.";
      }

      if (
        row.minimum_lead_minutes !== "" &&
        !/^\d+$/.test(String(row.minimum_lead_minutes))
      ) {
        return "Los minutos de anticipación deben ser un número entero.";
      }

      if (row.is_enabled && !row.allows_asap && !row.allows_scheduling) {
        return "Cada forma de entrega habilitada debe permitir entrega inmediata, programación o ambas.";
      }
    }

    return "";
  };

  const save = async () => {
    if (!restaurantId || !branchId) return;

    const validationMessage = validate();

    if (validationMessage) {
      onAlert?.({
        severity: "warning",
        title: "Nota",
        message: validationMessage,
      });
      return;
    }

    const changed = TYPES.filter((type) => {
      const current = items[type];
      const saved = savedItems[type];

      if (!saved?.id) {
        return JSON.stringify(comparableRow(current)) !==
          JSON.stringify(comparableRow(DEFAULTS[type]));
      }

      return JSON.stringify(comparableRow(current)) !==
        JSON.stringify(comparableRow(saved));
    });

    if (changed.length === 0) return;

    const ordered = [...changed].sort((a, b) => {
      const aEnabled = items[a]?.is_enabled ? 1 : 0;
      const bEnabled = items[b]?.is_enabled ? 1 : 0;
      return bEnabled - aEnabled;
    });

    setSaving(true);

    try {
      const nextSaved = { ...savedItems };
      const nextItems = { ...items };

      for (const type of ordered) {
        const row = items[type];

        const response = await saveOnlineOrderFulfillment(
          restaurantId,
          branchId,
          {
            fulfillment_type: type,
            is_enabled: !!row.is_enabled,
            minimum_order_amount:
              row.minimum_order_amount === ""
                ? null
                : Number(row.minimum_order_amount),
            allows_asap: type === "scheduled_point" ? false : !!row.allows_asap,
            allows_scheduling:
              type === "scheduled_point" ? true : !!row.allows_scheduling,
            minimum_lead_minutes:
              row.allows_scheduling && row.minimum_lead_minutes !== ""
                ? Number(row.minimum_lead_minutes)
                : null,
          }
        );

        const normalized = normalizeRow(response?.data, type);
        nextSaved[type] = normalized;
        nextItems[type] = normalized;
      }

      setSavedItems(nextSaved);
      setItems(nextItems);

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message: "Las formas de entrega se guardaron correctamente.",
      });
    } catch (error) {
      const errors = error?.response?.data?.errors || {};
      const firstError = Object.values(errors).flat()?.[0];

      onAlert?.({
        severity: "error",
        title: "Error",
        message:
          firstError ||
          error?.response?.data?.message ||
          error?.message ||
          "No se pudieron guardar las formas de entrega.",
      });
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setItems(savedItems);
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
            Cargando formas de entrega…
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
              ? `Las formas de entrega que guardes se aplicarán únicamente a ${branchName}.`
              : "Selecciona una sucursal para continuar."}
          </Typography>
        </Stack>
      </Paper>

      <DeliveryMethodsCard
        items={items}
        savedItems={savedItems}
        saving={saving}
        hasChanges={hasChanges}
        onChange={handleChange}
        onSave={save}
        onDiscard={discard}
      />

      <DeliveryConceptsCard
        restaurantId={restaurantId}
        branchId={branchId}
        homeDelivery={savedItems.home_delivery}
        internalLocation={savedItems.internal_location}
        onAlert={onAlert}
      />

      <ScheduledPointsCard
        restaurantId={restaurantId}
        branchId={branchId}
        fulfillment={savedItems.scheduled_point}
        onAlert={onAlert}
      />
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
