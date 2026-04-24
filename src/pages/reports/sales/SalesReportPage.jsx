import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box, Button, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { useLocation, useParams, useSearchParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import SalesReportHeader from "../../../components/reports/sales/SalesReportHeader";
import SalesReportFilters from "../../../components/reports/sales/SalesReportFilters";
import SalesReportSummary from "../../../components/reports/sales/SalesReportSummary";
import SalesReportPreview from "../../../components/reports/sales/SalesReportPreview";

import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";
import {
  getSalesReportSummary,
  getSalesReportTable,
  downloadSalesReportExcel,
  downloadSalesReportPdf,
} from "../../../services/reports/salesReport.service";

const today = new Date();

const INITIAL_FILTERS = {
  start_date: toDateInputValue(
    new Date(today.getFullYear(), today.getMonth(), 1)
  ),
  end_date: toDateInputValue(today),
  branch_id: "",
};

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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

export default function SalesReportPage() {
  const { restaurantId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const restaurantName = location.state?.restaurantName || "Restaurante";

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const [branches, setBranches] = useState([]);

  const [filters, setFilters] = useState(() => ({
    ...INITIAL_FILTERS,
    start_date: searchParams.get("start_date") || INITIAL_FILTERS.start_date,
    end_date: searchParams.get("end_date") || INITIAL_FILTERS.end_date,
    branch_id: searchParams.get("branch_id") || "",
  }));

  const [appliedFilters, setAppliedFilters] = useState(null);

  const [summary, setSummary] = useState(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState([]);
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
      start_date: filters.start_date,
      end_date: filters.end_date,
      branch_id: filters.branch_id || undefined,
    };
  }, [filters]);

  const appliedRequestParams = useMemo(() => {
    const base = appliedFilters || filters;

    return {
      start_date: base.start_date,
      end_date: base.end_date,
      branch_id: base.branch_id || undefined,
    };
  }, [appliedFilters, filters]);

  const appliedBranchName = useMemo(() => {
    const branchId = appliedFilters?.branch_id || filters.branch_id;
    if (!branchId) return "Todas las sucursales";

    const branch = branches.find((item) => String(item.id) === String(branchId));
    return branch?.name || `Sucursal ${branchId}`;
  }, [appliedFilters, filters.branch_id, branches]);

  const loadInitial = useCallback(async () => {
    setLoadingInitial(true);

    try {
      let loadedBranches = await getBranchesByRestaurant(restaurantId);
      loadedBranches = Array.isArray(loadedBranches) ? loadedBranches : [];
      setBranches(loadedBranches);
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
  }, [restaurantId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleChangeFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchReport = async ({ page = 1, useCurrentFilters = true } = {}) => {
    const paramsBase = useCurrentFilters ? requestParams : appliedRequestParams;

    if (!paramsBase.start_date || !paramsBase.end_date) {
      showAlert({
        severity: "warning",
        title: "Faltan fechas",
        message: "Selecciona fecha inicial y fecha final para consultar.",
      });
      return;
    }

    setLoadingReport(true);

    try {
      const [summaryResponse, tableResponse] = await Promise.all([
        getSalesReportSummary(restaurantId, paramsBase),
        getSalesReportTable(restaurantId, {
          ...paramsBase,
          page,
          per_page: 15,
        }),
      ]);

      setSummary(summaryResponse?.data?.summary || null);
      setPaymentBreakdown(
        Array.isArray(summaryResponse?.data?.payment_breakdown)
          ? summaryResponse.data.payment_breakdown
          : []
      );

      setRows(
        Array.isArray(tableResponse?.data?.rows) ? tableResponse.data.rows : []
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
          "No se pudo consultar el reporte de ventas.",
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
      const response = await downloadSalesReportExcel(
        restaurantId,
        appliedRequestParams
      );

      downloadBlob(response, "reporte_ventas.xlsx");
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
      const response = await downloadSalesReportPdf(
        restaurantId,
        appliedRequestParams
      );

      downloadBlob(response, "reporte_ventas.pdf");
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
              Cargando reporte de ventas…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <SalesReportHeader />

        <SalesReportFilters
          branches={branches}
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
                Consultando ventas…
              </Typography>
            </Stack>
          </Paper>
        ) : null}

        {hasReport ? (
          <>
            <SalesReportSummary
              summary={summary}
              paymentBreakdown={paymentBreakdown}
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

            <SalesReportPreview
              restaurantName={restaurantName}
              summary={summary}
              paymentBreakdown={paymentBreakdown}
              rows={rows}
              pagination={pagination}
              branchName={appliedBranchName}
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
