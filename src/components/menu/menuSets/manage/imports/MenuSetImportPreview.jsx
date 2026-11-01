//src/components/menu/menuSets/manage/imports/MenuSetImportPreview.jsx
import { useEffect, useMemo, useState } from "react";

import {
  Box, Chip, MenuItem, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from "@mui/material";

import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import DifferenceOutlinedIcon from "@mui/icons-material/DifferenceOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

import PaginationFooter from "../../../../common/PaginationFooter";
import usePagination from "../../../../../hooks/usePagination";

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
};

const DAYS = {
  1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves",
  5: "Viernes", 6: "Sábado", 7: "Domingo",
};

const CAPACITY_LABELS = {
  none: "Sin límite",
  daily: "Diaria",
  weekly: "Semanal",
};

const CHANGE_TYPES = {
  modified: { label: "Modificado", color: "warning" },
  added: { label: "Agregado", color: "success" },
  removed: { label: "Retirado", color: "error" },
  unchanged: { label: "Sin cambios", color: "default" },
};

const ELEMENT_LABELS = {
  service_day: "Día general",
  stage: "Etapa",
  option: "Producto",
  capacity_mode: "Modalidad de capacidad",
};

function formatDateTime(value, timezone) {
  if (!value) return "No informado";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No informado";

  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric", month: "long", year: "numeric",
      hour: "numeric", minute: "2-digit",
      hour12: true, timeZone: timezone,
    }).format(date);
  } catch {
    return "No informado";
  }
}

function getItemName(type, value) {
  if (type === "service_day") {
    return DAYS[Number(value)] || "Día de servicio";
  }

  if (type === "capacity_mode") {
    return "Modalidad de capacidad";
  }

  return value?.name || "Elemento sin nombre";
}

function getItemDescription(type, value) {
  if (value === null || value === undefined) return "—";

  if (type === "service_day") {
    return DAYS[Number(value)] || "Día de servicio";
  }

  if (type === "capacity_mode") {
    return CAPACITY_LABELS[value] || "No informada";
  }

  if (type === "stage") {
    const required = value.required ? "Obligatoria" : "Opcional";

    return `${value.name || "Etapa"} · ${required} · `
      + `${value.min_selections ?? 0} a ${value.max_selections ?? 0} selecciones · `
      + `Orden ${value.sort_order ?? 0}`;
  }

  if (type === "option") {
    const days = Array.isArray(value.service_days)
      ? value.service_days.map((day) => DAYS[Number(day)]).filter(Boolean)
      : [];

    const details = [
      value.name || "Producto",
      `Días: ${days.length ? days.join(", ") : "Sin días"}`,
    ];

    if (value.weekly_capacity !== null && value.weekly_capacity !== undefined) {
      details.push(`Capacidad semanal: ${value.weekly_capacity}`);
    }

    if (value.daily_capacities && typeof value.daily_capacities === "object") {
      const capacities = Object.entries(value.daily_capacities)
        .sort(([dayA], [dayB]) => Number(dayA) - Number(dayB))
        .map(([day, capacity]) => `${DAYS[Number(day)] || day}: ${capacity}`);

      if (capacities.length) {
        details.push(`Capacidad diaria: ${capacities.join(", ")}`);
      }
    }

    details.push(`Orden ${value.sort_order ?? 0}`);

    return details.join(" · ");
  }

  return "Información de la programación";
}

function buildDifferenceRows(diff) {
  const groups = ["modified", "added", "removed", "unchanged"];

  return groups.flatMap((change) => {
    const entries = Array.isArray(diff?.[change]) ? diff[change] : [];

    return entries.map((entry, index) => {
      const before = change === "modified" ? entry.before
        : change === "removed" || change === "unchanged" ? entry.value : null;

      const after = change === "modified" ? entry.after
        : change === "added" || change === "unchanged" ? entry.value : null;

      const name = getItemName(entry.type, after ?? before);

      return {
        id: `${change}-${index}`,
        type: entry.type,
        element: ELEMENT_LABELS[entry.type] || "Elemento",
        name,
        change,
        before: getItemDescription(entry.type, before),
        after: getItemDescription(entry.type, after),
      };
    });
  });
}

function ReviewMetric({ label, value }) {
  return (
    <Box sx={{
      p: 1.75, minWidth: 0, height: "100%",
      border: "1px solid", borderColor: "divider",
      borderRadius: 1, bgcolor: "background.default",
    }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
        {label}
      </Typography>

      <Typography sx={{
        mt: 0.65, fontSize: 19, fontWeight: 800,
        color: "text.primary", overflowWrap: "anywhere",
      }}>
        {value}
      </Typography>
    </Box>
  );
}

function DifferenceCard({ item }) {
  const change = CHANGE_TYPES[item.change];

  return (
    <Paper sx={{
      p: 2, height: "100%", minHeight: 235,
      border: "1px solid", borderColor: "divider",
      borderRadius: 1, boxShadow: "none",
      display: "flex", flexDirection: "column",
    }}>
      <Stack spacing={1.5} sx={{ flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 800 }}>
              {item.element}
            </Typography>

            <Typography sx={{
              mt: 0.35, fontSize: 15, fontWeight: 800,
              color: "text.primary", overflowWrap: "anywhere",
            }}>
              {item.name}
            </Typography>
          </Box>

          <Chip
            size="small"
            label={change.label}
            color={change.color}
            sx={{ fontWeight: 800, flexShrink: 0 }}
          />
        </Stack>

        {item.change !== "added" ? (
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
              Configuración anterior
            </Typography>

            <Typography sx={{
              mt: 0.35, fontSize: 13,
              color: "text.primary", lineHeight: 1.55, overflowWrap: "anywhere",
            }}>
              {item.before}
            </Typography>
          </Box>
        ) : null}

        {item.change !== "removed" ? (
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
              {item.change === "unchanged" ? "Configuración conservada" : "Nueva configuración"}
            </Typography>

            <Typography sx={{
              mt: 0.35, fontSize: 13,
              color: "text.primary", lineHeight: 1.55, overflowWrap: "anywhere",
            }}>
              {item.after}
            </Typography>
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}

function InvalidReview({ review }) {
  const issues = Array.isArray(review.issues) ? review.issues : [];
  const isConflict = review.type === "conflict";

  return (
    <Paper sx={panelSx}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box sx={{
            width: 44, height: 44, borderRadius: 1,
            display: "grid", placeItems: "center", flexShrink: 0,
            bgcolor: "action.hover",
            color: isConflict ? "warning.main" : "error.main",
          }}>
            {isConflict
              ? <WarningAmberOutlinedIcon />
              : <ErrorOutlineOutlinedIcon />}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              {review.title || "No se pudo validar el archivo"}
            </Typography>

            <Typography sx={{
              mt: 0.5, fontSize: 13,
              color: "text.secondary", lineHeight: 1.55,
            }}>
              {isConflict
                ? "La programación propuesta requiere una corrección antes de continuar."
                : "El archivo no cumple todas las condiciones necesarias para preparar su publicación."}
            </Typography>
          </Box>
        </Stack>

        {review.filename ? (
          <Typography sx={{ fontSize: 13, color: "text.secondary", overflowWrap: "anywhere" }}>
            Archivo revisado: {review.filename}
          </Typography>
        ) : null}

        <Box sx={{
          p: 1.75, border: "1px solid",
          borderColor: "divider", borderRadius: 1,
          bgcolor: "background.default",
        }}>
          <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 800, color: "text.primary" }}>
            Resultados de validación
          </Typography>

          <Stack spacing={1.25}>
            {issues.map((issue, index) => (
              <Stack key={`${index}-${issue}`} direction="row" spacing={1} alignItems="flex-start">
                <ErrorOutlineOutlinedIcon
                  sx={{ fontSize: 18, color: isConflict ? "warning.main" : "error.main", flexShrink: 0 }}
                />

                <Typography sx={{
                  fontSize: 13, color: "text.primary",
                  lineHeight: 1.55, overflowWrap: "anywhere",
                }}>
                  {issue}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
          Corrige la información correspondiente y selecciona nuevamente el archivo para revisarlo.
          No se ha publicado ninguna modificación.
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function MenuSetImportPreview({
  review,
  timezone = "America/Mexico_City",
}) {
  const [filter, setFilter] = useState("changes");
  const [now, setNow] = useState(() => Date.now());

  const data = review?.type === "ready" ? review.data : null;

  useEffect(() => {
    setFilter("changes");
    setNow(Date.now());
  }, [review?.type, data?.import_id]);

  useEffect(() => {
    if (!data?.preview_expires_at) return undefined;

    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, [data?.preview_expires_at]);

  const differences = useMemo(() => {
    return buildDifferenceRows(data?.diff);
  }, [data?.diff]);

  const counts = useMemo(() => ({
    added: differences.filter((item) => item.change === "added").length,
    removed: differences.filter((item) => item.change === "removed").length,
    modified: differences.filter((item) => item.change === "modified").length,
    unchanged: differences.filter((item) => item.change === "unchanged").length,
  }), [differences]);

  const filteredDifferences = useMemo(() => {
    if (filter === "all") return differences;
    if (filter === "changes") {
      return differences.filter((item) => item.change !== "unchanged");
    }

    return differences.filter((item) => item.change === filter);
  }, [differences, filter]);

  const pagination = usePagination({
    items: filteredDifferences,
    pageSize: 5,
    resetKey: `${data?.import_id || "sin-revision"}|${filter}`,
  });

  if (!review) return null;

  if (review.type !== "ready" || !data) {
    return <InvalidReview review={review} />;
  }

  const warnings = Array.isArray(data.warnings) ? data.warnings : [];
  const errors = Array.isArray(data.errors) ? data.errors : [];

  const expiration = data.preview_expires_at
    ? new Date(data.preview_expires_at).getTime()
    : NaN;

  const expired = Number.isFinite(expiration) && now >= expiration;
  const publishAllowed = data.publish_allowed === true && !expired;

  const baseRevision = data.base_revision === null || data.base_revision === undefined
    ? "Primera publicación"
    : `Revisión ${data.base_revision}`;

  return (
    <Stack spacing={3}>
      {/* Resultado general */}
      <Paper sx={panelSx}>
        <Stack spacing={2.25}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box sx={{
                width: 44, height: 44, borderRadius: 1,
                display: "grid", placeItems: "center", flexShrink: 0,
                bgcolor: "rgba(214, 122, 58, 0.12)",
                color: "secondary.main",
              }}>
                {publishAllowed
                  ? <FactCheckOutlinedIcon />
                  : <AccessTimeOutlinedIcon />}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
                  Resultado de la vista previa
                </Typography>

                <Typography sx={{
                  mt: 0.4, fontSize: 13,
                  color: "text.secondary", lineHeight: 1.55,
                }}>
                  {expired
                    ? "El tiempo de esta revisión terminó. Debes revisar nuevamente el archivo antes de publicarlo."
                    : "El archivo fue validado. Consulta los cambios y las advertencias antes de publicarlo."}
                </Typography>
              </Box>
            </Stack>

            <Chip
              size="small"
              color={publishAllowed ? "success" : "warning"}
              label={publishAllowed ? "Lista para publicar" : "Vista previa vencida"}
              sx={{ fontWeight: 800 }}
            />
          </Stack>

          {/* Archivo y revisión */}
          <Box sx={{
            p: 1.75, borderRadius: 1,
            border: "1px solid", borderColor: "divider",
            bgcolor: "background.default",
          }}>
            <Stack spacing={1}>
              <Typography sx={{
                fontSize: 14, fontWeight: 800,
                color: "text.primary", overflowWrap: "anywhere",
              }}>
                {review.filename || "Archivo revisado"}
              </Typography>

              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Modalidad de capacidad:{" "}
                <Box component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
                  {CAPACITY_LABELS[data.capacity_mode] || "No informada"}
                </Box>
              </Typography>
            </Stack>
          </Box>

          {/* Indicadores */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },
            gridAutoRows: "1fr",
            gap: 1.5,
          }}>
            <ReviewMetric label="Filas revisadas" value={data.rows_processed ?? 0} />
            <ReviewMetric label="Filas válidas" value={data.rows_valid ?? 0} />
            <ReviewMetric label="Errores" value={errors.length} />
            <ReviewMetric label="Advertencias" value={warnings.length} />
          </Box>

          {/* Revisión y vencimiento */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
                Revisión base
              </Typography>

              <Typography sx={{ mt: 0.45, fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                {baseRevision}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
                Vigencia de la vista previa
              </Typography>

              <Typography sx={{ mt: 0.45, fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                {formatDateTime(data.preview_expires_at, timezone)}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {/* Advertencias del servidor */}
      {warnings.length > 0 ? (
        <Paper sx={panelSx}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <WarningAmberOutlinedIcon sx={{ color: "warning.main" }} />

              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                Advertencias
              </Typography>
            </Stack>

            {warnings.map((warning, index) => (
              <Box key={`${index}-${warning}`} sx={{
                p: 1.5, border: "1px solid", borderColor: "divider",
                borderRadius: 1, bgcolor: "background.default",
              }}>
                <Typography sx={{
                  fontSize: 13, color: "text.primary",
                  lineHeight: 1.55, overflowWrap: "anywhere",
                }}>
                  {warning}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      ) : null}

      {/* Diferencias entre configuraciones */}
      <Paper sx={{
        p: 0, borderRadius: 1, border: "1px solid",
        borderColor: "divider", bgcolor: "background.paper",
        boxShadow: "none", overflow: "hidden",
      }}>
        <Box sx={{
          px: { xs: 2, sm: 2.5 }, py: 2,
          borderBottom: "1px solid", borderColor: "divider",
        }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <DifferenceOutlinedIcon sx={{ color: "primary.main" }} />

              <Box>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                  Comparación de la programación
                </Typography>

                <Typography sx={{ mt: 0.35, fontSize: 13, color: "text.secondary" }}>
                  Diferencias respecto a la configuración aplicable al periodo seleccionado.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip size="small" label={`${counts.added} agregados`} color="success" variant="outlined" />
              <Chip size="small" label={`${counts.removed} retirados`} color="error" variant="outlined" />
              <Chip size="small" label={`${counts.modified} modificados`} color="warning" variant="outlined" />
              <Chip size="small" label={`${counts.unchanged} sin cambios`} variant="outlined" />
            </Stack>

            <TextField
              select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              sx={{ width: { xs: "100%", sm: 230 } }}
              inputProps={{ "aria-label": "Filtrar diferencias" }}
            >
              <MenuItem value="changes">Solo cambios</MenuItem>
              <MenuItem value="all">Todos los resultados</MenuItem>
              <MenuItem value="added">Agregados</MenuItem>
              <MenuItem value="removed">Retirados</MenuItem>
              <MenuItem value="modified">Modificados</MenuItem>
              <MenuItem value="unchanged">Sin cambios</MenuItem>
            </TextField>
          </Stack>
        </Box>

        {filteredDifferences.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>
              {counts.added + counts.removed + counts.modified === 0
                ? "No se detectaron cambios"
                : "No hay resultados para este filtro"}
            </Typography>

            <Typography sx={{ mt: 0.65, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
              {counts.added + counts.removed + counts.modified === 0
                ? "La programación propuesta conserva los mismos valores que la configuración aplicada."
                : "Selecciona otro filtro para consultar los resultados de la comparación."}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Tabla en computadoras */}
            <TableContainer sx={{
              display: { xs: "none", md: "block" },
              width: "100%", overflowX: "auto",
            }}>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow sx={{
                    "& th": {
                      bgcolor: "primary.main", color: "#fff",
                      fontWeight: 800, fontSize: 13,
                      borderBottom: "none", whiteSpace: "nowrap",
                    },
                  }}>
                    <TableCell>Elemento</TableCell>
                    <TableCell>Resultado</TableCell>
                    <TableCell>Configuración anterior</TableCell>
                    <TableCell>Nueva configuración</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pagination.paginatedItems.map((item) => (
                    <TableRow key={item.id} hover sx={{
                      "& td": {
                        fontSize: 13, verticalAlign: "top",
                        borderColor: "divider", color: "text.primary",
                      },
                    }}>
                      <TableCell sx={{ width: "22%" }}>
                        <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 800 }}>
                          {item.element}
                        </Typography>

                        <Typography sx={{
                          mt: 0.35, fontSize: 14,
                          fontWeight: 800, overflowWrap: "anywhere",
                        }}>
                          {item.name}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ width: "15%" }}>
                        <Chip
                          size="small"
                          color={CHANGE_TYPES[item.change].color}
                          label={CHANGE_TYPES[item.change].label}
                          sx={{ fontWeight: 800 }}
                        />
                      </TableCell>

                      <TableCell sx={{ width: "31.5%", lineHeight: 1.55, overflowWrap: "anywhere" }}>
                        {item.before}
                      </TableCell>

                      <TableCell sx={{ width: "31.5%", lineHeight: 1.55, overflowWrap: "anywhere" }}>
                        {item.after}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Tarjetas en teléfonos y tabletas */}
            <Box sx={{
              display: { xs: "grid", md: "none" },
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gridAutoRows: "1fr",
              gap: 2, p: 2,
            }}>
              {pagination.paginatedItems.map((item) => (
                <DifferenceCard key={item.id} item={item} />
              ))}
            </Box>

            {/* Paginación de cinco registros */}
            <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
              <PaginationFooter
                page={pagination.page}
                totalPages={pagination.totalPages}
                startItem={pagination.startItem}
                endItem={pagination.endItem}
                total={pagination.total}
                hasPrev={pagination.hasPrev}
                hasNext={pagination.hasNext}
                onPrev={pagination.prevPage}
                onNext={pagination.nextPage}
                itemLabel="resultados"
              />
            </Box>
          </>
        )}
      </Paper>

      <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
        Esta revisión es únicamente informativa. La programación vigente no cambiará hasta
        que confirmes su publicación en el paso correspondiente.
      </Typography>
    </Stack>
  );
}