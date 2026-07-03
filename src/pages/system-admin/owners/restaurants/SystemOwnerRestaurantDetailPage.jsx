import { useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import usePagination from "../../../../hooks/usePagination";
import { normalizeErr } from "../../../../utils/err";

import SystemOwnerRestaurantHeroCard from "../../../../components/system-admin/owners/restaurants/SystemOwnerRestaurantHeroCard";
import SystemOwnerRestaurantTabs from "../../../../components/system-admin/owners/restaurants/SystemOwnerRestaurantTabs";

import SystemRestaurantBranchesPanel from "../../../../components/system-admin/owners/restaurants/branches/SystemRestaurantBranchesPanel";
import SystemRestaurantBranchUpsertModal from "../../../../components/system-admin/owners/restaurants/branches/SystemRestaurantBranchUpsertModal";

import SystemRestaurantSubscriptionPanel from "../../../../components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionPanel";
import SystemRestaurantSubscriptionAssignModal from "../../../../components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionAssignModal";

import {
  createSystemOwnerRestaurantBranch,
  dryRunDeleteSystemOwnerRestaurantBranch,
  deleteSystemOwnerRestaurantBranch,
  getSystemOwnerRestaurantBranches,
  updateSystemOwnerRestaurantBranch,
  uploadSystemOwnerRestaurantBranchLogo,
  deleteSystemOwnerRestaurantBranchActiveLogo,
} from "../../../../services/system-admin/systemOwnerRestaurantBranches.service";

import {
  createSystemRestaurantSubscription,
  expireSystemRestaurantCurrentSubscription,
  getSystemPlans,
  getSystemRestaurantCurrentSubscription,
  getSystemRestaurantSubscriptions,
} from "../../../../services/system-admin/systemOwnerRestaurantSubscriptions.service";

const PAGE_SIZE = 5;

export default function SystemOwnerRestaurantDetailPage() {
  const { ownerId, restaurantId } = useParams();
  const navigate = useNavigate();
  const reqRef = useRef(0);

  const [tab, setTab] = useState("branches");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [owner, setOwner] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [branches, setBranches] = useState([]);

  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptionBusy, setSubscriptionBusy] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const filteredBranches = useMemo(() => branches, [branches]);

  const pagination = usePagination({
    items: filteredBranches,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const filteredLabel = useMemo(() => {
    if (status === "active") return "Activas";
    if (status === "inactive") return "Inactivas";
    if (status === "suspended_by_plan") return "Suspendidas por plan";
    return "Todas";
  }, [status]);

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const handleBack = () => {
    navigate(`/system-admin/owners/${ownerId}`);
  };

  const loadSubscriptions = async () => {
    const [historyRes, currentRes, plansRes] = await Promise.all([
      getSystemRestaurantSubscriptions(ownerId, restaurantId),
      getSystemRestaurantCurrentSubscription(ownerId, restaurantId),
      getSystemPlans(),
    ]);

    setSubscriptions(Array.isArray(historyRes?.data) ? historyRes.data : []);
    setCurrentSubscription(currentRes?.data || null);
    setPlans(Array.isArray(plansRes) ? plansRes : []);
  };

  const loadBranches = async ({ initial = false } = {}) => {
    const myReq = ++reqRef.current;

    if (initial) setLoading(true);
    else setRefreshing(true);

    try {
      const [branchesRes] = await Promise.all([
        getSystemOwnerRestaurantBranches(ownerId, restaurantId, {
          ...(q ? { q } : {}),
          ...(status ? { status } : {}),
        }),
        loadSubscriptions(),
      ]);

      if (myReq !== reqRef.current) return;

      setOwner(branchesRes?.owner || null);
      setRestaurant(branchesRes?.restaurant || null);
      setBranches(Array.isArray(branchesRes?.data) ? branchesRes.data : []);
    } catch (e) {
      if (myReq !== reqRef.current) return;

      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(
          e,
          "No se pudo cargar la información del restaurante.",
        ),
      });
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBranches({ initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, restaurantId]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadBranches({ initial: false });
    }, 300);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  const openCreate = () => {
    setEditingBranch(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingBranch(row);
    setModalOpen(true);
  };

  const handleSaveBranch = async (
    { payload, logoFile, removeCurrentLogo },
    editing,
  ) => {
    if (editing?.id) {
      let res = await updateSystemOwnerRestaurantBranch(
        ownerId,
        restaurantId,
        editing.id,
        {
          ...payload,
          status: editing.status || "active",
        },
      );

      let updated = res?.data;

      if (removeCurrentLogo) {
        await deleteSystemOwnerRestaurantBranchActiveLogo(
          ownerId,
          restaurantId,
          editing.id,
        );

        updated = {
          ...updated,
          active_logo: null,
          activeLogo: null,
        };
      }

      if (logoFile) {
        const logo = await uploadSystemOwnerRestaurantBranchLogo(
          ownerId,
          restaurantId,
          editing.id,
          logoFile,
        );

        updated = {
          ...updated,
          active_logo: logo,
          activeLogo: logo,
        };
      }

      setBranches((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(updated.id) ? updated : item,
        ),
      );

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Sucursal actualizada correctamente.",
      });
    } else {
      const res = await createSystemOwnerRestaurantBranch(
        ownerId,
        restaurantId,
        payload,
      );

      let created = res?.data;

      if (logoFile && created?.id) {
        const logo = await uploadSystemOwnerRestaurantBranchLogo(
          ownerId,
          restaurantId,
          created.id,
          logoFile,
        );

        created = {
          ...created,
          active_logo: logo,
          activeLogo: logo,
        };
      }

      if (created) {
        setBranches((prev) => [created, ...prev]);
      }

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Sucursal creada correctamente.",
      });
    }

    setModalOpen(false);
    setEditingBranch(null);
  };

  const handleToggleStatus = async (row) => {
    const nextStatus = row.status === "active" ? "inactive" : "active";
    const snapshot = branches;

    setBusyId(row.id);

    setBranches((prev) =>
      prev.map((item) =>
        Number(item.id) === Number(row.id)
          ? { ...item, status: nextStatus }
          : item,
      ),
    );

    try {
      const res = await updateSystemOwnerRestaurantBranch(
        ownerId,
        restaurantId,
        row.id,
        {
          name: row.name || "",
          address: row.address || "",
          phone: row.phone || "",
          open_time: row.open_time ? String(row.open_time).slice(0, 5) : null,
          close_time: row.close_time
            ? String(row.close_time).slice(0, 5)
            : null,
          status: nextStatus,
        },
      );

      const updated = res?.data;

      if (updated) {
        setBranches((prev) =>
          prev.map((item) =>
            Number(item.id) === Number(updated.id) ? updated : item,
          ),
        );
      }
    } catch (e) {
      setBranches(snapshot);

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
    const branchId = row?.id;

    if (!branchId) return;
    if (busyId !== null) return;

    setBusyId(branchId);

    try {
      const dryRunResult = await dryRunDeleteSystemOwnerRestaurantBranch(
        ownerId,
        restaurantId,
        branchId
      );

      if (dryRunResult?.ok === false) {
        showAlert({
          severity: "error",
          title: "No se puede eliminar",
          message:
            dryRunResult?.message ||
            "Esta sucursal no puede eliminarse por la información relacionada que tiene registrada.",
        });

        return;
      }

      const branchName = row?.name || `Sucursal #${branchId}`;

      const ok = window.confirm(
        `¿Eliminar definitivamente la sucursal "${branchName}"?\n\nEsta acción no se puede deshacer.`
      );

      if (!ok) return;

      const result = await deleteSystemOwnerRestaurantBranch(
        ownerId,
        restaurantId,
        branchId
      );

      setBranches((prev) =>
        prev.filter((item) => Number(item.id) !== Number(branchId))
      );

      showAlert({
        severity: "success",
        title: "Sucursal eliminada",
        message: result?.message || "Sucursal eliminada correctamente.",
      });
    } catch (e) {
      const responseData = e?.response?.data;

      showAlert({
        severity: "error",
        title: responseData?.ok === false ? "No se puede eliminar" : "Error",
        message:
          responseData?.message ||
          normalizeErr(e, "No se pudo eliminar la sucursal."),
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleAssignSubscription = async (payload) => {
    setSubscriptionBusy(true);

    try {
      const res = await createSystemRestaurantSubscription(
        ownerId,
        restaurantId,
        payload,
      );

      const created = res?.data;

      if (created) {
        setCurrentSubscription(created);
        setSubscriptions((prev) => [created, ...prev]);
      }

      setSubscriptionModalOpen(false);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Suscripción asignada correctamente.",
      });
    } catch (e) {
      throw e;
    } finally {
      setSubscriptionBusy(false);
    }
  };

  const handleExpireCurrentSubscription = async () => {
    const ok = window.confirm(
      "¿De verdad quieres terminar la suscripción actual de este restaurante?",
    );

    if (!ok) return;

    setSubscriptionBusy(true);

    try {
      const res = await expireSystemRestaurantCurrentSubscription(
        ownerId,
        restaurantId,
      );

      const expired = res?.data;

      setCurrentSubscription(null);

      if (expired?.id) {
        setSubscriptions((prev) =>
          prev.map((item) =>
            Number(item.id) === Number(expired.id) ? expired : item,
          ),
        );
      }

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Suscripción actual terminada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo terminar la suscripción actual."),
      });
    } finally {
      setSubscriptionBusy(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando restaurante…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <SystemOwnerRestaurantHeroCard
          owner={owner}
          restaurant={restaurant}
          refreshing={refreshing}
          onBack={handleBack}
        />

        <Paper
          sx={{
            borderRadius: 1,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
            overflow: "hidden",
          }}
        >
          <SystemOwnerRestaurantTabs tab={tab} onChange={setTab} />
        </Paper>

        {tab === "branches" && (
          <SystemRestaurantBranchesPanel
            branches={pagination.paginatedItems}
            busyId={busyId}
            q={q}
            status={status}
            filteredLabel={filteredLabel}
            total={branches.length}
            pagination={pagination}
            onChangeQ={setQ}
            onChangeStatus={setStatus}
            onCreate={openCreate}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {tab === "subscriptions" && (
          <SystemRestaurantSubscriptionPanel
            currentSubscription={currentSubscription}
            subscriptions={subscriptions}
            plans={plans}
            busy={subscriptionBusy}
            onAssign={() => setSubscriptionModalOpen(true)}
            onExpireCurrent={handleExpireCurrentSubscription}
          />
        )}
      </Stack>

      <SystemRestaurantBranchUpsertModal
        open={modalOpen}
        editing={editingBranch}
        onClose={() => {
          setModalOpen(false);
          setEditingBranch(null);
        }}
        onSave={handleSaveBranch}
      />

      <SystemRestaurantSubscriptionAssignModal
        open={subscriptionModalOpen}
        plans={plans}
        owner={owner}
        subscriptions={subscriptions}
        onClose={() => setSubscriptionModalOpen(false)}
        onSave={handleAssignSubscription}
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
