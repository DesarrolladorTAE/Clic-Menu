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

import { getPlans } from "../../services/owner/plan.service";

import {
  getRestaurantSubscriptionStatus,
} from "../../services/restaurant/restaurant.service";

import {
  getPayPalConfig,
} from "../../services/paypal/paypal.service";

import PayPalCheckoutDialog from "../../components/paypal/PayPalCheckoutDialog";

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
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

  const isOperational = status?.is_operational === true;
  const currentPlanSlug = status?.subscription?.plan?.slug || null;
  const currentEndsAt = status?.subscription?.ends_at || null;
  const isDemo = status?.subscription?.is_demo === true;
  const daysRemaining = status?.subscription?.days_remaining ?? null;

  const canChangeNow = useMemo(() => {
    if (!currentPlanSlug) return true;
    return currentPlanSlug === "demo";
  }, [currentPlanSlug]);

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
      await capturePayPalOrder(
        restaurantId,
        orderId
      );

      await load();

      showAlert({
        severity: "success",
        title: "Pago confirmado",
        message: "Tu suscripción fue activada correctamente.",
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

  const handlePayPalModalSuccess = async () => {
    setPaypalDialogOpen(false);
    setConfirmingPayPal(true);

    try {
      await load();

      showAlert({
        severity: "success",
        title: "Pago confirmado",
        message: "Tu suscripción fue activada correctamente.",
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
      SUBSCRIPTION_ALREADY_ACTIVE:
        "Tu restaurante ya cuenta con una suscripción vigente.",
      DEMO_NOT_ALLOWED:
        "El plan demo no puede comprarse.",
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
          currentPlanSlug={currentPlanSlug}
          currentEndsAt={currentEndsAt}
          canChangeNow={canChangeNow}
          isDemo={isDemo}
          daysRemaining={daysRemaining}
        />

        
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
              isCurrent ||
              !canChangeNow;

            return (
              <PlanCard
                key={p.id}
                plan={p}
                isCurrent={isCurrent}
                isDisabled={isDisabled}
                busy={busyPlanId === p.id}
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