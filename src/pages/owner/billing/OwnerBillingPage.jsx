import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box, Button, Stack, Tab, Tabs, Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import OwnerBillingPurchasesTab from "../../../components/owner/billing/OwnerBillingPurchasesTab";
import OwnerBillingInvoicesTab from "../../../components/owner/billing/OwnerBillingInvoicesTab";
import OwnerTaxProfileModal from "../../../components/owner/tax/OwnerTaxProfileModal";

export default function OwnerBillingPage() {
  const nav = useNavigate();

  const [tab, setTab] = useState("purchases");
  const [taxProfileOpen, setTaxProfileOpen] = useState(false);
  const [invoicesRefreshKey, setInvoicesRefreshKey] = useState(0);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const showAlert = ({
    severity = "success",
    title = "Hecho",
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

  const onTaxProfileSaved = (res) => {
    showAlert({
      severity: "success",
      title: "Datos fiscales actualizados",
      message: res?.message || "Tus datos fiscales se guardaron correctamente.",
    });
  };

  const onTaxProfileError = (message) => {
    showAlert({
      severity: "error",
      title: "No se pudieron procesar los datos fiscales",
      message: message || "Intenta nuevamente.",
    });
  };

  return (
    <PageContainer
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 48,
                height: 48,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                borderRadius: 1,
                bgcolor: "rgba(255,152,0,0.12)",
                color: "primary.main",
              }}
            >
              <ReceiptLongRoundedIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 30, md: 40 },
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.1,
                }}
              >
                Facturación
              </Typography>

              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: { xs: 14, md: 16 },
                  color: "text.secondary",
                }}
              >
                Administra la facturación de tus planes y complementos de Clic Menu.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => nav("/owner/restaurants-home")}
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: 190,
              height: 44,
              fontWeight: 800,
            }}
          >
            Volver a mis restaurantes
          </Button>
        </Stack>

        <Box
          sx={{
            width: "100%",
            overflowX: "auto",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            textColor="inherit"
            slotProps={{
              indicator: {
                sx: {
                  height: 3,
                  borderRadius: "999px 999px 0 0",
                  bgcolor: "primary.main",
                },
              },
            }}
            sx={{
              minHeight: 56,
              "& .MuiTabs-flexContainer": {
                gap: { xs: 1, sm: 2 },
              },
            }}
          >
            <Tab
              value="purchases"
              label="Compras"
              disableRipple
              sx={tabSx}
            />

            <Tab
              value="invoices"
              label="Mis facturas"
              disableRipple
              sx={tabSx}
            />
          </Tabs>
        </Box>

        {tab === "purchases" ? (
          <OwnerBillingPurchasesTab
            onAlert={showAlert}
            onChanged={() => setInvoicesRefreshKey((prev) => prev + 1)}
            onEditTaxProfile={() => setTaxProfileOpen(true)}
          />
        ) : (
          <OwnerBillingInvoicesTab
            onAlert={showAlert}
            refreshKey={invoicesRefreshKey}
          />
        )}
      </Stack>

      <OwnerTaxProfileModal
        open={taxProfileOpen}
        onClose={() => setTaxProfileOpen(false)}
        onSaved={onTaxProfileSaved}
        onError={onTaxProfileError}
      />

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

const tabSx = {
  minHeight: 56,
  px: { xs: 2, sm: 2.5 },
  py: 1,
  fontSize: { xs: 15, sm: 17 },
  fontWeight: 800,
  textTransform: "none",
  color: "text.secondary",
  transition: "background-color 0.18s ease, color 0.18s ease, transform 0.12s ease",
  "&.Mui-selected": {
    color: "primary.main",
    bgcolor: "transparent",
  },
  "&:hover": {
    bgcolor: "rgba(255,152,0,0.06)",
  },
  "&:active": {
    bgcolor: "rgba(255,152,0,0.14)",
    transform: "scale(0.98)",
  },
};