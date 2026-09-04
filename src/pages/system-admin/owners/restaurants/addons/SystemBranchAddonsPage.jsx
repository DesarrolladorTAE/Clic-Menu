import { useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../../../components/common/PageContainer";
import AppAlert from "../../../../../components/common/AppAlert";
import usePagination from "../../../../../hooks/usePagination";
import { normalizeErr } from "../../../../../utils/err";

import SystemBranchAddonsHeroCard from "../../../../../components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonsHeroCard";
import SystemBranchAddonsPanel from "../../../../../components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonsPanel";
import SystemBranchAddonAssignModal from "../../../../../components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonAssignModal";

import {
  assignSystemOwnerRestaurantAddon,
  getSystemAddons,
  getSystemOwnerRestaurantAddons,
} from "../../../../../services/system-admin/systemOwnerRestaurantAddons.service";

const PAGE_SIZE = 5;

export default function SystemBranchAddonsPage() {
  const { ownerId, restaurantId, branchId } = useParams();
  const navigate = useNavigate();
  const reqRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [branch, setBranch] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [branchAssignments, setBranchAssignments] = useState([]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const applyRestaurantAddonResponse = (response) => {
    const branches = Array.isArray(response?.data) ? response.data : [];
    const selectedBranch = branches.find((item) => Number(item.id) === Number(branchId)) || null;

    setOwner(response?.owner || null);
    setRestaurant(response?.restaurant || null);
    setBranch(selectedBranch);
    setBranchAssignments(Array.isArray(selectedBranch?.addons) ? selectedBranch.addons : []);

    return selectedBranch;
  };

  const loadPage = async () => {
    const myReq = ++reqRef.current;
    setLoading(true);

    try {
      const [catalogRes, restaurantAddonsRes] = await Promise.all([
        getSystemAddons(),
        getSystemOwnerRestaurantAddons(ownerId, restaurantId),
      ]);

      if (myReq !== reqRef.current) return;

      const selectedBranch = applyRestaurantAddonResponse(restaurantAddonsRes);

      if (!selectedBranch) {
        showAlert({
          severity: "error",
          title: "Sucursal no encontrada",
          message: "La sucursal seleccionada no pertenece a este restaurante.",
        });
      }

      setCatalog(
        Array.isArray(catalogRes?.data)
          ? catalogRes.data.filter((item) => item.scope === "branch")
          : []
      );
    } catch (e) {
      if (myReq !== reqRef.current) return;

      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudieron cargar los complementos de la sucursal."),
      });
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  const refreshAssignmentsSilently = async () => {
    const response = await getSystemOwnerRestaurantAddons(ownerId, restaurantId);
    applyRestaurantAddonResponse(response);
  };

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, restaurantId, branchId]);

  const addons = useMemo(() => {
    const assignmentsByAddonId = new Map(
      branchAssignments.map((item) => [Number(item?.addon?.id), item])
    );

    return catalog.map((addon) => {
      const assignment = assignmentsByAddonId.get(Number(addon.id)) || null;

      let state = "unassigned";

      if (!addon.active || addon.scope !== "branch") state = "unavailable";
      else if (assignment?.is_current && assignment?.available) state = "current";
      else if (assignment?.is_expired) state = "expired";
      else if (assignment) state = "unavailable";

      return {
        ...addon,
        assignment,
        state,
        days_remaining: assignment?.days_remaining ?? null,
      };
    });
  }, [catalog, branchAssignments]);

  const filteredAddons = useMemo(() => {
    const search = q.trim().toLowerCase();

    return addons.filter((item) => {
      const matchesSearch =
        !search ||
        String(item.name || "").toLowerCase().includes(search) ||
        String(item.description || "").toLowerCase().includes(search);

      const matchesStatus = !status || item.state === status;

      return matchesSearch && matchesStatus;
    });
  }, [addons, q, status]);

  const pagination = usePagination({
    items: filteredAddons,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const filteredLabel = useMemo(() => {
    if (status === "current") return "Activos";
    if (status === "expired") return "Vencidos";
    if (status === "unassigned") return "Sin asignar";
    if (status === "unavailable") return "No disponibles";
    return "Todos";
  }, [status]);

  const handleBack = () => {
    navigate(`/system-admin/owners/${ownerId}/restaurants/${restaurantId}`);
  };

  const handleAssign = async (addon, payload) => {
    const result = await assignSystemOwnerRestaurantAddon(
      ownerId,
      restaurantId,
      addon.id,
      payload
    );

    await refreshAssignmentsSilently();

    setModalOpen(false);

    showAlert({
      severity: "success",
      title: addon.assignment ? "Complemento renovado" : "Complemento asignado",
      message: result?.message || "El complemento se guardó correctamente.",
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando complementos…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <SystemBranchAddonsHeroCard
          owner={owner}
          restaurant={restaurant}
          branch={branch}
          onBack={handleBack}
        />

        <SystemBranchAddonsPanel
          addons={pagination.paginatedItems}
          q={q}
          status={status}
          filteredLabel={filteredLabel}
          total={filteredAddons.length}
          pagination={pagination}
          onChangeQ={setQ}
          onChangeStatus={setStatus}
          onAssign={() => setModalOpen(true)}
        />
      </Stack>

      <SystemBranchAddonAssignModal
        open={modalOpen}
        branch={branch}
        addons={addons}
        onClose={() => setModalOpen(false)}
        onSave={handleAssign}
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