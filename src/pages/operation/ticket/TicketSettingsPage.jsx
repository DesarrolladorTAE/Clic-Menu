import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import TicketSettingsHeader from "../../../components/operation/ticket/TicketSettingsHeader";
import TicketSettingsInstructionsCard from "../../../components/operation/ticket/TicketSettingsInstructionsCard";
import TicketBranchSelectorCard from "../../../components/operation/ticket/TicketBranchSelectorCard";
import TicketSettingsContextCard from "../../../components/operation/ticket/TicketSettingsContextCard";
import TicketSettingsFormCard from "../../../components/operation/ticket/TicketSettingsFormCard";
import TicketWhatsappMessageSettingsCard from "../../../components/operation/ticket/TicketWhatsappMessageSettingsCard";
import TicketWhasapoSettingsCard from "../../../components/operation/ticket/TicketWhasapoSettingsCard";
import TicketPrintSettingsCard from "../../../components/operation/ticket/TicketPrintSettingsCard";

import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";
import {
  getTicketSettings,
  updateTicketSettings,
} from "../../../services/operation/ticket/ticketSettings.service";

import {
  getBranchWhasapoSetting,
  updateBranchWhasapoSetting,
  deleteBranchWhasapoSetting,
} from "../../../services/operation/ticket/branchWhasapoSetting.service";

import {
  getBranchPrintSetting,
  updateBranchPrintSetting,
  deleteBranchPrintSetting,
} from "../../../services/operation/ticket/branchPrintSetting.service";


const DEFAULT_FORM = {
  show_logo: true,
  show_qr: false,
  show_iva: true,
  address: "",
  message_1: "",
  message_2: "",

  whatsapp_contact_phone: "",
  whatsapp_contact_email: "",

  paper_width: "80mm",
  folio_mode: "sequential",
  folio_prefix: "",
  folio_padding: 3,
};


const DEFAULT_PRINT_FORM = {
  print_app_type_id: "",
  enabled: false,
  auto_send_payload: false,
  cut: true,
  open_drawer: false,
  drawer_pin: 0,
  tcp_host: "",
  tcp_port: "",
};


export default function TicketSettingsPage() {
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const [ticketData, setTicketData] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const [whasapoData, setWhasapoData] = useState(null);
  const [whasapoForm, setWhasapoForm] = useState({
    use_custom_token: false,
    custom_token: "",
  });
  const [savingWhasapo, setSavingWhasapo] = useState(false);


  //Configurar Impresión
  const [printData, setPrintData] = useState(null);
  const [printOptions, setPrintOptions] = useState([]);
  const [printForm, setPrintForm] = useState(DEFAULT_PRINT_FORM);
  const [savingPrint, setSavingPrint] = useState(false);

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

  const selectedBranch = useMemo(() => {
    return branches.find((b) => String(b.id) === String(branchId)) || null;
  }, [branches, branchId]);

  const canSave = useMemo(() => {
    if (!branchId) return false;
    if (!form.paper_width) return false;
    if (!form.folio_mode) return false;

    const padding = Number(form.folio_padding);
    if (Number.isNaN(padding) || padding < 1 || padding > 20) return false;

    if (form.folio_mode === "pattern" && !String(form.folio_prefix || "").trim()) {
      return false;
    }

    return true;
  }, [branchId, form]);

  const hydrateFormFromResponse = (responseData) => {
    const setting = responseData?.ticket_setting || {};

    setForm({
      show_logo: Boolean(setting.show_logo),
      show_qr: Boolean(setting.show_qr),
      show_iva: Boolean(setting.show_iva),

      address: setting.address || "",
      message_1: setting.message_1 || "",
      message_2: setting.message_2 || "",

      whatsapp_contact_phone:
        setting.whatsapp_contact_phone || "",

      whatsapp_contact_email:
        setting.whatsapp_contact_email || "",

      paper_width: setting.paper_width || "80mm",
      folio_mode: setting.folio_mode || "sequential",
      folio_prefix: setting.folio_prefix || "",
      folio_padding:
        setting.folio_padding !== null && setting.folio_padding !== undefined
          ? Number(setting.folio_padding)
          : 3,
    });
  };


  const hydrateWhasapoFormFromResponse = (responseData) => {
    const setting = responseData?.whasapo_setting || {};

    setWhasapoForm({
      use_custom_token: Boolean(setting.use_custom_token),
      custom_token: setting.custom_token || "",
    });
  };


  const hydratePrintFormFromResponse = (responseData) => {
    const setting = responseData?.print_setting || {};

    setPrintOptions(Array.isArray(responseData?.options) ? responseData.options : []);

    setPrintForm({
      print_app_type_id: setting.print_app_type_id || "",
      enabled: Boolean(setting.enabled),
      auto_send_payload: Boolean(setting.auto_send_payload),
      cut: setting.cut !== undefined && setting.cut !== null ? Boolean(setting.cut) : true,
      open_drawer: Boolean(setting.open_drawer),
      drawer_pin:
        setting.drawer_pin !== undefined && setting.drawer_pin !== null
          ? Number(setting.drawer_pin)
          : 0,
      tcp_host: setting.tcp_host || "",
      tcp_port:
        setting.tcp_port !== undefined && setting.tcp_port !== null
          ? Number(setting.tcp_port)
          : "",
    });
  };

  const loadBranchWhasapoSetting = async (targetBranchId) => {
    if (!targetBranchId) {
      setWhasapoData(null);
      setWhasapoForm({
        use_custom_token: false,
        custom_token: "",
      });
      return;
    }

    const data = await getBranchWhasapoSetting(restaurantId, targetBranchId);
    setWhasapoData(data);
    hydrateWhasapoFormFromResponse(data);
  };


  const loadBranchPrintSetting = async (targetBranchId) => {
    if (!targetBranchId) {
      setPrintData(null);
      setPrintOptions([]);
      setPrintForm(DEFAULT_PRINT_FORM);
      return;
    }

    const data = await getBranchPrintSetting(restaurantId, targetBranchId);
    setPrintData(data);
    hydratePrintFormFromResponse(data);
  };

  const loadTicketSettings = async (targetBranchId) => {
    if (!targetBranchId) {
      setTicketData(null);
      setForm(DEFAULT_FORM);
      return;
    }

    const data = await getTicketSettings(restaurantId, targetBranchId);
    setTicketData(data);
    hydrateFormFromResponse(data);
  };

  const loadAll = async () => {
    setLoading(true);

    try {
      let loadedBranches = await getBranchesByRestaurant(restaurantId);
      loadedBranches = Array.isArray(loadedBranches) ? loadedBranches : [];
      setBranches(loadedBranches);

      const nextBranchId = loadedBranches?.[0]?.id
        ? String(loadedBranches[0].id)
        : "";

      setBranchId(nextBranchId);

      if (nextBranchId) {
        await Promise.all([
          loadTicketSettings(nextBranchId),
          loadBranchWhasapoSetting(nextBranchId),
          loadBranchPrintSetting(nextBranchId),
        ]);
      } else {
        setTicketData(null);
        setForm(DEFAULT_FORM);

        setWhasapoData(null);
        setWhasapoForm({
          use_custom_token: false,
          custom_token: "",
        });

        setPrintData(null);
        setPrintOptions([]);
        setPrintForm(DEFAULT_PRINT_FORM);
      }
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar la configuración de tickets.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    if (!branchId) return;

    (async () => {
      try {
        await Promise.all([
          loadTicketSettings(branchId),
          loadBranchWhasapoSetting(branchId),
          loadBranchPrintSetting(branchId),
        ]);
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudo cargar la configuración de la sucursal seleccionada.",
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const handleChangeField = (field, value) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [field]:
          field === "folio_padding"
            ? value === ""
              ? ""
              : Number(value)
            : value,
      };

      if (field === "folio_mode" && value === "sequential") {
        next.folio_prefix = "";
      }

      return next;
    });
  };

  const handleChangeWhasapoField = (field, value) => {
    setWhasapoForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangePrintField = (field, value) => {
    setPrintForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      const selectedOption = printOptions.find(
        (option) => String(option.id) === String(
          field === "print_app_type_id" ? value : next.print_app_type_id
        )
      );

      const isTcpMode = String(selectedOption?.code || "").includes("tcp");

      if (field === "print_app_type_id" && !isTcpMode) {
        next.tcp_host = "";
        next.tcp_port = "";
      }

      if (field === "open_drawer" && !value) {
        next.drawer_pin = 0;
      }

      return next;
    });
  };

  const handleSaveWhasapo = async () => {
    if (!branchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal antes de guardar Whasapo.",
      });
      return;
    }

    const payload = {
      use_custom_token: Boolean(whasapoForm.use_custom_token),
      custom_token: whasapoForm.use_custom_token
        ? whasapoForm.custom_token?.trim() || null
        : null,
    };

    setSavingWhasapo(true);

    try {
      const updated = await updateBranchWhasapoSetting(
        restaurantId,
        branchId,
        payload
      );

      setWhasapoData(updated);
      hydrateWhasapoFormFromResponse(updated);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Configuración de Whasapo guardada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo guardar la configuración de Whasapo.",
      });
    } finally {
      setSavingWhasapo(false);
    }
  };

  const handleResetWhasapo = async () => {
    if (!branchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal antes de restablecer Whasapo.",
      });
      return;
    }

    setSavingWhasapo(true);

    try {
      const updated = await deleteBranchWhasapoSetting(restaurantId, branchId);

      setWhasapoData(updated);
      hydrateWhasapoFormFromResponse(updated);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Configuración de Whasapo restablecida correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo restablecer la configuración de Whasapo.",
      });
    } finally {
      setSavingWhasapo(false);
    }
  };

  const handleSavePrint = async () => {
    if (!branchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal antes de guardar impresión.",
      });
      return;
    }

    const selectedOption = printOptions.find(
      (option) => String(option.id) === String(printForm.print_app_type_id)
    );

    const isTcpMode = String(selectedOption?.code || "").includes("tcp");

    const payload = {
      print_app_type_id: Number(printForm.print_app_type_id),
      enabled: Boolean(printForm.enabled),
      auto_send_payload: Boolean(printForm.auto_send_payload),
      cut: Boolean(printForm.cut),
      open_drawer: Boolean(printForm.open_drawer),
      drawer_pin: Number(printForm.drawer_pin || 0),
      tcp_host: isTcpMode ? printForm.tcp_host?.trim() || null : null,
      tcp_port: isTcpMode && printForm.tcp_port ? Number(printForm.tcp_port) : null,
    };

    setSavingPrint(true);

    try {
      const updated = await updateBranchPrintSetting(
        restaurantId,
        branchId,
        payload
      );

      setPrintData(updated);
      hydratePrintFormFromResponse(updated);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Configuración de impresión guardada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo guardar la configuración de impresión.",
      });
    } finally {
      setSavingPrint(false);
    }
  };

  const handleResetPrint = async () => {
    if (!branchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal antes de restablecer impresión.",
      });
      return;
    }

    setSavingPrint(true);

    try {
      const updated = await deleteBranchPrintSetting(restaurantId, branchId);

      setPrintData(updated);
      hydratePrintFormFromResponse(updated);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Configuración de impresión restablecida correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo restablecer la configuración de impresión.",
      });
    } finally {
      setSavingPrint(false);
    }
  };

  const handleSave = async () => {
    if (!branchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal antes de guardar.",
      });
      return;
    }

    const payload = {
      show_logo: Boolean(form.show_logo),
      show_qr: Boolean(form.show_qr),
      show_iva: Boolean(form.show_iva),

      address: form.address?.trim() || null,
      message_1: form.message_1?.trim() || null,
      message_2: form.message_2?.trim() || null,

      whatsapp_contact_phone:
        form.whatsapp_contact_phone?.trim() || null,

      whatsapp_contact_email:
        form.whatsapp_contact_email?.trim().toLowerCase() || null,

      paper_width: form.paper_width,
      folio_mode: form.folio_mode,
      folio_prefix:
        form.folio_mode === "pattern"
          ? form.folio_prefix?.trim() || null
          : null,
      folio_padding: Number(form.folio_padding),
    };

    setSaving(true);

    try {
      const updated = await updateTicketSettings(restaurantId, branchId, payload);
      setTicketData(updated);
      hydrateFormFromResponse(updated);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Configuración de ticket guardada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo guardar la configuración de ticket.",
      });
    } finally {
      setSaving(false);
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
              Cargando configuración de tickets…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <TicketSettingsHeader
          selectedBranch={selectedBranch}
          saving={saving}
          onSave={handleSave}
          canSave={canSave}
        />

        <TicketSettingsInstructionsCard />

        <TicketBranchSelectorCard
          branches={branches}
          branchId={branchId}
          onChangeBranch={setBranchId}
          selectedBranch={selectedBranch}
        />

        <TicketSettingsContextCard
          selectedBranch={selectedBranch}
          ticketData={ticketData}
        />

        <TicketSettingsFormCard
          form={form}
          onChange={handleChangeField}
          disabled={!selectedBranch || saving}
        />

        <TicketWhatsappMessageSettingsCard
          form={form}
          onChange={handleChangeField}
          disabled={!selectedBranch || saving}
        />

        <TicketWhasapoSettingsCard
          form={whasapoForm}
          data={whasapoData}
          onChange={handleChangeWhasapoField}
          onSave={handleSaveWhasapo}
          onReset={handleResetWhasapo}
          saving={savingWhasapo}
          disabled={!selectedBranch}
        />


        <TicketPrintSettingsCard
          form={printForm}
          data={printData}
          options={printOptions}
          onChange={handleChangePrintField}
          onSave={handleSavePrint}
          onReset={handleResetPrint}
          saving={savingPrint}
          disabled={!selectedBranch}
        />
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
