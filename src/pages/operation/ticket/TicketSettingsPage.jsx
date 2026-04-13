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

import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";
import {
  getTicketSettings,
  updateTicketSettings,
} from "../../../services/operation/ticket/ticketSettings.service";

const DEFAULT_FORM = {
  show_logo: true,
  show_qr: false,
  show_iva: true,
  address: "",
  message_1: "",
  message_2: "",
  paper_width: "80mm",
  folio_mode: "sequential",
  folio_prefix: "",
  folio_padding: 3,
};

export default function TicketSettingsPage() {
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const [ticketData, setTicketData] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

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
      paper_width: setting.paper_width || "80mm",
      folio_mode: setting.folio_mode || "sequential",
      folio_prefix: setting.folio_prefix || "",
      folio_padding:
        setting.folio_padding !== null && setting.folio_padding !== undefined
          ? Number(setting.folio_padding)
          : 3,
    });
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
        await loadTicketSettings(nextBranchId);
      } else {
        setTicketData(null);
        setForm(DEFAULT_FORM);
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
        await loadTicketSettings(branchId);
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
