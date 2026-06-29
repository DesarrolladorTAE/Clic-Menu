import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import {
  getTaecontaAccount,
  upsertTaecontaAccount,
  deleteTaecontaAccount,
} from "../../../services/connection/tae/taeAccount.service";

import { getTaecontaTaxProfile } from "../../../services/connection/tae/taeTaxProfile.service";

import {
  getTaecontaInvoiceSetting,
  upsertTaecontaInvoiceSetting,
  deleteTaecontaInvoiceSetting,
} from "../../../services/connection/tae/taeInvoiceSetting.service";

import TaecontaHeader from "../../../components/connection/tae/TaecontaHeader";
import TaecontaInstructionsCard from "../../../components/connection/tae/TaecontaInstructionsCard";
import TaecontaTabs from "../../../components/connection/tae/TaecontaTabs";
import TaecontaContextCard from "../../../components/connection/tae/TaecontaContextCard";
import TaeAccountCard from "../../../components/connection/tae/TaeAccountCard";
import TaeTaxProfileCard from "../../../components/connection/tae/TaeTaxProfileCard";
import TaeInvoiceSettingsContextCard from "../../../components/connection/tae/TaeInvoiceSettingsContextCard";
import TaeInvoiceSettingsCard from "../../../components/connection/tae/TaeInvoiceSettingsCard";
import TaeCatalogSatStatusCard from "../../../components/connection/tae/TaeCatalogSatStatusCard";

function buildEmptyPayload(restaurantId, restaurant = null) {
  return {
    restaurant,
    taeconta_account: {
      id: null,
      restaurant_id: Number(restaurantId),
      email: "",
      password: "",
      is_connected: false,
      last_sync_at: null,
      created_at: null,
      updated_at: null,
    },
    taeconta_tax_profile: {
      exists: false,
      id: null,
      rfc: null,
      business_name: null,
      fiscal_zip_code: null,
      tax_regimes_json: null,
      account_status: null,
      available_stamps: null,
      stamped_invoices: null,
      cancelled_invoices: null,
      synced_at: null,
    },
  };
}

function buildEmptyInvoiceSettingPayload(restaurantId, restaurant = null, account = null) {
  return {
    restaurant,
    taeconta_account: {
      exists: !!account?.id,
      id: account?.id || null,
      email: account?.email || null,
      is_connected: !!account?.is_connected,
      last_sync_at: account?.last_sync_at || null,
    },
    taeconta_invoice_setting: {
      id: null,
      restaurant_id: Number(restaurantId),
      taeconta_account_id: null,
      enabled: false,
      invoice_mode: "global",
      serie: "",
      global_sat_product_service: null,
      global_sat_unit: null,
      global_description: null,
      created_at: null,
      updated_at: null,
    },
    catalog_sat_status: null,
    ui: {
      can_enable: !!account?.is_connected,
      invoice_mode_options: [
        {
          value: "global",
          label: "Facturación global",
        },
        {
          value: "per_product",
          label: "Facturación por producto",
        },
        {
          value: "both",
          label: "Ambos modos",
        },
      ],
    },
  };
}

export default function TaecontaAccountPage() {
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account");

  const [accountPayload, setAccountPayload] = useState(null);
  const [taxProfilePayload, setTaxProfilePayload] = useState(null);
  const [invoiceSettingPayload, setInvoiceSettingPayload] = useState(null);

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

  const restaurant = useMemo(() => {
    return (
      accountPayload?.restaurant ||
      taxProfilePayload?.restaurant ||
      invoiceSettingPayload?.restaurant ||
      null
    );
  }, [accountPayload, taxProfilePayload, invoiceSettingPayload]);

  const account = useMemo(() => {
    return accountPayload?.taeconta_account || null;
  }, [accountPayload]);

  const profile = useMemo(() => {
    return (
      taxProfilePayload?.taeconta_tax_profile ||
      accountPayload?.taeconta_tax_profile ||
      null
    );
  }, [accountPayload, taxProfilePayload]);

  const isConnected = !!account?.is_connected;
  const hasAccount = !!account?.id;

  const contextData = useMemo(() => {
    return {
      hasAccount,
      isConnected,
      email: account?.email || "",
      updatedAt: account?.updated_at || null,
    };
  }, [account, hasAccount, isConnected]);

  const fetchTaxProfile = async ({ silent = true } = {}) => {
    try {
      const payload = await getTaecontaTaxProfile(restaurantId);
      setTaxProfilePayload(payload || null);
      return payload;
    } catch (e) {
      setTaxProfilePayload(null);

      if (!silent) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            e?.message ||
            "No se pudieron obtener los datos fiscales de Taeconta.",
        });
      }

      return null;
    }
  };

  const fetchInvoiceSetting = async ({ silent = true, accountOverride = null } = {}) => {
    try {
      const payload = await getTaecontaInvoiceSetting(restaurantId);
      setInvoiceSettingPayload(payload || null);
      return payload;
    } catch (e) {
      setInvoiceSettingPayload(
        buildEmptyInvoiceSettingPayload(
          restaurantId,
          restaurant,
          accountOverride || account
        )
      );

      if (!silent) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            e?.message ||
            "No se pudo cargar la configuración de auto-facturación.",
        });
      }

      return null;
    }
  };

  const loadInitialData = async () => {
    setLoading(true);

    try {
      const payload = await getTaecontaAccount(restaurantId);
      setAccountPayload(payload || buildEmptyPayload(restaurantId));

      await fetchInvoiceSetting({
        silent: true,
        accountOverride: payload?.taeconta_account || null,
      });

      if (payload?.taeconta_account?.is_connected) {
        await fetchTaxProfile({ silent: true });
      } else {
        setTaxProfilePayload(null);
      }
    } catch (e) {
      setAccountPayload(buildEmptyPayload(restaurantId));
      setTaxProfilePayload(null);
      setInvoiceSettingPayload(buildEmptyInvoiceSettingPayload(restaurantId));

      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          e?.message ||
          "No se pudo cargar la conexión con Taeconta.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const handleSaveAccount = async (payload) => {
    try {
      const response = await upsertTaecontaAccount(restaurantId, payload);

      const nextPayload =
        response?.data || buildEmptyPayload(restaurantId, restaurant);

      setAccountPayload(nextPayload);

      await fetchInvoiceSetting({
        silent: true,
        accountOverride: nextPayload?.taeconta_account || null,
      });

      if (nextPayload?.taeconta_account?.is_connected) {
        await fetchTaxProfile({ silent: true });
      } else {
        setTaxProfilePayload(null);
      }

      return response;
    } catch (e) {
      const backendPayload = e?.response?.data?.data;

      if (backendPayload) {
        setAccountPayload(backendPayload);
        setTaxProfilePayload(null);

        await fetchInvoiceSetting({
          silent: true,
          accountOverride: backendPayload?.taeconta_account || null,
        });
      }

      throw e;
    }
  };

  const handleDeleteAccount = async () => {
    if (!hasAccount) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "No existe una cuenta de Taeconta configurada para eliminar.",
      });
      return;
    }

    const ok = window.confirm(
      "¿De verdad deseas eliminar la conexión con Taeconta? También se limpiarán los datos fiscales sincronizados y se desactivará el QR de facturación."
    );

    if (!ok) return;

    try {
      const response = await deleteTaecontaAccount(restaurantId);

      setAccountPayload((prev) =>
        buildEmptyPayload(restaurantId, prev?.restaurant || restaurant)
      );
      setTaxProfilePayload(null);
      setInvoiceSettingPayload(
        buildEmptyInvoiceSettingPayload(restaurantId, restaurant)
      );

      showAlert({
        severity: "success",
        title: "Hecho",
        message:
          response?.message || "Cuenta de Taeconta eliminada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          e?.message ||
          "No se pudo eliminar la cuenta de Taeconta.",
      });
    }
  };

  const handleSaveInvoiceSetting = async (payload) => {
    try {
      const response = await upsertTaecontaInvoiceSetting(restaurantId, payload);

      if (response?.data) {
        setInvoiceSettingPayload(response.data);
      }

      return response;
    } catch (e) {
      const backendPayload = e?.response?.data?.data;

      if (backendPayload) {
        setInvoiceSettingPayload(backendPayload);
      }

      throw e;
    }
  };

  const handleDeleteInvoiceSetting = async () => {
    const setting = invoiceSettingPayload?.taeconta_invoice_setting;

    if (!setting?.id) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "No existe configuración de auto-facturación para eliminar.",
      });
      return;
    }

    const ok = window.confirm(
      "¿De verdad deseas eliminar la configuración de auto-facturación? También se desactivará el QR de facturación."
    );

    if (!ok) return;

    try {
      const response = await deleteTaecontaInvoiceSetting(restaurantId);

      await fetchInvoiceSetting({
        silent: true,
        accountOverride: account,
      });

      showAlert({
        severity: "success",
        title: "Hecho",
        message:
          response?.message ||
          "Configuración de auto-facturación eliminada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          e?.message ||
          "No se pudo eliminar la configuración de auto-facturación.",
      });
    }
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
              Cargando conexión con Taeconta…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <TaecontaHeader restaurant={restaurant} isConnected={isConnected} />

        <TaecontaInstructionsCard isConnected={isConnected} />

        <TaecontaTabs value={activeTab} onChange={setActiveTab} />

        {activeTab === "account" ? (
          <>
            <TaecontaContextCard
              restaurant={restaurant}
              account={account}
              contextData={contextData}
            />

            <TaeAccountCard
              restaurant={restaurant}
              account={account}
              onSave={handleSaveAccount}
              onDelete={handleDeleteAccount}
              showToast={showToast}
            />

            <TaeTaxProfileCard profile={profile} />
          </>
        ) : (
          <>
            <TaeInvoiceSettingsContextCard payload={invoiceSettingPayload} />

            <TaeInvoiceSettingsCard
              payload={invoiceSettingPayload}
              onSave={handleSaveInvoiceSetting}
              onDelete={handleDeleteInvoiceSetting}
              showToast={showToast}
            />

            <TaeCatalogSatStatusCard
              catalogSatStatus={invoiceSettingPayload?.catalog_sat_status}
            />
          </>
        )}
      </Stack>

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