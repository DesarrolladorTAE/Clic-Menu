import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";

import { useParams } from "react-router-dom";

import {
  Box, CircularProgress, Paper, Stack, Tab, Tabs, Typography,
} from "@mui/material";

import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import PublicMenuFooter from "../../../components/menu/public/PublicMenuFooter";

import OrderTrackingHeader from "../../../components/public/order-tracking/OrderTrackingHeader";
import TrackingTab from "../../../components/public/order-tracking/tracking/TrackingTab";
import OrderDetailsTab from "../../../components/public/order-tracking/order-details/OrderDetailsTab";

import {
  getPublicOnlineOrderTracking,
  getPublicTrackingErrorMessage,
  isValidPublicTrackingToken,
} from "../../../services/public/order-tracking/publicOrderTracking.service";

const SILENT_REFRESH_MS = 7000;
const DEFAULT_THEME_COLOR = "#FF7A00";

export default function PublicOnlineOrderTrackingPage() {
  const { trackingToken } = useParams();

  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [tab, setTab] = useState(0);

  const requestRunningRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const themeColor = useMemo(() => {
    const color = String(trackingData?.public_menu?.theme_color || "").trim();

    return /^#[0-9A-Fa-f]{6}$/.test(color)
      ? color.toUpperCase()
      : DEFAULT_THEME_COLOR;
  }, [trackingData?.public_menu?.theme_color]);

  const restaurantName =
    trackingData?.restaurant?.trade_name || "Restaurante";

  const showAlert = ({
    severity = "error",
    title = "Aviso",
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

    setAlertState((previous) => ({
      ...previous,
      open: false,
    }));
  };

  const loadTracking = useCallback(
    async ({ silent = false } = {}) => {
      const token = String(trackingToken || "").trim();

      if (!isValidPublicTrackingToken(token)) {
        const message = "El enlace de seguimiento no es válido.";

        if (!silent) {
          setPageError(message);
          setLoading(false);

          showAlert({
            severity: "error",
            title: "Seguimiento no disponible",
            message,
          });
        }

        return;
      }

      if (requestRunningRef.current) return;

      requestRunningRef.current = true;

      if (!silent && !hasLoadedRef.current) setLoading(true);

      try {
        const result = await getPublicOnlineOrderTracking(token);

        if (!result) {
          throw new Error("No se encontró la información del pedido.");
        }

        hasLoadedRef.current = true;
        setPageError("");

        setTrackingData((previous) => {
          if (
            previous &&
            previous.updated_at === result.updated_at &&
            previous.status === result.status &&
            previous.financial_status === result.financial_status
          ) {
            return previous;
          }

          return result;
        });
      } catch (error) {
        const message = getPublicTrackingErrorMessage(error);

        if (!silent || !hasLoadedRef.current) {
          setPageError(message);

          showAlert({
            severity: "error",
            title: "Seguimiento no disponible",
            message,
          });
        }
      } finally {
        requestRunningRef.current = false;
        if (!silent) setLoading(false);
      }
    },
    [trackingToken],
  );

  useEffect(() => {
    hasLoadedRef.current = false;
    requestRunningRef.current = false;

    setTrackingData(null);
    setPageError("");
    setTab(0);

    loadTracking();

    const timer = window.setInterval(() => {
      loadTracking({ silent: true });
    }, SILENT_REFRESH_MS);

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        loadTracking({ silent: true });
      }
    };

    const refreshOnFocus = () => {
      loadTracking({ silent: true });
    };

    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [trackingToken, loadTracking]);

  useEffect(() => {
    if (!trackingData?.public_number) return;

    document.title = `Pedido ${trackingData.public_number} | Clic Menu`;
  }, [trackingData?.public_number]);

  if (loading && !trackingData) {
    return (
      <PageContainer
        sx={{
          minHeight: "100vh",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 4, md: 4 },
        }}
      >
        <Box
          sx={{
            minHeight: "70vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress sx={{ color: DEFAULT_THEME_COLOR }} />

            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
              Consultando tu pedido…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  if (!trackingData) {
    return (
      <PageContainer
        sx={{
          minHeight: "100vh",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 4, md: 4 },
        }}
      >
        <Box
          sx={{
            minHeight: "70vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Paper
            sx={{
              width: "100%",
              maxWidth: 560,
              p: { xs: 3, sm: 4 },
              textAlign: "center",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
            }}
          >
            <Box
              sx={{
                width: 76,
                height: 76,
                mx: "auto",
                mb: 2,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                backgroundColor: "rgba(255,152,0,0.10)",
                color: "primary.main",
              }}
            >
              <SearchOffRoundedIcon sx={{ fontSize: 38 }} />
            </Box>

            <Typography sx={{ fontSize: 22, fontWeight: 900, color: "text.primary" }}>
              No encontramos este seguimiento
            </Typography>

            <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary", lineHeight: 1.6 }}>
              {pageError || "Verifica que el enlace de tu pedido sea correcto."}
            </Typography>
          </Paper>
        </Box>

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

  const publicMenu = trackingData?.public_menu || {};

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        background: `linear-gradient(180deg, ${themeColor}0F 0%, rgba(243,241,241,0) 420px)`,
      }}
    >
      <OrderTrackingHeader
        data={trackingData}
        themeColor={themeColor}
      />

      <Box sx={{ width: "100%", flex: 1 }}>
        <PageContainer
          sx={{
            px: { xs: 0, sm: 3, md: 4 },
            pt: { xs: 0, sm: 2, md: 2 },
            pb: { xs: 0, sm: 0, md: 0 },
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 0 },
              pt: { xs: 1.5, sm: 0 },
            }}
          >
            <Paper
              sx={{
                width: "100%",
                position: "sticky",
                top: 0,
                zIndex: 20,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                backgroundColor: "background.paper",
              }}
            >
              <Tabs
                value={tab}
                onChange={(_, nextValue) => setTab(nextValue)}
                variant="fullWidth"
                aria-label="Información de seguimiento del pedido"
                TabIndicatorProps={{
                  sx: {
                    height: 3,
                    backgroundColor: themeColor,
                  },
                }}
                sx={{
                  minHeight: 50,
                  "& .MuiTab-root": {
                    minHeight: 50,
                    fontSize: { xs: 13, sm: 14 },
                    fontWeight: 800,
                    color: "text.secondary",
                  },
                  "& .Mui-selected": {
                    color: `${themeColor} !important`,
                  },
                }}
              >
                <Tab label="Seguimiento" />
                <Tab label="Datos del pedido" />
              </Tabs>
            </Paper>

            <Box sx={{ mt: 2 }}>
              {tab === 0 ? (
                <TrackingTab
                  data={trackingData}
                  themeColor={themeColor}
                />
              ) : (
                <OrderDetailsTab
                  data={trackingData}
                  themeColor={themeColor}
                  onNotify={showAlert}
                />
              )}
            </Box>

            <Box sx={{ height: { xs: 24, sm: 32 } }} />
          </Box>
        </PageContainer>
      </Box>

      <Box
        sx={{
          width: "100%",
          flexShrink: 0,
          m: 0,
          p: 0,
          lineHeight: 0,
        }}
      >
        <PublicMenuFooter
          publicMenu={publicMenu}
          restaurantName={restaurantName}
        />
      </Box>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </Box>
  );
}