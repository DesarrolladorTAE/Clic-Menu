//src/components/menu/menuSets/dashboard/OwnerDashboardImportUpdates.jsx
import { useEffect, useState } from "react";
import {
  Box, Button, Chip, CircularProgress, LinearProgress, MenuItem, Paper,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography,
} from "@mui/material";

import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";

import PaginationFooter from "../../../common/PaginationFooter";
import { getOwnerImportUpdatesDashboard } from "../../../../services/menu/menuSets/dashboard/ownerImportUpdatesDashboard.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 }, border: "1px solid",
  borderColor: "divider", borderRadius: 1,
  bgcolor: "background.paper", boxShadow: "none",
};

const statuses = {
  updated: { label: "Actualizado", color: "success" },
  pending: { label: "Pendiente", color: "warning" },
  overdue: { label: "Vencido", color: "error" },
  configuration_unavailable: { label: "Configuración no disponible", color: "default" },
};

const summaryFields = [
  ["total_menu_sets", "Conjuntos evaluados"],
  ["updated_menu_sets", "Actualizados"],
  ["pending_menu_sets", "Pendientes"],
  ["overdue_menu_sets", "Vencidos"],
  ["updates_due", "Actualización requerida"],
  ["inherited_publications", "Programación heredada"],
  ["configuration_unavailable_menu_sets", "Configuración no disponible"],
];

const weekdays = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function getErrorMessage(error) {
  const data = error?.response?.data;
  const errors = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat() : [];

  return errors.find((value) => typeof value === "string")
    || data?.message || error?.message
    || "No fue posible consultar las actualizaciones comerciales.";
}

function formatNumber(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("es-MX").format(Number(value) || 0);
}

function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(value || ""))) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—"
    : new Intl.DateTimeFormat("es-MX", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(date);
}

function capacityLabel(value) {
  return {
    none: "Sin límite", daily: "Diaria", weekly: "Semanal",
  }[value] || "No informada";
}

function sourceLabel(value) {
  return {
    manual: "Configuración manual",
    manual_fallback: "Configuración manual provisional",
    publication: "Programación publicada",
  }[value] || "Configuración no disponible";
}

function StatusChips({ row }) {
  const status = statuses[row.import_status] || statuses.configuration_unavailable;

  return (
    <Stack direction="row" flexWrap="wrap" gap={0.6}>
      <Chip size="small" label={status.label} color={status.color} />
      {row.is_inherited === true ? (
        <Chip size="small" label="Heredado" color="info" variant="outlined" />
      ) : null}
      {row.is_update_due === true && row.is_update_overdue !== true ? (
        <Chip size="small" label="Actualización requerida" color="warning" variant="outlined" />
      ) : null}
    </Stack>
  );
}

function MetricCard({ label, value }) {
  return (
    <Box sx={{
      minHeight: 108, height: "100%", p: 1.75,
      border: "1px solid", borderColor: "divider", borderRadius: 1,
      bgcolor: "background.default", display: "flex",
      flexDirection: "column", justifyContent: "space-between", gap: 1,
    }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
        {formatNumber(value)}
      </Typography>
    </Box>
  );
}

function InformationField({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ mt: 0.35, fontSize: 13, fontWeight: 700, overflowWrap: "anywhere" }}>
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

function ImportDetail({ row, timezone, onClose }) {
  const latest = row.last_publication;

  const fields = [
    ["Periodo por actualizar", row.target_week_start && row.target_week_end
      ? `${formatDate(row.target_week_start)} al ${formatDate(row.target_week_end)}` : "—"],
    ["Día de actualización", weekdays[Number(row.import_update_day)] || "No configurado"],
    ["Fecha de actualización", formatDate(row.update_date)],
    ["Hora límite", row.import_deadline_time?.slice(0, 5) || "No configurada"],
    ["Inicio de la ventana", formatDateTime(row.window_starts_at)],
    ["Fin de la ventana", formatDateTime(row.window_ends_at)],
    ["Vencimiento", formatDateTime(row.deadline_at)],
    ["Configuración aplicable", sourceLabel(row.configuration_source)],
    ["Capacidad aplicable", capacityLabel(row.effective_capacity_mode)],
    ["Capacidad de próxima importación", capacityLabel(row.next_import_capacity_mode)],
    ["Revisión efectiva", row.effective_revision ?? "Sin publicación"],
    ["Última publicación", latest ? formatDateTime(latest.published_at) : "Sin publicaciones"],
    ["Periodo de última publicación", latest?.target_week_start && latest?.target_week_end
      ? `${formatDate(latest.target_week_start)} al ${formatDate(latest.target_week_end)}` : "—"],
    ["Revisión de última publicación", latest?.revision ?? "—"],
  ];

  return (
    <Paper sx={panelSx}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>{row.name}</Typography>
            <Typography sx={{ mt: 0.4, fontSize: 12.5, color: "text.secondary" }}>
              Seguimiento de actualización · {timezone || "Zona horaria de la sucursal"}
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<ExpandLessOutlinedIcon />} onClick={onClose}>
            Cerrar detalle
          </Button>
        </Stack>

        <StatusChips row={row} />

        {row.reason ? (
          <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>
            {row.reason}
          </Typography>
        ) : null}

        <Box sx={{
          display: "grid", gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          }, gap: 1.5,
        }}>
          {fields.map(([label, value]) => (
            <Box key={label} sx={{
              minHeight: 80, height: "100%", p: 1.5,
              border: "1px solid", borderColor: "divider",
              borderRadius: 1, bgcolor: "background.default",
            }}>
              <InformationField label={label} value={value} />
            </Box>
          ))}
        </Box>
      </Stack>
    </Paper>
  );
}

export default function OwnerDashboardImportUpdates({
  restaurantId, branchId, serviceDate, onAlert,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [result, setResult] = useState(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [loading, setLoading] = useState(true);

  const requestKey = [restaurantId, branchId, serviceDate, statusFilter, page].join("|");

  useEffect(() => {
    setStatusFilter("all");
    setPage(1);
    setSelectedId(null);
    setResult(null);
    setLoadedKey("");
  }, [restaurantId, branchId]);

  useEffect(() => {
    if (!restaurantId || !branchId || !serviceDate) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    setLoading(true);

    getOwnerImportUpdatesDashboard(restaurantId, branchId, {
      service_date: serviceDate, import_status: statusFilter, page,
    }, controller.signal)
      .then((response) => {
        if (!active) return;

        const lastPage = Math.max(1, Number(response.pagination.last_page) || 1);

        if (page > lastPage) {
          setPage(lastPage);
          return;
        }

        setResult(response);
        setLoadedKey(requestKey);
      })
      .catch((error) => {
        if (!active || controller.signal.aborted) return;
        setResult(null);
        setLoadedKey("");
        onAlert?.({ message: getErrorMessage(error) });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [restaurantId, branchId, serviceDate, statusFilter, page, requestKey, onAlert]);

  const data = loadedKey === requestKey
    && String(result?.context?.branch_id || "") === String(branchId)
    && result?.context?.service_date === serviceDate ? result : null;

  const rows = data?.rows || [];
  const selected = rows.find((row) => String(row.id) === String(selectedId)) || null;
  const pagination = data?.pagination;

  const handleFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
    setSelectedId(null);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    setSelectedId(null);
  };

  return (
    <Stack spacing={2.5}>
      <Paper sx={panelSx}>
        <Stack spacing={1.75}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Actualizaciones comerciales</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
              Seguimiento del siguiente periodo comercial de los Conjuntos administrados mediante archivos.
            </Typography>
          </Box>

          <TextField select fullWidth size="small" label="Estado de actualización"
            value={statusFilter} onChange={(event) => handleFilterChange(event.target.value)}
            sx={{ maxWidth: { sm: 360 } }}>
            <MenuItem value="all">Todos los estados</MenuItem>
            <MenuItem value="updated">Actualizados</MenuItem>
            <MenuItem value="pending">Pendientes, incluidos los vencidos</MenuItem>
            <MenuItem value="overdue">Vencidos</MenuItem>
            <MenuItem value="due">Actualización requerida</MenuItem>
            <MenuItem value="inherited">Con programación heredada</MenuItem>
            <MenuItem value="configuration_unavailable">Configuración no disponible</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {loading && data ? <LinearProgress sx={{ height: 3, borderRadius: 1 }} /> : null}

      {!data && loading ? (
        <Paper sx={{ ...panelSx, minHeight: 230, display: "grid", placeItems: "center" }}>
          <Stack alignItems="center" spacing={1.5}>
            <CircularProgress size={28} />
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Consultando actualizaciones…
            </Typography>
          </Stack>
        </Paper>
      ) : data ? (
        <>
          <Paper sx={panelSx}>
            <Stack spacing={1.5}>
              <Typography sx={{ fontSize: 17, fontWeight: 800 }}>Resumen comercial</Typography>
              <Box sx={{
                display: "grid", gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                }, gridAutoRows: "1fr", gap: 1.5,
              }}>
                {summaryFields.map(([key, label]) => (
                  <MetricCard key={key} label={label} value={data.summary[key]} />
                ))}
              </Box>
            </Stack>
          </Paper>

          <Paper sx={panelSx}>
            <Stack spacing={1.5}>
              <Box>
                <Typography sx={{ fontSize: 17, fontWeight: 800 }}>Seguimiento por Conjunto</Typography>
                <Typography sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}>
                  La programación heredada puede seguir disponible mientras la actualización del nuevo periodo está pendiente.
                </Typography>
              </Box>

              {rows.length === 0 ? (
                <Typography sx={{ py: 3, fontSize: 13, color: "text.secondary" }}>
                  No hay Conjuntos con el estado seleccionado.
                </Typography>
              ) : (
                <>
                  <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
                    <Table size="small" sx={{ minWidth: 850 }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "action.hover" }}>
                          {["Conjunto", "Estado", "Periodo por actualizar", "Fecha límite", "Última publicación", "Detalle"].map((label) => (
                            <TableCell key={label} sx={{ fontSize: 12, fontWeight: 800 }}>
                              {label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow hover key={row.id}>
                            <TableCell>
                              <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{row.name}</Typography>
                              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                                {row.is_active ? "Activo" : "Inactivo"}
                              </Typography>
                            </TableCell>
                            <TableCell><StatusChips row={row} /></TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              {formatDate(row.target_week_start)} al {formatDate(row.target_week_end)}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>{formatDateTime(row.deadline_at)}</TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              {row.last_publication
                                ? formatDate(row.last_publication.target_week_start)
                                : "Sin publicaciones"}
                            </TableCell>
                            <TableCell>
                              <Button size="small" variant="outlined"
                                onClick={() => setSelectedId((current) =>
                                  String(current) === String(row.id) ? null : row.id)}
                                endIcon={String(selectedId) === String(row.id)
                                  ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}>
                                {String(selectedId) === String(row.id) ? "Cerrar" : "Ver detalle"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{
                    display: { xs: "grid", md: "none" },
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                    alignItems: "stretch", gap: 1.5,
                  }}>
                    {rows.map((row) => (
                      <Box key={row.id} sx={{
                        p: 1.75, minHeight: 228, height: "100%",
                        border: "1px solid", borderColor: "divider",
                        borderRadius: 1, bgcolor: "background.default",
                      }}>
                        <Stack spacing={1.15} sx={{ height: "100%" }}>
                          <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{row.name}</Typography>
                            <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                              {row.is_active ? "Activo" : "Inactivo"}
                            </Typography>
                          </Box>
                          <StatusChips row={row} />
                          <Typography sx={{ fontSize: 12 }}>
                            Periodo: {formatDate(row.target_week_start)} al {formatDate(row.target_week_end)}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                            Fecha límite: {formatDateTime(row.deadline_at)}
                          </Typography>
                          <Box sx={{ mt: "auto !important" }}>
                            <Button fullWidth variant="outlined"
                              onClick={() => setSelectedId((current) =>
                                String(current) === String(row.id) ? null : row.id)}
                              endIcon={String(selectedId) === String(row.id)
                                ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}>
                              {String(selectedId) === String(row.id) ? "Cerrar" : "Ver detalle"}
                            </Button>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              {pagination && Number(pagination.total) > 0 ? (
                <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
                  <PaginationFooter
                    page={pagination.current_page}
                    totalPages={pagination.last_page}
                    startItem={pagination.from || 0}
                    endItem={pagination.to || 0}
                    total={pagination.total}
                    hasPrev={pagination.current_page > 1}
                    hasNext={pagination.current_page < pagination.last_page}
                    onPrev={() => handlePageChange(Math.max(1, page - 1))}
                    onNext={() => handlePageChange(Math.min(pagination.last_page, page + 1))}
                    itemLabel="conjuntos"
                  />
                </Box>
              ) : null}
            </Stack>
          </Paper>

          {selected ? (
            <ImportDetail key={selected.id} row={selected}
              timezone={data.context.timezone} onClose={() => setSelectedId(null)} />
          ) : null}
        </>
      ) : (
        <Paper sx={{ ...panelSx, py: 4, textAlign: "center" }}>
          <UpdateOutlinedIcon sx={{ fontSize: 40, color: "text.disabled" }} />
          <Typography sx={{ mt: 1, fontSize: 13, color: "text.secondary" }}>
            No hay información de actualizaciones para mostrar.
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}