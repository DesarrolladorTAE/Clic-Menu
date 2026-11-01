//src/components/menu/menuSets/manage/imports/MenuSetImportTemplate.jsx
import { useRef, useState } from "react";

import {
  Box, Button, CircularProgress, MenuItem, Paper,
  Stack, TextField, Typography,
} from "@mui/material";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import {
  downloadMenuSetImportTemplate,
} from "../../../../../services/menu/menuSets/menuSetImport.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
};

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  const fields = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat()
    : [];

  return fields.find((message) => typeof message === "string")
    || data?.message || error?.message || fallback;
}

function saveDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export default function MenuSetImportTemplate({
  restaurantId,
  branchId,
  menuSet,
  management,
  status,
  selectedPeriod,
  periodOptions = [],
  checkingPeriod = false,
  onPeriodChange,
  onAlert,
}) {
  const [format, setFormat] = useState("xlsx");
  const [downloading, setDownloading] = useState(false);
  const downloadingRef = useRef(false);

  const menuSetId = menuSet?.id;
  const capacityMode = status?.next_import_capacity_mode
    || management?.next_import_capacity_mode
    || menuSet?.next_import_capacity_mode;

  const isWeekly = capacityMode === "weekly";
  const isValidPeriod = Boolean(
    selectedPeriod && status?.target_week_start === selectedPeriod
  );

  const disabled = !restaurantId || !branchId || !menuSetId
    || !isValidPeriod || checkingPeriod || downloading;

  const handleDownload = async (event) => {
    event.preventDefault();

    if (disabled || downloadingRef.current) {
      return;
    }

    downloadingRef.current = true;
    setDownloading(true);

    try {
      const result = await downloadMenuSetImportTemplate(
        restaurantId, branchId, menuSetId, format, selectedPeriod
      );

      if (!(result?.blob instanceof Blob)) {
        throw new Error("No se recibió un archivo válido para descargar.");
      }

      // La modalidad semanal utiliza dos archivos CSV dentro de un comprimido.
      const filename = format === "csv" && isWeekly
        ? result.filename.replace(/\.csv$/i, ".zip")
        : result.filename;

      saveDownload(result.blob, filename);
    } catch (error) {
      onAlert?.({
        severity: "error",
        title: "No se pudo descargar",
        message: getErrorMessage(error, "No fue posible generar la plantilla del conjunto."),
      });
    } finally {
      downloadingRef.current = false;
      setDownloading(false);
    }
  };

  return (
    <Paper component="form" onSubmit={handleDownload} sx={panelSx}>
      <Stack spacing={2.5}>
        {/* Encabezado */}
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box sx={{
            width: 44, height: 44, borderRadius: 1,
            display: "grid", placeItems: "center", flexShrink: 0,
            bgcolor: "rgba(214, 122, 58, 0.12)",
            color: "secondary.main",
          }}>
            <DescriptionOutlinedIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              Descargar plantilla
            </Typography>

            <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
              Selecciona el periodo que deseas preparar y el formato del archivo.
            </Typography>
          </Box>
        </Stack>

        {/* Campos */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Box sx={{ flex: 2, minWidth: 0 }}>
            <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 800 }}>
              Periodo comercial *
            </Typography>

            <TextField
              select
              fullWidth
              value={selectedPeriod || ""}
              onChange={(event) => onPeriodChange?.(event.target.value)}
              disabled={downloading || checkingPeriod || periodOptions.length === 0}
              SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              inputProps={{ "aria-label": "Periodo comercial" }}
            >
              {periodOptions.map((period) => (
                <MenuItem key={period.value} value={period.value}>
                  {period.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 800 }}>
              Formato de descarga *
            </Typography>

            <TextField
              select
              fullWidth
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              disabled={downloading}
              SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              inputProps={{ "aria-label": "Formato de descarga" }}
            >
              <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
              <MenuItem value="csv">
                {isWeekly ? "CSV en archivo comprimido (.zip)" : "CSV (.csv)"}
              </MenuItem>
            </TextField>
          </Box>
        </Stack>

        {/* Indicaciones de la plantilla */}
        <Box sx={{
          p: 1.75,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.default",
        }}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <InfoOutlinedIcon sx={{ color: "primary.main", fontSize: 20, flexShrink: 0 }} />

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>
                {isWeekly
                  ? "Plantilla con capacidad semanal"
                  : capacityMode === "daily"
                    ? "Plantilla con capacidad diaria"
                    : "Plantilla sin límite de capacidad"}
              </Typography>

              <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                {isWeekly
                  ? format === "xlsx"
                    ? "El Excel tendrá una hoja para los productos por día y otra para las capacidades semanales."
                    : "Se descargará un archivo comprimido con el menú y las capacidades semanales en dos archivos CSV."
                  : capacityMode === "daily"
                    ? "La plantilla permitirá registrar una cantidad para cada producto y día de servicio."
                    : "La plantilla permitirá organizar los productos por día sin registrar cantidades."}
              </Typography>

              <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
                Los productos y las etapas deben estar previamente habilitados en el conjunto.
                Descargar la plantilla no modifica su programación.
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Acción */}
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            disabled={disabled}
            startIcon={downloading
              ? <CircularProgress size={18} color="inherit" />
              : <FileDownloadOutlinedIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 205 },
              height: 44,
              fontWeight: 800,
            }}
          >
            {downloading ? "Preparando descarga…" : "Descargar plantilla"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}