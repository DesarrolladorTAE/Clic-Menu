import { useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import usePagination from "../../../hooks/usePagination";
import { normalizeErr } from "../../../utils/err";

import SystemOwnerHeroCard from "../../../components/system-admin/owners/detail/SystemOwnerHeroCard";
import SystemOwnerRestaurantsPanel from "../../../components/system-admin/owners/detail/SystemOwnerRestaurantsPanel";
import SystemOwnerRestaurantUpsertModal from "../../../components/system-admin/owners/detail/SystemOwnerRestaurantUpsertModal";

import {
  createSystemOwnerRestaurant,
  deleteSystemOwnerRestaurant,
  getSystemOwnerRestaurants,
  updateSystemOwnerRestaurant,
} from "../../../services/system-admin/systemOwnerRestaurants.service";

const PAGE_SIZE = 5;

export default function SystemOwnerDetailPage() {
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const reqRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [owner, setOwner] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    perPage: PAGE_SIZE,
    total: 0,
  });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const pagination = usePagination({
    items: restaurants,
    pageSize: PAGE_SIZE,
    mode: "backend",
    serverMeta: meta,
  });

  const filteredLabel = useMemo(() => {
    if (status === "active") return "Activos";
    if (status === "inactive") return "Inactivos";
    if (status === "suspended") return "Suspendidos";
    return "Todos";
  }, [status]);

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const handleBack = () => {
    navigate("/system-admin/owners");
  };

  const loadRestaurants = async ({
    page = 1,
    qValue = q,
    statusValue = status,
    initial = false,
  } = {}) => {
    const myReq = ++reqRef.current;

    if (initial) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await getSystemOwnerRestaurants(ownerId, {
        page,
        per_page: PAGE_SIZE,
        ...(qValue ? { q: qValue } : {}),
        ...(statusValue ? { status: statusValue } : {}),
      });

      if (myReq !== reqRef.current) return;

      const paginated = res?.data || {};
      const rows = Array.isArray(paginated?.data) ? paginated.data : [];

      setOwner(res?.owner || null);
      setRestaurants(rows);
      setMeta({
        page: Number(paginated?.current_page || page || 1),
        perPage: Number(paginated?.per_page || PAGE_SIZE),
        total: Number(paginated?.total || rows.length || 0),
      });
    } catch (e) {
      if (myReq !== reqRef.current) return;

      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudieron cargar los restaurantes."),
      });
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRestaurants({ page: 1, initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadRestaurants({
        page: 1,
        qValue: q,
        statusValue: status,
        initial: false,
      });
    }, 300);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  const handleChangePage = async (nextPage) => {
    await loadRestaurants({ page: nextPage, initial: false });
  };

  const openCreate = () => {
    setEditingRestaurant(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingRestaurant(row);
    setModalOpen(true);
  };

  const handleManageRestaurant = (row) => {
    navigate(`/system-admin/owners/${ownerId}/restaurants/${row.id}`);
  };

  const handleSaveRestaurant = async (payload, editing) => {
    if (editing?.id) {
      const res = await updateSystemOwnerRestaurant(ownerId, editing.id, {
        ...payload,
        status: editing.status || "active",
      });

      const updated = res?.data;

      setRestaurants((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(updated.id) ? updated : item
        )
      );

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Restaurante actualizado correctamente.",
      });

      const warnings = Array.isArray(res?.warnings) ? res.warnings : [];
      if (warnings.length > 0) {
        setTimeout(() => {
          showAlert({
            severity: "warning",
            title: "Nota",
            message: warnings[0]?.message || "Hay advertencias en los datos.",
          });
        }, 250);
      }
    } else {
      const res = await createSystemOwnerRestaurant(ownerId, payload);
      const created = res?.data;

      if (created) {
        setRestaurants((prev) => [created, ...prev].slice(0, PAGE_SIZE));
        setMeta((prev) => ({
          ...prev,
          total: Number(prev.total || 0) + 1,
        }));
      }

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Restaurante creado correctamente.",
      });

      const warnings = Array.isArray(res?.warnings) ? res.warnings : [];
      if (warnings.length > 0) {
        setTimeout(() => {
          showAlert({
            severity: "warning",
            title: "Nota",
            message: warnings[0]?.message || "Hay advertencias en los datos.",
          });
        }, 250);
      }
    }

    setModalOpen(false);
    setEditingRestaurant(null);
  };

  const handleToggleStatus = async (row) => {
    const nextStatus = row.status === "active" ? "inactive" : "active";
    const snapshot = restaurants;

    setBusyId(row.id);

    setRestaurants((prev) =>
      prev.map((item) =>
        Number(item.id) === Number(row.id)
          ? { ...item, status: nextStatus }
          : item
      )
    );

    try {
      const res = await updateSystemOwnerRestaurant(ownerId, row.id, {
        trade_name: row.trade_name || "",
        description: row.description || "",
        contact_phone: row.contact_phone || "",
        contact_email: row.contact_email || "",
        status: nextStatus,
      });

      const updated = res?.data;

      if (updated) {
        setRestaurants((prev) =>
          prev.map((item) =>
            Number(item.id) === Number(updated.id) ? updated : item
          )
        );
      }
    } catch (e) {
      setRestaurants(snapshot);

      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo actualizar el estado."),
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (row) => {
    const ok = window.confirm(
      `¿De verdad estás seguro de querer eliminar el restaurante?\n\n${row.trade_name}\n\nEsta acción puede eliminar sucursales, tickets y demás información asociada.`
    );

    if (!ok) return;

    const snapshot = restaurants;
    setBusyId(row.id);

    setRestaurants((prev) =>
      prev.filter((item) => Number(item.id) !== Number(row.id))
    );

    try {
      await deleteSystemOwnerRestaurant(ownerId, row.id);

      setMeta((prev) => ({
        ...prev,
        total: Math.max(0, Number(prev.total || 0) - 1),
      }));

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Restaurante eliminado correctamente.",
      });
    } catch (e) {
      setRestaurants(snapshot);

      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo eliminar el restaurante."),
      });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando restaurantes…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <SystemOwnerHeroCard
          owner={owner}
          refreshing={refreshing}
          onCreateRestaurant={openCreate}
          onBack={handleBack}
        />

        <SystemOwnerRestaurantsPanel
          restaurants={restaurants}
          busyId={busyId}
          q={q}
          status={status}
          filteredLabel={filteredLabel}
          total={meta.total}
          pagination={pagination}
          onChangeQ={setQ}
          onChangeStatus={setStatus}
          onManage={handleManageRestaurant}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onPrev={() => handleChangePage(pagination.page - 1)}
          onNext={() => handleChangePage(pagination.page + 1)}
        />
      </Stack>

      <SystemOwnerRestaurantUpsertModal
        open={modalOpen}
        editing={editingRestaurant}
        onClose={() => {
          setModalOpen(false);
          setEditingRestaurant(null);
        }}
        onSave={handleSaveRestaurant}
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