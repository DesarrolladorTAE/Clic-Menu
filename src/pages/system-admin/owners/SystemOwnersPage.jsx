import { useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import usePagination from "../../../hooks/usePagination";
import { normalizeErr } from "../../../utils/err";

import SystemOwnersHeader from "../../../components/system-admin/owners/SystemOwnersHeader";
import SystemOwnersFiltersCard from "../../../components/system-admin/owners/SystemOwnersFiltersCard";
import SystemOwnersListPanel from "../../../components/system-admin/owners/SystemOwnersListPanel";
import SystemOwnerUpsertModal from "../../../components/system-admin/owners/SystemOwnerUpsertModal";

import {
  createSystemOwner,
  dryRunDeleteSystemOwner,
  deleteSystemOwner,
  getSystemOwners,
  updateSystemOwner,
} from "../../../services/system-admin/systemOwners.service";

const PAGE_SIZE = 5;

export default function SystemOwnersPage() {
  const navigate = useNavigate();
  const reqRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [owners, setOwners] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    perPage: PAGE_SIZE,
    total: 0,
  });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const pagination = usePagination({
    items: owners,
    pageSize: PAGE_SIZE,
    mode: "backend",
    serverMeta: meta,
  });

  const filteredLabel = useMemo(() => {
    if (status === "active") return "Activos";
    if (status === "inactive") return "Inactivos";
    return "Todos";
  }, [status]);

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const loadOwners = async ({
    page = 1,
    qValue = q,
    statusValue = status,
    initial = false,
  } = {}) => {
    const myReq = ++reqRef.current;

    if (initial) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await getSystemOwners({
        page,
        per_page: PAGE_SIZE,
        ...(qValue ? { q: qValue } : {}),
        ...(statusValue ? { status: statusValue } : {}),
      });

      if (myReq !== reqRef.current) return;

      const paginated = res?.data || {};
      const rows = Array.isArray(paginated?.data) ? paginated.data : [];

      setOwners(rows);
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
        message: normalizeErr(e, "No se pudieron cargar los propietarios."),
      });
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOwners({ page: 1, initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadOwners({ page: 1, qValue: q, statusValue: status, initial: false });
    }, 300);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  const handleChangePage = async (nextPage) => {
    await loadOwners({ page: nextPage, initial: false });
  };

  const openCreate = () => {
    setEditingOwner(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingOwner(row);
    setModalOpen(true);
  };

  const handleManage = (row) => {
    navigate(`/system-admin/owners/${row.id}`);
  };

  const handleSaveOwner = async (payload, editing) => {
    if (editing?.id) {
      const res = await updateSystemOwner(editing.id, {
        ...payload,
        password: payload.password || "",
        status: editing.status || "active",
      });

      const updated = res?.data;

      setOwners((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(updated.id) ? updated : item
        )
      );

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Propietario actualizado correctamente.",
      });
    } else {
      const res = await createSystemOwner(payload);
      const created = res?.data;

      if (created) {
        setOwners((prev) => [created, ...prev].slice(0, PAGE_SIZE));
        setMeta((prev) => ({
          ...prev,
          total: Number(prev.total || 0) + 1,
        }));
      }

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Propietario creado correctamente.",
      });
    }

    setModalOpen(false);
    setEditingOwner(null);
  };

  const handleToggleStatus = async (row) => {
    const nextStatus = row.status === "active" ? "inactive" : "active";
    const snapshot = owners;

    setBusyId(row.id);

    setOwners((prev) =>
      prev.map((item) =>
        Number(item.id) === Number(row.id)
          ? { ...item, status: nextStatus }
          : item
      )
    );

    try {
      const res = await updateSystemOwner(row.id, {
        name: row.name || "",
        last_name_paternal: row.last_name_paternal || "",
        last_name_maternal: row.last_name_maternal || "",
        phone: row.phone || "",
        email: row.email || "",
        password: "",
        status: nextStatus,
      });

      const updated = res?.data;

      if (updated) {
        setOwners((prev) =>
          prev.map((item) =>
            Number(item.id) === Number(updated.id) ? updated : item
          )
        );
      }
    } catch (e) {
      setOwners(snapshot);
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
    const ownerId = row?.id;

    if (!ownerId) return;
    if (busyId !== null) return;

    setBusyId(ownerId);

    try {
      const dryRunResult = await dryRunDeleteSystemOwner(ownerId);

      if (dryRunResult?.ok === false) {
        showAlert({
          severity: "error",
          title: "No se puede eliminar",
          message:
            dryRunResult?.message ||
            "Este propietario no puede eliminarse por la información relacionada que tiene registrada.",
        });

        return;
      }

      const ownerName = row?.full_name || row?.name || `Propietario #${ownerId}`;

      const ok = window.confirm(
        `¿Eliminar definitivamente la cuenta de ${ownerName}?\n\nEsta acción eliminará al propietario y no se puede deshacer.`
      );

      if (!ok) return;

      const result = await deleteSystemOwner(ownerId);

      setOwners((prev) =>
        prev.filter((item) => Number(item.id) !== Number(ownerId))
      );

      setMeta((prev) => ({
        ...prev,
        total: Math.max(Number(prev.total || 0) - 1, 0),
      }));

      showAlert({
        severity: "success",
        title: "Propietario eliminado",
        message: result?.message || "Propietario eliminado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "No se puede eliminar",
        message: normalizeErr(e, "No se pudo eliminar el propietario."),
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
              Cargando propietarios…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <SystemOwnersHeader onCreate={openCreate} refreshing={refreshing} />

        <SystemOwnersFiltersCard
          q={q}
          status={status}
          filteredLabel={filteredLabel}
          total={meta.total}
          onChangeQ={setQ}
          onChangeStatus={setStatus}
        />

        <SystemOwnersListPanel
          owners={owners}
          busyId={busyId}
          pagination={pagination}
          onManage={handleManage}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onPrev={() => handleChangePage(pagination.page - 1)}
          onNext={() => handleChangePage(pagination.page + 1)}
        />
      </Stack>

      <SystemOwnerUpsertModal
        open={modalOpen}
        editing={editingOwner}
        onClose={() => {
          setModalOpen(false);
          setEditingOwner(null);
        }}
        onSave={handleSaveOwner}
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