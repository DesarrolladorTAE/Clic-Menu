import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import {
  createSalesChannel,
  deleteSalesChannel,
  getSalesChannels,
  updateSalesChannel,
} from "../../services/products/sales_channels/sales_channels.service";

import usePagination from "../../hooks/usePagination";
import usePlanAccess from "../../hooks/plan/usePlanAccess";

import SalesChannelUpsertModal from "../../components/sales_channels/SalesChannelUpsertModal";
import SalesChannelsHeader from "../../components/sales_channels/SalesChannelsHeader";
import SalesChannelsAlerts from "../../components/sales_channels/SalesChannelsAlerts";
import SalesChannelsList from "../../components/sales_channels/SalesChannelsList";

const STATUS_OPTIONS = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
];

const PAGE_SIZE = 5;
const SALON_CODE = "SALON";

const PLAN_CHANNEL_MESSAGE =
  "Tu plan actual solo permite el canal SALÓN. Para crear o activar canales adicionales, cambia al Plan Gestión o Plan Total.";

function normalizeCode(v) {
  return (v || "")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

function isSalonChannel(it) {
  const code = normalizeCode(it?.code);
  return code === SALON_CODE;
}

export default function SalesChannelsPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    loading: planAccessLoading,
    error: planAccessError,
    canUseAdditionalSalesChannels,
  } = usePlanAccess(restaurantId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [modalErr, setModalErr] = useState("");

  const [items, setItems] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    status: "active",
  });

  const title = useMemo(() => "Canales de venta del restaurante", []);

  const {
    page,
    setPage,
    nextPage,
    prevPage,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    paginatedItems,
  } = usePagination({
    items,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await getSalesChannels(restaurantId);
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setItems(list);
      setPage(1);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar los canales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [restaurantId]);

  const openCreate = () => {
    if (!canUseAdditionalSalesChannels) {
      setErr(PLAN_CHANNEL_MESSAGE);
      return;
    }

    setErr("");
    setModalErr("");
    setEditing(null);
    setForm({ code: "", name: "", status: "active" });
    setOpen(true);
  };

  const openEdit = (it) => {
    if (isSalonChannel(it)) {
      setErr('El canal "Salón" es fijo y no puede editarse.');
      return;
    }

    if (!canUseAdditionalSalesChannels) {
      setErr(PLAN_CHANNEL_MESSAGE);
      return;
    }

    setErr("");
    setModalErr("");
    setEditing(it);
    setForm({
      code: it.code ?? "",
      name: it.name ?? "",
      status: it.status ?? "active",
    });
    setOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    setEditing(null);
    setModalErr("");
  };

  const onChange = (key, value) => {
    setModalErr("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async () => {
    setModalErr("");

    if (editing?.id && isSalonChannel(editing)) {
      setModalErr('El canal "Salón" es fijo y no puede modificarse.');
      return;
    }

    if (!editing?.id && !canUseAdditionalSalesChannels) {
      setModalErr(PLAN_CHANNEL_MESSAGE);
      return;
    }

    const payload = {
      code: normalizeCode(form.code),
      name: (form.name || "").trim(),
      status: form.status,
    };

    if (!payload.code) {
      setModalErr("El code es obligatorio. Ej: COMEDOR, DELIVERY, PICKUP");
      return;
    }

    if (!payload.name) {
      setModalErr("El nombre es obligatorio. Ej: Comedor, Delivery");
      return;
    }

    if (!editing?.id && payload.code === SALON_CODE) {
      setModalErr('El code "SALON" está reservado y se crea automáticamente.');
      return;
    }

    setSaving(true);
    try {
      if (editing?.id) {
        await updateSalesChannel(restaurantId, editing.id, payload);
      } else {
        await createSalesChannel(restaurantId, payload);
      }

      setOpen(false);
      setEditing(null);
      setModalErr("");
      await load();
    } catch (e) {
      setModalErr(e?.response?.data?.message || "No se pudo guardar el canal");
    } finally {
      setSaving(false);
    }
  };

  const onToggleStatus = async (it) => {
    if (isSalonChannel(it)) {
      setErr('El canal "Salón" es fijo y no puede desactivarse.');
      return;
    }

    if (!canUseAdditionalSalesChannels) {
      setErr(PLAN_CHANNEL_MESSAGE);
      return;
    }

    setErr("");
    setSaving(true);
    try {
      const next = it.status === "active" ? "inactive" : "active";
      await updateSalesChannel(restaurantId, it.id, { status: next });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo cambiar el estado");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (it) => {
    if (isSalonChannel(it)) {
      setErr('El canal "Salón" es fijo y no puede eliminarse.');
      return;
    }

    const ok = window.confirm(`¿Eliminar canal "${it.name}"?`);
    if (!ok) return;

    setErr("");
    setSaving(true);
    try {
      await deleteSalesChannel(restaurantId, it.id);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo eliminar el canal");
    } finally {
      setSaving(false);
    }
  };

  if (loading || planAccessLoading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Cargando canales…
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 8, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <Stack spacing={3}>
          <SalesChannelsHeader
            title={title}
            restaurantId={restaurantId}
            nav={nav}
            saving={saving}
            canUseAdditionalSalesChannels={canUseAdditionalSalesChannels}
            planMessage={PLAN_CHANNEL_MESSAGE}
            onCreate={openCreate}
          />

          <SalesChannelsAlerts
            planAccessError={planAccessError}
            canUseAdditionalSalesChannels={canUseAdditionalSalesChannels}
            err={err}
          />

          <SalesChannelsList
            items={items}
            paginatedItems={paginatedItems}
            isMobile={isMobile}
            saving={saving}
            canUseAdditionalSalesChannels={canUseAdditionalSalesChannels}
            planMessage={PLAN_CHANNEL_MESSAGE}
            page={page}
            totalPages={totalPages}
            startItem={startItem}
            endItem={endItem}
            total={total}
            hasPrev={hasPrev}
            hasNext={hasNext}
            prevPage={prevPage}
            nextPage={nextPage}
            isSalonChannel={isSalonChannel}
            onCreate={openCreate}
            onEdit={openEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        </Stack>
      </Box>

      <SalesChannelUpsertModal
        open={open}
        onClose={closeModal}
        onSubmit={onSubmit}
        onChange={onChange}
        form={form}
        saving={saving}
        editing={editing}
        statusOptions={STATUS_OPTIONS}
        errorMessage={modalErr}
      />
    </Box>
  );
}