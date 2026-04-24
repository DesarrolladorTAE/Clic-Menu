import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";

import InventoryReportHeader from "../../../../components/inventory/warehouses/reports/InventoryReportHeader";
import InventoryReportFilters from "../../../../components/inventory/warehouses/reports/InventoryReportFilters";
import InventoryReportSummary from "../../../../components/inventory/warehouses/reports/InventoryReportSummary";
import InventoryReportPreview from "../../../../components/inventory/warehouses/reports/InventoryReportPreview";

import { getBranchesByRestaurant } from "../../../../services/restaurant/branch.service";
import { getWarehouses } from "../../../../services/inventory/warehouses/warehouses.service";
import {
  getInventoryReportSummary,
  getInventoryReportTable,
  downloadInventoryReportExcel,
  downloadInventoryReportPdf,
} from "../../../../services/reports/inventoryReport.service";

const INITIAL_FILTERS = {
  branch_id: "",
  warehouse_id: "",
  resource_type: "all",
  stock_status: "with_stock",
  cost_status: "all",
  include_inactive: false,
};

function getFilenameFromResponse(response, fallbackName) {
  const contentDisposition =
    response?.headers?.["content-disposition"] ||
    response?.headers?.["Content-Disposition"];

  if (!contentDisposition) return fallbackName;

  const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (filenameStarMatch?.[1]) {
    return decodeURIComponent(filenameStarMatch[1].replaceAll('"', "").trim());
  }

  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);

  if (filenameMatch?.[1]) {
    return filenameMatch[1].trim();
  }

  return fallbackName;
}

function downloadBlob(response, fallbackName) {
  const blob = new Blob([response.data], {
    type: response.headers?.["content-type"] || "application/octet-stream",
  });

  const fileName = getFilenameFromResponse(response, fallbackName);

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.URL.revokeObjectURL(url);
}

export default function InventoryReportPage() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [filters, setFilters] = useState(() => ({
    ...INITIAL_FILTERS,
    branch_id: searchParams.get("branch_id") || "",
    warehouse_id: searchParams.get("warehouse_id") || "",
  }));

  const [appliedFilters, setAppliedFilters] = useState(null);

  const [summary, setSummary] = useState(null);
  const [stockBreakdown, setStockBreakdown] = useState(null);
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
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

  const requestParams = useMemo(() => {
    return {
      branch_id: filters.branch_id || undefined,
      warehouse_id: filters.warehouse_id || undefined,
      resource_type: filters.resource_type,
      stock_status: filters.stock_status,
      cost_status: filters.cost_status,
      include_inactive: filters.include_inactive ? 1 : 0,
    };
  }, [filters]);

  const appliedRequestParams = useMemo(() => {
    const base = appliedFilters || filters;

    return {
      branch_id: base.branch_id || undefined,
      warehouse_id: base.warehouse_id || undefined,
      resource_type: base.resource_type,
      stock_status: base.stock_status,
      cost_status: base.cost_status,
      include_inactive: base.include_inactive ? 1 : 0,
    };
  }, [appliedFilters, filters]);

  const appliedBranchName = useMemo(() => {
    const branchId = appliedFilters?.branch_id || filters.branch_id;
    if (!branchId) return "Todas las sucursales";

    const branch = branches.find((item) => String(item.id) === String(branchId));
    return branch?.name || `Sucursal ${branchId}`;
  }, [appliedFilters, filters.branch_id, branches]);

  const appliedWarehouseName = useMemo(() => {
    const warehouseId = appliedFilters?.warehouse_id || filters.warehouse_id;
    if (!warehouseId) return "Todos los almacenes";

    const warehouse = warehouses.find(
      (item) => String(item.id) === String(warehouseId)
    );

    return warehouse?.name || `Almacén ${warehouseId}`;
  }, [appliedFilters, filters.warehouse_id, warehouses]);

  const loadWarehousesForBranch = useCallback(
    async (branchIdValue) => {
      const response = await getWarehouses(restaurantId, {
        scope: branchIdValue ? "branch" : undefined,
        ...(branchIdValue ? { branch_id: Number(branchIdValue) } : {}),
      });

      const rowsResponse = Array.isArray(response?.data) ? response.data : [];
      setWarehouses(rowsResponse);
      return rowsResponse;
    },
    [restaurantId]
  );

  const loadInitial = useCallback(async () => {
    setLoadingInitial(true);

    try {
      let loadedBranches = await getBranchesByRestaurant(restaurantId);
      loadedBranches = Array.isArray(loadedBranches) ? loadedBranches : [];
      setBranches(loadedBranches);

      await loadWarehousesForBranch(filters.branch_id || "");
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar la información base del reporte.",
      });
    } finally {
      setLoadingInitial(false);
    }
  }, [restaurantId, filters.branch_id, loadWarehousesForBranch]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleChangeFilter = async (field, value) => {
    setFilters((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === "branch_id") {
        next.warehouse_id = "";
      }

      return next;
    });

    if (field === "branch_id") {
      try {
        await loadWarehousesForBranch(value);
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron cargar los almacenes de la sucursal.",
        });
      }
    }
  };

  const fetchReport = async ({ page = 1, useCurrentFilters = true } = {}) => {
    setLoadingReport(true);

    const paramsBase = useCurrentFilters ? requestParams : appliedRequestParams;

    try {
      const [summaryResponse, tableResponse] = await Promise.all([
        getInventoryReportSummary(restaurantId, paramsBase),
        getInventoryReportTable(restaurantId, {
          ...paramsBase,
          page,
          per_page: 15,
        }),
      ]);

      setSummary(summaryResponse?.data?.summary || null);
      setStockBreakdown(summaryResponse?.data?.stock_breakdown || null);
      setCostBreakdown(summaryResponse?.data?.cost_breakdown || null);

      setRows(
        Array.isArray(tableResponse?.data?.rows)
          ? tableResponse.data.rows
          : []
      );
      setPagination(tableResponse?.data?.pagination || null);

      if (useCurrentFilters) {
        setAppliedFilters({ ...filters });
      }
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo consultar el reporte de existencias.",
      });
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (loadingInitial) return;
    fetchReport({ page: 1, useCurrentFilters: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingInitial]);

  const handleSubmit = () => {
    fetchReport({ page: 1, useCurrentFilters: true });
  };

  const handlePrev = () => {
    const current = pagination?.current_page || 1;
    if (current <= 1) return;

    fetchReport({
      page: current - 1,
      useCurrentFilters: false,
    });
  };

  const handleNext = () => {
    if (!pagination?.has_more_pages) return;

    fetchReport({
      page: (pagination?.current_page || 1) + 1,
      useCurrentFilters: false,
    });
  };

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);

    try {
      const response = await downloadInventoryReportExcel(
        restaurantId,
        appliedRequestParams
      );

      downloadBlob(response, "reporte_inventario.xlsx");
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo descargar el Excel del reporte.",
      });
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);

    try {
      const response = await downloadInventoryReportPdf(
        restaurantId,
        appliedRequestParams
      );

      downloadBlob(response, "reporte_inventario.pdf");
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo descargar el PDF del reporte.",
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const hasReport = !!summary;

  if (loadingInitial) {
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
              Cargando reporte de existencias…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <InventoryReportHeader
          onBack={() =>
            navigate(`/owner/restaurants/${restaurantId}/operation/warehouses`)
          }
        />

        <InventoryReportFilters
          branches={branches}
          warehouses={warehouses}
          filters={filters}
          loading={loadingReport}
          onChange={handleChangeFilter}
          onSubmit={handleSubmit}
        />

        {loadingReport && !hasReport ? (
          <Paper
            sx={{
              p: 4,
              borderRadius: 1,
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Stack spacing={2} alignItems="center">
              <CircularProgress color="primary" />
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                Consultando existencias…
              </Typography>
            </Stack>
          </Paper>
        ) : null}

        {hasReport ? (
          <>
            <InventoryReportSummary
              summary={summary}
              stockBreakdown={stockBreakdown}
              costBreakdown={costBreakdown}
            />

            <Paper
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 1,
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
              >
                <Button
                  onClick={handleDownloadExcel}
                  disabled={downloadingExcel || loadingReport}
                  variant="contained"
                  startIcon={<FileDownloadRoundedIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 180 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {downloadingExcel ? "Descargando…" : "Descargar Excel"}
                </Button>

                <Button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf || loadingReport}
                  variant="outlined"
                  startIcon={<PictureAsPdfRoundedIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 180 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {downloadingPdf ? "Descargando…" : "Descargar PDF"}
                </Button>
              </Stack>
            </Paper>

            <InventoryReportPreview
              summary={summary}
              stockBreakdown={stockBreakdown}
              costBreakdown={costBreakdown}
              rows={rows}
              pagination={pagination}
              branchName={appliedBranchName}
              warehouseName={appliedWarehouseName}
              filters={appliedFilters || filters}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </>
        ) : null}
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