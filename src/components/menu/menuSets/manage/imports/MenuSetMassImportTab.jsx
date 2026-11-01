//src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, CircularProgress, Paper, Stack, Tab, Tabs, Typography,
} from "@mui/material";

import MenuSetImportPeriodSummary from "./MenuSetImportPeriodSummary";
import MenuSetImportTemplate from "./MenuSetImportTemplate";
import MenuSetImportUpload from "./MenuSetImportUpload";
import MenuSetImportPreview from "./MenuSetImportPreview";
import MenuSetImportPublish from "./MenuSetImportPublish";
import MenuSetImportCurrent from "./MenuSetImportCurrent";
import MenuSetImportHistory from "./MenuSetImportHistory";
import MenuSetPublicationHistory from "./MenuSetPublicationHistory";

import { getMenuSet } from "../../../../../services/menu/menuSets/menuSet.service";
import {
  getMenuSetImportCurrentStatus,
} from "../../../../../services/menu/menuSets/menuSetImport.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
};

function addDays(dateValue, days) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateValue || ""))) return "";

  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function formatShortDate(value) {
  if (!value) return "Fecha no disponible";

  const date = new Date(`${value}T12:00:00Z`);
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(date);
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  const fields = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat() : [];

  return fields.find((message) => typeof message === "string")
    || data?.message || error?.message || fallback;
}

export default function MenuSetMassImportTab({
  restaurantId,
  branchId,
  menuSet,
  management,
  onUpdated,
  onAlert,
}) {
  const menuSetId = menuSet?.id;

  const [status, setStatus] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [nextPeriodStart, setNextPeriodStart] = useState("");

  const [review, setReview] = useState(null);
  const [publicationResult, setPublicationResult] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const [section, setSection] = useState("programacion");
  const [historySection, setHistorySection] = useState("importaciones");
  const [refreshToken, setRefreshToken] = useState(0);
  const [uploadVersion, setUploadVersion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [checkingPeriod, setCheckingPeriod] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const requestRef = useRef(0);
  const selectionControllerRef = useRef(null);
  const alertRef = useRef(onAlert);

  useEffect(() => {
    alertRef.current = onAlert;
  }, [onAlert]);

  // Consultar el siguiente periodo comercial calculado para este conjunto.
  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++requestRef.current;

    selectionControllerRef.current?.abort();

    setStatus(null);
    setSelectedPeriod("");
    setNextPeriodStart("");
    setReview(null);
    setPublicationResult(null);
    setSection("programacion");
    setHistorySection("importaciones");
    setLoading(true);
    setCheckingPeriod(false);
    setLoadFailed(false);

    if (!restaurantId || !branchId || !menuSetId || management?.management_mode !== "mass_import") {
      setLoading(false);
      setLoadFailed(true);
      return () => controller.abort();
    }

    const loadInitialPeriod = async () => {
      try {
        const result = await getMenuSetImportCurrentStatus(
          restaurantId, branchId, menuSetId, null, controller.signal
        );

        if (controller.signal.aborted || requestId !== requestRef.current) return;

        if (!result?.target_week_start || !result?.target_week_end) {
          throw new Error("No se recibió el siguiente periodo comercial del conjunto.");
        }

        setStatus(result);
        setSelectedPeriod(result.target_week_start);
        setNextPeriodStart(result.target_week_start);
      } catch (error) {
        if (controller.signal.aborted || requestId !== requestRef.current) return;

        setLoadFailed(true);
        alertRef.current?.({
          severity: "error",
          title: "Error",
          message: getErrorMessage(error, "No se pudo consultar la programación del conjunto."),
        });
      } finally {
        if (!controller.signal.aborted && requestId === requestRef.current) {
          setLoading(false);
        }
      }
    };

    loadInitialPeriod();

    return () => {
      controller.abort();
      selectionControllerRef.current?.abort();
      requestRef.current++;
    };
  }, [
    restaurantId,
    branchId,
    menuSetId,
    management?.management_mode,
    management?.next_import_capacity_mode,
    management?.import_update_day,
    management?.import_deadline_time,
  ]);

  // Los inicios comerciales se derivan de la fecha entregada por el servidor.
  const periodOptions = useMemo(() => {
    if (!nextPeriodStart) return [];

    return Array.from({ length: 13 }, (_, index) => {
      const offset = index - 1;
      const start = addDays(nextPeriodStart, offset * 7);
      const end = addDays(start, 6);

      const prefix = offset === -1
        ? "Periodo actual"
        : offset === 0 ? "Próximo periodo" : "Periodo futuro";

      return {
        value: start,
        label: `${prefix} · ${formatShortDate(start)} al ${formatShortDate(end)}`,
      };
    });
  }, [nextPeriodStart]);

  // Sincronizar datos después de publicar o detectar cambios concurrentes.
  const synchronizePeriod = async (period, updateSet = false) => {
    if (!period || !restaurantId || !branchId || !menuSetId) return;

    selectionControllerRef.current?.abort();

    const controller = new AbortController();
    const requestId = ++requestRef.current;
    selectionControllerRef.current = controller;

    setCheckingPeriod(true);

    try {
      const requests = [
        getMenuSetImportCurrentStatus(
          restaurantId, branchId, menuSetId, period, controller.signal
        ),
      ];

      if (updateSet) {
        requests.push(getMenuSet(restaurantId, branchId, menuSetId));
      }

      const results = await Promise.allSettled(requests);

      if (controller.signal.aborted || requestId !== requestRef.current) return;

      const currentStatus = results[0];
      if (
        currentStatus.status === "fulfilled"
        && currentStatus.value?.target_week_start === period
      ) {
        setStatus(currentStatus.value);
      }

      if (updateSet && results[1]?.status === "fulfilled" && results[1].value?.id) {
        onUpdated?.(results[1].value);
      }
    } finally {
      if (!controller.signal.aborted && requestId === requestRef.current) {
        setCheckingPeriod(false);
      }
    }
  };

  const handlePeriodChange = async (period) => {
    if (!period || period === selectedPeriod || loading || publishing) return;

    const previousPeriod = status?.target_week_start || selectedPeriod;
    const controller = new AbortController();

    selectionControllerRef.current?.abort();
    selectionControllerRef.current = controller;

    const requestId = ++requestRef.current;

    setSelectedPeriod(period);
    setReview(null);
    setPublicationResult(null);
    setCheckingPeriod(true);

    try {
      const result = await getMenuSetImportCurrentStatus(
        restaurantId, branchId, menuSetId, period, controller.signal
      );

      if (controller.signal.aborted || requestId !== requestRef.current) return;

      if (result?.target_week_start !== period) {
        throw new Error("El periodo consultado no corresponde al seleccionado.");
      }

      setStatus(result);
    } catch (error) {
      if (controller.signal.aborted || requestId !== requestRef.current) return;

      setSelectedPeriod(previousPeriod);
      alertRef.current?.({
        severity: "error",
        title: "No se pudo consultar",
        message: getErrorMessage(error, "No se pudo consultar el periodo seleccionado."),
      });
    } finally {
      if (!controller.signal.aborted && requestId === requestRef.current) {
        setCheckingPeriod(false);
      }
    }
  };

  const handleReviewChange = (value) => {
    setReview(value);
    setPublicationResult(null);
  };

  const handlePublished = (result, message) => {
    setReview(null);
    setPublicationResult(result);
    setUploadVersion((current) => current + 1);
    setRefreshToken((current) => current + 1);

    alertRef.current?.({
      severity: "success",
      title: result.created ? "Programación publicada" : "Programación confirmada",
      message: message || "El periodo fue actualizado correctamente.",
    });

    synchronizePeriod(result.target_week_start, true);
  };

  const handlePublicationInvalid = (issue) => {
    setReview(issue);
    setPublicationResult(null);
    setRefreshToken((current) => current + 1);

    synchronizePeriod(selectedPeriod);
  };

  if (loading) {
    return (
      <Paper sx={panelSx}>
        <Stack spacing={2} alignItems="center" sx={{ py: 5 }}>
          <CircularProgress color="primary" />
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            Consultando el periodo comercial…
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (loadFailed || !status) {
    return (
      <Paper sx={panelSx}>
        <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
          Programación no disponible
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary" }}>
          No se pudo obtener el periodo comercial. Vuelve a ingresar a esta sección para continuar.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Secciones de administración */}
      <Paper sx={{
        borderRadius: 1, border: "1px solid",
        borderColor: "divider", boxShadow: "none",
        bgcolor: "background.paper", overflow: "hidden",
      }}>
        <Tabs
          value={section}
          onChange={(_, value) => setSection(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Secciones de programación masiva"
          sx={{
            px: { xs: 0.5, sm: 1 },
            "& .MuiTab-root": {
              minHeight: 52, textTransform: "none",
              fontSize: 14, fontWeight: 800,
            },
          }}
        >
          <Tab value="programacion" label="Preparar programación" disabled={publishing} />
          <Tab value="vigente" label="Configuración vigente" disabled={publishing} />
          <Tab value="historial" label="Historial" disabled={publishing} />
        </Tabs>
      </Paper>

      {section === "programacion" ? (
        <Stack spacing={3}>
          {/* Estado del periodo seleccionado */}
          <MenuSetImportPeriodSummary
            status={status}
            checking={checkingPeriod}
            timezone={menuSet?.branch?.timezone || "America/Mexico_City"}
          />

          {/* Selección de periodo y descarga de plantilla */}
          <MenuSetImportTemplate
            restaurantId={restaurantId}
            branchId={branchId}
            menuSet={menuSet}
            management={management}
            status={status}
            selectedPeriod={selectedPeriod}
            periodOptions={periodOptions}
            checkingPeriod={checkingPeriod || publishing}
            onPeriodChange={handlePeriodChange}
            onAlert={onAlert}
          />

          {/* Selección y revisión del archivo */}
          <MenuSetImportUpload
            key={`${menuSetId}-${selectedPeriod}-${uploadVersion}`}
            restaurantId={restaurantId}
            branchId={branchId}
            menuSet={menuSet}
            status={status}
            selectedPeriod={selectedPeriod}
            checkingPeriod={checkingPeriod || publishing}
            onReviewChange={handleReviewChange}
            onAlert={onAlert}
          />

          {/* Vista previa validada o conflictos */}
          {review ? (
            <MenuSetImportPreview
              review={review}
              timezone={menuSet?.branch?.timezone || "America/Mexico_City"}
            />
          ) : null}

          {/* Confirmación y resultado de publicación */}
          {review?.type === "ready" || publicationResult ? (
            <MenuSetImportPublish
              restaurantId={restaurantId}
              branchId={branchId}
              menuSet={menuSet}
              review={review}
              publicationResult={publicationResult}
              onPublished={handlePublished}
              onInvalid={handlePublicationInvalid}
              onPublishingChange={setPublishing}
              onAlert={onAlert}
            />
          ) : null}
        </Stack>
      ) : null}

      {section === "vigente" ? (
        <MenuSetImportCurrent
          restaurantId={restaurantId}
          branchId={branchId}
          menuSet={menuSet}
          management={management}
          refreshToken={refreshToken}
          onAlert={onAlert}
        />
      ) : null}

      {section === "historial" ? (
        <Stack spacing={2}>
          <Paper sx={{
            borderRadius: 1, border: "1px solid",
            borderColor: "divider", bgcolor: "background.paper",
            boxShadow: "none", overflow: "hidden",
          }}>
            <Tabs
              value={historySection}
              onChange={(_, value) => setHistorySection(value)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="Tipos de historial"
              sx={{
                px: { xs: 0.5, sm: 1 },
                "& .MuiTab-root": {
                  minHeight: 48, textTransform: "none",
                  fontSize: 14, fontWeight: 800,
                },
              }}
            >
              <Tab value="importaciones" label="Importaciones" />
              <Tab value="publicaciones" label="Publicaciones" />
            </Tabs>
          </Paper>

          {historySection === "importaciones" ? (
            <MenuSetImportHistory
              restaurantId={restaurantId}
              branchId={branchId}
              menuSet={menuSet}
              refreshToken={refreshToken}
              onAlert={onAlert}
            />
          ) : (
            <MenuSetPublicationHistory
              restaurantId={restaurantId}
              branchId={branchId}
              menuSet={menuSet}
              refreshToken={refreshToken}
              onAlert={onAlert}
            />
          )}
        </Stack>
      ) : null}
    </Stack>
  );
}