import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CircularProgress, Paper, Stack, Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import StarsRoundedIcon from "@mui/icons-material/StarsRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";

import ActivationReadinessCard from "./ActivationReadinessCard";
import ActivationControlCard from "./ActivationControlCard";

import {
  getOnlineOrderDeliveryConcepts,
  getOnlineOrderFulfillments,
  getOnlineOrderScheduledPoints,
  getOnlineOrderSetting,
  getOnlineOrderTimeBlocks,
} from "../../../../services/operation/online-orders/onlineOrders.service";

import {
  getOnlineOrderPaymentSettings,
} from "../../../../services/operation/online-orders/onlineOrderPayments.service";

import {
  getOnlineOrderBranchSalesChannels,
  getOnlineOrderPlanAccess,
  getOnlineOrderQrCodes,
  updateOnlineOrderActivation,
} from "../../../../services/operation/online-orders/onlineOrderActivation.service";

const FULFILLMENT_LABELS = {
  pickup: "Recoger en sucursal",
  home_delivery: "Envío a domicilio",
  internal_location: "Ubicación interna",
  scheduled_point: "Punto programado",
};

export default function OnlineOrderActivationTab({
  restaurantId,
  branchId,
  branch,
  branchName,
  onGoToTab,
  onAlert,
}) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [setting, setSetting] = useState(null);
  const [planAccess, setPlanAccess] = useState({});
  const [onlineChannel, setOnlineChannel] = useState(null);
  const [fulfillmentState, setFulfillmentState] = useState({
    enabledCount: 0,
    usableCount: 0,
    usableTypes: [],
  });
  const [payments, setPayments] = useState([]);
  const [qrState, setQrState] = useState({
    available: true,
    exists: false,
    count: 0,
    activeCount: 0,
  });

  const load = useCallback(async () => {
    if (!restaurantId || !branchId) return;

    setLoading(true);

    try {
      const qrPromise = getOnlineOrderQrCodes(restaurantId, branchId)
        .then((value) => ({ ok: true, value }))
        .catch(() => ({
          ok: false,
          value: { data: [], ui: null },
        }));

      const [
        settingRow,
        planRow,
        channels,
        fulfillments,
        paymentRows,
        qrResult,
      ] = await Promise.all([
        getOnlineOrderSetting(restaurantId, branchId),
        getOnlineOrderPlanAccess(restaurantId),
        getOnlineOrderBranchSalesChannels(restaurantId, branchId),
        getOnlineOrderFulfillments(restaurantId, branchId),
        getOnlineOrderPaymentSettings(restaurantId, branchId),
        qrPromise,
      ]);

      const fulfillmentResult = await inspectFulfillments(
        restaurantId,
        branchId,
        fulfillments
      );

      const channel = channels.find(
        (item) =>
          String(item?.sales_channel?.code || "")
            .trim()
            .toUpperCase() === "ONLINE_ORDER"
      ) || null;

      const onlineQrs = (qrResult.value?.data || []).filter(
        (qr) =>
          String(qr?.type || "").toLowerCase() === "web" &&
          String(qr?.sales_channel?.code || "")
            .trim()
            .toUpperCase() === "ONLINE_ORDER"
      );

      setSetting(settingRow);
      setPlanAccess(planRow || {});
      setOnlineChannel(channel);
      setFulfillmentState(fulfillmentResult);
      setPayments(paymentRows);
      setQrState({
        available: qrResult.ok,
        exists: onlineQrs.length > 0,
        count: onlineQrs.length,
        activeCount: onlineQrs.filter((qr) => isTrue(qr?.is_active)).length,
      });
    } catch (error) {
      setSetting(null);
      setPlanAccess({});
      setOnlineChannel(null);
      setFulfillmentState({
        enabledCount: 0,
        usableCount: 0,
        usableTypes: [],
      });
      setPayments([]);

      onAlert?.({
        severity: "error",
        title: "Error",
        message: getFirstError(
          error,
          "No se pudo revisar la preparación de Pedidos en línea."
        ),
      });
    } finally {
      setLoading(false);
    }
  }, [restaurantId, branchId, onAlert]);

  useEffect(() => {
    load();
  }, [load]);

  const branchStatus = String(branch?.status || "").trim().toLowerCase();

  const branchReady =
    branchStatus === "" ||
    branchStatus === "active" ||
    branchStatus === "enabled";

  const planReady = isTrue(planAccess?.features?.online_orders);

  const channelReady = isTrue(
    onlineChannel?.branch?.effective_is_active
  );

  const generalReady = !!setting?.kitchen_mode;

  const menuReady = isTrue(
    onlineChannel?.menu_configuration?.is_complete
  );

  const deliveryReady = fulfillmentState.usableCount > 0;

  const enabledPayments = payments.filter(
    (payment) => isTrue(payment?.is_enabled)
  );

  const paymentReady = enabledPayments.length > 0;

  const goToTab = (tab) => {
    if (typeof onGoToTab === "function") onGoToTab(tab);
  };

  const goToPlans = () => {
    navigate(`/owner/restaurants/${restaurantId}/plans`);
  };

  const goToChannels = () => {
    navigate(
      `/owner/restaurants/${restaurantId}/operation/branch-sales-channels`,
      {
        state: {
          branchId,
          branchName,
        },
      }
    );
  };

  const goToMenus = () => {
    navigate(
      `/owner/restaurants/${restaurantId}/operation/menus`,
      {
        state: {
          branchId,
          branchName,
        },
      }
    );
  };

  const goToQr = () => {
    navigate(
      `/owner/restaurants/${restaurantId}/operation/tables/qr-codes`,
      {
        state: {
          branchId,
          branchName,
        },
      }
    );
  };

  const readinessItems = useMemo(() => {
    const usableNames = fulfillmentState.usableTypes
      .map((type) => FULFILLMENT_LABELS[type])
      .filter(Boolean);

    return [
      {
        key: "branch",
        title: "Sucursal",
        ready: branchReady,
        icon: <StorefrontRoundedIcon fontSize="small" />,
        message: branchReady
          ? `${branchName || "La sucursal"} está disponible para operar.`
          : "La sucursal no está disponible actualmente y debe habilitarse antes de continuar.",
      },
      {
        key: "plan",
        title: "Plan",
        ready: planReady,
        icon: <StarsRoundedIcon fontSize="small" />,
        message: planReady
          ? "Tu plan permite utilizar Pedidos en línea."
          : "Tu plan actual no permite utilizar Pedidos en línea.",
        actionLabel: "Ver planes",
        onAction: goToPlans,
      },
      {
        key: "channel",
        title: "Canal de venta",
        ready: channelReady,
        icon: <LinkRoundedIcon fontSize="small" />,
        message: channelReady
          ? "El canal Pedidos en línea está disponible en esta sucursal."
          : onlineChannel?.branch?.blocked_reason ||
            "El canal Pedidos en línea no está disponible correctamente en esta sucursal.",
        actionLabel: "Ver canales",
        onAction: goToChannels,
      },
      {
        key: "menu",
        title: "Menú",
        ready: menuReady,
        icon: <RestaurantMenuRoundedIcon fontSize="small" />,
        message: menuReady
          ? `Menú predeterminado: ${onlineChannel?.default_menu?.name || "Configurado"}.`
          : onlineChannel?.menu_configuration?.message ||
            "Configura un menú predeterminado válido para Pedidos en línea.",
        actionLabel: "Ir a menús",
        onAction: goToMenus,
      },
      {
        key: "general",
        title: "Configuración general",
        ready: generalReady,
        icon: <SettingsRoundedIcon fontSize="small" />,
        message: generalReady
          ? `Preparación: ${kitchenModeLabel(setting?.kitchen_mode)}.`
          : "Define cómo se prepararán los pedidos antes de activar el servicio.",
        actionLabel: "Ir a General",
        onAction: () => goToTab("general"),
      },
      {
        key: "delivery",
        title: "Entrega",
        ready: deliveryReady,
        icon: <LocalShippingRoundedIcon fontSize="small" />,
        message: deliveryReady
          ? usableNames.length > 0
            ? `Disponible mediante: ${usableNames.join(", ")}.`
            : "Existe al menos una forma de entrega disponible."
          : "Habilita y completa al menos una forma de entrega para los clientes.",
        actionLabel: "Ir a Entrega",
        onAction: () => goToTab("delivery"),
      },
      {
        key: "payments",
        title: "Pagos",
        ready: paymentReady,
        icon: <PaymentsRoundedIcon fontSize="small" />,
        message: paymentReady
          ? `${enabledPayments.length} método${enabledPayments.length === 1 ? "" : "s"} de pago habilitado${enabledPayments.length === 1 ? "" : "s"}.`
          : "Habilita al menos un método de pago para los pedidos.",
        actionLabel: "Ir a Pagos",
        onAction: () => goToTab("payments"),
      },
    ];
  }, [
    branchReady,
    branchName,
    planReady,
    channelReady,
    onlineChannel,
    menuReady,
    generalReady,
    setting,
    deliveryReady,
    fulfillmentState,
    paymentReady,
    enabledPayments.length,
  ]);

  const canActivate = readinessItems.every((item) => item.ready);
  const isActive = isTrue(setting?.is_active);

  const changeActivation = async (nextActive) => {
    if (!restaurantId || !branchId || saving) return;
    if (nextActive && !canActivate) return;

    setSaving(true);

    try {
      const response = await updateOnlineOrderActivation(
        restaurantId,
        branchId,
        nextActive
      );

      const savedSetting = response?.data || {
        ...(setting || {}),
        is_active: nextActive,
      };

      setSetting(savedSetting);

      if (!nextActive) {
        setQrState((current) => ({
          ...current,
          activeCount: 0,
        }));
      }

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message:
          response?.message ||
          (nextActive
            ? "Pedidos en línea se activó correctamente."
            : "Pedidos en línea se desactivó correctamente."),
      });
    } catch (error) {
      onAlert?.({
        severity: "error",
        title: "Error",
        message: getFirstError(
          error,
          nextActive
            ? "No se pudo activar Pedidos en línea."
            : "No se pudo desactivar Pedidos en línea."
        ),
      });
    } finally {
      setSaving(false);
    }
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
            Revisando preparación…
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <ActivationControlCard
        branchName={branchName}
        isActive={isActive}
        canActivate={canActivate}
        saving={saving}
        onChange={changeActivation}
      />

      <ActivationReadinessCard
        items={readinessItems}
        qr={qrState}
        onOpenQr={goToQr}
      />
    </Stack>
  );
}

async function inspectFulfillments(restaurantId, branchId, fulfillments = []) {
  const enabled = fulfillments.filter((row) => isTrue(row?.is_enabled));

  if (enabled.length === 0) {
    return {
      enabledCount: 0,
      usableCount: 0,
      usableTypes: [],
    };
  }

  const checks = await Promise.all(
    enabled.map(async (fulfillment) => {
      const type = String(fulfillment?.fulfillment_type || "");

      if (type === "pickup") {
        return {
          type,
          usable: true,
        };
      }

      if (type === "home_delivery" || type === "internal_location") {
        const concepts = await getOnlineOrderDeliveryConcepts(
          restaurantId,
          branchId,
          fulfillment.id
        );

        const usable = concepts.some((concept) => {
          if (!isTrue(concept?.is_active)) return false;

          if (type === "home_delivery") {
            return ["zone_name", "postal_code"].includes(
              String(concept?.type || "")
            );
          }

          return String(concept?.type || "") === "internal_area";
        });

        return {
          type,
          usable,
        };
      }

      if (type === "scheduled_point") {
        const points = await getOnlineOrderScheduledPoints(
          restaurantId,
          branchId,
          fulfillment.id
        );

        const validPoints = points.filter(pointIsUsableByDate);

        const pointChecks = await Promise.all(
          validPoints.map(async (point) => {
            const blocks = await getOnlineOrderTimeBlocks(
              restaurantId,
              branchId,
              fulfillment.id,
              point.id
            );

            return blocks.some(blockIsUsable);
          })
        );

        return {
          type,
          usable: pointChecks.some(Boolean),
        };
      }

      return {
        type,
        usable: false,
      };
    })
  );

  const usableTypes = checks
    .filter((item) => item.usable)
    .map((item) => item.type);

  return {
    enabledCount: enabled.length,
    usableCount: usableTypes.length,
    usableTypes,
  };
}

function pointIsUsableByDate(point) {
  if (!isTrue(point?.is_active)) return false;

  const today = localDateKey();

  const validFrom = point?.valid_from
    ? String(point.valid_from).slice(0, 10)
    : "";

  const validUntil = point?.valid_until
    ? String(point.valid_until).slice(0, 10)
    : "";

  if (validFrom && today < validFrom) return false;
  if (validUntil && today > validUntil) return false;

  return true;
}

function blockIsUsable(block) {
  if (!isTrue(block?.is_active)) return false;

  const day = Number(block?.day_of_week);
  const start = String(block?.start_time || "").slice(0, 5);
  const end = String(block?.end_time || "").slice(0, 5);

  if (day < 1 || day > 7) return false;
  if (!validTime(start) || !validTime(end)) return false;

  return start < end;
}

function validTime(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(value || ""));
}

function localDateKey() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function kitchenModeLabel(value) {
  if (value === "with_kitchen") return "Con cocina";
  if (value === "without_kitchen") return "Sin cocina";
  return "Sin definir";
}

function isTrue(value) {
  return value === true || value === 1 || value === "1";
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