import {
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import PromotionsHeader from "../../../components/menu/promotions/list/PromotionsHeader";
import PromotionsInstructionsCard from "../../../components/menu/promotions/list/PromotionsInstructionsCard";
import PromotionBranchSelector from "../../../components/menu/promotions/list/PromotionBranchSelector";
import PromotionTypeSelector from "../../../components/menu/promotions/list/PromotionTypeSelector";
import PromotionSummaryCards from "../../../components/menu/promotions/list/PromotionSummaryCards";
import PromotionFilters from "../../../components/menu/promotions/list/PromotionFilters";
import PromotionList from "../../../components/menu/promotions/list/PromotionList";
import PromotionDeleteDialog from "../../../components/menu/promotions/list/PromotionDeleteDialog";

import {
  getPromotionBranches,
  getPromotions,
  changePromotionStatus,
  deletePromotion,
} from "../../../services/menu/promotions/promotion.service";

import {
  getPromotionSearchText,
  isPromotionCurrent,
} from "../../../components/menu/promotions/list/promotionList.helpers";

const ITEMS_PER_PAGE = 5;

export default function PromotionsPage() {
  const { restaurantId } = useParams();

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] =
    useState("");

  const [promotions, setPromotions] = useState([]);

  const [loadingBranches, setLoadingBranches] =
    useState(true);
  const [loadingPromotions, setLoadingPromotions] =
    useState(false);

  const [activeType, setActiveType] = useState(
    "promotional_price"
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [page, setPage] = useState(1);

  const [updatingIds, setUpdatingIds] = useState(
    new Set()
  );

  const [promotionToDelete, setPromotionToDelete] =
    useState(null);
  const [deleting, setDeleting] = useState(false);

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

    setAlertState((previous) => ({
      ...previous,
      open: false,
    }));
  };

  useEffect(() => {
    let active = true;

    const loadBranches = async () => {
      setLoadingBranches(true);

      try {
        const result = await getPromotionBranches(
          restaurantId
        );

        if (!active) return;

        setBranches(result);

        setSelectedBranchId((current) => {
          const currentExists = result.some(
            (branch) =>
              String(branch.id) === String(current)
          );

          if (currentExists) {
            return String(current);
          }

          return result[0]?.id
            ? String(result[0].id)
            : "";
        });
      } catch (error) {
        if (!active) return;

        setBranches([]);
        setSelectedBranchId("");

        showAlert({
          severity: "error",
          title: "Error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "No se pudieron cargar las sucursales.",
        });
      } finally {
        if (active) {
          setLoadingBranches(false);
        }
      }
    };

    loadBranches();

    return () => {
      active = false;
    };
  }, [restaurantId]);

  useEffect(() => {
    if (!selectedBranchId) {
      setPromotions([]);
      return undefined;
    }

    let active = true;

    const loadPromotions = async () => {
      setLoadingPromotions(true);

      try {
        const result = await getPromotions(
          restaurantId,
          selectedBranchId
        );

        if (!active) return;

        setPromotions(result);
      } catch (error) {
        if (!active) return;

        setPromotions([]);

        showAlert({
          severity: "error",
          title: "Error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "No se pudieron cargar las promociones.",
        });
      } finally {
        if (active) {
          setLoadingPromotions(false);
        }
      }
    };

    loadPromotions();

    return () => {
      active = false;
    };
  }, [restaurantId, selectedBranchId]);

  const selectedBranch = useMemo(() => {
    return (
      branches.find(
        (branch) =>
          String(branch.id) ===
          String(selectedBranchId)
      ) || null
    );
  }, [branches, selectedBranchId]);

  const selectedTypePromotions = useMemo(() => {
    return promotions.filter(
      (promotion) => promotion?.type === activeType
    );
  }, [promotions, activeType]);

  const summary = useMemo(() => {
    return {
      total: selectedTypePromotions.length,
      active: selectedTypePromotions.filter(
        (promotion) =>
          promotion?.status === "active"
      ).length,
      inactive: selectedTypePromotions.filter(
        (promotion) =>
          promotion?.status === "inactive"
      ).length,
      current: selectedTypePromotions.filter(
        isPromotionCurrent
      ).length,
    };
  }, [selectedTypePromotions]);

  const filteredPromotions = useMemo(() => {
    const normalizedSearch = String(search || "")
      .trim()
      .toLocaleLowerCase("es-MX");

    return selectedTypePromotions.filter(
      (promotion) => {
        const matchesStatus =
          statusFilter === "all" ||
          promotion?.status === statusFilter;

        const matchesSearch =
          normalizedSearch === "" ||
          getPromotionSearchText(
            promotion
          ).includes(normalizedSearch);

        return matchesStatus && matchesSearch;
      }
    );
  }, [
    selectedTypePromotions,
    search,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredPromotions.length / ITEMS_PER_PAGE
    )
  );

  useEffect(() => {
    setPage(1);
  }, [
    activeType,
    search,
    statusFilter,
    selectedBranchId,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedPromotions = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return filteredPromotions.slice(start, end);
  }, [filteredPromotions, page]);

  const startItem =
    filteredPromotions.length === 0
      ? 0
      : (page - 1) * ITEMS_PER_PAGE + 1;

  const endItem = Math.min(
    page * ITEMS_PER_PAGE,
    filteredPromotions.length
  );

  const handleBranchChange = (branchId) => {
    setSelectedBranchId(String(branchId));
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  };

  const handleCreate = () => {
    showAlert({
      severity: "info",
      title: "Aviso",
      message:
        "La pantalla para crear promociones se agregará en el siguiente paso.",
    });
  };

  const handleStatusChange = async (
    promotion,
    checked
  ) => {
    const promotionId = String(promotion.id);
    const previousStatus = promotion.status;
    const nextStatus = checked
      ? "active"
      : "inactive";

    setUpdatingIds((current) => {
      const next = new Set(current);
      next.add(promotionId);
      return next;
    });

    setPromotions((current) =>
      current.map((item) =>
        String(item.id) === promotionId
          ? {
              ...item,
              status: nextStatus,
            }
          : item
      )
    );

    try {
      const result = await changePromotionStatus(
        restaurantId,
        selectedBranchId,
        promotion.id,
        nextStatus
      );

      setPromotions((current) =>
        current.map((item) =>
          String(item.id) === promotionId
            ? {
                ...item,
                ...(result?.promotion || {}),
                status: nextStatus,
              }
            : item
        )
      );

      showAlert({
        severity: "success",
        title: "Hecho",
        message:
          result?.response?.message ||
          (checked
            ? "Promoción activada correctamente."
            : "Promoción desactivada correctamente."),
      });
    } catch (error) {
      setPromotions((current) =>
        current.map((item) =>
          String(item.id) === promotionId
            ? {
                ...item,
                status: previousStatus,
              }
            : item
        )
      );

      showAlert({
        severity: "error",
        title: "Error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo actualizar el estado de la promoción.",
      });
    } finally {
      setUpdatingIds((current) => {
        const next = new Set(current);
        next.delete(promotionId);
        return next;
      });
    }
  };

  const handleDeleteRequest = (promotion) => {
    setPromotionToDelete(promotion);
  };

  const handleCloseDelete = () => {
    if (deleting) return;
    setPromotionToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!promotionToDelete?.id) return;

    setDeleting(true);

    try {
      const response = await deletePromotion(
        restaurantId,
        selectedBranchId,
        promotionToDelete.id
      );

      setPromotions((current) =>
        current.filter(
          (promotion) =>
            String(promotion.id) !==
            String(promotionToDelete.id)
        )
      );

      showAlert({
        severity: "success",
        title: "Hecho",
        message:
          response?.message ||
          "Promoción eliminada correctamente.",
      });

      setPromotionToDelete(null);
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo eliminar la promoción.",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loadingBranches) {
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

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 14,
              }}
            >
              Cargando promociones…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <PromotionsHeader
          branchName={selectedBranch?.name}
          onCreate={handleCreate}
        />

        <PromotionsInstructionsCard />

        <PromotionBranchSelector
          branches={branches}
          value={selectedBranchId}
          onChange={handleBranchChange}
          disabled={loadingPromotions}
        />

        {branches.length === 0 ? (
          <Paper
            sx={{
              px: 3,
              py: 5,
              textAlign: "center",
              borderRadius: 1,
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              No hay sucursales disponibles
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.55,
              }}
            >
              Registra una sucursal antes de administrar
              promociones.
            </Typography>
          </Paper>
        ) : (
          <>
            <PromotionTypeSelector
              value={activeType}
              onChange={setActiveType}
            />

            <PromotionSummaryCards
              summary={summary}
            />

            <PromotionFilters
              search={search}
              status={statusFilter}
              onSearchChange={setSearch}
              onStatusChange={setStatusFilter}
            />

            <PromotionList
              promotions={paginatedPromotions}
              loading={loadingPromotions}
              updatingIds={updatingIds}
              page={page}
              totalPages={totalPages}
              startItem={startItem}
              endItem={endItem}
              total={filteredPromotions.length}
              onPrev={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
              onNext={() =>
                setPage((current) =>
                  Math.min(
                    totalPages,
                    current + 1
                  )
                )
              }
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteRequest}
            />
          </>
        )}
      </Stack>

      <PromotionDeleteDialog
        open={!!promotionToDelete}
        promotion={promotionToDelete}
        deleting={deleting}
        onClose={handleCloseDelete}
        onConfirm={handleDeleteConfirm}
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