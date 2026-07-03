import { useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import AppAlert from "../../components/common/AppAlert";

import PlansHeader from "../../components/owner/PlansHeader";
import PlansStateCard from "../../components/owner/PlansStateCard";
import PlansNoticeCard from "../../components/owner/PlansNoticeCard";
import PlansCarouselControls from "../../components/owner/PlansCarouselControls";
import PlanCard from "../../components/owner/PlanCard";

import SubscriptionHistoryShortcut from "../../components/owner/subscription-history/SubscriptionHistoryShortcut";


import { getPlans } from "../../services/owner/plan.service";

import {
  getRestaurantSubscriptionStatus,
} from "../../services/restaurant/restaurant.service";

import {
  getPayPalConfig,
  capturePayPalOrder,
} from "../../services/paypal/paypal.service";

import PayPalCheckoutDialog from "../../components/paypal/PayPalCheckoutDialog";

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function getPayPalSuccessCopy(captureResponse) {
  const activationType = captureResponse?.activation_type;

  if (activationType === "advance_renewal") {
    return {
      title: "Renovación programada",
      message:
        "Tu renovación fue programada correctamente. La nueva vigencia iniciará cuando termine el periodo actual.",
    };
  }

  if (activationType === "new_activation") {
    return {
      title: "Suscripción activada",
      message: "Tu suscripción fue activada correctamente.",
    };
  }

  return {
    title: "Pago confirmado",
    message:
      captureResponse?.message ||
      "Tu pago fue confirmado correctamente.",
  };
}

export default function RestaurantPlans() {
  const nav = useNavigate();
  const { restaurantId } = useParams();
  const location = useLocation();

  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyPlanId, setBusyPlanId] = useState(null);
  const [visibleGroupIndex, setVisibleGroupIndex] = useState(0);
  const [confirmingPayPal, setConfirmingPayPal] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  const [paypalConfig, setPaypalConfig] = useState(null);
  const [paypalDialogOpen, setPaypalDialogOpen] = useState(false);
  const [selectedPaypalPlan, setSelectedPaypalPlan] = useState(null);

  const paypalCaptureStartedRef = useRef(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const showAlert = ({
    severity = "error",
    title = "Error",
    message = "",
  }) => {
    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const notice = location?.state?.notice || "";
  const noticeCode = location?.state?.code || null;
  const noticeMeta = location?.state?.meta || null;

  const accessType = status?.access_type || "none";

  const currentAccess = status?.current_access || status?.subscription || null;
  const currentPaidSubscription = status?.current_paid_subscription || null;
  const nextSubscription = status?.next_subscription || null;

  const isSuspended = status?.code === "RESTAURANT_SUSPENDED";
  const isOperational = status?.is_operational === true;

  const currentPlanSlug = currentAccess?.plan?.slug || null;
  const currentEndsAt = currentAccess?.ends_at || null;

  const isDemo =
    accessType === "demo" ||
    currentAccess?.classification?.is_demo === true ||
    currentAccess?.plan?.is_demo === true;

  const isPaid =
    accessType === "paid" ||
    currentAccess?.classification?.is_paid_commercial === true;

  const isInternal =
    accessType === "internal" ||
    currentAccess?.classification?.is_internal === true;

  const daysRemaining = currentAccess?.days_remaining ?? null;

  const hasNextSubscription =
    status?.has_next_subscription === true || Boolean(nextSubscription);

  const canChangeNow = !isSuspended;

  const billingOptions = [
    {
      key: "monthly",
      label: "Mensual",
      helper: "Pagas 1 mes",
    },
    {
      key: "semester",
      label: "Semestral",
      helper: "Pagas 5 y recibes 6",
    },
    {
      key: "annual",
      label: "Anual",
      helper: "Pagas 10 y recibes 12",
    },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const [plansRes, stRes, paypalCfg] = await Promise.all([
        getPlans(),
        getRestaurantSubscriptionStatus(restaurantId),
        getPayPalConfig(),
      ]);

      const safePlans = Array.isArray(plansRes) ? plansRes : [];
      const selectablePlans = safePlans.filter((plan) => plan?.slug !== "demo");

      setPlans(selectablePlans);
      setStatus(stRes || null);
      setPaypalConfig(paypalCfg || null);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || "No se pudieron cargar los planes",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [restaurantId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const paypalStatus = params.get("paypal");
    const orderId = params.get("token");

    if (paypalStatus === "success" && orderId) {
      if (paypalCaptureStartedRef.current) return;

      paypalCaptureStartedRef.current = true;
      handlePayPalSuccess(orderId);
    }

    if (paypalStatus === "cancel") {
      showAlert({
        severity: "warning",
        title: "Pago cancelado",
        message: "El pago fue cancelado. No se activó ningún plan.",
      });

      nav(location.pathname, {
        replace: true,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (notice) {
      nav(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planGroups = useMemo(() => {
    return chunkArray(plans, 3);
  }, [plans]);

  const visiblePlans = useMemo(() => {
    return planGroups[visibleGroupIndex] || [];
  }, [planGroups, visibleGroupIndex]);

  useEffect(() => {
    if (visibleGroupIndex > Math.max(planGroups.length - 1, 0)) {
      setVisibleGroupIndex(0);
    }
  }, [planGroups, visibleGroupIndex]);


  const handlePayPalSuccess = async (orderId) => {
    setConfirmingPayPal(true);
    setLoading(false);

    try {
      const captureResponse = await capturePayPalOrder(
        restaurantId,
        orderId
      );

      await load();

      const successCopy = getPayPalSuccessCopy(captureResponse);

      showAlert({
        severity: "success",
        title: successCopy.title,
        message: successCopy.message,
      });

      nav("/owner/restaurants-home", {
        replace: true,
      });

    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error PayPal",
        message:
          e?.response?.data?.message ||
          "No fue posible confirmar el pago.",
      });

    } finally {
      setConfirmingPayPal(false);
      setLoading(false);
    }
  };

  const handlePrevGroup = () => {
    setVisibleGroupIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextGroup = () => {
    setVisibleGroupIndex((prev) =>
      Math.min(prev + 1, Math.max(planGroups.length - 1, 0))
    );
  };

  const onSubscribe = async (planId, months) => {
    if (!paypalConfig?.client_id) {
      showAlert({
        severity: "error",
        title: "PayPal no disponible",
        message: "No se pudo cargar la configuración de PayPal.",
      });

      return;
    }

    setBusyPlanId(planId);

    setSelectedPaypalPlan({
      planId,
      months,
    });

    setPaypalDialogOpen(true);
  };

  const handlePayPalDialogClose = () => {
    if (confirmingPayPal) return;

    setPaypalDialogOpen(false);
    setSelectedPaypalPlan(null);
    setBusyPlanId(null);
  };

  const handlePayPalModalSuccess = async (captureResponse) => {
    setPaypalDialogOpen(false);
    setConfirmingPayPal(true);

    try {
      await load();

      const successCopy = getPayPalSuccessCopy(captureResponse);

      showAlert({
        severity: "success",
        title: successCopy.title,
        message: successCopy.message,
      });

      nav("/owner/restaurants-home", {
        replace: true,
      });
    } finally {
      setConfirmingPayPal(false);
      setBusyPlanId(null);
      setSelectedPaypalPlan(null);
    }
  };


  const handlePayPalModalError = (error) => {
    const code = error?.response?.data?.code;

    const fallbackMessages = {
      DEMO_NOT_ALLOWED:
        "El plan demo no puede comprarse.",
      PLAN_NOT_PURCHASABLE:
        "El plan seleccionado no está activo o no puede comprarse.",
      RESTAURANT_SUSPENDED:
        "El restaurante está suspendido.",
    };

    showAlert({
      severity: "error",
      title: "Error PayPal",
      message:
        error?.response?.data?.message ||
        fallbackMessages[code] ||
        "No se pudo completar el pago con PayPal.",
    });

    setBusyPlanId(null);
  };


  if (confirmingPayPal) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "60vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center" textAlign="center">
            <CircularProgress color="primary" />

            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 900,
                color: "text.primary",
              }}
            >
              Confirmando pago con PayPal
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 14,
                maxWidth: 420,
              }}
            >
              Estamos validando tu pago y activando tu suscripción. No cierres esta ventana.
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

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
              Cargando planes…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <PlansHeader
          restaurantId={restaurantId}
          totalPlans={plans.length}
          onBack={() => nav("/owner/restaurants-home")}
        />

        {notice ? (
          <PlansNoticeCard
            title="Atención"
            message={notice}
            variant="warning"
            noticeCode={noticeCode}
            noticeMeta={noticeMeta}
          />
        ) : null}

        <PlansStateCard
          isOperational={isOperational}
          accessType={accessType}
          statusCode={status?.code || null}
          statusMessage={status?.message || ""}
          currentPlanSlug={currentPlanSlug}
          currentEndsAt={currentEndsAt}
          currentAccess={currentAccess}
          currentPaidSubscription={currentPaidSubscription}
          nextSubscription={nextSubscription}
          hasNextSubscription={hasNextSubscription}
          canChangeNow={canChangeNow}
          isDemo={isDemo}
          isPaid={isPaid}
          isInternal={isInternal}
          daysRemaining={daysRemaining}
        />

        <SubscriptionHistoryShortcut
          disabled={busyPlanId !== null || confirmingPayPal}
          onOpen={() => nav(`/owner/restaurants/${restaurantId}/subscriptions`)}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              p: 0.75,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
            }}
          >
            {billingOptions.map((option) => {
              const selected = billingPeriod === option.key;

              return (
                <Box
                  key={option.key}
                  component="button"
                  type="button"
                  onClick={() => setBillingPeriod(option.key)}
                  disabled={busyPlanId !== null || confirmingPayPal}
                  sx={{
                    border: 0,
                    minWidth: {
                      xs: 92,
                      sm: 132,
                    },
                    cursor: busyPlanId !== null || confirmingPayPal ? "not-allowed" : "pointer",
                    px: {
                      xs: 1.5,
                      sm: 2,
                    },
                    py: 1.15,
                    borderRadius: 2,
                    bgcolor: selected ? "primary.main" : "transparent",
                    color: selected ? "#fff" : "text.secondary",
                    fontWeight: 900,
                    fontSize: {
                      xs: 12,
                      sm: 14,
                    },
                    lineHeight: 1,
                    transform: selected ? "translateY(-1px)" : "translateY(0)",
                    boxShadow: selected ? "0 10px 22px rgba(25,118,210,0.28)" : "none",
                    transition:
                      "background-color 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
                    opacity: busyPlanId !== null || confirmingPayPal ? 0.7 : 1,
                    "&:hover": {
                      bgcolor: selected ? "primary.dark" : "action.hover",
                      transform:
                        busyPlanId !== null || confirmingPayPal ? "none" : "translateY(-1px)",
                    },
                  }}
                >
                  <Stack spacing={0.35} alignItems="center">
                    <Box component="span">{option.label}</Box>

                    <Box
                      component="span"
                      sx={{
                        display: {
                          xs: "none",
                          sm: "block",
                        },
                        fontSize: 10,
                        fontWeight: 800,
                        opacity: 0.78,
                      }}
                    >
                      {option.helper}
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
            alignItems: "stretch",
          }}
        >
          {visiblePlans.map((p) => {
            const isCurrent = p.slug === currentPlanSlug;
            const isDisabled =
              busyPlanId !== null ||
              !canChangeNow ||
              p?.is_purchasable === false;

            const actionLabel = isPaid
              ? isCurrent
                ? "Renovar plan"
                : "Cambiar en próxima vigencia"
              : isDemo
              ? "Contratar plan"
              : isInternal
              ? "Contratar plan"
              : "Contratar";


            return (
              <PlanCard
                key={p.id}
                plan={p}
                isCurrent={isCurrent}
                isDisabled={isDisabled}
                busy={busyPlanId === p.id}
                billingPeriod={billingPeriod}
                actionLabel={actionLabel}
                onSubscribe={onSubscribe}
              />
            );
          })}
        </Box>

        {visiblePlans.length === 0 ? (
          <Box
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              No hay planes disponibles
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 14,
                color: "text.secondary",
              }}
            >
              No se encontraron planes para mostrar en este momento.
            </Typography>
          </Box>
        ) : null}

        <PlansCarouselControls
          currentGroup={visibleGroupIndex + 1}
          totalGroups={Math.max(planGroups.length, 1)}
          hasPrev={visibleGroupIndex > 0}
          hasNext={visibleGroupIndex < planGroups.length - 1}
          onPrev={handlePrevGroup}
          onNext={handleNextGroup}
        />
        
      </Stack>

      <PayPalCheckoutDialog
        open={paypalDialogOpen}
        onClose={handlePayPalDialogClose}
        restaurantId={restaurantId}
        planId={selectedPaypalPlan?.planId}
        months={selectedPaypalPlan?.months}
        paypalClientId={paypalConfig?.client_id}
        onSuccess={handlePayPalModalSuccess}
        onError={handlePayPalModalError}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4000}
      />
    </PageContainer>
  );
}