//src/components/menu/menuSets/manage/imports/MenuSetImportUpload.jsx
import { useEffect, useRef, useState } from "react";

import {
  Box, Button, Chip, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import {
  previewMenuSetImport,
} from "../../../../../services/menu/menuSets/menuSetImport.service";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
};

function getAllowedFormats(capacityMode) {
  return capacityMode === "weekly" ? ["xlsx", "zip"] : ["xlsx", "csv"];
}

function getExtension(filename) {
  return String(filename || "").split(".").pop().toLowerCase();
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function validateFile(file, capacityMode) {
  if (!file) return "Selecciona un archivo para continuar.";

  const allowed = getAllowedFormats(capacityMode);

  if (!allowed.includes(getExtension(file.name))) {
    return capacityMode === "weekly"
      ? "Para la capacidad semanal selecciona un archivo Excel (.xlsx) o comprimido (.zip)."
      : "Selecciona un archivo Excel (.xlsx) o CSV (.csv).";
  }

  if (file.size === 0) {
    return "El archivo está vacío. Selecciona uno que contenga la programación.";
  }

  if (file.size > MAX_FILE_BYTES) {
    return "El archivo no puede superar los 10 MB.";
  }

  return null;
}

function getServerIssues(error) {
  const data = error?.response?.data;
  const fields = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat()
    : [];

  const issues = fields.filter((message) => typeof message === "string" && message.trim());

  if (issues.length > 0) {
    return [...new Set(issues)];
  }

  return [
    data?.message || error?.message || "No fue posible revisar el archivo seleccionado.",
  ];
}

export default function MenuSetImportUpload({
  restaurantId,
  branchId,
  menuSet,
  status,
  selectedPeriod,
  checkingPeriod = false,
  onReviewChange,
  onAlert,
}) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const inputRef = useRef(null);
  const requestRef = useRef(null);
  const reviewingRef = useRef(false);

  const menuSetId = menuSet?.id;
  const capacityMode = status?.next_import_capacity_mode;
  const allowedFormats = getAllowedFormats(capacityMode);
  const accept = allowedFormats.map((extension) => `.${extension}`).join(",");

  const validPeriod = Boolean(
    selectedPeriod && status?.target_week_start === selectedPeriod
  );

  const disabled = !restaurantId || !branchId || !menuSetId
    || !validPeriod || checkingPeriod || reviewing;

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
    };
  }, []);

  const clearFile = () => {
    if (reviewingRef.current) return;

    setFile(null);
    setDragging(false);
    onReviewChange?.(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const selectFile = (selected) => {
    if (disabled) return;
    if (!selected) return;

    onReviewChange?.(null);

    const validationError = validateFile(selected, capacityMode);

    if (validationError) {
      setFile(null);

      onReviewChange?.({
        type: "invalid",
        title: "Archivo no válido",
        issues: [validationError],
      });

      onAlert?.({
        severity: "error",
        title: "Archivo no válido",
        message: "Revisa los requisitos del archivo seleccionado.",
      });
      return;
    }

    setFile(selected);
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    selectFile(selected);
  };

  const handleDragOver = (event) => {
    event.preventDefault();

    if (!disabled) {
      setDragging(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    if (disabled) return;

    const selected = event.dataTransfer?.files?.[0];

    if (event.dataTransfer?.files?.length > 1) {
      onReviewChange?.({
        type: "invalid",
        title: "Selección no válida",
        issues: ["Selecciona un solo archivo para preparar la vista previa."],
      });

      onAlert?.({
        severity: "error",
        title: "Selección no válida",
        message: "Solo se puede revisar un archivo a la vez.",
      });
      return;
    }

    selectFile(selected);
  };

  const handlePreview = async () => {
    if (disabled || reviewingRef.current) return;

    const validationError = validateFile(file, capacityMode);

    if (validationError) {
      onReviewChange?.({
        type: "invalid",
        title: "Archivo no válido",
        issues: [validationError],
      });

      onAlert?.({
        severity: "error",
        title: "Revisa el archivo",
        message: "El archivo seleccionado no cumple los requisitos.",
      });
      return;
    }

    const controller = new AbortController();
    const formData = new FormData();

    formData.append("file", file);
    formData.append("target_week_start", selectedPeriod);

    requestRef.current = controller;
    reviewingRef.current = true;
    setReviewing(true);
    onReviewChange?.(null);

    try {
      const response = await previewMenuSetImport(
        restaurantId, branchId, menuSetId, formData, controller.signal
      );

      if (controller.signal.aborted) return;

      const result = response?.data;

      if (
        response?.ok !== true
        || !result?.import_id
        || result?.publish_allowed !== true
        || result?.target_week_start !== selectedPeriod
      ) {
        throw new Error("No se recibió una vista previa válida para el periodo seleccionado.");
      }

      onReviewChange?.({
        type: "ready",
        title: "Archivo revisado",
        filename: file.name,
        data: result,
      });

      onAlert?.({
        severity: "success",
        title: "Archivo revisado",
        message: "La programación fue validada correctamente.",
      });
    } catch (error) {
      if (controller.signal.aborted) return;

      const issues = getServerIssues(error);
      const conflict = error?.response?.status === 409
        || error?.response?.data?.code === "MENU_SET_IMPORT_BLOCKED";

      onReviewChange?.({
        type: conflict ? "conflict" : "invalid",
        title: conflict ? "Conflicto de programación" : "Archivo no válido",
        filename: file.name,
        issues,
      });

      onAlert?.({
        severity: "error",
        title: conflict ? "Programación no disponible" : "Error de validación",
        message: "Consulta los resultados de la revisión para continuar.",
      });
    } finally {
      reviewingRef.current = false;
      requestRef.current = null;

      if (!controller.signal.aborted) {
        setReviewing(false);
      }
    }
  };

  return (
    <Paper sx={panelSx}>
      <Stack spacing={2.5}>
        {/* Encabezado */}
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box sx={{
            width: 44, height: 44, borderRadius: 1,
            display: "grid", placeItems: "center", flexShrink: 0,
            bgcolor: "rgba(214, 122, 58, 0.12)",
            color: "secondary.main",
          }}>
            <UploadFileOutlinedIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              Importar programación
            </Typography>

            <Typography sx={{
              mt: 0.4, fontSize: 13,
              color: "text.secondary", lineHeight: 1.55,
            }}>
              Selecciona el archivo con la programación del periodo comercial.
              Primero se revisará su contenido y después podrás decidir si deseas publicarlo.
            </Typography>
          </Box>
        </Stack>

        {/* Área de selección */}
        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 1,
            border: "1px dashed",
            borderColor: dragging ? "primary.main" : "divider",
            bgcolor: dragging ? "action.hover" : "background.default",
            transition: "background-color 0.18s ease, border-color 0.18s ease",
            textAlign: "center",
          }}
        >
          <Stack spacing={1.5} alignItems="center">
            <Box sx={{
              width: 56, height: 56, borderRadius: 1,
              display: "grid", placeItems: "center",
              bgcolor: "rgba(214, 122, 58, 0.12)",
              color: "secondary.main",
            }}>
              <DescriptionOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
                Selecciona o arrastra tu archivo
              </Typography>

              <Typography sx={{
                mt: 0.5, fontSize: 13,
                color: "text.secondary", lineHeight: 1.5,
              }}>
                {capacityMode === "weekly"
                  ? "Formatos permitidos: Excel (.xlsx) y archivo comprimido (.zip)."
                  : "Formatos permitidos: Excel (.xlsx) y CSV (.csv)."}
              </Typography>

              <Typography sx={{ mt: 0.35, fontSize: 12, color: "text.secondary" }}>
                Tamaño máximo: 10 MB.
              </Typography>
            </Box>

            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileOutlinedIcon />}
              disabled={disabled}
              sx={{
                minWidth: { xs: "100%", sm: 190 },
                height: 42, fontWeight: 800,
              }}
            >
              Seleccionar archivo

              <input
                ref={inputRef}
                type="file"
                hidden
                accept={accept}
                disabled={disabled}
                onChange={handleFileChange}
                aria-label="Seleccionar archivo de programación"
              />
            </Button>
          </Stack>
        </Box>

        {/* Archivo elegido */}
        {file ? (
          <Box sx={{
            p: 1.75,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
          }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                <DescriptionOutlinedIcon sx={{ color: "primary.main", flexShrink: 0 }} />

                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{
                    fontSize: 14, fontWeight: 800,
                    color: "text.primary", overflowWrap: "anywhere",
                  }}>
                    {file.name}
                  </Typography>

                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {formatFileSize(file.size)}
                  </Typography>
                </Box>
              </Stack>

              <Button
                type="button"
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<CloseOutlinedIcon />}
                disabled={reviewing}
                onClick={clearFile}
                sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
              >
                Quitar archivo
              </Button>
            </Stack>
          </Box>
        ) : null}

        {/* Información de la revisión */}
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <InfoOutlinedIcon sx={{ fontSize: 20, color: "primary.main", flexShrink: 0 }} />

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>
              ¿Qué se comprobará?
            </Typography>

            <Typography sx={{
              mt: 0.4, fontSize: 13,
              color: "text.secondary", lineHeight: 1.55,
            }}>
              Se revisarán los días de servicio, las etapas, los productos asignados,
              las capacidades y los cambios respecto a la programación aplicable.
              También se comprobará que los cambios sean compatibles con las operaciones existentes.
            </Typography>
          </Box>
        </Stack>

        {/* Acción */}
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
          <Button
            type="button"
            variant="contained"
            disabled={disabled || !file}
            onClick={handlePreview}
            startIcon={reviewing
              ? <CircularProgress size={18} color="inherit" />
              : <FactCheckOutlinedIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 190 },
              height: 44, fontWeight: 800,
            }}
          >
            {reviewing ? "Revisando archivo…" : "Revisar archivo"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}